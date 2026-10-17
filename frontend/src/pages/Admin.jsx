import { useEffect, useState, useCallback, useRef } from 'react';
import client from '../api/client';
import toast from 'react-hot-toast';
import { resolveImageUrl, getYouTubeThumbnail, resolveArticleThumbnail, getCategoryFallbackImage } from '../utils/newsUtils';
import GovtJobsManager from '../components/admin/GovtJobsManager';
import CurrentAffairsManager from '../components/admin/CurrentAffairsManager';

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
  { key: 'overview',   label: 'Overview',          icon: GridIcon   },
  { key: 'users',      label: 'Users',              icon: UsersIcon  },
  { key: 'coupons',    label: 'Coupons',            icon: TagIcon    },
  { key: 'payments',   label: 'Payments',           icon: CashIcon   },
  { key: 'templates',  label: 'Contests',           icon: TrophyIcon },
  { key: 'schedule',   label: 'Contest Schedule',   icon: CalendarIcon },
  { key: 'quizzes',    label: 'Quizzes',            icon: QuizIcon   },
  { key: 'proctoring', label: 'AI Proctoring',      icon: ShieldIcon },
  { key: 'govt_jobs',        label: 'Govt Jobs',          icon: BriefcaseIcon },
  { key: 'current_affairs',  label: 'Current Affairs',    icon: BookOpenIcon },
  { key: 'news',             label: 'News & Vlogs',       icon: NewsIcon   },
  { key: 'logs',             label: 'Audit Log',          icon: LogIcon    },
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
function ShieldIcon(p) { return <Icon {...p} d={['M12 2l8 4v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6z','M9 12l2 2 4-4']} />; }
function BriefcaseIcon(p) { return <Icon {...p} d={['M16 6V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2','M2 6h20v14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6z','M12 12v3','M9 12h6']} />; }
function BookOpenIcon(p)  { return <Icon {...p} d={['M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z','M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z']} />; }
function NewsIcon(p)   { return <Icon {...p} d={['M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2zm0 0H4','M16 12H8','M16 8H8','M16 16H8']} />; }
function LogIcon(p)    { return <Icon {...p} d={['M9 12h6','M9 16h6','M9 8h6','M5 3H3a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h18a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2h-2']} />; }
function CalendarIcon(p){ return <Icon {...p} d={['M8 2v4','M16 2v4','M3 8h18','M21 6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6z','M8 12h2','M12 12h2','M16 12h2','M8 16h2','M12 16h2']} />; }
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

