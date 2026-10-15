/**
 * utils/webhookSync.js
 * ---------------------------------------------------------------------
 * Dispatches live event payloads to an external webhook URL
 * (e.g. Google Apps Script, Zapier, Make, Microsoft Power Automate,
 * or Excel Online) whenever quiz attempts or registrations occur.
 *
 * Configured via environment variables:
 *   - EXCEL_WEBHOOK_URL
 *   - SHEETS_WEBHOOK_URL
 * ---------------------------------------------------------------------
 */

'use strict';

async function notifyQuizSubmission(payload) {
  const webhookUrl = process.env.EXCEL_WEBHOOK_URL || process.env.SHEETS_WEBHOOK_URL;
  if (!webhookUrl) return;

  try {
    const body = {
      event: 'quiz_submitted',
      timestamp: new Date().toISOString(),
      studentName: payload.studentName || payload.username || 'Student',
      studentEmail: payload.email || '',
      college: payload.college || '',
      contestName: payload.contestName || '',
      quizTitle: payload.quizTitle || '',
      score: payload.score ?? 0,
      correctCount: payload.correctCount ?? 0,
      wrongCount: payload.wrongCount ?? 0,
      passed: !!payload.passed,
      timeTakenSeconds: payload.timeTakenSeconds ?? 0,
      submittedAt: payload.submittedAt || new Date().toISOString(),
    };

    if (typeof fetch === 'function') {
      fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      }).catch((err) => {
        console.warn('[WebhookSync] Webhook dispatch error:', err.message);
      });
    }
  } catch (err) {
    console.warn('[WebhookSync] Failed to post to webhook:', err.message);
  }
}

module.exports = {
  notifyQuizSubmission,
};
