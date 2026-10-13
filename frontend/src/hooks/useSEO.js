/**
 * useSEO.js — Utility hook for per-page SEO meta tags
 *
 * Usage:
 *   import { useSEO } from '../hooks/useSEO';
 *
 *   export default function GovernmentJobs() {
 *     useSEO({
 *       title: 'Government Jobs 2026 — DreamNexa',
 *       description: 'Browse latest Sarkari Naukri...',
 *       canonical: 'https://dreamnexa.in/government-jobs',
 *     });
 *     ...
 *   }
 *
 * Sets:
 *   - document.title
 *   - <meta name="description">
 *   - <link rel="canonical">
 *   - <meta property="og:title">
 *   - <meta property="og:description">
 *   - <meta property="og:url">
 *
 * All tags are restored to their index.html defaults on unmount
 * so navigating back to the homepage doesn't leave stale tags.
 */

import { useEffect } from 'react';

const DEFAULT_TITLE = 'DreamNexa — Government Jobs, Current Affairs & Free Quiz Contests';
const DEFAULT_DESC  = 'Free educational platform for Indian students. Verified govt job alerts, daily current affairs & GK updates, and free multiplayer quiz contests.';
const DEFAULT_CANONICAL = 'https://dreamnexa.in/';
const SITE_NAME = 'DreamNexa';

function setMeta(name, content, attr = 'name') {
  if (!content) return;
  let el = document.querySelector(`meta[${attr}="${name}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function setCanonical(href) {
  if (!href) return;
  let el = document.querySelector('link[rel="canonical"]');
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', 'canonical');
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

/**
 * @param {object} params
 * @param {string} [params.title]       Page title (will be set on document.title)
 * @param {string} [params.description] Meta description (150–160 chars ideal)
 * @param {string} [params.canonical]   Canonical URL for this page
 * @param {string} [params.ogImage]     Open Graph image URL (optional)
 */
export function useSEO({ title, description, canonical, ogImage } = {}) {
  useEffect(() => {
    const prevTitle     = document.title;
    const prevDesc      = document.querySelector('meta[name="description"]')?.getAttribute('content');
    const prevCanonical = document.querySelector('link[rel="canonical"]')?.getAttribute('href');

    if (title) document.title = title;
    if (description) setMeta('description', description);
    if (canonical) setCanonical(canonical);

    // Open Graph
    if (title) setMeta('og:title', title, 'property');
    if (description) setMeta('og:description', description, 'property');
    if (canonical) setMeta('og:url', canonical, 'property');
    if (ogImage) setMeta('og:image', ogImage, 'property');

    // Twitter
    if (title) setMeta('twitter:title', title);
    if (description) setMeta('twitter:description', description);

    return () => {
      document.title = prevTitle || DEFAULT_TITLE;
      setMeta('description', prevDesc || DEFAULT_DESC);
      setCanonical(prevCanonical || DEFAULT_CANONICAL);
      setMeta('og:title', prevTitle || DEFAULT_TITLE, 'property');
      setMeta('og:description', prevDesc || DEFAULT_DESC, 'property');
      setMeta('og:url', prevCanonical || DEFAULT_CANONICAL, 'property');
    };
  }, [title, description, canonical, ogImage]);
}
