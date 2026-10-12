import { Link } from 'react-router-dom';
import { FiShield, FiFileText, FiCheckCircle, FiHelpCircle } from 'react-icons/fi';

export default function TermsOfService() {
  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '30px 20px', fontFamily: 'var(--font-body)' }}>
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 10 }}>
          Terms of Service
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>
          Last updated: September 24, 2026
        </p>
      </div>

      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: 30, lineHeight: 1.7 }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginTop: 0, marginBottom: 15, color: 'var(--text-primary)' }}>
          1. Acceptance of Terms
        </h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 20 }}>
          By accessing or using DreamNexa ("Platform"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Platform.
        </p>

        <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginTop: 25, marginBottom: 15, color: 'var(--text-primary)' }}>
          2. Platform Purpose & Points System
        </h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 20 }}>
          DreamNexa is an educational, free-to-play points-based contest platform. All points, badges, and rewards earned on this Platform are digital gamification items only. Points have no monetary cash value, cannot be purchased with real money, and cannot be cashed out.
        </p>

        <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginTop: 25, marginBottom: 15, color: 'var(--text-primary)' }}>
          3. User Accounts & Responsibilities
        </h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 20 }}>
          You are responsible for maintaining the confidentiality of your account credentials. You agree not to engage in automated scripting, cheating, multi-accounting, or abusing the referral system. Any violation may result in account termination and forfeiture of points.
        </p>

        <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginTop: 25, marginBottom: 15, color: 'var(--text-primary)' }}>
          4. AI Proctoring & Integrity
        </h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 20 }}>
          Certain competitive quizzes utilize automated AI proctoring (camera face detection & audio activity monitoring) to maintain fair contest conditions. By participating in proctored contests, you consent to real-time on-device session verification.
        </p>

        <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginTop: 25, marginBottom: 15, color: 'var(--text-primary)' }}>
          5. Intellectual Property & Job Listings
        </h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 20 }}>
          Government job listings and current affairs articles hosted on the Platform are published for educational and informational purposes. Official recruitment details belong to their respective government departments.
        </p>

        <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginTop: 25, marginBottom: 15, color: 'var(--text-primary)' }}>
          6. Limitation of Liability
        </h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 20 }}>
          The Platform is provided on an "as is" and "as available" basis without warranties of any kind. We are not liable for any indirect or consequential damages arising from your use of the Platform.
        </p>

        <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginTop: 25, marginBottom: 15, color: 'var(--text-primary)' }}>
          7. Contact Information
        </h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 20 }}>
          If you have any questions regarding these Terms, please reach out via our{' '}
          <Link to="/contact-us" style={{ color: 'var(--brand-primary)', textDecoration: 'underline' }}>
            Contact Page
          </Link>.
        </p>
      </div>
    </div>
  );
}
