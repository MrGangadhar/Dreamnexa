import { useCallback, useEffect, useRef, useState } from 'react';
import { proctoringApi } from '../api/proctoringApi';

/**
 * useProctoring
 * ---------------------------------------------------------------------------
 * Client-side monitoring/detection surface for a single active quiz attempt
 * (keyed by contestId, since that's how DreamNexa's quiz routes work).
 *
 * IMPORTANT: this hook only *detects and reports* signals. All authoritative
 * risk scoring, thresholds, and pass/review/reject decisions happen
 * server-side in backend/src/utils/proctoringEngine.js. Nothing here can, by
 * itself, fail a student — it only sends events and surfaces warnings.
 *
 * What this does NOT claim: these are deterrents and monitoring signals, not
 * a guarantee against screenshots or a second device used out of camera view.
 */
export function useProctoring({ contestId, enabled }) {
  const [warning, setWarning] = useState(null); // { message, band } — transient banner
  const [violationCount, setViolationCount] = useState(0);
  const [riskBand, setRiskBand] = useState('NORMAL');
  const audioCtxRef = useRef(null);
  const analyserRef = useRef(null);
  const voiceIntervalRef = useRef(null);
  const gazeAwayStartRef = useRef(null);

  const reportEvent = useCallback(
    async (eventType, severity, extra = {}) => {
      if (!enabled || !contestId) return;
      try {
        const data = await proctoringApi.reportEvent(contestId, {
          eventType,
          severity,
          confidence: extra.confidence ?? 1,
          metadata: extra.metadata || {},
        });
        setViolationCount((c) => c + 1);
        if (data.band) setRiskBand(data.band);
        if (data.showWarning) {
          setWarning({ message: warningMessageFor(eventType, data.band), band: data.band });
        }
      } catch (err) {
        // Network hiccups shouldn't crash the quiz UI; the server is the source
        // of truth and re-syncs on the next successful event.
        console.warn('[Proctoring] Failed to report event', eventType, err.message);
      }
    },
    [contestId, enabled]
  );

  const dismissWarning = useCallback(() => setWarning(null), []);

  // --- Question protection (deterministic browser events) ---
  useEffect(() => {
    if (!enabled) return;

    const onCopy = (e) => {
      e.preventDefault();
      reportEvent('copy_attempt', 'medium');
    };
    const onCut = (e) => {
      e.preventDefault();
      reportEvent('cut_attempt', 'medium');
    };
    const onPaste = (e) => {
      e.preventDefault();
      reportEvent('paste_attempt', 'medium');
    };
    const onContextMenu = (e) => {
      e.preventDefault();
      reportEvent('context_menu_attempt', 'low');
    };
    const onSelectStart = (e) => e.preventDefault();

    const onKeyDown = (e) => {
      const key = e.key?.toLowerCase();
      const ctrlOrCmd = e.ctrlKey || e.metaKey;

      if (ctrlOrCmd && key === 'c') {
        e.preventDefault();
        reportEvent('copy_attempt', 'medium', { metadata: { via: 'shortcut' } });
      } else if (ctrlOrCmd && key === 'v') {
        e.preventDefault();
        reportEvent('paste_attempt', 'medium', { metadata: { via: 'shortcut' } });
      } else if (ctrlOrCmd && key === 'x') {
        e.preventDefault();
        reportEvent('cut_attempt', 'medium', { metadata: { via: 'shortcut' } });
      } else if (ctrlOrCmd && key === 'a') {
        e.preventDefault();
        reportEvent('select_all_attempt', 'low', { metadata: { via: 'shortcut' } });
      } else if ((ctrlOrCmd && e.shiftKey && ['i', 'j', 'c'].includes(key)) || key === 'f12') {
        reportEvent('devtools_suspected', 'high', { metadata: { via: 'shortcut' } });
      } else if (key === 'printscreen') {
        reportEvent('print_screen_attempt', 'medium', { metadata: { via: 'keydown' } });
      }
    };

    document.addEventListener('copy', onCopy);
    document.addEventListener('cut', onCut);
    document.addEventListener('paste', onPaste);
    document.addEventListener('contextmenu', onContextMenu);
    document.addEventListener('selectstart', onSelectStart);
    document.addEventListener('keydown', onKeyDown);
    document.documentElement.classList.add('quiz-locked');

    return () => {
      document.removeEventListener('copy', onCopy);
      document.removeEventListener('cut', onCut);
      document.removeEventListener('paste', onPaste);
      document.removeEventListener('contextmenu', onContextMenu);
      document.removeEventListener('selectstart', onSelectStart);
      document.removeEventListener('keydown', onKeyDown);
      document.documentElement.classList.remove('quiz-locked');
    };
  }, [enabled, reportEvent]);

  // --- Tab switch / visibility / fullscreen exit / window blur ---
  useEffect(() => {
    if (!enabled) return;

    const onVisibilityChange = () => {
      if (document.hidden) {
        reportEvent('tab_switch', 'high');
      } else {
        reportEvent('visibility_change', 'low', { metadata: { state: 'returned' } });
      }
    };
    const onFullscreenChange = () => {
      if (!document.fullscreenElement) {
        reportEvent('fullscreen_exit', 'high');
      }
    };
    const onBlur = () => reportEvent('window_blur', 'medium');

    document.addEventListener('visibilitychange', onVisibilityChange);
    document.addEventListener('fullscreenchange', onFullscreenChange);
    window.addEventListener('blur', onBlur);

    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange);
      document.removeEventListener('fullscreenchange', onFullscreenChange);
      window.removeEventListener('blur', onBlur);
    };
  }, [enabled, reportEvent]);

  // --- Voice activity monitoring (Web Audio API amplitude/VAD) ---
  // Lightweight energy-based voice activity detector, runs entirely in-browser.
  // Only a confidence score + event is sent to the server — raw audio never leaves the device.
  const startVoiceMonitoring = useCallback(
    async (stream) => {
      try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        const audioCtx = new AudioContext();
        const source = audioCtx.createMediaStreamSource(stream);
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 2048;
        source.connect(analyser);
        audioCtxRef.current = audioCtx;
        analyserRef.current = analyser;

        const data = new Uint8Array(analyser.frequencyBinCount);
        let sustainedLoudFrames = 0;

        voiceIntervalRef.current = setInterval(() => {
          analyser.getByteTimeDomainData(data);
          let sumSquares = 0;
          for (let i = 0; i < data.length; i++) {
            const centered = (data[i] - 128) / 128;
            sumSquares += centered * centered;
          }
          const rms = Math.sqrt(sumSquares / data.length);

          const SPEECH_THRESHOLD = 0.06; // tuned conservatively to avoid flagging normal ambient noise
          if (rms > SPEECH_THRESHOLD) {
            sustainedLoudFrames += 1;
          } else {
            sustainedLoudFrames = 0;
          }

          // Require ~1.5s of sustained audio above threshold before treating it as a
          // possible-voice signal — avoids single-frame false positives (a cough, a door).
          if (sustainedLoudFrames === 15) {
            const confidence = Math.min(0.9, 0.5 + rms);
            reportEvent('suspicious_voice_activity', confidence > 0.75 ? 'high' : 'medium', {
              confidence,
              metadata: { detector: 'client-side-vad-amplitude' },
            });
            sustainedLoudFrames = 0;
          }
        }, 100);
      } catch (err) {
        console.warn('[Proctoring] Voice monitoring unavailable:', err.message);
      }
    },
    [reportEvent]
  );

  const stopVoiceMonitoring = useCallback(() => {
    if (voiceIntervalRef.current) clearInterval(voiceIntervalRef.current);
    if (audioCtxRef.current) audioCtxRef.current.close().catch(() => {});
    voiceIntervalRef.current = null;
    audioCtxRef.current = null;
  }, []);

  // --- Face/gaze monitoring hook point ---
  // Wire your model's per-frame result into handleFaceFrameResult; see
  // utils/faceDetection.js for the optional face-api.js-based implementation.
  // Expected shape: { faceCount: number, gazeOffScreen: boolean, confidence: number }
  const handleFaceFrameResult = useCallback(
    (result) => {
      if (!result) return;

      if (result.faceCount === 0) {
        reportEvent('face_not_detected', 'medium', { confidence: result.confidence ?? 0.8 });
      } else if (result.faceCount > 1) {
        reportEvent('multiple_faces_detected', 'critical', {
          confidence: result.confidence ?? 0.9,
          metadata: { faceCount: result.faceCount },
        });
      }

      if (result.gazeOffScreen) {
        if (!gazeAwayStartRef.current) gazeAwayStartRef.current = Date.now();
        const awayMs = Date.now() - gazeAwayStartRef.current;
        if (awayMs > 3000) {
          reportEvent('gaze_deviation', 'low', { confidence: result.confidence ?? 0.6, metadata: { awayMs } });
          gazeAwayStartRef.current = Date.now();
        }
      } else {
        gazeAwayStartRef.current = null;
      }
    },
    [reportEvent]
  );

  useEffect(() => stopVoiceMonitoring, [stopVoiceMonitoring]);

  return {
    warning,
    dismissWarning,
    violationCount,
    riskBand,
    reportEvent,
    startVoiceMonitoring,
    stopVoiceMonitoring,
    handleFaceFrameResult,
  };
}

function warningMessageFor(eventType, band) {
  const labels = {
    tab_switch: 'You switched away from the quiz tab.',
    fullscreen_exit: 'You exited fullscreen mode.',
    copy_attempt: 'Copying quiz content is not allowed.',
    paste_attempt: 'Pasting is not allowed during the quiz.',
    cut_attempt: 'Cutting content is not allowed during the quiz.',
    context_menu_attempt: 'Right-click is disabled during the quiz.',
    select_all_attempt: 'Select-all is restricted during the quiz.',
    print_screen_attempt: 'A screenshot attempt was logged.',
    suspicious_voice_activity: 'Possible talking detected during the exam.',
    face_not_detected: 'Your face was not visible to the camera.',
    multiple_faces_detected: 'More than one face was detected.',
    gaze_deviation: 'You appear to be looking away from the screen repeatedly.',
    window_blur: 'The quiz window lost focus.',
    devtools_suspected: 'Developer tools activity was detected.',
  };
  const base = labels[eventType] || 'A proctoring event was detected.';
  if (band === 'REVIEW_REQUIRED' || band === 'REJECTION_CANDIDATE') {
    return `${base} This session has been flagged for review.`;
  }
  return base;
}
