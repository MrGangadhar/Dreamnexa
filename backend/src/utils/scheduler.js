const cron = require('node-cron');
const { pool, withTransaction } = require('../db/pool');
const { evaluateContest } = require('./resultsEngine');

/**
 * Every minute:
 *  1. Auto-submit any quiz_attempts that are past the contest's ends_at
 *     and haven't been submitted yet (scores whatever was answered).
 *  2. Evaluate any 'live' contests whose ends_at has passed and every
 *     attempt is now submitted, distributing points/badges automatically.
 */
function startScheduler() {
  cron.schedule('* * * * *', async () => {
    try {
      await autoSubmitExpiredAttempts();
      await evaluateFinishedContests();
    } catch (err) {
      console.error('Scheduler error:', err.message);
    }
  });
  console.log('⏱  Contest scheduler started (runs every minute).');
}

async function autoSubmitExpiredAttempts() {
  const expired = await pool.query(
    `SELECT qa.id, qa.contest_id, qa.user_id
     FROM quiz_attempts qa
     JOIN contests c ON c.id = qa.contest_id
     WHERE qa.submitted_at IS NULL AND c.ends_at IS NOT NULL AND c.ends_at < now()`
  );

  for (const attempt of expired.rows) {
    await withTransaction(async (client) => {
      const answers = await client.query(
        `SELECT question_id, is_correct, marks_obtained FROM quiz_answers WHERE attempt_id = $1`,
        [attempt.id]
      );
      const score = answers.rows.reduce((sum, a) => sum + Number(a.marks_obtained || 0), 0);
      const correctCount = answers.rows.filter((a) => a.is_correct).length;
      const wrongCount = answers.rows.filter((a) => a.is_correct === false).length;

      await client.query(
        `UPDATE quiz_attempts SET submitted_at = now(), auto_submitted = true, score = $1 WHERE id = $2`,
        [score, attempt.id]
      );
      await client.query(
        `UPDATE contest_participants SET score = $1, correct_count = $2, wrong_count = $3
         WHERE contest_id = $4 AND user_id = $5`,
        [score, correctCount, wrongCount, attempt.contest_id, attempt.user_id]
      );
    });
  }
}

async function evaluateFinishedContests() {
  const ready = await pool.query(
    `SELECT c.id FROM contests c
     WHERE c.status = 'live' AND c.ends_at IS NOT NULL AND c.ends_at < now()
     AND NOT EXISTS (
       SELECT 1 FROM contest_participants cp
       LEFT JOIN quiz_attempts qa ON qa.contest_id = cp.contest_id AND qa.user_id = cp.user_id
       WHERE cp.contest_id = c.id AND qa.submitted_at IS NULL
     )`
  );

  for (const row of ready.rows) {
    await withTransaction((client) => evaluateContest(client, row.id));
  }
}

module.exports = { startScheduler };
