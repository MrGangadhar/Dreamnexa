/**
 * TermsOfService.jsx — Full Terms of Service for DreamNexa
 *
 * Expanded from 7 thin clauses to a proper 12-section document.
 * Required for AdSense "site quality" review.
 */

import { Link } from 'react-router-dom';
import { useSEO } from '../hooks/useSEO';

const LAST_UPDATED = 'October 13, 2026';
const SUPPORT_EMAIL = 'support@dreamnexa.in';

const Section = ({ id, title, children }) => (
  <section id={id} style={{ marginBottom: 32 }}>
    <h2 style={{
      fontSize: 18, fontWeight: 700,
      color: 'var(--text-primary)',
      paddingBottom: 10,
      borderBottom: '1px solid var(--border)',
      marginBottom: 16,
    }}>
      {title}
    </h2>
    <div style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.8 }}>
      {children}
    </div>
  </section>
);

export default function TermsOfService() {
  useSEO({
    title: 'Terms of Service — DreamNexa',
    description: 'Read the terms and conditions governing the use of the DreamNexa platform, quiz contests, point balances, and educational content.',
    canonical: 'https://dreamnexa.in/terms',
  });

  return (
    <div className="page-content" style={{ background: 'var(--bg-primary)' }}>

      {/* Hero */}
      <div style={{
        background: 'linear-gradient(135deg, var(--bg-card) 0%, var(--bg-raised) 100%)',
        borderBottom: '1px solid var(--border)',
        padding: '48px 0 32px',
        textAlign: 'center',
      }}>
        <div className="container">
          <div style={{ fontSize: 44, marginBottom: 16 }}>📄</div>
          <h1 style={{ marginBottom: 10, fontSize: 32, fontWeight: 800, color: 'var(--text-primary)' }}>
            Terms of Service
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Last updated: {LAST_UPDATED}</p>
        </div>
      </div>

      <div className="container" style={{ paddingTop: 40, paddingBottom: 60, maxWidth: 860, margin: '0 auto' }}>

        {/* Intro */}
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-card)',
          padding: 24,
          marginBottom: 36,
          fontSize: 15,
          color: 'var(--text-secondary)',
          lineHeight: 1.8,
        }}>
          <p>
            Please read these Terms of Service (&ldquo;Terms&rdquo;) carefully before using DreamNexa
            (&ldquo;Platform&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;). By accessing
            or using the Platform, you agree to be bound by these Terms. If you do not agree to these Terms,
            please do not use the Platform.
          </p>
        </div>

        <Section id="acceptance" title="1. Acceptance of Terms">
          <p>
            By registering for an account, accessing any page, or participating in any contest or quiz on
            DreamNexa, you confirm that you are at least 13 years of age and that you accept these Terms of
            Service in full. If you are under 18, you confirm that a parent or guardian has reviewed and
            consented to these Terms on your behalf.
          </p>
        </Section>

        <Section id="platform-purpose" title="2. Platform Purpose & Nature">
          <p>
            DreamNexa is a free, educational platform that provides:
          </p>
          <ul style={{ paddingLeft: 20, marginTop: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
            <li>Government job recruitment notifications and related information for informational purposes.</li>
            <li>Current affairs and general knowledge articles for competitive exam preparation.</li>
            <li>Educational news and updates relevant to Indian students.</li>
            <li>Free-to-play multiplayer quiz contests with a digital points and leaderboard system.</li>
          </ul>
          <p style={{ marginTop: 12 }}>
            DreamNexa is <strong style={{ color: 'var(--text-primary)' }}>not</strong> a government
            recruitment agency, employment service, or job placement platform. We are an independent
            information and educational technology platform.
          </p>
        </Section>

        <Section id="points-system" title="3. Points System & Rewards">
          <p>
            DreamNexa uses a digital points system as a gamification mechanism. You understand and agree that:
          </p>
          <ul style={{ paddingLeft: 20, marginTop: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
            <li>Points, badges, and ranks on this Platform have <strong>no monetary or cash value</strong>.</li>
            <li>Points cannot be purchased with real money, transferred to another user, or exchanged for cash, goods, or services.</li>
            <li>Points are earned through free platform actions: registration bonus, daily login, referrals, and contest performance.</li>
            <li>DreamNexa may modify the points system, earning rates, or rewards structure at any time without liability to you.</li>
            <li>Points may be forfeited if your account is suspended or terminated for violations of these Terms.</li>
          </ul>
        </Section>

        <Section id="accounts" title="4. User Accounts & Responsibilities">
          <p>
            You are responsible for:
          </p>
          <ul style={{ paddingLeft: 20, marginTop: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
            <li>Maintaining the confidentiality of your account credentials.</li>
            <li>All activities that occur under your account.</li>
            <li>Providing accurate registration information and keeping it updated.</li>
            <li>Notifying us immediately if you suspect unauthorised use of your account.</li>
          </ul>
          <p style={{ marginTop: 12 }}>
            You may not create more than one account per person. Multi-accounting to gain additional referral
            bonuses or contest points is a violation of these Terms and may result in account termination and
            forfeiture of all points.
          </p>
        </Section>

        <Section id="prohibited-conduct" title="5. Prohibited Conduct">
          <p>
            You agree not to:
          </p>
          <ul style={{ paddingLeft: 20, marginTop: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
            <li>Use automated bots, scripts, or software to participate in contests or earn points.</li>
            <li>Attempt to reverse-engineer, tamper with, or exploit any feature of the Platform.</li>
            <li>Share, publish, or reproduce quiz questions or answer keys outside the Platform without our written consent.</li>
            <li>Impersonate any person, organisation, or government body.</li>
            <li>Upload or transmit any content that is unlawful, harmful, defamatory, obscene, or infringing.</li>
            <li>Use the Platform for any commercial solicitation without our prior written consent.</li>
            <li>Attempt to circumvent AI proctoring systems in proctored contests.</li>
            <li>Encourage others to click on advertisements artificially or generate fraudulent traffic.</li>
          </ul>
        </Section>

        <Section id="proctoring" title="6. AI Proctoring & Contest Integrity">
          <p>
            Certain competitive quizzes use AI-based proctoring. By participating in a proctored contest, you:
          </p>
          <ul style={{ paddingLeft: 20, marginTop: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
            <li>Consent to your device&apos;s camera and microphone being activated during the contest for real-time integrity monitoring.</li>
            <li>Acknowledge that face detection and audio activity monitoring operate on-device and that only summary flags (not raw video/audio) are stored.</li>
            <li>Understand that a proctoring violation flag may result in score disqualification at the platform&apos;s discretion.</li>
          </ul>
          <p style={{ marginTop: 12 }}>
            The AI proctoring system is a supplementary integrity tool and is not infallible. DreamNexa does
            not guarantee that all violations will be detected, nor that all flags represent genuine violations.
          </p>
        </Section>

        <Section id="content" title="7. Content & Intellectual Property">
          <p>
            <strong style={{ color: 'var(--text-primary)' }}>Platform Content:</strong> All original content
            on DreamNexa — including quiz questions, article text, interface design, and branding — is the
            intellectual property of DreamNexa or its licensors. You may not reproduce, distribute, or
            commercialise this content without written permission.
          </p>
          <p style={{ marginTop: 12 }}>
            <strong style={{ color: 'var(--text-primary)' }}>Government Information:</strong> Government job
            notifications, official documents, and recruitment details belong to their respective government
            departments and are reproduced here for educational and informational purposes under fair use.
            DreamNexa does not claim ownership of official government documents.
          </p>
          <p style={{ marginTop: 12 }}>
            <strong style={{ color: 'var(--text-primary)' }}>User Content:</strong> By submitting any content
            to us (e.g., via the contact form), you grant DreamNexa a non-exclusive, royalty-free licence to
            use that content for the purposes of operating and improving the Platform.
          </p>
        </Section>

        <Section id="advertising" title="8. Advertising">
          <p>
            DreamNexa may display advertisements served by third-party networks, including Google AdSense.
            You agree not to click on advertisements artificially or encourage others to do so. We are not
            responsible for the content, products, or services offered by advertisers. The presence of an
            advertisement does not constitute an endorsement by DreamNexa.
          </p>
        </Section>

        <Section id="disclaimer" title="9. Disclaimer of Warranties">
          <p>
            The Platform is provided on an &ldquo;as is&rdquo; and &ldquo;as available&rdquo; basis without
            warranties of any kind, express or implied. We do not warrant that:
          </p>
          <ul style={{ paddingLeft: 20, marginTop: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
            <li>The Platform will be error-free, uninterrupted, or free of viruses.</li>
            <li>Government job information is always current, accurate, or complete.</li>
            <li>The Platform will be available at any specific time.</li>
          </ul>
          <p style={{ marginTop: 12 }}>
            Always verify government job information independently at the official source before applying.
            See our full <Link to="/disclaimer" style={{ color: 'var(--accent)' }}>Disclaimer</Link> for details.
          </p>
        </Section>

        <Section id="limitation" title="10. Limitation of Liability">
          <p>
            To the fullest extent permitted by applicable law, DreamNexa shall not be liable for any indirect,
            incidental, special, consequential, or punitive damages arising from:
          </p>
          <ul style={{ paddingLeft: 20, marginTop: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
            <li>Your use of or inability to use the Platform.</li>
            <li>Any reliance on government job or educational information published on the Platform.</li>
            <li>Loss of points, contest disqualification, or account suspension.</li>
            <li>Any unauthorised access to your account.</li>
          </ul>
        </Section>

        <Section id="termination" title="11. Account Termination">
          <p>
            DreamNexa reserves the right to suspend or permanently terminate your account at its sole
            discretion, with or without notice, if we reasonably believe you have violated these Terms or
            engaged in conduct harmful to the Platform or other users.
          </p>
          <p style={{ marginTop: 12 }}>
            You may also delete your account at any time by contacting us at{' '}
            <a href={`mailto:${SUPPORT_EMAIL}`} style={{ color: 'var(--accent)' }}>{SUPPORT_EMAIL}</a>.
            Upon account deletion, your personal data will be handled as described in our{' '}
            <Link to="/privacy-policy" style={{ color: 'var(--accent)' }}>Privacy Policy</Link>.
          </p>
        </Section>

        <Section id="governing-law" title="12. Governing Law & Dispute Resolution">
          <p>
            These Terms are governed by the laws of India. Any disputes arising from these Terms or your
            use of the Platform shall be subject to the exclusive jurisdiction of the competent courts in
            India.
          </p>
          <p style={{ marginTop: 12 }}>
            We encourage you to first contact us to resolve any concern informally before initiating any
            legal proceedings. Please reach out via our{' '}
            <Link to="/contact-us" style={{ color: 'var(--accent)' }}>Contact Page</Link> or at{' '}
            <a href={`mailto:${SUPPORT_EMAIL}`} style={{ color: 'var(--accent)' }}>{SUPPORT_EMAIL}</a>.
          </p>
        </Section>

        <Section id="changes" title="13. Changes to These Terms">
          <p>
            We may update these Terms of Service from time to time. We will notify registered users of
            significant changes by posting a notice on the Platform or sending an in-app notification.
            The &ldquo;Last Updated&rdquo; date at the top of this page will always reflect the most recent revision.
            Your continued use of the Platform after any changes constitutes acceptance of the updated Terms.
          </p>
        </Section>

        {/* Contact */}
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-card)',
          padding: 24,
          marginTop: 8,
        }}>
          <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>Contact Us</div>
          <div style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
            If you have questions about these Terms, please contact us at{' '}
            <a href={`mailto:${SUPPORT_EMAIL}`} style={{ color: 'var(--accent)' }}>{SUPPORT_EMAIL}</a>
            {' '}or use our <Link to="/contact-us" style={{ color: 'var(--accent)' }}>Contact Form</Link>.
          </div>
        </div>
      </div>
    </div>
  );
}
