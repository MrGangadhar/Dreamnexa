import { Link } from 'react-router-dom';

const statusConfig = {
  upcoming: { label: 'OPEN', cls: 'badge-open' },
  live: { label: 'LIVE', cls: 'badge-live' },
  locked: { label: 'LOCKED', cls: 'badge-open' },
  completed: { label: 'COMPLETED', cls: 'badge-gold' },
  cancelled: { label: 'CANCELLED', cls: 'badge-open' },
};

export default function ContestCard({ contest }) {
  const cfg = statusConfig[contest.status] || statusConfig.upcoming;
  const seatsLeft = contest.max_participants - contest.current_participants;
  const fillPct = (contest.current_participants / contest.max_participants) * 100;
  const almostFull = seatsLeft <= 2 && seatsLeft > 0 && contest.status === 'upcoming';
  const isFree = !contest.entry_points_cost || contest.entry_points_cost === 0;

  // Prize pool: sum of points from reward_structure
  const prizePool = (contest.reward_structure || []).reduce((sum, r) => sum + (r.points || 0), 0);

  return (
    <div className="card" style={{
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      cursor: 'pointer',
      textDecoration: 'none',
    }}>
      {/* Card Header */}
      <div style={{
        background: 'var(--bg-raised)',
        padding: '14px 16px',
        borderBottom: '1px solid var(--border)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h3 style={{
              fontSize: 16, fontWeight: 700, color: 'var(--text-primary)',
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              marginBottom: 4,
            }}>{contest.name}</h3>
            <div style={{
              fontSize: 13, color: 'var(--text-secondary)',
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            }}>{contest.quiz_title}</div>
          </div>
          <span className={`badge ${cfg.cls}`}>{cfg.label}</span>
        </div>
      </div>

      {/* Card Body */}
      <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Stats Row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div className="eyebrow">Prize Pool</div>
            <div style={{
              fontWeight: 700, fontSize: 18,
              color: prizePool > 0 ? '#b37300' : 'var(--text-primary)',
            }}>{prizePool > 0 ? `${prizePool.toLocaleString()} pts` : 'No points'}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div className="eyebrow">Entry</div>
            <div style={{
              fontWeight: 700, fontSize: 16,
              color: isFree ? 'var(--accent-green)' : 'var(--text-primary)',
            }}>
              {isFree ? 'FREE' : `${contest.entry_points_cost} pts`}
            </div>
          </div>
        </div>

        {/* Seat Progress */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500 }}>
              {contest.current_participants} / {contest.max_participants} spots
            </span>
            <span style={{
              fontSize: 13, fontWeight: 600,
              color: seatsLeft === 0 ? 'var(--accent-red)' : almostFull ? 'var(--accent-red)' : 'var(--text-secondary)',
            }}>
              {seatsLeft === 0 ? 'Full' : `${seatsLeft} left`}
            </span>
          </div>
          <div className="progress-bar">
            <div className={`progress-fill ${almostFull || seatsLeft === 0 ? 'danger' : ''}`}
              style={{ width: `${fillPct}%` }} />
          </div>
        </div>

        {/* CTA Button */}
        <Link
          to={`/contests/${contest.id}`}
          className={`btn ${contest.status === 'live' ? 'btn-danger' : 'btn-primary'} btn-full`}
          style={{ marginTop: 'auto' }}
        >
          {contest.status === 'live' ? 'Play Now' :
            contest.status === 'upcoming' ? (seatsLeft > 0 ? 'Join Contest' : 'Contest Full') :
            contest.status === 'completed' ? 'View Results' : 'View Details'}
        </Link>
      </div>
    </div>
  );
}
