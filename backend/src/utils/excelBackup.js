/**
 * utils/excelBackup.js
 * ---------------------------------------------------------------------
 * Builds a single .xlsx workbook that mirrors the MySQL database for
 * backup / offline-review purposes: one styled sheet per data domain
 * (login credentials, profiles, quizzes, contest participation, prize
 * history, raw table counts).
 *
 * Every user gets a short, deterministic "User Code" (derived from their
 * UUID, e.g. "DNX-4F9A21C7") that is repeated as the first column on
 * every sheet that touches that user. It's not a new stored value — it's
 * recomputed from users.id every time — so this file needs no schema
 * migration and never touches the users table. Filter/search any sheet
 * by that code (or Ctrl/Cmd+F it) and you can find that same user's rows
 * everywhere else in the workbook.
 *
 * This module is purely additive: it only *reads* from the existing
 * `query()` helper in db/pool.js and does not alter any existing table,
 * route, or controller.
 * ---------------------------------------------------------------------
 */

const ExcelJS = require('exceljs');
const { query } = require('../db/pool');

// ---------------------------------------------------------------------
// User Code helpers
// ---------------------------------------------------------------------

/** Deterministic short code for a user, derived purely from their UUID. */
function userCode(userId) {
  if (!userId) return '';
  return `DNX-${String(userId).replace(/-/g, '').slice(0, 8).toUpperCase()}`;
}

// ---------------------------------------------------------------------
// Styling helpers — keeps every sheet visually consistent
// ---------------------------------------------------------------------

const BRAND = {
  headerFill: 'FF1E3A8A',   // deep blue
  headerFont: 'FFFFFFFF',   // white
  altRowFill: 'FFF3F6FC',   // very light blue banding
  codeFill: 'FFFFF3CD',     // soft amber highlight for the User Code column
  tabColors: {
    credentials: 'FFB91C1C', // red — sensitive sheet
    users: 'FF1E3A8A',
    points: 'FFD97706',      // amber/gold for points
    govtJobs: 'FF0284C7',    // cyan/blue for govt jobs
    currentAffairs: 'FF7C3AED', // purple for current affairs
    quizzes: 'FF15803D',
    contests: 'FF6D28D9',
    prizes: 'FFB45309',
    database: 'FF334155',
    index: 'FF0F172A',
  },
};

function styleHeaderRow(sheet) {
  const header = sheet.getRow(1);
  header.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: BRAND.headerFont }, size: 11 };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: BRAND.headerFill } };
    cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    cell.border = {
      top: { style: 'thin', color: { argb: 'FFCBD5E1' } },
      bottom: { style: 'thin', color: { argb: 'FFCBD5E1' } },
      left: { style: 'thin', color: { argb: 'FFCBD5E1' } },
      right: { style: 'thin', color: { argb: 'FFCBD5E1' } },
    };
  });
  header.height = 26;
  sheet.views = [{ state: 'frozen', ySplit: 1 }];
}

function zebraStripe(sheet, codeColIndex) {
  sheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;
    row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
      cell.border = {
        top: { style: 'hair', color: { argb: 'FFE2E8F0' } },
        bottom: { style: 'hair', color: { argb: 'FFE2E8F0' } },
      };
      if (codeColIndex && colNumber === codeColIndex) {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: BRAND.codeFill } };
        cell.font = { bold: true };
      } else if (rowNumber % 2 === 0) {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: BRAND.altRowFill } };
      }
    });
  });
}

function addSheet(workbook, name, columns, tabColor) {
  const sheet = workbook.addWorksheet(name, {
    properties: { tabColor: { argb: tabColor } },
  });
  sheet.columns = columns;
  return sheet;
}

function finalizeSheet(sheet, codeColKey) {
  styleHeaderRow(sheet);
  const codeColIndex = codeColKey
    ? sheet.columns.findIndex((c) => c.key === codeColKey) + 1
    : 0;
  zebraStripe(sheet, codeColIndex);
  sheet.autoFilter = {
    from: { row: 1, column: 1 },
    to: { row: 1, column: sheet.columns.length },
  };
  sheet.columns.forEach((col) => {
    let max = (col.header || '').length + 2;
    col.eachCell?.({ includeEmpty: false }, (cell) => {
      const len = cell.value ? String(cell.value).length : 0;
      if (len > max) max = len;
    });
    col.width = Math.min(Math.max(max + 2, 12), 45);
  });
}

