import { useEffect, useRef, useState } from 'react';
import { proctoringApi } from '../../api/proctoringApi';
import { loadFaceModels, detectFaceFrame } from '../../utils/faceDetection';

/**
 * Shown before a proctored quiz starts. Walks the student through:
 *   1) Privacy notice + consent (camera/mic access, what is/isn't recorded)
 *   2) A live system check (camera preview, mic level, face visible, fullscreen)
 * Only calls onReady() once consent + system check are both submitted —
 * QuizPlay.jsx doesn't render the actual quiz until then.
 */
export default function ProctoringGate({ contestId, onReady, onSkip }) {
  const [step, setStep] = useState('consent'); // 'consent' | 'check' | 'error'
  const [cameraGranted, setCameraGranted] = useState(false);
  const [microphoneGranted, setMicrophoneGranted] = useState(false);
  const [acknowledged, setAcknowledged] = useState(false);
  const [checking, setChecking] = useState(false);
  const [checks, setChecks] = useState({
    cameraOk: false, microphoneOk: false, faceDetectedOk: false,
    browserCompatibleOk: false, fullscreenOk: false,
  });
  const [errorMsg, setErrorMsg] = useState('');
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    setChecks((c) => ({
      ...c,
      browserCompatibleOk: !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia && document.documentElement.requestFullscreen),
    }));
    return () => {
      if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
    };
  }, []);

  async function acceptConsent() {
    if (!acknowledged) return;
    try {
      await proctoringApi.submitConsent(contestId, {
        cameraGranted: true,
        microphoneGranted: true,
        privacyNoticeAcknowledged: true,
      });
    } catch {
      // Non-fatal — the session record still gets created the first time an
      // event is reported; consent flags just won't be pre-filled.
    }
    setStep('check');
    startSystemCheck();
  }

  async function startSystemCheck() {
    setChecking(true);
    setErrorMsg('');
    try {
      // IMPORTANT: plain `audio: true` lets the browser apply its default
      // constraints, which on most phones/laptops include echoCancellation.
      // That's designed for voice calls — it treats sound coming out of the
      // device's OWN speaker as "echo" and actively cancels it out of the
      // mic signal. That's exactly the scenario a proctor needs to catch
      // (e.g. a song or another device's audio playing near the mic), so
      // the previous default silently zeroed out the very thing being
      // monitored. Request raw, unprocessed audio instead.
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        },
      });
      streamRef.current = stream;
      setCameraGranted(true);
      setMicrophoneGranted(true);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
      }
      setChecks((c) => ({ ...c, cameraOk: true, microphoneOk: true }));

      // Best-effort face detection — silently no-ops if model files aren't
      // present under /public/models (see README "Face detection setup").
      const loaded = await loadFaceModels();
      if (loaded && videoRef.current) {
        const result = await detectFaceFrame(videoRef.current);
        setChecks((c) => ({ ...c, faceDetectedOk: !!result && result.faceCount === 1 }));
      } else {
        // Can't verify a face is visible without the model — don't block on it.
        setChecks((c) => ({ ...c, faceDetectedOk: true }));
      }
    } catch (err) {
      setErrorMsg(
        err.name === 'NotAllowedError'
          ? 'Camera and microphone access were denied. Please allow access in your browser settings and retry.'
          : `Could not access camera/microphone: ${err.message}`
      );
    } finally {
      setChecking(false);
    }
  }

  async function enterFullscreenAndBegin() {
    try {
      await document.documentElement.requestFullscreen?.();
      setChecks((c) => ({ ...c, fullscreenOk: true }));
    } catch {
      // Some browsers/devices don't support fullscreen (e.g. iOS Safari) —
      // proceed anyway rather than blocking the student entirely.
    }

    try {
      await proctoringApi.submitSystemCheck(contestId, {
        cameraOk: checks.cameraOk,
        microphoneOk: checks.microphoneOk,
        faceDetectedOk: checks.faceDetectedOk,
        browserCompatibleOk: checks.browserCompatibleOk,
        fullscreenOk: true,
      });
    } catch {
      // Non-fatal.
    }

    if (streamRef.current) {
      onReady(streamRef.current);
    } else {
      onReady(null);
    }
  }

  const allChecksPassed = checks.cameraOk && checks.microphoneOk && checks.browserCompatibleOk;

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'var(--bg-modal)',
        backdropFilter: 'blur(4px)',
        padding: 20,
      }}
    >
      <div
        className="card"
        style={{
          width: '100%', maxWidth: 480,
          padding: 28,
          background: 'var(--bg-card)',
          boxShadow: 'var(--shadow-lg)',
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
      >
        {step === 'consent' && (
          <>
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 20, color: 'var(--text-primary)' }}>
              🛡️ AI Proctoring — Before You Begin
            </h2>
            <p style={{ marginTop: 8, fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              This contest uses automated proctoring to help keep results fair for everyone. While you take the
              quiz we will:
            </p>
            <ul style={{ marginTop: 12, paddingLeft: 20, fontSize: 14, color: 'var(--text-primary)', lineHeight: 1.7, listStyle: 'disc' }}>
              <li>Ask for camera &amp; microphone access, used only to check a face is present and to detect talking</li>
              <li>Watch for tab switches, exiting fullscreen, and copy/paste attempts</li>
              <li><strong>No video or audio is ever recorded or uploaded</strong> — only short derived signals (e.g. "face not visible") are sent</li>
              <li>A risk score is calculated automatically; only unusual sessions are ever shown to an admin for manual review</li>
            </ul>
            <label style={{ marginTop: 18, display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 14, color: 'var(--text-primary)', cursor: 'pointer' }}>
              <input
                type="checkbox"
                style={{ marginTop: 3, width: 16, height: 16, accentColor: 'var(--accent)', flexShrink: 0 }}
                checked={acknowledged}
                onChange={(e) => setAcknowledged(e.target.checked)}
              />
              I understand and agree to camera/microphone-based proctoring for this contest.
            </label>
            <div style={{ marginTop: 22, display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
              {onSkip && (
                <button onClick={onSkip} className="btn btn-ghost">
                  Cancel
                </button>
              )}
              <button
                onClick={acceptConsent}
                disabled={!acknowledged}
                className="btn btn-primary"
              >
                Continue to System Check
              </button>
            </div>
          </>
        )}

        {step === 'check' && (
          <>
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 20, color: 'var(--text-primary)' }}>
              System Check
            </h2>

            {/* Camera stays on (needed for face detection) but the raw feed
                is never shown to the student — only a status indicator. The
                video element is kept mounted and playing off-screen rather
                than display:none, since some browsers pause frame decoding
                on display:none elements, which would break detection. */}
            <video
              ref={videoRef}
              muted
              playsInline
              aria-hidden="true"
              style={{ position: 'absolute', width: 1, height: 1, opacity: 0, pointerEvents: 'none' }}
            />
            <div
              style={{
                marginTop: 12, width: '100%',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                gap: 10, padding: '28px 16px',
                borderRadius: 'var(--radius-card)',
                background: 'var(--bg-raised)', border: '1px solid var(--border)',
              }}
            >
              <span
                style={{
                  width: 44, height: 44, borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 20,
                  background: checks.cameraOk ? 'var(--accent-green-soft)' : 'var(--border)',
                  color: checks.cameraOk ? 'var(--accent-green)' : 'var(--text-muted)',
                }}
              >
                📷
              </span>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: checks.cameraOk ? 'var(--accent-green)' : 'var(--text-secondary)' }}>
                {checks.cameraOk ? 'Camera active — your feed is not shown' : 'Waiting for camera access…'}
              </p>
              <p style={{ margin: 0, fontSize: 12, color: 'var(--text-muted)', textAlign: 'center' }}>
                We only check that a face is visible — no video is displayed, recorded, or uploaded.
              </p>
            </div>
            {errorMsg && (
              <p style={{ marginTop: 12, fontSize: 13, color: 'var(--accent)' }}>{errorMsg}</p>
            )}
            <ul style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 8, fontSize: 14, listStyle: 'none', padding: 0 }}>
              <CheckRow label="Camera" ok={checks.cameraOk} />
              <CheckRow label="Microphone" ok={checks.microphoneOk} />
              <CheckRow label="Browser compatibility" ok={checks.browserCompatibleOk} />
            </ul>
            <div style={{ marginTop: 22, display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
              {!streamRef.current && !checking && (
                <button onClick={startSystemCheck} className="btn btn-ghost">
                  Retry
                </button>
              )}
              <button
                onClick={enterFullscreenAndBegin}
                disabled={!allChecksPassed || checking}
                className="btn btn-primary"
              >
                {checking ? 'Checking…' : 'Enter Fullscreen & Begin Quiz'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function CheckRow({ label, ok }) {
  return (
    <li style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <span
        style={{
          display: 'inline-block', width: 8, height: 8, borderRadius: '50%',
          background: ok ? 'var(--accent-green)' : 'var(--border-dark)',
          flexShrink: 0,
        }}
      />
      <span style={{ color: ok ? 'var(--text-primary)' : 'var(--text-muted)' }}>{label}</span>
    </li>
  );
}
