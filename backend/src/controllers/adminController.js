const bcrypt = require('bcrypt');
const { query, withTransaction } = require('../db/pool');
const contestEngine = require('../utils/contestEngine');

async function logAction(client, adminId, action, targetType, targetId, details = {}) {
  await client.query(
    `INSERT INTO admin_logs (admin_id, action, target_type, target_id, details)
     VALUES ($1,$2,$3,$4,$5)`,
    [adminId, action, targetType, targetId, JSON.stringify(details)]
  );
}

// ---- Contest Templates -------------------------------------------------
async function createTemplate(req, res, next) {
  try {
    const {
      name, description, quizId, entryPointsCost = 0, maxParticipants,
      durationMinutes = 15, rewardStructure = [], autoRegenerate = true,
    } = req.body;

    if (!name || !quizId || !maxParticipants) {
      return res.status(400).json({ error: 'name, quizId and maxParticipants are required.' });
    }

    const result = await withTransaction(async (client) => {
      const tRes = await client.query(
        `INSERT INTO contest_templates
          (name, description, quiz_id, entry_points_cost, max_participants,
           duration_minutes, reward_structure, auto_regenerate, created_by)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
         RETURNING *`,
        [name, description, quizId, entryPointsCost, maxParticipants,
         durationMinutes, JSON.stringify(rewardStructure), autoRegenerate, req.user.id]
      );
      const template = tRes.rows[0];
      const firstContest = await contestEngine.ensureOpenContestExists(client, template.id);
      await logAction(client, req.user.id, 'create_template', 'contest_template', template.id, { name });
      return { template, firstContest };
    });

    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

async function listTemplates(req, res, next) {
  try {
    const result = await query(
      `SELECT ct.*, q.title AS quiz_title,
              (SELECT COUNT(*) FROM contests c WHERE c.template_id = ct.id) AS contests_spawned
       FROM contest_templates ct LEFT JOIN quizzes q ON q.id = ct.quiz_id
       ORDER BY ct.created_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
}

async function updateTemplate(req, res, next) {
  try {
    const { id } = req.params;
    const { isActive, autoRegenerate, entryPointsCost, rewardStructure, name, description } = req.body;
    const result = await query(
      `UPDATE contest_templates SET
        is_active = COALESCE($1, is_active),
        auto_regenerate = COALESCE($2, auto_regenerate),
        entry_points_cost = COALESCE($3, entry_points_cost),
        reward_structure = COALESCE($4, reward_structure),
        name = COALESCE($5, name),
        description = COALESCE($6, description)
       WHERE id = $7 RETURNING *`,
      [isActive, autoRegenerate, entryPointsCost,
       rewardStructure ? JSON.stringify(rewardStructure) : null, name, description, id]
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'Template not found.' });
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
}

// ---- Quizzes -------------------------------------------------------------
async function createQuiz(req, res, next) {
  try {
    const { title, description, instructions, durationMinutes = 15,
            negativeMarking = 0, passingMarks = 0, questions = [] } = req.body;
    if (!title || questions.length === 0) {
      return res.status(400).json({ error: 'title and at least one question are required.' });
    }

    const result = await withTransaction(async (client) => {
      const quizRes = await client.query(
        `INSERT INTO quizzes (title, description, instructions, duration_minutes, negative_marking, passing_marks, is_published, created_by)
         VALUES ($1,$2,$3,$4,$5,$6,true,$7) RETURNING *`,
        [title, description, instructions, durationMinutes, negativeMarking, passingMarks, req.user.id]
      );
      const quiz = quizRes.rows[0];

      let order = 0;
      for (const q of questions) {
        order += 1;
        await client.query(
          `INSERT INTO questions
            (quiz_id, question_text, question_type, options, correct_options, marks, negative_marks, difficulty, explanation, order_index)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
          [quiz.id, q.questionText, q.questionType || 'mcq', JSON.stringify(q.options),
           JSON.stringify(q.correctOptions), q.marks || 1, q.negativeMarks || 0,
           q.difficulty || 'medium', q.explanation || null, order]
        );
      }
      await logAction(client, req.user.id, 'create_quiz', 'quiz', quiz.id, { title });
      return quiz;
    });

    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

async function listQuizzes(req, res, next) {
  try {
    const result = await query(
      `SELECT q.*, (SELECT COUNT(*) FROM questions WHERE quiz_id = q.id) AS question_count
       FROM quizzes q ORDER BY q.created_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
}

// ---- Users -----------------------------------------------------------
async function listUsers(req, res, next) {
  try {
    const { search = '', limit = 50, offset = 0 } = req.query;
    const result = await query(
      `SELECT u.id, u.username, u.email, u.mobile, u.role, u.status, u.created_at,
              p.full_name, p.college, p.total_points, p.total_contests, p.contests_won,
              w.current_points, w.available_prize, w.lifetime_prize
       FROM users u
       JOIN profiles p ON p.user_id = u.id
       LEFT JOIN wallets w ON w.user_id = u.id
       WHERE (u.username ILIKE $1 OR u.email ILIKE $1 OR p.full_name ILIKE $1)
       ORDER BY u.created_at DESC LIMIT $2 OFFSET $3`,
      [`%${search}%`, limit, offset]
    );
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
}

async function getUserDetails(req, res, next) {
  try {
    const { id } = req.params;

    const [userRes, walletRes, quizHistRes, withdrawRes, couponRes] = await Promise.all([
      query(
        `SELECT u.id, u.username, u.email, u.mobile, u.role, u.status, u.created_at,
                p.full_name, p.college, p.university, p.state, p.city, p.avatar_url,
                p.referral_code, p.total_points, p.total_contests, p.total_quizzes_played, p.contests_won
         FROM users u JOIN profiles p ON p.user_id = u.id WHERE u.id = $1`,
        [id]
      ),
      query(
        `SELECT current_points, available_prize, lifetime_prize, updated_at FROM wallets WHERE user_id = $1`,
        [id]
      ),
      query(
        `SELECT qa.id, qa.started_at, qa.submitted_at, qa.score, qa.auto_submitted,
                qz.title as quiz_title, c.name as contest_name,
                cp.rank, cp.points_awarded, cp.badge_awarded
         FROM quiz_attempts qa
         JOIN quizzes qz ON qz.id = qa.quiz_id
         JOIN contests c ON c.id = qa.contest_id
         LEFT JOIN contest_participants cp ON cp.contest_id = qa.contest_id AND cp.user_id = qa.user_id
         WHERE qa.user_id = $1
         ORDER BY qa.started_at DESC LIMIT 20`,
        [id]
      ),
      query(
        `SELECT id, amount, method, status, transaction_id, created_at
         FROM withdrawal_history WHERE user_id = $1 ORDER BY created_at DESC LIMIT 20`,
        [id]
      ),
      query(
        `SELECT cr.id, cr.redeemed_at, cr.points_awarded, cr.reward_awarded,
                co.code, co.points as coupon_points, co.reward_amount as coupon_reward
         FROM coupon_redemptions cr
         JOIN coupons co ON co.id = cr.coupon_id
         WHERE cr.user_id = $1 ORDER BY cr.redeemed_at DESC LIMIT 20`,
        [id]
      ),
    ]);

    if (!userRes.rows[0]) return res.status(404).json({ error: 'User not found.' });

    res.json({
      user: userRes.rows[0],
      wallet: walletRes.rows[0] || null,
      quizHistory: quizHistRes.rows,
      withdrawHistory: withdrawRes.rows,
      couponHistory: couponRes.rows,
    });
  } catch (err) {
    next(err);
  }
}

async function updateUserAccess(req, res, next) {
  try {
    const { id } = req.params;
    const { username, email, mobile, password, role, status, fullName, college, university, state, city } = req.body;

    await withTransaction(async (client) => {
      // Update users table
      if (username !== undefined || email !== undefined || mobile !== undefined || role !== undefined || status !== undefined || password !== undefined) {
        let passwordHash = undefined;
        if (password) {
          passwordHash = await bcrypt.hash(password, 10);
        }
        await client.query(
          `UPDATE users SET
            username  = COALESCE($1, username),
            email     = COALESCE($2, email),
            mobile    = COALESCE($3, mobile),
            role      = COALESCE($4, role),
            status    = COALESCE($5, status),
            password_hash = COALESCE($6, password_hash),
            updated_at = now()
           WHERE id = $7`,
          [username, email, mobile, role, status, passwordHash ?? null, id]
        );
      }
      // Update profiles table
      if (fullName !== undefined || college !== undefined || university !== undefined || state !== undefined || city !== undefined) {
        await client.query(
          `UPDATE profiles SET
            full_name  = COALESCE($1, full_name),
            college    = COALESCE($2, college),
            university = COALESCE($3, university),
            state      = COALESCE($4, state),
            city       = COALESCE($5, city),
            updated_at = now()
           WHERE user_id = $6`,
          [fullName, college, university, state, city, id]
        );
      }
      await logAction(client, req.user.id, 'update_user_access', 'user', id, { username, role, status });
    });

    res.json({ message: 'User updated successfully.' });
  } catch (err) {
    next(err);
  }
}

async function deleteUser(req, res, next) {
  try {
    const { id } = req.params;
    await withTransaction(async (client) => {
      await client.query(`UPDATE users SET status = 'deleted', updated_at = now() WHERE id = $1`, [id]);
      await logAction(client, req.user.id, 'delete_user', 'user', id, {});
    });
    res.json({ message: 'User deleted (soft-deleted as status=deleted).' });
  } catch (err) {
    next(err);
  }
}

async function setUserStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status } = req.body; // active | suspended
    if (!['active', 'suspended'].includes(status)) {
      return res.status(400).json({ error: 'status must be active or suspended.' });
    }
    await withTransaction(async (client) => {
      await client.query(`UPDATE users SET status = $1, updated_at = now() WHERE id = $2`, [status, id]);
      await logAction(client, req.user.id, 'set_user_status', 'user', id, { status });
    });
    res.json({ message: `User status set to ${status}.` });
  } catch (err) {
    next(err);
  }
}

// ---- Points adjustment (admin correction tool — still no cash) --------
async function adjustPoints(req, res, next) {
  try {
    const { id } = req.params; // user id
    const { amount, reason } = req.body;
    if (!amount || !reason) return res.status(400).json({ error: 'amount and reason are required.' });

    const pointsService = require('../utils/pointsService');
    await withTransaction(async (client) => {
      if (amount > 0) {
        await pointsService.credit(client, { userId: id, amount, type: 'admin_adjustment', description: reason });
      } else {
        await pointsService.debit(client, { userId: id, amount: Math.abs(amount), type: 'admin_adjustment', description: reason });
      }
      await logAction(client, req.user.id, 'adjust_points', 'user', id, { amount, reason });
    });
    res.json({ message: 'Points adjusted.' });
  } catch (err) {
    next(err);
  }
}

// ---- Wallet Adjustment (admin can directly set wallet values) -----------
async function adjustUserWallet(req, res, next) {
  try {
    const { id } = req.params;
    const { availablePrize, lifetimePrize, reason } = req.body;

    await withTransaction(async (client) => {
      // Ensure wallet exists
      await client.query(
        `INSERT INTO wallets (user_id) VALUES ($1) ON CONFLICT (user_id) DO NOTHING`,
        [id]
      );
      await client.query(
        `UPDATE wallets SET
          available_prize = COALESCE($1, available_prize),
          lifetime_prize  = COALESCE($2, lifetime_prize),
          updated_at = now()
         WHERE user_id = $3`,
        [availablePrize !== undefined ? availablePrize : null,
         lifetimePrize !== undefined ? lifetimePrize : null,
         id]
      );
      await logAction(client, req.user.id, 'adjust_wallet', 'user', id, { availablePrize, lifetimePrize, reason });
    });
    res.json({ message: 'Wallet adjusted.' });
  } catch (err) {
    next(err);
  }
}

// ---- Coupons -----------------------------------------------------------
async function listCoupons(req, res, next) {
  try {
    const result = await query(
      `SELECT c.*, 
              (SELECT COUNT(*) FROM coupon_redemptions WHERE coupon_id = c.id) AS total_redeemed
       FROM coupons c ORDER BY c.created_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
}

async function createCoupon(req, res, next) {
  try {
    const { code, points = 0, rewardAmount = 0, maxRedemptions, expiresAt, isActive = true } = req.body;
    if (!code) return res.status(400).json({ error: 'code is required.' });
    const result = await query(
      `INSERT INTO coupons (code, points, reward_amount, max_redemptions, expires_at, is_active)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [code.toUpperCase().trim(), points, rewardAmount, maxRedemptions || null, expiresAt || null, isActive]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') return res.status(400).json({ error: 'Coupon code already exists.' });
    next(err);
  }
}

async function updateCoupon(req, res, next) {
  try {
    const { id } = req.params;
    const { code, points, rewardAmount, maxRedemptions, expiresAt, isActive } = req.body;
    const result = await query(
      `UPDATE coupons SET
        code            = COALESCE($1, code),
        points          = COALESCE($2, points),
        reward_amount   = COALESCE($3, reward_amount),
        max_redemptions = COALESCE($4, max_redemptions),
        expires_at      = COALESCE($5, expires_at),
        is_active       = COALESCE($6, is_active)
       WHERE id = $7 RETURNING *`,
      [code ? code.toUpperCase().trim() : null, points, rewardAmount,
       maxRedemptions !== undefined ? maxRedemptions : null,
       expiresAt !== undefined ? expiresAt : null, isActive, id]
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'Coupon not found.' });
    res.json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') return res.status(400).json({ error: 'Coupon code already exists.' });
    next(err);
  }
}

async function deleteCoupon(req, res, next) {
  try {
    const { id } = req.params;
    await query(`DELETE FROM coupons WHERE id = $1`, [id]);
    res.json({ message: 'Coupon deleted.' });
  } catch (err) {
    next(err);
  }
}

async function listCouponRedemptions(req, res, next) {
  try {
    const { limit = 100, offset = 0, search = '' } = req.query;
    const result = await query(
      `SELECT cr.id, cr.redeemed_at, cr.points_awarded, cr.reward_awarded,
              co.code, u.username, u.email, p.full_name
       FROM coupon_redemptions cr
       JOIN coupons co ON co.id = cr.coupon_id
       JOIN users u ON u.id = cr.user_id
       JOIN profiles p ON p.user_id = cr.user_id
       WHERE (u.username ILIKE $1 OR u.email ILIKE $1 OR co.code ILIKE $1 OR p.full_name ILIKE $1)
       ORDER BY cr.redeemed_at DESC LIMIT $2 OFFSET $3`,
      [`%${search}%`, limit, offset]
    );
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
}

// ---- Withdrawals (Payments) ------------------------------------------
async function listWithdrawals(req, res, next) {
  try {
    const { status = '', limit = 100, offset = 0, search = '' } = req.query;
    const result = await query(
      `SELECT wh.id, wh.amount, wh.method, wh.status, wh.transaction_id, wh.created_at,
              u.username, u.email, p.full_name
       FROM withdrawal_history wh
       JOIN users u ON u.id = wh.user_id
       JOIN profiles p ON p.user_id = wh.user_id
       WHERE ($1 = '' OR wh.status ILIKE $1)
         AND (u.username ILIKE $2 OR u.email ILIKE $2 OR p.full_name ILIKE $2)
       ORDER BY wh.created_at DESC LIMIT $3 OFFSET $4`,
      [status, `%${search}%`, limit, offset]
    );
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
}

async function updateWithdrawalStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status, transactionId } = req.body;
    if (!['Completed', 'Failed'].includes(status)) {
      return res.status(400).json({ error: 'status must be Completed or Failed.' });
    }

    await withTransaction(async (client) => {
      // Get the withdrawal record
      const withdrawRes = await client.query(
        `SELECT wh.user_id, wh.amount, wh.status FROM withdrawal_history wh WHERE wh.id = $1 FOR UPDATE`,
        [id]
      );
      if (!withdrawRes.rows[0]) throw Object.assign(new Error('Withdrawal not found.'), { status: 404 });
      const withdrawal = withdrawRes.rows[0];

      if (withdrawal.status !== 'Processing') {
        throw Object.assign(new Error('Only Processing withdrawals can be updated.'), { status: 400 });
      }

      await client.query(
        `UPDATE withdrawal_history SET status = $1, transaction_id = COALESCE($2, transaction_id) WHERE id = $3`,
        [status, transactionId || null, id]
      );

      // Refund prize balance if failed
      if (status === 'Failed') {
        await client.query(
          `UPDATE wallets SET available_prize = available_prize + $1, updated_at = now() WHERE user_id = $2`,
          [withdrawal.amount, withdrawal.user_id]
        );
      }
      await logAction(client, req.user.id, 'update_withdrawal', 'withdrawal', id, { status, transactionId });
    });
    res.json({ message: `Withdrawal marked as ${status}.` });
  } catch (err) {
    next(err);
  }
}

// ---- Announcements -----------------------------------------------------
async function createAnnouncement(req, res, next) {
  try {
    const { title, body, bannerUrl } = req.body;
    const result = await query(
      `INSERT INTO announcements (title, body, banner_url, created_by) VALUES ($1,$2,$3,$4) RETURNING *`,
      [title, body, bannerUrl, req.user.id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
}

// ---- Dashboard analytics -------------------------------------------------
async function getDashboardStats(req, res, next) {
  try {
    const [users, contests, quizzes, activeTemplates, topColleges, pendingWithdrawals, activeCoupons] = await Promise.all([
      query(`SELECT COUNT(*)::int AS count FROM users WHERE role = 'student'`),
      query(`SELECT status, COUNT(*)::int AS count FROM contests GROUP BY status`),
      query(`SELECT COUNT(*)::int AS count FROM quizzes WHERE is_published = true`),
      query(`SELECT COUNT(*)::int AS count FROM contest_templates WHERE is_active = true`),
      query(
        `SELECT college, COUNT(*)::int AS student_count FROM profiles
         WHERE college IS NOT NULL GROUP BY college ORDER BY student_count DESC LIMIT 5`
      ),
      query(`SELECT COUNT(*)::int AS count, COALESCE(SUM(amount),0)::numeric AS total FROM withdrawal_history WHERE status = 'Processing'`),
      query(`SELECT COUNT(*)::int AS count FROM coupons WHERE is_active = true`),
    ]);

    res.json({
      totalStudents: users.rows[0].count,
      contestsByStatus: contests.rows,
      publishedQuizzes: quizzes.rows[0].count,
      activeTemplates: activeTemplates.rows[0].count,
      topColleges: topColleges.rows,
      pendingWithdrawals: pendingWithdrawals.rows[0],
      activeCoupons: activeCoupons.rows[0].count,
    });
  } catch (err) {
    next(err);
  }
}

// ---- Admin Audit Log --------------------------------------------------
async function getAdminLogs(req, res, next) {
  try {
    const { limit = 50, offset = 0 } = req.query;
    const result = await query(
      `SELECT al.id, al.action, al.target_type, al.target_id, al.details, al.created_at,
              u.username AS admin_username, p.full_name AS admin_name
       FROM admin_logs al
       JOIN users u ON u.id = al.admin_id
       JOIN profiles p ON p.user_id = al.admin_id
       ORDER BY al.created_at DESC LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
}

// ---- Bulk Points Credit -----------------------------------------------
async function bulkCreditPoints(req, res, next) {
  try {
    const { amount, reason } = req.body;
    if (!amount || amount <= 0 || !reason) {
      return res.status(400).json({ error: 'amount (>0) and reason are required.' });
    }
    const pointsService = require('../utils/pointsService');
    const studentsRes = await query(
      `SELECT id FROM users WHERE role = 'student' AND status = 'active'`
    );
    const students = studentsRes.rows;
    let credited = 0;
    await withTransaction(async (client) => {
      for (const s of students) {
        await pointsService.credit(client, {
          userId: s.id,
          amount: Number(amount),
          type: 'admin_adjustment',
          description: reason,
        });
        credited++;
      }
      await logAction(client, req.user.id, 'bulk_credit_points', 'all_students', null, { amount, reason, count: credited });
    });
    res.json({ message: `Credited ${amount} points to ${credited} active students.`, credited });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createTemplate, listTemplates, updateTemplate,
  createQuiz, listQuizzes,
  listUsers, getUserDetails, updateUserAccess, deleteUser,
  setUserStatus, adjustPoints, adjustUserWallet, bulkCreditPoints,
  listCoupons, createCoupon, updateCoupon, deleteCoupon, listCouponRedemptions,
  listWithdrawals, updateWithdrawalStatus,
  createAnnouncement, getDashboardStats, getAdminLogs,
};