// ---------------------------------------------------------------------
// Sheet builders
// ---------------------------------------------------------------------

async function buildIndexSheet(workbook, meta) {
  const sheet = addSheet(
    workbook,
    'Index',
    [
      { header: 'Sheet', key: 'sheet', width: 30 },
      { header: 'Contents', key: 'contents', width: 70 },
      { header: 'Row Count', key: 'rows', width: 14 },
    ],
    BRAND.tabColors.index
  );

  sheet.mergeCells('A1:C1');
  sheet.getCell('A1').value = `DreamNexa Data Backup — generated ${meta.generatedAt}`;
  sheet.getCell('A1').font = { bold: true, size: 14, color: { argb: 'FFFFFFFF' } };
  sheet.getCell('A1').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: BRAND.tabColors.index } };
  sheet.getCell('A1').alignment = { vertical: 'middle', horizontal: 'left' };
  sheet.getRow(1).height = 28;
  sheet.addRow([]);
  sheet.addRow(['Sheet', 'Contents', 'Row Count']);
  const headerRow = sheet.getRow(3);
  headerRow.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: BRAND.headerFont } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: BRAND.headerFill } };
  });

  meta.sheets.forEach(({ name, contents, rows }) => {
    sheet.addRow([name, contents, rows]);
  });

  sheet.addRow([]);
  sheet.addRow(['Note', `Every user has a "User Code" (e.g. ${userCode('00000000-0000-0000-0000-000000000000')}) repeated on every sheet — filter or Ctrl+F that code to pull all of that user's records at once.`]);
  sheet.getColumn(1).width = 24;
  sheet.getColumn(2).width = 72;
  sheet.getColumn(3).width = 14;
}

async function buildCredentialsSheet(workbook) {
  const { rows } = await query(
    `SELECT id, username, email, mobile, password_hash, role, status,
            email_verified, created_at, updated_at
     FROM users
     ORDER BY created_at DESC`
  );

  const sheet = addSheet(
    workbook,
    'Login Credentials',
    [
      { header: 'User Code', key: 'code' },
      { header: 'User ID', key: 'id' },
      { header: 'Username', key: 'username' },
      { header: 'Email', key: 'email' },
      { header: 'Mobile', key: 'mobile' },
      { header: 'Password Hash (bcrypt)', key: 'password_hash' },
      { header: 'Role', key: 'role' },
      { header: 'Status', key: 'status' },
      { header: 'Email Verified', key: 'email_verified' },
      { header: 'Created At', key: 'created_at' },
      { header: 'Updated At', key: 'updated_at' },
    ],
    BRAND.tabColors.credentials
  );

  rows.forEach((r) => {
    sheet.addRow({
      code: userCode(r.id),
      id: r.id,
      username: r.username,
      email: r.email,
      mobile: r.mobile || '',
      password_hash: r.password_hash,
      role: r.role,
      status: r.status,
      email_verified: r.email_verified ? 'Yes' : 'No',
      created_at: r.created_at,
      updated_at: r.updated_at,
    });
  });

  finalizeSheet(sheet, 'code');
  return rows.length;
}

