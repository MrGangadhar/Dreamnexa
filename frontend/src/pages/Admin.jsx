import { useEffect, useState, useCallback, useRef } from 'react';
import client from '../api/client';
import toast from 'react-hot-toast';

/* ─────────────────────────────────────────────────────────────────────────────
   DESIGN TOKENS
   ─────────────────────────────────────────────────────────────────────────── */
const C = {
  // Sidebar / Shell
  sidebar:   '#0f172a',
  sidebarBorder: '#1e293b',
  sidebarText:   '#94a3b8',
  sidebarActive: '#7c3aed',
  sidebarActiveBg: 'rgba(124,58,237,0.14)',
  sidebarHoverBg:  'rgba(255,255,255,0.04)',

  // Page chrome
  bg:    '#f8fafc',
  card:  '#ffffff',
  border:'#e2e8f0',

  // Semantics
  purple: '#7c3aed',
  blue:   '#2563eb',
  green:  '#16a34a',
  amber:  '#d97706',
  red:    '#dc2626',
  cyan:   '#0891b2',

  // Text
  primary:   '#0f172a',
  secondary: '#475569',
  muted:     '#94a3b8',
};

const SIDEBAR_W = 232;

/* ─────────────────────────────────────────────────────────────────────────────
   NAVIGATION CONFIG
   ─────────────────────────────────────────────────────────────────────────── */
const NAV = [
  { key: 'overview',   label: 'Overview',     icon: GridIcon   },
  { key: 'users',      label: 'Users',        icon: UsersIcon  },
  { key: 'coupons',    label: 'Coupons',      icon: TagIcon    },
  { key: 'payments',   label: 'Payments',     icon: CashIcon   },
  { key: 'templates',  label: 'Contests',     icon: TrophyIcon },
  { key: 'quizzes',    label: 'Quizzes',      icon: QuizIcon   },
  { key: 'news',       label: 'News & Vlogs', icon: NewsIcon   },
  { key: 'logs',       label: 'Audit Log',    icon: LogIcon    },
];

/* ─────────────────────────────────────────────────────────────────────────────
   SVG ICON PRIMITIVES
   ─────────────────────────────────────────────────────────────────────────── */