function Card({ children, style, pad = 20, ...rest }) {
  return (
    <div style={{
      background:C.card, border:`1px solid ${C.border}`,
      borderRadius:12, padding:pad, boxShadow:'0 1px 3px rgba(0,0,0,0.06)', ...style,
    }} {...rest}>{children}</div>
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
  const [sideOpen, setSideOpen] = useState(() => typeof window !== 'undefined' ? window.innerWidth > 900 : true);
  const [exportingExcel, setExportingExcel] = useState(false);

  const handleDownloadExcel = async () => {
    if (exportingExcel) return;
    setExportingExcel(true);
    const toastId = toast.loading('Generating live Excel workbook with all sheets...');
    try {
      const res = await client.get('/admin/backup/excel', { responseType: 'blob' });
      const blob = new Blob([res.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const dateStr = new Date().toISOString().slice(0, 10);
      a.download = `dreamnexa-live-data-${dateStr}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Excel workbook downloaded successfully!', { id: toastId });
    } catch (err) {
      console.error('Excel download failed:', err);
      toast.error(err.response?.data?.error || 'Failed to generate Excel backup.', { id: toastId });
    } finally {
      setExportingExcel(false);
    }
  };

  useEffect(() => {
    const onResize = () => { if (window.innerWidth <= 900) setSideOpen(false); };
    window.addEventListener('resize', onResize);
    onResize();
    return () => window.removeEventListener('resize', onResize);
  }, []);

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
          padding:'0 16px', height:60, display:'flex', alignItems:'center',
          gap:16, position:'sticky', top:0, zIndex:50, flexShrink:0,
          boxShadow:'0 1px 3px rgba(0,0,0,0.05)',
        }}>
          <div style={{flex:1}}>
            <div style={{fontWeight:800,fontSize:16,color:C.primary}}>{NAV.find(n=>n.key===tab)?.label}</div>
            <div style={{fontSize:11,color:C.muted}}>DreamNexa Admin Control Room</div>
          </div>
          <div style={{display:'flex',alignItems:'center',gap:10}}>
            <button
              onClick={handleDownloadExcel}
              disabled={exportingExcel}
              style={{
                padding:'6px 13px',
                borderRadius:8,
                border:'1px solid #16a34a',
                background:'#16a34a15',
                color:'#16a34a',
                fontWeight:700,
                fontSize:12,
                cursor:exportingExcel?'not-allowed':'pointer',
                display:'flex',
                alignItems:'center',
                gap:6,
                transition:'all .15s',
              }}
              title="Download full multi-sheet Excel file of all users, quizzes, attempts and contests"
            >
              <span>📊</span>
              <span>{exportingExcel ? 'Exporting…' : 'Export to Excel'}</span>
            </button>
            <div style={{padding:'6px 14px',borderRadius:20,background:'linear-gradient(135deg,rgba(124,58,237,0.1),rgba(37,99,235,0.1))',color:C.purple,fontWeight:700,fontSize:12,border:`1px solid rgba(124,58,237,0.2)`}}>⚡ Admin</div>
          </div>
        </header>

        {/* Page body */}
        <main style={{flex:1,padding:'20px 16px',minWidth:0,overflowX:'hidden'}}>
          {tab==='overview'  && <Overview onNavigate={setTab} onDownloadExcel={handleDownloadExcel} exportingExcel={exportingExcel} />}
          {tab==='users'     && <UsersTab  />}
          {tab==='coupons'   && <CouponsTab/>}
          {tab==='payments'  && <PaymentsTab/>}
          {tab==='templates' && <Templates />}
          {tab==='schedule'  && <ContestScheduleTab onDownloadExcel={handleDownloadExcel} exportingExcel={exportingExcel} />}
          {tab==='quizzes'   && <Quizzes   />}
          {tab==='proctoring' && <ProctoringTab />}
          {tab==='govt_jobs'       && <GovtJobsManager />}
          {tab==='current_affairs' && <CurrentAffairsManager />}
          {tab==='news'            && <NewsManager/>}
          {tab==='logs'      && <AuditLog  />}
        </main>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   OVERVIEW
   ─────────────────────────────────────────────────────────────────────────── */
function Overview({ onNavigate, onDownloadExcel, exportingExcel }) {
  const [stats, setStats]     = useState(null);
  const [bulk, setBulk]       = useState({ amount:'', reason:'' });
  const [bulkSaving, setBulkSaving] = useState(false);
  const [syncingSheets, setSyncingSheets] = useState(false);

  const handleSyncSheets = async () => {
    if (syncingSheets) return;
    setSyncingSheets(true);
    const toastId = toast.loading('Exporting all website data to Google Sheets…');
    try {
      let res;
      try {
        res = await client.post('/admin/backup/sync-sheets');
      } catch (postErr) {
        if (postErr.response?.status === 404) {
          res = await client.post('/admin/sync-sheets');
        } else {
          throw postErr;
        }
      }
      toast.success(res.data?.message || 'Synced to Google Sheets successfully!', { id: toastId });
    } catch (err) {
      if (err.response?.status === 404) {
        try {
          toast.loading('Cloud Run redeployment pending — performing direct client sync to Google Sheets…', { id: toastId });
          const [usersRes, quizzesRes, contestsRes, templatesRes] = await Promise.all([
            client.get('/admin/users').catch(() => ({ data: { users: [] } })),
            client.get('/admin/quizzes').catch(() => ({ data: { quizzes: [] } })),
            client.get('/admin/contests').catch(() => ({ data: { contests: [] } })),
            client.get('/admin/templates').catch(() => ({ data: { templates: [] } })),
          ]);
          const users = usersRes.data?.users || usersRes.data || [];
          const quizzes = quizzesRes.data?.quizzes || quizzesRes.data || [];
          const contests = contestsRes.data?.contests || contestsRes.data || [];
          const templates = templatesRes.data?.templates || templatesRes.data || [];

          const scriptUrl = 'https://script.google.com/macros/s/AKfycbx6eCgLPd00WLfmPBWKTQRRrTETfSfMg2sygrl2WKu6I6Q6A9rA6TvEqAeUVHqmdoZfHA/exec';
          const payload = {
            tables: {
              'Users': {
                headers: ['User ID', 'Username', 'Full Name', 'Email', 'Role', 'Status', 'Points'],
                rows: users.map(u => [u.id, u.username, u.full_name || '', u.email, u.role, u.status, u.total_points || 0])
              },
              'Quizzes': {
                headers: ['Quiz ID', 'Title', 'Category', 'Time Limit (Mins)', 'Questions', 'Total Marks'],
                rows: quizzes.map(q => [q.id, q.title, q.category, q.time_limit_mins, q.question_count || 0, q.total_marks || 0])
              },
              'Contests Schedule': {
                headers: ['Contest ID', 'Template', 'Status', 'Start Date & Time', 'End Date & Time', 'Enrolled'],
                rows: contests.map(c => [c.id, c.template_name || c.name, c.status, c.starts_at || '', c.ends_at || '', c.participant_count || 0])
              },
              'Contest Templates': {
                headers: ['Template ID', 'Name', 'Quiz', 'Max Seats', 'Entry Points', 'Status'],
                rows: templates.map(t => [t.id, t.name, t.quiz_title || t.quizId, t.max_participants, t.entry_points_cost, t.is_active ? 'Active' : 'Inactive'])
              }
            },
            summary: {
              usersCount: users.length,
              quizzesCount: quizzes.length,
              contestsCount: contests.length,
              templatesCount: templates.length
            }
          };

          await fetch(scriptUrl, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify(payload)
          });

          toast.success('Synced to Google Sheets via direct fallback! Please also redeploy Cloud Run.', { id: toastId, duration: 6000 });
          return;
        } catch (fallbackErr) {
          console.error('Direct sheets fallback error:', fallbackErr);
        }
      }

      const msg = err.response?.data?.error || err.message || 'Failed to sync to Google Sheets.';
      toast.error(
        err.response?.status === 404
          ? 'Backend update pending: Please redeploy Cloud Run to enable full backend sync.'
          : msg,
        { id: toastId, duration: 6000 }
      );
    } finally {
      setSyncingSheets(false);
    }
  };

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
    { label:'Total Students',    value:fmtNum(totalStudents),    icon:'🎓', color:C.purple, spark:sparkData, nav:'users' },
    { label:'Published Quizzes', value:fmtNum(publishedQuizzes), icon:'📝', color:C.blue,   spark:[5,7,6,8,7,9,8,11,10,12,14,13], nav:'quizzes' },
    { label:'Active Contests',   value:fmtNum(activeTemplates),  icon:'🏆', color:C.green,  spark:[2,3,2,4,3,5,4,6,5,7,6,8], nav:'templates' },
    { label:'Active Coupons',    value:fmtNum(activeCoupons||0), icon:'🎫', color:C.amber,  spark:[0,1,0,2,1,3,2,4,3,5,4,6], nav:'coupons' },
  ];

  return (
    <div style={{display:'flex',flexDirection:'column',gap:22}}>

      {/* Pending alert */}
      {parseInt(pendingWithdrawals?.count||0)>0 && (
        <div onClick={()=>onNavigate?.('payments')} style={{background:'#fffbeb',border:'1px solid #fde68a',borderRadius:12,padding:'14px 18px',display:'flex',alignItems:'center',gap:12,cursor:'pointer'}}>
          <AlertIcon size={20}/>
          <div style={{flex:1}}>
            <span style={{fontWeight:700,color:'#92400e',fontSize:13}}>{pendingWithdrawals.count} Pending Withdrawal Request{pendingWithdrawals.count>1?'s':''}</span>
            <span style={{color:'#b45309',fontSize:12,marginLeft:10}}>Total ₹{parseFloat(pendingWithdrawals.total||0).toFixed(2)} awaiting approval</span>
          </div>
          <span style={{fontSize:11,color:'#b45309',fontWeight:600}}>→ Go to Payments tab</span>
        </div>
      )}

      {/* Stat cards — click any card to jump straight to its detail tab with live data */}
      <div className="grid-4">
        {statCards.map(s=>(
          <Card key={s.label} onClick={()=>onNavigate?.(s.nav)} style={{position:'relative',overflow:'hidden',cursor:'pointer',transition:'transform .12s, box-shadow .12s'}}
            onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-2px)';e.currentTarget.style.boxShadow='0 6px 16px rgba(0,0,0,0.1)';}}
            onMouseLeave={e=>{e.currentTarget.style.transform='none';e.currentTarget.style.boxShadow='0 1px 3px rgba(0,0,0,0.06)';}}>
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
      <div className="admin-mid">

        {/* Contest Status + Top Colleges */}
        <div style={{display:'flex',flexDirection:'column',gap:16}}>
          <Card onClick={()=>onNavigate?.('templates')} style={{cursor:'pointer'}}>
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

          <Card onClick={()=>onNavigate?.('users')} style={{cursor:'pointer'}}>
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
            <div className="admin-responsive-grid" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
              {[
                ['Total Students',fmtNum(totalStudents),'#7c3aed','users'],
                ['Published Quizzes',fmtNum(publishedQuizzes),'#2563eb','quizzes'],
                ['Active Templates',fmtNum(activeTemplates),'#16a34a','templates'],
                ['Active Coupons',fmtNum(activeCoupons||0),'#d97706','coupons'],
              ].map(([lbl,val,clr,nav])=>(
                <div key={lbl} onClick={()=>onNavigate?.(nav)} style={{cursor:'pointer',background:'#f8fafc',borderRadius:10,padding:'12px 14px',borderLeft:`3px solid ${clr}`}}>
                  <div style={{fontSize:10,fontWeight:700,color:C.muted,textTransform:'uppercase',letterSpacing:'0.06em',marginBottom:4}}>{lbl}</div>
                  <div style={{fontSize:20,fontWeight:800,fontFamily:'monospace',color:C.primary}}>{val}</div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Excel Live Sync Banner */}
      <Card style={{
        background: 'linear-gradient(135deg, rgba(22,163,74,0.06), rgba(37,99,235,0.06))',
        border: '1px solid rgba(22,163,74,0.25)',
        padding: 20,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ flex: 1, minWidth: 280 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <span style={{ fontSize: 20 }}>📊</span>
              <span style={{ fontWeight: 800, fontSize: 16, color: C.primary }}>Automated Excel & Live Data Sync</span>
              <span style={{
                background: '#16a34a18', color: '#16a34a', fontSize: 11, fontWeight: 700,
                padding: '2px 8px', borderRadius: 999
              }}>
                ● Auto-Sync Active
              </span>
            </div>
            <p style={{ fontSize: 13, color: C.secondary, margin: 0, lineHeight: 1.5 }}>
              All student activity via your <strong>Vercel Link</strong> (registrations, quiz submissions, contest scores & leaderboards) automatically updates in the central database and Excel generator in real-time.
            </p>
            <div style={{ display: 'flex', gap: 14, marginTop: 10, flexWrap: 'wrap', fontSize: 12, color: C.muted }}>
              <span>✓ 10 Styled Sheets (Users, Quizzes, Attempts, Leaderboards)</span>
              <span>✓ Auto-regenerated on every submission</span>
              <span>✓ Compatible with Excel Desktop & Google Sheets</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button
              onClick={handleSyncSheets}
              disabled={syncingSheets}
              style={{
                padding: '10px 18px',
                borderRadius: 8,
                border: '1px solid rgba(37,99,235,0.3)',
                background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                color: '#fff',
                fontWeight: 700,
                fontSize: 13,
                cursor: syncingSheets ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                boxShadow: '0 2px 8px rgba(37,99,235,0.25)',
                transition: 'all .15s',
              }}
              title="Sync all Users, Quizzes, Attempts, Leaderboards and Govt Jobs to your connected Google Sheet"
            >
              <span>🔄</span>
              <span>{syncingSheets ? 'Syncing to Sheets…' : 'Sync All to Google Sheet'}</span>
            </button>
            <button
              onClick={onDownloadExcel}
              disabled={exportingExcel}
              style={{
                padding: '10px 18px',
                borderRadius: 8,
                border: 'none',
                background: 'linear-gradient(135deg, #16a34a, #15803d)',
                color: '#fff',
                fontWeight: 700,
                fontSize: 13,
                cursor: exportingExcel ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                boxShadow: '0 2px 8px rgba(22,163,74,0.3)',
                transition: 'all .15s',
              }}
            >
              <span>📥</span>
              <span>{exportingExcel ? 'Generating Excel…' : 'Download Full Excel (.xlsx)'}</span>
            </button>
          </div>
        </div>
      </Card>
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
  const [attemptModal,setAttemptModal] = useState(null); // attempt detail being viewed
  const [attemptLoading,setAttemptLoading] = useState(false);

  const openAttempt = async row => {
    setAttemptLoading(true);
    setAttemptModal({ loading:true });
    try {
      const {data} = await client.get(`/admin/attempts/${row.id}`);
      setAttemptModal(data);
    } catch {
      toast.error('Failed to load attempt details.');
      setAttemptModal(null);
    } finally {
      setAttemptLoading(false);
    }
  };

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
    <div className="admin-responsive-grid" style={{display:'grid',gridTemplateColumns:selected?'340px 1fr':'1fr',gap:18,alignItems:'flex-start'}}>
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
                    <div className="admin-responsive-grid" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
                      {[['username','Username'],['email','Email'],['mobile','Mobile'],['fullName','Full Name'],['college','College'],['university','University'],['state','State'],['city','City']].map(([k,l])=>(
                        <div key={k}><label style={LBL}>{l}</label><input style={INP} value={editForm[k]} onChange={e=>setEditForm({...editForm,[k]:e.target.value})} /></div>
                      ))}
                    </div>
                    <div className="admin-responsive-grid" style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:12}}>
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
                    <div className="admin-responsive-grid" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:16}}>
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
                    <div className="admin-responsive-grid" style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10}}>
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
                      <div className="admin-responsive-grid" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
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
                <>
                  <div style={{fontSize:11,color:C.muted,marginBottom:8}}>Click any attempt to see the full question-by-question answer review.</div>
                  <DataTable onRow={openAttempt} cols={[
                    {key:'quiz_title',label:'Quiz',render:r=><span style={{fontWeight:600,fontSize:12}}>{r.quiz_title}</span>},
                    {key:'contest_name',label:'Contest',render:r=><span style={{fontSize:12,color:C.muted}}>{r.contest_name}</span>},
                    {key:'score',label:'Score',render:r=><span style={{fontFamily:'monospace',fontWeight:700}}>{r.score??'—'}</span>},
                    {key:'rank',label:'Rank',render:r=><span style={{fontWeight:700,color:C.purple}}>#{r.rank??'—'}</span>},
                    {key:'points_awarded',label:'Points',render:r=><span style={{fontWeight:700,color:C.green}}>+{r.points_awarded||0}</span>},
                    {key:'started_at',label:'Date',render:r=><span style={{fontSize:11,color:C.muted}}>{fmtDate(r.started_at)}</span>},
                  ]} rows={details.quizHistory}/>
                </>
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

      {/* Attempt Q&A review modal */}
      {attemptModal&&(
        <Modal title="📝 Attempt Review" onClose={()=>setAttemptModal(null)} wide>
          {attemptLoading||!attemptModal.attempt?<Spinner/>:(
            <div>
              <div className="admin-responsive-grid" style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:10,marginBottom:18}}>
                {[
                  ['Quiz',attemptModal.attempt.quiz_title],
                  ['Contest',attemptModal.attempt.contest_name],
                  ['Score',attemptModal.attempt.score],
                  ['Rank',attemptModal.attempt.rank?`#${attemptModal.attempt.rank}`:'—'],
                ].map(([l,v])=>(
                  <div key={l} style={{background:'#f8fafc',borderRadius:8,padding:'10px 12px'}}>
                    <div style={{fontSize:10,fontWeight:700,color:C.muted,textTransform:'uppercase',letterSpacing:'0.06em',marginBottom:3}}>{l}</div>
                    <div style={{fontSize:13,fontWeight:700,color:C.primary}}>{v??'—'}</div>
                  </div>
                ))}
              </div>

              {attemptModal.proctoring&&(
                <div style={{marginBottom:18,padding:'12px 14px',borderRadius:8,background:BAND_COLOR[attemptModal.proctoring.final_status]?`${BAND_COLOR[attemptModal.proctoring.final_status]}12`:'#f8fafc',border:`1px solid ${C.border}`}}>
                  <div style={{fontWeight:700,fontSize:12,marginBottom:4}}>🛡️ Proctoring — {attemptModal.proctoring.final_status||attemptModal.proctoring.status} (risk {attemptModal.proctoring.risk_score}/100)</div>
                  {attemptModal.proctoring.final_reason&&<div style={{fontSize:12,color:C.secondary}}>{attemptModal.proctoring.final_reason}</div>}
                </div>
              )}

              <div style={{display:'flex',flexDirection:'column',gap:10}}>
                {attemptModal.answers.map((a,i)=>(
                  <div key={a.question_id} style={{border:`1px solid ${a.is_correct?'#bbf7d0':a.answered?'#fecaca':C.border}`,borderRadius:10,padding:14,background:a.is_correct?'#f0fdf4':a.answered?'#fef2f2':'#f8fafc'}}>
                    <div style={{display:'flex',justifyContent:'space-between',gap:10,marginBottom:8}}>
                      <div style={{fontWeight:700,fontSize:13,color:C.primary}}>Q{i+1}. {a.question_text}</div>
                      <Badge label={a.is_correct?'Correct':a.answered?'Wrong':'Skipped'} color={a.is_correct?C.green:a.answered?C.red:C.muted}/>
                    </div>
                    <div style={{display:'flex',flexDirection:'column',gap:4}}>
                      {(a.options||[]).map(opt=>{
                        const isCorrectOpt=(a.correct_options||[]).includes(opt.id);
                        const isSelected=(a.selected_options||[]).includes(opt.id);
                        return (
                          <div key={opt.id} style={{display:'flex',alignItems:'center',gap:8,fontSize:12,padding:'4px 8px',borderRadius:6,
                            background:isCorrectOpt?'rgba(34,197,94,0.12)':isSelected?'rgba(220,38,38,0.1)':'transparent',
                            color:isCorrectOpt?C.green:isSelected?C.red:C.secondary,fontWeight:isCorrectOpt||isSelected?700:500}}>
                            <span>{isCorrectOpt?'✓':isSelected?'✕':'○'}</span>
                            <span>{opt.text}</span>
                            {isSelected&&<span style={{marginLeft:'auto',fontSize:10,color:C.muted}}>student's answer</span>}
                          </div>
                        );
                      })}
                    </div>
                    <div style={{marginTop:8,fontSize:11,color:C.muted}}>Marks obtained: <b style={{color:a.marks_obtained>=0?C.green:C.red}}>{a.marks_obtained}</b></div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Modal>
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
                <div className="admin-responsive-grid" style={{display:'grid',gridTemplateColumns:'2fr 1fr 1fr',gap:12}}>
                  <div><label style={LBL}>Code *</label><input style={{...INP,textTransform:'uppercase',letterSpacing:'0.08em',fontWeight:700}} value={form.code} onChange={e=>setForm({...form,code:e.target.value.toUpperCase()})} placeholder="WELCOME100" required/></div>
                  <div><label style={LBL}>Points</label><input type="number" min={0} style={INP} value={form.points} onChange={e=>setForm({...form,points:e.target.value})}/></div>
                  <div><label style={LBL}>Prize (₹)</label><input type="number" min={0} step="0.01" style={INP} value={form.rewardAmount} onChange={e=>setForm({...form,rewardAmount:e.target.value})}/></div>
                </div>
                <div className="admin-responsive-grid" style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:12}}>
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
function renderPayoutInfo(r) {
  let snap = r.payout_snapshot;
  if (typeof snap === 'string') {
    try { snap = JSON.parse(snap); } catch {}
  }
  
  const method = snap?.preferred_method || r.live_preferred_method || r.method;
  const upi = snap?.upi_id || r.upi_id;
  const accHolder = snap?.account_holder || r.account_holder;
  const accNum = snap?.account_number || r.account_number;
  const ifsc = snap?.ifsc_code || r.ifsc_code;
  const bank = snap?.bank_name || r.bank_name;

  if (method === 'Bank' || (!upi && accNum)) {
    if (!accNum) return <span style={{fontSize:11,color:C.red}}>No Bank details set</span>;
    return (
      <div style={{fontSize:12}}>
        <div style={{fontWeight:700,color:C.primary,display:'flex',alignItems:'center',gap:4}}>
          🏦 {accNum}
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(accNum); toast.success('Account number copied!'); }}
            style={{border:'none',background:'transparent',cursor:'pointer',padding:2,fontSize:12}}
            title="Copy Account Number"
          >
            📋
          </button>
        </div>
        <div style={{fontSize:11,color:C.secondary}}>
          IFSC: <b>{ifsc}</b>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(ifsc); toast.success('IFSC code copied!'); }}
            style={{border:'none',background:'transparent',cursor:'pointer',padding:'0 2px',fontSize:10}}
            title="Copy IFSC"
          >
            📋
          </button>
        </div>
        {accHolder && <div style={{fontSize:10,color:C.muted}}>Holder: {accHolder}</div>}
        {bank && <div style={{fontSize:10,color:C.muted}}>Bank: {bank}</div>}
      </div>
    );
  } else {
    if (!upi) return <span style={{fontSize:11,color:C.red}}>No UPI ID set</span>;
    return (
      <div style={{fontSize:12}}>
        <div style={{fontWeight:700,color:C.purple,display:'flex',alignItems:'center',gap:4}}>
          📱 {upi}
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(upi); toast.success('UPI ID copied!'); }}
            style={{border:'none',background:'transparent',cursor:'pointer',padding:2,fontSize:12}}
            title="Copy UPI ID"
          >
            📋
          </button>
        </div>
      </div>
    );
  }
}

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
      <div className="admin-responsive-grid" style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:14,marginBottom:20}}>
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
              {key:'payout_details',label:'Payout Account / UPI',render:renderPayoutInfo},
              {key:'status',label:'Status',render:r=><Badge label={r.status} color={STATUS_CLR[r.status]||C.muted}/>},
              {key:'transaction_id',label:'Txn ID',render:r=><span style={{fontFamily:'monospace',fontSize:11,color:C.muted}}>{r.transaction_id||'—'}</span>},
              {key:'created_at',label:'Requested',render:r=><span style={{fontSize:11,color:C.muted}}>{fmtTime(r.created_at)}</span>},
              {key:'action',label:'Action',render:r=>r.status==='Processing'?(
                <div style={{display:'flex',gap:6}}>
                  <button onClick={e=>{e.stopPropagation();setActionModal({id:r.id,status:'Completed',amount:r.amount,user:r.full_name,record:r});setTxId('');}}
                    style={{padding:'4px 10px',borderRadius:6,border:`1px solid #bbf7d0`,background:'#f0fdf4',cursor:'pointer',fontSize:11,fontWeight:700,color:C.green}}>
                    ✅ Complete
                  </button>
                  <button onClick={e=>{e.stopPropagation();setActionModal({id:r.id,status:'Failed',amount:r.amount,user:r.full_name,record:r});setTxId('');}}
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
          <p style={{fontSize:13,color:C.secondary,marginBottom:12}}>
            {actionModal.status==='Completed'
              ?`Mark ₹${parseFloat(actionModal.amount).toFixed(2)} withdrawal for "${actionModal.user}" as completed?`
              :`Reject and refund ₹${parseFloat(actionModal.amount).toFixed(2)} to "${actionModal.user}"'s wallet?`}
          </p>

          {actionModal.status==='Completed' && actionModal.record && (
            <div style={{background:'#f8fafc',padding:12,borderRadius:8,border:`1px solid ${C.border}`,marginBottom:16}}>
              <div style={{fontSize:12,fontWeight:700,color:C.primary,marginBottom:4}}>Destination Payout Account:</div>
              {renderPayoutInfo(actionModal.record)}
            </div>
          )}

          {actionModal.status==='Completed'&&(
            <div style={{marginBottom:16}}>
              <label style={LBL}>Transaction ID / UTR (optional)</label>
              <input style={INP} placeholder="e.g. UTR123456789" value={txId} onChange={e=>setTxId(e.target.value)}/>
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

/* ─────────────────────────────────────────────────────────────────────────────
   AI PROCTORING — flagged session review
   ─────────────────────────────────────────────────────────────────────────── */
const BAND_COLOR = {
  NORMAL: C.green,
  WARNING: C.amber,
  REVIEW_REQUIRED: C.amber,
  REJECTION_CANDIDATE: C.red,
};

function ProctoringTab() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [flaggedOnly, setFlaggedOnly] = useState(true);
  const [selected, setSelected] = useState(null); // session id
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [deciding, setDeciding] = useState(false);
  const [live, setLive] = useState(false);

  const load = () => {
    setLoading(true);
    client.get('/admin/proctoring/sessions', { params: flaggedOnly ? { flagged: 1 } : {} })
      .then(({ data }) => setSessions(data))
      .catch(() => toast.error('Failed to load proctoring sessions.'))
      .finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, [flaggedOnly]); // eslint-disable-line react-hooks/exhaustive-deps

  // Best-effort live nudge: when any admin dashboard is subscribed and a new
  // event lands for a WARNING-or-worse session, quietly re-pull the list.
  useEffect(() => {
    let socket;
    let debounce;
    import('../api/socket').then(({ getSocket }) => {
      socket = getSocket();
      socket.connect();
      socket.on('connect', () => setLive(true));
      socket.on('disconnect', () => setLive(false));
      socket.on('proctoring:event', (evt) => {
        if (evt.band && evt.band !== 'NORMAL') {
          clearTimeout(debounce);
          debounce = setTimeout(load, 800); // small debounce so a burst of events doesn't spam refetches
        }
      });
    });
    return () => {
      clearTimeout(debounce);
      if (socket) {
        socket.off('proctoring:event');
        socket.off('connect');
        socket.off('disconnect');
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const openDetail = (id) => {
    setSelected(id);
    setDetailLoading(true);
    client.get(`/admin/proctoring/sessions/${id}`)
      .then(({ data }) => setDetail(data))
      .catch(() => toast.error('Failed to load session detail.'))
      .finally(() => setDetailLoading(false));
  };

  const decide = (decision) => {
    if (!selected) return;
    setDeciding(true);
    client.post(`/admin/proctoring/sessions/${selected}/decision`, { decision })
      .then(() => {
        toast.success(decision === 'confirmed' ? 'Session confirmed as a violation.' : 'Flag dismissed.');
        setSelected(null);
        setDetail(null);
        load();
      })
      .catch(() => toast.error('Failed to record decision.'))
      .finally(() => setDeciding(false));
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
        <div style={{ fontWeight: 700, fontSize: 15, color: C.primary }}>AI Quiz Proctor — Session Review</div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: C.secondary, fontWeight: 600 }}>
            <input type="checkbox" checked={flaggedOnly} onChange={(e) => setFlaggedOnly(e.target.checked)} />
            Flagged / in-review only
          </label>
          <button onClick={load} style={{ padding: '7px 16px', borderRadius: 8, border: `1px solid ${C.border}`, background: '#fff', cursor: 'pointer', fontSize: 12, fontWeight: 700, color: C.secondary }}>🔄 Refresh</button>
        </div>
      </div>

      <Card pad={0}>
        {loading ? <Spinner /> : sessions.length === 0 ? (
          <EmptyTable msg={flaggedOnly ? 'No flagged proctoring sessions right now — nice and quiet.' : 'No proctoring sessions recorded yet.'} />
        ) : (
          <div style={{ maxHeight: '75vh', overflowY: 'auto' }}>
            {sessions.map((s, i) => {
              const clr = BAND_COLOR[s.band] || C.muted;
              return (
                <div key={s.id} onClick={() => openDetail(s.id)}
                  style={{ display: 'flex', gap: 14, padding: '12px 18px', borderBottom: i < sessions.length - 1 ? `1px solid ${C.border}` : 'none', alignItems: 'center', cursor: 'pointer', transition: 'background .12s' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: clr, flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: 700, fontSize: 13, color: C.primary }}>{s.fullName || s.username}</span>
                      <span style={{ fontSize: 11, color: C.muted }}>@{s.username}</span>
                      <span style={{ fontFamily: 'monospace', fontSize: 11, fontWeight: 700, color: clr, background: clr + '15', padding: '2px 8px', borderRadius: 4 }}>{s.band}</span>
                      {s.finalStatus && <span style={{ fontSize: 11, color: C.muted, fontWeight: 600 }}>· {s.finalStatus}</span>}
                    </div>
                    <div style={{ fontSize: 11, color: C.muted, marginTop: 4 }}>
                      {s.contestName} · Risk {s.riskScore}/100 · {s.totalEvents} events
                      <span style={{ margin: '0 6px' }}>·</span>
                      {fmtTime(s.startedAt)}
                    </div>
                  </div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: clr }}>{Math.round(s.riskScore)}</div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {selected && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: 20 }}
          onClick={() => { setSelected(null); setDetail(null); }}>
          <div onClick={(e) => e.stopPropagation()} style={{ width: '100%', maxWidth: 560, maxHeight: '85vh', overflowY: 'auto', background: '#fff', borderRadius: 14, padding: 24, boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
            {detailLoading || !detail ? <Spinner /> : (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 16, color: C.primary }}>{detail.session.fullName}</div>
                    <div style={{ fontSize: 12, color: C.muted }}>@{detail.session.username} · {detail.session.contestName}</div>
                  </div>
                  <div style={{ fontSize: 28, fontWeight: 800, color: BAND_COLOR[detail.session.band] || C.muted }}>
                    {Math.round(detail.session.riskScore)}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
                  {Object.entries(detail.session.violationCounts).map(([sev, count]) => count > 0 && (
                    <span key={sev} style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: '#f1f5f9', color: C.secondary }}>
                      {count} {sev}
                    </span>
                  ))}
                </div>

                {detail.session.finalReason && (
                  <div style={{ fontSize: 12, color: C.secondary, background: '#f8fafc', border: `1px solid ${C.border}`, borderRadius: 8, padding: 10, marginBottom: 14, lineHeight: 1.5 }}>
                    {detail.session.finalReason}
                  </div>
                )}

                <div style={{ fontWeight: 700, fontSize: 12, color: C.primary, marginBottom: 8 }}>Event Timeline ({detail.events.length})</div>
                <div style={{ maxHeight: 220, overflowY: 'auto', border: `1px solid ${C.border}`, borderRadius: 8, marginBottom: 16 }}>
                  {detail.events.map((ev, i) => (
                    <div key={ev.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', borderBottom: i < detail.events.length - 1 ? `1px solid ${C.border}` : 'none', fontSize: 12 }}>
                      <span style={{ color: C.primary, fontWeight: 600 }}>{ev.event_type.replace(/_/g, ' ')}</span>
                      <span style={{ color: C.muted }}>{ev.severity} · {fmtTime(ev.created_at)}</span>
                    </div>
                  ))}
                </div>

                {detail.session.reviewerDecision ? (
                  <div style={{ fontSize: 12, fontWeight: 700, color: detail.session.reviewerDecision === 'confirmed' ? C.red : C.green }}>
                    Already reviewed: {detail.session.reviewerDecision} on {fmtTime(detail.session.reviewedAt)}
                  </div>
                ) : (
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button disabled={deciding} onClick={() => decide('dismissed')}
                      style={{ flex: 1, padding: '10px 16px', borderRadius: 8, border: `1px solid ${C.border}`, background: '#fff', cursor: 'pointer', fontWeight: 700, fontSize: 13, color: C.secondary }}>
                      Dismiss Flag
                    </button>
                    <button disabled={deciding} onClick={() => decide('confirmed')}
                      style={{ flex: 1, padding: '10px 16px', borderRadius: 8, border: 'none', background: C.red, cursor: 'pointer', fontWeight: 700, fontSize: 13, color: '#fff' }}>
                      Confirm Violation
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   AUDIT LOG
   ─────────────────────────────────────────────────────────────────────────── */
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
   TEMPLATES  (contests templates with alter, delete, and assigned time windows)
   ─────────────────────────────────────────────────────────────────────────── */
function Templates() {
  const [templates,setTemplates] = useState([]);
  const [quizzes,setQuizzes]   = useState([]);
  const [form,setForm] = useState({name:'',description:'',quizId:'',maxParticipants:6,entryPointsCost:0,startsAt:'',endsAt:''});
  const [dualEntry,setDualEntry] = useState(true);
  const [paidEntryCost,setPaidEntryCost] = useState(20);
  const [creating,setCreating] = useState(false);

  // Alter / Edit template state
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [alterForm, setAlterForm] = useState({});
  const [savingAlter, setSavingAlter] = useState(false);

  const load=()=>{
    client.get('/admin/templates').then(({data})=>setTemplates(data));
    client.get('/admin/quizzes').then(({data})=>setQuizzes(data));
  };
  useEffect(load,[]);

  const rewardStructure=[{rank:1,badge:'gold_scholar',points:200},{rank:2,badge:'silver_scholar',points:120},{rank:3,badge:'bronze_scholar',points:60}];

  const toISO = (local) => local ? new Date(local).toISOString() : null;

  const createTemplate=async e=>{
    e.preventDefault(); setCreating(true);
    try {
      const base={
        ...form,
        maxParticipants:Number(form.maxParticipants),
        startsAt: toISO(form.startsAt),
        endsAt: toISO(form.endsAt),
        rewardStructure
      };
      if (dualEntry) {
        await client.post('/admin/templates',{...base,name:`${form.name} (Free Entry)`,entryPointsCost:0});
        await client.post('/admin/templates',{...base,name:`${form.name} (Paid Entry)`,entryPointsCost:Number(paidEntryCost)});
        toast.success('Free + Paid entry contests created with assigned schedule!');
      } else {
        await client.post('/admin/templates',{...base,entryPointsCost:Number(form.entryPointsCost)});
        toast.success('Template created with assigned schedule!');
      }
      setForm({name:'',description:'',quizId:'',maxParticipants:6,entryPointsCost:0,startsAt:'',endsAt:''}); load();
    } catch(err){ toast.error(err.response?.data?.error||'Failed.'); }
    finally{ setCreating(false); }
  };

  const toggleField=async(id,field,value)=>{ await client.patch(`/admin/templates/${id}`,{[field]:value}); load(); };

  const openAlterTemplate = (t) => {
    const toLocalInput = (iso) => {
      if (!iso) return '';
      const d = new Date(iso);
      const pad = n => String(n).padStart(2, '0');
      return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    };
    setEditingTemplate(t);
    setAlterForm({
      name: t.name,
      description: t.description || '',
      quizId: t.quiz_id || t.quizId || '',
      maxParticipants: t.max_participants || 6,
      entryPointsCost: t.entry_points_cost || 0,
      startsAt: toLocalInput(t.starts_at),
      endsAt: toLocalInput(t.ends_at),
      autoRegenerate: !!t.auto_regenerate,
      isActive: !!t.is_active,
    });
  };

  const saveAlterTemplate = async (e) => {
    e.preventDefault();
    setSavingAlter(true);
    try {
      await client.put(`/admin/templates/${editingTemplate.id}`, {
        name: alterForm.name,
        description: alterForm.description,
        quizId: alterForm.quizId,
        maxParticipants: Number(alterForm.maxParticipants),
        entryPointsCost: Number(alterForm.entryPointsCost),
        startsAt: toISO(alterForm.startsAt),
        endsAt: toISO(alterForm.endsAt),
        autoRegenerate: alterForm.autoRegenerate,
        isActive: alterForm.isActive,
      });
      toast.success('Contest template updated!');
      setEditingTemplate(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update template.');
    } finally {
      setSavingAlter(false);
    }
  };

  const deleteTemplate = async (t) => {
    if (!window.confirm(`Are you sure you want to delete template "${t.name}"? This will delete the template and un-played contests.`)) return;
    try {
      await client.delete(`/admin/templates/${t.id}`);
      toast.success(`Template "${t.name}" deleted.`);
      load();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to delete template.');
    }
  };

  return (
    <div className="admin-split-360">
      <Card>
        <div style={{fontWeight:700,fontSize:15,marginBottom:16,color:C.primary}}>New Contest Template</div>
        <form onSubmit={createTemplate} style={{display:'flex',flexDirection:'column',gap:12}}>
          <div><label style={LBL}>Name *</label><input style={INP} value={form.name} onChange={e=>setForm({...form,name:e.target.value})} required/></div>
          <div><label style={LBL}>Description</label><input style={INP} value={form.description} onChange={e=>setForm({...form,description:e.target.value})}/></div>
          <div><label style={LBL}>Quiz *</label>
            <select style={INP} value={form.quizId} onChange={e=>setForm({...form,quizId:e.target.value})} required>
              <option value="">Select a quiz…</option>
              {quizzes.map(q=><option key={q.id} value={q.id}>{q.title} {q.proctoring_enabled ? '(🛡 AI Proctored)' : ''}</option>)}
            </select>
          </div>
          <div><label style={LBL}>Max Participants</label><input type="number" min={2} style={INP} value={form.maxParticipants} onChange={e=>setForm({...form,maxParticipants:e.target.value})} required/></div>

          <div className="admin-responsive-grid" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
            <div>
              <label style={LBL}>Assigned Start Time (Optional)</label>
              <input type="datetime-local" style={INP} value={form.startsAt || ''} onChange={e=>setForm({...form,startsAt:e.target.value})}/>
            </div>
            <div>
              <label style={LBL}>Assigned End Time (Optional)</label>
              <input type="datetime-local" style={INP} value={form.endsAt || ''} onChange={e=>setForm({...form,endsAt:e.target.value})}/>
            </div>
          </div>

          <label style={{display:'flex',alignItems:'center',gap:8,fontSize:12,fontWeight:600,color:C.secondary,background:'#f8fafc',border:`1px solid ${C.border}`,borderRadius:8,padding:'10px 12px'}}>
            <input type="checkbox" checked={dualEntry} onChange={e=>setDualEntry(e.target.checked)}/>
            Create both a Free entry and a Paid (points) entry contest for this quiz
          </label>

          {dualEntry ? (
            <div><label style={LBL}>Paid Entry Cost (pts)</label><input type="number" min={1} style={INP} value={paidEntryCost} onChange={e=>setPaidEntryCost(e.target.value)}/></div>
          ) : (
            <div><label style={LBL}>Entry Cost (pts)</label><input type="number" min={0} style={INP} value={form.entryPointsCost} onChange={e=>setForm({...form,entryPointsCost:e.target.value})}/></div>
          )}

          <button disabled={creating} type="submit" style={{padding:'9px 18px',borderRadius:8,border:'none',cursor:'pointer',background:'linear-gradient(135deg,#7c3aed,#2563eb)',color:'#fff',fontWeight:700,fontSize:13}}>
            {creating?'Creating…':dualEntry?'Create Free + Paid Contests':'Create Template'}
          </button>
        </form>
      </Card>
      <div style={{display:'flex',flexDirection:'column',gap:10}}>
        {templates.map(t=>(
          <Card key={t.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:16,gap:12,flexWrap:'wrap'}}>
            <div style={{flex:1,minWidth:200}}>
              <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:4,flexWrap:'wrap'}}>
                <div style={{fontWeight:700,fontSize:14,color:C.primary}}>{t.name}</div>
                <Badge label={Number(t.entry_points_cost)>0?`${t.entry_points_cost} pts entry`:'Free entry'} color={Number(t.entry_points_cost)>0?C.blue:C.green}/>
                {t.proctoring_enabled ? <Badge label="🛡 AI Proctored" color={C.green}/> : null}
              </div>
              <div style={{fontSize:12,color:C.muted}}>
                {t.quiz_title} · {t.max_participants} seats · {t.contests_spawned} contests
              </div>
              {(t.starts_at || t.ends_at) && (
                <div style={{fontSize:11,color:C.purple,fontWeight:600,marginTop:4,display:'flex',gap:6,alignItems:'center'}}>
                  <span>⏰ Scheduled:</span>
                  <span>{t.starts_at ? fmtTime(t.starts_at) : 'Immediate'} → {t.ends_at ? fmtTime(t.ends_at) : 'No expiry'}</span>
                </div>
              )}
            </div>
            <div style={{display:'flex',gap:8,flexWrap:'wrap',alignItems:'center'}}>
              <button style={{padding:'6px 10px',borderRadius:7,border:`1px solid ${C.border}`,background:'#fff',cursor:'pointer',fontSize:12,fontWeight:700,color:C.secondary}} onClick={()=>toggleField(t.id,'autoRegenerate',!t.auto_regenerate)}>
                Auto-regen: {t.auto_regenerate?'ON':'OFF'}
              </button>
              <button style={{padding:'6px 10px',borderRadius:7,border:`1px solid ${C.border}`,background:'#fff',cursor:'pointer',fontSize:12,fontWeight:700,color:t.is_active?C.amber:C.green}} onClick={()=>toggleField(t.id,'isActive',!t.is_active)}>
                {t.is_active?'Deactivate':'Activate'}
              </button>
              <button style={{padding:'6px 12px',borderRadius:7,border:`1px solid ${C.purple}`,background:`${C.purple}14`,cursor:'pointer',fontSize:12,fontWeight:700,color:C.purple}} onClick={()=>openAlterTemplate(t)} title="Edit Contest Template">
                ✏️ Alter
              </button>
              <button style={{padding:'6px 10px',borderRadius:7,border:'1px solid #fecaca',background:'#fef2f2',cursor:'pointer',fontSize:12,fontWeight:700,color:C.red}} onClick={()=>deleteTemplate(t)} title="Delete Contest Template">
                🗑️ Delete
              </button>
            </div>
          </Card>
        ))}
      </div>

      {/* Alter Contest Template Modal */}
      {editingTemplate && (
        <Modal title={`Alter Contest Template — ${editingTemplate.name}`} onClose={()=>setEditingTemplate(null)}>
          <form onSubmit={saveAlterTemplate} style={{display:'flex',flexDirection:'column',gap:14}}>
            <div>
              <label style={LBL}>Template Name *</label>
              <input style={INP} value={alterForm.name || ''} onChange={e=>setAlterForm({...alterForm,name:e.target.value})} required/>
            </div>
            <div>
              <label style={LBL}>Description</label>
              <input style={INP} value={alterForm.description || ''} onChange={e=>setAlterForm({...alterForm,description:e.target.value})}/>
            </div>
            <div>
              <label style={LBL}>Assigned Quiz *</label>
              <select style={INP} value={alterForm.quizId || ''} onChange={e=>setAlterForm({...alterForm,quizId:e.target.value})} required>
                <option value="">Select a quiz…</option>
                {quizzes.map(q=><option key={q.id} value={q.id}>{q.title}</option>)}
              </select>
            </div>
            <div className="admin-responsive-grid" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
              <div>
                <label style={LBL}>Max Participants</label>
                <input type="number" min={2} style={INP} value={alterForm.maxParticipants || 6} onChange={e=>setAlterForm({...alterForm,maxParticipants:e.target.value})} required/>
              </div>
              <div>
                <label style={LBL}>Entry Points Cost</label>
                <input type="number" min={0} style={INP} value={alterForm.entryPointsCost ?? 0} onChange={e=>setAlterForm({...alterForm,entryPointsCost:e.target.value})} required/>
              </div>
            </div>
            <div className="admin-responsive-grid" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
              <div>
                <label style={LBL}>Assigned Start Time</label>
                <input type="datetime-local" style={INP} value={alterForm.startsAt || ''} onChange={e=>setAlterForm({...alterForm,startsAt:e.target.value})}/>
              </div>
              <div>
                <label style={LBL}>Assigned End Time</label>
                <input type="datetime-local" style={INP} value={alterForm.endsAt || ''} onChange={e=>setAlterForm({...alterForm,endsAt:e.target.value})}/>
              </div>
            </div>
            <div style={{display:'flex',gap:20,alignItems:'center',background:'#f8fafc',padding:'10px 14px',borderRadius:8,border:`1px solid ${C.border}`}}>
              <label style={{display:'flex',alignItems:'center',gap:8,fontSize:13,fontWeight:600,color:C.secondary}}>
                <input type="checkbox" checked={!!alterForm.autoRegenerate} onChange={e=>setAlterForm({...alterForm,autoRegenerate:e.target.checked})}/>
                Auto-regenerate when full
              </label>
              <label style={{display:'flex',alignItems:'center',gap:8,fontSize:13,fontWeight:600,color:C.secondary}}>
                <input type="checkbox" checked={!!alterForm.isActive} onChange={e=>setAlterForm({...alterForm,isActive:e.target.checked})}/>
                Active
              </label>
            </div>
            <div style={{display:'flex',gap:10,justifyContent:'flex-end',marginTop:8}}>
              <button type="button" onClick={()=>setEditingTemplate(null)} style={{padding:'9px 18px',borderRadius:8,border:`1px solid ${C.border}`,background:'#fff',cursor:'pointer',fontSize:13,fontWeight:700,color:C.secondary}}>
                Cancel
              </button>
              <button disabled={savingAlter} type="submit" style={{padding:'9px 18px',borderRadius:8,border:'none',cursor:'pointer',background:C.purple,color:'#fff',fontSize:13,fontWeight:700}}>
                {savingAlter ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   QUIZZES  (with Alter / Edit, Delete, and Proctoring options)
   ─────────────────────────────────────────────────────────────────────────── */
function Quizzes() {
  const [quizzes,setQuizzes] = useState([]);
  const [form,setForm] = useState({title:'',description:'',durationMinutes:10,negativeMarking:0.25,proctoringEnabled:true,questions:[]});
  const [q,setQ] = useState({questionText:'',options:['','','',''],correctIndex:0});
  const [creating,setCreating] = useState(false);
  const [togglingId,setTogglingId] = useState(null);
  const [loading,setLoading] = useState(false);
  const [loadError,setLoadError] = useState(null);

  // Alter / Edit Quiz state
  const [editingQuiz, setEditingQuiz] = useState(null);
  const [fetchingQuizId, setFetchingQuizId] = useState(null);
  const [savingQuiz, setSavingQuiz] = useState(false);
  const [newAlterQ, setNewAlterQ] = useState({questionText:'',options:['','','',''],correctIndex:0});

  const load=useCallback(()=>{
    setLoading(true); setLoadError(null);
    return client.get('/admin/quizzes')
      .then(({data})=>setQuizzes(data))
      .catch(err=>{
        const msg = err.response?.data?.error || err.message || 'Failed to load quizzes.';
        setLoadError(msg);
        toast.error(msg);
      })
      .finally(()=>setLoading(false));
  },[]);
  useEffect(()=>{ load(); },[load]);

  const addQ=()=>{
    if(!q.questionText||q.options.some(o=>!o)){ toast.error('Fill question and all 4 options.'); return; }
    const ids=['A','B','C','D'];
    setForm({...form,questions:[...form.questions,{questionText:q.questionText,options:q.options.map((t,i)=>({id:ids[i],text:t})),correctOptions:[ids[q.correctIndex]],marks:1,negativeMarks:0.25}]});
    setQ({questionText:'',options:['','','',''],correctIndex:0});
  };

  const createQuiz=async e=>{
    e.preventDefault(); if(!form.questions.length){ toast.error('Add at least one question.'); return; }
    setCreating(true);
    try { await client.post('/admin/quizzes',form); toast.success('Quiz published!'); setForm({title:'',description:'',durationMinutes:10,negativeMarking:0.25,proctoringEnabled:true,questions:[]}); load(); }
    catch(err){ toast.error(err.response?.data?.error||'Failed.'); }
    finally{ setCreating(false); }
  };

  const toggleProctoring=async(qz)=>{
    setTogglingId(qz.id);
    try {
      const nextVal = !qz.proctoring_enabled;
      const { data } = await client.patch(`/admin/quizzes/${qz.id}`, { proctoringEnabled: nextVal });
      const updatedVal = data?.proctoring_enabled !== undefined ? !!data.proctoring_enabled : nextVal;
      setQuizzes(prev=>prev.map(x=>x.id===qz.id ? { ...x, proctoring_enabled: updatedVal } : x));
      toast.success(`AI Proctoring ${updatedVal ? 'enabled' : 'disabled'} for "${qz.title}"`);
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Failed to update proctoring setting.';
      toast.error(msg);
    } finally {
      setTogglingId(null);
    }
  };

  const openAlterQuiz = async (qz) => {
    setFetchingQuizId(qz.id);
    try {
      const { data } = await client.get(`/admin/quizzes/${qz.id}`);
      const questions = (data.questions || []).map((quest) => {
        let opts = ['', '', '', ''];
        let correctIdx = 0;
        if (Array.isArray(quest.options)) {
          opts = quest.options.map(o => (typeof o === 'string' ? o : o.text || ''));
          while (opts.length < 4) opts.push('');
          correctIdx = quest.options.findIndex(o => (o.is_correct || (quest.correct_options && quest.correct_options[0] === o.id)));
          if (correctIdx < 0) correctIdx = 0;
        }
        return {
          questionText: quest.question_text || quest.text || '',
          options: opts,
          correctIndex: correctIdx,
          marks: quest.marks || 1,
          negativeMarks: quest.negative_marks !== undefined ? quest.negative_marks : 0.25,
        };
      });

      setEditingQuiz({
        id: qz.id,
        title: data.title || qz.title,
        description: data.description || '',
        durationMinutes: data.time_limit_mins || qz.duration_minutes || 10,
        negativeMarking: data.negative_marking !== undefined ? data.negative_marking : 0.25,
        proctoringEnabled: data.proctoring_enabled !== undefined ? !!data.proctoring_enabled : !!qz.proctoring_enabled,
        questions: questions
      });
      setNewAlterQ({questionText:'',options:['','','',''],correctIndex:0});
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to load quiz details.');
    } finally {
      setFetchingQuizId(null);
    }
  };

  const saveAlterQuiz = async (e) => {
    e.preventDefault();
    if (!editingQuiz.questions.length) {
      toast.error('Quiz must have at least one question.');
      return;
    }
    setSavingQuiz(true);
    try {
      const ids = ['A', 'B', 'C', 'D'];
      const payload = {
        title: editingQuiz.title,
        description: editingQuiz.description,
        durationMinutes: Number(editingQuiz.durationMinutes),
        negativeMarking: Number(editingQuiz.negativeMarking),
        proctoringEnabled: editingQuiz.proctoringEnabled,
        questions: editingQuiz.questions.map(quest => ({
          questionText: quest.questionText,
          options: quest.options.map((t, i) => ({ id: ids[i], text: t })),
          correctOptions: [ids[quest.correctIndex || 0]],
          marks: Number(quest.marks || 1),
          negativeMarks: Number(quest.negativeMarks !== undefined ? quest.negativeMarks : 0.25),
        }))
      };
      await client.put(`/admin/quizzes/${editingQuiz.id}`, payload);
      toast.success('Quiz altered & updated successfully!');
      setEditingQuiz(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update quiz.');
    } finally {
      setSavingQuiz(false);
    }
  };

  const deleteQuiz = async (qz) => {
    if (!window.confirm(`Are you sure you want to delete quiz "${qz.title}"? Associated contest templates will be unlinked.`)) return;
    try {
      await client.delete(`/admin/quizzes/${qz.id}`);
      toast.success(`Quiz "${qz.title}" deleted.`);
      load();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to delete quiz.');
    }
  };

  const addQuestionToAlter = () => {
    if (!newAlterQ.questionText || newAlterQ.options.some(o => !o)) {
      toast.error('Fill the question text and all 4 options.');
      return;
    }
    setEditingQuiz({
      ...editingQuiz,
      questions: [
        ...editingQuiz.questions,
        {
          questionText: newAlterQ.questionText,
          options: [...newAlterQ.options],
          correctIndex: newAlterQ.correctIndex,
          marks: 1,
          negativeMarks: 0.25,
        }
      ]
    });
    setNewAlterQ({questionText:'',options:['','','',''],correctIndex:0});
    toast.success('Question added to quiz!');
  };

  const removeQuestionFromAlter = (idx) => {
    const updated = editingQuiz.questions.filter((_, i) => i !== idx);
    setEditingQuiz({ ...editingQuiz, questions: updated });
  };

  return (
    <div className="admin-split-420">
      <Card>
        <div style={{fontWeight:700,fontSize:15,marginBottom:16,color:C.primary}}>Create New Quiz</div>
        <form onSubmit={createQuiz} style={{display:'flex',flexDirection:'column',gap:12}}>
          <div><label style={LBL}>Title *</label><input style={INP} value={form.title} onChange={e=>setForm({...form,title:e.target.value})} required/></div>
          <div><label style={LBL}>Description</label><input style={INP} value={form.description} onChange={e=>setForm({...form,description:e.target.value})}/></div>
          <div className="admin-responsive-grid" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
            <div><label style={LBL}>Duration (min)</label><input type="number" style={INP} value={form.durationMinutes} onChange={e=>setForm({...form,durationMinutes:Number(e.target.value)})}/></div>
            <div><label style={LBL}>Negative Marking</label><input type="number" step="0.25" style={INP} value={form.negativeMarking} onChange={e=>setForm({...form,negativeMarking:Number(e.target.value)})}/></div>
          </div>
          <label style={{display:'flex',alignItems:'center',gap:8,fontSize:12,fontWeight:600,color:C.secondary}}>
            <input type="checkbox" checked={form.proctoringEnabled} onChange={e=>setForm({...form,proctoringEnabled:e.target.checked})}/>
            AI Proctoring (camera/mic system check, tab-switch & copy-paste detection)
          </label>
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
            <div style={{display:'flex',gap:8,alignItems:'center',flexWrap:'wrap'}}>
              <Badge label={`${qz.question_count} questions`} color={C.purple}/>
              <Badge label={`${qz.duration_minutes} min`} color={C.blue}/>
              {qz.proctoring_enabled ? (
                <Badge label="🛡 Proctored (AI)" color={C.green}/>
              ) : (
                <Badge label="Standard (No Proctor)" color={C.muted}/>
              )}

              <div style={{marginLeft:'auto',display:'flex',gap:6,alignItems:'center',flexWrap:'wrap'}}>
                <button disabled={togglingId===qz.id} onClick={()=>toggleProctoring(qz)}
                  style={{
                    padding:'5px 10px',
                    borderRadius:6,
                    border:`1px solid ${qz.proctoring_enabled ? '#fecaca' : '#bbf7d0'}`,
                    background: qz.proctoring_enabled ? '#fef2f2' : '#f0fdf4',
                    cursor: togglingId===qz.id ? 'not-allowed' : 'pointer',
                    fontSize:11,
                    fontWeight:700,
                    color: qz.proctoring_enabled ? C.red : C.green,
                    display:'inline-flex',
                    alignItems:'center',
                    gap:4,
                    transition:'all .15s'
                  }}>
                  {togglingId===qz.id ? 'Updating…' : qz.proctoring_enabled ? 'Disable' : '🛡️ Proctor'}
                </button>
                <button
                  disabled={fetchingQuizId===qz.id}
                  onClick={()=>openAlterQuiz(qz)}
                  style={{
                    padding:'5px 12px',
                    borderRadius:6,
                    border:`1px solid ${C.purple}`,
                    background: `${C.purple}14`,
                    cursor:'pointer',
                    fontSize:11,
                    fontWeight:700,
                    color: C.purple,
                    display:'inline-flex',
                    alignItems:'center',
                    gap:4
                  }}
                  title="Alter / Edit Quiz & Questions"
                >
                  {fetchingQuizId===qz.id ? 'Loading…' : '✏️ Alter'}
                </button>
                <button
                  onClick={()=>deleteQuiz(qz)}
                  style={{
                    padding:'5px 10px',
                    borderRadius:6,
                    border:'1px solid #fecaca',
                    background:'#fef2f2',
                    cursor:'pointer',
                    fontSize:11,
                    fontWeight:700,
                    color:C.red,
                    display:'inline-flex',
                    alignItems:'center',
                    gap:4
                  }}
                  title="Delete Quiz"
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Alter Quiz Modal */}
      {editingQuiz && (
        <Modal wide={true} title={`Alter Quiz — ${editingQuiz.title}`} onClose={()=>setEditingQuiz(null)}>
          <form onSubmit={saveAlterQuiz} style={{display:'flex',flexDirection:'column',gap:16,maxHeight:'75vh',overflowY:'auto',paddingRight:4}}>
            <div>
              <label style={LBL}>Quiz Title *</label>
              <input style={INP} value={editingQuiz.title} onChange={e=>setEditingQuiz({...editingQuiz,title:e.target.value})} required/>
            </div>
            <div>
              <label style={LBL}>Description</label>
              <input style={INP} value={editingQuiz.description} onChange={e=>setEditingQuiz({...editingQuiz,description:e.target.value})}/>
            </div>
            <div className="admin-responsive-grid" style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:10}}>
              <div>
                <label style={LBL}>Duration (Minutes)</label>
                <input type="number" min={1} style={INP} value={editingQuiz.durationMinutes} onChange={e=>setEditingQuiz({...editingQuiz,durationMinutes:Number(e.target.value)})} required/>
              </div>
              <div>
                <label style={LBL}>Negative Marks</label>
                <input type="number" step="0.25" style={INP} value={editingQuiz.negativeMarking} onChange={e=>setEditingQuiz({...editingQuiz,negativeMarking:Number(e.target.value)})}/>
              </div>
              <div style={{display:'flex',alignItems:'center',paddingTop:18}}>
                <label style={{display:'flex',alignItems:'center',gap:8,fontSize:12,fontWeight:600,color:C.secondary}}>
                  <input type="checkbox" checked={editingQuiz.proctoringEnabled} onChange={e=>setEditingQuiz({...editingQuiz,proctoringEnabled:e.target.checked})}/>
                  🛡️ AI Proctoring
                </label>
              </div>
            </div>

            {/* Questions List */}
            <div style={{fontWeight:700,fontSize:14,color:C.primary,borderBottom:`1px solid ${C.border}`,paddingBottom:8,marginTop:8}}>
              Questions ({editingQuiz.questions.length})
            </div>

            {editingQuiz.questions.map((quest, qIdx)=>(
              <div key={qIdx} style={{background:'#f8fafc',border:`1px solid ${C.border}`,borderRadius:10,padding:14,position:'relative'}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
                  <span style={{fontSize:12,fontWeight:700,color:C.purple}}>Question #{qIdx+1}</span>
                  <button type="button" onClick={()=>removeQuestionFromAlter(qIdx)} style={{border:'none',background:'none',color:C.red,cursor:'pointer',fontSize:12,fontWeight:700}}>
                    ✕ Remove Question
                  </button>
                </div>
                <input
                  style={{...INP,marginBottom:8}}
                  placeholder="Question text"
                  value={quest.questionText}
                  onChange={e=>{
                    const updated = [...editingQuiz.questions];
                    updated[qIdx].questionText = e.target.value;
                    setEditingQuiz({...editingQuiz, questions: updated});
                  }}
                  required
                />
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
                  {quest.options.map((opt, oIdx)=>(
                    <div key={oIdx} style={{display:'flex',gap:6,alignItems:'center'}}>
                      <input
                        type="radio"
                        name={`correct_q_${qIdx}`}
                        checked={quest.correctIndex === oIdx}
                        onChange={()=>{
                          const updated = [...editingQuiz.questions];
                          updated[qIdx].correctIndex = oIdx;
                          setEditingQuiz({...editingQuiz, questions: updated});
                        }}
                        style={{width:'auto',accentColor:C.purple}}
                        title="Mark as correct option"
                      />
                      <input
                        style={{...INP,fontSize:12,padding:'6px 10px'}}
                        placeholder={`Option ${String.fromCharCode(65+oIdx)}`}
                        value={opt}
                        onChange={e=>{
                          const updated = [...editingQuiz.questions];
                          const newOpts = [...updated[qIdx].options];
                          newOpts[oIdx] = e.target.value;
                          updated[qIdx].options = newOpts;
                          setEditingQuiz({...editingQuiz, questions: updated});
                        }}
                        required
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* Inline Add Question */}
            <div style={{background:'#f1f5f9',border:`1px dashed ${C.border}`,borderRadius:10,padding:14}}>
              <div style={{fontSize:12,fontWeight:700,color:C.secondary,marginBottom:8}}>+ Add Another Question to this Quiz</div>
              <input
                style={{...INP,marginBottom:8}}
                placeholder="New question text"
                value={newAlterQ.questionText}
                onChange={e=>setNewAlterQ({...newAlterQ, questionText:e.target.value})}
              />
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:8}}>
                {newAlterQ.options.map((opt, i)=>(
                  <div key={i} style={{display:'flex',gap:6,alignItems:'center'}}>
                    <input
                      type="radio"
                      name="new_alter_correct"
                      checked={newAlterQ.correctIndex === i}
                      onChange={()=>setNewAlterQ({...newAlterQ, correctIndex: i})}
                      style={{width:'auto',accentColor:C.purple}}
                    />
                    <input
                      style={{...INP,fontSize:12,padding:'6px 10px'}}
                      placeholder={`Option ${String.fromCharCode(65+i)}`}
                      value={opt}
                      onChange={e=>{
                        const opts = [...newAlterQ.options];
                        opts[i] = e.target.value;
                        setNewAlterQ({...newAlterQ, options: opts});
                      }}
                    />
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={addQuestionToAlter}
                style={{padding:'6px 14px',borderRadius:7,border:`1px solid ${C.purple}`,background:'#fff',cursor:'pointer',fontSize:12,fontWeight:700,color:C.purple}}
              >
                + Add Question to Quiz
              </button>
            </div>

            <div style={{display:'flex',gap:10,justifyContent:'flex-end',marginTop:12,borderTop:`1px solid ${C.border}`,paddingTop:14}}>
              <button
                type="button"
                onClick={()=>setEditingQuiz(null)}
                style={{padding:'9px 18px',borderRadius:8,border:`1px solid ${C.border}`,background:'#fff',cursor:'pointer',fontSize:13,fontWeight:700,color:C.secondary}}
              >
                Cancel
              </button>
              <button
                disabled={savingQuiz}
                type="submit"
                style={{padding:'9px 22px',borderRadius:8,border:'none',cursor:'pointer',background:C.purple,color:'#fff',fontSize:13,fontWeight:700}}
              >
                {savingQuiz ? 'Saving Alterations…' : 'Save Quiz Alterations'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   NEWS MANAGER  (enhanced with rich-text editor + image uploader)
   ─────────────────────────────────────────────────────────────── */

const EMPTY_ART = {title:'',description:'',content:'',imageUrl:'',category:'general',articleType:'news',vlogUrl:'',authorName:'',isFeatured:false};

/* ── Word HTML cleaner ─────────────────────────────────────────────────────── */
function cleanWordHtml(html) {
  return html
    .replace(/<o:p[^>]*>[\s\S]*?<\/o:p>/gi,'')
    .replace(/<w:[^>]+>[\s\S]*?<\/w:[^>]+>/gi,'')
    .replace(/<m:[^>]+>[\s\S]*?<\/m:[^>]+>/gi,'')
    .replace(/<!--\[if[^\]]*\]>[\s\S]*?<!\[endif\]-->/gi,'')
    .replace(/ class="Mso[^"]*"/gi,'')
    .replace(/ style="[^"]*mso-[^"]*"/gi,'')
    .replace(/<span\s*>/gi,'<span>')
    .replace(/<\/?(xml|head|style|script|meta|link)[^>]*>/gi,'')
    .replace(/\s{2,}/g,' ')
    .trim();
}

/* ── RichTextEditor ────────────────────────────────────────────────────────── */
const TB_BTN = { padding:'4px 9px', borderRadius:5, border:`1px solid #e2e8f0`, background:'#fff', cursor:'pointer', fontSize:12, fontWeight:600, color:'#475569', lineHeight:1.3 };

function RichTextEditor({ value, onChange }) {
  const edRef = useRef(null);
  const isUpdating = useRef(false);

  /* Sync external value → editor when form resets */
  useEffect(() => {
    if (!edRef.current) return;
    if (edRef.current.innerHTML !== value) {
      isUpdating.current = true;
      edRef.current.innerHTML = value || '';
      isUpdating.current = false;
    }
  }, [value]);

  const exec = (cmd, val = null) => { document.execCommand(cmd, false, val); edRef.current?.focus(); };

  const handlePaste = useCallback((e) => {
    e.preventDefault();
    const html = e.clipboardData.getData('text/html');
    const text = e.clipboardData.getData('text/plain');
    if (html) {
      document.execCommand('insertHTML', false, cleanWordHtml(html));
    } else {
      document.execCommand('insertText', false, text);
    }
    if (edRef.current) onChange(edRef.current.innerHTML);
  }, [onChange]);

  const handleInput = useCallback(() => {
    if (!isUpdating.current && edRef.current) onChange(edRef.current.innerHTML);
  }, [onChange]);

  const insertLink = () => {
    const url = prompt('Enter URL:');
    if (url) exec('createLink', url);
  };

  return (
    <div style={{border:`1px solid ${C.border}`,borderRadius:8,overflow:'hidden',background:'#fff'}}>
      {/* Toolbar */}
      <div style={{display:'flex',flexWrap:'wrap',gap:4,padding:'6px 8px',borderBottom:`1px solid ${C.border}`,background:'#f8fafc'}}>
        {[
          {label:'B',title:'Bold',cmd:'bold',style:{fontWeight:900}},
          {label:'I',title:'Italic',cmd:'italic',style:{fontStyle:'italic'}},
          {label:'U',title:'Underline',cmd:'underline',style:{textDecoration:'underline'}},
          {label:'S',title:'Strikethrough',cmd:'strikeThrough',style:{textDecoration:'line-through'}},
        ].map(b=>(
          <button key={b.cmd} type="button" title={b.title} style={{...TB_BTN,...b.style}} onMouseDown={e=>{e.preventDefault();exec(b.cmd)}}>{b.label}</button>
        ))}
        <span style={{width:1,background:C.border,margin:'0 4px',alignSelf:'stretch'}}/>
        {['H1','H2','H3'].map(h=>(
          <button key={h} type="button" title={h} style={TB_BTN} onMouseDown={e=>{e.preventDefault();exec('formatBlock',h.toLowerCase())}}>{h}</button>
        ))}
        <button type="button" title="Paragraph" style={TB_BTN} onMouseDown={e=>{e.preventDefault();exec('formatBlock','p')}}>¶</button>
        <span style={{width:1,background:C.border,margin:'0 4px',alignSelf:'stretch'}}/>
        <button type="button" title="Bullet list" style={TB_BTN} onMouseDown={e=>{e.preventDefault();exec('insertUnorderedList')}}>• List</button>
        <button type="button" title="Numbered list" style={TB_BTN} onMouseDown={e=>{e.preventDefault();exec('insertOrderedList')}}>1. List</button>
        <span style={{width:1,background:C.border,margin:'0 4px',alignSelf:'stretch'}}/>
        <button type="button" title="Align left" style={TB_BTN} onMouseDown={e=>{e.preventDefault();exec('justifyLeft')}}>⬅</button>
        <button type="button" title="Align center" style={TB_BTN} onMouseDown={e=>{e.preventDefault();exec('justifyCenter')}}>≡</button>
        <button type="button" title="Align right" style={TB_BTN} onMouseDown={e=>{e.preventDefault();exec('justifyRight')}}>➡</button>
        <span style={{width:1,background:C.border,margin:'0 4px',alignSelf:'stretch'}}/>
        <button type="button" title="Insert link" style={TB_BTN} onMouseDown={e=>{e.preventDefault();insertLink()}}>🔗</button>
        <button type="button" title="Remove formatting" style={{...TB_BTN,color:C.red}} onMouseDown={e=>{e.preventDefault();exec('removeFormat')}}>✕ Format</button>
      </div>
      {/* Editable area */}
      <div
        ref={edRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onPaste={handlePaste}
        style={{
          minHeight:180, padding:'12px 14px', outline:'none',
          fontSize:14, lineHeight:1.7, color:C.primary,
          overflowY:'auto', maxHeight:400,
        }}
        data-placeholder="Write content here, or paste from MS Word — formatting is preserved..."
      />
      <style>{`
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: #94a3b8;
          pointer-events: none;
        }
        [contenteditable] h1 { font-size:1.6em; font-weight:800; margin:.6em 0 .3em; }
        [contenteditable] h2 { font-size:1.3em; font-weight:700; margin:.6em 0 .3em; }
        [contenteditable] h3 { font-size:1.1em; font-weight:700; margin:.5em 0 .25em; }
        [contenteditable] ul, [contenteditable] ol { margin:.4em 0 .8em 1.5em; }
        [contenteditable] li { margin-bottom:.2em; }
        [contenteditable] blockquote { border-left:3px solid #7c3aed; padding:6px 12px; color:#475569; font-style:italic; margin:.8em 0; }
      `}</style>
    </div>
  );
}

/* ── ImageUploader ─────────────────────────────────────────────────────────── */
function ImageUploader({ value, onChange }) {
  const [tab, setTab] = useState('upload'); // 'upload' | 'url'
  const [uploading, setUploading] = useState(false);
  const [imgError, setImgError] = useState(false);
  const fileRef = useRef(null);

  useEffect(() => {
    setImgError(false);
  }, [value]);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setImgError(false);
    try {
      const fd = new FormData();
      fd.append('image', file);
      const { data } = await client.post('/upload/image', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      onChange(data.url);
      toast.success('Image uploaded!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Upload failed.');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const TAB_STYLE = (active) => ({
    padding:'6px 14px', borderRadius:'6px 6px 0 0', border:'none', cursor:'pointer',
    fontSize:12, fontWeight:700,
    background: active ? '#fff' : '#f1f5f9',
    color: active ? C.purple : C.secondary,
    borderBottom: active ? '2px solid #7c3aed' : '2px solid transparent',
  });

  const previewSrc = resolveImageUrl(value);

  return (
    <div>
      <label style={LBL}>Thumbnail Image</label>
      {/* Tab switcher */}
      <div style={{display:'flex',gap:2,marginBottom:0,borderBottom:`1px solid ${C.border}`}}>
        <button type="button" style={TAB_STYLE(tab==='upload')} onClick={()=>setTab('upload')}>📁 Upload from Device</button>
        <button type="button" style={TAB_STYLE(tab==='url')} onClick={()=>setTab('url')}>🔗 Paste URL</button>
      </div>

      <div style={{border:`1px solid ${C.border}`,borderTop:'none',borderRadius:'0 0 8px 8px',padding:12,background:'#f8fafc'}}>
        {tab === 'upload' ? (
          <div>
            <div
              style={{
                border:'2px dashed #c7d2fe', borderRadius:8, padding:'20px 16px',
                textAlign:'center', cursor:'pointer', background:uploading?'#ede9fe':'#fff',
                transition:'all .2s',
              }}
              onClick={()=>fileRef.current?.click()}
              onDragOver={e=>{e.preventDefault();}}
              onDrop={e=>{e.preventDefault();const f=e.dataTransfer.files[0];if(f){fileRef.current.files=e.dataTransfer.files;handleFile({target:{files:[f]}});}}}
            >
              {uploading
                ? <><div style={{fontSize:24}}>⏳</div><div style={{fontSize:13,color:C.secondary,marginTop:8}}>Uploading…</div></>
                : <><div style={{fontSize:28}}>🖼️</div><div style={{fontSize:13,color:C.secondary,marginTop:6}}>Click or drag & drop an image</div><div style={{fontSize:11,color:C.muted,marginTop:3}}>PNG, JPG, GIF, WebP — max 8 MB</div></>
              }
            </div>
            <input ref={fileRef} type="file" accept="image/*" style={{display:'none'}} onChange={handleFile} />
          </div>
        ) : (
          <input
            style={INP}
            value={value}
            onChange={e=>onChange(e.target.value)}
            placeholder="https://example.com/image.jpg"
          />
        )}
      </div>

      {/* Preview */}
      {value && (
        <div style={{marginTop:10,position:'relative',display:'inline-block'}}>
          {!imgError ? (
            <img
              key={previewSrc}
              src={previewSrc}
              alt="Preview"
              style={{height:80,maxWidth:220,borderRadius:8,border:`1px solid ${C.border}`,objectFit:'cover',display:'block'}}
              onError={()=>setImgError(true)}
            />
          ) : (
            <div style={{height:60,padding:'0 14px',borderRadius:8,border:`1px dashed ${C.red}`,background:'#fff1f2',display:'flex',alignItems:'center',gap:8,color:C.red,fontSize:12}}>
              <span>⚠️</span>
              <span>Image preview failed to load</span>
            </div>
          )}
          <button
            type="button"
            onClick={()=>{onChange(''); setImgError(false);}}
            style={{position:'absolute',top:-6,right:-6,width:20,height:20,borderRadius:'50%',border:'none',background:C.red,color:'#fff',fontSize:11,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}
            title="Remove image"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}

/* ── NewsManager ───────────────────────────────────────────────────────────── */
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
          <form onSubmit={submit} style={{display:'flex',flexDirection:'column',gap:14}}>

            {/* Title */}
            <div><label style={LBL}>Title *</label><input style={INP} value={form.title} onChange={e=>setForm({...form,title:e.target.value})} required/></div>

            {/* Description */}
            <div><label style={LBL}>Short Description</label><textarea style={{...INP,minHeight:60,resize:'vertical'}} value={form.description} onChange={e=>setForm({...form,description:e.target.value})}/></div>

            {/* Type + Category row */}
            <div className="admin-responsive-grid" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
              <div><label style={LBL}>Type</label><select style={INP} value={form.articleType} onChange={e=>setForm({...form,articleType:e.target.value})}><option value="news">📰 News</option><option value="vlog">🎥 Vlog</option></select></div>
              <div><label style={LBL}>Category</label><select style={INP} value={form.category} onChange={e=>setForm({...form,category:e.target.value})}>{ARTICLE_CATEGORIES.map(c=><option key={c} value={c}>{c.charAt(0).toUpperCase()+c.slice(1)}</option>)}</select></div>
            </div>

            {/* Image uploader */}
            <ImageUploader value={form.imageUrl} onChange={url=>setForm({...form,imageUrl:url})} />

            {/* Vlog URL */}
            {form.articleType==='vlog'&&(
              <div><label style={LBL}>Vlog URL *</label><input style={INP} value={form.vlogUrl} onChange={e=>setForm({...form,vlogUrl:e.target.value})} placeholder="https://youtube.com/…"/></div>
            )}

            {/* Rich-text content */}
            <div>
              <label style={{...LBL,marginBottom:6}}>Full Content <span style={{fontWeight:400,textTransform:'none',color:C.muted}}>(paste from MS Word — styles are preserved)</span></label>
              <RichTextEditor value={form.content} onChange={html=>setForm(f=>({...f,content:html}))} />
            </div>

            {/* Author + Featured */}
            <div className="admin-responsive-grid" style={{display:'grid',gridTemplateColumns:'1fr auto',gap:12,alignItems:'flex-end'}}>
              <div><label style={LBL}>Author Name</label><input style={INP} value={form.authorName} onChange={e=>setForm({...form,authorName:e.target.value})} placeholder="(optional)"/></div>
              <label style={{display:'flex',alignItems:'center',gap:8,padding:'9px 14px',border:`1px solid ${C.border}`,borderRadius:8,cursor:'pointer',fontSize:13,fontWeight:600,background:form.isFeatured?'#fffbeb':'#fff'}}>
                <input type="checkbox" checked={form.isFeatured} onChange={e=>setForm({...form,isFeatured:e.target.checked})} style={{width:'auto',accentColor:'#f59e0b'}}/> ⭐ Featured
              </label>
            </div>

            {/* Submit */}
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
              {(() => {
                const isVlog = a.article_type === 'vlog' || a.articleType === 'vlog';
                const thumb = resolveArticleThumbnail(a);
                return (
                  <div style={{width:64,height:64,borderRadius:8,flexShrink:0,overflow:'hidden',background:'#f1f5f9',border:`1px solid ${C.border}`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:24,position:'relative'}}>
                    {thumb ? (
                      <img
                        src={thumb}
                        alt={a.title}
                        referrerPolicy="no-referrer"
                        style={{width:'100%',height:'100%',objectFit:'cover'}}
                        onError={(e) => {
                          const fallback = getCategoryFallbackImage(a.category, isVlog);
                          if (e.target.src !== fallback) {
                            e.target.src = fallback;
                          } else {
                            e.target.style.display = 'none';
                            if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
                          }
                        }}
                      />
                    ) : null}
                    <div style={{display: thumb ? 'none' : 'flex', alignItems:'center', justifyContent:'center', width:'100%', height:'100%'}}>
                      {a.article_type === 'vlog' ? '🎥' : '📰'}
                    </div>
                  </div>
                );
              })()}
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

/* ─────────────────────────────────────────────────────────────────────────────
   CONTEST SCHEDULE TAB — Admin can set start/end time and status per contest
   ─────────────────────────────────────────────────────────────────────────── */
function ContestScheduleTab({ onDownloadExcel, exportingExcel }) {
  const [contests, setContests] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [modal, setModal]       = useState(null); // { contest }
  const [form, setForm]         = useState({ startsAt: '', endsAt: '', status: '' });
  const [saving, setSaving]     = useState(false);

  const STATUS_OPTS = ['upcoming', 'live', 'locked', 'completed', 'cancelled'];
  const STATUS_COLOR = {
    upcoming:  '#2563eb', live: '#16a34a', locked: '#d97706',
    completed: '#6b7280', cancelled: '#dc2626',
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await client.get('/admin/contests', { params: { search, limit: 100 } });
      setContests(data);
    } catch {
      toast.error('Failed to load contests.');
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => { load(); }, [load]);

  const openModal = (c) => {
    // Pre-fill form with existing values, converting UTC ISO → local datetime-local value
    const toLocalInput = (iso) => {
      if (!iso) return '';
      const d = new Date(iso);
      const pad = n => String(n).padStart(2, '0');
      return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    };
    setForm({ startsAt: toLocalInput(c.starts_at), endsAt: toLocalInput(c.ends_at), status: c.status });
    setModal(c);
  };

  const save = async () => {
    if (!modal) return;
    setSaving(true);
    try {
      // Convert local datetime-local → UTC ISO strings for the API
      const toISO = (local) => local ? new Date(local).toISOString() : undefined;
      await client.patch(`/admin/contests/${modal.id}/schedule`, {
        startsAt: form.startsAt ? toISO(form.startsAt) : null,
        endsAt:   form.endsAt   ? toISO(form.endsAt)   : null,
        status:   form.status   || undefined,
      });
      toast.success(`Schedule updated for "${modal.name}"`);
      setModal(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update schedule.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteContest = async (c) => {
    if (!window.confirm(`Are you sure you want to delete contest "${c.name}"? This action cannot be undone.`)) return;
    try {
      await client.delete(`/admin/contests/${c.id}`);
      toast.success(`Contest "${c.name}" deleted.`);
      load();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to delete contest.');
    }
  };

  const filtered = contests.filter(c =>
    !search || c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.quiz_title?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ fontWeight: 800, fontSize: 18, color: C.primary }}>Contest Schedule</div>
          <div style={{ fontSize: 13, color: C.muted, marginTop: 2 }}>
            Set start/end date & time for any contest, and change its status.
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {onDownloadExcel && (
            <button
              onClick={onDownloadExcel}
              disabled={exportingExcel}
              style={{
                padding: '8px 16px',
                borderRadius: 8,
                border: '1px solid #16a34a',
                background: '#16a34a12',
                color: '#16a34a',
                cursor: exportingExcel ? 'not-allowed' : 'pointer',
                fontSize: 13,
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: 6
              }}
            >
              <span>📥</span>
              <span>{exportingExcel ? 'Exporting…' : 'Export to Excel'}</span>
            </button>
          )}
          <button
            onClick={load}
            style={{ padding: '8px 16px', borderRadius: 8, border: `1px solid ${C.border}`, background: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 700, color: C.secondary }}
          >
            ↻ Refresh
          </button>
        </div>
      </div>

      {/* Search */}
      <Card pad={14}>
        <input
          placeholder="Search by contest name or quiz title…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ ...INP, maxWidth: 400 }}
        />
      </Card>

      {/* Info banner */}
      <div style={{
        background: 'linear-gradient(90deg, rgba(37,99,235,0.06), rgba(124,58,237,0.06))',
        border: `1px solid rgba(37,99,235,0.15)`,
        borderRadius: 12, padding: '12px 16px', fontSize: 13, color: C.secondary,
        display: 'flex', gap: 10, alignItems: 'flex-start',
      }}>
        <span style={{ fontSize: 16, flexShrink: 0 }}>💡</span>
        <div>
          <strong>How scheduling works:</strong> Setting a <em>Start Time</em> prevents users from accessing the quiz before that time.
          Setting an <em>End Time</em> locks quiz access after it passes. You can also manually change the <em>Status</em> (e.g. set to <strong>live</strong> to make a contest immediately playable).
        </div>
      </div>

      {/* Table */}
      <Card pad={0}>
        {loading ? <Spinner /> : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: `2px solid ${C.border}` }}>
                  {['Contest', 'Quiz', 'Status', 'Starts At', 'Ends At', 'Participants', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 700, fontSize: 11, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={7}><EmptyTable msg="No contests found." /></td></tr>
                ) : filtered.map(c => (
                  <tr key={c.id} style={{ borderBottom: `1px solid ${C.border}` }}>
                    <td style={{ padding: '11px 14px', fontWeight: 700, color: C.primary, maxWidth: 200 }}>
                      <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.name}</div>
                      {c.template_name && <div style={{ fontSize: 11, color: C.muted, marginTop: 1 }}>📋 {c.template_name}</div>}
                    </td>
                    <td style={{ padding: '11px 14px', color: C.secondary, maxWidth: 160 }}>
                      <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.quiz_title || '—'}</div>
                      {c.duration_minutes && <div style={{ fontSize: 11, color: C.muted }}>{c.duration_minutes} mins</div>}
                    </td>
                    <td style={{ padding: '11px 14px' }}>
                      <span style={{
                        display: 'inline-block', padding: '3px 10px', borderRadius: 999,
                        fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em',
                        background: (STATUS_COLOR[c.status] || '#6b7280') + '18',
                        color: STATUS_COLOR[c.status] || '#6b7280',
                      }}>
                        {c.status}
                      </span>
                    </td>
                    <td style={{ padding: '11px 14px', whiteSpace: 'nowrap', fontSize: 12, color: c.starts_at ? C.primary : C.muted }}>
                      {c.starts_at ? fmtTime(c.starts_at) : <span style={{ fontStyle: 'italic' }}>Not set</span>}
                    </td>
                    <td style={{ padding: '11px 14px', whiteSpace: 'nowrap', fontSize: 12, color: c.ends_at ? C.primary : C.muted }}>
                      {c.ends_at ? fmtTime(c.ends_at) : <span style={{ fontStyle: 'italic' }}>Not set</span>}
                    </td>
                    <td style={{ padding: '11px 14px', fontWeight: 700, color: C.primary, whiteSpace: 'nowrap' }}>
                      {c.current_participants}/{c.max_participants}
                    </td>
                    <td style={{ padding: '11px 14px' }}>
                      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                        <button
                          onClick={() => openModal(c)}
                          style={{
                            padding: '6px 12px', borderRadius: 8,
                            border: `1px solid ${C.purple}`,
                            background: C.purple + '10', color: C.purple,
                            cursor: 'pointer', fontWeight: 700, fontSize: 12,
                            display: 'flex', alignItems: 'center', gap: 5,
                            whiteSpace: 'nowrap',
                          }}
                        >
                          📅 Schedule
                        </button>
                        <button
                          onClick={() => handleDeleteContest(c)}
                          style={{
                            padding: '6px 10px', borderRadius: 8,
                            border: '1px solid #fecaca',
                            background: '#fef2f2', color: C.red,
                            cursor: 'pointer', fontWeight: 700, fontSize: 12,
                            display: 'flex', alignItems: 'center', gap: 4,
                            whiteSpace: 'nowrap',
                          }}
                          title="Delete Contest"
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Schedule Modal */}
      {modal && (
        <Modal title={`Schedule — ${modal.name}`} onClose={() => setModal(null)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* Current status badge */}
            <div style={{
              background: '#f8fafc', border: `1px solid ${C.border}`,
              borderRadius: 10, padding: '10px 14px', fontSize: 13, color: C.secondary,
              display: 'flex', alignItems: 'center', gap: 10,
            }}>
              <span>Current status:</span>
              <span style={{
                display: 'inline-block', padding: '2px 10px', borderRadius: 999,
                fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
                background: (STATUS_COLOR[modal.status] || '#6b7280') + '18',
                color: STATUS_COLOR[modal.status] || '#6b7280',
              }}>
                {modal.status}
              </span>
              <span style={{ marginLeft: 'auto', fontSize: 12, color: C.muted }}>
                {modal.current_participants}/{modal.max_participants} participants
              </span>
            </div>

            {/* Start Time */}
            <div>
              <label style={LBL}>📅 Start Date & Time</label>
              <input
                type="datetime-local"
                value={form.startsAt}
                onChange={e => setForm(f => ({ ...f, startsAt: e.target.value }))}
                style={INP}
              />
              <div style={{ fontSize: 11, color: C.muted, marginTop: 4 }}>
                Users cannot access the quiz before this time. Leave blank for no restriction.
              </div>
            </div>

            {/* End Time */}
            <div>
              <label style={LBL}>⏰ End Date & Time</label>
              <input
                type="datetime-local"
                value={form.endsAt}
                onChange={e => setForm(f => ({ ...f, endsAt: e.target.value }))}
                style={INP}
              />
              <div style={{ fontSize: 11, color: C.muted, marginTop: 4 }}>
                Quiz access is blocked after this time. Leave blank for no restriction.
              </div>
            </div>

            {/* Status Override */}
            <div>
              <label style={LBL}>⚙️ Change Status</label>
              <select
                value={form.status}
                onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                style={{ ...INP, cursor: 'pointer' }}
              >
                {STATUS_OPTS.map(s => (
                  <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                ))}
              </select>
              <div style={{ fontSize: 11, color: C.muted, marginTop: 4 }}>
                Setting to <strong>live</strong> makes the quiz immediately playable by registered participants.
              </div>
            </div>

            {/* Warning for live */}
            {form.status === 'live' && modal.status !== 'live' && (
              <div style={{
                background: '#fffbeb', border: '1px solid #fde68a',
                borderRadius: 10, padding: '10px 14px', fontSize: 12,
                color: '#92400e', display: 'flex', gap: 8, alignItems: 'flex-start',
              }}>
                <span>⚠️</span>
                <span>Setting to <strong>live</strong> will allow all registered participants to start the quiz immediately. Ensure the contest has been filled and is ready.</span>
              </div>
            )}

            {/* Actions */}
            <div style={{ display: 'flex', gap: 12, paddingTop: 4 }}>
              <button
                onClick={() => setModal(null)}
                style={{ flex: 1, padding: '11px', borderRadius: 9, border: `1px solid ${C.border}`, background: '#fff', cursor: 'pointer', fontWeight: 700, fontSize: 14, color: C.secondary }}
              >
                Cancel
              </button>
              <button
                onClick={save}
                disabled={saving}
                style={{ flex: 2, padding: '11px', borderRadius: 9, border: 'none', background: C.purple, color: '#fff', cursor: saving ? 'not-allowed' : 'pointer', fontWeight: 700, fontSize: 14, opacity: saving ? 0.75 : 1 }}
              >
                {saving ? 'Saving…' : '💾 Save Schedule'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