async function buildUserDetailsSheet(workbook) {
  const { rows } = await query(
    `SELECT u.id, u.username, u.email, u.status, u.role,
            p.full_name, p.college, p.university, p.state, p.city,
            p.referral_code, p.referred_by, p.total_points, p.total_contests,
            p.total_quizzes_played, p.contests_won, p.updated_at
     FROM users u
     LEFT JOIN profiles p ON p.user_id = u.id
     ORDER BY p.total_points DESC`
  );

  const sheet = addSheet(
    workbook,
    'User Details',
    [
      { header: 'User Code', key: 'code' },
      { header: 'User ID', key: 'id' },
      { header: 'Full Name', key: 'full_name' },
      { header: 'Username', key: 'username' },
      { header: 'Email', key: 'email' },
      { header: 'College', key: 'college' },
      { header: 'University', key: 'university' },
      { header: 'State', key: 'state' },
      { header: 'City', key: 'city' },
      { header: 'Referral Code', key: 'referral_code' },
      { header: 'Referred By (User Code)', key: 'referred_by' },
      { header: 'Total Points', key: 'total_points' },
      { header: 'Total Contests', key: 'total_contests' },
      { header: 'Quizzes Played', key: 'total_quizzes_played' },
      { header: 'Contests Won', key: 'contests_won' },
      { header: 'Account Status', key: 'status' },
      { header: 'Last Updated', key: 'updated_at' },
    ],
    BRAND.tabColors.users
  );

  rows.forEach((r) => {
    sheet.addRow({
      code: userCode(r.id),
      id: r.id,
      full_name: r.full_name || '',
      username: r.username,
      email: r.email,
      college: r.college || '',
      university: r.university || '',
      state: r.state || '',
      city: r.city || '',
      referral_code: r.referral_code || '',
      referred_by: r.referred_by ? userCode(r.referred_by) : '',
      total_points: r.total_points || 0,
      total_contests: r.total_contests || 0,
      total_quizzes_played: r.total_quizzes_played || 0,
      contests_won: r.contests_won || 0,
      status: r.status,
      updated_at: r.updated_at,
    });
  });

  finalizeSheet(sheet, 'code');
  return rows.length;
}

async function buildQuizzesSheet(workbook) {
  const { rows } = await query(
    `SELECT q.id, q.title, q.description, q.duration_minutes, q.negative_marking,
            q.passing_marks, q.is_published, q.proctoring_enabled, q.created_at,
            u.id AS creator_id, u.username AS creator_username,
            (SELECT COUNT(*) FROM questions qq WHERE qq.quiz_id = q.id) AS question_count
     FROM quizzes q
     LEFT JOIN users u ON u.id = q.created_by
     ORDER BY q.created_at DESC`
  );

  const sheet = addSheet(
    workbook,
    'Quizzes',
    [
      { header: 'Quiz ID', key: 'id' },
      { header: 'Title', key: 'title' },
      { header: 'Description', key: 'description' },
      { header: 'Duration (min)', key: 'duration_minutes' },
      { header: 'Negative Marking', key: 'negative_marking' },
      { header: 'Passing Marks', key: 'passing_marks' },
      { header: 'Question Count', key: 'question_count' },
      { header: 'Published', key: 'is_published' },
      { header: 'Proctoring Enabled', key: 'proctoring_enabled' },
      { header: 'Created By (User Code)', key: 'creator_code' },
      { header: 'Created By (Username)', key: 'creator_username' },
      { header: 'Created At', key: 'created_at' },
    ],
    BRAND.tabColors.quizzes
  );

  rows.forEach((r) => {
    sheet.addRow({
      id: r.id,
      title: r.title,
      description: r.description || '',
      duration_minutes: r.duration_minutes,
      negative_marking: r.negative_marking,
      passing_marks: r.passing_marks || 0,
      question_count: r.question_count || 0,
      is_published: r.is_published ? 'Yes' : 'No',
      proctoring_enabled: r.proctoring_enabled ? 'Yes' : 'No',
      creator_code: r.creator_id ? userCode(r.creator_id) : '',
      creator_username: r.creator_username || '',
      created_at: r.created_at,
    });
  });

  finalizeSheet(sheet, null);
  return rows.length;
}

