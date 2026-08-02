import { useEffect, useRef, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import client from '../api/client';

export default function QuizPlay() {
  const { contestId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [answers, setAnswers] = useState({});
  const [secondsLeft, setSecondsLeft] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [currentQ, setCurrentQ] = useState(0);
  const submittedRef = useRef(false);

  const submit = useCallback(async (autoSubmitted = false) => {
    if (submittedRef.current) return;
    submittedRef.current = true;
    setSubmitting(true);
    const payload = Object.entries(answers).map(([questionId, selectedOptions]) => ({ questionId, selectedOptions }));
    try {
      const { data: res } = await client.post(`/quiz/${contestId}/submit`, { answers: payload, autoSubmitted });
      setResult(res);
    } catch (err) {
      alert(err.response?.data?.error || 'Submission failed.');
      submittedRef.current = false;
    } finally {
      setSubmitting(false);
    }
  }, [answers, contestId]);

  useEffect(() => {
    client.get(`/quiz/${contestId}/play`).then(({ data: d }) => {
      setData(d);
      if (d.contestEndsAt) {
        const end = new Date(d.contestEndsAt).getTime();
        setSecondsLeft(Math.max(0, Math.round((end - Date.now()) / 1000)));
      } else {
        setSecondsLeft(d.quiz.duration_minutes * 60);
      }
    });
  }, [contestId]);

  useEffect(() => {
    if (secondsLeft === null || result) return;
    if (secondsLeft <= 0) { submit(true); return; }
    const t = setTimeout(() => setSecondsLeft(s => s - 1), 1000);
    return () => clearTimeout(t);
  }, [secondsLeft, result, submit]);

  const toggleOption = (questionId, optionId, multi) => {
    setAnswers(prev => {
      const current = new Set(prev[questionId] || []);
      if (multi) {
        current.has(optionId) ? current.delete(optionId) : current.add(optionId);
      } else {
        current.clear();
        current.add(optionId);
      }
      return { ...prev, [questionId]: [...current] };
    });
  };

  if (!data) {
    return (
      <div style={{ height: '100vh', background: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
        <p style={{ color: 'var(--text-muted)' }}>Loading Quiz…</p>
      </div>
    );
  }

  // ── Result Screen ───────────────────────────────────────────────
  if (result) {
    const pct = data.questions.length > 0 ? Math.round((result.correctCount / data.questions.length) * 100) : 0;
    return (
      <div style={{
        height: '100vh', background: 'var(--bg-primary)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 20,
      }}>
        <div className="card" style={{
          width: '100%', maxWidth: 440,
          padding: 40, textAlign: 'center',
        }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>
            {pct >= 80 ? '🏆' : pct >= 50 ? '🎯' : '📝'}
          </div>
          <div className="eyebrow" style={{ marginBottom: 8 }}>Quiz Submitted!</div>
          <h2 style={{ marginBottom: 24 }}>
            {pct >= 80 ? 'Excellent!' : pct >= 50 ? 'Good Job!' : 'Keep Practicing!'}
          </h2>

          <div style={{
            width: 120, height: 120, borderRadius: '50%',
            border: '4px solid var(--accent-blue)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 24px',
          }}>
            <div style={{ fontWeight: 800, fontSize: 36, color: 'var(--accent-blue)', lineHeight: 1 }}>{result.score}</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>score</div>
          </div>

          <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
            <div style={{ flex: 1, background: 'var(--bg-raised)', border: '1px solid var(--border)', borderRadius: 10, padding: 14, textAlign: 'center' }}>
              <div style={{ fontWeight: 700, fontSize: 24, color: 'var(--accent-green)' }}>{result.correctCount}</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>Correct</div>
            </div>
            <div style={{ flex: 1, background: 'var(--bg-raised)', border: '1px solid var(--border)', borderRadius: 10, padding: 14, textAlign: 'center' }}>
              <div style={{ fontWeight: 700, fontSize: 24, color: 'var(--accent-red)' }}>{result.wrongCount}</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>Wrong</div>
            </div>
          </div>

          <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 24, lineHeight: 1.5 }}>
            {result.evaluated
              ? '✅ Everyone finished — check the results for final ranks and points!'
              : '⏳ Waiting for other players to finish. Ranks will be revealed soon.'}
          </p>

          <button className="btn btn-primary btn-full" onClick={() => navigate(`/contests/${contestId}`)}>
            View Final Results
          </button>
        </div>
      </div>
    );
  }

  // ── Quiz Play Screen ────────────────────────────────────────────
  const mins = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
  const secs = String(secondsLeft % 60).padStart(2, '0');
  const isUrgent = secondsLeft !== null && secondsLeft <= 30;
  const totalQ = data.questions.length;
  const answeredCount = Object.keys(answers).length;
  const q = data.questions[currentQ];
  const multi = q.question_type === 'multi_correct';
  const selectedOpts = answers[q.id] || [];

  return (
    <div style={{ height: '100vh', background: 'var(--bg-primary)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* ── Top Bar ─────────────────────────────────────────────── */}
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
          <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
            {answeredCount} of {totalQ} answered
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
        {/* ── Question Navigator ─────────────────────────────────── */}
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
                  key={i}
                  onClick={() => setCurrentQ(i)}
                  style={{
                    width: 40, height: 40,
                    borderRadius: 'var(--radius-sm)',
                    border: isCurrent ? '2px solid var(--accent)' : `1px solid ${answered ? 'var(--accent)' : 'var(--border)'}`,
                    background: isCurrent ? 'var(--accent-red-soft)' : answered ? 'var(--accent-red-soft)' : 'var(--bg-card)',
                    color: isCurrent || answered ? 'var(--accent)' : 'var(--text-secondary)',
                    fontWeight: 600, fontSize: 14,
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                >{i + 1}</button>
              );
            })}
          </div>
        </div>

        {/* ── Question Card ─────────────────────────────────────── */}
        <div style={{ flex: 1, padding: '32px 20px', maxWidth: 800, width: '100%', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div>
            <div className="eyebrow" style={{ marginBottom: 12 }}>
              Question {currentQ + 1} of {totalQ} • {q.marks} mark{q.marks !== 1 ? 's' : ''}
              {q.negative_marks > 0 && <span style={{ color: 'var(--accent-red)' }}> • -{q.negative_marks} if wrong</span>}
            </div>
            <p style={{
              fontSize: 22, fontWeight: 500, lineHeight: 1.5,
              color: 'var(--text-primary)',
            }}>
              {q.question_text}
            </p>
          </div>

          {/* Options */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {q.options.map((opt, oi) => {
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
                  }}>{optLetters[oi]}</div>
                  <span style={{ fontSize: 16, color: 'var(--text-primary)', flex: 1 }}>{opt.text}</span>
                  <input
                    type={multi ? 'checkbox' : 'radio'}
                    name={q.id}
                    style={{ display: 'none' }}
                    checked={selected}
                    onChange={() => toggleOption(q.id, opt.id, multi)}
                  />
                </label>
              );
            })}
          </div>

          {/* Navigation Buttons */}
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, marginTop: 16 }}>
            <button
              className="btn btn-ghost"
              onClick={() => setCurrentQ(i => Math.max(0, i - 1))}
              disabled={currentQ === 0}
              style={{ flex: 1, padding: '14px 20px', fontSize: 16 }}
            >Previous</button>

            {currentQ < totalQ - 1 ? (
              <button
                className="btn btn-primary"
                onClick={() => setCurrentQ(i => Math.min(totalQ - 1, i + 1))}
                style={{ flex: 2, padding: '14px 20px', fontSize: 16 }}
              >
                {selectedOpts.length > 0 ? 'Save & Next' : 'Skip'}
              </button>
            ) : (
              <button
                className="btn btn-primary"
                onClick={() => submit(false)}
                disabled={submitting}
                style={{ flex: 2, fontSize: 16, padding: '14px 20px' }}
              >
                {submitting ? 'Submitting...' : `Submit Quiz (${answeredCount}/${totalQ})`}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
