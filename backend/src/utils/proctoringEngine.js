/**
 * Proctoring Decision Engine
 * ---------------------------------------------------------------------------
 * Rule-based + confidence-weighted risk scoring for exam integrity signals.
 * Ported from the standalone ai-quiz-proctor project's utils/proctoringEngine.js.
 *
 * Design goals (unchanged from the original):
 *  - Never reject on a single weak/uncertain signal.
 *  - Combine multiple independent signals into one overall risk score (0-100).
 *  - Output is always "evidence", not "confirmed cheating" — a REJECTED
 *    final status still allows manual admin review (see reviewer_decision).
 * ---------------------------------------------------------------------------
 */

const BASE_WEIGHTS = {
  tab_switch: 8,
  fullscreen_exit: 10,
  copy_attempt: 6,
  paste_attempt: 6,
  cut_attempt: 6,
  select_all_attempt: 3,
  context_menu_attempt: 2,
  print_screen_attempt: 7,
  visibility_change: 5,
  face_not_detected: 6,
  multiple_faces_detected: 14,
  gaze_deviation: 4,
  camera_frame_absence: 9,
  camera_permission_removed: 15,
  microphone_permission_removed: 12,
  suspicious_voice_activity: 10,
  window_blur: 4,
  devtools_suspected: 12,
  other: 3,
};

const SEVERITY_MULTIPLIER = { low: 0.6, medium: 1.0, high: 1.5, critical: 2.2 };

// Diminishing returns per repeated event type so e.g. 50 tiny blur events
// don't mathematically dominate the score the way a few independent signals should.
function diminishingReturns(occurrenceIndex) {
  return 1 / Math.sqrt(occurrenceIndex);
}

/** Risk contribution of one incoming event, given prior occurrences of the same type. */
function scoreEvent(event, priorCountOfSameType) {
  const baseWeight = BASE_WEIGHTS[event.eventType] ?? BASE_WEIGHTS.other;
  const severityMult = SEVERITY_MULTIPLIER[event.severity] ?? 1.0;
  const confidence = typeof event.confidence === 'number' ? Math.min(Math.max(event.confidence, 0), 1) : 1;
  const occurrenceIndex = priorCountOfSameType + 1;
  const decay = diminishingReturns(occurrenceIndex);
  const contribution = baseWeight * severityMult * confidence * decay;
  return Math.round(contribution * 100) / 100;
}

/** Classify a numeric risk score into a band using policy thresholds. */
function classifyRisk(riskScore, policy = {}) {
  if (riskScore >= (policy.riskRejectThreshold ?? 81)) return 'REJECTION_CANDIDATE';
  if (riskScore >= (policy.riskReviewThreshold ?? 61)) return 'REVIEW_REQUIRED';
  if (riskScore >= (policy.riskWarningThreshold ?? 31)) return 'WARNING';
  return 'NORMAL';
}

/**
 * Final decision at quiz submission time. Combines risk band + evidence
 * sufficiency (never rejects on one weak signal).
 */
function finalDecision({ riskScore, severityCounts, distinctEventTypesTriggered, policy = {} }) {
  const band = classifyRisk(riskScore, policy);
  const highOrCriticalCount = (severityCounts.high || 0) + (severityCounts.critical || 0);
  const minEvidence = policy.minEvidenceForRejection ?? 3;
  const hasSufficientEvidence = highOrCriticalCount >= minEvidence && distinctEventTypesTriggered >= 2;

  let finalStatus;
  let reason = '';

  if (band === 'REJECTION_CANDIDATE' && hasSufficientEvidence) {
    finalStatus = 'REJECTED';
    reason = `Multiple high-confidence proctoring violations were detected during the session (risk score ${riskScore}/100, ${highOrCriticalCount} high/critical-severity events across ${distinctEventTypesTriggered} categories). Subject to manual review.`;
  } else if (band === 'REJECTION_CANDIDATE' || band === 'REVIEW_REQUIRED') {
    finalStatus = 'REVIEW_REQUIRED';
    reason = `Session flagged for manual review (risk score ${riskScore}/100). Automated evidence threshold for rejection was not conclusively met, so a human reviewer must confirm the outcome.`;
  } else {
    finalStatus = 'PASSED';
    reason = '';
  }

  return { finalStatus, band, reason };
}

module.exports = { BASE_WEIGHTS, SEVERITY_MULTIPLIER, scoreEvent, classifyRisk, finalDecision };
