/**
 * utils/googleSheetsSync.js
 * ---------------------------------------------------------------------
 * Gathers complete website data from MySQL across all modules:
 *   - Users & Student Profiles
 *   - Quiz Attempts & Student Scores
 *   - Contest Participants & Leaderboards
 *   - Contests Schedule & Status
 *   - Quizzes & Question Counts
 *   - Points Ledger & Transactions
 *   - Government Job Notifications
 *
 * Then packages everything into a multi-tab payload and sends it
 * to the Google Apps Script Webhook URL.
 * ---------------------------------------------------------------------
 */

'use strict';

const { query } = require('../db/pool');

function fmtDate(val) {
  if (!val) return '';
  try {
    return new Date(val).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
  } catch {
    return String(val);
  }
}

async function collectAllWebsiteData() {
  // 1. Users & Profiles
  const usersRes = await query(
    `SELECT u.id, u.username, u.email, u.mobile, p.full_name, p.college, p.university,
            p.state, p.city, p.referral_code, p.total_points, p.total_contests,
            p.contests_won, u.role, u.status, u.created_at
     FROM users u
     LEFT JOIN profiles p ON p.user_id = u.id
     ORDER BY u.created_at DESC`
  );
  const usersHeaders = [
    'User ID', 'Username', 'Full Name', 'Email', 'Mobile', 'College',
    'University', 'State', 'City', 'Referral Code', 'Total Points',
    'Total Contests', 'Contests Won', 'Role', 'Status', 'Registered At'
  ];
  const usersRows = usersRes.rows.map(u => [
    u.id, u.username || '', u.full_name || '', u.email || '', u.mobile || '',
    u.college || '', u.university || '', u.state || '', u.city || '',
    u.referral_code || '', Number(u.total_points || 0), Number(u.total_contests || 0),
    Number(u.contests_won || 0), u.role || 'student', u.status || 'active',
    fmtDate(u.created_at)
  ]);

  // 2. Quiz Attempts
  const attemptsRes = await query(
    `SELECT qa.id, u.username, u.email, p.full_name, p.college,
            c.name AS contest_name, q.title AS quiz_title, qa.score,
            cp.correct_count, cp.wrong_count, cp.time_taken_seconds,
            qa.auto_submitted, qa.started_at, qa.submitted_at
     FROM quiz_attempts qa
     JOIN users u ON u.id = qa.user_id
     LEFT JOIN profiles p ON p.user_id = u.id
     LEFT JOIN contests c ON c.id = qa.contest_id
     LEFT JOIN quizzes q ON q.id = qa.quiz_id
     LEFT JOIN contest_participants cp ON cp.contest_id = qa.contest_id AND cp.user_id = qa.user_id
     ORDER BY qa.started_at DESC`
  );
  const attemptsHeaders = [
    'Attempt ID', 'Student Name', 'Username', 'Email', 'College',
    'Contest Name', 'Quiz Title', 'Score', 'Correct', 'Wrong',
    'Time Taken (s)', 'Auto Submitted', 'Started At', 'Submitted At'
  ];
  const attemptsRows = attemptsRes.rows.map(a => [
    a.id, a.full_name || a.username || 'Student', a.username || '', a.email || '',
    a.college || '', a.contest_name || '', a.quiz_title || '',
    Number(a.score || 0), Number(a.correct_count || 0), Number(a.wrong_count || 0),
    Number(a.time_taken_seconds || 0), a.auto_submitted ? 'Yes' : 'No',
    fmtDate(a.started_at), fmtDate(a.submitted_at)
  ]);

  // 3. Contest Leaderboard & Participants
  const leaderboardRes = await query(
    `SELECT c.name AS contest_name, u.username, p.full_name, u.email, p.college,
            cp.score, cp.rank, cp.points_awarded, cp.badge_awarded, cp.joined_at
     FROM contest_participants cp
     JOIN contests c ON c.id = cp.contest_id
     JOIN users u ON u.id = cp.user_id
     LEFT JOIN profiles p ON p.user_id = u.id
     ORDER BY c.created_at DESC, cp.rank ASC`
  );
  const leaderboardHeaders = [
    'Contest Name', 'Student Name', 'Username', 'Email', 'College',
    'Rank', 'Score', 'Points Awarded', 'Badge', 'Joined At'
  ];
  const leaderboardRows = leaderboardRes.rows.map(l => [
    l.contest_name || '', l.full_name || l.username || '', l.username || '',
    l.email || '', l.college || '', l.rank || '—', Number(l.score || 0),
    Number(l.points_awarded || 0), l.badge_awarded || '—', fmtDate(l.joined_at)
  ]);

  // 4. Contests Schedule & Status
  const contestsRes = await query(
    `SELECT c.name, ct.name AS template_name, q.title AS quiz_title, c.status,
            c.starts_at, c.ends_at, c.current_participants, c.max_participants,
            c.entry_points_cost, c.created_at
     FROM contests c
     LEFT JOIN contest_templates ct ON ct.id = c.template_id
     LEFT JOIN quizzes q ON q.id = c.quiz_id
     ORDER BY c.created_at DESC`
  );
  const contestsHeaders = [
    'Contest Name', 'Template', 'Quiz Title', 'Status', 'Starts At',
    'Ends At', 'Current Participants', 'Max Seats', 'Entry Points Cost', 'Created At'
  ];
  const contestsRows = contestsRes.rows.map(c => [
    c.name || '', c.template_name || '', c.quiz_title || '', c.status || '',
    fmtDate(c.starts_at), fmtDate(c.ends_at), Number(c.current_participants || 0),
    Number(c.max_participants || 0), Number(c.entry_points_cost || 0),
    fmtDate(c.created_at)
  ]);

  // 5. Quizzes
  const quizzesRes = await query(
    `SELECT q.id, q.title, q.description, q.duration_minutes, q.negative_marking,
            q.passing_marks, q.proctoring_enabled, q.is_published, q.created_at,
            (SELECT COUNT(*) FROM questions WHERE quiz_id = q.id) AS question_count
     FROM quizzes q
     ORDER BY q.created_at DESC`
  );
  const quizzesHeaders = [
    'Quiz ID', 'Title', 'Description', 'Questions Count', 'Duration (min)',
    'Negative Marking', 'Passing Marks', 'AI Proctoring', 'Published', 'Created At'
  ];
  const quizzesRows = quizzesRes.rows.map(q => [
    q.id, q.title || '', q.description || '', Number(q.question_count || 0),
    Number(q.duration_minutes || 0), Number(q.negative_marking || 0),
    Number(q.passing_marks || 0), q.proctoring_enabled ? 'Enabled' : 'Disabled',
    q.is_published ? 'Yes' : 'No', fmtDate(q.created_at)
  ]);

  // 6. Points Ledger
  const pointsRes = await query(
    `SELECT pt.id, u.username, u.email, p.full_name, pt.amount, pt.type,
            pt.description, pt.created_at
     FROM points_transactions pt
     JOIN users u ON u.id = pt.user_id
     LEFT JOIN profiles p ON p.user_id = u.id
     ORDER BY pt.created_at DESC LIMIT 500`
  );
  const pointsHeaders = [
    'Transaction ID', 'Student Name', 'Username', 'Email',
    'Points Amount', 'Type', 'Description', 'Date'
  ];
  const pointsRows = pointsRes.rows.map(p => [
    p.id, p.full_name || p.username || '', p.username || '', p.email || '',
    Number(p.amount || 0), p.type || '', p.description || '', fmtDate(p.created_at)
  ]);

  // 7. Govt Jobs
  const jobsRes = await query(
    `SELECT post_name, department, state, total_posts, last_date,
            eligibility, age_limit, salary, apply_link, created_at
     FROM govt_jobs
     ORDER BY created_at DESC LIMIT 100`
  );
  const jobsHeaders = [
    'Post Name', 'Department', 'State', 'Total Posts', 'Last Date',
    'Eligibility', 'Age Limit', 'Salary', 'Apply Link', 'Created At'
  ];
  const jobsRows = jobsRes.rows.map(j => [
    j.post_name || '', j.department || '', j.state || '', Number(j.total_posts || 0),
    fmtDate(j.last_date), j.eligibility || '', j.age_limit || '',
    j.salary || '', j.apply_link || '', fmtDate(j.created_at)
  ]);

  return {
    type: 'full_backup',
    timestamp: new Date().toISOString(),
    sheets: {
      'Users': { headers: usersHeaders, rows: usersRows },
      'Quiz Attempts': { headers: attemptsHeaders, rows: attemptsRows },
      'Contest Leaderboard': { headers: leaderboardHeaders, rows: leaderboardRows },
      'Contests Schedule': { headers: contestsHeaders, rows: contestsRows },
      'Quizzes': { headers: quizzesHeaders, rows: quizzesRows },
      'Points Ledger': { headers: pointsHeaders, rows: pointsRows },
      'Govt Jobs': { headers: jobsHeaders, rows: jobsRows },
    },
    summary: {
      usersCount: usersRows.length,
      attemptsCount: attemptsRows.length,
      leaderboardCount: leaderboardRows.length,
      contestsCount: contestsRows.length,
      quizzesCount: quizzesRows.length,
      pointsCount: pointsRows.length,
      jobsCount: jobsRows.length,
    }
  };
}

async function syncAllDataToGoogleSheets(customWebhookUrl) {
  const webhookUrl = customWebhookUrl || process.env.EXCEL_WEBHOOK_URL || process.env.SHEETS_WEBHOOK_URL;
  if (!webhookUrl) {
    throw new Error('EXCEL_WEBHOOK_URL environment variable is not configured.');
  }

  const payload = await collectAllWebsiteData();

  const response = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const text = await response.text();
  let jsonResult = null;
  try {
    jsonResult = JSON.parse(text);
  } catch {
    jsonResult = { raw: text };
  }

  return {
    success: true,
    summary: payload.summary,
    response: jsonResult,
  };
}

module.exports = {
  collectAllWebsiteData,
  syncAllDataToGoogleSheets,
};
