/**
 * Contest Engine
 * ---------------------------------------------------------------------
 * Implements the Dream11-style contest lifecycle, adapted to a free,
 * points-based model:
 *
 *   template (admin-defined) --spawns--> contest #101 (0/6 seats)
 *        user joins (free or points cost) --> 1/6, 2/6 ... 6/6
 *        6/6 reached --> contest LOCKS, quiz becomes playable
 *        the moment it locks, contest #102 (0/6) is auto-created from
 *        the same template, so new users always have a seat to join
 *   template.auto_regenerate = false (admin toggle) stops the chain
 * ---------------------------------------------------------------------
 */

const pointsService = require('./pointsService');

async function spawnContestFromTemplate(client, template, sequenceNumber = 1) {
  const startsAt = new Date(); // starts immediately once full; upcoming until then
  const res = await client.query(
    `INSERT INTO contests
      (template_id, sequence_number, name, quiz_id, entry_points_cost,
       max_participants, reward_structure, status, starts_at)
     VALUES ($1,$2,$3,$4,$5,$6,$7,'upcoming',$8)
     RETURNING *`,
    [
      template.id,
      sequenceNumber,
      `${template.name} #${sequenceNumber}`,
      template.quiz_id,
      template.entry_points_cost,
      template.max_participants,
      JSON.stringify(template.reward_structure),
      startsAt,
    ]
  );
  return res.rows[0];
}

/**
 * Ensure an "open" (upcoming, not-yet-full) contest exists for a given
 * template. Called on template creation and after every lock event.
 */
async function ensureOpenContestExists(client, templateId) {
  const template = (
    await client.query(`SELECT * FROM contest_templates WHERE id = $1`, [templateId])
  ).rows[0];
  if (!template || !template.is_active) return null;

  const openRes = await client.query(
    `SELECT * FROM contests WHERE template_id = $1 AND status = 'upcoming' LIMIT 1`,
    [templateId]
  );
  if (openRes.rows[0]) return openRes.rows[0];

  const lastSeq = await client.query(
    `SELECT COALESCE(MAX(sequence_number), 0) AS max_seq FROM contests WHERE template_id = $1`,
    [templateId]
  );
  const nextSeq = lastSeq.rows[0].max_seq + 1;
  return spawnContestFromTemplate(client, template, nextSeq);
}

/**
 * Join a contest: validates seat availability + duplicate entry,
 * deducts entry_points_cost (free by default), increments seat count,
 * and — if this fills the contest — locks it and spawns the next one.
 */
async function joinContest(client, { contestId, userId }) {
  const contestRes = await client.query(
    `SELECT * FROM contests WHERE id = $1 FOR UPDATE`,
    [contestId]
  );
  const contest = contestRes.rows[0];
  if (!contest) {
    const err = new Error('Contest not found');
    err.status = 404;
    throw err;
  }
  if (contest.status !== 'upcoming') {
    const err = new Error('Contest is not open for joining');
    err.status = 400;
    err.publicMessage = 'This contest is no longer accepting entries.';
    throw err;
  }

  const dupe = await client.query(
    `SELECT 1 FROM contest_participants WHERE contest_id = $1 AND user_id = $2`,
    [contestId, userId]
  );
  if (dupe.rows[0]) {
    const err = new Error('Already joined');
    err.status = 409;
    err.publicMessage = 'You have already joined this contest.';
    throw err;
  }

  if (contest.entry_points_cost > 0) {
    await pointsService.debit(client, {
      userId,
      amount: contest.entry_points_cost,
      type: 'contest_entry',
      referenceId: contest.id,
      description: `Entry into ${contest.name}`,
    });
  }

  await client.query(
    `INSERT INTO contest_participants (contest_id, user_id) VALUES ($1, $2)`,
    [contestId, userId]
  );

  await client.query(
    `UPDATE profiles SET total_contests = total_contests + 1, updated_at = now() WHERE user_id = $1`,
    [userId]
  );

  const updated = await client.query(
    `UPDATE contests SET current_participants = current_participants + 1 WHERE id = $1 RETURNING *`,
    [contestId]
  );
  let finalContest = updated.rows[0];

  if (finalContest.current_participants >= finalContest.max_participants) {
    finalContest = await lockAndRegenerate(client, finalContest);
  }

  return finalContest;
}

/**
 * Lock a full contest, mark it live (ready for quiz play), and — if the
 * template still has auto_regenerate on — spawn the next contest in
 * the sequence so new users always have somewhere to join.
 */
async function lockAndRegenerate(client, contest) {
  // Look up quiz duration separately (avoids referencing the contest row
  // inside its own UPDATE, which isn't valid SQL).
  let durationMinutes = 15;
  if (contest.quiz_id) {
    const quizRes = await client.query(
      `SELECT duration_minutes FROM quizzes WHERE id = $1`,
      [contest.quiz_id]
    );
    if (quizRes.rows[0]) durationMinutes = quizRes.rows[0].duration_minutes;
  }

  const locked = await client.query(
    `UPDATE contests
     SET status = 'live', locked_at = now(), ends_at = now() + ($2 || ' minutes')::interval
     WHERE id = $1 RETURNING *`,
    [contest.id, durationMinutes]
  );

  const lockedContest = locked.rows[0];

  if (contest.template_id) {
    const template = (
      await client.query(`SELECT * FROM contest_templates WHERE id = $1`, [contest.template_id])
    ).rows[0];
    if (template && template.auto_regenerate && template.is_active) {
      await spawnContestFromTemplate(client, template, contest.sequence_number + 1);
    }
  }

  // Notify all participants that the contest is now live
  const participants = await client.query(
    `SELECT user_id FROM contest_participants WHERE contest_id = $1`,
    [contest.id]
  );
  for (const p of participants.rows) {
    await client.query(
      `INSERT INTO notifications (user_id, type, title, message)
       VALUES ($1, 'contest_started', 'Your contest is live!', $2)`,
      [p.user_id, `${contest.name} is full and has started. Good luck!`]
    );
  }

  return { ...lockedContest, status: 'live' };
}

module.exports = { spawnContestFromTemplate, ensureOpenContestExists, joinContest, lockAndRegenerate };