async function buildContestParticipantsSheet(workbook) {
  const { rows } = await query(
    `SELECT cp.id, cp.contest_id, c.name AS contest_name, c.status AS contest_status,
            cp.user_id, u.username, cp.joined_at, cp.score, cp.correct_count,
            cp.wrong_count, cp.time_taken_seconds, cp.\`rank\`, cp.points_awarded,
            cp.badge_awarded
     FROM contest_participants cp
     JOIN contests c ON c.id = cp.contest_id
     JOIN users u ON u.id = cp.user_id
     ORDER BY c.created_at DESC, cp.\`rank\` ASC`
  );

  const sheet = addSheet(
    workbook,
    'Contest Participants',
    [
      { header: 'User Code', key: 'code' },
      { header: 'Participant ID', key: 'id' },
      { header: 'Contest ID', key: 'contest_id' },
      { header: 'Contest Name', key: 'contest_name' },
      { header: 'Contest Status', key: 'contest_status' },
      { header: 'Username', key: 'username' },
      { header: 'Joined At', key: 'joined_at' },
      { header: 'Score', key: 'score' },
      { header: 'Correct', key: 'correct_count' },
      { header: 'Wrong', key: 'wrong_count' },
      { header: 'Time Taken (s)', key: 'time_taken_seconds' },
      { header: 'Rank', key: 'rank' },
      { header: 'Points Awarded', key: 'points_awarded' },
      { header: 'Badge Awarded', key: 'badge_awarded' },
    ],
    BRAND.tabColors.contests
  );

  rows.forEach((r) => {
    sheet.addRow({
      code: userCode(r.user_id),
      id: r.id,
      contest_id: r.contest_id,
      contest_name: r.contest_name,
      contest_status: r.contest_status,
      username: r.username,
      joined_at: r.joined_at,
      score: r.score,
      correct_count: r.correct_count,
      wrong_count: r.wrong_count,
      time_taken_seconds: r.time_taken_seconds,
      rank: r.rank,
      points_awarded: r.points_awarded,
      badge_awarded: r.badge_awarded || '',
    });
  });

  finalizeSheet(sheet, 'code');
  return rows.length;
}

/**
 * "Winners" = contest_participants with rank 1 (or a badge/points award) or
 * a credited reward_history row. "Non-winners" = everyone else who took part
 * but has no reward on record. This sheet is a read-only rollup — it does
 * not change how winners are actually decided (that logic stays in
 * utils/resultsEngine.js, untouched).
 */
async function buildPrizeWinnersSheet(workbook) {
  const { rows: rewardRows } = await query(
    `SELECT rh.id, rh.user_id, u.username, rh.reward_amount, rh.points_used,
            rh.status, rh.created_at
     FROM reward_history rh
     JOIN users u ON u.id = rh.user_id
     ORDER BY rh.created_at DESC`
  );

  const { rows: withdrawalRows } = await query(
    `SELECT wh.id, wh.user_id, u.username, wh.amount, wh.method, wh.status,
            wh.transaction_id, wh.created_at
     FROM withdrawal_history wh
     JOIN users u ON u.id = wh.user_id
     ORDER BY wh.created_at DESC`
  );

  const { rows: topRanks } = await query(
    `SELECT cp.user_id, u.username, c.name AS contest_name, cp.\`rank\`,
            cp.points_awarded, cp.badge_awarded, c.completed_at
     FROM contest_participants cp
     JOIN contests c ON c.id = cp.contest_id
     JOIN users u ON u.id = cp.user_id
     WHERE cp.\`rank\` IS NOT NULL AND cp.\`rank\` <= 3
     ORDER BY c.completed_at DESC, cp.\`rank\` ASC`
  );

  const sheet = addSheet(
    workbook,
    'Prizes - Winners & Others',
    [
      { header: 'User Code', key: 'code' },
      { header: 'Record Type', key: 'type' },
      { header: 'Username', key: 'username' },
      { header: 'Detail', key: 'detail' },
      { header: 'Amount / Points', key: 'amount' },
      { header: 'Outcome / Status', key: 'status' },
      { header: 'Date', key: 'date' },
    ],
    BRAND.tabColors.prizes
  );

  topRanks.forEach((r) => {
    sheet.addRow({
      code: userCode(r.user_id),
      type: 'Contest Rank',
      username: r.username,
      detail: `${r.contest_name} — Rank #${r.rank}${r.badge_awarded ? ` (${r.badge_awarded})` : ''}`,
      amount: r.points_awarded || 0,
      status: r.rank === 1 ? 'Winner' : 'Runner-up',
      date: r.completed_at,
    });
  });

  rewardRows.forEach((r) => {
    sheet.addRow({
      code: userCode(r.user_id),
      type: 'Reward Credit',
      username: r.username,
      detail: `${r.points_used} points redeemed`,
      amount: r.reward_amount,
      status: r.status,
      date: r.created_at,
    });
  });

  withdrawalRows.forEach((r) => {
    sheet.addRow({
      code: userCode(r.user_id),
      type: 'Withdrawal',
      username: r.username,
      detail: `Method: ${r.method}${r.transaction_id ? ` — Txn: ${r.transaction_id}` : ''}`,
      amount: r.amount,
      status: r.status, // Completed / Processing / Failed
      date: r.created_at,
    });
  });

  finalizeSheet(sheet, 'code');

  // Highlight Failed / non-winner rows so they stand out from credited ones.
  sheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;
    const status = String(row.getCell('status').value || '').toLowerCase();
    if (status === 'failed' || status === 'runner-up') {
      row.getCell('status').font = { color: { argb: 'FFB91C1C' }, bold: true };
    } else if (status === 'winner' || status === 'completed' || status === 'credited') {
      row.getCell('status').font = { color: { argb: 'FF15803D' }, bold: true };
    }
  });

  return rewardRows.length + withdrawalRows.length + topRanks.length;
}

