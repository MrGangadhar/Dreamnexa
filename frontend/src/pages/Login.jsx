import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ usernameOrEmail: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.usernameOrEmail, form.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-primary)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '20px',
    }}>
      {/* Background */}
      <div style={{
        position: 'fixed', top: '15%', left: '10%',
        width: 350, height: 350, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(0,212,170,0.07) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'fixed', bottom: '10%', right: '8%',
        width: 280, height: 280, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(255,215,0,0.05) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div className="animate-slide-up" style={{ width: '100%', maxWidth: 400, position: 'relative', zIndex: 1 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 60, height: 60,
            background: 'var(--grad-accent)',
            borderRadius: 18,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 30,
            color: '#001A14', margin: '0 auto 14px',
            boxShadow: 'var(--shadow-accent)',
          }}>Q</div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 26, marginBottom: 6 }}>Welcome Back!</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Log in to continue playing</p>
        </div>

        <div className="card" style={{ padding: 32, background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Username or Email</label>
              <input
                value={form.usernameOrEmail}
                onChange={e => setForm({ ...form, usernameOrEmail: e.target.value })}
                placeholder="your_username or email@example.com"
                required
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPass ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  placeholder="Your password"
                  required
                  style={{ paddingRight: 48 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  style={{
                    position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer',
                    fontSize: 16, color: 'var(--text-muted)', padding: 0,
                  }}
                >{showPass ? '🙈' : '👁'}</button>
              </div>
            </div>

            {error && <div className="alert alert-error">{error}</div>}

            <button className="btn btn-primary btn-full" disabled={loading} type="submit" style={{ padding: '14px 24px', fontSize: 16 }}>
              {loading ? '⏳ Logging in…' : '🚀 Log In'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: 20 }}>
            <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
              New to QuizArena?{' '}
              <Link to="/register" style={{ color: 'var(--accent)', fontWeight: 700 }}>Create free account →</Link>
            </p>
          </div>

          {/* Demo credentials hint */}
          <div style={{
            marginTop: 20,
            padding: '12px 16px',
            background: 'var(--accent-yellow-soft)',
            border: '1px solid rgba(255,215,0,0.2)',
            borderRadius: 10,
            fontSize: 12,
          }}>
            <div style={{ fontWeight: 700, color: 'var(--accent-yellow)', marginBottom: 4, fontFamily: 'var(--font-display)' }}>
              🎯 Demo Credentials
            </div>
            <div style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              <strong style={{ color: 'var(--text-primary)' }}>Admin:</strong> admin / Admin@12345<br />
              <strong style={{ color: 'var(--text-primary)' }}>Student:</strong> john_doe / Pass@12345
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
