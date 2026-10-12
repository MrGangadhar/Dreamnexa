import React, { useState, useEffect } from 'react';
import { 
  adminFetchCurrentAffairs, 
  adminCreateCurrentAffair, 
  adminUpdateCurrentAffair, 
  adminDeleteCurrentAffair 
} from '../../api/currentAffairsApi';
import toast from 'react-hot-toast';
import { 
  FiPlus, FiEdit2, FiTrash2, FiCheckCircle, FiXCircle, FiSearch, FiRefreshCw, FiEye 
} from 'react-icons/fi';

const CATEGORIES = [
  'General Knowledge',
  'General',
  'Politics',
  'Social Science',
  'Economy',
  'Science & Tech',
  'Student Corner',
  'International',
  'Environment'
];

export default function CurrentAffairsManager() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [editingArticle, setEditingArticle] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    summary: '',
    key_points: '',
    content: '',
    why_it_matters: '',
    image_url: '',
    category: 'Politics',
    exam_tags: 'UPSC, SSC, Banking',
    tags: 'Current Affairs, 2026',
    source_url: '',
    published_date: new Date().toISOString().split('T')[0],
    is_published: 1,
    is_featured: 0
  });

  const getToken = () => localStorage.getItem('token') || '';

  const loadArticles = async () => {
    setLoading(true);
    try {
      const token = getToken();
      const res = await adminFetchCurrentAffairs(token, {
        search,
        category: categoryFilter
      });
      if (res && res.success) {
        setArticles(res.data || []);
      } else {
        toast.error((res && res.message) || 'Failed to fetch current affairs');
      }
    } catch (err) {
      console.error(err);
      toast.error('Server error fetching current affairs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadArticles();
  }, [categoryFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadArticles();
  };

  const handleOpenCreate = () => {
    setEditingArticle(null);
    setFormData({
      title: '',
      summary: '',
      key_points: '',
      content: '',
      why_it_matters: '',
      image_url: '',
      category: 'Politics',
      exam_tags: 'UPSC, SSC, Banking',
      tags: 'Current Affairs',
      source_url: '',
      published_date: new Date().toISOString().split('T')[0],
      is_published: 1,
      is_featured: 0
    });
    setShowModal(true);
  };

  const handleOpenEdit = (article) => {
    setEditingArticle(article);
    setFormData({
      title: article.title || '',
      summary: article.summary || '',
      key_points: Array.isArray(article.key_points) ? article.key_points.join('\n') : (article.key_points || ''),
      content: article.content || '',
      why_it_matters: article.why_it_matters || '',
      image_url: article.image_url || '',
      category: article.category || 'Politics',
      exam_tags: Array.isArray(article.exam_tags) ? article.exam_tags.join(', ') : (article.exam_tags || ''),
      tags: Array.isArray(article.tags) ? article.tags.join(', ') : (article.tags || ''),
      source_url: article.source_url || '',
      published_date: article.published_date ? new Date(article.published_date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      is_published: article.is_published ? 1 : 0,
      is_featured: article.is_featured ? 1 : 0
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.summary) {
      toast.error('Title and Summary are required');
      return;
    }

    const payload = {
      ...formData,
      key_points: formData.key_points.split('\n').map(s => s.trim()).filter(Boolean),
      exam_tags: formData.exam_tags.split(',').map(s => s.trim()).filter(Boolean),
      tags: formData.tags.split(',').map(s => s.trim()).filter(Boolean)
    };

    try {
      const token = getToken();
      let res;
      if (editingArticle) {
        res = await adminUpdateCurrentAffair(token, editingArticle.id, payload);
      } else {
        res = await adminCreateCurrentAffair(token, payload);
      }

      if (res && res.success) {
        toast.success(editingArticle ? 'Article updated!' : 'Article created!');
        setShowModal(false);
        loadArticles();
      } else {
        toast.error((res && res.message) || 'Operation failed');
      }
    } catch (err) {
      console.error(err);
      toast.error('Server error saving article');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this article?')) return;
    try {
      const token = getToken();
      const res = await adminDeleteCurrentAffair(token, id);
      if (res && res.success) {
        toast.success('Article deleted');
        loadArticles();
      } else {
        toast.error((res && res.message) || 'Failed to delete');
      }
    } catch (err) {
      console.error(err);
      toast.error('Server error deleting article');
    }
  };

  const INP = { width: '100%', padding: '9px 12px', border: '1px solid var(--border)', borderRadius: 8, background: '#f8fafc', fontSize: 13, outline: 'none', boxSizing: 'border-box' };
  const LBL = { display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.04em' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Top Bar */}
      <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 12, padding: '16px 20px', display: 'flex', alignItems: 'center', justifyBetween: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div style={{ flex: 1 }}>
          <h2 style={{ fontSize: 18, fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>Current Affairs Management</h2>
          <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>Add, edit, or publish student-friendly daily current affairs articles.</p>
        </div>
        <button
          onClick={handleOpenCreate}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 18px', background: '#7c3aed', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: 'pointer' }}
        >
          <FiPlus size={16} /> Add Article
        </button>
      </div>

      {/* Filter controls */}
      <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 12, padding: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <form onSubmit={handleSearchSubmit} style={{ position: 'relative', width: 280 }}>
          <FiSearch size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search by title or summary..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ ...INP, paddingLeft: 34 }}
          />
        </form>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            style={{ ...INP, width: 'auto', cursor: 'pointer' }}
          >
            <option value="All">All Categories</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <button
            onClick={loadArticles}
            style={{ padding: '8px 12px', background: '#f1f5f9', border: '1px solid var(--border)', borderRadius: 8, cursor: 'pointer', color: 'var(--text-secondary)' }}
            title="Refresh"
          >
            <FiRefreshCw size={14} />
          </button>
        </div>
      </div>

      {/* Table */}
      <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 48, textAlign: 'center', color: 'var(--text-secondary)' }}>Loading articles...</div>
        ) : articles.length === 0 ? (
          <div style={{ padding: 48, textAlign: 'center', color: 'var(--text-secondary)' }}>No current affairs articles found.</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid var(--border)', color: 'var(--text-secondary)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase' }}>
                <th style={{ padding: '12px 16px' }}>Article</th>
                <th style={{ padding: '12px 16px' }}>Category</th>
                <th style={{ padding: '12px 16px' }}>Exam Tags</th>
                <th style={{ padding: '12px 16px' }}>Date</th>
                <th style={{ padding: '12px 16px' }}>Status</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {articles.map((item) => (
                <tr key={item.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                  <td style={{ padding: '12px 16px', maxWidth: 300 }}>
                    <div style={{ fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.title}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.summary}</div>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ padding: '3px 8px', borderRadius: 6, fontSize: 11, fontWeight: 700, background: 'rgba(124,58,237,0.1)', color: '#7c3aed' }}>
                      {item.category}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                      {item.exam_tags && item.exam_tags.slice(0, 2).map((t, idx) => (
                        <span key={idx} style={{ padding: '2px 6px', background: '#f1f5f9', borderRadius: 4, fontSize: 11, color: '#475569' }}>
                          {t}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: 12, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                    {item.published_date ? new Date(item.published_date).toLocaleDateString('en-IN') : '—'}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    {item.is_published ? (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 700, color: '#16a34a', background: '#f0fdf4', padding: '2px 8px', borderRadius: 10 }}>
                        <FiCheckCircle size={12} /> Live
                      </span>
                    ) : (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 700, color: '#d97706', background: '#fffbeb', padding: '2px 8px', borderRadius: 10 }}>
                        <FiXCircle size={12} /> Draft
                      </span>
                    )}
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                    <button
                      onClick={() => handleOpenEdit(item)}
                      style={{ padding: 6, background: 'none', border: 'none', cursor: 'pointer', color: '#2563eb', marginRight: 8 }}
                      title="Edit"
                    >
                      <FiEdit2 size={15} />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      style={{ padding: 6, background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626' }}
                      title="Delete"
                    >
                      <FiTrash2 size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal Form */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 2000, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(3px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, overflowY: 'auto' }}>
          <div style={{ background: '#fff', borderRadius: 16, border: '1px solid var(--border)', maxWidth: 640, width: '100%', padding: 28, position: 'relative', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
            <h3 style={{ fontSize: 18, fontWeight: 800, margin: '0 0 16px 0', color: 'var(--text-primary)' }}>
              {editingArticle ? 'Edit Article' : 'New Current Affairs Article'}
            </h3>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={LBL}>Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  style={INP}
                  placeholder="e.g. Cabinet Approves New National Education Metric 2026"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={LBL}>Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    style={{ ...INP, cursor: 'pointer' }}
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={LBL}>Published Date</label>
                  <input
                    type="date"
                    value={formData.published_date}
                    onChange={(e) => setFormData({ ...formData, published_date: e.target.value })}
                    style={INP}
                  />
                </div>
              </div>

              <div>
                <label style={LBL}>Summary (1-2 lines) *</label>
                <textarea
                  required
                  rows={2}
                  value={formData.summary}
                  onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                  style={{ ...INP, resize: 'vertical' }}
                  placeholder="Brief summary for quick scanning..."
                />
              </div>

              <div>
                <label style={LBL}>Key Points (One per line for bullet cards)</label>
                <textarea
                  rows={3}
                  value={formData.key_points}
                  onChange={(e) => setFormData({ ...formData, key_points: e.target.value })}
                  style={{ ...INP, fontFamily: 'monospace', fontSize: 12, resize: 'vertical' }}
                  placeholder="Approved budget is $2.4 Billion&#10;Will affect UPSC GS-II and SSC CGL 2026&#10;Key committee headed by Dr. Sharma"
                />
              </div>

              <div>
                <label style={LBL}>Why It Matters For Students</label>
                <textarea
                  rows={2}
                  value={formData.why_it_matters}
                  onChange={(e) => setFormData({ ...formData, why_it_matters: e.target.value })}
                  style={{ ...INP, resize: 'vertical' }}
                  placeholder="Directly relevant for Polity & Governance questions in UPSC Prelims..."
                />
              </div>

              <div>
                <label style={LBL}>Target Exam Tags (Comma-separated)</label>
                <input
                  type="text"
                  value={formData.exam_tags}
                  onChange={(e) => setFormData({ ...formData, exam_tags: e.target.value })}
                  style={INP}
                  placeholder="UPSC, SSC, Banking, Railway"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={LBL}>Image URL (Optional)</label>
                  <input
                    type="url"
                    value={formData.image_url}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    style={INP}
                    placeholder="https://..."
                  />
                </div>
                <div>
                  <label style={LBL}>Source URL (Optional)</label>
                  <input
                    type="url"
                    value={formData.source_url}
                    onChange={(e) => setFormData({ ...formData, source_url: e.target.value })}
                    style={INP}
                    placeholder="https://pib.gov.in/..."
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: 24, paddingTop: 6 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={!!formData.is_published}
                    onChange={(e) => setFormData({ ...formData, is_published: e.target.checked ? 1 : 0 })}
                  />
                  <span>Is Published (Live)</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={!!formData.is_featured}
                    onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked ? 1 : 0 })}
                  />
                  <span>Featured Article</span>
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{ padding: '8px 18px', background: '#f1f5f9', border: '1px solid var(--border)', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer', color: 'var(--text-secondary)' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '8px 20px', background: '#7c3aed', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
                >
                  {editingArticle ? 'Save Changes' : 'Create Article'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
