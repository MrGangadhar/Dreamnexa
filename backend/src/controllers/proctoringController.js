const { query, withTransaction } = require('../db/pool');
const { scoreEvent, classifyRisk } = require('../utils/proctoringEngine');

const PROCTORING_ENABLED = process.env.PROCTORING_ENABLED !== 'false';

/** Resolve the quiz_attempt row for {contestId, userId}, 403ing if it isn't theirs. */
async function loadOwnAttempt(contestId, userId) {
  const res = await query(
    `SELECT * FROM quiz_attempts WHERE contest_id = $1 AND user_id = $2`,
    [contestId, userId]
  );
  return res.rows[0] || null;
}

async function getOrCreateSession(client, attempt) {
  const existing = await client.query(
    `SELECT * FROM proctoring_sessions WHERE attempt_id = $1`,
    [attempt.id]
  );
  if (existing.rows[0]) return existing.rows[0];

  const created = await client.query(
    `INSERT INTO proctoring_sessions (attempt_id, user_id, contest_id)
     VALUES ($1, $2, $3) RETURNING *`,
    [attempt.id, attempt.user_id, attempt.contest_id]
  );
  return created.rows[0];
}

// POST /api/proctoring/:contestId/consent
async function submitConsent(req, res, next) {
  try {
    if (!PROCTORING_ENABLED) return res.json({ success: true, proctoringEnabled: false });

    const attempt = await loadOwnAttempt(req.params.contestId, req.user.id);
    if (!attempt) return res.status(404).json({ error: 'Quiz attempt not found. Start the quiz first.' });

    const { cameraGranted = false, microphoneGranted = false, privacyNoticeAcknowledged = false } = req.body;

    const session = await withTransaction(async (client) => {
      const s = await getOrCreateSession(client, attempt);
      const updated = await client.query(
        `UPDATE proctoring_sessions SET
           camera_granted = $1, microphone_granted = $2, privacy_notice_acknowledged = $3,
           consented_at = now()
         WHERE id = $4 RETURNING *`,
        [cameraGranted, microphoneGranted, privacyNoticeAcknowledged, s.id]
      );
      return updated.rows[0];
    });

    res.json({ success: true, session: publicSession(session) });
  } catch (err) {
    next(err);
  }
}

// POST /api/proctoring/:contestId/system-check
async function submitSystemCheck(req, res, next) {
  try {
    if (!PROCTORING_ENABLED) return res.json({ success: true, proctoringEnabled: false });

    const attempt = await loadOwnAttempt(req.params.contestId, req.user.id);
    if (!attempt) return res.status(404).json({ error: 'Quiz attempt not found. Start the quiz first.' });

    const {
      cameraOk = false, microphoneOk = false, faceDetectedOk = false,
      browserCompatibleOk = false, fullscreenOk = false,
    } = req.body;

    const session = await withTransaction(async (client) => {
      const s = await getOrCreateSession(client, attempt);
      const updated = await client.query(
        `UPDATE proctoring_sessions SET
           camera_ok = $1, microphone_ok = $2, face_detected_ok = $3,
           browser_compatible_ok = $4, fullscreen_ok = $5, system_check_completed_at = now()
         WHERE id = $6 RETURNING *`,
        [cameraOk, microphoneOk, faceDetectedOk, browserCompatibleOk, fullscreenOk, s.id]
      );
      return updated.rows[0];
    });

    res.json({ success: true, session: publicSession(session) });
  } catch (err) {
    next(err);
  }
}