async function buildQuizAttemptsSheet(workbook) {
  const { rows } = await query(
    `SELECT qa.id, qa.user_id, u.username, qa.contest_id, c.name AS contest_name,
            qa.quiz_id, q.title AS quiz_title, qa.started_at, qa.submitted_at,
            qa.auto_submitted, qa.score,
            (SELECT COUNT(*) FROM quiz_answers ans WHERE ans.attempt_id = qa.id) AS answers_recorded
     FROM quiz_attempts qa
     JOIN users u ON u.id = qa.user_id
     LEFT JOIN contests c ON c.id = qa.contest_id
     LEFT JOIN quizzes q ON q.id = qa.quiz_id
     ORDER BY qa.started_at DESC`
  );

  const sheet = addSheet(
    workbook,
    'Quiz Attempts',
    [
      { header: 'User Code', key: 'code' },
      { header: 'Attempt ID', key: 'id' },
      { header: 'Username', key: 'username' },
      { header: 'Quiz Title', key: 'quiz_title' },
      { header: 'Contest Name', key: 'contest_name' },
      { header: 'Started At', key: 'started_at' },
      { header: 'Submitted At', key: 'submitted_at' },
      { header: 'Auto-Submitted', key: 'auto_submitted' },
      { header: 'Score', key: 'score' },
      { header: 'Answers Recorded', key: 'answers_recorded' },
    ],
    BRAND.tabColors.quizzes
  );

  rows.forEach((r) => {
    sheet.addRow({
      code: userCode(r.user_id),
      id: r.id,
      username: r.username,
      quiz_title: r.quiz_title || '',
      contest_name: r.contest_name || '',
      started_at: r.started_at,
      submitted_at: r.submitted_at || '',
      auto_submitted: r.auto_submitted ? 'Yes' : 'No',
      score: r.score,
      answers_recorded: r.answers_recorded,
    });
  });

  finalizeSheet(sheet, 'code');
  return rows.length;
}

/**
 * One row per answer a user submitted — the most granular sheet in the
 * workbook. Question text is capped at 120 chars so the sheet stays
 * readable; the full question lives in the Quizzes/questions table.
 */
