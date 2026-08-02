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
      `SELECT u.id, u.username, u.email, u.mobile, u.status, u.created_at,
              p.full_name, p.college, p.total_points, p.total_contests, p.contests_won
       FROM users u JOIN profiles p ON p.user_id = u.id
       WHERE u.role = 'student' AND (u.username ILIKE $1 OR u.email ILIKE $1 OR p.full_name ILIKE $1)
       ORDER BY u.created_at DESC LIMIT $2 OFFSET $3`,
      [`%${search}%`, limit, offset]
    );
    res.json(result.rows);
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
    const [users, contests, quizzes, activeTemplates, topColleges] = await Promise.all([
      query(`SELECT COUNT(*)::int AS count FROM users WHERE role = 'student'`),
      query(`SELECT status, COUNT(*)::int AS count FROM contests GROUP BY status`),
      query(`SELECT COUNT(*)::int AS count FROM quizzes WHERE is_published = true`),
      query(`SELECT COUNT(*)::int AS count FROM contest_templates WHERE is_active = true`),
      query(
        `SELECT college, COUNT(*)::int AS student_count FROM profiles
         WHERE college IS NOT NULL GROUP BY college ORDER BY student_count DESC LIMIT 5`
      ),
    ]);

    res.json({
      totalStudents: users.rows[0].count,
      contestsByStatus: contests.rows,
      publishedQuizzes: quizzes.rows[0].count,
      activeTemplates: activeTemplates.rows[0].count,
      topColleges: topColleges.rows,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createTemplate, listTemplates, updateTemplate,
  createQuiz, listQuizzes,
  listUsers, setUserStatus, adjustPoints,
  createAnnouncement, getDashboardStats,
};
