const bcrypt = require('bcrypt');
const { withTransaction, query } = require('../db/pool');
const {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  hashToken,
  generateReferralCode,
} = require('../utils/tokens');
const pointsService = require('../utils/pointsService');
const { getDemoProfile, shouldUseMockData } = require('../utils/mockData');

const SIGNUP_BONUS_POINTS = 50;
const REFERRAL_BONUS_POINTS = parseInt(process.env.REFERRAL_BONUS_POINTS || '100', 10);

async function loadAuthUser(userId) {
  const result = await query(
    `SELECT u.id, u.username, u.email, u.role, u.status,
            p.full_name, p.college, p.university, p.state, p.city, p.avatar_url,
            p.referral_code, p.total_points, p.total_contests, p.total_quizzes_played, p.contests_won
     FROM users u
     JOIN profiles p ON p.user_id = u.id
     WHERE u.id = $1`,
    [userId]
  );
  return result.rows[0] || null;
}

async function register(req, res, next) {
  try {
    const { username, fullName, email, mobile, password, referralCode } = req.body;

    if (!username || !fullName || !email || !password) {
      return res.status(400).json({ error: 'username, fullName, email and password are required.' });
    }
    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters.' });
    }

    if (shouldUseMockData()) {
      const demoUser = getDemoProfile(username);
      return res.status(201).json({
        user: demoUser,
        accessToken: signAccessToken(demoUser),
        refreshToken: signRefreshToken(demoUser),
      });
    }

    const result = await withTransaction(async (client) => {
      const passwordHash = await bcrypt.hash(password, 10);

      let referredBy = null;
      if (referralCode) {
        const refRes = await client.query(
          `SELECT user_id FROM profiles WHERE referral_code = $1`,
          [referralCode.toUpperCase()]
        );
        if (refRes.rows[0]) referredBy = refRes.rows[0].user_id;
      }

      const userRes = await client.query(
        `INSERT INTO users (username, email, mobile, password_hash)
         VALUES ($1, $2, $3, $4) RETURNING id, username, email, role, created_at`,
        [username.toLowerCase(), email.toLowerCase(), mobile || null, passwordHash]
      );
      const user = userRes.rows[0];

      const myReferralCode = generateReferralCode(username);
      await client.query(
        `INSERT INTO profiles (user_id, full_name, referral_code, referred_by)
         VALUES ($1, $2, $3, $4)`,
        [user.id, fullName, myReferralCode, referredBy]
      );

      // Free signup bonus — not purchasable, just a welcome credit
      await pointsService.credit(client, {
        userId: user.id,
        amount: SIGNUP_BONUS_POINTS,
        type: 'signup_bonus',
        description: 'Welcome bonus for creating an account',
      });

      if (referredBy) {
        await pointsService.credit(client, {
          userId: referredBy,
          amount: REFERRAL_BONUS_POINTS,
          type: 'referral_bonus',
          description: `Referral bonus for inviting ${username}`,
        });
      }

      return user;
    });

    const authUser = (await loadAuthUser(result.id)) || result;
    const accessToken = signAccessToken(authUser);
    const refreshToken = signRefreshToken(authUser);
    await query(
      `INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
       VALUES ($1, $2, now() + interval '30 days')`,
      [result.id, hashToken(refreshToken)]
    );

    res.status(201).json({
      user: authUser,
      accessToken,
      refreshToken,
    });
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const { usernameOrEmail, password } = req.body;
    if (!usernameOrEmail || !password) {
      return res.status(400).json({ error: 'usernameOrEmail and password are required.' });
    }

    const normalizedUsername = (usernameOrEmail || '').toLowerCase();

    if (shouldUseMockData()) {
      const demoUser = getDemoProfile(normalizedUsername);
      return res.json({
        user: demoUser,
        accessToken: signAccessToken(demoUser),
        refreshToken: signRefreshToken(demoUser),
      });
    }

    try {
      const userRes = await query(
        `SELECT id, username, email, password_hash, role, status FROM users
         WHERE username = $1 OR email = $1`,
        [normalizedUsername]
      );
      const user = userRes.rows[0];

      if (!user) {
        if (shouldUseMockData()) {
          const demoUser = getDemoUser(normalizedUsername);
          const demoTokens = getDemoTokens(demoUser);
          return res.json({
            user: { id: demoUser.id, username: demoUser.username, email: demoUser.email, role: demoUser.role },
            ...demoTokens,
          });
        }
        return res.status(401).json({ error: 'Invalid credentials.' });
      }

      if (user.status !== 'active') return res.status(403).json({ error: 'Account is not active.' });

      const valid = await bcrypt.compare(password, user.password_hash);
      if (!valid) return res.status(401).json({ error: 'Invalid credentials.' });

      // Daily login bonus (once per calendar day)
      try {
        await withTransaction(async (client) => {
          const lastLogin = await client.query(
            `SELECT created_at FROM points_transactions
             WHERE user_id = $1 AND type = 'daily_login'
             ORDER BY created_at DESC LIMIT 1`,
            [user.id]
          );
          const last = lastLogin.rows[0]?.created_at;
          const isNewDay = !last || new Date(last).toDateString() !== new Date().toDateString();
          if (isNewDay) {
            await pointsService.credit(client, {
              userId: user.id,
              amount: parseInt(process.env.DAILY_LOGIN_POINTS || '10', 10),
              type: 'daily_login',
              description: 'Daily login reward',
            });
          }
        });
      } catch (bonusErr) {
        console.warn('Daily login bonus skipped', bonusErr.message);
      }

      const authUser = (await loadAuthUser(user.id)) || user;
      const accessToken = signAccessToken(authUser);
      const refreshToken = signRefreshToken(authUser);
      await query(
        `INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
         VALUES ($1, $2, now() + interval '30 days')`,
        [user.id, hashToken(refreshToken)]
      );

      return res.json({
        user: authUser,
        accessToken,
        refreshToken,
      });
    } catch (dbErr) {
      if (shouldUseMockData(dbErr)) {
        const demoUser = getDemoProfile(normalizedUsername);
        return res.json({
          user: demoUser,
          accessToken: signAccessToken(demoUser),
          refreshToken: signRefreshToken(demoUser),
        });
      }
      throw dbErr;
    }
  } catch (err) {
    next(err);
  }
}