async function buildQuizAnswersSheet(workbook) {
  const { rows } = await query(
    `SELECT qa.id AS attempt_id, u.id AS user_id, u.username, qz.title AS quiz_title,
            ans.question_id, qs.question_text, ans.selected_options,
            qs.correct_options, ans.is_correct, ans.marks_obtained, ans.answered_at
     FROM quiz_answers ans
     JOIN quiz_attempts qa ON qa.id = ans.attempt_id
     JOIN users u ON u.id = qa.user_id
     JOIN questions qs ON qs.id = ans.question_id
     JOIN quizzes qz ON qz.id = qa.quiz_id
     ORDER BY ans.answered_at DESC`
  );

  const sheet = addSheet(
    workbook,
    'Quiz Answers (Detail)',
    [
      { header: 'User Code', key: 'code' },
      { header: 'Username', key: 'username' },
      { header: 'Quiz Title', key: 'quiz_title' },
      { header: 'Attempt ID', key: 'attempt_id' },
      { header: 'Question', key: 'question_text' },
      { header: 'Selected Option(s)', key: 'selected' },
      { header: 'Correct Option(s)', key: 'correct' },
      { header: 'Correct?', key: 'is_correct' },
      { header: 'Marks Obtained', key: 'marks_obtained' },
      { header: 'Answered At', key: 'answered_at' },
    ],
    BRAND.tabColors.quizzes
  );

  const toText = (v) => {
    if (Array.isArray(v)) return v.join(', ');
    if (v && typeof v === 'object') return JSON.stringify(v);
    return v ?? '';
  };

  rows.forEach((r) => {
    sheet.addRow({
      code: userCode(r.user_id),
      username: r.username,
      quiz_title: r.quiz_title,
      attempt_id: r.attempt_id,
      question_text: String(r.question_text || '').slice(0, 120),
      selected: toText(r.selected_options),
      correct: toText(r.correct_options),
      is_correct: r.is_correct === null ? '' : r.is_correct ? 'Yes' : 'No',
      marks_obtained: r.marks_obtained,
      answered_at: r.answered_at,
    });
  });

  finalizeSheet(sheet, 'code');

  sheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;
    const val = String(row.getCell('is_correct').value || '').toLowerCase();
    if (val === 'yes') row.getCell('is_correct').font = { color: { argb: 'FF15803D' }, bold: true };
    if (val === 'no') row.getCell('is_correct').font = { color: { argb: 'FFB91C1C' }, bold: true };
  });

  return rows.length;
}

async function buildDatabaseDetailsSheet(workbook) {
  const tables = [
    'users', 'profiles', 'refresh_tokens', 'points_transactions', 'quizzes',
    'questions', 'contest_templates', 'contests', 'contest_participants',
    'quiz_attempts', 'quiz_answers', 'badges', 'user_badges', 'notifications',
    'announcements', 'admin_logs', 'wallets', 'points_history',
    'reward_history', 'withdrawal_history', 'govt_jobs', 'current_affairs',
    'news_articles', 'news_bookmarks', 'coupons', 'coupon_redemptions',
    'proctoring_sessions', 'proctoring_events', 'payout_details'
  ];

  const sheet = addSheet(
    workbook,
    'Database Details',
    [
      { header: 'Table', key: 'table' },
      { header: 'Row Count', key: 'count' },
      { header: 'Status', key: 'status' },
    ],
    BRAND.tabColors.database
  );

  for (const table of tables) {
    try {
      const { rows } = await query(`SELECT COUNT(*) AS c FROM \`${table}\``);
      sheet.addRow({ table, count: rows[0]?.c ?? 0, status: 'OK' });
    } catch (err) {
      sheet.addRow({ table, count: 0, status: `Missing/Error: ${err.message}` });
    }
  }

  finalizeSheet(sheet, null);
  return tables.length;
}

async function buildUserEarningPointsSheet(workbook) {
  const { rows } = await query(
    `SELECT pt.id, pt.user_id, u.username, u.email, pt.amount, pt.type,
            pt.reference_id, pt.description, pt.created_at
     FROM points_transactions pt
     JOIN users u ON u.id = pt.user_id
     ORDER BY pt.created_at DESC`
  );

  const sheet = addSheet(
    workbook,
    'User Earning Points',
    [
      { header: 'User Code', key: 'code' },
      { header: 'User ID', key: 'user_id' },
      { header: 'Username', key: 'username' },
      { header: 'Email', key: 'email' },
      { header: 'Points Earned', key: 'amount' },
      { header: 'Earning Type', key: 'type' },
      { header: 'Description', key: 'description' },
      { header: 'Reference ID', key: 'reference_id' },
      { header: 'Earned Date', key: 'created_at' },
    ],
    BRAND.tabColors.points
  );

  rows.forEach((r) => {
    sheet.addRow({
      code: userCode(r.user_id),
      user_id: r.user_id,
      username: r.username,
      email: r.email,
      amount: r.amount,
      type: r.type,
      description: r.description || '',
      reference_id: r.reference_id || '',
      created_at: r.created_at,
    });
  });

  finalizeSheet(sheet, 'code');
  return rows.length;
}