// POST /api/proctoring/:contestId/events
async function ingestEvent(req, res, next) {
  try {
    if (!PROCTORING_ENABLED) return res.json({ success: true, showWarning: false });

    const { eventType, severity, confidence, metadata, occurrences } = req.body;
    if (!eventType || !severity) {
      return res.status(400).json({ error: 'eventType and severity are required.' });
    }
    const SEVERITIES = ['low', 'medium', 'high', 'critical'];
    if (!SEVERITIES.includes(severity)) {
      return res.status(400).json({ error: 'severity must be one of low, medium, high, critical.' });
    }
    const EVENT_TYPES = [
      'tab_switch', 'fullscreen_exit', 'copy_attempt', 'paste_attempt', 'cut_attempt',
      'select_all_attempt', 'context_menu_attempt', 'print_screen_attempt', 'visibility_change',
      'face_not_detected', 'multiple_faces_detected', 'gaze_deviation', 'camera_frame_absence',
      'camera_permission_removed', 'microphone_permission_removed', 'suspicious_voice_activity',
      'window_blur', 'devtools_suspected', 'other',
    ];
    if (!EVENT_TYPES.includes(eventType)) {
      return res.status(400).json({ error: `eventType must be one of: ${EVENT_TYPES.join(', ')}` });
    }

    const attempt = await loadOwnAttempt(req.params.contestId, req.user.id);
    if (!attempt) return res.status(404).json({ error: 'Quiz attempt not found.' });
    if (attempt.submitted_at) {
      // Quiz already submitted — ignore stray late events instead of erroring
      // out the client (e.g. a debounced blur event firing after submit).
      return res.json({ success: true, ignored: true });
    }

    const result = await withTransaction(async (client) => {
      const session = await getOrCreateSession(client, attempt);

      const priorRes = await client.query(
        `SELECT COUNT(*) AS c FROM proctoring_events WHERE session_id = $1 AND event_type = $2`,
        [session.id, eventType]
      );
      const priorCount = priorRes.rows[0].c;

      const contribution = scoreEvent(
        { eventType, severity, confidence: confidence ?? 1 },
        priorCount
      );

      await client.query(
        `INSERT INTO proctoring_events
           (session_id, attempt_id, user_id, event_type, severity, confidence, occurrences, metadata)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
        [
          session.id, attempt.id, req.user.id, eventType, severity,
          confidence ?? 1, occurrences || 1, JSON.stringify(metadata || {}),
        ]
      );

      const newRisk = Math.min(100, Math.round((session.risk_score + contribution) * 100) / 100);
      const severityColumn = `${severity}_count`;
      const updated = await client.query(
        `UPDATE proctoring_sessions SET
           risk_score = $1, total_events = total_events + 1,
           ${severityColumn} = ${severityColumn} + 1
         WHERE id = $2 RETURNING *`,
        [newRisk, session.id]
      );

      return updated.rows[0];
    });

    const band = classifyRisk(result.risk_score, {});

    // Best-effort live push to admin dashboards, if Socket.IO is mounted.
    const io = req.app.get('io');
    if (io) {
      const payload = {
        contestId: attempt.contest_id,
        userId: req.user.id,
        eventType,
        severity,
        riskScore: result.risk_score,
        band,
      };
      io.to('admins').emit('proctoring:event', payload);
      io.to(`contest:${attempt.contest_id}`).emit('proctoring:event', payload);
    }

    res.status(201).json({
      success: true,
      riskScore: result.risk_score,
      band, // NORMAL | WARNING | REVIEW_REQUIRED | REJECTION_CANDIDATE
      showWarning: band !== 'NORMAL',
    });
  } catch (err) {
    next(err);
  }
}

// GET /api/proctoring/:contestId/state
async function getSessionState(req, res, next) {
  try {
    if (!PROCTORING_ENABLED) return res.json({ success: true, proctoringEnabled: false });

    const attempt = await loadOwnAttempt(req.params.contestId, req.user.id);
    if (!attempt) return res.status(404).json({ error: 'Quiz attempt not found.' });

    const sessionRes = await query(`SELECT * FROM proctoring_sessions WHERE attempt_id = $1`, [attempt.id]);
    if (!sessionRes.rows[0]) {
      return res.json({ success: true, session: null });
    }
    res.json({ success: true, session: publicSession(sessionRes.rows[0]) });
  } catch (err) {
    next(err);
  }
}

function publicSession(session) {
  if (!session) return null;
  return {
    id: session.id,
    riskScore: session.risk_score,
    band: classifyRisk(session.risk_score, {}),
    totalEvents: session.total_events,
    violationCounts: {
      low: session.low_count,
      medium: session.medium_count,
      high: session.high_count,
      critical: session.critical_count,
    },
    status: session.status,
    finalStatus: session.final_status,
    consent: {
      cameraGranted: !!session.camera_granted,
      microphoneGranted: !!session.microphone_granted,
      privacyNoticeAcknowledged: !!session.privacy_notice_acknowledged,
    },
    systemCheck: {
      cameraOk: !!session.camera_ok,
      microphoneOk: !!session.microphone_ok,
      faceDetectedOk: !!session.face_detected_ok,
      browserCompatibleOk: !!session.browser_compatible_ok,
      fullscreenOk: !!session.fullscreen_ok,
    },
  };
}

// ── Admin / review endpoints ──────────────────────────────────────────

// GET /api/admin/proctoring/sessions?flagged=1
async function listSessions(req, res, next) {
  try {
    const { flagged } = req.query;
    const where = flagged
      ? `WHERE ps.final_status IN ('REVIEW_REQUIRED', 'REJECTED') OR (ps.status = 'in_progress' AND ps.risk_score >= 31)`
      : '';
    const result = await query(
      `SELECT ps.*, u.username, p.full_name, c.name AS contest_name
       FROM proctoring_sessions ps
       JOIN users u ON u.id = ps.user_id
       JOIN profiles p ON p.user_id = ps.user_id
       JOIN contests c ON c.id = ps.contest_id
       ${where}
       ORDER BY ps.risk_score DESC, ps.started_at DESC
       LIMIT 200`
    );
    res.json(result.rows.map(publicSession).map((s, i) => ({
      ...s,
      username: result.rows[i].username,
      fullName: result.rows[i].full_name,
      contestName: result.rows[i].contest_name,
      startedAt: result.rows[i].started_at,
      endedAt: result.rows[i].ended_at,
    })));
  } catch (err) {
    next(err);
  }
}

// GET /api/admin/proctoring/sessions/:id
async function getSessionDetail(req, res, next) {
  try {
    const sessionRes = await query(
      `SELECT ps.*, u.username, p.full_name, c.name AS contest_name
       FROM proctoring_sessions ps
       JOIN users u ON u.id = ps.user_id
       JOIN profiles p ON p.user_id = ps.user_id
       JOIN contests c ON c.id = ps.contest_id
       WHERE ps.id = $1`,
      [req.params.id]
    );
    const session = sessionRes.rows[0];
    if (!session) return res.status(404).json({ error: 'Proctoring session not found.' });

    const events = await query(
      `SELECT * FROM proctoring_events WHERE session_id = $1 ORDER BY created_at ASC`,
      [req.params.id]
    );

    res.json({
      session: {
        ...publicSession(session),
        username: session.username,
        fullName: session.full_name,
        contestName: session.contest_name,
        startedAt: session.started_at,
        endedAt: session.ended_at,
        finalReason: session.final_reason,
        reviewerDecision: session.reviewer_decision,
        reviewedAt: session.reviewed_at,
      },
      events: events.rows,
    });
  } catch (err) {
    next(err);
  }
}

// POST /api/admin/proctoring/sessions/:id/decision  { decision: 'confirmed' | 'dismissed' }
async function resolveReview(req, res, next) {
  try {
    const { decision } = req.body;
    if (!['confirmed', 'dismissed'].includes(decision)) {
      return res.status(400).json({ error: 'decision must be "confirmed" or "dismissed".' });
    }

    const result = await withTransaction(async (client) => {
      const sessionRes = await client.query(`SELECT * FROM proctoring_sessions WHERE id = $1`, [req.params.id]);
      const session = sessionRes.rows[0];
      if (!session) throw Object.assign(new Error('Session not found.'), { status: 404 });

      const updated = await client.query(
        `UPDATE proctoring_sessions SET
           reviewer_decision = $1, reviewed_by = $2, reviewed_at = now(),
           final_status = CASE WHEN $1 = 'dismissed' THEN 'PASSED' ELSE final_status END
         WHERE id = $3 RETURNING *`,
        [decision, req.user.id, session.id]
      );

      // If the admin confirms cheating, zero out the participant's score/rank
      // eligibility for this contest — never touches other contests/points.
      if (decision === 'confirmed') {
        await client.query(
          `UPDATE contest_participants SET score = 0 WHERE contest_id = $1 AND user_id = $2`,
          [session.contest_id, session.user_id]
        );
      }

      return updated.rows[0];
    });

    res.json({ success: true, session: publicSession(result) });
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message });
    next(err);
  }
}

module.exports = {
  PROCTORING_ENABLED,
  submitConsent,
  submitSystemCheck,
  ingestEvent,
  getSessionState,
  getOrCreateSession,
  publicSession,
  listSessions,
  getSessionDetail,
  resolveReview,
};
