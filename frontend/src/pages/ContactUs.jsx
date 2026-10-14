/**
 * ContactUs.jsx — Contact Us page with a functional form
 * Posts to /api/contact (no auth required)
 */
import { useState } from 'react';
import { FiMail, FiUser, FiMessageSquare, FiSend, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import client from '../api/client';
import { useSEO } from '../hooks/useSEO';

const SUBJECT_OPTIONS = [
  'General Inquiry',
  'Bug Report',
  'Account Issue',
  'Contest / Quiz Issue',
  'Points / Wallet Issue',
  'Privacy Concern',
  'Other',
];

export default function ContactUs() {
  useSEO({
    title: 'Contact Us — DreamNexa Support & Helpdesk',
    description: 'Get in touch with the DreamNexa support team. Contact us for questions, content corrections, or technical assistance at meetmrgangadhar@gmail.com.',
    canonical: 'https://dreamnexa.in/contact-us',
  });
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState(null); // 'success' | 'error'
  const [serverMessage, setServerMessage] = useState('');

  const update = (key, value) => {
    setForm(f => ({ ...f, [key]: value }));
    if (errors[key]) setErrors(e => ({ ...e, [key]: null }));
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Name is required.';
    if (!form.email.trim()) errs.email = 'Email is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Please enter a valid email address.';
    if (!form.subject) errs.subject = 'Please select a subject.';
    if (!form.message.trim()) errs.message = 'Message is required.';
    else if (form.message.trim().length < 20) errs.message = 'Message must be at least 20 characters.';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setSubmitting(true);
    setStatus(null);
    try {
      const { data } = await client.post('/contact', form);
      setStatus('success');
      setServerMessage(data.message || 'Your message was sent successfully!');
      setForm({ name: '', email: '', subject: '', message: '' });
    } catch (err) {
      setStatus('error');
      setServerMessage(
        err.response?.data?.error ||
        'Failed to send your message. Please try again or email us directly.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-content" style={{ background: 'var(--bg-primary)' }}>
      {/* Hero */}
      <div style={{
        background: 'linear-gradient(135deg, var(--bg-card) 0%, var(--bg-raised) 100%)',
        borderBottom: '1px solid var(--border)',
        padding: '56px 0 40px',
        textAlign: 'center',
      }}>
        <div className="container">
          <div style={{ fontSize: 48, marginBottom: 16 }}>📬</div>
          <h1 style={{ marginBottom: 12 }}>Contact Us</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 16, maxWidth: 480, margin: '0 auto' }}>
            Have a question, found a bug, or need help? We're here for you.
          </p>
        </div>
      </div>

      <div className="container" style={{ paddingTop: 40, paddingBottom: 60 }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: 32,
          maxWidth: 900,
          margin: '0 auto',
        }}>
          {/* Contact Info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div className="card" style={{ padding: 24 }}>
              <h2 style={{ fontSize: 18, marginBottom: 16 }}>Get in Touch</h2>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 20 }}>
                Our support team typically responds within 24–48 hours during business days.
                For urgent issues, please describe the problem in as much detail as possible.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: 10,
                    background: 'var(--accent-red-soft)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <FiMail size={18} color="var(--accent)" />
                  </div>
                  <div>
                    <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 2 }}>Support Email</div>
                    <a href="mailto:meetmrgangadhar@gmail.com" style={{ fontSize: 14, fontWeight: 600, color: 'var(--accent)', textDecoration: 'none' }}>
                      meetmrgangadhar@gmail.com
                    </a>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: 10,
                    background: 'rgba(16,185,129,0.12)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <FiMessageSquare size={18} color="var(--accent-green)" />
                  </div>
                  <div>
                    <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 2 }}>Response Time</div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
                      24–48 business hours
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="card" style={{ padding: 24 }}>
              <h3 style={{ fontSize: 16, marginBottom: 12 }}>Before Contacting Us</h3>
              <ul style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 2, paddingLeft: 18, margin: 0 }}>
                <li>Check our <a href="/help-support" style={{ color: 'var(--accent)' }}>Help &amp; Support</a> page</li>
                <li>Review the <a href="/privacy-policy" style={{ color: 'var(--accent)' }}>Privacy Policy</a></li>
                <li>Include your username when reporting account issues</li>
                <li>Describe the steps to reproduce any bug</li>
              </ul>
            </div>
          </div>

          {/* Contact Form */}
          <div className="card" style={{ padding: 28 }}>
            <h2 style={{ fontSize: 18, marginBottom: 24 }}>Send a Message</h2>

            {status === 'success' && (
              <div style={{
                display: 'flex', alignItems: 'flex-start', gap: 12,
                padding: '16px 18px',
                background: 'rgba(16,185,129,0.1)',
                border: '1px solid rgba(16,185,129,0.35)',
                borderRadius: 10,
                marginBottom: 24,
              }}>
                <FiCheckCircle size={20} color="var(--accent-green)" style={{ flexShrink: 0, marginTop: 2 }} />
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>Message Sent!</div>
                  <div style={{ fontSize: 14, color: 'var(--text-secondary)' }}>{serverMessage}</div>
                </div>
              </div>
            )}

            {status === 'error' && (
              <div style={{
                display: 'flex', alignItems: 'flex-start', gap: 12,
                padding: '16px 18px',
                background: 'var(--accent-red-soft)',
                border: '1px solid rgba(230,57,70,0.35)',
                borderRadius: 10,
                marginBottom: 24,
              }}>
                <FiAlertCircle size={20} color="var(--accent-red)" style={{ flexShrink: 0, marginTop: 2 }} />
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>Failed to Send</div>
                  <div style={{ fontSize: 14, color: 'var(--text-secondary)' }}>{serverMessage}</div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              {/* Name */}
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                  <FiUser size={13} style={{ marginRight: 5 }} />
                  Full Name <span style={{ color: 'var(--accent)' }}>*</span>
                </label>
                <input
                  id="contact-name"
                  type="text"
                  className="form-input"
                  placeholder="Your full name"
                  value={form.name}
                  onChange={e => update('name', e.target.value)}
                  style={{
                    width: '100%',
                    border: errors.name ? '1.5px solid var(--accent-red)' : '1.5px solid var(--border)',
                  }}
                />
                {errors.name && <p style={{ color: 'var(--accent-red)', fontSize: 12, marginTop: 4 }}>{errors.name}</p>}
              </div>

              {/* Email */}
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                  <FiMail size={13} style={{ marginRight: 5 }} />
                  Email Address <span style={{ color: 'var(--accent)' }}>*</span>
                </label>
                <input
                  id="contact-email"
                  type="email"
                  className="form-input"
                  placeholder="your@email.com"
                  value={form.email}
                  onChange={e => update('email', e.target.value)}
                  style={{
                    width: '100%',
                    border: errors.email ? '1.5px solid var(--accent-red)' : '1.5px solid var(--border)',
                  }}
                />
                {errors.email && <p style={{ color: 'var(--accent-red)', fontSize: 12, marginTop: 4 }}>{errors.email}</p>}
              </div>

              {/* Subject */}
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                  Subject <span style={{ color: 'var(--accent)' }}>*</span>
                </label>
                <select
                  id="contact-subject"
                  className="form-input"
                  value={form.subject}
                  onChange={e => update('subject', e.target.value)}
                  style={{
                    width: '100%',
                    border: errors.subject ? '1.5px solid var(--accent-red)' : '1.5px solid var(--border)',
                    background: 'var(--bg-card)',
                    color: form.subject ? 'var(--text-primary)' : 'var(--text-muted)',
                  }}
                >
                  <option value="">Select a subject…</option>
                  {SUBJECT_OPTIONS.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                {errors.subject && <p style={{ color: 'var(--accent-red)', fontSize: 12, marginTop: 4 }}>{errors.subject}</p>}
              </div>

              {/* Message */}
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                  <FiMessageSquare size={13} style={{ marginRight: 5 }} />
                  Message <span style={{ color: 'var(--accent)' }}>*</span>
                </label>
                <textarea
                  id="contact-message"
                  className="form-input"
                  placeholder="Describe your issue or question in detail…"
                  value={form.message}
                  onChange={e => update('message', e.target.value)}
                  rows={5}
                  style={{
                    width: '100%',
                    resize: 'vertical',
                    minHeight: 120,
                    fontFamily: 'inherit',
                    border: errors.message ? '1.5px solid var(--accent-red)' : '1.5px solid var(--border)',
                  }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  {errors.message
                    ? <p style={{ color: 'var(--accent-red)', fontSize: 12, marginTop: 4 }}>{errors.message}</p>
                    : <span />
                  }
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                    {form.message.length} chars
                  </p>
                </div>
              </div>

              <button
                id="contact-submit"
                type="submit"
                className="btn btn-primary btn-full"
                disabled={submitting}
                style={{ fontSize: 15, padding: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
              >
                <FiSend size={16} />
                {submitting ? 'Sending…' : 'Send Message'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