async function buildGovtJobsSheet(workbook) {
  const { rows } = await query(
    `SELECT id, post_name, department, state, district, total_posts,
            eligibility, salary_scale, application_fee, age_limit, selection_process,
            open_date, last_date, official_notification_url, apply_online_url,
            is_featured, is_published, created_at
     FROM govt_jobs
     ORDER BY created_at DESC`
  );

  const sheet = addSheet(
    workbook,
    'Latest Govt Jobs',
    [
      { header: 'Job ID', key: 'id' },
      { header: 'Post Name', key: 'post_name' },
      { header: 'Department', key: 'department' },
      { header: 'State', key: 'state' },
      { header: 'District', key: 'district' },
      { header: 'Vacancies / Posts', key: 'total_posts' },
      { header: 'Eligibility', key: 'eligibility' },
      { header: 'Salary Scale', key: 'salary_scale' },
      { header: 'Fee / Info', key: 'application_fee' },
      { header: 'Age Limit', key: 'age_limit' },
      { header: 'Selection Process', key: 'selection_process' },
      { header: 'Start Date', key: 'open_date' },
      { header: 'Deadline', key: 'last_date' },
      { header: 'Featured', key: 'is_featured' },
      { header: 'Published', key: 'is_published' },
      { header: 'Notification Link', key: 'official_notification_url' },
      { header: 'Apply Link', key: 'apply_online_url' },
      { header: 'Created At', key: 'created_at' },
    ],
    BRAND.tabColors.govtJobs
  );

  rows.forEach((r) => {
    sheet.addRow({
      id: r.id,
      post_name: r.post_name,
      department: r.department || '',
      state: r.state || '',
      district: r.district || '',
      total_posts: r.total_posts || 0,
      eligibility: r.eligibility || '',
      salary_scale: r.salary_scale || '',
      application_fee: r.application_fee || '',
      age_limit: r.age_limit || '',
      selection_process: r.selection_process || '',
      open_date: r.open_date || '',
      last_date: r.last_date || '',
      is_featured: r.is_featured ? 'Yes' : 'No',
      is_published: r.is_published ? 'Yes' : 'No',
      official_notification_url: r.official_notification_url || '',
      apply_online_url: r.apply_online_url || '',
      created_at: r.created_at,
    });
  });

  finalizeSheet(sheet, null);
  return rows.length;
}

async function buildCurrentAffairsSheet(workbook) {
  const { rows } = await query(
    `SELECT id, title, category, summary, tags, exam_tags, is_featured,
            is_published, published_date, created_at
     FROM current_affairs
     ORDER BY published_date DESC, created_at DESC`
  );

  const sheet = addSheet(
    workbook,
    'Current Affairs',
    [
      { header: 'Article ID', key: 'id' },
      { header: 'Title', key: 'title' },
      { header: 'Category', key: 'category' },
      { header: 'Summary', key: 'summary' },
      { header: 'Exam Tags', key: 'exam_tags' },
      { header: 'Tags', key: 'tags' },
      { header: 'Featured', key: 'is_featured' },
      { header: 'Published', key: 'is_published' },
      { header: 'Published Date', key: 'published_date' },
      { header: 'Created At', key: 'created_at' },
    ],
    BRAND.tabColors.currentAffairs
  );

  rows.forEach((r) => {
    let examTags = r.exam_tags;
    if (typeof examTags === 'string') {
      try { examTags = JSON.parse(examTags); } catch (_) {}
    }
    let tags = r.tags;
    if (typeof tags === 'string') {
      try { tags = JSON.parse(tags); } catch (_) {}
    }

    sheet.addRow({
      id: r.id,
      title: r.title,
      category: r.category || 'General',
      summary: r.summary || '',
      exam_tags: Array.isArray(examTags) ? examTags.join(', ') : (examTags || ''),
      tags: Array.isArray(tags) ? tags.join(', ') : (tags || ''),
      is_featured: r.is_featured ? 'Yes' : 'No',
      is_published: r.is_published ? 'Yes' : 'No',
      published_date: r.published_date || '',
      created_at: r.created_at,
    });
  });

  finalizeSheet(sheet, null);
  return rows.length;
}

