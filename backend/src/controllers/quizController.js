const { query, withTransaction } = require('../db/pool');
const { evaluateContest } = require('../utils/resultsEngine');
const { finalDecision } = require('../utils/proctoringEngine');
const { triggerAutoBackup } = require('../utils/autoBackup');
const { notifyQuizSubmission } = require('../utils/webhookSync');

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

    // ── Time-window enforcement ────────────────────────────────────────────────
    const now = Date.now();
    if (contest.starts_at && now < new Date(contest.starts_at).getTime()) {
      const startsIn = new Date(contest.starts_at).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
      return res.status(403).json({
        error: `Quiz access is not open yet. It will be available from ${startsIn} (IST).`,
        startsAt: contest.starts_at,
      });
    }
    if (contest.ends_at && now > new Date(contest.ends_at).getTime()) {
      return res.status(403).json({
        error: 'The quiz time window has expired. Results will be published shortly.',
        endsAt: contest.ends_at,
      });
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
      quiz: {
        id: quiz.id,
        title: quiz.title,
        instructions: quiz.instructions,
        duration_minutes: quiz.duration_minutes,
        proctoringEnabled: !!quiz.proctoring_enabled && process.env.PROCTORING_ENABLED !== 'false',
      },
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
      const quizRow = (
        await client.query(`SELECT passing_marks FROM quizzes WHERE id = $1`, [attempt.quiz_id])
      ).rows[0];

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

      // Human-readable explanation of the result — previously the student
      // only ever saw raw numbers with no explanation of *why* they scored
      // what they did, especially when they failed to pass or scored low.
      const totalQuestions = questions.length;
      const skippedCount = Math.max(0, totalQuestions - correctCount - wrongCount);
      const passingMarks = quizRow?.passing_marks || 0;
      const passed = passingMarks > 0 ? totalScore >= passingMarks : totalScore > 0;
      let remarks;
      if (passed) {
        remarks = `Nice work — you scored ${totalScore} with ${correctCount}/${totalQuestions} correct.`;
      } else {
        const reasons = [];
        if (wrongCount > 0) reasons.push(`${wrongCount} answer${wrongCount === 1 ? '' : 's'} were incorrect (negative marking applied)`);
        if (skippedCount > 0) reasons.push(`${skippedCount} question${skippedCount === 1 ? '' : 's'} were left unanswered`);
        if (correctCount === 0) reasons.push('none of your answers were correct');
        remarks = reasons.length
          ? `You scored ${totalScore}${passingMarks ? ` (needed ${passingMarks} to pass)` : ''} — ${reasons.join(' and ')}. Review the topic and try another contest to improve your rank!`
          : `You scored ${totalScore}. Try another contest to improve your rank!`;
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

      // Finalize the AI Quiz Proctor session for this attempt, if one exists.
      // Reads back every event this session logged and applies the same
      // evidence-based decision engine used for live warnings.
      let proctoring = null;
      const sessionRes = await client.query(
        `SELECT * FROM proctoring_sessions WHERE attempt_id = $1`,
        [attempt.id]
      );
      if (sessionRes.rows[0]) {
        const session = sessionRes.rows[0];
        const severityCounts = {
          low: session.low_count,
          medium: session.medium_count,
          high: session.high_count,
          critical: session.critical_count,
        };
        const distinctRes = await client.query(
          `SELECT COUNT(DISTINCT event_type) AS c FROM proctoring_events WHERE session_id = $1`,
          [session.id]
        );
        const decision = finalDecision({
          riskScore: session.risk_score,
          severityCounts,
          distinctEventTypesTriggered: distinctRes.rows[0].c,
        });
        const updatedSession = await client.query(
          `UPDATE proctoring_sessions SET
             status = 'completed', ended_at = now(),
             final_status = $1, final_reason = $2
           WHERE id = $3 RETURNING *`,
          [decision.finalStatus, decision.reason, session.id]
        );
        proctoring = {
          riskScore: updatedSession.rows[0].risk_score,
          finalStatus: updatedSession.rows[0].final_status,
          reason: updatedSession.rows[0].final_reason,
        };
      }

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

      return {
        score: totalScore,
        correctCount,
        wrongCount,
        skippedCount,
        passed,
        remarks,
        timeTakenSeconds,
        evaluated: !!evaluated,
        proctoring,
      };
    });

    // Trigger automatic Excel update & live sync
    triggerAutoBackup('Quiz Attempt Submitted');

    // Async webhook notification to live Excel / Google Sheet
    (async () => {
      try {
        const userRow = (await query(`SELECT u.username, u.email, p.full_name, p.college FROM users u LEFT JOIN profiles p ON p.user_id = u.id WHERE u.id = $1`, [req.user.id])).rows[0];
        const contestRow = (await query(`SELECT c.name, q.title FROM contests c LEFT JOIN quizzes q ON q.id = c.quiz_id WHERE c.id = $1`, [contestId])).rows[0];

        notifyQuizSubmission({
          studentName: userRow?.full_name || userRow?.username || 'Student',
          email: userRow?.email || '',
          college: userRow?.college || '',
          contestName: contestRow?.name || 'Contest',
          quizTitle: contestRow?.title || 'Quiz',
          score: result.score,
          correctCount: result.correctCount,
          wrongCount: result.wrongCount,
          passed: result.passed,
          timeTakenSeconds: result.timeTakenSeconds,
          submittedAt: new Date().toISOString(),
        });
      } catch (syncErr) {
        console.warn('[WebhookSync] Non-blocking sync error:', syncErr.message);
      }
    })();

    res.json({ message: 'Quiz submitted.', ...result });
  } catch (err) {
    next(err);
  }
}

module.exports = { getQuizForAttempt, submitAttempt };
