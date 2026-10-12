/**
 * PrivacyPolicy.jsx — Professional Privacy Policy for DreamNexa
 * An educational / quiz contest platform.
 */

const LAST_UPDATED = 'August 14, 2025';
const COMPANY_NAME = 'DreamNexa';
const PLATFORM_NAME = 'DreamNexa';
const SUPPORT_EMAIL = 'support@dreamnexa.com';

const Section = ({ id, title, children }) => (
  <section id={id} style={{ marginBottom: 36 }}>
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

const TOC_ITEMS = [
  { id: 'information-we-collect', label: '1. Information We Collect' },
  { id: 'how-we-use', label: '2. How We Use Information' },
  { id: 'account-information', label: '3. Account Information' },
  { id: 'quiz-data', label: '4. Quiz & Contest Data' },
  { id: 'points-rewards', label: '5. Points and Rewards' },
  { id: 'cookies', label: '6. Cookies' },
  { id: 'advertising', label: '7. Advertising' },
  { id: 'third-party', label: '8. Third-Party Services' },
  { id: 'data-security', label: '9. Data Security' },
  { id: 'data-retention', label: '10. Data Retention' },
  { id: 'user-rights', label: '11. User Rights' },
  { id: 'childrens-privacy', label: '12. Children\'s Privacy' },
  { id: 'policy-changes', label: '13. Policy Changes' },
  { id: 'contact', label: '14. Contact Information' },
];

export default function PrivacyPolicy() {
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
          <div style={{ fontSize: 44, marginBottom: 16 }}>🔒</div>
          <h1 style={{ marginBottom: 10 }}>Privacy Policy</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
            Last updated: {LAST_UPDATED}
          </p>
        </div>
      </div>

      <div className="container" style={{ paddingTop: 40, paddingBottom: 60 }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 220px)',
          gap: 40,
          maxWidth: 1000,
          margin: '0 auto',
          alignItems: 'start',
        }}>
          {/* Main content */}
          <div>
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
                Welcome to <strong style={{ color: 'var(--text-primary)' }}>{PLATFORM_NAME}</strong>. We are committed to protecting your privacy. This Privacy Policy describes how we collect, use, and share information when you use our platform.
              </p>
              <p style={{ marginTop: 12 }}>
                By using {PLATFORM_NAME}, you agree to the collection and use of information in accordance with this policy.
              </p>
            </div>

            <Section id="information-we-collect" title="1. Information We Collect">
              <p>We collect the following types of information when you use {PLATFORM_NAME}:</p>
              <ul style={{ paddingLeft: 20, marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <li><strong style={{ color: 'var(--text-primary)' }}>Registration Information:</strong> Your username, email address, mobile number (optional), full name, college/university name, and state/city.</li>
                <li><strong style={{ color: 'var(--text-primary)' }}>Usage Data:</strong> Pages you visit, contests you join, quizzes you take, and features you interact with.</li>
                <li><strong style={{ color: 'var(--text-primary)' }}>Device Information:</strong> Browser type, operating system, and device type for compatibility and security purposes.</li>
                <li><strong style={{ color: 'var(--text-primary)' }}>Proctoring Data:</strong> If AI proctoring is enabled for a quiz, we may process webcam frames and microphone audio locally in your browser to detect academic integrity violations. This data is not stored on our servers; only violation summary statistics and session flags are stored.</li>
                <li><strong style={{ color: 'var(--text-primary)' }}>Contact Submissions:</strong> If you contact us via the Contact Us form, we retain your name, email, subject, and message.</li>
              </ul>
            </Section>

            <Section id="how-we-use" title="2. How We Use Information">
              <p>We use the information we collect to:</p>
              <ul style={{ paddingLeft: 20, marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <li>Create and manage your account on the platform.</li>
                <li>Allow you to participate in quizzes and contests.</li>
                <li>Calculate scores, rankings, and award points.</li>
                <li>Prevent cheating and maintain the integrity of the platform.</li>
                <li>Send you service notifications (e.g., contest started, results ready).</li>
                <li>Respond to support inquiries.</li>
                <li>Improve the platform's features and user experience.</li>
                <li>Comply with applicable laws and our platform policies.</li>
              </ul>
              <p style={{ marginTop: 14 }}>
                We <strong>do not</strong> sell your personal data to third parties. We do not use your data for advertising targeting beyond what is described in the Advertising section.
              </p>
            </Section>

            <Section id="account-information" title="3. Account Information">
              <p>
                Your account information (username, email, full name) is used to identify you on the platform, display your rankings and profile, and communicate service-related updates with you. Your password is stored as a one-way cryptographic hash (bcrypt) and is never stored in plaintext or recoverable by our staff.
              </p>
              <p style={{ marginTop: 12 }}>
                You may update your profile information at any time from the Settings page. You may also request account deletion by contacting us at <a href={`mailto:${SUPPORT_EMAIL}`} style={{ color: 'var(--accent)' }}>{SUPPORT_EMAIL}</a>.
              </p>
            </Section>

            <Section id="quiz-data" title="4. Quiz & Contest Data">
              <p>
                When you participate in a quiz or contest, we store:
              </p>
              <ul style={{ paddingLeft: 20, marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <li>Your answers to each question (stored on our servers only after submission).</li>
                <li>Your score, correct/incorrect count, and time taken.</li>
                <li>Your final rank and any points awarded.</li>
                <li>The timestamp when you joined and submitted.</li>
              </ul>
              <p style={{ marginTop: 12 }}>
                <strong style={{ color: 'var(--text-primary)' }}>Important:</strong> Correct answers to questions are never sent to your browser before you submit. All scoring is performed securely on the server.
              </p>
            </Section>

            <Section id="points-rewards" title="5. Points and Rewards">
              <p>
                {PLATFORM_NAME} uses an in-app points system. These points have <strong>no monetary value</strong>, cannot be purchased with real money, and cannot be withdrawn or exchanged for cash or any other real-world value.
              </p>
              <p style={{ marginTop: 12 }}>
                Points are earned through free actions on the platform (sign-up bonus, daily login, referrals, and contest performance). All point transactions are logged in our database and visible to you in your Wallet / Transaction History.
              </p>
            </Section>

            <Section id="cookies" title="6. Cookies">
              <p>
                We use the following types of browser storage:
              </p>
              <ul style={{ paddingLeft: 20, marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <li><strong style={{ color: 'var(--text-primary)' }}>localStorage:</strong> We store your authentication tokens (JSON Web Tokens) in localStorage for session management. These are required for the platform to function.</li>
                <li><strong style={{ color: 'var(--text-primary)' }}>sessionStorage:</strong> We temporarily store your quiz answers in session storage to prevent accidental loss if your browser refreshes. This data is cleared once you submit your quiz.</li>
              </ul>
              <p style={{ marginTop: 12 }}>
                We do not currently use third-party advertising cookies. If this changes in the future, we will update this policy and seek your consent where required by law.
              </p>
            </Section>

            <Section id="advertising" title="7. Advertising">
              <p>
                {PLATFORM_NAME} may display advertisements. If we do, we use contextual advertising that does not rely on tracking your browsing behaviour across other websites. We do not share your personal data with advertisers for targeting purposes.
              </p>
            </Section>

            <Section id="third-party" title="8. Third-Party Services">
              <p>
                We may use the following third-party services to operate the platform:
              </p>
              <ul style={{ paddingLeft: 20, marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <li><strong style={{ color: 'var(--text-primary)' }}>Hosting Providers:</strong> Our servers and database infrastructure are hosted by reputable cloud providers. These providers process your data on our behalf under data processing agreements.</li>
                <li><strong style={{ color: 'var(--text-primary)' }}>News & Content APIs:</strong> We fetch publicly available news and current affairs content from third-party news APIs. This does not involve sharing your personal data.</li>
              </ul>
              <p style={{ marginTop: 12 }}>
                We only work with third parties that have data protection practices consistent with this policy.
              </p>
            </Section>

            <Section id="data-security" title="9. Data Security">
              <p>
                We take reasonable technical and organisational measures to protect your data, including:
              </p>
              <ul style={{ paddingLeft: 20, marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <li>HTTPS encryption for all data in transit.</li>
                <li>bcrypt hashing for all passwords.</li>
                <li>JWT-based authentication with short-lived access tokens and refresh tokens.</li>
                <li>Rate limiting and input validation on all API endpoints.</li>
                <li>Database-level constraints to prevent duplicate or invalid records.</li>
              </ul>
              <p style={{ marginTop: 12 }}>
                Despite these measures, no system is completely secure. We encourage you to use a strong, unique password and to contact us immediately if you suspect unauthorised access to your account.
              </p>
            </Section>

            <Section id="data-retention" title="10. Data Retention">
              <p>
                We retain your account data for as long as your account is active. If you request account deletion, we will delete or anonymise your personal data within 30 days, except where we are required to retain it for legal or compliance purposes.
              </p>
              <p style={{ marginTop: 12 }}>
                Quiz attempt data and contest records may be retained in anonymised form for platform analytics even after account deletion.
              </p>
            </Section>

            <Section id="user-rights" title="11. User Rights">
              <p>
                Depending on your location, you may have the right to:
              </p>
              <ul style={{ paddingLeft: 20, marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <li><strong style={{ color: 'var(--text-primary)' }}>Access:</strong> Request a copy of the personal data we hold about you.</li>
                <li><strong style={{ color: 'var(--text-primary)' }}>Correction:</strong> Ask us to correct inaccurate information. You can update most of your profile directly in the app.</li>
                <li><strong style={{ color: 'var(--text-primary)' }}>Deletion:</strong> Request that we delete your account and associated personal data.</li>
                <li><strong style={{ color: 'var(--text-primary)' }}>Portability:</strong> Request your data in a portable, machine-readable format.</li>
              </ul>
              <p style={{ marginTop: 12 }}>
                To exercise any of these rights, please contact us at <a href={`mailto:${SUPPORT_EMAIL}`} style={{ color: 'var(--accent)' }}>{SUPPORT_EMAIL}</a>.
              </p>
            </Section>

            <Section id="childrens-privacy" title="12. Children's Privacy">
              <p>
                {PLATFORM_NAME} is intended for users who are at least 13 years of age. We do not knowingly collect personal information from children under 13. If we become aware that we have collected personal information from a child under 13 without verification of parental consent, we will take steps to delete that information.
              </p>
              <p style={{ marginTop: 12 }}>
                If you believe a child under 13 has provided personal information to us, please contact us at <a href={`mailto:${SUPPORT_EMAIL}`} style={{ color: 'var(--accent)' }}>{SUPPORT_EMAIL}</a>.
              </p>
            </Section>

            <Section id="policy-changes" title="13. Policy Changes">
              <p>
                We may update this Privacy Policy from time to time. We will notify registered users of significant changes by posting a notice on the platform or sending an in-app notification. The "Last Updated" date at the top of this page will always reflect the most recent revision.
              </p>
              <p style={{ marginTop: 12 }}>
                Your continued use of {PLATFORM_NAME} after any changes to this policy constitutes your acceptance of the updated policy.
              </p>
            </Section>

            <Section id="contact" title="14. Contact Information">
              <p>
                If you have questions or concerns about this Privacy Policy, or if you wish to exercise your data rights, please contact us:
              </p>
              <div style={{
                background: 'var(--bg-raised)',
                border: '1px solid var(--border)',
                borderRadius: 10,
                padding: 20,
                marginTop: 16,
              }}>
                <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>{COMPANY_NAME}</div>
                <div>Email: <a href={`mailto:${SUPPORT_EMAIL}`} style={{ color: 'var(--accent)' }}>{SUPPORT_EMAIL}</a></div>
                <div style={{ marginTop: 8 }}>
                  Or use our <a href="/contact-us" style={{ color: 'var(--accent)' }}>Contact Form</a>.
                </div>
              </div>
            </Section>
          </div>

          {/* Table of Contents (sticky sidebar) */}
          <div>
            <div style={{
              position: 'sticky',
              top: 'calc(var(--nav-height, 70px) + 20px)',
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-card)',
              padding: 20,
            }}>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: 14 }}>
                Table of Contents
              </div>
              <nav>
                {TOC_ITEMS.map(({ id, label }) => (
                  <a
                    key={id}
                    href={`#${id}`}
                    style={{
                      display: 'block',
                      fontSize: 13,
                      color: 'var(--text-secondary)',
                      padding: '5px 0',
                      textDecoration: 'none',
                      lineHeight: 1.4,
                      transition: 'color 0.15s',
                    }}
                    onMouseEnter={e => e.target.style.color = 'var(--accent)'}
                    onMouseLeave={e => e.target.style.color = 'var(--text-secondary)'}
                  >
                    {label}
                  </a>
                ))}
              </nav>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