async function refresh(req, res, next) {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(400).json({ error: 'refreshToken is required.' });

    const payload = verifyRefreshToken(refreshToken);

    if (shouldUseMockData()) {
      const demoUser = getDemoProfile();
      if (payload.sub === demoUser.id) {
        return res.json({ accessToken: signAccessToken(demoUser) });
      }
    }

    const tokenHash = hashToken(refreshToken);

    const dbToken = await query(
      `SELECT * FROM refresh_tokens WHERE user_id = $1 AND token_hash = $2 AND revoked = false AND expires_at > now()`,
      [payload.sub, tokenHash]
    );
    if (!dbToken.rows[0]) return res.status(401).json({ error: 'Refresh token invalid or expired.' });

    const userRes = await query(`SELECT id, username, role FROM users WHERE id = $1`, [payload.sub]);
    const user = userRes.rows[0];
    if (!user) return res.status(401).json({ error: 'User not found.' });

    const accessToken = signAccessToken(user);
    res.json({ accessToken });
  } catch (err) {
    return res.status(401).json({ error: 'Invalid refresh token.' });
  }
}

async function logout(req, res, next) {
  try {
    const { refreshToken } = req.body;
    if (refreshToken) {
      await query(
        `UPDATE refresh_tokens SET revoked = true WHERE token_hash = $1`,
        [hashToken(refreshToken)]
      );
    }
    res.json({ message: 'Logged out.' });
  } catch (err) {
    next(err);
  }
}

module.exports = { register, login, refresh, logout };
