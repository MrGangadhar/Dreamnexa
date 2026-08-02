const { query, withTransaction } = require('../db/pool');
const { evaluateContest } = require('../utils/resultsEngine');

// Fetch quiz questions WITHOUT correct answers (for taking the quiz)
async function getQuizForAttempt(req, res, next) {
  try {
    const { contestId } = req.params;

    const contest = (
      await query(`SELECT * FROM contests WHERE id = $1`, [contestId])
    ).rows[0];
    if (!contest) return res.status(404).json({ error: 'Contest not found.' });
    if (!['live', 'locked'].includes(contest.status)) {
      return res.status(400).json({ error: 'This contest is not currently live.' });
    }

    const participant = (
      await query(
        `SELECT * FROM contest_participants WHERE contest_id = $1 AND user_id = $2`,
        [contestId, req.user.id]
      )
    ).rows[0];
    if (!participant) return res.status(403).json({ error: 'You have not joined this contest.' });

    const quiz = (await query(`SELECT * FROM quizzes WHERE id = $1`, [contest.quiz_id])).rows[0];
    const questions = await query(
      `SELECT id, question_text, question_type, options, marks, negative_marks, order_index
       FROM questions WHERE quiz_id = $1 ORDER BY order_index ASC`,
      [contest.quiz_id]
    );

    // Ensure an attempt row exists (idempotent start)
    await query(
      `INSERT INTO quiz_attempts (contest_id, user_id, quiz_id)
       VALUES ($1, $2, $3) ON CONFLICT (contest_id, user_id) DO NOTHING`,
      [contestId, req.user.id, contest.quiz_id]
    );

    res.json({
      quiz: { id: quiz.id, title: quiz.title, instructions: quiz.instructions, duration_minutes: quiz.duration_minutes },
      questions: questions.rows,
      contestEndsAt: contest.ends_at,
    });
  } catch (err) {
    next(err);
  }
}

// Submit final answers, auto-score, and trigger evaluation once everyone's
// done (or the contest window has elapsed).
async function submitAttempt(req, res, next) {
  try {
    const { contestId } = req.params;
    const { answers, autoSubmitted = false } = req.body; // [{questionId, selectedOptions:[...]}]

    const result = await withTransaction(async (client) => {
      const attempt = (
        await client.query(
          `SELECT * FROM quiz_attempts WHERE contest_id = $1 AND user_id = $2 FOR UPDATE`,
          [contestId, req.user.id]
        )
      ).rows[0];
      if (!attempt) throw Object.assign(new Error('Attempt not found'), { status: 404 });
      if (attempt.submitted_at) throw Object.assign(new Error('Already submitted'), { status: 409, publicMessage: 'You have already submitted this quiz.' });

      const questions = (
        await client.query(`SELECT * FROM questions WHERE quiz_id = $1`, [attempt.quiz_id])
      ).rows;
      const questionMap = new Map(questions.map((q) => [q.id, q]));

      let totalScore = 0;
      let correctCount = 0;
      let wrongCount = 0;

      for (const ans of answers || []) {
        const q = questionMap.get(ans.questionId);
        if (!q) continue;

        const correctSet = new Set(q.correct_options);
        const selectedSet = new Set(ans.selectedOptions || []);
        const isCorrect =
          correctSet.size === selectedSet.size &&
          [...correctSet].every((o) => selectedSet.has(o));

        const marksObtained = isCorrect ? q.marks : selectedSet.size > 0 ? -q.negative_marks : 0;
        totalScore += marksObtained;
        if (isCorrect) correctCount += 1;
        else if (selectedSet.size > 0) wrongCount += 1;

        await client.query(
          `INSERT INTO quiz_answers (attempt_id, question_id, selected_options, is_correct, marks_obtained)
           VALUES ($1,$2,$3,$4,$5)
           ON CONFLICT (attempt_id, question_id)
           DO UPDATE SET selected_options = $3, is_correct = $4, marks_obtained = $5`,
          [attempt.id, q.id, JSON.stringify(ans.selectedOptions || []), isCorrect, marksObtained]
        );
      }

      const timeTakenSeconds = Math.max(
        0,
        Math.round((Date.now() - new Date(attempt.started_at).getTime()) / 1000)
      );

      await client.query(
        `UPDATE quiz_attempts SET submitted_at = now(), auto_submitted = $1, score = $2 WHERE id = $3`,
        [autoSubmitted, totalScore, attempt.id]
      );

      await client.query(
        `UPDATE contest_participants
         SET score = $1, correct_count = $2, wrong_count = $3, time_taken_seconds = $4
         WHERE contest_id = $5 AND user_id = $6`,
        [totalScore, correctCount, wrongCount, timeTakenSeconds, contestId, req.user.id]
      );

      // If every participant has submitted, evaluate + distribute rewards now
      const pendingCount = (
        await client.query(
          `SELECT COUNT(*)::int AS pending FROM contest_participants cp
           LEFT JOIN quiz_attempts qa ON qa.contest_id = cp.contest_id AND qa.user_id = cp.user_id
           WHERE cp.contest_id = $1 AND (qa.submitted_at IS NULL)`,
          [contestId]
        )
      ).rows[0].pending;

      let evaluated = null;
      if (pendingCount === 0) {
        evaluated = await evaluateContest(client, contestId);
      }

      return { score: totalScore, correctCount, wrongCount, evaluated: !!evaluated };
    });

    res.json({ message: 'Quiz submitted.', ...result });
  } catch (err) {
    next(err);
  }
}

module.exports = { getQuizForAttempt, submitAttempt };
