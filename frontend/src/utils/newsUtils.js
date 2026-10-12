/**
 * newsUtils.js — shared utility functions for the news module.
 */

/**
 * Estimate reading time from a body of text.
 * @param {string} text
 * @param {number} wpm — words per minute (default 200)
 * @returns {number}  estimated minutes (minimum 1)
 */
export function estimateReadTime(text = '', wpm = 200) {
  if (!text) return 1;
  const words = text.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / wpm));
}

/**
 * Map category slug to a representative emoji.
 * @param {string} category
 * @returns {string}
 */
export function getCategoryEmoji(category = '') {
  const map = {
    technology:    '💻',
    education:     '🎓',
    government:    '🏛️',
    economy:       '📈',
    science:       '🔬',
    sports:        '🏏',
    international: '🌍',
    india:         '🇮🇳',
    business:      '💼',
    jobs:          '💼',
    ai:            '🤖',
  };
  return map[category?.toLowerCase()] || '📰';
}

/**
 * Map category slug to its display label.
 * @param {string} cat
 * @returns {string}
 */
export function getCategoryLabel(cat) {
  const labels = {
    all:           'All',
    technology:    'Technology',
    education:     'Education',
    government:    'Government',
    economy:       'Economy',
    science:       'Science',
    sports:        'Sports',
    international: 'International',
    india:         'India',
    business:      'Business',
    jobs:          'Jobs',
    ai:            'AI',
  };
  return labels[cat] || cat;
}

/** Full list of category filters shown in the filter bar. */
export const CATEGORIES = [
  { id: 'all',           label: 'All',           emoji: '🗞️' },
  { id: 'india',         label: 'India',         emoji: '🇮🇳' },
  { id: 'education',     label: 'Education',     emoji: '🎓' },
  { id: 'government',    label: 'Government',    emoji: '🏛️' },
  { id: 'jobs',          label: 'Jobs',          emoji: '💼' },
  { id: 'technology',    label: 'Technology',    emoji: '💻' },
  { id: 'ai',            label: 'AI',            emoji: '🤖' },
  { id: 'economy',       label: 'Economy',       emoji: '📈' },
  { id: 'science',       label: 'Science',       emoji: '🔬' },
  { id: 'sports',        label: 'Sports',        emoji: '🏏' },
  { id: 'international', label: 'International', emoji: '🌍' },
  { id: 'business',      label: 'Business',      emoji: '📊' },
];

export const SORT_OPTIONS = [
  { value: 'publishedAt', label: 'Newest First' },
  { value: 'relevancy',   label: 'Most Relevant' },
  { value: 'popularity',  label: 'Popularity' },
];

export const DATE_OPTIONS = [
  { value: '',    label: 'Any Time' },
  { value: '1d',  label: 'Last 24 Hours' },
  { value: '7d',  label: 'Last 7 Days' },
  { value: '30d', label: 'Last 30 Days' },
];

/** Convert a "1d" | "7d" | "30d" offset to an ISO date string for the NewsAPI "from" param. */
export function dateOffsetToISO(offset) {
  if (!offset) return undefined;
  const days = parseInt(offset, 10);
  if (isNaN(days)) return undefined;
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().split('T')[0];
}

/**
 * Detect the error type from an Axios error for the ErrorState component.
 * @returns {'offline'|'rateLimit'|'generic'}
 */
export function classifyError(error) {
  if (!navigator.onLine) return 'offline';
  const status = error?.response?.status;
  if (status === 429 || status === 426) return 'rateLimit';
  return 'generic';
}

/**
 * Extract YouTube thumbnail from various YouTube URL formats.
 * @param {string} url
 * @returns {string|null}
 */
export function getYouTubeThumbnail(url) {
  if (!url || typeof url !== 'string') return null;
  try {
    const trimmed = url.trim();
    if (!trimmed) return null;
    const u = new URL(trimmed.startsWith('http') ? trimmed : `https://${trimmed}`);
    let videoId = null;
    if (u.hostname.includes('youtube.com')) {
      videoId = u.searchParams.get('v');
    } else if (u.hostname === 'youtu.be') {
      videoId = u.pathname.replace(/^\//, '');
    }
    if (videoId) {
      return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
    }
  } catch {
    return null;
  }
  return null;
}

/**
 * Resolve an article image URL.
 * Normalizes backend localhost URLs to relative /uploads so Vite dev proxy handles it directly,
 * preventing cross-origin resource policy blocks.
 * @param {string} url
 * @returns {string}
 */
export function resolveImageUrl(url) {
  if (!url || typeof url !== 'string') return '';
  const trimmed = url.trim();
  if (!trimmed) return '';

  // If localhost:5000/uploads or 127.0.0.1:5000/uploads, convert to relative /uploads
  if (/^https?:\/\/(localhost|127\.0\.0\.1):5000\/uploads\//i.test(trimmed)) {
    return trimmed.replace(/^https?:\/\/(localhost|127\.0\.0\.1):5000/i, '');
  }

  // If already absolute URL or data URL
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('data:') || trimmed.startsWith('blob:')) {
    return trimmed;
  }

  // If relative path like uploads/... or /uploads/...
  return trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
}

