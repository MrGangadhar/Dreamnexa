/**
 * Disclaimer.jsx — Legal disclaimer for DreamNexa
 *
 * Required for a site that publishes government job notifications,
 * educational articles, and news content. Fulfils AdSense policy
 * requirement for clear liability limitations.
 */

import { Link } from 'react-router-dom';
import { useSEO } from '../hooks/useSEO';

const Section = ({ title, children }) => (
  <section style={{ marginBottom: 32 }}>
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

const LAST_UPDATED = 'October 13, 2026';

export default function Disclaimer() {
  useSEO({
    title: 'Disclaimer — DreamNexa | Information & Government Exam Notice',
    description: 'Legal disclaimer for DreamNexa. We are an educational portal sharing recruitment news and exam study aids. We are not affiliated with any government agency.',
    canonical: 'https://dreamnexa.in/disclaimer',
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
          <div style={{ fontSize: 44, marginBottom: 16 }}>⚠️</div>
          <h1 style={{ marginBottom: 10, fontSize: 32, fontWeight: 800, color: 'var(--text-primary)' }}>Disclaimer</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Last updated: {LAST_UPDATED}</p>
        </div>
      </div>

      <div className="container" style={{ paddingTop: 40, paddingBottom: 60, maxWidth: 860, margin: '0 auto' }}>

        {/* Intro box */}
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
            Please read this Disclaimer carefully before using DreamNexa (&ldquo;Platform&rdquo;, &ldquo;we&rdquo;,
            &ldquo;us&rdquo;, or &ldquo;our&rdquo;). By accessing or using the Platform, you acknowledge that you
            have read, understood, and agree to be bound by this Disclaimer.
          </p>
        </div>

        <Section title="1. General Information Only">
          <p>
            The content published on DreamNexa — including government job listings, current affairs articles,
            general knowledge updates, quiz questions, and educational materials — is provided for general
            informational and educational purposes only. Nothing on this Platform constitutes professional
            legal, financial, employment, or career advice.
          </p>
          <p style={{ marginTop: 12 }}>
            You should independently verify all information before relying on it for any purpose, including
            submitting a job application or making a career decision.
          </p>
        </Section>

        <Section title="2. Government Job Notifications">
          <p>
            DreamNexa publishes government job recruitment notifications sourced from official government
            websites, recruitment board notifications, and public announcements. While we make every
            reasonable effort to ensure accuracy, we cannot guarantee that all information — including
            vacancy counts, eligibility criteria, application deadlines, salary scales, and fees — is
            complete, current, or error-free at the time you read it.
          </p>
          <p style={{ marginTop: 12 }}>
            <strong style={{ color: 'var(--text-primary)' }}>
              Always visit the official recruitment authority&apos;s website and read the original notification
              PDF before submitting any application or paying any fee.
            </strong>{' '}
            DreamNexa is not responsible for any loss, missed opportunity, or incorrect application that
            results from reliance on our listings without verification.
          </p>
          <p style={{ marginTop: 12 }}>
            Official application links are provided where available. DreamNexa is not affiliated with any
            government department, recruitment board, or public sector undertaking. We are an independent
            information platform.
          </p>
        </Section>

        <Section title="3. Current Affairs & Educational Content">
          <p>
            Current affairs articles, general knowledge summaries, and educational content published on
            DreamNexa represent the understanding of our editorial team at the time of writing. Facts,
            figures, policy details, and world events change rapidly. We cannot guarantee the ongoing
            accuracy of any specific claim after publication.
          </p>
          <p style={{ marginTop: 12 }}>
            Where articles cite external sources or official references, those links are provided as a
            convenience. DreamNexa does not control those external websites and is not responsible for
            their content or availability.
          </p>
        </Section>

        <Section title="4. Quiz Contests, Points & Rewards">
          <p>
            All contests, quizzes, points, badges, and leaderboard rankings on DreamNexa are part of a
            free-to-play digital gamification system. Points and badges have{' '}
            <strong style={{ color: 'var(--text-primary)' }}>no monetary value</strong>, cannot be
            purchased, sold, or exchanged for cash, and do not constitute any form of prize, lottery,
            or gambling activity.
          </p>
          <p style={{ marginTop: 12 }}>
            DreamNexa does not guarantee any specific prize, reward, or benefit from participating in
            any contest. Contest rules, eligibility, and any non-monetary incentives are described
            individually in each contest listing.
          </p>
        </Section>

        <Section title="5. Third-Party Links & Advertising">
          <p>
            DreamNexa may display third-party advertisements through Google AdSense or similar networks.
            DreamNexa is not responsible for the content, accuracy, or practices of any advertiser or
            linked third-party website. The presence of an advertisement does not constitute endorsement.
          </p>
          <p style={{ marginTop: 12 }}>
            External links (e.g., official notification PDFs, apply-online portals) are provided for
            convenience only. We are not responsible for the content, security, or availability of
            third-party websites.
          </p>
        </Section>

        <Section title="6. No Warranties">
          <p>
            DreamNexa is provided on an &ldquo;as is&rdquo; and &ldquo;as available&rdquo; basis. We do not
            warrant that the Platform will be uninterrupted, error-free, or free of viruses or other
            harmful components. We expressly disclaim all warranties, whether express, implied, statutory,
            or otherwise.
          </p>
        </Section>

        <Section title="7. Limitation of Liability">
          <p>
            To the fullest extent permitted by applicable law, DreamNexa and its team shall not be liable
            for any indirect, incidental, special, consequential, or punitive damages — including lost
            opportunities, incorrect job applications, or data loss — arising from your use of or
            inability to use the Platform or its content.
          </p>
        </Section>

        <Section title="8. Changes to This Disclaimer">
          <p>
            We may update this Disclaimer from time to time. The &ldquo;Last Updated&rdquo; date at the
            top of this page indicates when the most recent revision was made. Continued use of the
            Platform after any changes constitutes acceptance of the revised Disclaimer.
          </p>
        </Section>

        <Section title="9. Contact">
          <p>
            If you have questions about this Disclaimer or would like to report an inaccuracy, please
            contact us:
          </p>
          <div style={{
            background: 'var(--bg-raised)',
            border: '1px solid var(--border)',
            borderRadius: 10,
            padding: 20,
            marginTop: 16,
          }}>
            <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>DreamNexa</div>
            <div>Email: <a href="mailto:meetmrgangadhar@gmail.com" style={{ color: 'var(--accent)' }}>meetmrgangadhar@gmail.com</a></div>
            <div style={{ marginTop: 8 }}>
              Or use our <Link to="/contact-us" style={{ color: 'var(--accent)' }}>Contact Form</Link>.
            </div>
          </div>
        </Section>
      </div>
    </div>
  );
}
