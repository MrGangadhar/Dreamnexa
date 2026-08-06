import { useEffect, useState } from 'react';
import client from '../api/client';
import toast from 'react-hot-toast';

const ARTICLE_CATEGORIES = [
  'general', 'india', 'education', 'government', 'jobs',
  'technology', 'ai', 'economy', 'science', 'sports',
  'international', 'business',
];

export default function Admin() {
  const [tab, setTab] = useState('overview');
  return (
    <div className="container" style={{ paddingTop: 32, paddingBottom: 60 }}>
      <div className="eyebrow">Admin control room</div>
      <h1 style={{ marginBottom: 20 }}>Manage DreamNexa</h1>

      <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
        {['overview', 'news', 'templates', 'quizzes', 'users'].map((t) => (
          <button key={t} onClick={() => setTab(t)} className={tab === t ? 'btn btn-primary' : 'btn btn-ghost'} style={{ padding: '8px 16px', fontSize: 14, textTransform: 'capitalize' }}>
            {t === 'news' ? '📰 News & Vlogs' : t}
          </button>
        ))}
      </div>

      {tab === 'overview' && <Overview />}
      {tab === 'news' && <NewsManager />}
      {tab === 'templates' && <Templates />}
      {tab === 'quizzes' && <Quizzes />}
      {tab === 'users' && <Users />}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
 *  NEWS & VLOGS MANAGER
 * ═══════════════════════════════════════════════════════════════════════════════ */

const EMPTY_ARTICLE_FORM = {
  title: '',
  description: '',
  content: '',
  imageUrl: '',
  category: 'general',
  articleType: 'news',
  vlogUrl: '',
  authorName: '',
  isFeatured: false,
};

function NewsManager() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ ...EMPTY_ARTICLE_FORM });
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const loadArticles = () => {
    setLoading(true);
    client.get('/admin/news')
      .then(({ data }) => setArticles(data.articles || []))
      .catch(() => toast.error('Failed to load articles.'))
      .finally(() => setLoading(false));
  };

  useEffect(loadArticles, []);

  const resetForm = () => {
    setForm({ ...EMPTY_ARTICLE_FORM });
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return toast.error('Title is required.');
    if (form.articleType === 'vlog' && !form.vlogUrl.trim()) return toast.error('Vlog URL is required for vlogs.');

    setSaving(true);
    try {
      if (editingId) {
        await client.put(`/admin/news/${editingId}`, form);
        toast.success('Article updated!');
      } else {
        await client.post('/admin/news', form);
        toast.success('Article created! 🎉');
      }
      resetForm();
      loadArticles();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save article.');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (article) => {
    setForm({
      title: article.title || '',
      description: article.description || '',
      content: article.content || '',
      imageUrl: article.image_url || '',
      category: article.category || 'general',
      articleType: article.article_type || 'news',
      vlogUrl: article.vlog_url || '',
      authorName: article.author_name || '',
      isFeatured: article.is_featured || false,
    });
    setEditingId(article.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this article permanently?')) return;
    try {
      await client.delete(`/admin/news/${id}`);
      toast.success('Article deleted.');
      loadArticles();
    } catch {
      toast.error('Failed to delete article.');
    }
  };

  const togglePublish = async (article) => {
    try {
      await client.put(`/admin/news/${article.id}`, { isPublished: !article.is_published });
      toast.success(article.is_published ? 'Unpublished.' : 'Published!');
      loadArticles();
    } catch {
      toast.error('Failed to update.');
    }
  };

  const toggleFeatured = async (article) => {
    try {
      await client.put(`/admin/news/${article.id}`, { isFeatured: !article.is_featured });
      toast.success(article.is_featured ? 'Unfeatured.' : 'Featured! ⭐');
      loadArticles();
    } catch {
      toast.error('Failed to update.');
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '10px 14px',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-sm, 8px)',
    background: 'var(--bg-primary)',
    color: 'var(--text-primary)',
    fontSize: 14,
    transition: 'border-color 0.2s',
  };

  const selectStyle = { ...inputStyle, cursor: 'pointer' };

  const labelStyle = {
    display: 'block',
    fontSize: 12,
    fontWeight: 600,
    color: 'var(--text-secondary)',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
  };

  return (
    <div>
      {/* Header bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 20 }}>📰 News & Vlogs</h2>
          <p style={{ margin: '4px 0 0', color: 'var(--text-secondary)', fontSize: 13 }}>
            Create and manage articles that appear on the user news page
          </p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => { resetForm(); setShowForm(!showForm); }}
          style={{ padding: '10px 20px', fontSize: 14 }}
        >
          {showForm ? '✕ Close' : '+ New Article'}
        </button>
      </div>

      {/* Create / Edit Form */}
      {showForm && (
        <div className="card" style={{
          marginBottom: 24,
          padding: 24,
          border: '2px solid var(--border)',
          background: 'var(--bg-card)',
        }}>
          <h3 style={{ marginBottom: 16, fontSize: 16 }}>
            {editingId ? '✏️ Edit Article' : '➕ Create New Article'}
          </h3>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Row 1: Title */}
            <div>
              <label style={labelStyle}>Title *</label>
              <input
                style={inputStyle}
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Enter article title…"
                required
              />
            </div>

            {/* Row 2: Description */}
            <div>
              <label style={labelStyle}>Description</label>
              <textarea
                style={{ ...inputStyle, minHeight: 70, resize: 'vertical' }}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Short summary that appears on the card…"
              />
            </div>

            {/* Row 3: Content */}
            <div>
              <label style={labelStyle}>Full Content</label>
              <textarea
                style={{ ...inputStyle, minHeight: 120, resize: 'vertical' }}
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                placeholder="Full article body (supports plain text)…"
              />
            </div>

            {/* Row 4: Type + Category */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <label style={labelStyle}>Type</label>
                <select
                  style={selectStyle}
                  value={form.articleType}
                  onChange={(e) => setForm({ ...form, articleType: e.target.value })}
                >
                  <option value="news">📰 News Article</option>
                  <option value="vlog">🎥 Vlog</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Category</label>
                <select
                  style={selectStyle}
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                >
                  {ARTICLE_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Row 5: Image URL + Vlog URL */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <label style={labelStyle}>Cover Image URL</label>
                <input
                  style={inputStyle}
                  value={form.imageUrl}
                  onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              <div>
                <label style={labelStyle}>Vlog URL {form.articleType === 'vlog' ? '*' : '(optional)'}</label>
                <input
                  style={inputStyle}
                  value={form.vlogUrl}
                  onChange={(e) => setForm({ ...form, vlogUrl: e.target.value })}
                  placeholder="https://youtube.com/watch?v=…"
                />
              </div>
            </div>

            {/* Row 6: Author + Featured */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 16, alignItems: 'end' }}>
              <div>
                <label style={labelStyle}>Author Name</label>
                <input
                  style={inputStyle}
                  value={form.authorName}
                  onChange={(e) => setForm({ ...form, authorName: e.target.value })}
                  placeholder="Author name (optional)"
                />
              </div>
              <label style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px',
                cursor: 'pointer', fontSize: 14, fontWeight: 500,
                border: '1px solid var(--border)', borderRadius: 'var(--radius-sm, 8px)',
                background: form.isFeatured ? 'rgba(255, 193, 7, 0.12)' : 'transparent',
              }}>
                <input
                  type="checkbox"
                  checked={form.isFeatured}
                  onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })}
                  style={{ width: 'auto' }}
                />
                ⭐ Featured
              </label>
            </div>

            {/* Submit */}
            <div style={{ display: 'flex', gap: 12, marginTop: 4 }}>
              <button className="btn btn-primary" disabled={saving} type="submit" style={{ padding: '10px 24px' }}>
                {saving ? 'Saving…' : editingId ? 'Update Article' : 'Publish Article'}
              </button>
              {editingId && (
                <button type="button" className="btn btn-ghost" onClick={resetForm} style={{ padding: '10px 20px' }}>
                  Cancel Edit
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      {/* Articles List */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton" style={{ height: 88, borderRadius: 'var(--radius-card, 12px)' }} />
          ))}
        </div>
      ) : articles.length === 0 ? (
        <div className="card" style={{ padding: 48, textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📝</div>
          <h3 style={{ marginBottom: 8, color: 'var(--text-primary)' }}>No articles yet</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 20 }}>
            Create your first news article or vlog to get started.
          </p>
          <button className="btn btn-primary" onClick={() => { resetForm(); setShowForm(true); }}>
            + Create First Article
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {articles.map((article) => (
            <div key={article.id} className="card" style={{
              padding: 16,
              display: 'flex',
              gap: 16,
              alignItems: 'center',
              opacity: article.is_published ? 1 : 0.6,
              borderLeft: article.is_featured ? '3px solid #ffc107' : '3px solid transparent',
            }}>
              {/* Thumbnail */}
              {article.image_url ? (
                <div style={{
                  width: 72, height: 72, borderRadius: 8, flexShrink: 0,
                  background: `url(${article.image_url}) center/cover no-repeat`,
                  border: '1px solid var(--border)',
                }} />
              ) : (
                <div style={{
                  width: 72, height: 72, borderRadius: 8, flexShrink: 0,
                  background: 'var(--bg-primary)',
                  border: '1px solid var(--border)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 28,
                }}>
                  {article.article_type === 'vlog' ? '🎥' : '📰'}
                </div>
              )}

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 4, color: 'var(--text-primary)' }}>
                  {article.is_featured && <span style={{ color: '#ffc107', marginRight: 6 }}>⭐</span>}
                  {article.title}
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', fontSize: 12, color: 'var(--text-secondary)' }}>
                  <span style={{
                    padding: '2px 8px', borderRadius: 4,
                    background: article.article_type === 'vlog' ? 'rgba(239,68,68,0.1)' : 'rgba(59,130,246,0.1)',
                    color: article.article_type === 'vlog' ? '#ef4444' : '#3b82f6',
                    fontWeight: 600,
                  }}>
                    {article.article_type === 'vlog' ? '🎥 VLOG' : '📰 NEWS'}
                  </span>
                  <span style={{
                    padding: '2px 8px', borderRadius: 4,
                    background: 'var(--bg-primary)',
                    textTransform: 'capitalize',
                  }}>
                    {article.category}
                  </span>
                  {!article.is_published && (
                    <span style={{
                      padding: '2px 8px', borderRadius: 4,
                      background: 'rgba(239,68,68,0.1)', color: '#ef4444', fontWeight: 600,
                    }}>
                      UNPUBLISHED
                    </span>
                  )}
                  {article.author_name && <span>by {article.author_name}</span>}
                  <span>·</span>
                  <span>{new Date(article.created_at).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: 6, flexShrink: 0, flexWrap: 'wrap' }}>
                <button
                  className="btn btn-ghost"
                  style={{ padding: '5px 10px', fontSize: 12 }}
                  onClick={() => toggleFeatured(article)}
                  title={article.is_featured ? 'Remove from featured' : 'Mark as featured'}
                >
                  {article.is_featured ? '⭐' : '☆'}
                </button>
                <button
                  className="btn btn-ghost"
                  style={{ padding: '5px 10px', fontSize: 12 }}
                  onClick={() => togglePublish(article)}
                >
                  {article.is_published ? 'Unpublish' : 'Publish'}
                </button>
                <button
                  className="btn btn-ghost"
                  style={{ padding: '5px 10px', fontSize: 12 }}
                  onClick={() => handleEdit(article)}
                >
                  Edit
                </button>
                <button
                  className="btn btn-ghost"
                  style={{ padding: '5px 10px', fontSize: 12, color: '#ef4444' }}
                  onClick={() => handleDelete(article.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
 *  OVERVIEW
 * ═══════════════════════════════════════════════════════════════════════════════ */

function Overview() {
  const [stats, setStats] = useState(null);
  useEffect(() => { client.get('/admin/dashboard').then(({ data }) => setStats(data)); }, []);
  if (!stats) return <p>Loading…</p>;
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
      <div className="card"><div className="eyebrow">Students</div><div style={{ fontFamily: 'var(--font-mono)', fontSize: 28 }}>{stats.totalStudents}</div></div>
      <div className="card"><div className="eyebrow">Published quizzes</div><div style={{ fontFamily: 'var(--font-mono)', fontSize: 28 }}>{stats.publishedQuizzes}</div></div>
      <div className="card"><div className="eyebrow">Active templates</div><div style={{ fontFamily: 'var(--font-mono)', fontSize: 28 }}>{stats.activeTemplates}</div></div>
      <div className="card">
        <div className="eyebrow">Contests by status</div>
        {stats.contestsByStatus.map((s) => (
          <div key={s.status} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
            <span style={{ textTransform: 'capitalize' }}>{s.status}</span><span>{s.count}</span>
          </div>
        ))}
      </div>
      <div className="card" style={{ gridColumn: 'span 4' }}>
        <div className="eyebrow" style={{ marginBottom: 8 }}>Top colleges by student count</div>
        {stats.topColleges.map((c) => (
          <div key={c.college} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, padding: '4px 0' }}>
            <span>{c.college}</span><span>{c.student_count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
 *  TEMPLATES
 * ═══════════════════════════════════════════════════════════════════════════════ */

function Templates() {
  const [templates, setTemplates] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [form, setForm] = useState({ name: '', description: '', quizId: '', maxParticipants: 6, entryPointsCost: 0 });
  const [creating, setCreating] = useState(false);

  const load = () => {
    client.get('/admin/templates').then(({ data }) => setTemplates(data));
    client.get('/admin/quizzes').then(({ data }) => setQuizzes(data));
  };
  useEffect(load, []);

  const createTemplate = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      await client.post('/admin/templates', {
        ...form,
        maxParticipants: Number(form.maxParticipants),
        entryPointsCost: Number(form.entryPointsCost),
        rewardStructure: [
          { rank: 1, badge: 'gold_scholar', points: 200 },
          { rank: 2, badge: 'silver_scholar', points: 120 },
          { rank: 3, badge: 'bronze_scholar', points: 60 },
        ],
      });
      setForm({ name: '', description: '', quizId: '', maxParticipants: 6, entryPointsCost: 0 });
      load();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to create template.');
    } finally {
      setCreating(false);
    }
  };

  const toggleField = async (id, field, value) => {
    await client.patch(`/admin/templates/${id}`, { [field]: value });
    load();
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: 20 }}>
      <div className="card">
        <h3>New contest template</h3>
        <form onSubmit={createTemplate} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div><label>Name</label><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>
          <div><label>Description</label><input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
          <div>
            <label>Quiz</label>
            <select value={form.quizId} onChange={(e) => setForm({ ...form, quizId: e.target.value })} required>
              <option value="">Select a quiz…</option>
              {quizzes.map((q) => <option key={q.id} value={q.id}>{q.title}</option>)}
            </select>
          </div>
          <div><label>Max participants (seats)</label><input type="number" min={2} value={form.maxParticipants} onChange={(e) => setForm({ ...form, maxParticipants: e.target.value })} required /></div>
          <div><label>Entry cost in points (0 = free)</label><input type="number" min={0} value={form.entryPointsCost} onChange={(e) => setForm({ ...form, entryPointsCost: e.target.value })} /></div>
          <button className="btn btn-primary" disabled={creating} type="submit">{creating ? 'Creating…' : 'Create template'}</button>
        </form>
      </div>

      <div>
        {templates.map((t) => (
          <div key={t.id} className="card" style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontWeight: 600 }}>{t.name}</div>
                <div className="eyebrow">{t.quiz_title} · {t.max_participants} seats · {t.contests_spawned} contests spawned</div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-ghost" style={{ padding: '6px 12px', fontSize: 13 }} onClick={() => toggleField(t.id, 'autoRegenerate', !t.auto_regenerate)}>
                  Auto-regen: {t.auto_regenerate ? 'ON' : 'OFF'}
                </button>
                <button className="btn btn-ghost" style={{ padding: '6px 12px', fontSize: 13 }} onClick={() => toggleField(t.id, 'isActive', !t.is_active)}>
                  {t.is_active ? 'Deactivate' : 'Activate'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
 *  QUIZZES
 * ═══════════════════════════════════════════════════════════════════════════════ */

function Quizzes() {
  const [quizzes, setQuizzes] = useState([]);
  const [form, setForm] = useState({ title: '', description: '', durationMinutes: 10, negativeMarking: 0.25, questions: [] });
  const [q, setQ] = useState({ questionText: '', options: ['', '', '', ''], correctIndex: 0 });
  const [creating, setCreating] = useState(false);

  const load = () => client.get('/admin/quizzes').then(({ data }) => setQuizzes(data));
  useEffect(load, []);

  const addQuestion = () => {
    if (!q.questionText || q.options.some((o) => !o)) return alert('Fill question text and all 4 options.');
    const optionIds = ['A', 'B', 'C', 'D'];
    setForm({
      ...form,
      questions: [...form.questions, {
        questionText: q.questionText,
        options: q.options.map((text, i) => ({ id: optionIds[i], text })),
        correctOptions: [optionIds[q.correctIndex]],
        marks: 1,
        negativeMarks: 0.25,
      }],
    });
    setQ({ questionText: '', options: ['', '', '', ''], correctIndex: 0 });
  };

  const createQuiz = async (e) => {
    e.preventDefault();
    if (form.questions.length === 0) return alert('Add at least one question.');
    setCreating(true);
    try {
      await client.post('/admin/quizzes', form);
      setForm({ title: '', description: '', durationMinutes: 10, negativeMarking: 0.25, questions: [] });
      load();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to create quiz.');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 20 }}>
      <div className="card">
        <h3>New quiz</h3>
        <form onSubmit={createQuiz} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div><label>Title</label><input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required /></div>
          <div><label>Description</label><input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
          <div style={{ display: 'flex', gap: 10 }}>
            <div style={{ flex: 1 }}><label>Duration (min)</label><input type="number" value={form.durationMinutes} onChange={(e) => setForm({ ...form, durationMinutes: Number(e.target.value) })} /></div>
            <div style={{ flex: 1 }}><label>Negative marking</label><input type="number" step="0.25" value={form.negativeMarking} onChange={(e) => setForm({ ...form, negativeMarking: Number(e.target.value) })} /></div>
          </div>

          <div className="card" style={{ background: 'var(--paper)' }}>
            <div className="eyebrow" style={{ marginBottom: 8 }}>Add a question</div>
            <input placeholder="Question text" value={q.questionText} onChange={(e) => setQ({ ...q, questionText: e.target.value })} style={{ marginBottom: 8 }} />
            {q.options.map((opt, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6 }}>
                <input type="radio" checked={q.correctIndex === i} onChange={() => setQ({ ...q, correctIndex: i })} style={{ width: 'auto' }} />
                <input placeholder={`Option ${String.fromCharCode(65 + i)}`} value={opt} onChange={(e) => {
                  const options = [...q.options]; options[i] = e.target.value; setQ({ ...q, options });
                }} />
              </div>
            ))}
            <button type="button" className="btn btn-ghost" style={{ fontSize: 13, padding: '6px 12px' }} onClick={addQuestion}>+ Add question to quiz</button>
          </div>

          <div className="eyebrow">{form.questions.length} question(s) added</div>
          <button className="btn btn-primary" disabled={creating} type="submit">{creating ? 'Publishing…' : 'Publish quiz'}</button>
        </form>
      </div>

      <div>
        {quizzes.map((qz) => (
          <div key={qz.id} className="card" style={{ marginBottom: 12 }}>
            <div style={{ fontWeight: 600 }}>{qz.title}</div>
            <div className="eyebrow">{qz.question_count} questions · {qz.duration_minutes} min</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
 *  USERS
 * ═══════════════════════════════════════════════════════════════════════════════ */

function Users() {
  const [search, setSearch] = useState('');
  const [users, setUsers] = useState([]);

  const load = () => client.get('/admin/users', { params: { search } }).then(({ data }) => setUsers(data));
  useEffect(load, [search]);

  const setStatus = async (id, status) => {
    await client.patch(`/admin/users/${id}/status`, { status });
    load();
  };

  return (
    <div>
      <input placeholder="Search students by name, username, or email…" value={search} onChange={(e) => setSearch(e.target.value)} style={{ marginBottom: 16, maxWidth: 400 }} />
      <div className="card" style={{ padding: 0 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
          <thead>
            <tr style={{ background: 'var(--paper)', textAlign: 'left' }}>
              <th style={{ padding: 12 }}>Student</th>
              <th style={{ padding: 12 }}>College</th>
              <th style={{ padding: 12 }}>Points</th>
              <th style={{ padding: 12 }}>Status</th>
              <th style={{ padding: 12 }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} style={{ borderTop: '1px solid var(--line)' }}>
                <td style={{ padding: 12 }}>{u.full_name} <span style={{ color: 'var(--ink-soft)' }}>@{u.username}</span></td>
                <td style={{ padding: 12, color: 'var(--ink-soft)' }}>{u.college || '—'}</td>
                <td style={{ padding: 12, fontFamily: 'var(--font-mono)' }}>{u.total_points}</td>
                <td style={{ padding: 12 }}><span className={`badge ${u.status === 'active' ? 'badge-open' : ''}`}>{u.status}</span></td>
                <td style={{ padding: 12 }}>
                  <button className="btn btn-ghost" style={{ padding: '4px 10px', fontSize: 12 }} onClick={() => setStatus(u.id, u.status === 'active' ? 'suspended' : 'active')}>
                    {u.status === 'active' ? 'Suspend' : 'Reactivate'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
