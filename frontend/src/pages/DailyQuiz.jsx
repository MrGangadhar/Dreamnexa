import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import client from '../api/client';
import ContestCard from '../components/ContestCard';
import { FiCheckSquare, FiAlertCircle, FiTrendingUp } from 'react-icons/fi';
import { useSEO } from '../hooks/useSEO';

export default function DailyQuiz() {
  useSEO({
    title: 'Daily Quiz Challenge — Free Practice & Points | DreamNexa',
    description: 'Participate in the DreamNexa daily quiz challenge. Test your general knowledge and exam preparation with free bite-sized quiz sprints.',
    canonical: 'https://dreamnexa.in/daily-quiz',
  });
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    setError('');
    client.get('/contests')
      .then(({ data }) => {
        // Filter free/daily sprint quizzes
        const filtered = data.filter(c => c.entry_points_cost === 0 || c.name.toLowerCase().includes('sprint') || c.name.toLowerCase().includes('daily'));
        setQuizzes(filtered);
      })
      .catch(err => {
        setError(err.response?.data?.error || 'Failed to load daily quizzes.');
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ background: '#f5f6fa', minHeight: '100vh', paddingTop: 'calc(var(--nav-height))', paddingBottom: 'calc(var(--bottom-nav-h) + 24px)' }}>
      
      {/* ── Gradient Header ───────────────────────────────── */}
      <div style={{
        background: 'linear-gradient(160deg, #1a0533 0%, #C8102E 65%, #ff4d6d 100%)',
        padding: '24px 0 48px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{ position:'absolute', top:-40, right:-40, width:150, height:150, borderRadius:'50%', background:'rgba(255,255,255,0.05)', pointerEvents:'none' }} />
        <div className="container">
          <h1 style={{ color: '#fff', fontSize: 22, fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
            <FiCheckSquare size={22} /> Daily Quiz
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.72)', fontSize: 13, marginTop: 4 }}>
            Test your knowledge daily and earn bonus points for free
          </p>
        </div>
      </div>

      <div className="container" style={{ marginTop: -20, position: 'relative', zIndex: 2 }}>
        {error && (
          <div className="alert alert-error" style={{ display: 'flex', alignItems: 'center', gap: 10, borderRadius: 14, marginBottom: 14 }}>
            <FiAlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {/* Quiz Grid */}
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="skeleton" style={{ height: 240, borderRadius: 16 }} />
            ))}
          </div>
        ) : quizzes.length === 0 ? (
          <div style={{ background: '#fff', borderRadius: 16, padding: '50px 20px', textAlign: 'center', maxWidth: 460, margin: '20px auto', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
            <div style={{ fontSize: 44, marginBottom: 14 }}>🎯</div>
            <h3 style={{ fontWeight: 700 }}>No Daily Quizzes Available</h3>
            <p style={{ color: '#9ca3af', fontSize: 14, marginBottom: 20 }}>All current daily quizzes are locked or completed. Please check back later or browse other contests.</p>
            <button className="btn btn-primary" onClick={() => navigate('/contests')} style={{ background: '#C8102E', borderRadius: 10 }}>
              <FiTrendingUp style={{ marginRight: 6 }} /> Browse Contest Lobby
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
            {quizzes.map(q => (
              <ContestCard key={q.id} contest={q} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