function Icon({ d, size = 18, stroke = 'currentColor', fill = 'none', strokeWidth = 1.7 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      {Array.isArray(d) ? d.map((p, i) => <path key={i} d={p} />) : <path d={d} />}
    </svg>
  );
}
function GridIcon(p)   { return <Icon {...p} d="M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z" />; }
function UsersIcon(p)  { return <Icon {...p} d={['M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2','M23 21v-2a4 4 0 0 0-3-3.87','M16 3.13a4 4 0 0 1 0 7.75']} />; }
function TagIcon(p)    { return <Icon {...p} d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82zM7 7h.01" />; }
function CashIcon(p)   { return <Icon {...p} d={['M12 2v20','M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6']} />; }
function TrophyIcon(p) { return <Icon {...p} d={['M6 9H3l2 8h14l2-8h-3','M9 3h6v6a3 3 0 1 1-6 0V3z','M12 15v4','M8 19h8']} />; }
function QuizIcon(p)   { return <Icon {...p} d={['M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z','M14 2v6h6','M16 13H8','M16 17H8','M10 9H8']} />; }
function NewsIcon(p)   { return <Icon {...p} d={['M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2zm0 0H4','M16 12H8','M16 8H8','M16 16H8']} />; }
function LogIcon(p)    { return <Icon {...p} d={['M9 12h6','M9 16h6','M9 8h6','M5 3H3a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h18a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2h-2']} />; }
function ChevronIcon(p){ return <Icon {...p} size={14} d="M9 18l6-6-6-6" />; }
function AlertIcon(p)  { return <Icon {...p} fill="#d97706" stroke="none" d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01" />; }

/* ─────────────────────────────────────────────────────────────────────────────
   SHARED HELPERS
   ─────────────────────────────────────────────────────────────────────────── */
const ARTICLE_CATEGORIES = ['general','india','education','government','jobs','technology','ai','economy','science','sports','international','business'];

function fmtDate(d)     { if(!d) return '—'; return new Date(d).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'}); }
function fmtTime(d)     { if(!d) return '—'; return new Date(d).toLocaleString('en-IN',{day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'}); }
function fmtNum(n)      { return Number(n||0).toLocaleString(); }

const STATUS_CLR = { active:'#16a34a', suspended:'#d97706', deleted:'#dc2626', Processing:'#d97706', Completed:'#16a34a', Failed:'#dc2626' };

function Badge({ label, color }) {
  return (
    <span style={{
      display:'inline-block', padding:'2px 9px', borderRadius:999,
      fontSize:11, fontWeight:700, letterSpacing:'0.03em',
      background: (color||'#7c3aed')+'18', color: color||'#7c3aed',
    }}>{label}</span>
  );
}

function Card({ children, style, pad = 20 }) {
  return (
    <div style={{
      background:C.card, border:`1px solid ${C.border}`,
      borderRadius:12, padding:pad, boxShadow:'0 1px 3px rgba(0,0,0,0.06)', ...style,
    }}>{children}</div>
  );
}

function Spinner() {
  return (
    <div style={{display:'flex',alignItems:'center',justifyContent:'center',padding:40}}>
      <div style={{width:32,height:32,borderRadius:'50%',border:`3px solid ${C.border}`,borderTopColor:C.purple,animation:'spin .7s linear infinite'}} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

function EmptyTable({msg='No records found.'}) {
  return (
    <div style={{padding:'40px 20px',textAlign:'center',color:C.muted}}>
      <div style={{fontSize:36,marginBottom:8}}>📭</div>
      <p style={{fontSize:13}}>{msg}</p>
    </div>
  );
}

/* Generic data table */
function DataTable({ cols, rows, onRow }) {
  if(!rows?.length) return <EmptyTable />;
  return (
    <div style={{overflowX:'auto'}}>
      <table style={{width:'100%',borderCollapse:'collapse',fontSize:13}}>
        <thead>
          <tr style={{background:'#f8fafc',borderBottom:`2px solid ${C.border}`}}>
            {cols.map(c=>(
              <th key={c.key} style={{padding:'10px 14px',textAlign:'left',fontWeight:700,fontSize:11,color:C.muted,textTransform:'uppercase',letterSpacing:'0.06em',whiteSpace:'nowrap'}}>{c.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row,i)=>(
            <tr key={i}
              onClick={()=>onRow&&onRow(row)}
              style={{borderBottom:`1px solid ${C.border}`,cursor:onRow?'pointer':'default',transition:'background .12s'}}
              onMouseEnter={e=>{ if(onRow) e.currentTarget.style.background='#f8fafc'; }}
              onMouseLeave={e=>{ e.currentTarget.style.background='transparent'; }}
            >
              {cols.map(c=>(
                <td key={c.key} style={{padding:'11px 14px',verticalAlign:'middle',...(c.style||{})}}>
                  {c.render?c.render(row):row[c.key]??'—'}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* Form input */
const INP = { width:'100%', padding:'9px 12px', border:`1px solid ${C.border}`, borderRadius:8, background:'#f8fafc', color:C.primary, fontSize:13, boxSizing:'border-box', outline:'none' };
const LBL = { display:'block', fontSize:11, fontWeight:700, color:C.secondary, marginBottom:5, textTransform:'uppercase', letterSpacing:'0.06em' };

/* Modal */
function Modal({ title, onClose, children, wide }) {
  return (
    <div style={{position:'fixed',inset:0,zIndex:2000,background:'rgba(15,23,42,0.6)',backdropFilter:'blur(3px)',display:'flex',alignItems:'flex-start',justifyContent:'center',padding:'48px 16px',overflowY:'auto'}}
      onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:16,padding:28,width:'100%',maxWidth:wide?860:520,boxShadow:'0 25px 60px rgba(0,0,0,0.2)',position:'relative'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20}}>
          <div style={{fontWeight:700,fontSize:17,color:C.primary}}>{title}</div>
          <button onClick={onClose} style={{background:'none',border:'none',cursor:'pointer',color:C.muted,fontSize:20,lineHeight:1,padding:4}}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

/* Inline SVG sparkline chart */
function Sparkline({ data=[], color='#7c3aed', height=48, width=180 }) {
  if(!data.length) return null;
  const max=Math.max(...data,1), min=Math.min(...data,0);
  const range=max-min||1;
  const pts=data.map((v,i)=>{
    const x=(i/(data.length-1))*width;
    const y=height-((v-min)/range)*(height-8)-4;
    return `${x},${y}`;
  });
  return (
    <svg width={width} height={height} style={{overflow:'visible'}}>
      <defs>
        <linearGradient id={`sg${color.replace('#','')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.18"/>
          <stop offset="100%" stopColor={color} stopOpacity="0"/>
        </linearGradient>
      </defs>
      <polygon points={`0,${height} ${pts.join(' ')} ${width},${height}`} fill={`url(#sg${color.replace('#','')})`} />
      <polyline points={pts.join(' ')} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      {/* last dot */}
      <circle cx={pts[pts.length-1].split(',')[0]} cy={pts[pts.length-1].split(',')[1]} r="3" fill={color} />
    </svg>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   ROOT LAYOUT
   ─────────────────────────────────────────────────────────────────────────── */
export default function Admin() {
  const [tab, setTab] = useState('overview');
  const [sideOpen, setSideOpen] = useState(true);

  return (
    <div style={{display:'flex',minHeight:'100vh',background:C.bg,fontFamily:"'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif"}}>

      {/* ── SIDEBAR ─────────────────────────────────────────────────────── */}
      <aside style={{
        width: sideOpen?SIDEBAR_W:64, flexShrink:0,
        background:C.sidebar, borderRight:`1px solid ${C.sidebarBorder}`,
        display:'flex', flexDirection:'column',
        position:'sticky', top:0, height:'100vh', overflowY:'auto',
        transition:'width .22s cubic-bezier(.4,0,.2,1)', overflowX:'hidden',
        zIndex:100,
      }}>
        {/* Brand */}
        <div style={{padding:'20px 16px 16px',display:'flex',alignItems:'center',gap:10,borderBottom:`1px solid ${C.sidebarBorder}`,flexShrink:0}}>
          <div style={{width:34,height:34,borderRadius:9,background:'linear-gradient(135deg,#7c3aed,#2563eb)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:16,flexShrink:0,boxShadow:'0 2px 8px rgba(124,58,237,0.4)'}}>⚡</div>
          {sideOpen&&<div>
            <div style={{color:'#f1f5f9',fontWeight:800,fontSize:14,letterSpacing:'-0.02em',lineHeight:1.1}}>DreamNexa</div>
            <div style={{color:C.sidebarText,fontSize:10,fontWeight:600,letterSpacing:'0.08em',textTransform:'uppercase'}}>Admin Panel</div>
          </div>}
          <button onClick={()=>setSideOpen(!sideOpen)} style={{marginLeft:'auto',background:'none',border:'none',cursor:'pointer',color:C.sidebarText,padding:4,flexShrink:0,transition:'color .15s'}}
            onMouseEnter={e=>e.currentTarget.style.color='#f1f5f9'} onMouseLeave={e=>e.currentTarget.style.color=C.sidebarText}>
            <Icon size={16} d={sideOpen?'M11 19l-7-7 7-7m8 14l-7-7 7-7':'M13 5l7 7-7 7M5 5l7 7-7 7'} />
          </button>
        </div>

        {/* Nav Links */}
        <nav style={{flex:1,padding:'12px 8px',display:'flex',flexDirection:'column',gap:2}}>
          {NAV.map(n=>{
            const active=tab===n.key;
            return (
              <button key={n.key} onClick={()=>setTab(n.key)}
                title={!sideOpen?n.label:undefined}
                style={{
                  display:'flex',alignItems:'center',gap:10,
                  padding:'9px 10px',borderRadius:9,border:'none',cursor:'pointer',
                  background:active?C.sidebarActiveBg:'transparent',
                  color:active?'#a78bfa':C.sidebarText,
                  fontWeight:active?700:500, fontSize:13,
                  transition:'all .15s', textAlign:'left',
                  whiteSpace:'nowrap',
                }}
                onMouseEnter={e=>{ if(!active){ e.currentTarget.style.background=C.sidebarHoverBg; e.currentTarget.style.color='#e2e8f0'; }}}
                onMouseLeave={e=>{ if(!active){ e.currentTarget.style.background='transparent'; e.currentTarget.style.color=C.sidebarText; }}}
              >
                <span style={{flexShrink:0,width:18,height:18,display:'flex',alignItems:'center',justifyContent:'center'}}>
                  <n.icon size={18} stroke={active?'#a78bfa':C.sidebarText} />
                </span>
                {sideOpen&&<span>{n.label}</span>}
                {active&&sideOpen&&<span style={{marginLeft:'auto',width:6,height:6,borderRadius:'50%',background:'#7c3aed'}}/>}
              </button>
            );
          })}
        </nav>

        {/* Admin badge */}
        {sideOpen&&(
          <div style={{padding:'12px 14px',borderTop:`1px solid ${C.sidebarBorder}`,display:'flex',alignItems:'center',gap:10}}>
            <div style={{width:30,height:30,borderRadius:'50%',background:'linear-gradient(135deg,#7c3aed,#2563eb)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,flexShrink:0}}>👤</div>
            <div style={{overflow:'hidden'}}>
              <div style={{color:'#e2e8f0',fontSize:12,fontWeight:700,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>Admin</div>
              <div style={{color:C.sidebarText,fontSize:10}}>Superuser</div>
            </div>
          </div>
        )}
      </aside>

      {/* ── MAIN CONTENT ─────────────────────────────────────────────────── */}
      <div style={{flex:1,display:'flex',flexDirection:'column',minWidth:0}}>

        {/* Top bar */}
        <header style={{
          background:C.card, borderBottom:`1px solid ${C.border}`,
          padding:'0 28px', height:60, display:'flex', alignItems:'center',
          gap:16, position:'sticky', top:0, zIndex:50, flexShrink:0,
          boxShadow:'0 1px 3px rgba(0,0,0,0.05)',
        }}>
          <div style={{flex:1}}>
            <div style={{fontWeight:800,fontSize:16,color:C.primary}}>{NAV.find(n=>n.key===tab)?.label}</div>
            <div style={{fontSize:11,color:C.muted}}>DreamNexa Admin Control Room</div>
          </div>
          <div style={{display:'flex',alignItems:'center',gap:8}}>
            <div style={{padding:'6px 14px',borderRadius:20,background:'linear-gradient(135deg,rgba(124,58,237,0.1),rgba(37,99,235,0.1))',color:C.purple,fontWeight:700,fontSize:12,border:`1px solid rgba(124,58,237,0.2)`}}>⚡ Admin</div>
          </div>
        </header>

        {/* Page body */}
        <main style={{flex:1,padding:'24px 28px',minWidth:0}}>
          {tab==='overview'  && <Overview  />}
          {tab==='users'     && <UsersTab  />}
          {tab==='coupons'   && <CouponsTab/>}
          {tab==='payments'  && <PaymentsTab/>}
          {tab==='templates' && <Templates />}
          {tab==='quizzes'   && <Quizzes   />}
          {tab==='news'      && <NewsManager/>}
          {tab==='logs'      && <AuditLog  />}
        </main>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   OVERVIEW
   ─────────────────────────────────────────────────────────────────────────── */
function Overview() {
  const [stats, setStats]     = useState(null);
  const [bulk, setBulk]       = useState({ amount:'', reason:'' });
  const [bulkSaving, setBulkSaving] = useState(false);

  useEffect(()=>{
    client.get('/admin/dashboard').then(({data})=>setStats(data)).catch(()=>{});
  },[]);

  const handleBulk = async e => {
    e.preventDefault();
    if(!bulk.amount||!bulk.reason) { toast.error('Fill amount and reason.'); return; }
    setBulkSaving(true);
    try {
      const {data} = await client.post('/admin/users/bulk-credit', {amount:Number(bulk.amount),reason:bulk.reason});
      toast.success(data.message);
      setBulk({amount:'',reason:''});
    } catch(err) {
      toast.error(err.response?.data?.error||'Failed to bulk credit.');
    } finally { setBulkSaving(false); }
  };

  if(!stats) return <Spinner/>;

  const { totalStudents, publishedQuizzes, activeTemplates, contestsByStatus=[], topColleges=[], pendingWithdrawals, activeCoupons } = stats;

  // Fake sparkline data for visual demo (would come from a time-series API)
  const sparkData = [12,18,14,22,28,19,35,31,40,38,45,52];

  const statCards = [
    { label:'Total Students',    value:fmtNum(totalStudents),    icon:'🎓', color:C.purple, spark:sparkData },
    { label:'Published Quizzes', value:fmtNum(publishedQuizzes), icon:'📝', color:C.blue,   spark:[5,7,6,8,7,9,8,11,10,12,14,13] },
    { label:'Active Contests',   value:fmtNum(activeTemplates),  icon:'🏆', color:C.green,  spark:[2,3,2,4,3,5,4,6,5,7,6,8] },
    { label:'Active Coupons',    value:fmtNum(activeCoupons||0), icon:'🎫', color:C.amber,  spark:[0,1,0,2,1,3,2,4,3,5,4,6] },
  ];

  return (
    <div style={{display:'flex',flexDirection:'column',gap:22}}>

      {/* Pending alert */}
      {parseInt(pendingWithdrawals?.count||0)>0 && (
        <div style={{background:'#fffbeb',border:'1px solid #fde68a',borderRadius:12,padding:'14px 18px',display:'flex',alignItems:'center',gap:12}}>
          <AlertIcon size={20}/>
          <div style={{flex:1}}>
            <span style={{fontWeight:700,color:'#92400e',fontSize:13}}>{pendingWithdrawals.count} Pending Withdrawal Request{pendingWithdrawals.count>1?'s':''}</span>
            <span style={{color:'#b45309',fontSize:12,marginLeft:10}}>Total ₹{parseFloat(pendingWithdrawals.total||0).toFixed(2)} awaiting approval</span>
          </div>
          <span style={{fontSize:11,color:'#b45309',fontWeight:600}}>→ Go to Payments tab</span>
        </div>
      )}

      {/* Stat cards */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:16}}>
        {statCards.map(s=>(
          <Card key={s.label} style={{position:'relative',overflow:'hidden',cursor:'default'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
              <div>
                <div style={{fontSize:11,fontWeight:700,color:C.muted,textTransform:'uppercase',letterSpacing:'0.07em',marginBottom:6}}>{s.label}</div>
                <div style={{fontSize:28,fontWeight:800,color:C.primary,fontFamily:'monospace',lineHeight:1}}>{s.value}</div>
              </div>
              <div style={{fontSize:24,opacity:.8}}>{s.icon}</div>
            </div>
            <div style={{marginTop:14}}>
              <Sparkline data={s.spark} color={s.color} height={40} width={150}/>
            </div>
            <div style={{position:'absolute',top:0,right:0,width:4,bottom:0,background:s.color,borderRadius:'0 12px 12px 0',opacity:.6}}/>
          </Card>
        ))}
      </div>

      {/* Middle row */}
      <div style={{display:'grid',gridTemplateColumns:'1.4fr 1fr',gap:16}}>

        {/* Contest Status + Top Colleges */}
        <div style={{display:'flex',flexDirection:'column',gap:16}}>
          <Card>
            <div style={{fontWeight:700,fontSize:14,color:C.primary,marginBottom:14,display:'flex',alignItems:'center',gap:8}}>
              <TrophyIcon size={16} stroke={C.purple}/> Contest Status Breakdown
            </div>
            <div style={{display:'flex',flexDirection:'column',gap:8}}>
              {contestsByStatus.map(s=>{
                const total=contestsByStatus.reduce((a,b)=>a+parseInt(b.count),0)||1;
                const pct=Math.round((parseInt(s.count)/total)*100);
                const clr = s.status==='live'?C.green:s.status==='upcoming'?C.blue:s.status==='completed'?C.purple:C.muted;
                return (
                  <div key={s.status}>
                    <div style={{display:'flex',justifyContent:'space-between',marginBottom:4}}>
                      <span style={{fontSize:12,fontWeight:600,color:C.secondary,textTransform:'capitalize'}}>{s.status}</span>
                      <span style={{fontSize:12,fontWeight:700,color:C.primary,fontFamily:'monospace'}}>{s.count}</span>
                    </div>
                    <div style={{height:6,borderRadius:99,background:C.border,overflow:'hidden'}}>
                      <div style={{height:'100%',width:`${pct}%`,background:clr,borderRadius:99,transition:'width .4s ease'}}/>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          <Card>
            <div style={{fontWeight:700,fontSize:14,color:C.primary,marginBottom:14,display:'flex',alignItems:'center',gap:8}}>
              <UsersIcon size={16} stroke={C.blue}/> Top Colleges
            </div>
            <div style={{display:'flex',flexDirection:'column',gap:8}}>
              {topColleges.slice(0,6).map((c,i)=>(
                <div key={c.college} style={{display:'flex',alignItems:'center',gap:10}}>
                  <div style={{width:22,height:22,borderRadius:6,background:i===0?'linear-gradient(135deg,#fbbf24,#d97706)':i===1?'linear-gradient(135deg,#94a3b8,#64748b)':i===2?'linear-gradient(135deg,#c0834a,#92400e)':'#f1f5f9',display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,fontWeight:800,color:i<3?'#fff':C.muted,flexShrink:0}}>
                    {i+1}
                  </div>
                  <div style={{flex:1,fontSize:12,fontWeight:600,color:C.secondary,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{c.college}</div>
                  <div style={{fontSize:12,fontWeight:700,fontFamily:'monospace',color:C.primary}}>{c.student_count}</div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Bulk Credit + Quick Actions */}
        <div style={{display:'flex',flexDirection:'column',gap:16}}>
          <Card style={{background:'linear-gradient(135deg,rgba(124,58,237,0.05),rgba(37,99,235,0.05))',border:`1px solid rgba(124,58,237,0.15)`}}>
            <div style={{fontWeight:700,fontSize:14,color:C.primary,marginBottom:4,display:'flex',alignItems:'center',gap:8}}>
              ⚡ Bulk Credit Points
            </div>
            <p style={{fontSize:12,color:C.muted,marginBottom:14}}>Credit points to all active students at once.</p>
            <form onSubmit={handleBulk} style={{display:'flex',flexDirection:'column',gap:10}}>
              <div>
                <label style={LBL}>Points per Student</label>
                <input type="number" min={1} style={INP} placeholder="e.g. 50" value={bulk.amount} onChange={e=>setBulk({...bulk,amount:e.target.value})} />
              </div>
              <div>
                <label style={LBL}>Reason</label>
                <input style={INP} placeholder="e.g. Festival bonus" value={bulk.reason} onChange={e=>setBulk({...bulk,reason:e.target.value})} />
              </div>
              <button type="submit" disabled={bulkSaving} style={{padding:'9px 18px',borderRadius:8,border:'none',cursor:'pointer',background:'linear-gradient(135deg,#7c3aed,#2563eb)',color:'#fff',fontWeight:700,fontSize:13,transition:'opacity .15s',opacity:bulkSaving?.6:1}}>
                {bulkSaving?'Crediting…':'🚀 Credit to All Students'}
              </button>
            </form>
          </Card>

          <Card>
            <div style={{fontWeight:700,fontSize:14,color:C.primary,marginBottom:14}}>📊 Quick Stats</div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
              {[
                ['Total Students',fmtNum(totalStudents),'#7c3aed'],
                ['Published Quizzes',fmtNum(publishedQuizzes),'#2563eb'],
                ['Active Templates',fmtNum(activeTemplates),'#16a34a'],
                ['Active Coupons',fmtNum(activeCoupons||0),'#d97706'],
              ].map(([lbl,val,clr])=>(
                <div key={lbl} style={{background:'#f8fafc',borderRadius:10,padding:'12px 14px',borderLeft:`3px solid ${clr}`}}>
                  <div style={{fontSize:10,fontWeight:700,color:C.muted,textTransform:'uppercase',letterSpacing:'0.06em',marginBottom:4}}>{lbl}</div>
                  <div style={{fontSize:20,fontWeight:800,fontFamily:'monospace',color:C.primary}}>{val}</div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   USERS TAB
   ─────────────────────────────────────────────────────────────────────────── */
function UsersTab() {
  const [search,setSearch] = useState('');
  const [roleFilter,setRoleFilter] = useState('');
  const [users,setUsers]   = useState([]);
  const [loading,setLoading] = useState(false);
  const [selected,setSelected] = useState(null);
  const [details,setDetails]   = useState(null);
  const [detailTab,setDetailTab] = useState('info');
  const [editMode,setEditMode] = useState(false);
  const [editForm,setEditForm] = useState({});
  const [walletForm,setWalletForm] = useState({});
  const [ptForm,setPtForm] = useState({amount:'',reason:''});
  const [saving,setSaving]   = useState(false);

  const load = useCallback(()=>{
    setLoading(true);
    client.get('/admin/users',{params:{search}})
      .then(({data})=>setUsers(data))
      .catch(()=>toast.error('Failed to load users.'))
      .finally(()=>setLoading(false));
  },[search]);

  useEffect(()=>{ load(); },[load]);

  const openUser = async u => {
    setSelected(u); setDetails(null); setDetailTab('info'); setEditMode(false);
    try {
      const {data}=await client.get(`/admin/users/${u.id}`);
      setDetails(data);
      setEditForm({username:data.user.username,email:data.user.email,mobile:data.user.mobile||'',role:data.user.role,status:data.user.status,password:'',fullName:data.user.full_name,college:data.user.college||'',university:data.user.university||'',state:data.user.state||'',city:data.user.city||''});
      setWalletForm({availablePrize:parseFloat(data.wallet?.available_prize||0).toFixed(2),lifetimePrize:parseFloat(data.wallet?.lifetime_prize||0).toFixed(2),reason:''});
    } catch { toast.error('Failed to load details.'); }
  };

  const saveEdit = async e => {
    e.preventDefault(); setSaving(true);
    try {
      const p={...editForm}; if(!p.password) delete p.password;
      await client.put(`/admin/users/${selected.id}`,p);
      toast.success('User updated.');
      const {data}=await client.get(`/admin/users/${selected.id}`); setDetails(data);
      setEditMode(false); load();
    } catch(err){ toast.error(err.response?.data?.error||'Failed.'); }
    finally{ setSaving(false); }
  };

  const saveWallet = async e => {
    e.preventDefault(); setSaving(true);
    try {
      await client.post(`/admin/users/${selected.id}/wallet-adjustment`,{availablePrize:parseFloat(walletForm.availablePrize),lifetimePrize:parseFloat(walletForm.lifetimePrize),reason:walletForm.reason});
      toast.success('Wallet adjusted.');
      const {data}=await client.get(`/admin/users/${selected.id}`); setDetails(data);
    } catch(err){ toast.error(err.response?.data?.error||'Failed.'); }
    finally{ setSaving(false); }
  };

  const savePoints = async e => {
    e.preventDefault();
    if(!ptForm.amount||!ptForm.reason){ toast.error('Fill all fields.'); return; }
    setSaving(true);
    try {
      await client.post(`/admin/users/${selected.id}/points-adjustment`,{amount:Number(ptForm.amount),reason:ptForm.reason});
      toast.success('Points adjusted.');
      setPtForm({amount:'',reason:''});
      const {data}=await client.get(`/admin/users/${selected.id}`); setDetails(data); load();
    } catch(err){ toast.error(err.response?.data?.error||'Failed.'); }
    finally{ setSaving(false); }
  };

  const setStatus = async (id,status) => {
    try { await client.patch(`/admin/users/${id}/status`,{status}); toast.success(`User ${status}.`); load(); if(selected?.id===id){ const {data}=await client.get(`/admin/users/${id}`); setDetails(data); } }
    catch { toast.error('Failed.'); }
  };

  const delUser = async id => {
    if(!confirm('Soft-delete this user?')) return;
    try { await client.delete(`/admin/users/${id}`); toast.success('User deleted.'); setSelected(null); load(); }
    catch { toast.error('Failed.'); }
  };

  const filteredUsers = users.filter(u=>!roleFilter||u.role===roleFilter);

  return (
    <div style={{display:'grid',gridTemplateColumns:selected?'340px 1fr':'1fr',gap:18,alignItems:'flex-start'}}>
      {/* User list */}
      <div>
        <Card pad={0}>
          <div style={{padding:'16px 18px',borderBottom:`1px solid ${C.border}`,display:'flex',alignItems:'center',gap:10}}>
            <div style={{flex:1,fontWeight:700,fontSize:14,color:C.primary}}>All Users</div>
            <span style={{fontSize:11,color:C.muted,fontWeight:600}}>{filteredUsers.length}</span>
          </div>
          <div style={{padding:'12px 18px',borderBottom:`1px solid ${C.border}`,display:'flex',gap:8,flexDirection:'column'}}>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search name, email, username…" style={{...INP}}/>
            <div style={{display:'flex',gap:6}}>
              {['','student','admin'].map(r=>(
                <button key={r} onClick={()=>setRoleFilter(r)} style={{flex:1,padding:'5px 8px',borderRadius:6,border:'none',cursor:'pointer',fontSize:11,fontWeight:700,background:roleFilter===r?C.purple:'#f1f5f9',color:roleFilter===r?'#fff':C.secondary,transition:'all .15s'}}>
                  {r===''?'All':r.charAt(0).toUpperCase()+r.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div style={{maxHeight:'60vh',overflowY:'auto'}}>
            {loading?<Spinner/>:filteredUsers.map(u=>{
              const isActive=selected?.id===u.id;
              return (
                <div key={u.id} onClick={()=>openUser(u)} style={{padding:'12px 18px',cursor:'pointer',borderBottom:`1px solid ${C.border}`,background:isActive?'rgba(124,58,237,0.05)':'transparent',borderLeft:isActive?`3px solid ${C.purple}`:'3px solid transparent',transition:'all .12s'}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
                    <div style={{minWidth:0}}>
                      <div style={{fontWeight:700,fontSize:13,color:C.primary,marginBottom:2}}>{u.full_name}</div>
                      <div style={{fontSize:11,color:C.muted,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>@{u.username} · {u.email}</div>
                    </div>
                    <div style={{display:'flex',flexDirection:'column',alignItems:'flex-end',gap:3,flexShrink:0,marginLeft:8}}>
                      <Badge label={u.status} color={STATUS_CLR[u.status]}/>
                      <span style={{fontSize:10,color:C.muted,fontWeight:700,fontFamily:'monospace'}}>{fmtNum(u.total_points)} pts</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Detail panel */}
      {selected&&(
        <Card pad={0}>
          {/* Header */}
          <div style={{padding:'16px 20px',borderBottom:`1px solid ${C.border}`,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <div>
              <div style={{fontWeight:800,fontSize:16,color:C.primary}}>{details?.user?.full_name||selected.full_name}</div>
              <div style={{fontSize:12,color:C.muted}}>@{selected.username} · {selected.email}</div>
            </div>
            <div style={{display:'flex',gap:6}}>
              <button onClick={()=>setEditMode(!editMode)} style={{padding:'6px 14px',borderRadius:8,border:`1px solid ${C.border}`,background:'#fff',cursor:'pointer',fontSize:12,fontWeight:700,color:C.secondary}}>{editMode?'Cancel':'✏️ Edit'}</button>
              <button onClick={()=>delUser(selected.id)} style={{padding:'6px 14px',borderRadius:8,border:`1px solid #fecaca`,background:'#fff',cursor:'pointer',fontSize:12,fontWeight:700,color:C.red}}>🗑</button>
              <button onClick={()=>setSelected(null)} style={{padding:'6px 12px',borderRadius:8,border:`1px solid ${C.border}`,background:'#fff',cursor:'pointer',fontSize:14,color:C.muted}}>✕</button>
            </div>
          </div>

          {/* Sub-tabs */}
          <div style={{display:'flex',borderBottom:`1px solid ${C.border}`,background:'#f8fafc'}}>
            {[['info','ℹ️ Info'],['wallet','💳 Wallet'],['quiz','📝 Quizzes'],['withdraw','💸 Payments'],['coupons','🎫 Coupons']].map(([k,l])=>(
              <button key={k} onClick={()=>setDetailTab(k)} style={{flex:1,padding:'11px 8px',border:'none',background:'transparent',cursor:'pointer',fontSize:11,fontWeight:detailTab===k?700:500,color:detailTab===k?C.purple:C.muted,borderBottom:detailTab===k?`2px solid ${C.purple}`:'2px solid transparent',transition:'all .15s'}}>
                {l}
              </button>
            ))}
          </div>

          <div style={{padding:20,maxHeight:'72vh',overflowY:'auto'}}>
            {!details?<Spinner/>:<>
              {/* INFO / EDIT */}
              {detailTab==='info'&&(
                editMode?(
                  <form onSubmit={saveEdit} style={{display:'flex',flexDirection:'column',gap:14}}>
                    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
                      {[['username','Username'],['email','Email'],['mobile','Mobile'],['fullName','Full Name'],['college','College'],['university','University'],['state','State'],['city','City']].map(([k,l])=>(
                        <div key={k}><label style={LBL}>{l}</label><input style={INP} value={editForm[k]} onChange={e=>setEditForm({...editForm,[k]:e.target.value})} /></div>
                      ))}
                    </div>
                    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:12}}>
                      <div><label style={LBL}>Role</label><select style={INP} value={editForm.role} onChange={e=>setEditForm({...editForm,role:e.target.value})}><option value="student">Student</option><option value="admin">Admin</option></select></div>
                      <div><label style={LBL}>Status</label><select style={INP} value={editForm.status} onChange={e=>setEditForm({...editForm,status:e.target.value})}><option value="active">Active</option><option value="suspended">Suspended</option><option value="deleted">Deleted</option></select></div>
                      <div><label style={LBL}>New Password</label><input type="password" style={INP} placeholder="Leave blank to keep" value={editForm.password} onChange={e=>setEditForm({...editForm,password:e.target.value})} /></div>
                    </div>
                    <div style={{display:'flex',gap:8}}>
                      <button type="submit" disabled={saving} style={{padding:'9px 20px',borderRadius:8,border:'none',cursor:'pointer',background:'linear-gradient(135deg,#7c3aed,#2563eb)',color:'#fff',fontWeight:700,fontSize:13}}>{saving?'Saving…':'💾 Save Changes'}</button>
                    </div>
                  </form>
                ):(
                  <div>
                    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:16}}>
                      {[['Username','@'+details.user.username],['Email',details.user.email],['Mobile',details.user.mobile||'—'],['Role',details.user.role],['Status',details.user.status],['College',details.user.college||'—'],['Joined',fmtDate(details.user.created_at)],['Referral Code',details.user.referral_code||'—'],['Total Points',fmtNum(details.user.total_points)],['Contests',details.user.total_contests||0],['Quizzes Played',details.user.total_quizzes_played||0],['Contests Won',details.user.contests_won||0]].map(([k,v])=>(
                        <div key={k} style={{background:'#f8fafc',borderRadius:8,padding:'10px 12px'}}>
                          <div style={{fontSize:10,fontWeight:700,color:C.muted,textTransform:'uppercase',letterSpacing:'0.06em',marginBottom:3}}>{k}</div>
                          <div style={{fontSize:13,fontWeight:600,color:C.primary,wordBreak:'break-all'}}>{typeof v==='object'?JSON.stringify(v):v}</div>
                        </div>
                      ))}
                    </div>
                    <div style={{display:'flex',gap:8}}>
                      <button onClick={()=>setStatus(selected.id,details.user.status==='active'?'suspended':'active')} style={{padding:'8px 16px',borderRadius:8,border:`1px solid ${C.border}`,background:'#fff',cursor:'pointer',fontSize:12,fontWeight:700,color:details.user.status==='active'?C.amber:C.green}}>
                        {details.user.status==='active'?'🚫 Suspend':'✅ Reactivate'}
                      </button>
                    </div>
                  </div>
                )
              )}

              {/* WALLET */}
              {detailTab==='wallet'&&(
                <div style={{display:'flex',flexDirection:'column',gap:14}}>
                  {details.wallet&&(
                    <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10}}>
                      {[['Current Points',fmtNum(details.wallet.current_points),'#7c3aed'],['Available Prize','₹'+parseFloat(details.wallet.available_prize||0).toFixed(2),'#16a34a'],['Lifetime Prize','₹'+parseFloat(details.wallet.lifetime_prize||0).toFixed(2),'#2563eb']].map(([l,v,c])=>(
                        <div key={l} style={{background:'#f8fafc',borderRadius:10,padding:'14px 16px',textAlign:'center',borderTop:`3px solid ${c}`}}>
                          <div style={{fontSize:10,fontWeight:700,color:C.muted,textTransform:'uppercase',letterSpacing:'0.07em',marginBottom:6}}>{l}</div>
                          <div style={{fontSize:22,fontWeight:800,fontFamily:'monospace',color:C.primary}}>{v}</div>
                        </div>
                      ))}
                    </div>
                  )}
                  <div style={{background:'#f8fafc',borderRadius:10,padding:16}}>
                    <div style={{fontWeight:700,fontSize:12,color:C.secondary,marginBottom:12}}>🎯 Adjust Prize Balance</div>
                    <form onSubmit={saveWallet} style={{display:'flex',flexDirection:'column',gap:10}}>
                      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
                        <div><label style={LBL}>Available (₹)</label><input type="number" step="0.01" style={INP} value={walletForm.availablePrize} onChange={e=>setWalletForm({...walletForm,availablePrize:e.target.value})}/></div>
                        <div><label style={LBL}>Lifetime (₹)</label><input type="number" step="0.01" style={INP} value={walletForm.lifetimePrize} onChange={e=>setWalletForm({...walletForm,lifetimePrize:e.target.value})}/></div>
                      </div>
                      <div><label style={LBL}>Reason</label><input style={INP} placeholder="Reason…" value={walletForm.reason} onChange={e=>setWalletForm({...walletForm,reason:e.target.value})}/></div>
                      <button type="submit" disabled={saving} style={{padding:'8px 16px',borderRadius:8,border:'none',cursor:'pointer',background:C.purple,color:'#fff',fontWeight:700,fontSize:12,alignSelf:'flex-start'}}>{saving?'…':'Save Wallet'}</button>
                    </form>
                  </div>
                  <div style={{background:'#f8fafc',borderRadius:10,padding:16}}>
                    <div style={{fontWeight:700,fontSize:12,color:C.secondary,marginBottom:12}}>⚡ Adjust Points</div>
                    <form onSubmit={savePoints} style={{display:'flex',gap:8,flexWrap:'wrap',alignItems:'flex-end'}}>
                      <div style={{flex:'0 0 110px'}}><label style={LBL}>Amount (±)</label><input type="number" style={INP} placeholder="+100/-50" value={ptForm.amount} onChange={e=>setPtForm({...ptForm,amount:e.target.value})}/></div>
                      <div style={{flex:1,minWidth:160}}><label style={LBL}>Reason</label><input style={INP} placeholder="Reason…" value={ptForm.reason} onChange={e=>setPtForm({...ptForm,reason:e.target.value})}/></div>
                      <button type="submit" disabled={saving} style={{padding:'9px 16px',borderRadius:8,border:'none',cursor:'pointer',background:C.blue,color:'#fff',fontWeight:700,fontSize:12}}>{saving?'…':'Apply'}</button>
                    </form>
                  </div>
                </div>
              )}

              {/* QUIZ HISTORY */}
              {detailTab==='quiz'&&(
                details.quizHistory?.length===0?<EmptyTable msg="No quiz attempts yet."/>:
                <DataTable cols={[
                  {key:'quiz_title',label:'Quiz',render:r=><span style={{fontWeight:600,fontSize:12}}>{r.quiz_title}</span>},
                  {key:'contest_name',label:'Contest',render:r=><span style={{fontSize:12,color:C.muted}}>{r.contest_name}</span>},
                  {key:'score',label:'Score',render:r=><span style={{fontFamily:'monospace',fontWeight:700}}>{r.score??'—'}</span>},
                  {key:'rank',label:'Rank',render:r=><span style={{fontWeight:700,color:C.purple}}>#{r.rank??'—'}</span>},
                  {key:'points_awarded',label:'Points',render:r=><span style={{fontWeight:700,color:C.green}}>+{r.points_awarded||0}</span>},
                  {key:'started_at',label:'Date',render:r=><span style={{fontSize:11,color:C.muted}}>{fmtDate(r.started_at)}</span>},
                ]} rows={details.quizHistory}/>
              )}

              {/* WITHDRAW */}
              {detailTab==='withdraw'&&(
                details.withdrawHistory?.length===0?<EmptyTable msg="No withdrawal history."/>:
                <DataTable cols={[
                  {key:'amount',label:'Amount',render:r=><span style={{fontWeight:800,fontFamily:'monospace'}}>₹{parseFloat(r.amount).toFixed(2)}</span>},
                  {key:'method',label:'Method'},
                  {key:'status',label:'Status',render:r=><Badge label={r.status} color={STATUS_CLR[r.status]}/>},
                  {key:'transaction_id',label:'Txn ID',render:r=><span style={{fontFamily:'monospace',fontSize:11}}>{r.transaction_id||'—'}</span>},
                  {key:'created_at',label:'Date',render:r=><span style={{fontSize:11,color:C.muted}}>{fmtDate(r.created_at)}</span>},
                ]} rows={details.withdrawHistory}/>
              )}

              {/* COUPONS */}
              {detailTab==='coupons'&&(
                details.couponHistory?.length===0?<EmptyTable msg="No coupons redeemed."/>:
                <DataTable cols={[
                  {key:'code',label:'Code',render:r=><span style={{fontFamily:'monospace',fontWeight:800,letterSpacing:'0.06em',color:C.purple}}>{r.code}</span>},
                  {key:'points_awarded',label:'Points',render:r=><span style={{fontWeight:700,color:C.green}}>+{r.points_awarded}</span>},
                  {key:'reward_awarded',label:'Prize',render:r=><span style={{fontWeight:700,color:C.purple}}>₹{parseFloat(r.reward_awarded).toFixed(2)}</span>},
                  {key:'redeemed_at',label:'Date',render:r=><span style={{fontSize:11,color:C.muted}}>{fmtTime(r.redeemed_at)}</span>},
                ]} rows={details.couponHistory}/>
              )}
            </>}
          </div>
        </Card>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   COUPONS TAB
   ─────────────────────────────────────────────────────────────────────────── */
const EMPTY_CPT = {code:'',points:0,rewardAmount:0,maxRedemptions:'',expiresAt:'',isActive:true};

function CouponsTab() {
  const [view,setView]     = useState('list');
  const [coupons,setCoupons] = useState([]);
  const [redemptions,setRedemptions] = useState([]);
  const [searchR,setSearchR] = useState('');
  const [form,setForm]     = useState({...EMPTY_CPT});
  const [editId,setEditId] = useState(null);
  const [showForm,setShowForm] = useState(false);
  const [saving,setSaving] = useState(false);
  const [loading,setLoading] = useState(false);

  const load = useCallback(async()=>{
    setLoading(true);
    try {
      const [c,r]=await Promise.all([client.get('/admin/coupons'),client.get('/admin/coupons/redemptions',{params:{search:searchR}})]);
      setCoupons(c.data); setRedemptions(r.data);
    } catch{ toast.error('Failed to load.'); }
    finally{ setLoading(false); }
  },[searchR]);

  useEffect(()=>{load();},[load]);

  const resetForm=()=>{ setForm({...EMPTY_CPT}); setEditId(null); setShowForm(false); };
  const editCoupon=c=>{ setForm({code:c.code,points:c.points,rewardAmount:parseFloat(c.reward_amount),maxRedemptions:c.max_redemptions||'',isActive:c.is_active,expiresAt:c.expires_at?c.expires_at.slice(0,16):''}); setEditId(c.id); setShowForm(true); };

  const submit=async e=>{
    e.preventDefault();
    if(!form.code.trim()){ toast.error('Code required.'); return; }
    setSaving(true);
    try {
      const p={...form,code:form.code.toUpperCase().trim(),points:Number(form.points)||0,rewardAmount:parseFloat(form.rewardAmount)||0,maxRedemptions:form.maxRedemptions?Number(form.maxRedemptions):null,expiresAt:form.expiresAt||null};
      if(editId) { await client.put(`/admin/coupons/${editId}`,p); toast.success('Updated!'); }
      else { await client.post('/admin/coupons',p); toast.success('Coupon created! 🎉'); }
      resetForm(); load();
    } catch(err){ toast.error(err.response?.data?.error||'Failed.'); }
    finally{ setSaving(false); }
  };

  const delCoupon=async id=>{ if(!confirm('Delete?')) return; try{ await client.delete(`/admin/coupons/${id}`); toast.success('Deleted.'); load(); } catch{ toast.error('Failed.'); } };
  const toggleActive=async c=>{ try{ await client.put(`/admin/coupons/${c.id}`,{isActive:!c.is_active}); load(); } catch{ toast.error('Failed.'); } };

  return (
    <div>
      {/* Sub-nav */}
      <div style={{display:'flex',gap:4,marginBottom:18,background:C.card,border:`1px solid ${C.border}`,borderRadius:10,padding:4,width:'fit-content',boxShadow:'0 1px 3px rgba(0,0,0,0.06)'}}>
        {[['list','🎫 Coupons'],['redemptions','📋 Redemption Log']].map(([k,l])=>(
          <button key={k} onClick={()=>setView(k)} style={{padding:'7px 18px',borderRadius:7,border:'none',cursor:'pointer',fontSize:13,fontWeight:view===k?700:500,background:view===k?'linear-gradient(135deg,#7c3aed,#2563eb)':'transparent',color:view===k?'#fff':C.secondary,transition:'all .2s'}}>
            {l}
          </button>
        ))}
      </div>

      {view==='list'&&(
        <div>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
            <div style={{fontWeight:700,fontSize:15,color:C.primary}}>Manage Coupon Codes</div>
            <button onClick={()=>{resetForm();setShowForm(!showForm);}} style={{padding:'8px 18px',borderRadius:8,border:'none',cursor:'pointer',background:'linear-gradient(135deg,#7c3aed,#2563eb)',color:'#fff',fontWeight:700,fontSize:13}}>
              {showForm?'✕ Close':'+ New Coupon'}
            </button>
          </div>
          {showForm&&(
            <Card style={{marginBottom:18,border:`1px solid rgba(124,58,237,0.25)`,background:'rgba(124,58,237,0.02)'}}>
              <div style={{fontWeight:700,fontSize:14,marginBottom:14}}>{editId?'✏️ Edit Coupon':'➕ Create Coupon'}</div>
              <form onSubmit={submit} style={{display:'flex',flexDirection:'column',gap:12}}>
                <div style={{display:'grid',gridTemplateColumns:'2fr 1fr 1fr',gap:12}}>
                  <div><label style={LBL}>Code *</label><input style={{...INP,textTransform:'uppercase',letterSpacing:'0.08em',fontWeight:700}} value={form.code} onChange={e=>setForm({...form,code:e.target.value.toUpperCase()})} placeholder="WELCOME100" required/></div>
                  <div><label style={LBL}>Points</label><input type="number" min={0} style={INP} value={form.points} onChange={e=>setForm({...form,points:e.target.value})}/></div>
                  <div><label style={LBL}>Prize (₹)</label><input type="number" min={0} step="0.01" style={INP} value={form.rewardAmount} onChange={e=>setForm({...form,rewardAmount:e.target.value})}/></div>
                </div>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:12}}>
                  <div><label style={LBL}>Max Uses (blank=∞)</label><input type="number" min={1} style={INP} value={form.maxRedemptions} onChange={e=>setForm({...form,maxRedemptions:e.target.value})} placeholder="Unlimited"/></div>
                  <div><label style={LBL}>Expires At</label><input type="datetime-local" style={INP} value={form.expiresAt} onChange={e=>setForm({...form,expiresAt:e.target.value})}/></div>
                  <div style={{display:'flex',flexDirection:'column'}}>
                    <label style={LBL}>Active</label>
                    <label style={{display:'flex',alignItems:'center',gap:8,marginTop:8,cursor:'pointer',fontSize:13,fontWeight:600}}>
                      <input type="checkbox" checked={form.isActive} onChange={e=>setForm({...form,isActive:e.target.checked})} style={{width:'auto',accentColor:C.purple}}/>
                      {form.isActive?'✅ Active':'❌ Inactive'}
                    </label>
                  </div>
                </div>
                <div style={{display:'flex',gap:8}}>
                  <button type="submit" disabled={saving} style={{padding:'9px 20px',borderRadius:8,border:'none',cursor:'pointer',background:'linear-gradient(135deg,#7c3aed,#2563eb)',color:'#fff',fontWeight:700,fontSize:13}}>{saving?'Saving…':editId?'Update':'Create Coupon'}</button>
                  {editId&&<button type="button" onClick={resetForm} style={{padding:'9px 16px',borderRadius:8,border:`1px solid ${C.border}`,background:'#fff',cursor:'pointer',fontSize:13,color:C.secondary}}>Cancel</button>}
                </div>
              </form>
            </Card>
          )}
          {loading?<Spinner/>:coupons.length===0?<EmptyTable msg="No coupons yet. Create one!"/>:(
            <div style={{display:'flex',flexDirection:'column',gap:10}}>
              {coupons.map(c=>(
                <Card key={c.id} style={{display:'flex',alignItems:'center',gap:16,padding:16,opacity:c.is_active?1:.6}}>
                  <div style={{background:'linear-gradient(135deg,rgba(124,58,237,0.12),rgba(37,99,235,0.12))',borderRadius:10,padding:'12px 18px',textAlign:'center',minWidth:120}}>
                    <div style={{fontFamily:'monospace',fontWeight:800,fontSize:15,letterSpacing:'0.08em',color:C.purple}}>{c.code}</div>
                    <div style={{fontSize:10,color:C.muted,marginTop:2}}>Promo Code</div>
                  </div>
                  <div style={{flex:1}}>
                    <div style={{display:'flex',gap:8,flexWrap:'wrap',marginBottom:6}}>
                      {c.points>0&&<Badge label={`+${c.points} pts`} color={C.green}/>}
                      {parseFloat(c.reward_amount)>0&&<Badge label={`₹${parseFloat(c.reward_amount).toFixed(2)}`} color={C.purple}/>}
                      <Badge label={c.is_active?'Active':'Inactive'} color={c.is_active?C.green:C.red}/>
                    </div>
                    <div style={{fontSize:12,color:C.muted}}>
                      <span style={{fontWeight:700,color:C.secondary}}>{c.total_redeemed}</span> / {c.max_redemptions||'∞'} redemptions
                      {c.expires_at&&<span> · Expires {fmtDate(c.expires_at)}</span>}
                    </div>
                  </div>
                  <div style={{display:'flex',gap:6}}>
                    <button onClick={()=>toggleActive(c)} style={{padding:'5px 12px',borderRadius:7,border:`1px solid ${C.border}`,background:'#fff',cursor:'pointer',fontSize:11,fontWeight:700,color:C.secondary}}>{c.is_active?'Deactivate':'Activate'}</button>
                    <button onClick={()=>editCoupon(c)} style={{padding:'5px 12px',borderRadius:7,border:`1px solid ${C.border}`,background:'#fff',cursor:'pointer',fontSize:11,fontWeight:700,color:C.secondary}}>Edit</button>
                    <button onClick={()=>delCoupon(c.id)} style={{padding:'5px 12px',borderRadius:7,border:`1px solid #fecaca`,background:'#fff',cursor:'pointer',fontSize:11,fontWeight:700,color:C.red}}>Delete</button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
      {view==='redemptions'&&(
        <div>
          <div style={{display:'flex',gap:12,marginBottom:16,alignItems:'center'}}>
            <div style={{flex:1,fontWeight:700,fontSize:15,color:C.primary}}>Redemption Log</div>
            <input value={searchR} onChange={e=>setSearchR(e.target.value)} placeholder="Search user, email, code…" style={{...INP,maxWidth:280}}/>
          </div>
          <Card pad={0}>
            <DataTable cols={[
              {key:'code',label:'Code',render:r=><span style={{fontFamily:'monospace',fontWeight:800,color:C.purple,letterSpacing:'0.06em'}}>{r.code}</span>},
              {key:'full_name',label:'Student',render:r=><div><div style={{fontWeight:700,fontSize:13}}>{r.full_name}</div><div style={{fontSize:11,color:C.muted}}>{r.email}</div></div>},
              {key:'points_awarded',label:'Points',render:r=><span style={{fontWeight:700,color:C.green}}>+{r.points_awarded}</span>},
              {key:'reward_awarded',label:'Prize',render:r=><span style={{fontWeight:700,color:C.purple}}>₹{parseFloat(r.reward_awarded).toFixed(2)}</span>},
              {key:'redeemed_at',label:'Date',render:r=><span style={{fontSize:11,color:C.muted}}>{fmtTime(r.redeemed_at)}</span>},
            ]} rows={redemptions}/>
          </Card>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   PAYMENTS TAB
   ─────────────────────────────────────────────────────────────────────────── */
function PaymentsTab() {
  const [withdrawals,setWithdrawals] = useState([]);
  const [statusFilter,setStatusFilter] = useState('');
  const [search,setSearch] = useState('');
  const [loading,setLoading] = useState(false);
  const [actionModal,setActionModal] = useState(null);
  const [txId,setTxId]       = useState('');
  const [processing,setProcessing] = useState(false);

  const load=useCallback(async()=>{
    setLoading(true);
    try{ const {data}=await client.get('/admin/withdrawals',{params:{status:statusFilter,search}}); setWithdrawals(data); }
    catch{ toast.error('Failed.'); }
    finally{ setLoading(false); }
  },[statusFilter,search]);

  useEffect(()=>{load();},[load]);

  const confirm=async()=>{
    if(!actionModal) return;
    setProcessing(true);
    try{
      await client.put(`/admin/withdrawals/${actionModal.id}`,{status:actionModal.status,transactionId:txId||undefined});
      toast.success(`Withdrawal marked as ${actionModal.status}.`);
      setActionModal(null); load();
    } catch(err){ toast.error(err.response?.data?.error||'Failed.'); }
    finally{ setProcessing(false); }
  };

  const pending=withdrawals.filter(w=>w.status==='Processing');
  const completed=withdrawals.filter(w=>w.status==='Completed');

  return (
    <div>
      {/* Summary cards */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:14,marginBottom:20}}>
        {[
          ['Pending',pending.length,'₹'+pending.reduce((s,w)=>s+parseFloat(w.amount),0).toFixed(2),C.amber],
          ['Completed',completed.length,'₹'+completed.reduce((s,w)=>s+parseFloat(w.amount),0).toFixed(2),C.green],
          ['Total',withdrawals.length,'All time',C.purple],
        ].map(([l,count,sub,clr])=>(
          <Card key={l} style={{borderTop:`3px solid ${clr}`}}>
            <div style={{fontSize:11,fontWeight:700,color:C.muted,textTransform:'uppercase',letterSpacing:'0.07em',marginBottom:4}}>{l}</div>
            <div style={{fontSize:26,fontWeight:800,fontFamily:'monospace',color:clr,marginBottom:2}}>{count}</div>
            <div style={{fontSize:12,color:C.secondary,fontWeight:600}}>{sub}</div>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div style={{display:'flex',gap:10,marginBottom:16,flexWrap:'wrap',alignItems:'center'}}>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search by name or email…" style={{...INP,maxWidth:280}}/>
        <select value={statusFilter} onChange={e=>setStatusFilter(e.target.value)} style={{...INP,width:'auto',minWidth:150}}>
          <option value="">All Statuses</option>
          <option value="Processing">Pending</option>
          <option value="Completed">Completed</option>
          <option value="Failed">Failed</option>
        </select>
      </div>

      <Card pad={0}>
        {loading?<Spinner/>:(
          <DataTable
            cols={[
              {key:'full_name',label:'Student',render:r=><div><div style={{fontWeight:700,fontSize:13}}>{r.full_name}</div><div style={{fontSize:11,color:C.muted}}>@{r.username}</div></div>},
              {key:'amount',label:'Amount',render:r=><span style={{fontWeight:800,fontFamily:'monospace',fontSize:15}}>₹{parseFloat(r.amount).toFixed(2)}</span>},
              {key:'method',label:'Method',render:r=><Badge label={r.method} color={C.cyan}/>},
              {key:'status',label:'Status',render:r=><Badge label={r.status} color={STATUS_CLR[r.status]||C.muted}/>},
              {key:'transaction_id',label:'Txn ID',render:r=><span style={{fontFamily:'monospace',fontSize:11,color:C.muted}}>{r.transaction_id||'—'}</span>},
              {key:'created_at',label:'Requested',render:r=><span style={{fontSize:11,color:C.muted}}>{fmtTime(r.created_at)}</span>},
              {key:'action',label:'Action',render:r=>r.status==='Processing'?(
                <div style={{display:'flex',gap:6}}>
                  <button onClick={e=>{e.stopPropagation();setActionModal({id:r.id,status:'Completed',amount:r.amount,user:r.full_name});setTxId('');}}
                    style={{padding:'4px 10px',borderRadius:6,border:`1px solid #bbf7d0`,background:'#f0fdf4',cursor:'pointer',fontSize:11,fontWeight:700,color:C.green}}>
                    ✅ Complete
                  </button>
                  <button onClick={e=>{e.stopPropagation();setActionModal({id:r.id,status:'Failed',amount:r.amount,user:r.full_name});setTxId('');}}
                    style={{padding:'4px 10px',borderRadius:6,border:`1px solid #fecaca`,background:'#fef2f2',cursor:'pointer',fontSize:11,fontWeight:700,color:C.red}}>
                    ❌ Fail
                  </button>
                </div>
              ):<span style={{fontSize:12,color:C.muted}}>—</span>},
            ]}
            rows={withdrawals}
          />
        )}
      </Card>

      {actionModal&&(
        <Modal title={actionModal.status==='Completed'?'✅ Confirm Payment':'❌ Reject Withdrawal'} onClose={()=>setActionModal(null)}>
          <p style={{fontSize:13,color:C.secondary,marginBottom:16}}>
            {actionModal.status==='Completed'
              ?`Mark ₹${parseFloat(actionModal.amount).toFixed(2)} withdrawal for "${actionModal.user}" as completed?`
              :`Reject and refund ₹${parseFloat(actionModal.amount).toFixed(2)} to "${actionModal.user}"'s wallet?`}
          </p>
          {actionModal.status==='Completed'&&(
            <div style={{marginBottom:16}}>
              <label style={LBL}>Transaction ID (optional)</label>
              <input style={INP} placeholder="e.g. UTR123456" value={txId} onChange={e=>setTxId(e.target.value)}/>
            </div>
          )}
          <div style={{display:'flex',gap:10}}>
            <button onClick={confirm} disabled={processing}
              style={{padding:'9px 20px',borderRadius:8,border:'none',cursor:'pointer',background:actionModal.status==='Completed'?C.green:C.red,color:'#fff',fontWeight:700,fontSize:13}}>
              {processing?'Processing…':actionModal.status==='Completed'?'Confirm & Complete':'Confirm & Refund'}
            </button>
            <button onClick={()=>setActionModal(null)} style={{padding:'9px 16px',borderRadius:8,border:`1px solid ${C.border}`,background:'#fff',cursor:'pointer',fontSize:13,color:C.secondary}}>Cancel</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   AUDIT LOG
   ─────────────────────────────────────────────────────────────────────────── */
const ACTION_COLOR = {
  create_template:C.green, create_quiz:C.green, update_user_access:C.blue,
  set_user_status:C.amber, adjust_points:C.purple, adjust_wallet:C.cyan,
  bulk_credit_points:C.purple, update_withdrawal:C.amber, delete_user:C.red,
  create_coupon:C.green, delete_coupon:C.red, update_coupon:C.blue,
};

function AuditLog() {
  const [logs,setLogs]   = useState([]);
  const [loading,setLoading] = useState(false);

  const load=()=>{ setLoading(true); client.get('/admin/logs',{params:{limit:100}}).then(({data})=>setLogs(data)).catch(()=>toast.error('Failed to load logs.')).finally(()=>setLoading(false)); };
  useEffect(()=>{ load(); },[]);

  return (
    <div>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
        <div style={{fontWeight:700,fontSize:15,color:C.primary}}>Admin Audit Log</div>
        <button onClick={load} style={{padding:'7px 16px',borderRadius:8,border:`1px solid ${C.border}`,background:'#fff',cursor:'pointer',fontSize:12,fontWeight:700,color:C.secondary}}>🔄 Refresh</button>
      </div>
      <Card pad={0}>
        {loading?<Spinner/>:logs.length===0?<EmptyTable msg="No audit events recorded yet."/>:(
          <div style={{maxHeight:'75vh',overflowY:'auto'}}>
            {logs.map((l,i)=>{
              const clr=ACTION_COLOR[l.action]||C.muted;
              return (
                <div key={l.id} style={{display:'flex',gap:14,padding:'12px 18px',borderBottom:i<logs.length-1?`1px solid ${C.border}`:'none',alignItems:'flex-start',transition:'background .12s'}}
                  onMouseEnter={e=>e.currentTarget.style.background='#f8fafc'}
                  onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                  <div style={{width:8,height:8,borderRadius:'50%',background:clr,marginTop:5,flexShrink:0}}/>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{display:'flex',alignItems:'center',gap:8,flexWrap:'wrap'}}>
                      <span style={{fontFamily:'monospace',fontSize:12,fontWeight:700,color:clr,background:clr+'15',padding:'2px 8px',borderRadius:4}}>{l.action}</span>
                      {l.target_type&&<span style={{fontSize:11,color:C.muted,fontWeight:600}}>on {l.target_type}</span>}
                    </div>
                    {l.details&&Object.keys(l.details).length>0&&(
                      <div style={{fontSize:11,color:C.muted,marginTop:3,fontFamily:'monospace',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',maxWidth:'100%'}}>
                        {JSON.stringify(l.details)}
                      </div>
                    )}
                    <div style={{fontSize:11,color:C.muted,marginTop:4}}>
                      <span style={{fontWeight:700,color:C.secondary}}>{l.admin_name||l.admin_username}</span>
                      <span style={{margin:'0 6px'}}>·</span>
                      <span>{fmtTime(l.created_at)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   TEMPLATES  (original functionality preserved)
   ─────────────────────────────────────────────────────────────────────────── */
function Templates() {
  const [templates,setTemplates] = useState([]);
  const [quizzes,setQuizzes]   = useState([]);
  const [form,setForm] = useState({name:'',description:'',quizId:'',maxParticipants:6,entryPointsCost:0});
  const [creating,setCreating] = useState(false);

  const load=()=>{
    client.get('/admin/templates').then(({data})=>setTemplates(data));
    client.get('/admin/quizzes').then(({data})=>setQuizzes(data));
  };
  useEffect(load,[]);

  const createTemplate=async e=>{
    e.preventDefault(); setCreating(true);
    try {
      await client.post('/admin/templates',{...form,maxParticipants:Number(form.maxParticipants),entryPointsCost:Number(form.entryPointsCost),rewardStructure:[{rank:1,badge:'gold_scholar',points:200},{rank:2,badge:'silver_scholar',points:120},{rank:3,badge:'bronze_scholar',points:60}]});
      toast.success('Template created!');
      setForm({name:'',description:'',quizId:'',maxParticipants:6,entryPointsCost:0}); load();
    } catch(err){ toast.error(err.response?.data?.error||'Failed.'); }
    finally{ setCreating(false); }
  };

  const toggleField=async(id,field,value)=>{ await client.patch(`/admin/templates/${id}`,{[field]:value}); load(); };

  return (
    <div style={{display:'grid',gridTemplateColumns:'360px 1fr',gap:18,alignItems:'flex-start'}}>
      <Card>
        <div style={{fontWeight:700,fontSize:15,marginBottom:16,color:C.primary}}>New Contest Template</div>
        <form onSubmit={createTemplate} style={{display:'flex',flexDirection:'column',gap:12}}>
          <div><label style={LBL}>Name *</label><input style={INP} value={form.name} onChange={e=>setForm({...form,name:e.target.value})} required/></div>
          <div><label style={LBL}>Description</label><input style={INP} value={form.description} onChange={e=>setForm({...form,description:e.target.value})}/></div>
          <div><label style={LBL}>Quiz *</label>
            <select style={INP} value={form.quizId} onChange={e=>setForm({...form,quizId:e.target.value})} required>
              <option value="">Select a quiz…</option>
              {quizzes.map(q=><option key={q.id} value={q.id}>{q.title}</option>)}
            </select>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
            <div><label style={LBL}>Max Participants</label><input type="number" min={2} style={INP} value={form.maxParticipants} onChange={e=>setForm({...form,maxParticipants:e.target.value})} required/></div>
            <div><label style={LBL}>Entry Cost (pts)</label><input type="number" min={0} style={INP} value={form.entryPointsCost} onChange={e=>setForm({...form,entryPointsCost:e.target.value})}/></div>
          </div>
          <button disabled={creating} type="submit" style={{padding:'9px 18px',borderRadius:8,border:'none',cursor:'pointer',background:'linear-gradient(135deg,#7c3aed,#2563eb)',color:'#fff',fontWeight:700,fontSize:13}}>{creating?'Creating…':'Create Template'}</button>
        </form>
      </Card>
      <div style={{display:'flex',flexDirection:'column',gap:10}}>
        {templates.map(t=>(
          <Card key={t.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:16}}>
            <div>
              <div style={{fontWeight:700,fontSize:14,color:C.primary,marginBottom:3}}>{t.name}</div>
              <div style={{fontSize:12,color:C.muted}}>{t.quiz_title} · {t.max_participants} seats · {t.contests_spawned} contests</div>
            </div>
            <div style={{display:'flex',gap:8}}>
              <button style={{padding:'6px 12px',borderRadius:7,border:`1px solid ${C.border}`,background:'#fff',cursor:'pointer',fontSize:12,fontWeight:700,color:C.secondary}} onClick={()=>toggleField(t.id,'autoRegenerate',!t.auto_regenerate)}>
                Auto-regen: {t.auto_regenerate?'ON':'OFF'}
              </button>
              <button style={{padding:'6px 12px',borderRadius:7,border:`1px solid ${C.border}`,background:'#fff',cursor:'pointer',fontSize:12,fontWeight:700,color:t.is_active?C.red:C.green}} onClick={()=>toggleField(t.id,'isActive',!t.is_active)}>
                {t.is_active?'Deactivate':'Activate'}
              </button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   QUIZZES  (original functionality preserved)
   ─────────────────────────────────────────────────────────────────────────── */
function Quizzes() {
  const [quizzes,setQuizzes] = useState([]);
  const [form,setForm] = useState({title:'',description:'',durationMinutes:10,negativeMarking:0.25,questions:[]});
  const [q,setQ] = useState({questionText:'',options:['','','',''],correctIndex:0});
  const [creating,setCreating] = useState(false);

  const load=()=>client.get('/admin/quizzes').then(({data})=>setQuizzes(data));
  useEffect(load,[]);

  const addQ=()=>{
    if(!q.questionText||q.options.some(o=>!o)){ toast.error('Fill question and all 4 options.'); return; }
    const ids=['A','B','C','D'];
    setForm({...form,questions:[...form.questions,{questionText:q.questionText,options:q.options.map((t,i)=>({id:ids[i],text:t})),correctOptions:[ids[q.correctIndex]],marks:1,negativeMarks:0.25}]});
    setQ({questionText:'',options:['','','',''],correctIndex:0});
  };

  const createQuiz=async e=>{
    e.preventDefault(); if(!form.questions.length){ toast.error('Add at least one question.'); return; }
    setCreating(true);
    try { await client.post('/admin/quizzes',form); toast.success('Quiz published!'); setForm({title:'',description:'',durationMinutes:10,negativeMarking:0.25,questions:[]}); load(); }
    catch(err){ toast.error(err.response?.data?.error||'Failed.'); }
    finally{ setCreating(false); }
  };

  return (
    <div style={{display:'grid',gridTemplateColumns:'420px 1fr',gap:18,alignItems:'flex-start'}}>
      <Card>
        <div style={{fontWeight:700,fontSize:15,marginBottom:16,color:C.primary}}>Create New Quiz</div>
        <form onSubmit={createQuiz} style={{display:'flex',flexDirection:'column',gap:12}}>
          <div><label style={LBL}>Title *</label><input style={INP} value={form.title} onChange={e=>setForm({...form,title:e.target.value})} required/></div>
          <div><label style={LBL}>Description</label><input style={INP} value={form.description} onChange={e=>setForm({...form,description:e.target.value})}/></div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
            <div><label style={LBL}>Duration (min)</label><input type="number" style={INP} value={form.durationMinutes} onChange={e=>setForm({...form,durationMinutes:Number(e.target.value)})}/></div>
            <div><label style={LBL}>Negative Marking</label><input type="number" step="0.25" style={INP} value={form.negativeMarking} onChange={e=>setForm({...form,negativeMarking:Number(e.target.value)})}/></div>
          </div>
          <div style={{background:'#f8fafc',border:`1px solid ${C.border}`,borderRadius:10,padding:14}}>
            <div style={{fontSize:11,fontWeight:700,color:C.muted,textTransform:'uppercase',letterSpacing:'0.06em',marginBottom:10}}>Add Question</div>
            <input style={{...INP,marginBottom:8}} placeholder="Question text" value={q.questionText} onChange={e=>setQ({...q,questionText:e.target.value})}/>
            {q.options.map((opt,i)=>(
              <div key={i} style={{display:'flex',gap:8,alignItems:'center',marginBottom:6}}>
                <input type="radio" checked={q.correctIndex===i} onChange={()=>setQ({...q,correctIndex:i})} style={{width:'auto',accentColor:C.purple}}/>
                <input style={INP} placeholder={`Option ${String.fromCharCode(65+i)}`} value={opt} onChange={e=>{const opts=[...q.options];opts[i]=e.target.value;setQ({...q,options:opts});}}/>
              </div>
            ))}
            <button type="button" onClick={addQ} style={{padding:'6px 14px',borderRadius:7,border:`1px solid ${C.border}`,background:'#fff',cursor:'pointer',fontSize:12,fontWeight:700,color:C.secondary}}>+ Add to Quiz</button>
          </div>
          <div style={{fontSize:12,color:C.muted,fontWeight:600}}>{form.questions.length} question(s) ready</div>
          <button disabled={creating} type="submit" style={{padding:'9px 18px',borderRadius:8,border:'none',cursor:'pointer',background:'linear-gradient(135deg,#7c3aed,#2563eb)',color:'#fff',fontWeight:700,fontSize:13}}>{creating?'Publishing…':'Publish Quiz'}</button>
        </form>
      </Card>
      <div style={{display:'flex',flexDirection:'column',gap:10}}>
        {quizzes.map(qz=>(
          <Card key={qz.id} style={{padding:16}}>
            <div style={{fontWeight:700,fontSize:14,color:C.primary,marginBottom:4}}>{qz.title}</div>
            <div style={{display:'flex',gap:10}}>
              <Badge label={`${qz.question_count} questions`} color={C.purple}/>
              <Badge label={`${qz.duration_minutes} min`} color={C.blue}/>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   NEWS MANAGER  (original functionality preserved)
   ─────────────────────────────────────────────────────────────────────────── */
const EMPTY_ART = {title:'',description:'',content:'',imageUrl:'',category:'general',articleType:'news',vlogUrl:'',authorName:'',isFeatured:false};

function NewsManager() {
  const [articles,setArticles] = useState([]);
  const [loading,setLoading]   = useState(true);
  const [form,setForm]         = useState({...EMPTY_ART});
  const [editId,setEditId]     = useState(null);
  const [saving,setSaving]     = useState(false);
  const [showForm,setShowForm] = useState(false);

  const loadA=()=>{ setLoading(true); client.get('/admin/news').then(({data})=>setArticles(data.articles||[])).catch(()=>toast.error('Failed.')).finally(()=>setLoading(false)); };
  useEffect(loadA,[]);

  const reset=()=>{ setForm({...EMPTY_ART}); setEditId(null); setShowForm(false); };

  const submit=async e=>{
    e.preventDefault(); if(!form.title.trim()){ toast.error('Title required.'); return; }
    setSaving(true);
    try {
      if(editId){ await client.put(`/admin/news/${editId}`,form); toast.success('Updated!'); }
      else { await client.post('/admin/news',form); toast.success('Published! 🎉'); }
      reset(); loadA();
    } catch(err){ toast.error(err.response?.data?.error||'Failed.'); }
    finally{ setSaving(false); }
  };

  const editA=a=>{ setForm({title:a.title||'',description:a.description||'',content:a.content||'',imageUrl:a.image_url||'',category:a.category||'general',articleType:a.article_type||'news',vlogUrl:a.vlog_url||'',authorName:a.author_name||'',isFeatured:a.is_featured||false}); setEditId(a.id); setShowForm(true); };
  const delA=async id=>{ if(!confirm('Delete permanently?')) return; try{ await client.delete(`/admin/news/${id}`); toast.success('Deleted.'); loadA(); } catch{ toast.error('Failed.'); } };
  const togglePub=async a=>{ try{ await client.put(`/admin/news/${a.id}`,{isPublished:!a.is_published}); toast.success(a.is_published?'Unpublished.':'Published!'); loadA(); } catch{ toast.error('Failed.'); } };
  const toggleFeat=async a=>{ try{ await client.put(`/admin/news/${a.id}`,{isFeatured:!a.is_featured}); toast.success(a.is_featured?'Unfeatured.':'Featured! ⭐'); loadA(); } catch{ toast.error('Failed.'); } };

  return (
    <div>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:18}}>
        <div style={{fontWeight:700,fontSize:15,color:C.primary}}>News & Vlogs</div>
        <button onClick={()=>{reset();setShowForm(!showForm);}} style={{padding:'8px 18px',borderRadius:8,border:'none',cursor:'pointer',background:'linear-gradient(135deg,#7c3aed,#2563eb)',color:'#fff',fontWeight:700,fontSize:13}}>{showForm?'✕ Close':'+ New Article'}</button>
      </div>

      {showForm&&(
        <Card style={{marginBottom:20,border:`1px solid rgba(124,58,237,0.2)`}}>
          <div style={{fontWeight:700,fontSize:14,marginBottom:14}}>{editId?'✏️ Edit':'➕ New Article'}</div>
          <form onSubmit={submit} style={{display:'flex',flexDirection:'column',gap:12}}>
            <div><label style={LBL}>Title *</label><input style={INP} value={form.title} onChange={e=>setForm({...form,title:e.target.value})} required/></div>
            <div><label style={LBL}>Description</label><textarea style={{...INP,minHeight:60,resize:'vertical'}} value={form.description} onChange={e=>setForm({...form,description:e.target.value})}/></div>
            <div><label style={LBL}>Full Content</label><textarea style={{...INP,minHeight:100,resize:'vertical'}} value={form.content} onChange={e=>setForm({...form,content:e.target.value})}/></div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
              <div><label style={LBL}>Type</label><select style={INP} value={form.articleType} onChange={e=>setForm({...form,articleType:e.target.value})}><option value="news">📰 News</option><option value="vlog">🎥 Vlog</option></select></div>
              <div><label style={LBL}>Category</label><select style={INP} value={form.category} onChange={e=>setForm({...form,category:e.target.value})}>{ARTICLE_CATEGORIES.map(c=><option key={c} value={c}>{c.charAt(0).toUpperCase()+c.slice(1)}</option>)}</select></div>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
              <div><label style={LBL}>Image URL</label><input style={INP} value={form.imageUrl} onChange={e=>setForm({...form,imageUrl:e.target.value})} placeholder="https://…"/></div>
              <div><label style={LBL}>Vlog URL {form.articleType==='vlog'?'*':'(opt)'}</label><input style={INP} value={form.vlogUrl} onChange={e=>setForm({...form,vlogUrl:e.target.value})} placeholder="https://youtube.com/…"/></div>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr auto',gap:12,alignItems:'flex-end'}}>
              <div><label style={LBL}>Author Name</label><input style={INP} value={form.authorName} onChange={e=>setForm({...form,authorName:e.target.value})} placeholder="(optional)"/></div>
              <label style={{display:'flex',alignItems:'center',gap:8,padding:'9px 14px',border:`1px solid ${C.border}`,borderRadius:8,cursor:'pointer',fontSize:13,fontWeight:600,background:form.isFeatured?'#fffbeb':'#fff'}}>
                <input type="checkbox" checked={form.isFeatured} onChange={e=>setForm({...form,isFeatured:e.target.checked})} style={{width:'auto',accentColor:'#f59e0b'}}/> ⭐ Featured
              </label>
            </div>
            <div style={{display:'flex',gap:10}}>
              <button type="submit" disabled={saving} style={{padding:'9px 22px',borderRadius:8,border:'none',cursor:'pointer',background:'linear-gradient(135deg,#7c3aed,#2563eb)',color:'#fff',fontWeight:700,fontSize:13}}>{saving?'Saving…':editId?'Update':'Publish'}</button>
              {editId&&<button type="button" onClick={reset} style={{padding:'9px 16px',borderRadius:8,border:`1px solid ${C.border}`,background:'#fff',cursor:'pointer',fontSize:13,color:C.secondary}}>Cancel</button>}
            </div>
          </form>
        </Card>
      )}

      {loading?<Spinner/>:articles.length===0?<EmptyTable msg="No articles yet."/>:(
        <div style={{display:'flex',flexDirection:'column',gap:10}}>
          {articles.map(a=>(
            <Card key={a.id} style={{display:'flex',gap:14,padding:14,opacity:a.is_published?1:.6,borderLeft:`3px solid ${a.is_featured?'#f59e0b':C.border}`}}>
              <div style={{width:64,height:64,borderRadius:8,flexShrink:0,background:a.image_url?`url(${a.image_url}) center/cover no-repeat`:'#f1f5f9',border:`1px solid ${C.border}`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:24}}>
                {!a.image_url&&(a.article_type==='vlog'?'🎥':'📰')}
              </div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontWeight:700,fontSize:14,marginBottom:4,color:C.primary,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>
                  {a.is_featured&&<span style={{color:'#f59e0b',marginRight:6}}>⭐</span>}{a.title}
                </div>
                <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
                  <Badge label={a.article_type==='vlog'?'🎥 VLOG':'📰 NEWS'} color={a.article_type==='vlog'?C.red:C.blue}/>
                  <Badge label={a.category} color={C.muted}/>
                  {!a.is_published&&<Badge label="DRAFT" color={C.red}/>}
                </div>
              </div>
              <div style={{display:'flex',gap:6,flexShrink:0,alignSelf:'center'}}>
                <button onClick={()=>toggleFeat(a)} style={{padding:'5px 9px',borderRadius:6,border:`1px solid ${C.border}`,background:'#fff',cursor:'pointer',fontSize:12}}>{a.is_featured?'⭐':'☆'}</button>
                <button onClick={()=>togglePub(a)} style={{padding:'5px 9px',borderRadius:6,border:`1px solid ${C.border}`,background:'#fff',cursor:'pointer',fontSize:11,fontWeight:700,color:C.secondary}}>{a.is_published?'Unpublish':'Publish'}</button>
                <button onClick={()=>editA(a)} style={{padding:'5px 9px',borderRadius:6,border:`1px solid ${C.border}`,background:'#fff',cursor:'pointer',fontSize:11,fontWeight:700,color:C.secondary}}>Edit</button>
                <button onClick={()=>delA(a.id)} style={{padding:'5px 9px',borderRadius:6,border:`1px solid #fecaca`,background:'#fff',cursor:'pointer',fontSize:11,fontWeight:700,color:C.red}}>Del</button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
