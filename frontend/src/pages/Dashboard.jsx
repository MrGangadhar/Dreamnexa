import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiTarget, FiAward, FiTrendingUp, FiGift, FiCopy, FiCheck,
  FiArrowUpRight, FiArrowDownLeft, FiUsers, FiChevronRight,
  FiSettings, FiBell, FiStar,
} from 'react-icons/fi';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';
import AdBanner from '../components/AdBanner';

const TABS = [
  { label: 'Contests', icon: FiTarget },
  { label: 'Badges',   icon: FiAward },
  { label: 'Activity', icon: FiTrendingUp },
];

const RANK_ICONS = { 1: '🥇', 2: '🥈', 3: '🥉' };

const statusConfig = {
  upcoming:  { label: 'OPEN',      cls: 'badge-open' },
  live:      { label: 'LIVE',      cls: 'badge-live' },
  locked:    { label: 'LOCKED',    cls: 'badge-open' },
  completed: { label: 'DONE',      cls: 'badge-gold' },
};

const fadeUp = {
  hidden:  { opacity: 0, y: 12 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.3, delay: i * 0.05, ease: 'easeOut' },
  }),
};

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [myContests, setMyContests]     = useState([]);
  const [badges, setBadges]             = useState([]);
  const [pointsHistory, setPointsHistory] = useState([]);
  const [tab, setTab]   = useState(0);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied]   = useState(false);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      client.get('/users/me/contests'),
      client.get('/users/me/badges'),
      client.get('/users/me/points'),
    ]).then(([contests, badges, points]) => {
      setMyContests(contests.data || []);
      setBadges(badges.data || []);
      setPointsHistory((points.data || []).slice(0, 20));
    }).catch(err => {
      console.warn('Dashboard data fetch skipped/unauthorized:', err.message);
    }).finally(() => setLoading(false));
  }, [user]);

  if (!user) return null;

  const winRate = user.total_contests > 0
    ? Math.round((user.contests_won / user.total_contests) * 100)
    : 0;

  const copyCode = () => {
    navigator.clipboard.writeText(user.referral_code || '').catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const stats = [
    { val: user.total_contests ?? 0, label: 'Played',   icon: '🎯', color: '#0D6EFD', bg: 'rgba(13,110,253,0.08)' },
    { val: user.contests_won ?? 0,   label: 'Won',       icon: '🏆', color: '#b37300', bg: 'rgba(245,166,35,0.12)' },
    { val: `${winRate}%`,            label: 'Win Rate',  icon: '📈', color: '#198754', bg: 'rgba(25,135,84,0.08)'  },
    { val: badges.length,            label: 'Badges',    icon: '🎖️', color: '#C8102E', bg: 'rgba(200,16,46,0.08)' },
  ];

  return (
    <div style={{ background: '#f5f6fa', minHeight: '100vh', paddingTop: 'calc(var(--nav-height))', paddingBottom: 'calc(var(--bottom-nav-h) + 16px)' }}>

      {/* ── Hero Profile Header ─────────────────────────────── */}
      <div style={{
        background: 'linear-gradient(160deg, #1a0533 0%, #C8102E 60%, #ff4d6d 100%)',
        paddingTop: 20,
        paddingBottom: 48,
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Decorative circles */}
        <div style={{ position:'absolute', top:-40, right:-40, width:180, height:180, borderRadius:'50%', background:'rgba(255,255,255,0.05)', pointerEvents:'none' }} />
        <div style={{ position:'absolute', bottom:-60, left:-30, width:200, height:200, borderRadius:'50%', background:'rgba(255,255,255,0.04)', pointerEvents:'none' }} />

        <div className="container" style={{ position: 'relative' }}>
          {/* Top row: avatar + name + settings */}
          <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:20 }}>
            {/* Avatar */}
            <div style={{
              width:58, height:58, borderRadius:'50%',
              background:'linear-gradient(135deg,#FFD766,#F5A623)',
              display:'flex', alignItems:'center', justifyContent:'center',
              fontWeight:800, fontSize:26, color:'#3a2600',
              flexShrink:0, boxShadow:'0 4px 16px rgba(0,0,0,0.25)',
              border:'3px solid rgba(255,255,255,0.3)',
            }}>
              {(user.full_name || user.username || 'U')[0].toUpperCase()}
            </div>
            {/* Name + username */}
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
                <h1 style={{ color:'#fff', fontSize:18, fontWeight:800, margin:0, lineHeight:1.2, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:'calc(100% - 60px)' }}>
                  {user.full_name || user.username}
                </h1>
                {user.role === 'admin' && (
                  <span style={{ fontSize:9, fontWeight:800, padding:'2px 7px', background:'rgba(255,255,255,0.25)', color:'#fff', borderRadius:4, letterSpacing:'0.06em', flexShrink:0 }}>ADMIN</span>
                )}
              </div>
              <div style={{ color:'rgba(255,255,255,0.72)', fontSize:13, marginTop:2 }}>
                @{user.username}{user.college && <span> · {user.college}</span>}
              </div>
            </div>
            {/* Settings icon */}
            <button onClick={() => navigate('/settings')} style={{ background:'rgba(255,255,255,0.15)', border:'none', borderRadius:10, width:38, height:38, display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', cursor:'pointer', flexShrink:0 }}>
              <FiSettings size={17} />
            </button>
          </div>

          {/* Points + Wallet row */}
          <div style={{ display:'flex', gap:10 }}>
            <div style={{ flex:1, background:'rgba(255,255,255,0.15)', borderRadius:14, padding:'14px 16px', backdropFilter:'blur(8px)', border:'1px solid rgba(255,255,255,0.2)' }}>
              <div style={{ color:'rgba(255,255,255,0.72)', fontSize:10, fontWeight:700, letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:4 }}>Total Points</div>
              <div style={{ color:'#fff', fontWeight:900, fontSize:28, letterSpacing:'-0.02em', lineHeight:1 }}>
                {(user.total_points ?? 0).toLocaleString()}
                <span style={{ fontSize:13, fontWeight:600, marginLeft:4, opacity:0.75 }}>pts</span>
              </div>
            </div>
            <Link to="/wallet" style={{ flexShrink:0, background:'rgba(255,255,255,0.15)', borderRadius:14, padding:'14px 16px', backdropFilter:'blur(8px)', border:'1px solid rgba(255,255,255,0.2)', textDecoration:'none', display:'flex', flexDirection:'column', justifyContent:'space-between', minWidth:120 }}>
              <div style={{ color:'rgba(255,255,255,0.72)', fontSize:10, fontWeight:700, letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:4 }}>Wallet</div>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                <span style={{ color:'#fff', fontWeight:800, fontSize:16 }}>Go to Wallet</span>
                <FiChevronRight size={16} color="rgba(255,255,255,0.8)" />
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* ── Stats Cards ─────────────────────────────────────── */}
      <div className="container" style={{ marginTop:-24, position:'relative', zIndex:2 }}>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:8 }}>
          {stats.map(({ val, label, icon, color, bg }, i) => (
            <motion.div
              key={label}
              initial="hidden" animate="visible" custom={i} variants={fadeUp}
              style={{
                background:'#fff', borderRadius:14, padding:'12px 8px',
                textAlign:'center', boxShadow:'0 2px 12px rgba(0,0,0,0.07)',
                border:'1px solid #f0f0f0',
              }}
            >
              <div style={{ width:32, height:32, borderRadius:10, background:bg, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 8px', fontSize:16 }}>{icon}</div>
              <div style={{ fontWeight:900, fontSize:18, color:'#111', letterSpacing:'-0.02em', lineHeight:1 }}>{val}</div>
              <div style={{ fontSize:9, color:'#9ca3af', fontWeight:700, marginTop:3, textTransform:'uppercase', letterSpacing:'0.04em' }}>{label}</div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ── Ad Banner ───────────────────────────────────────── */}
      <div className="container" style={{ marginTop:16 }}>
        <AdBanner position="top" variant={1} />
      </div>

      {/* ── Tabs ────────────────────────────────────────────── */}
      <div className="container" style={{ marginTop:20 }}>
        {/* Tab pills */}
        <div style={{ display:'flex', gap:8, marginBottom:16, overflowX:'auto', paddingBottom:2, WebkitOverflowScrolling:'touch' }}>
          {TABS.map((t, i) => {
            const Icon = t.icon;
            const active = tab === i;
            return (
              <button
                key={t.label}
                onClick={() => setTab(i)}
                style={{
                  display:'inline-flex', alignItems:'center', gap:6,
                  padding:'9px 16px', borderRadius:50, border:'none',
                  cursor:'pointer', fontWeight:700, fontSize:13, whiteSpace:'nowrap',
                  background: active ? '#C8102E' : '#fff',
                  color: active ? '#fff' : '#6b7280',
                  boxShadow: active ? '0 4px 14px rgba(200,16,46,0.3)' : '0 1px 4px rgba(0,0,0,0.08)',
                  transition:'all 0.2s',
                  flexShrink:0,
                }}
              >
                <Icon size={13} />
                {t.label}
              </button>
            );
          })}
        </div>

        {/* Tab content */}
        {loading ? (
          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height:72, borderRadius:14 }} />)}
          </div>
        ) : (
          <motion.div key={tab} initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.2 }}>

            {/* ── Tab 0: My Contests ─────────────────────────── */}
            {tab === 0 && (
              <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                {myContests.length === 0 ? (
                  <EmptyState icon={FiTarget} title="No contests yet" subtitle="Join a contest to get started!" action={<Link to="/contests" className="btn btn-primary">Browse Contests</Link>} />
                ) : myContests.map(c => {
                  const cfg = statusConfig[c.status] || statusConfig.upcoming;
                  return (
                    <div key={c.id} onClick={() => navigate(`/contests/${c.id}`)} style={{ background:'#fff', borderRadius:14, padding:'14px 16px', boxShadow:'0 1px 8px rgba(0,0,0,0.06)', display:'flex', alignItems:'center', gap:12, cursor:'pointer', border:'1px solid #f0f0f0', WebkitTapHighlightColor:'transparent' }}>
                      <div style={{ width:42, height:42, borderRadius:12, background:'rgba(200,16,46,0.08)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, flexShrink:0 }}>🎯</div>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ fontWeight:700, fontSize:14, color:'#111', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{c.name}</div>
                        <div style={{ fontSize:12, color:'#9ca3af', marginTop:2 }}>{c.quiz_title}</div>
                      </div>
                      <div style={{ flexShrink:0, textAlign:'right' }}>
                        <span className={`badge ${cfg.cls}`} style={{ fontSize:10 }}>{cfg.label}</span>
                        {c.rank && <div style={{ fontSize:13, fontWeight:800, marginTop:4 }}>{RANK_ICONS[c.rank] || `#${c.rank}`}</div>}
                        {c.points_awarded > 0 && <div style={{ fontSize:12, fontWeight:700, color:'#b37300' }}>+{c.points_awarded}pts</div>}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* ── Tab 1: Badges ──────────────────────────────── */}
            {tab === 1 && (
              <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:12 }}>
                {badges.length === 0 ? (
                  <div style={{ gridColumn:'1/-1' }}>
                    <EmptyState icon={FiAward} title="No badges yet" subtitle="Finish top 3 in a contest to earn your first badge!" />
                  </div>
                ) : badges.map((b, i) => {
                  const tier = b.code.includes('gold') ? 'gold' : b.code.includes('silver') ? 'silver' : b.code.includes('bronze') ? 'bronze' : 'default';
                  const tierStyle = {
                    gold:    { bg:'linear-gradient(135deg,#FFF6DC,#FFEBB0)', border:'rgba(245,166,35,0.4)', emoji:'🥇' },
                    silver:  { bg:'linear-gradient(135deg,#F5F6F8,#E3E6EA)', border:'rgba(108,117,125,0.3)', emoji:'🥈' },
                    bronze:  { bg:'linear-gradient(135deg,#FBEADC,#F0CBA8)', border:'rgba(180,110,50,0.35)', emoji:'🥉' },
                    default: { bg:'#fff', border:'#f0f0f0', emoji:'🏅' },
                  }[tier];
                  return (
                    <motion.div key={b.code} initial="hidden" animate="visible" custom={i} variants={fadeUp}
                      style={{ background:tierStyle.bg, border:`1px solid ${tierStyle.border}`, borderRadius:16, padding:'20px 14px', textAlign:'center', boxShadow:'0 2px 10px rgba(0,0,0,0.06)' }}>
                      <div style={{ fontSize:36, marginBottom:8 }}>{tierStyle.emoji}</div>
                      <div style={{ fontWeight:700, fontSize:14, marginBottom:4 }}>{b.name}</div>
                      <div style={{ fontSize:12, color:'#6b7280' }}>{b.description}</div>
                    </motion.div>
                  );
                })}
              </div>
            )}

            {/* ── Tab 2: Points Activity ─────────────────────── */}
            {tab === 2 && (
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                {pointsHistory.length === 0 ? (
                  <EmptyState icon={FiTrendingUp} title="No activity yet" subtitle="Your points history will appear here." />
                ) : pointsHistory.map(tx => {
                  const positive = tx.amount > 0;
                  return (
                    <div key={tx.id} style={{ background:'#fff', borderRadius:14, padding:'14px 16px', boxShadow:'0 1px 6px rgba(0,0,0,0.05)', display:'flex', alignItems:'center', gap:12, border:'1px solid #f0f0f0' }}>
                      <div style={{ width:40, height:40, borderRadius:12, background: positive ? 'rgba(25,135,84,0.1)' : 'rgba(200,16,46,0.08)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                        {positive ? <FiArrowUpRight size={18} color="#198754" /> : <FiArrowDownLeft size={18} color="#C8102E" />}
                      </div>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ fontWeight:600, fontSize:13, color:'#111', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{tx.description || tx.type.replace(/_/g,' ')}</div>
                        <div style={{ fontSize:11, color:'#9ca3af', textTransform:'capitalize', marginTop:2 }}>{tx.type.replace(/_/g,' ')}</div>
                      </div>
                      <div style={{ fontWeight:800, fontSize:16, color: positive ? '#198754' : '#C8102E', flexShrink:0 }}>
                        {positive ? '+' : ''}{tx.amount}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}

        {/* ── Referral Card (visible on mobile too) ─────────── */}
        <motion.div initial="hidden" animate="visible" custom={3} variants={fadeUp}
          style={{ marginTop:20, background:'linear-gradient(135deg,#1a0533 0%,#3b0764 100%)', borderRadius:18, padding:'20px 18px', position:'relative', overflow:'hidden' }}>
          <div style={{ position:'absolute', top:-30, right:-30, width:120, height:120, borderRadius:'50%', background:'rgba(255,255,255,0.05)' }} />
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:8, position:'relative' }}>
            <div style={{ width:34, height:34, borderRadius:10, background:'rgba(255,255,255,0.12)', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <FiUsers size={16} color="#fff" />
            </div>
            <div>
              <div style={{ color:'#fff', fontWeight:700, fontSize:15 }}>Invite Friends</div>
              <div style={{ color:'rgba(255,255,255,0.6)', fontSize:12 }}>Earn 100 pts per referral</div>
            </div>
          </div>
          <div style={{ background:'rgba(255,255,255,0.1)', borderRadius:10, padding:'10px 14px', display:'flex', alignItems:'center', justifyContent:'space-between', border:'1px solid rgba(255,255,255,0.15)', position:'relative' }}>
            <span style={{ fontFamily:'var(--font-mono)', fontWeight:800, fontSize:16, color:'#fff', letterSpacing:'0.06em' }}>{user.referral_code || '—'}</span>
            <button onClick={copyCode} style={{ background: copied ? '#198754' : 'rgba(255,255,255,0.2)', border:'none', borderRadius:8, padding:'6px 12px', color:'#fff', fontWeight:700, fontSize:12, cursor:'pointer', display:'flex', alignItems:'center', gap:5, transition:'background 0.2s' }}>
              {copied ? <><FiCheck size={12} /> Copied!</> : <><FiCopy size={12} /> Copy</>}
            </button>
          </div>
        </motion.div>

        {/* ── Desktop sidebar (referral desktop view) ───────── */}
        <div className="hide-mobile" style={{ marginTop:16 }}>
          <div className="dashboard-grid" style={{ display:'grid', gridTemplateColumns:'1fr 320px', gap:24, alignItems:'start', marginTop:24 }} />
        </div>

      </div>
    </div>
  );
}

function EmptyState({ icon: Icon, title, subtitle, action }) {
  return (
    <div style={{ background:'#fff', borderRadius:16, padding:'40px 24px', textAlign:'center', boxShadow:'0 1px 6px rgba(0,0,0,0.05)' }}>
      <div style={{ width:56, height:56, borderRadius:'50%', background:'#f5f6fa', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 14px' }}>
        <Icon size={24} color="#9ca3af" />
      </div>
      <div style={{ fontWeight:700, fontSize:15, color:'#111', marginBottom:6 }}>{title}</div>
      <p style={{ color:'#9ca3af', marginBottom: action ? 16 : 0, fontSize:14 }}>{subtitle}</p>
      {action}
    </div>
  );
}
