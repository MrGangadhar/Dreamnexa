/**
 * EditorialPolicy.jsx — Editorial Policy page for DreamNexa
 *
 * Documents how content is created, reviewed, corrected, and updated.
 * Important for AdSense "site quality" review and user trust.
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

export default function EditorialPolicy() {
  useSEO({
    title: 'Editorial Policy — DreamNexa | Standards, Fact-Checking & Corrections',
    description: 'Read the editorial principles, fact-checking processes, and verification standards used across all DreamNexa educational content and job notifications.',
    canonical: 'https://dreamnexa.in/editorial-policy',
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
          <div style={{ fontSize: 44, marginBottom: 16 }}>📋</div>
          <h1 style={{ marginBottom: 10, fontSize: 32, fontWeight: 800, color: 'var(--text-primary)' }}>
            Editorial Policy
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
            DreamNexa is committed to publishing accurate, fair, and useful content. This Editorial
            Policy explains the standards we follow when creating government job notifications, current
            affairs articles, quiz questions, and educational materials, as well as how we handle errors
            and update content.
          </p>
        </div>

        <Section title="1. Content Types & Sources">
          <p><strong style={{ color: 'var(--text-primary)' }}>Government Job Notifications:</strong></p>
          <ul style={{ paddingLeft: 20, marginTop: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
            <li>Sourced from official government websites, recruitment board notifications, and published gazette notices.</li>
            <li>We always link to the original official source (notification PDF or official portal).</li>
            <li>Key details — vacancies, dates, eligibility, salary — are copied directly from official documents and cited accordingly.</li>
            <li>Where official data is not yet available (e.g., vacancies &ldquo;to be announced&rdquo;), we state this explicitly rather than estimating.</li>
          </ul>

          <p style={{ marginTop: 14 }}><strong style={{ color: 'var(--text-primary)' }}>Current Affairs Articles:</strong></p>
          <ul style={{ paddingLeft: 20, marginTop: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
            <li>Based on news from credible national and international sources, which are cited in each article.</li>
            <li>We distinguish between confirmed facts and editorial analysis or interpretation.</li>
            <li>We do not publish rumours, unverified leaks, or speculative headlines as fact.</li>
          </ul>

          <p style={{ marginTop: 14 }}><strong style={{ color: 'var(--text-primary)' }}>Quiz Questions:</strong></p>
          <ul style={{ paddingLeft: 20, marginTop: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
            <li>Questions are reviewed for factual accuracy before publication.</li>
            <li>Answer keys are verified against authoritative references (NCERT, official exam answer keys, established GK databases).</li>
            <li>Questions that are ambiguous or disputed are revised or removed before the contest goes live.</li>
          </ul>
        </Section>

        <Section title="2. Editorial Independence">
          <p>
            DreamNexa&apos;s editorial decisions are independent of our advertising relationships. Advertisers
            do not influence which government jobs we list, which current affairs topics we cover, or how we
            frame our content. Sponsored or promoted content, if ever published, will be clearly labelled as
            such and distinguished from editorial content.
          </p>
        </Section>

        <Section title="3. Accuracy Standards">
          <ul style={{ paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <li>We verify key facts against at least one primary or official source before publication.</li>
            <li>Statistics, dates, and figures are taken from official announcements or established data sets.</li>
            <li>We do not exaggerate claims, use misleading headlines, or publish clickbait.</li>
            <li>We do not generate content using automated AI tools without human editorial review.</li>
          </ul>
        </Section>

        <Section title="4. Corrections & Updates">
          <p>
            We take factual errors seriously. When an error is identified — whether by our team or reported
            by a reader — we correct it promptly. Our correction process:
          </p>
          <ul style={{ paddingLeft: 20, marginTop: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <li>Errors reported via our <Link to="/contact-us" style={{ color: 'var(--accent)' }}>Contact Form</Link> are reviewed within 2 business days.</li>
            <li>If an error is confirmed, the content is corrected and the article is marked with a visible correction note indicating what was changed and when.</li>
            <li>Government job listing details (dates, vacancy counts) may be updated as official information is published. Significant updates are noted with a &ldquo;Last Verified&rdquo; timestamp.</li>
            <li>Outdated job listings (where the application deadline has passed and no extension is announced) are marked as closed rather than deleted, to preserve the historical record.</li>
          </ul>
          <p style={{ marginTop: 12 }}>
            To report an error, use our <Link to="/contact-us" style={{ color: 'var(--accent)' }}>Contact Us</Link> page with the subject &ldquo;Content Correction&rdquo;.
          </p>
        </Section>

        <Section title="5. Independence from Government">
          <p>
            DreamNexa is an independent private educational platform. We are not affiliated with, endorsed
            by, or officially connected to any government department, recruitment board, or public sector
            undertaking. Our listing of government jobs does not imply any formal relationship with the
            hiring authority.
          </p>
        </Section>

        <Section title="6. User-Generated Content">
          <p>
            At present, DreamNexa does not publish user-submitted articles or comments. If this changes,
            this policy will be updated to cover the standards and moderation process for user content.
          </p>
        </Section>

        <Section title="7. Contact the Editorial Team">
          <p>
            For corrections, questions about our editorial standards, or to report a factual inaccuracy,
            please contact us:
          </p>
          <div style={{
            background: 'var(--bg-raised)',
            border: '1px solid var(--border)',
            borderRadius: 10,
            padding: 20,
            marginTop: 16,
          }}>
            <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>DreamNexa Editorial Team</div>
            <div>Email: <a href="mailto:meetmrgangadhar@gmail.com" style={{ color: 'var(--accent)' }}>meetmrgangadhar@gmail.com</a></div>
            <div style={{ marginTop: 8 }}>
              Or use our <Link to="/contact-us" style={{ color: 'var(--accent)' }}>Contact Form</Link> with subject &ldquo;Content Correction&rdquo;.
            </div>
          </div>
        </Section>
      </div>
    </div>
  );
}