// ---------------------------------------------------------------------
// Public entry point
// ---------------------------------------------------------------------

/**
 * Builds the full backup workbook in memory and returns the ExcelJS
 * Workbook instance. Caller decides whether to stream it to an HTTP
 * response or write it to disk.
 */
async function buildBackupWorkbook() {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'DreamNexa Backup Service';
  workbook.created = new Date();

  const safeRun = async (fn, name) => {
    try {
      return await fn(workbook);
    } catch (err) {
      console.warn(`[ExcelBackup] Sheet '${name}' warning:`, err.message);
      return 0;
    }
  };

  const credentialCount = await safeRun(buildCredentialsSheet, 'Login Credentials');
  const userCount = await safeRun(buildUserDetailsSheet, 'User Details');
  const pointsCount = await safeRun(buildUserEarningPointsSheet, 'User Earning Points');
  const govtJobsCount = await safeRun(buildGovtJobsSheet, 'Latest Govt Jobs');
  const currentAffairsCount = await safeRun(buildCurrentAffairsSheet, 'Current Affairs');
  const quizCount = await safeRun(buildQuizzesSheet, 'Quizzes');
  const attemptCount = await safeRun(buildQuizAttemptsSheet, 'Quiz Attempts');
  const answerCount = await safeRun(buildQuizAnswersSheet, 'Quiz Answers (Detail)');
  const participantCount = await safeRun(buildContestParticipantsSheet, 'Contest Participants');
  const prizeCount = await safeRun(buildPrizeWinnersSheet, 'Prizes - Winners & Others');
  const tableCount = await safeRun(buildDatabaseDetailsSheet, 'Database Details');

  // The Index sheet needs accurate row counts, so it's built last
  await safeRun(
    (wb) =>
      buildIndexSheet(wb, {
        generatedAt: new Date().toISOString(),
        sheets: [
          { name: 'Login Credentials', contents: 'Username, email, mobile, bcrypt password hash, role, status', rows: credentialCount },
          { name: 'User Details', contents: 'Profile info, college, total points, contests won, referrals', rows: userCount },
          { name: 'User Earning Points', contents: 'Detailed point transaction history per user (daily login, quizzes, referrals)', rows: pointsCount },
          { name: 'Latest Govt Jobs', contents: 'All active government job notifications, vacancies, qualifications, deadlines', rows: govtJobsCount },
          { name: 'Current Affairs', contents: 'All published current affairs articles, summaries, categories', rows: currentAffairsCount },
          { name: 'Quizzes', contents: 'Quiz metadata, question counts, publish/proctoring flags', rows: quizCount },
          { name: 'Quiz Attempts', contents: 'Every started/submitted quiz attempt, per user, with score', rows: attemptCount },
          { name: 'Quiz Answers (Detail)', contents: 'Every individual answer submitted: question, selection, correctness, marks', rows: answerCount },
          { name: 'Contest Participants', contents: 'Every user\u2019s contest attempt, score, rank, badge', rows: participantCount },
          { name: 'Prizes - Winners & Others', contents: 'Contest ranks, reward credits, withdrawal outcomes', rows: prizeCount },
          { name: 'Database Details', contents: 'Row counts per table, for a quick integrity check', rows: tableCount },
        ],
      }),
    'Index'
  );

  return workbook;
}

module.exports = {
  userCode,
  buildBackupWorkbook,
};
