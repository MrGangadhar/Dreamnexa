/**
 * QuizPlay.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Full quiz-taking screen with:
 *  - Answer persistence via sessionStorage (survives page refresh)
 *  - Question navigator (click to jump to any question)
 *  - Timer with auto-submit on expiry
 *  - Proper submit: prevent double-submit, clear storage on success
 *  - Full result screen with score, correct/wrong, percentage, and points
 */
import { useEffect, useRef, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import client from '../api/client';
import { useProctoring } from '../hooks/useProctoring';
import ProctoringGate from '../components/proctoring/ProctoringGate';
import ProctoringWarningBanner from '../components/proctoring/ProctoringWarningBanner';
import { detectFaceFrame, areFaceModelsLoaded } from '../utils/faceDetection';

// ─── Storage helpers ──────────────────────────────────────────────────────────
function getStorageKey(contestId) {
  return `quiz_answers_${contestId}`;
}
function loadSavedAnswers(contestId) {
  try {
    const raw = sessionStorage.getItem(getStorageKey(contestId));
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}
function saveAnswers(contestId, answers) {
  try {
    sessionStorage.setItem(getStorageKey(contestId), JSON.stringify(answers));
  } catch {
    // Storage quota exceeded — fail silently
  }
}
function clearSavedAnswers(contestId) {
  try {
    sessionStorage.removeItem(getStorageKey(contestId));
  } catch {
    // ignore
  }
}

export default function QuizPlay() {
  const { contestId } = useParams();
  const navigate = useNavigate();

  // Load saved answers from sessionStorage immediately so they survive refresh
  const [data, setData] = useState(null);
  const [answers, setAnswers] = useState(() => loadSavedAnswers(contestId));
  const [secondsLeft, setSecondsLeft] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [currentQ, setCurrentQ] = useState(0);
  const [loadError, setLoadError] = useState(null);
  const [proctoringReady, setProctoringReady] = useState(false);
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);

  const submittedRef = useRef(false);
  const videoStreamRef = useRef(null);
  const hiddenVideoRef = useRef(null);
  const faceCheckIntervalRef = useRef(null);

  const proctoringEnabled = !!data?.quiz?.proctoringEnabled;
  const proctoring = useProctoring({ contestId, enabled: proctoringEnabled && proctoringReady });

  // ─── Submit ────────────────────────────────────────────────────────────────
  const submit = useCallback(async (autoSubmitted = false) => {
    if (submittedRef.current) return;
    submittedRef.current = true;
    setSubmitting(true);

    const payload = Object.entries(answers).map(([questionId, selectedOptions]) => ({
      questionId,
      selectedOptions,
    }));

    try {
      const { data: res } = await client.post(`/quiz/${contestId}/submit`, {
        answers: payload,
        autoSubmitted,
      });
      clearSavedAnswers(contestId); // clean up storage on success
      setResult(res);
      proctoring.stopVoiceMonitoring?.();
      if (faceCheckIntervalRef.current) clearInterval(faceCheckIntervalRef.current);
      if (videoStreamRef.current) videoStreamRef.current.getTracks().forEach(t => t.stop());
      if (document.fullscreenElement) document.exitFullscreen?.().catch(() => {});
    } catch (err) {
      submittedRef.current = false; // allow retry
      const msg = err.response?.data?.error || 'Submission failed. Please try again.';
      if (err.response?.status === 409) {
        // Already submitted — show styled modal instead of a jarring browser alert
        setAlreadySubmitted(true);
      } else {
        alert(msg);
      }
    } finally {
      setSubmitting(false);
    }
  }, [answers, contestId, navigate, proctoring]);

  // ─── Load quiz data ────────────────────────────────────────────────────────
  useEffect(() => {
    client.get(`/quiz/${contestId}/play`)
      .then(({ data: d }) => {
        setData(d);
        if (d.contestEndsAt) {
          const end = new Date(d.contestEndsAt).getTime();
          setSecondsLeft(Math.max(0, Math.round((end - Date.now()) / 1000)));
        } else {
          setSecondsLeft(d.quiz.duration_minutes * 60);
        }
      })
      .catch(err => {
        const msg = err.response?.data?.error || 'Failed to load quiz. Please go back and try again.';
        setLoadError(msg);
      });
  }, [contestId]);

  // ─── Timer countdown ───────────────────────────────────────────────────────
  useEffect(() => {
    if (secondsLeft === null || result || loadError) return;
    if (proctoringEnabled && !proctoringReady) return;
    if (secondsLeft <= 0) {
      submit(true);
      return;
    }
    const t = setTimeout(() => setSecondsLeft(s => s - 1), 1000);
    return () => clearTimeout(t);
  }, [secondsLeft, result, submit, proctoringEnabled, proctoringReady, loadError]);

  // ─── Proctoring callbacks ──────────────────────────────────────────────────
  const onProctoringReady = useCallback((stream) => {
    setProctoringReady(true);
    videoStreamRef.current = stream;
    if (!stream) return;

    proctoring.startVoiceMonitoring?.(stream);

    if (areFaceModelsLoaded()) {
      const video = document.createElement('video');
      video.srcObject = stream;
      video.muted = true;
      video.playsInline = true;
      video.play().catch(() => {});
      hiddenVideoRef.current = video;
      faceCheckIntervalRef.current = setInterval(async () => {
        const res = await detectFaceFrame(video);
        proctoring.handleFaceFrameResult?.(res);
      }, 4000);
    }
  }, [proctoring]);

  useEffect(() => () => {
    if (faceCheckIntervalRef.current) clearInterval(faceCheckIntervalRef.current);
  }, []);

  // ─── Answer selection with auto-save ──────────────────────────────────────
  const toggleOption = (questionId, optionId, multi) => {
    setAnswers(prev => {
      const current = new Set(prev[questionId] || []);
      if (multi) {
        current.has(optionId) ? current.delete(optionId) : current.add(optionId);
      } else {
        current.clear();
        current.add(optionId);
      }
      const next = { ...prev, [questionId]: [...current] };
      saveAnswers(contestId, next); // persist every change
      return next;
    });
  };

  // ─── Already-submitted modal ───────────────────────────────────────────────
  if (alreadySubmitted) {
    return (
      <div style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(0,0,0,0.65)',
        backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 20,
      }}>
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: 20,
          padding: '40px 32px',
          maxWidth: 420, width: '100%',
          textAlign: 'center',
          boxShadow: '0 24px 64px rgba(0,0,0,0.4)',
          animation: 'fadeSlideIn 0.25s ease',
        }}>
          <style>{`
            @keyframes fadeSlideIn {
              from { opacity: 0; transform: translateY(20px) scale(0.96); }
              to   { opacity: 1; transform: translateY(0) scale(1); }
            }
          `}</style>

          <div style={{ fontSize: 56, marginBottom: 16 }}>✅</div>
          <h2 style={{ margin: '0 0 8px', color: 'var(--text-primary)', fontSize: 22, fontWeight: 800 }}>
            Already Submitted!
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.6, margin: '0 0 28px' }}>
            You have already submitted this quiz. Your answers have been recorded and
            the results will be available once all participants finish.
          </p>

          <div style={{
            background: 'rgba(16,185,129,0.1)',
            border: '1px solid rgba(16,185,129,0.25)',
            borderRadius: 12,
            padding: '12px 16px',
            marginBottom: 24,
            fontSize: 13,
            color: 'var(--accent-green)',
            fontWeight: 600,
          }}>
            ⏳ Waiting for other participants to finish…
          </div>

          <div style={{ display: 'flex', gap: 12, flexDirection: 'column' }}>
            <button
              className="btn btn-primary"
              onClick={() => navigate(`/contests/${contestId}`)}
              style={{ width: '100%', padding: '14px', fontSize: 15, fontWeight: 700 }}
            >
              View Contest Results
            </button>
            <button
              className="btn btn-ghost"
              onClick={() => navigate('/contests')}
              style={{ width: '100%', padding: '12px', fontSize: 14 }}
            >
              Back to All Contests
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── Loading / error states ────────────────────────────────────────────────
  if (loadError) {
    return (
      <div style={{
        height: '100vh', background: 'var(--bg-primary)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexDirection: 'column', gap: 20, padding: 20,
      }}>
        <div style={{ fontSize: 48 }}>⚠️</div>
        <h2 style={{ textAlign: 'center' }}>Cannot Load Quiz</h2>
        <p style={{ color: 'var(--text-secondary)', textAlign: 'center', maxWidth: 360, lineHeight: 1.6 }}>
          {loadError}
        </p>
        <button className="btn btn-primary" onClick={() => navigate(`/contests/${contestId}`)}>
          Back to Contest
        </button>
      </div>
    );
  }

  if (!data) {
    return (
      <div style={{
        height: '100vh', background: 'var(--bg-primary)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexDirection: 'column', gap: 16,
      }}>
        <div style={{
          width: 48, height: 48, borderRadius: '50%',
          border: '3px solid var(--accent)',
          borderTopColor: 'transparent',
          animation: 'spin 0.8s linear infinite',
        }} />
        <p style={{ color: 'var(--text-muted)' }}>Loading Quiz…</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // ─── Result screen ─────────────────────────────────────────────────────────
  if (result) {
    const totalQ = data.questions.length;
    const pct = totalQ > 0 ? Math.round((result.correctCount / totalQ) * 100) : 0;
    const skipped = totalQ - (result.correctCount || 0) - (result.wrongCount || 0);

    return (
      <div style={{
        minHeight: '100vh', background: 'var(--bg-primary)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 20,
      }}>
        <div className="card" style={{ width: '100%', maxWidth: 480, padding: '40px 36px', textAlign: 'center' }}>
          <div style={{ fontSize: 64, marginBottom: 12 }}>
            {pct >= 80 ? '🏆' : pct >= 50 ? '🎯' : '📝'}
          </div>
          <div className="eyebrow" style={{ marginBottom: 8 }}>Quiz Submitted!</div>
          <h2 style={{ marginBottom: 8 }}>
            {pct >= 80 ? 'Excellent!' : pct >= 50 ? 'Good Job!' : 'Keep Practicing!'}
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 28, lineHeight: 1.6 }}>
            You answered <strong>{result.correctCount}</strong> of <strong>{totalQ}</strong> questions correctly.
          </p>

          {/* Score circle */}
          <div style={{
            width: 130, height: 130, borderRadius: '50%',
            border: '5px solid var(--accent-blue)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 28px',
            background: 'var(--bg-raised)',
          }}>
            <div style={{ fontWeight: 800, fontSize: 38, color: 'var(--accent-blue)', lineHeight: 1 }}>
              {pct}%
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>
              Score
            </div>
          </div>

          {/* Stats row */}
          <div style={{ display: 'flex', gap: 10, marginBottom: 24 }}>
            <div style={{
              flex: 1, background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)',
              borderRadius: 10, padding: '14px 10px',
            }}>
              <div style={{ fontWeight: 700, fontSize: 22, color: 'var(--accent-green)' }}>{result.correctCount}</div>
              <div style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', marginTop: 2 }}>Correct</div>
            </div>
            <div style={{
              flex: 1, background: 'var(--accent-red-soft)', border: '1px solid rgba(230,57,70,0.3)',
              borderRadius: 10, padding: '14px 10px',
            }}>
              <div style={{ fontWeight: 700, fontSize: 22, color: 'var(--accent-red)' }}>{result.wrongCount}</div>
              <div style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', marginTop: 2 }}>Wrong</div>
            </div>
            {skipped > 0 && (
              <div style={{
                flex: 1, background: 'var(--bg-raised)', border: '1px solid var(--border)',
                borderRadius: 10, padding: '14px 10px',
              }}>
                <div style={{ fontWeight: 700, fontSize: 22, color: 'var(--text-secondary)' }}>{skipped}</div>
                <div style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', marginTop: 2 }}>Skipped</div>
              </div>
            )}
          </div>

          {/* Raw score */}
          <div style={{
            padding: '12px 16px',
            background: 'var(--bg-raised)',
            border: '1px solid var(--border)',
            borderRadius: 10,
            marginBottom: 24,
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>Raw Score</span>
            <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>{result.score} pts</span>
          </div>

          {/* Waiting / evaluated */}
          <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 24, lineHeight: 1.6 }}>
            {result.evaluated
              ? '✅ All players done — check contest results for final rankings and points!'
              : '⏳ Waiting for other players to finish. Ranks will be revealed soon.'}
          </p>

          {/* Remarks — explains WHY the score is what it is, especially on a fail */}
          {result.remarks && (
            <div style={{
              marginBottom: 24, padding: '14px 16px', borderRadius: 10, textAlign: 'left',
              background: result.passed ? 'var(--accent-green-soft)' : 'rgba(245,158,11,0.12)',
              border: `1px solid ${result.passed ? 'rgba(34,197,94,0.3)' : 'rgba(245,158,11,0.35)'}`,
            }}>
              <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 4, color: 'var(--text-primary)' }}>
                {result.passed ? '✅ Result' : '📋 Remarks'}
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                {result.remarks}
              </div>
              {!result.passed && (
                <button
                  className="btn btn-primary"
                  onClick={() => navigate('/contests')}
                  style={{ marginTop: 12, fontSize: 12, padding: '7px 14px' }}
                >
                  Try Another Contest
                </button>
              )}
            </div>
          )}

          {/* Proctoring flag */}
          {result.proctoring && result.proctoring.finalStatus !== 'PASSED' && (
            <div style={{
              marginBottom: 24, padding: '14px 16px', borderRadius: 10, textAlign: 'left',
              background: result.proctoring.finalStatus === 'REJECTED'
                ? 'var(--accent-red-soft)' : 'rgba(245,158,11,0.12)',
              border: `1px solid ${result.proctoring.finalStatus === 'REJECTED'
                ? 'rgba(230,57,70,0.3)' : 'rgba(245,158,11,0.35)'}`,
            }}>
              <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 4, color: 'var(--text-primary)' }}>
                {result.proctoring.finalStatus === 'REJECTED' ? '⚠️ Flagged for Review' : '👀 Under Review'}
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                {result.proctoring.reason}
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: 12 }}>
            <button
              className="btn btn-ghost"
              onClick={() => navigate('/contests')}
              style={{ flex: 1 }}
            >
              All Contests
            </button>
            <button
              className="btn btn-primary"
              onClick={() => navigate(`/contests/${contestId}`)}
              style={{ flex: 2 }}
            >
              View Final Results
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── AI Proctoring Gate ────────────────────────────────────────────────────
  if (proctoringEnabled && !proctoringReady) {
    return (
      <>
        <div style={{ height: '100vh', background: 'var(--bg-primary)' }} />
        <ProctoringGate
          contestId={contestId}
          onReady={onProctoringReady}
          onSkip={() => navigate(`/contests/${contestId}`)}
        />
      </>
    );
  }

  // ─── Quiz Play Screen ──────────────────────────────────────────────────────
  const mins = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
  const secs = String(secondsLeft % 60).padStart(2, '0');
  const isUrgent = secondsLeft !== null && secondsLeft <= 30;
  const totalQ = data.questions.length;
  const answeredCount = Object.values(answers).filter(a => a.length > 0).length;
  const q = data.questions[currentQ];

  if (!q) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p>No questions found for this quiz.</p>
      </div>
    );
  }

  const multi = q.question_type === 'multi_correct';
  const selectedOpts = answers[q.id] || [];

  return (
    <div style={{
      height: '100vh', background: 'var(--bg-primary)',
      display: 'flex', flexDirection: 'column', overflow: 'hidden',
    }}>
      <ProctoringWarningBanner warning={proctoring.warning} onDismiss={proctoring.dismissWarning} />

      {/* ── Top Bar ─────────────────────────────────────────────────────── */}
      <div style={{
        background: isUrgent ? 'var(--accent-red-soft)' : 'var(--bg-card)',
        borderBottom: `1px solid ${isUrgent ? 'rgba(230,57,70,0.3)' : 'var(--border)'}`,
        padding: '0 20px',
        height: 64,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexShrink: 0,
        transition: 'background 0.3s, border-color 0.3s',
      }}>
        <div>
          <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 15 }}>
            {data.quiz.title}
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 8 }}>
            {answeredCount} of {totalQ} answered
            {proctoringEnabled && (
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 4,
                fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 999,
                color: proctoring.riskBand === 'NORMAL' ? 'var(--accent-green)' : 'var(--accent-red)',
                background: proctoring.riskBand === 'NORMAL' ? 'rgba(34,197,94,0.12)' : 'var(--accent-red-soft)',
              }}>
                ● Proctored
              </span>
            )}
          </div>
        </div>

        {/* Timer */}
        <div style={{
          fontFamily: 'var(--font-mono)',
          fontWeight: 700, fontSize: 24,
          color: isUrgent ? 'var(--accent-red)' : 'var(--text-primary)',
          display: 'flex', alignItems: 'center', gap: 6,
        }}>
          ⏱ {mins}:{secs}
        </div>
      </div>

      <div style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
        {/* ── Question Navigator ────────────────────────────────────────── */}
        <div style={{
          background: 'var(--bg-card)',
          borderBottom: '1px solid var(--border)',
          padding: '16px 20px',
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', maxWidth: 800, margin: '0 auto' }}>
            {data.questions.map((question, i) => {
              const answered = !!(answers[question.id]?.length);
              const isCurrent = i === currentQ;
              return (
                <button
                  key={question.id}
                  onClick={() => setCurrentQ(i)}
                  style={{
                    width: 40, height: 40,
                    borderRadius: 'var(--radius-sm)',
                    border: isCurrent
                      ? '2px solid var(--accent)'
                      : `1px solid ${answered ? 'var(--accent-green)' : 'var(--border)'}`,
                    background: isCurrent
                      ? 'var(--accent-red-soft)'
                      : answered ? 'rgba(16,185,129,0.12)' : 'var(--bg-card)',
                    color: isCurrent
                      ? 'var(--accent)'
                      : answered ? 'var(--accent-green)' : 'var(--text-secondary)',
                    fontWeight: 600, fontSize: 14,
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                >
                  {i + 1}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Question Card ──────────────────────────────────────────────── */}
        <div style={{
          flex: 1, padding: '32px 20px',
          maxWidth: 800, width: '100%',
          margin: '0 auto',
          display: 'flex', flexDirection: 'column', gap: 24,
        }}>
          <div>
            <div className="eyebrow" style={{ marginBottom: 12 }}>
              Question {currentQ + 1} of {totalQ} &nbsp;•&nbsp; {q.marks} mark{q.marks !== 1 ? 's' : ''}
              {q.negative_marks > 0 && (
                <span style={{ color: 'var(--accent-red)' }}> &nbsp;•&nbsp; -{q.negative_marks} if wrong</span>
              )}
              {multi && (
                <span style={{ color: 'var(--accent-blue)' }}> &nbsp;•&nbsp; Multiple correct</span>
              )}
            </div>
            <p style={{ fontSize: 20, fontWeight: 500, lineHeight: 1.6, color: 'var(--text-primary)' }}>
              {q.question_text}
            </p>
          </div>

          {/* Options */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {(q.options || []).map((opt, oi) => {
              const selected = selectedOpts.includes(opt.id);
              const optLetters = 'ABCD';
              return (
                <label
                  key={opt.id}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 16,
                    padding: '16px 20px',
                    borderRadius: 'var(--radius-card)',
                    border: `2px solid ${selected ? 'var(--accent)' : 'var(--border)'}`,
                    background: selected ? 'var(--accent-red-soft)' : 'var(--bg-card)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{
                    width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                    background: selected ? 'var(--accent)' : 'var(--bg-raised)',
                    border: `1px solid ${selected ? 'var(--accent)' : 'var(--border)'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 700, fontSize: 14,
                    color: selected ? 'white' : 'var(--text-secondary)',
                    transition: 'all 0.15s',
                  }}>
                    {optLetters[oi] ?? oi + 1}
                  </div>
                  <span style={{ fontSize: 16, color: 'var(--text-primary)', flex: 1 }}>
                    {opt.text}
                  </span>
                  <input
                    type={multi ? 'checkbox' : 'radio'}
                    name={`q_${q.id}`}
                    style={{ display: 'none' }}
                    checked={selected}
                    onChange={() => toggleOption(q.id, opt.id, multi)}
                  />
                </label>
              );
            })}
          </div>

          {/* Clear answer */}
          {selectedOpts.length > 0 && (
            <button
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--text-muted)', fontSize: 13,
                alignSelf: 'flex-start', padding: 0,
                textDecoration: 'underline',
              }}
              onClick={() => toggleOption(q.id, null, false) || setAnswers(prev => {
                const next = { ...prev };
                delete next[q.id];
                saveAnswers(contestId, next);
                return next;
              })}
            >
              Clear answer
            </button>
          )}

          {/* Navigation Buttons */}
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, marginTop: 8 }}>
            <button
              className="btn btn-ghost"
              onClick={() => setCurrentQ(i => Math.max(0, i - 1))}
              disabled={currentQ === 0}
              style={{ flex: 1, padding: '14px 20px', fontSize: 15 }}
            >
              ← Previous
            </button>

            {currentQ < totalQ - 1 ? (
              <button
                className="btn btn-primary"
                onClick={() => setCurrentQ(i => Math.min(totalQ - 1, i + 1))}
                style={{ flex: 2, padding: '14px 20px', fontSize: 15 }}
              >
                {selectedOpts.length > 0 ? 'Save & Next →' : 'Skip →'}
              </button>
            ) : (
              <button
                className="btn btn-primary"
                onClick={() => {
                  const unanswered = totalQ - answeredCount;
                  const msg = unanswered > 0
                    ? `You have ${unanswered} unanswered question${unanswered > 1 ? 's' : ''}. Are you sure you want to submit?`
                    : 'Are you sure you want to submit the quiz?';
                  if (window.confirm(msg)) submit(false);
                }}
                disabled={submitting}
                style={{ flex: 2, fontSize: 15, padding: '14px 20px' }}
              >
                {submitting ? 'Submitting…' : `Submit Quiz (${answeredCount}/${totalQ} answered)`}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
