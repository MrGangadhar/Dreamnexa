import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: '', fullName: '', email: '', mobile: '', password: '', referralCode: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const update = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(form);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: 460, paddingTop: 48, paddingBottom: 48 }}>
      <div className="card">
        <div className="eyebrow">Free forever · no payment details ever asked</div>
        <h2 style={{ marginBottom: 20 }}>Create your account</h2>
        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label>Full name</label>
            <input value={form.fullName} onChange={update('fullName')} required />
          </div>
          <div>
            <label>Username</label>
            <input value={form.username} onChange={update('username')} required minLength={3} />
          </div>
          <div>
            <label>Email</label>
            <input type="email" value={form.email} onChange={update('email')} required />
          </div>
          <div>
            <label>Mobile (optional)</label>
            <input value={form.mobile} onChange={update('mobile')} />
          </div>
          <div>
            <label>Password</label>
            <input type="password" value={form.password} onChange={update('password')} required minLength={8} />
          </div>
          <div>
            <label>Referral code (optional)</label>
            <input value={form.referralCode} onChange={update('referralCode')} placeholder="e.g. ROHI3F9A" />
          </div>
          {error && <div style={{ color: 'var(--rubric-red)', fontSize: 14 }}>{error}</div>}
          <button className="btn btn-primary" disabled={loading} type="submit">{loading ? 'Creating account…' : 'Create free account'}</button>
        </form>
        <p style={{ marginTop: 16, fontSize: 14, color: 'var(--ink-soft)' }}>
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </div>
    </div>
  );
}
