import { useState, useEffect } from 'react';
import client from '../api/client';
import toast from 'react-hot-toast';
import '../styles/govtJobs.css';
import { INDIAN_STATES, FALLBACK_SAMPLE_JOBS } from '../data/govtJobsData';
import { useSEO } from '../hooks/useSEO';
import { getYouTubeEmbedUrl } from '../utils/newsUtils';

export default function GovernmentJobs() {
  useSEO({
    title: 'Government Jobs 2026 — Sarkari Naukri Notifications | DreamNexa',
    description: 'Browse latest central and state government job recruitment notifications. Check eligibility, vacancies, last dates, and official notification links. Updated daily.',
    canonical: 'https://dreamnexa.in/government-jobs',
  });
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedState, setSelectedState] = useState('All States');
  const [selectedJob, setSelectedJob] = useState(null);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const res = await client.get('/jobs?pageSize=500');
      const loadedData = res.data?.data || res.data?.jobs || (Array.isArray(res.data) ? res.data : []);
      if (loadedData && loadedData.length > 0) {
        setJobs(loadedData);
      } else {
        setJobs(FALLBACK_SAMPLE_JOBS);
      }
    } catch (err) {
      console.warn('API load failed, falling back to sample recruitments:', err);
      setJobs(FALLBACK_SAMPLE_JOBS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const filteredJobs = jobs.filter((j) => {
    const postName = j.post_name || j.postName || '';
    const dept = j.department || '';
    const elig = j.eligibility || '';
    const dist = j.district || '';
    const jobState = j.state || 'All India';

    const matchesSearch =
      postName.toLowerCase().includes(search.toLowerCase()) ||
      dept.toLowerCase().includes(search.toLowerCase()) ||
      elig.toLowerCase().includes(search.toLowerCase()) ||
      dist.toLowerCase().includes(search.toLowerCase());

    const matchesState =
      selectedState === 'All States' ||
      jobState.toLowerCase() === selectedState.toLowerCase() ||
      (selectedState === 'All India' && jobState.toLowerCase() === 'all india');

    return matchesSearch && matchesState;
  });

  const sortedJobs = [...filteredJobs].sort((a, b) => {
    const aState = (a.state || '').toLowerCase();
    const bState = (b.state || '').toLowerCase();
    const aKar = aState === 'karnataka';
    const bKar = bState === 'karnataka';
    if (aKar && !bKar) return -1;
    if (!aKar && bKar) return 1;

    const aIndia = aState === 'all india';
    const bIndia = bState === 'all india';
    if (aIndia && !bIndia) return -1;
    if (!aIndia && bIndia) return 1;

    return (b.is_featured || b.isFeatured ? 1 : 0) - (a.is_featured || a.isFeatured ? 1 : 0);
  });

  const totalOpenPosts = jobs.reduce((sum, j) => sum + (Number(j.total_posts || j.totalPosts) || 0), 0);
  const featuredJobsCount = jobs.filter((j) => j.is_featured || j.isFeatured).length;

  return (
    <div className="govt-jobs-page">
      {/* Hero Header */}
      <div className="govt-jobs-header">
        <div className="govt-jobs-title-badge">
          <span>🏛️ OFFICIAL RECRUITMENTS</span>
          <span>•</span>
          <span>SARKARI BHARTI 2026</span>
        </div>
        <h1>Latest Government Jobs & Openings</h1>
        <p>
          Discover open recruitment notifications, vacancies, eligibility criteria, last dates, official notifications, and YouTube video guidance vlogs.
        </p>
      </div>

      {/* Stats Counter Grid */}
      <div className="govt-jobs-stats">
        <div className="govt-stat-card">
          <div className="govt-stat-icon" style={{ background: '#e0e7ff', color: '#4338ca' }}>💼</div>
          <div>
            <div className="govt-stat-val">{jobs.length}</div>
            <div className="govt-stat-lbl">Active Recruitments</div>
          </div>
        </div>
        <div className="govt-stat-card">
          <div className="govt-stat-icon" style={{ background: '#dcfce7', color: '#15803d' }}>🎯</div>
          <div>
            <div className="govt-stat-val">{totalOpenPosts > 0 ? totalOpenPosts.toLocaleString() : '60,000+'}</div>
            <div className="govt-stat-lbl">Total Posts Vacant</div>
          </div>
        </div>
        <div className="govt-stat-card">
          <div className="govt-stat-icon" style={{ background: '#fef3c7', color: '#b45309' }}>⭐</div>
          <div>
            <div className="govt-stat-val">{featuredJobsCount}</div>
            <div className="govt-stat-lbl">Featured Openings</div>
          </div>
        </div>
        <div className="govt-stat-card">
          <div className="govt-stat-icon" style={{ background: '#fee2e2', color: '#dc2626' }}>▶</div>
          <div>
            <div className="govt-stat-val">{jobs.filter((j) => j.vlog_url || j.vlogUrl).length}</div>
            <div className="govt-stat-lbl">Video Guidance Vlogs</div>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="govt-jobs-controls">
        <div className="govt-jobs-search-wrap">
          <span className="govt-jobs-search-icon">🔍</span>
          <input
            type="text"
            className="govt-jobs-search-input"
            placeholder="Search by post name, department, or qualification..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <select
            className="govt-jobs-filter-select"
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
          >
            {INDIAN_STATES.map((state) => (
              <option key={state} value={state}>{state}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Quick State Filters Chips (Mobile & Desktop) */}
      <div className="govt-state-chips-container">
        {['All States', 'All India', 'Maharashtra', 'Uttar Pradesh', 'Bihar', 'Delhi NCR'].map((st) => (
          <button
            key={st}
            onClick={() => setSelectedState(st)}
            className={`govt-state-chip ${selectedState === st ? 'active' : ''}`}
          >
            {st}
          </button>
        ))}
      </div>

      {/* Desktop Table View */}
      <div className="govt-jobs-table-card">
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#64748b' }}>Loading government job recruitments...</div>
        ) : sortedJobs.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#64748b' }}>
            No recruitments match your filters. Try clearing your search query.
          </div>
        ) : (
          <table className="govt-jobs-table">
            <thead>
              <tr>
                <th>Post Name / Department</th>
                <th>State / District</th>
                <th>Total Posts</th>
                <th>Open Date</th>
                <th>Last Date</th>
                <th>Eligibility</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedJobs.map((job) => {
                const postName = job.post_name || job.postName;
                const dept = job.department || 'Government of India';
                const stateName = job.state || 'All India';
                const totalPosts = job.total_posts || job.totalPosts;
                const openDate = job.open_date || job.openDate;
                const lastDate = job.last_date || job.lastDate;
                const elig = job.eligibility || 'See details';
                const vlog = job.vlog_url || job.vlogUrl;
                const isFeatured = job.is_featured || job.isFeatured;

                const isOpenSoonExpiring =
                  lastDate &&
                  new Date(lastDate) - new Date() < 10 * 24 * 60 * 60 * 1000 &&
                  new Date(lastDate) >= new Date();

                return (
                  <tr key={job.id}>
                    <td>
                      <div className="govt-job-title">
                        {isFeatured && <span style={{ color: '#f59e0b', marginRight: 6 }}>⭐</span>}
                        {postName}
                      </div>
                      <div className="govt-job-dept">{dept}</div>
                    </td>
                    <td>
                      <span className="govt-state-badge">{stateName}</span>
                      {job.district && (
                        <div style={{ fontSize: 11, color: '#64748b', marginTop: 3 }}>📍 {job.district}</div>
                      )}
                    </td>
                    <td>
                      <span className="govt-posts-badge">
                        {totalPosts ? Number(totalPosts).toLocaleString() : 'Multiple'} Posts
                      </span>
                    </td>
                    <td>
                      <div className="govt-date-box open">
                        {openDate ? new Date(openDate).toLocaleDateString('en-IN') : '—'}
                      </div>
                    </td>
                    <td>
                      <div className="govt-date-box last" style={{ color: isOpenSoonExpiring ? '#dc2626' : '#991b1b' }}>
                        {lastDate ? new Date(lastDate).toLocaleDateString('en-IN') : '—'}
                        {isOpenSoonExpiring && (
                          <span style={{ display: 'block', fontSize: 10, color: '#dc2626', fontWeight: 800 }}>
                            ⚠️ Ending Soon!
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="govt-eligibility-text" title={elig}>
                        {elig}
                      </div>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div className="govt-action-btn-group" style={{ justifyContent: 'flex-end' }}>
                        {vlog && (
                          <a
                            href={vlog}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="govt-vlog-btn"
                          >
                            ▶ Vlog
                          </a>
                        )}
                        <button
                          onClick={() => setSelectedJob(job)}
                          className="govt-view-btn"
                        >
                          Details
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Mobile Responsive Cards List */}
      <div className="govt-mobile-card-list">
        {loading ? (
          <div style={{ padding: 30, textAlign: 'center', color: '#64748b' }}>Loading jobs...</div>
        ) : sortedJobs.length === 0 ? (
          <div style={{ padding: 30, textAlign: 'center', color: '#64748b' }}>No recruitments found.</div>
        ) : (
          sortedJobs.map((job) => {
            const postName = job.post_name || job.postName;
            const dept = job.department || 'Govt Department';
            const stateName = job.state || 'All India';
            const totalPosts = job.total_posts || job.totalPosts;
            const openDate = job.open_date || job.openDate;
            const lastDate = job.last_date || job.lastDate;
            const elig = job.eligibility || 'Check details';
            const vlog = job.vlog_url || job.vlogUrl;

            return (
              <div className="govt-mobile-job-card" key={job.id}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <span className="govt-state-badge">{stateName}</span>
                  <span className="govt-posts-badge">{totalPosts ? Number(totalPosts).toLocaleString() : 'N/A'} Posts</span>
                </div>
                <h3 className="govt-mobile-job-title">{postName}</h3>
                <div className="govt-mobile-job-dept">{dept}</div>

                <div className="govt-mobile-info-box">
                  <div style={{ fontWeight: 600, color: '#334155', marginBottom: 4 }}>
                    🎓 {elig}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginTop: 8 }}>
                    <span style={{ color: '#047857' }}>Open: {openDate ? new Date(openDate).toLocaleDateString('en-IN') : '—'}</span>
                    <span style={{ color: '#dc2626', fontWeight: 700 }}>Last: {lastDate ? new Date(lastDate).toLocaleDateString('en-IN') : '—'}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 10 }}>
                  <button
                    onClick={() => setSelectedJob(job)}
                    className="govt-mobile-view-btn"
                  >
                    View Details
                  </button>
                  {vlog && (
                    <a
                      href={vlog}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="govt-vlog-btn"
                    >
                      ▶ Vlog
                    </a>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Job Details Modal */}
      {selectedJob && (
        <div className="govt-modal-overlay" onClick={() => setSelectedJob(null)}>
          <div className="govt-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="govt-modal-header" style={{ background: '#f1f5f9', borderBottom: '1px solid #e2e8f0' }}>
              <button className="govt-modal-close-btn" style={{ background: '#e2e8f0', color: '#1e293b' }} onClick={() => setSelectedJob(null)}>✕</button>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>
                {selectedJob.department || 'GOVERNMENT RECRUITMENT'}
              </div>
              <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: '#0f172a' }}>{selectedJob.post_name || selectedJob.postName}</h2>
            </div>

            <div className="govt-modal-body">
              {/* YouTube Vlog Embed */}
              {(selectedJob.vlog_url || selectedJob.vlogUrl) && getYouTubeEmbedUrl(selectedJob.vlog_url || selectedJob.vlogUrl) && (
                <div>
                  <h4 style={{ margin: '0 0 10px', fontSize: 14, fontWeight: 700, color: '#0f172a' }}>
                    📺 Recruitment Guidance Vlog
                  </h4>
                  <div className="govt-video-container">
                    <iframe
                      src={getYouTubeEmbedUrl(selectedJob.vlog_url || selectedJob.vlogUrl)}
                      title="Government Job Guidance Vlog"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                </div>
              )}

              {/* Key Details Grid */}
              <div className="govt-detail-grid">
                <div className="govt-detail-item">
                  <label>Total Vacancies</label>
                  <span style={{ color: '#16a34a' }}>
                    {selectedJob.total_posts || selectedJob.totalPosts ? Number(selectedJob.total_posts || selectedJob.totalPosts).toLocaleString() : 'As per rules'}
                  </span>
                </div>
                <div className="govt-detail-item">
                  <label>State / Location</label>
                  <span>{selectedJob.state || 'All India'} {selectedJob.district ? `(${selectedJob.district})` : ''}</span>
                </div>
                <div className="govt-detail-item">
                  <label>Open Date</label>
                  <span>{(selectedJob.open_date || selectedJob.openDate) ? new Date(selectedJob.open_date || selectedJob.openDate).toLocaleDateString('en-IN') : '—'}</span>
                </div>
                <div className="govt-detail-item">
                  <label>Last Date to Apply</label>
                  <span style={{ color: '#dc2626' }}>{(selectedJob.last_date || selectedJob.lastDate) ? new Date(selectedJob.last_date || selectedJob.lastDate).toLocaleDateString('en-IN') : '—'}</span>
                </div>
                <div className="govt-detail-item">
                  <label>Age Limit</label>
                  <span>{selectedJob.age_limit || selectedJob.ageLimit || '18 - 33 Years'}</span>
                </div>
                <div className="govt-detail-item">
                  <label>Salary Scale</label>
                  <span>{selectedJob.salary_scale || selectedJob.salaryScale || 'As per Pay Matrix'}</span>
                </div>
              </div>

              {/* Eligibility */}
              <div style={{ marginBottom: 20 }}>
                <h4 style={{ margin: '0 0 8px', fontSize: 15, fontWeight: 700, color: '#0f172a' }}>🎓 Educational Qualification</h4>
                <div style={{ background: '#f8fafc', padding: 14, borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 14, color: '#334155', lineHeight: 1.5 }}>
                  {selectedJob.eligibility}
                </div>
              </div>

              {(selectedJob.selection_process || selectedJob.selectionProcess) && (
                <div style={{ marginBottom: 20 }}>
                  <h4 style={{ margin: '0 0 8px', fontSize: 15, fontWeight: 700, color: '#0f172a' }}>📋 Selection Process</h4>
                  <div style={{ background: '#f8fafc', padding: 14, borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 14, color: '#334155' }}>
                    {selectedJob.selection_process || selectedJob.selectionProcess}
                  </div>
                </div>
              )}

              {selectedJob.description && (
                <div style={{ marginBottom: 20 }}>
                  <h4 style={{ margin: '0 0 8px', fontSize: 15, fontWeight: 700, color: '#0f172a' }}>ℹ️ Detailed Information</h4>
                  <div style={{ background: '#fff', padding: 14, borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 14, color: '#334155', whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                    {selectedJob.description}
                  </div>
                </div>
              )}

              {/* Apply / PDF Buttons */}
              <div className="govt-apply-actions">
                {(selectedJob.apply_online_url || selectedJob.applyOnlineUrl) && (
                  <a
                    href={selectedJob.apply_online_url || selectedJob.applyOnlineUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="govt-apply-btn"
                  >
                    Apply Online Official Link ➔
                  </a>
                )}
                {(selectedJob.official_notification_url || selectedJob.officialNotificationUrl) && (
                  <a
                    href={selectedJob.official_notification_url || selectedJob.officialNotificationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="govt-pdf-btn"
                  >
                    📄 Official Notification PDF
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
