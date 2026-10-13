/**
 * HelpSupport.jsx — Help & Support FAQ page
 */
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiChevronDown, FiChevronUp, FiMail, FiBook, FiAward, FiShield } from 'react-icons/fi';
import { useSEO } from '../hooks/useSEO';

const FAQ_SECTIONS = [
  {
    title: 'Getting Started',
    icon: FiBook,
    faqs: [
      {
        q: 'How do I create an account?',
        a: 'Click on "Join Free" or "Register" from the homepage. Fill in your username, email address, and password. You\'ll receive a signup bonus of points to get you started!',
      },
      {
        q: 'How do I earn points?',
        a: 'You can earn points by: registering (signup bonus), daily logins, referring friends, participating in contests, and ranking well in quizzes. Points have no monetary value — they are used to join paid-entry contests.',
      },
      {
        q: 'Is DreamNexa free to use?',
        a: 'Yes! DreamNexa is completely free. Some contests require an entry in points (which you earn for free by participating on the platform), but there is no real-money purchase of any kind.',
      },
    ],
  },
  {
    title: 'Contests & Quizzes',
    icon: FiAward,
    faqs: [
      {
        q: 'How do I join a contest?',
        a: 'Go to the Contest page, find an upcoming contest, and click "Join Contest." If the contest has an entry points cost, the required points will be deducted from your balance atomically. You cannot join if you don\'t have sufficient points.',
      },
      {
        q: 'What happens when a contest fills up?',
        a: 'Once all seats are taken, the contest locks and immediately goes LIVE. All participants are notified and can start the quiz. A new contest instance is automatically created so others can still join.',
      },
      {
        q: 'Can I join the same contest twice?',
        a: 'No. Each user can join a contest only once. The system prevents duplicate entries at both the frontend (button disabled) and backend (database constraint) levels.',
      },
      {
        q: 'What happens if my quiz timer runs out?',
        a: 'If the timer reaches zero, your answers are automatically submitted with whatever you\'ve answered so far. This is calculated server-side and is treated the same as a manual submission.',
      },
      {
        q: 'How is scoring calculated?',
        a: 'Scoring is done securely on the server. Each correct answer earns the question\'s mark value. Wrong answers may incur negative marking as configured for that quiz. You never see correct answers before you submit.',
      },
      {
        q: 'Why do I have to wait for results?',
        a: 'Contest results are only finalized once all participants have submitted or the contest window has closed. This ensures fair ranking for everyone.',
      },
    ],
  },
  {
    title: 'Points & Wallet',
    icon: FiBook,
    faqs: [
      {
        q: 'Can I withdraw or convert my points to cash?',
        a: 'No. Points on DreamNexa are not real money, cannot be purchased, and cannot be withdrawn or cashed out. They are purely in-app credits used to join contests and track achievement.',
      },
      {
        q: 'Where can I see my points history?',
        a: 'Go to My Wallet from the sidebar to see your current balance and complete transaction history, including all credits (contest wins, bonuses) and debits (contest entries).',
      },
      {
        q: 'What if points were deducted but I wasn\'t registered?',
        a: 'All point deductions happen inside an atomic database transaction. If registration fails for any reason, the deduction is automatically rolled back and your balance is fully restored.',
      },
    ],
  },
  {
    title: 'Account & Privacy',
    icon: FiShield,
    faqs: [
      {
        q: 'How do I update my profile?',
        a: 'Go to Profile from the sidebar to update your name, college, university, state, city, and other profile information.',
      },
      {
        q: 'Is my personal data safe?',
        a: 'Yes. We encrypt all passwords (using bcrypt), use secure JWT tokens for sessions, and follow standard security practices. Please review our Privacy Policy for full details.',
      },
      {
        q: 'How do I report a bug or problem?',
        a: 'Use the Contact Us page to send us a message. Include as much detail as possible — especially what page you were on and what you expected to happen.',
      },
    ],
  },
];

function AccordionItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      style={{
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-sm)',
        overflow: 'hidden',
        marginBottom: 10,
      }}
    >
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '16px 20px',
          background: open ? 'var(--bg-raised)' : 'var(--bg-card)',
          border: 'none',
          cursor: 'pointer',
          textAlign: 'left',
          gap: 12,
          transition: 'background 0.15s',
        }}
        aria-expanded={open}
      >
        <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.4 }}>
          {q}
        </span>
        {open
          ? <FiChevronUp size={18} color="var(--accent)" style={{ flexShrink: 0 }} />
          : <FiChevronDown size={18} color="var(--text-muted)" style={{ flexShrink: 0 }} />
        }
      </button>
      {open && (
        <div style={{
          padding: '14px 20px 18px',
          background: 'var(--bg-card)',
          borderTop: '1px solid var(--border)',
          fontSize: 14,
          color: 'var(--text-secondary)',
          lineHeight: 1.7,
        }}>
          {a}
        </div>
      )}
    </div>
  );
}

export default function HelpSupport() {
  useSEO({
    title: 'Help & Support FAQ — DreamNexa',
    description: 'Frequently asked questions about DreamNexa accounts, quiz contests, leaderboard points, mock tests, and platform support.',
    canonical: 'https://dreamnexa.in/help-support',
  });

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
          <div style={{ fontSize: 48, marginBottom: 16 }}>🎓</div>
          <h1 style={{ marginBottom: 12 }}>Help &amp; Support</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 16, maxWidth: 520, margin: '0 auto 24px' }}>
            Find answers to frequently asked questions, or reach out to us directly.
          </p>
          <Link
            to="/contact-us"
            className="btn btn-primary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
          >
            <FiMail size={16} /> Contact Support
          </Link>
        </div>
      </div>

      {/* FAQ Sections */}
      <div className="container" style={{ paddingTop: 40, paddingBottom: 60, maxWidth: 720 }}>
        {FAQ_SECTIONS.map((section) => (
          <div key={section.title} style={{ marginBottom: 40 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <section.icon size={20} color="var(--accent)" />
              <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>{section.title}</h2>
            </div>
            {section.faqs.map((item, i) => (
              <AccordionItem key={i} q={item.q} a={item.a} />
            ))}
          </div>
        ))}

        {/* Still need help */}
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-card)',
          padding: 28,
          textAlign: 'center',
          marginTop: 20,
        }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>💬</div>
          <h3 style={{ marginBottom: 8 }}>Still need help?</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 20 }}>
            Our support team is here to help you. Send us a message and we'll get back to you as soon as possible.
          </p>
          <Link to="/contact-us" className="btn btn-primary">
            Send Us a Message
          </Link>
        </div>
      </div>
    </div>
  );
}
