const { query } = require('../db/pool');
const {
  shouldUseMockData,
  getDemoProfile,
  getDemoContests,
  getDemoPointsHistory,
  getDemoBadges,
} = require('../utils/mockData');

async function getMe(req, res, next) {
  try {
    if (shouldUseMockData() || req.user.id === 'demo-user-id') {
      return res.json(getDemoProfile());
    }

    const result = await query(
      `SELECT u.id, u.username, u.email, u.mobile, u.role, u.created_at,
              p.full_name, p.college, p.university, p.state, p.city, p.avatar_url,
              p.referral_code, p.total_points, p.total_contests, p.total_quizzes_played, p.contests_won
       FROM users u JOIN profiles p ON p.user_id = u.id
       WHERE u.id = $1`,
      [req.user.id]
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'User not found.' });
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
}

async function updateProfile(req, res, next) {
  try {
    const { fullName, college, university, state, city, avatarUrl } = req.body;
    const result = await query(
      `UPDATE profiles SET
        full_name = COALESCE($1, full_name),
        college = COALESCE($2, college),
        university = COALESCE($3, university),
        state = COALESCE($4, state),
        city = COALESCE($5, city),
        avatar_url = COALESCE($6, avatar_url),
        updated_at = now()
       WHERE user_id = $7
       RETURNING *`,
      [fullName, college, university, state, city, avatarUrl, req.user.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
}

async function getPointsHistory(req, res, next) {
  try {
    if (shouldUseMockData() || req.user.id === 'demo-user-id') {
      return res.json(getDemoPointsHistory());
    }

    const { limit = 50, offset = 0 } = req.query;
    const result = await query(
      `SELECT id, amount, type, description, created_at
       FROM points_transactions WHERE user_id = $1
       ORDER BY created_at DESC LIMIT $2 OFFSET $3`,
      [req.user.id, limit, offset]
    );
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
}

async function getMyContests(req, res, next) {
  try {
    if (shouldUseMockData() || req.user.id === 'demo-user-id') {
      return res.json(getDemoContests());
    }

    const { status } = req.query;
    const params = [req.user.id];
    let statusClause = '';
    if (status) {
      statusClause = 'AND c.status = $2';
      params.push(status);
    }
    const result = await query(
      `SELECT c.id, c.name, c.status, c.starts_at, c.ends_at, c.current_participants, c.max_participants,
              cp.score, cp.rank, cp.points_awarded, cp.badge_awarded, cp.joined_at
       FROM contest_participants cp
       JOIN contests c ON c.id = cp.contest_id
       WHERE cp.user_id = $1 ${statusClause}
       ORDER BY cp.joined_at DESC`,
      params
    );
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
}

async function getMyBadges(req, res, next) {
  try {
    if (shouldUseMockData() || req.user.id === 'demo-user-id') {
      return res.json(getDemoBadges());
    }

    const result = await query(
      `SELECT b.code, b.name, b.description, b.icon, ub.awarded_at
       FROM user_badges ub JOIN badges b ON b.id = ub.badge_id
       WHERE ub.user_id = $1 ORDER BY ub.awarded_at DESC`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
}

module.exports = { getMe, updateProfile, getPointsHistory, getMyContests, getMyBadges };
