const { query, withTransaction } = require('../db/pool');
const contestEngine = require('../utils/contestEngine');

async function listContests(req, res, next) {
  try {
    const { status } = req.query;
    const params = [];
    let where = '';
    if (status) {
      params.push(status);
      where = `WHERE c.status = $${params.length}`;
    }
    const result = await query(
      `SELECT c.id, c.name, c.status, c.entry_points_cost, c.max_participants,
              c.current_participants, c.reward_structure, c.starts_at, c.ends_at,
              c.sequence_number, q.title AS quiz_title, q.duration_minutes
       FROM contests c
       LEFT JOIN quizzes q ON q.id = c.quiz_id
       ${where}
       ORDER BY c.created_at DESC
       LIMIT 100`,
      params
    );
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
}

async function getContest(req, res, next) {
  try {
    const contestRes = await query(
      `SELECT c.*, q.title AS quiz_title, q.duration_minutes, q.negative_marking
       FROM contests c LEFT JOIN quizzes q ON q.id = c.quiz_id
       WHERE c.id = $1`,
      [req.params.id]
    );
    const contest = contestRes.rows[0];
    if (!contest) return res.status(404).json({ error: 'Contest not found.' });

    const participants = await query(
      `SELECT u.username, p.full_name, cp.joined_at, cp.rank, cp.score
       FROM contest_participants cp
       JOIN users u ON u.id = cp.user_id
       JOIN profiles p ON p.user_id = u.id
       WHERE cp.contest_id = $1
       ORDER BY cp.joined_at ASC`,
      [req.params.id]
    );

    res.json({ ...contest, participants: participants.rows });
  } catch (err) {
    next(err);
  }
}

async function joinContest(req, res, next) {
  try {
    const result = await withTransaction((client) =>
      contestEngine.joinContest(client, { contestId: req.params.id, userId: req.user.id })
    );
    res.json({ message: 'Joined contest successfully.', contest: result });
  } catch (err) {
    next(err);
  }
}

async function getLeaderboard(req, res, next) {
  try {
    const result = await query(
      `SELECT user_id, full_name, username, college, total_points, contests_won, total_contests, global_rank
       FROM global_leaderboard
       ORDER BY global_rank ASC
       LIMIT 100`
    );
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
}

async function getContestLeaderboard(req, res, next) {
  try {
    const result = await query(
      `SELECT u.username, p.full_name, cp.score, cp.correct_count, cp.wrong_count,
              cp.time_taken_seconds, cp.rank, cp.points_awarded, cp.badge_awarded
       FROM contest_participants cp
       JOIN users u ON u.id = cp.user_id
       JOIN profiles p ON p.user_id = u.id
       WHERE cp.contest_id = $1
       ORDER BY cp.rank ASC NULLS LAST`,
      [req.params.id]
    );
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
}

module.exports = { listContests, getContest, joinContest, getLeaderboard, getContestLeaderboard };
