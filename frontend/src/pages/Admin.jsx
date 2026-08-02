import { useEffect, useState } from 'react';
import client from '../api/client';

export default function Admin() {
  const [tab, setTab] = useState('overview');
  return (
    <div className="container" style={{ paddingTop: 32, paddingBottom: 60 }}>
      <div className="eyebrow">Admin control room</div>
      <h1 style={{ marginBottom: 20 }}>Manage QuizArena</h1>

      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        {['overview', 'templates', 'quizzes', 'users'].map((t) => (
          <button key={t} onClick={() => setTab(t)} className={tab === t ? 'btn btn-primary' : 'btn btn-ghost'} style={{ padding: '8px 16px', fontSize: 14, textTransform: 'capitalize' }}>
            {t}
          </button>
        ))}
      </div>

      {tab === 'overview' && <Overview />}
      {tab === 'templates' && <Templates />}
      {tab === 'quizzes' && <Quizzes />}
      {tab === 'users' && <Users />}
    </div>
  );
}

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
