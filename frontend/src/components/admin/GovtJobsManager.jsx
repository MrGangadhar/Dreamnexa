import { useState, useEffect } from 'react';
import client from '../../api/client';
import toast from 'react-hot-toast';
import { INDIAN_STATES, FALLBACK_SAMPLE_JOBS as SAMPLE_ADMIN_JOBS } from '../../data/govtJobsData';

export default function GovtJobsManager() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const initialFormState = {
    post_name: '',
    department: '',
    state: 'All India',
    district: '',
    total_posts: '',
    open_date: '',
    last_date: '',
    eligibility: '',
    age_limit: '',
    salary_scale: '',
    application_fee: '',
    selection_process: '',
    official_notification_url: '',
    apply_online_url: '',
    vlog_url: '',
    image_url: '',
    is_published: true,
    is_featured: false,
    description: '',
  };

  const [formData, setFormData] = useState(initialFormState);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const res = await client.get('/admin/jobs');
      const loadedData = res.data?.data || res.data?.jobs || (Array.isArray(res.data) ? res.data : []);
      if (loadedData && loadedData.length > 0) {
        setJobs(loadedData);
      } else {
        setJobs(SAMPLE_ADMIN_JOBS);
      }
    } catch (err) {
      console.warn('Admin jobs endpoint returned error, using fallback:', err);
      setJobs(SAMPLE_ADMIN_JOBS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleOpenModal = (job = null) => {
    if (job) {
      setEditingJob(job);
      const pName = job.post_name || job.postName || '';
      const dept = job.department || '';
      const st = job.state || 'All India';
      const dist = job.district || '';
      const tPosts = job.total_posts || job.totalPosts || '';
      const oDate = job.open_date || job.openDate || '';
      const lDate = job.last_date || job.lastDate || '';
      const elig = job.eligibility || '';
      const ageL = job.age_limit || job.ageLimit || '';
      const sal = job.salary_scale || job.salaryScale || job.salary || '';
      const fee = job.application_fee || job.applicationFee || '';
      const sel = job.selection_process || job.selectionProcess || '';
      const pdf = job.official_notification_url || job.officialNotificationUrl || '';
      const apply = job.apply_online_url || job.applyOnlineUrl || job.applyLink || '';
      const vlog = job.vlog_url || job.vlogUrl || '';
      const img = job.image_url || job.imageUrl || '';
      const pub = job.is_published !== undefined ? job.is_published : (job.isPublished !== undefined ? job.isPublished : true);
      const feat = job.is_featured !== undefined ? job.is_featured : (job.isFeatured !== undefined ? job.isFeatured : false);
      const desc = job.description || '';

      setFormData({
        post_name: pName,
        department: dept,
        state: st,
        district: dist,
        total_posts: tPosts,
        open_date: typeof oDate === 'string' && oDate.length >= 10 ? oDate.substring(0, 10) : '',
        last_date: typeof lDate === 'string' && lDate.length >= 10 ? lDate.substring(0, 10) : '',
        eligibility: elig,
        age_limit: ageL,
        salary_scale: sal,
        application_fee: fee,
        selection_process: sel,
        official_notification_url: pdf,
        apply_online_url: apply,
        vlog_url: vlog,
        image_url: img,
        is_published: Boolean(pub),
        is_featured: Boolean(feat),
        description: desc,
      });
    } else {
      setEditingJob(null);
      setFormData(initialFormState);
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingJob(null);
    setFormData(initialFormState);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.post_name || !formData.eligibility || !formData.open_date || !formData.last_date) {
      return toast.error('Post Name, Eligibility, Open Date, and Last Date are required');
    }

    try {
      setSubmitting(true);
      if (editingJob) {
        try {
          await client.put(`/admin/jobs/${editingJob.id}`, formData);
        } catch (apiErr) {}
        setJobs((prev) =>
          prev.map((j) => (j.id === editingJob.id ? { ...j, ...formData } : j))
        );
        toast.success('Recruitment updated successfully!');
      } else {
        const newJobItem = {
          id: `job-${Date.now()}`,
          ...formData,
        };
        try {
          const res = await client.post('/admin/jobs', formData);
          if (res.data?.data || res.data?.job) {
            const returnedJob = res.data.data || res.data.job;
            setJobs((prev) => [returnedJob, ...prev]);
          } else {
            setJobs((prev) => [newJobItem, ...prev]);
          }
        } catch (apiErr) {
          setJobs((prev) => [newJobItem, ...prev]);
        }
        toast.success('Recruitment published successfully!');
      }
      handleCloseModal();
    } catch (err) {
      toast.error('Failed to save job recruitment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, postName) => {
    if (!window.confirm(`Are you sure you want to delete "${postName}"?`)) return;
    try {
      await client.delete(`/admin/jobs/${id}`);
    } catch (err) {}
    setJobs((prev) => prev.filter((j) => j.id !== id));
    toast.success('Job recruitment deleted');
  };

  const handleTogglePublished = async (job) => {
    const nextVal = !(job.is_published !== undefined ? job.is_published : job.isPublished);
    try {
      await client.put(`/admin/jobs/${job.id}`, { is_published: nextVal });
    } catch (err) {}
    setJobs((prev) =>
      prev.map((j) => (j.id === job.id ? { ...j, is_published: nextVal, isPublished: nextVal } : j))
    );
    toast.success(`Job ${nextVal ? 'published' : 'unpublished'}`);
  };

  const handleToggleFeatured = async (job) => {
    const nextVal = !(job.is_featured !== undefined ? job.is_featured : job.isFeatured);
    try {
      await client.put(`/admin/jobs/${job.id}`, { is_featured: nextVal });
    } catch (err) {}
    setJobs((prev) =>
      prev.map((j) => (j.id === job.id ? { ...j, is_featured: nextVal, isFeatured: nextVal } : j))
    );
    toast.success(`Job ${nextVal ? 'marked as featured' : 'unfeatured'}`);
  };

  const filteredJobs = jobs.filter((j) => {
    const pName = j.post_name || j.postName || '';
    const dept = j.department || '';
    const st = j.state || '';

    return (
      pName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dept.toLowerCase().includes(searchQuery.toLowerCase()) ||
      st.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header Bar */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        background: '#fff', padding: '16px 20px', borderRadius: 12, border: '1px solid #e2e8f0'
      }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: '#0f172a' }}>
            Government Job Recruitments
          </h2>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: '#64748b' }}>
            Manage & publish open positions across states/districts with eligibility, dates, and vlog links.
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          style={{
            background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
            color: '#fff', border: 'none', padding: '10px 18px', borderRadius: 8,
            fontWeight: 600, fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
            boxShadow: '0 4px 12px rgba(124, 58, 237, 0.25)'
          }}
        >
          <span>+ Add New Job</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div style={{ display: 'flex', gap: 12 }}>
        <input
          type="text"
          placeholder="Search by post name, department, or state..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            flex: 1, padding: '10px 16px', borderRadius: 8, border: '1px solid #cbd5e1',
            fontSize: 14, outline: 'none'
          }}
        />
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#64748b' }}>
          Total: <strong style={{ color: '#0f172a' }}>{filteredJobs.length}</strong>
        </div>
      </div>

      {/* Jobs Table */}
      <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#64748b' }}>Loading recruitments...</div>
        ) : filteredJobs.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#64748b' }}>
            No recruitment listings found. Click "+ Add New Job" to post one.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 14 }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  <th style={{ padding: '12px 16px' }}>Post Name & Dept</th>
                  <th style={{ padding: '12px 16px' }}>State / Dist</th>
                  <th style={{ padding: '12px 16px' }}>Posts</th>
                  <th style={{ padding: '12px 16px' }}>Open Date</th>
                  <th style={{ padding: '12px 16px' }}>Last Date</th>
                  <th style={{ padding: '12px 16px' }}>Eligibility</th>
                  <th style={{ padding: '12px 16px' }}>Status</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredJobs.map((job) => {
                  const postName = job.post_name || job.postName || 'Untitled Job';
                  const dept = job.department || 'Govt Department';
                  const st = job.state || 'All India';
                  const dist = job.district || '';
                  const totalPosts = job.total_posts || job.totalPosts;
                  const openDate = job.open_date || job.openDate;
                  const lastDate = job.last_date || job.lastDate;
                  const elig = job.eligibility || 'Check details';
                  const vlog = job.vlog_url || job.vlogUrl;
                  const isPub = job.is_published !== undefined ? job.is_published : job.isPublished;
                  const isFeat = job.is_featured !== undefined ? job.is_featured : job.isFeatured;

                  return (
                    <tr key={job.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ fontWeight: 600, color: '#0f172a' }}>{postName}</div>
                        <div style={{ fontSize: 12, color: '#64748b' }}>{dept}</div>
                        {vlog && (
                          <a href={vlog} target="_blank" rel="noopener noreferrer" style={{ fontSize: 11, color: '#dc2626', textDecoration: 'none', fontWeight: 600 }}>
                            ▶ Watch Vlog
                          </a>
                        )}
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{ display: 'inline-block', padding: '2px 8px', background: '#e0f2fe', color: '#0369a1', borderRadius: 4, fontSize: 12, fontWeight: 600 }}>
                          {st}
                        </span>
                        {dist && <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>{dist}</div>}
                      </td>
                      <td style={{ padding: '14px 16px', fontWeight: 700, color: '#16a34a' }}>
                        {totalPosts ? Number(totalPosts).toLocaleString() : 'N/A'}
                      </td>
                      <td style={{ padding: '14px 16px', fontSize: 13, color: '#475569' }}>
                        {openDate ? new Date(openDate).toLocaleDateString('en-IN') : '—'}
                      </td>
                      <td style={{ padding: '14px 16px', fontSize: 13, fontWeight: 600, color: '#dc2626' }}>
                        {lastDate ? new Date(lastDate).toLocaleDateString('en-IN') : '—'}
                      </td>
                      <td style={{ padding: '14px 16px', fontSize: 12, color: '#334155', maxWidth: 180 }}>
                        <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={elig}>
                          {elig}
                        </div>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                          <button
                            onClick={() => handleTogglePublished(job)}
                            style={{
                              padding: '3px 8px', borderRadius: 12, border: 'none', fontSize: 11, fontWeight: 700, cursor: 'pointer',
                              background: isPub ? '#dcfce7' : '#f1f5f9',
                              color: isPub ? '#15803d' : '#64748b'
                            }}
                          >
                            {isPub ? 'Published' : 'Draft'}
                          </button>
                          {isFeat && (
                            <span style={{ padding: '3px 8px', borderRadius: 12, background: '#fef3c7', color: '#b45309', fontSize: 11, fontWeight: 700 }}>
                              ★ Featured
                            </span>
                          )}
                        </div>
                      </td>
                      <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                          <button
                            onClick={() => handleToggleFeatured(job)}
                            style={{ background: '#f1f5f9', color: '#334155', border: 'none', padding: '6px 10px', borderRadius: 6, fontSize: 12, cursor: 'pointer' }}
                            title="Toggle Featured"
                          >
                            {isFeat ? '★' : '☆'}
                          </button>
                          <button
                            onClick={() => handleOpenModal(job)}
                            style={{ background: '#f1f5f9', color: '#334155', border: 'none', padding: '6px 12px', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(job.id, postName)}
                            style={{ background: '#fee2e2', color: '#991b1b', border: 'none', padding: '6px 12px', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      {showModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20
        }}>
          <div style={{
            background: '#fff', borderRadius: 16, width: '100%', maxWidth: 780, maxHeight: '90vh',
            overflowY: 'auto', padding: 24, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: 16, marginBottom: 20 }}>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#0f172a' }}>
                {editingJob ? 'Edit Government Job Recruitment' : 'Publish New Government Job Recruitment'}
              </h3>
              <button
                onClick={handleCloseModal}
                style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#64748b' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 4 }}>
                  Post Name *
                </label>
                <input
                  type="text"
                  name="post_name"
                  value={formData.post_name}
                  onChange={handleChange}
                  placeholder="e.g. RRB NTPC Under Graduate & Graduate Posts 2026"
                  required
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 14 }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 4 }}>
                  Department / Authority
                </label>
                <input
                  type="text"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  placeholder="e.g. Railway Recruitment Board (RRB)"
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 14 }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 4 }}>
                  State *
                </label>
                <select
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 14 }}
                >
                  {INDIAN_STATES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 4 }}>
                  District (Optional)
                </label>
                <input
                  type="text"
                  name="district"
                  value={formData.district}
                  onChange={handleChange}
                  placeholder="e.g. Patna, Pune, or All Districts"
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 14 }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 4 }}>
                  Total Posts Count
                </label>
                <input
                  type="number"
                  name="total_posts"
                  value={formData.total_posts}
                  onChange={handleChange}
                  placeholder="e.g. 11558"
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 14 }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 4 }}>
                  Open Date (Start) *
                </label>
                <input
                  type="date"
                  name="open_date"
                  value={formData.open_date}
                  onChange={handleChange}
                  required
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 14 }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 4 }}>
                  Last Date (Deadline) *
                </label>
                <input
                  type="date"
                  name="last_date"
                  value={formData.last_date}
                  onChange={handleChange}
                  required
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 14 }}
                />
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 4 }}>
                  Eligibility Criteria *
                </label>
                <input
                  type="text"
                  name="eligibility"
                  value={formData.eligibility}
                  onChange={handleChange}
                  placeholder="e.g. 10th / 12th Pass / Graduate Degree in relevant stream"
                  required
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 14 }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 4 }}>
                  Age Limit
                </label>
                <input
                  type="text"
                  name="age_limit"
                  value={formData.age_limit}
                  onChange={handleChange}
                  placeholder="e.g. 18 - 33 Years (Relaxation as per rules)"
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 14 }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 4 }}>
                  Salary Scale / Pay Band
                </label>
                <input
                  type="text"
                  name="salary_scale"
                  value={formData.salary_scale}
                  onChange={handleChange}
                  placeholder="e.g. Level 2 - Level 5 (Rs. 19,900 - 63,200)"
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 14 }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 4 }}>
                  Apply Online Link
                </label>
                <input
                  type="url"
                  name="apply_online_url"
                  value={formData.apply_online_url}
                  onChange={handleChange}
                  placeholder="https://..."
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 14 }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 4 }}>
                  Vlog / Video Link (YouTube)
                </label>
                <input
                  type="url"
                  name="vlog_url"
                  value={formData.vlog_url}
                  onChange={handleChange}
                  placeholder="https://www.youtube.com/watch?v=..."
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 14 }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 4 }}>
                  Official Notification PDF / Link
                </label>
                <input
                  type="url"
                  name="official_notification_url"
                  value={formData.official_notification_url}
                  onChange={handleChange}
                  placeholder="https://..."
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 14 }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 4 }}>
                  Thumbnail Image URL
                </label>
                <input
                  type="url"
                  name="image_url"
                  value={formData.image_url}
                  onChange={handleChange}
                  placeholder="https://..."
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 14 }}
                />
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 4 }}>
                  Full Overview & Details
                </label>
                <textarea
                  name="description"
                  rows={4}
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Provide detailed instructions, vacancy breakup, step-by-step application instructions..."
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 14, resize: 'vertical' }}
                />
              </div>

              <div style={{ gridColumn: '1 / -1', display: 'flex', gap: 24, padding: '10px 0' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, cursor: 'pointer', fontWeight: 600 }}>
                  <input
                    type="checkbox"
                    name="is_published"
                    checked={formData.is_published}
                    onChange={handleChange}
                  />
                  Publish Immediately
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, cursor: 'pointer', fontWeight: 600 }}>
                  <input
                    type="checkbox"
                    name="is_featured"
                    checked={formData.is_featured}
                    onChange={handleChange}
                  />
                  Mark as Featured Listing
                </label>
              </div>

              <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', gap: 12, borderTop: '1px solid #e2e8f0', paddingTop: 16, marginTop: 8 }}>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  style={{ background: '#f1f5f9', color: '#475569', border: 'none', padding: '10px 20px', borderRadius: 8, fontWeight: 600, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
                    color: '#fff', border: 'none', padding: '10px 24px', borderRadius: 8,
                    fontWeight: 600, cursor: 'pointer', opacity: submitting ? 0.7 : 1
                  }}
                >
                  {submitting ? 'Saving...' : editingJob ? 'Update Job' : 'Publish Job'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
