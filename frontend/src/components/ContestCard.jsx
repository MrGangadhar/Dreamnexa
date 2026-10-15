import { Link, useNavigate } from 'react-router-dom';

const statusConfig = {
  upcoming:  { label: 'OPEN',      cls: 'badge-open',  color: '#6b7280', bg: '#f1f5f9' },
  live:      { label: 'LIVE',      cls: 'badge-live',  color: '#15803d', bg: '#dcfce7' },
  locked:    { label: 'LOCKED',    cls: 'badge-open',  color: '#6b7280', bg: '#f1f5f9' },
  completed: { label: 'COMPLETED', cls: 'badge-gold',  color: '#b45309', bg: '#fef3c7' },
  cancelled: { label: 'CANCELLED', cls: 'badge-open',  color: '#ef4444', bg: '#fee2e2' },
};

export default function ContestCard({ contest }) {
  const navigate = useNavigate();
  const cfg = statusConfig[contest.status] || statusConfig.upcoming;
  const seatsLeft = contest.max_participants - contest.current_participants;
  const fillPct = (contest.current_participants / contest.max_participants) * 100;
  const almostFull = seatsLeft <= 2 && seatsLeft > 0 && contest.status === 'upcoming';
  const isFree = !contest.entry_points_cost || contest.entry_points_cost === 0;

  const prizePool = (contest.reward_structure || []).reduce((sum, r) => sum + (r.points || 0), 0);

  return (
    <div 
      onClick={() => navigate(`/contests/${contest.id}`)}
      style={{
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        cursor: 'pointer',
        background: '#fff',
        borderRadius: 16,
        boxShadow: '0 4px 16px rgba(0,0,0,0.05)',
        border: '1px solid #f0f0f0',
        transition: 'transform 0.2s, box-shadow 0.2s',
        WebkitTapHighlightColor: 'transparent',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.08)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'none';
        e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.05)';
      }}
    >
      {/* Header */}
      <div style={{
        padding: '14px 16px',
        borderBottom: '1px solid #f3f4f6',
        background: '#fafafa',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h3 style={{
              fontSize: 15, fontWeight: 800, color: '#1e293b',
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              margin: 0,
            }}>{contest.name}</h3>
            <div style={{
              fontSize: 12, color: '#64748b', marginTop: 2,
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            }}>{contest.quiz_title}</div>
            {(contest.starts_at || contest.ends_at) && (
              <div style={{
                fontSize: 11,
                fontWeight: 700,
                color: '#4338ca',
                background: '#e0e7ff',
                padding: '3px 7px',
                borderRadius: 6,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                marginTop: 4,
              }}>
                <span>⏰</span>
                <span>
                  {contest.starts_at ? new Date(contest.starts_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : ''} · {' '}
                  {contest.starts_at ? new Date(contest.starts_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : 'Open'}
                  {contest.ends_at ? ` – ${new Date(contest.ends_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}` : ''}
                </span>
              </div>
            )}
          </div>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            {Boolean(contest.proctoring_enabled) && (
              <span style={{
                fontSize: 10, fontWeight: 800, padding: '3px 7px',
                borderRadius: 6, color: '#15803d', background: '#dcfce7',
                letterSpacing: '0.03em', display: 'inline-flex', alignItems: 'center', gap: 3
              }}>
                🛡️ AI Proctored
              </span>
            )}
            <span style={{
              fontSize: 10, fontWeight: 800, padding: '3px 8px',
              borderRadius: 6, color: cfg.color, background: cfg.bg,
              letterSpacing: '0.04em', textTransform: 'uppercase',
            }}>
              {cfg.label}
            </span>
          </div>
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column', gap: 14 }}>
        {/* Stats Row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', color: '#94a3b8', letterSpacing: '0.05em' }}>Prize Pool</div>
            <div style={{
              fontWeight: 900, fontSize: 17,
              color: prizePool > 0 ? '#b45309' : '#1e293b',
              marginTop: 2,
            }}>{prizePool > 0 ? `${prizePool.toLocaleString()} pts` : 'No points'}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', color: '#94a3b8', letterSpacing: '0.05em' }}>Entry</div>
            <div style={{
              fontWeight: 900, fontSize: 15,
              color: isFree ? '#16a34a' : '#1e293b',
              marginTop: 2,
            }}>
              {isFree ? 'FREE' : `${contest.entry_points_cost} pts`}
            </div>
          </div>
        </div>

        {/* Spot status / progress */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>
              {contest.current_participants} / {contest.max_participants} joined
            </span>
            <span style={{
              fontSize: 12, fontWeight: 700,
              color: seatsLeft === 0 ? '#ef4444' : almostFull ? '#ef4444' : '#64748b',
            }}>
              {seatsLeft === 0 ? 'Full' : `${seatsLeft} spots left`}
            </span>
          </div>
          <div style={{ height: 6, borderRadius: 3, background: '#f1f5f9', overflow: 'hidden' }}>
            <div 
              style={{ 
                height: '100%', 
                background: almostFull || seatsLeft === 0 ? '#ef4444' : 'linear-gradient(90deg, #10b981, #059669)', 
                width: `${fillPct}%`,
                transition: 'width 0.3s ease',
              }} 
            />
          </div>
        </div>

        {/* CTA Link */}
        <Link
          to={`/contests/${contest.id}`}
          onClick={e => e.stopPropagation()}
          style={{
            marginTop: 'auto',
            background: contest.status === 'live' ? '#ef4444' : '#C8102E',
            color: '#fff',
            textAlign: 'center',
            padding: '10px 16px',
            borderRadius: 10,
            fontSize: 13,
            fontWeight: 800,
            textDecoration: 'none',
            boxShadow: contest.status === 'live' ? '0 4px 12px rgba(239,68,68,0.2)' : '0 4px 12px rgba(200,16,46,0.15)',
            transition: 'background 0.2s',
          }}
        >
          {contest.status === 'live' ? 'Play Now' :
            contest.status === 'upcoming' ? (seatsLeft > 0 ? 'Join Contest' : 'Contest Full') :
            contest.status === 'completed' ? 'View Results' : 'View Details'}
        </Link>
      </div>
    </div>
  );
}
