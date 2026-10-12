import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: '',
    fullName: '',
    email: '',
    mobile: '',
    password: '',
    referralCode: '',
  });
  const [showPass, setShowPass] = useState(false);
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
      setError(err.response?.data?.error || err.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: 'calc(100vh - 70px)',
      background: 'var(--bg-primary, #f8fafc)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 16px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Decorative Ambient Background Lighting */}
      <div style={{
        position: 'absolute', top: '10%', right: '15%',
        width: 380, height: 380, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(124, 58, 237, 0.12) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: '10%', left: '10%',
        width: 320, height: 320, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(200, 16, 46, 0.08) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{ width: '100%', maxWidth: 540, position: 'relative', zIndex: 1 }}>
        {/* Header Header */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{
            width: 58, height: 58,
            background: 'linear-gradient(135deg, #7c3aed 0%, #2563eb 100%)',
            borderRadius: 16,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 28, color: '#ffffff', margin: '0 auto 12px',
            boxShadow: '0 8px 20px rgba(124, 58, 237, 0.3)',
            fontWeight: 800
          }}>
            ⚡
          </div>
          <h2 style={{
            fontSize: 26, fontWeight: 800, color: 'var(--text-primary, #0f172a)',
            margin: '0 0 6px', letterSpacing: '-0.02em'
          }}>
            Join DreamNexa
          </h2>
          <p style={{ color: 'var(--text-secondary, #64748b)', fontSize: 14, margin: 0 }}>
            Free forever • Compete in quiz contests & get govt job updates
          </p>
        </div>

        {/* Create Account Card */}
        <div style={{
          background: 'var(--bg-card, #ffffff)',
          borderRadius: 20,
          padding: '32px 28px',
          border: '1px solid var(--border, #e2e8f0)',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.06)',
        }}>
          {/* Top Eyebrow Tag */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '4px 12px', borderRadius: 999,
            background: 'rgba(124, 58, 237, 0.08)',
            border: '1px solid rgba(124, 58, 237, 0.18)',
            fontSize: 12, fontWeight: 700, color: '#7c3aed',
            marginBottom: 20
          }}>
            <span>🎁 100 Welcome Points Included</span>
          </div>

          <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {/* Grid Row 1: Full Name & Username */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div>
                <label
                  htmlFor="register-fullName"
                  style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--text-primary, #334155)', marginBottom: 6 }}
                >
                  Full Name *
                </label>
                <input
                  id="register-fullName"
                  type="text"
                  value={form.fullName}
                  onChange={update('fullName')}
                  placeholder="e.g. Rahul Sharma"
                  required
                  style={{
                    width: '100%', padding: '11px 14px', borderRadius: 10,
                    border: '1px solid var(--border, #cbd5e1)', fontSize: 14,
                    background: 'var(--bg-primary, #f8fafc)', outline: 'none',
                    transition: 'border-color 0.2s',
                  }}
                />
              </div>

              <div>
                <label
                  htmlFor="register-username"
                  style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--text-primary, #334155)', marginBottom: 6 }}
                >
                  Username *
                </label>
                <input
                  id="register-username"
                  type="text"
                  value={form.username}
                  onChange={update('username')}
                  placeholder="rahul_99"
                  required
                  minLength={3}
                  style={{
                    width: '100%', padding: '11px 14px', borderRadius: 10,
                    border: '1px solid var(--border, #cbd5e1)', fontSize: 14,
                    background: 'var(--bg-primary, #f8fafc)', outline: 'none',
                    transition: 'border-color 0.2s',
                  }}
                />
              </div>
            </div>

            {/* Grid Row 2: Email & Mobile */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div>
                <label
                  htmlFor="register-email"
                  style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--text-primary, #334155)', marginBottom: 6 }}
                >
                  Email Address *
                </label>
                <input
                  id="register-email"
                  type="email"
                  value={form.email}
                  onChange={update('email')}
                  placeholder="name@domain.com"
                  required
                  style={{
                    width: '100%', padding: '11px 14px', borderRadius: 10,
                    border: '1px solid var(--border, #cbd5e1)', fontSize: 14,
                    background: 'var(--bg-primary, #f8fafc)', outline: 'none',
                    transition: 'border-color 0.2s',
                  }}
                />
              </div>

              <div>
                <label
                  htmlFor="register-mobile"
                  style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--text-primary, #334155)', marginBottom: 6 }}
                >
                  Mobile Number <span style={{ fontWeight: 400, color: 'var(--text-muted, #94a3b8)' }}>(optional)</span>
                </label>
                <input
                  id="register-mobile"
                  type="tel"
                  value={form.mobile}
                  onChange={update('mobile')}
                  placeholder="9876543210"
                  style={{
                    width: '100%', padding: '11px 14px', borderRadius: 10,
                    border: '1px solid var(--border, #cbd5e1)', fontSize: 14,
                    background: 'var(--bg-primary, #f8fafc)', outline: 'none',
                    transition: 'border-color 0.2s',
                  }}
                />
              </div>
            </div>

            {/* Password Field with Show/Hide toggle */}
            <div>
              <label
                htmlFor="register-password"
                style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--text-primary, #334155)', marginBottom: 6 }}
              >
                Password * <span style={{ fontWeight: 400, color: 'var(--text-muted, #94a3b8)', fontSize: 12 }}>(min. 8 characters)</span>
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="register-password"
                  type={showPass ? 'text' : 'password'}
                  value={form.password}
                  onChange={update('password')}
                  placeholder="Create a strong password"
                  required
                  minLength={8}
                  style={{
                    width: '100%', padding: '11px 44px 11px 14px', borderRadius: 10,
                    border: '1px solid var(--border, #cbd5e1)', fontSize: 14,
                    background: 'var(--bg-primary, #f8fafc)', outline: 'none',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  aria-label={showPass ? 'Hide password' : 'Show password'}
                  style={{
                    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer',
                    fontSize: 16, color: '#64748b', padding: 4, display: 'flex', alignItems: 'center',
                  }}
                >
                  {showPass ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            {/* Referral Code */}
            <div>
              <label
                htmlFor="register-referralCode"
                style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--text-primary, #334155)', marginBottom: 6 }}
              >
                Referral Code <span style={{ fontWeight: 400, color: 'var(--text-muted, #94a3b8)' }}>(optional)</span>
              </label>
              <input
                id="register-referralCode"
                type="text"
                value={form.referralCode}
                onChange={update('referralCode')}
                placeholder="e.g. ROHI3F9A"
                style={{
                  width: '100%', padding: '11px 14px', borderRadius: 10,
                  border: '1px solid var(--border, #cbd5e1)', fontSize: 14,
                  background: 'var(--bg-primary, #f8fafc)', outline: 'none',
                }}
              />
            </div>

            {/* Error Message */}
            {error && (
              <div style={{
                background: '#fee2e2', color: '#dc2626', border: '1px solid #fca5a5',
                padding: '10px 14px', borderRadius: 8, fontSize: 13, fontWeight: 600
              }}>
                ⚠️ {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              disabled={loading}
              type="submit"
              style={{
                width: '100%', padding: '14px', borderRadius: 10,
                background: 'linear-gradient(135deg, #7c3aed 0%, #4338ca 100%)',
                color: '#ffffff', border: 'none', fontSize: 15, fontWeight: 700,
                cursor: 'pointer', boxShadow: '0 6px 16px rgba(124, 58, 237, 0.25)',
                transition: 'transform 0.15s ease, opacity 0.15s ease',
                opacity: loading ? 0.7 : 1, marginTop: 4
              }}
            >
              {loading ? '⏳ Creating account…' : '✨ Create Free Account'}
            </button>
          </form>

          {/* Perks Highlights Banner */}
          <div style={{
            marginTop: 22, padding: '12px 14px', borderRadius: 12,
            background: 'var(--bg-primary, #f8fafc)', border: '1px solid var(--border, #e2e8f0)',
            display: 'flex', justifyContent: 'space-around', alignItems: 'center',
            fontSize: 12, color: 'var(--text-secondary, #475569)', fontWeight: 600
          }}>
            <span>🎓 Student Contests</span>
            <span>•</span>
            <span>🏆 Winnings Badges</span>
            <span>•</span>
            <span>🏛️ Govt Jobs</span>
          </div>

          {/* Login Redirection */}
          <div style={{ textAlign: 'center', marginTop: 20 }}>
            <p style={{ color: 'var(--text-secondary, #64748b)', fontSize: 14, margin: 0 }}>
              Already have an account?{' '}
              <Link to="/login" style={{ color: '#7c3aed', fontWeight: 700, textDecoration: 'none' }}>
                Log in →
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
