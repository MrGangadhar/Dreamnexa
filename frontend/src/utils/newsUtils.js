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
 * Extract YouTube 11-character video ID from any YouTube URL format:
 * - https://www.youtube.com/watch?v=VIDEO_ID
 * - https://youtu.be/VIDEO_ID?si=...
 * - https://www.youtube.com/shorts/VIDEO_ID
 * - https://www.youtube.com/live/VIDEO_ID
 * - https://www.youtube.com/embed/VIDEO_ID
 * - https://m.youtube.com/watch?v=VIDEO_ID
 * - Plain 11-char ID
 * @param {string} url
 * @returns {string|null}
 */
export function getYouTubeVideoId(url) {
  if (!url || typeof url !== 'string') return null;
  const trimmed = url.trim();
  if (!trimmed || trimmed.toUpperCase() === 'NA' || trimmed === 'null' || trimmed === 'undefined') {
    return null;
  }

  // Common regex matching standard, share, shorts, live, and embed links
  const patterns = [
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|shorts\/|live\/|watch\?v=|watch\?.+&v=))([\w-]{11})/i,
    /^[a-zA-Z0-9_-]{11}$/,
  ];

  for (const p of patterns) {
    const match = trimmed.match(p);
    if (match && match[1]) return match[1];
    if (match && !match[1] && match[0].length === 11) return match[0];
  }

  // Backup URL parser
  try {
    const u = new URL(trimmed.startsWith('http') ? trimmed : `https://${trimmed}`);
    if (u.searchParams.has('v')) return u.searchParams.get('v');
    const pathParts = u.pathname.split('/').filter(Boolean);
    if (u.hostname === 'youtu.be' && pathParts.length > 0) return pathParts[0].split('?')[0];
    if (pathParts.includes('shorts') || pathParts.includes('embed') || pathParts.includes('live')) {
      const idx = Math.max(pathParts.indexOf('shorts'), pathParts.indexOf('embed'), pathParts.indexOf('live'));
      if (pathParts[idx + 1]) return pathParts[idx + 1].split('?')[0];
    }
  } catch {}

  return null;
}

/**
 * Extract YouTube thumbnail from various YouTube URL formats.
 * Uses Google's fast i.ytimg.com CDN which supports no-referrer and edge caching.
 * @param {string} url
 * @param {'hq'|'mq'|'maxres'} [quality='hq']
 * @returns {string|null}
 */
export function getYouTubeThumbnail(url, quality = 'hq') {
  const videoId = getYouTubeVideoId(url);
  if (!videoId) return null;
  const file = quality === 'maxres' ? 'maxresdefault.jpg' : quality === 'mq' ? 'mqdefault.jpg' : 'hqdefault.jpg';
  return `https://i.ytimg.com/vi/${videoId}/${file}`;
}

/**
 * Generate a clean YouTube embed URL from any YouTube URL format.
 * @param {string} url
 * @returns {string|null}
 */
export function getYouTubeEmbedUrl(url) {
  const videoId = getYouTubeVideoId(url);
  if (!videoId) return null;
  return `https://www.youtube.com/embed/${videoId}`;
}

/**
 * Curated high-resolution, reliable CDN imagery for articles and vlogs when an uploaded
 * image is missing (e.g. 404 from ephemeral Cloud Run container) or when no image was supplied.
 * @param {string} [category='']
 * @param {boolean} [isVlog=false]
 * @returns {string}
 */
export function getCategoryFallbackImage(category = '', isVlog = false) {
  const cat = (category || '').toLowerCase();

  if (isVlog) {
    if (cat === 'jobs' || cat === 'government') {
      // Karnataka / State / Central Govt recruitment & guidance vlog
      return 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&auto=format&fit=crop&q=80';
    }
    if (cat === 'education') {
      // Online masterclass, quiz tactics, syllabus walkthrough
      return 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80';
    }
    if (cat === 'technology' || cat === 'ai') {
      return 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80';
    }
    // Default video guidance / educational vlog cover
    return 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&auto=format&fit=crop&q=80';
  }

  // General news category fallbacks
  switch (cat) {
    case 'jobs':
    case 'government':
      return 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&auto=format&fit=crop&q=80';
    case 'education':
      return 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800&auto=format&fit=crop&q=80';
    case 'technology':
    case 'ai':
      return 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80';
    case 'economy':
    case 'business':
      return 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=80';
    case 'science':
      return 'https://images.unsplash.com/photo-1507668077129-56e32842fceb?w=800&auto=format&fit=crop&q=80';
    case 'sports':
      return 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?w=800&auto=format&fit=crop&q=80';
    default:
      return 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&auto=format&fit=crop&q=80';
  }
}

/**
 * Resolve an article image URL.
 * Normalizes backend localhost URLs to relative /uploads so Vite dev proxy handles it directly,
 * preventing cross-origin resource policy blocks.
 * Filters out invalid/placeholder strings like 'NA', 'null', 'undefined'.
 * @param {string} url
 * @returns {string}
 */
export function resolveImageUrl(url) {
  if (!url || typeof url !== 'string') return '';
  const trimmed = url.trim();
  if (!trimmed || trimmed.toUpperCase() === 'NA' || trimmed === 'null' || trimmed === 'undefined') {
    return '';
  }

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

/**
 * Resolves the best available thumbnail for any news article or vlog.
 * Guarantees a working thumbnail for vlogs and articles even if user-uploaded images
 * are missing or 404 from ephemeral Cloud Run containers.
 * @param {Object} article
 * @returns {string}
 */
export function resolveArticleThumbnail(article) {
  if (!article) return '';
  const isVlog = article.articleType === 'vlog' || article.article_type === 'vlog';
  const vlogUrl = article.vlogUrl || article.vlog_url;
  const rawImage = article.urlToImage || article.image_url || article.imageUrl;

  // 1. If it's a vlog and has a valid YouTube URL, prefer the real YouTube thumbnail
  const ytThumb = isVlog ? getYouTubeThumbnail(vlogUrl) : null;
  if (ytThumb) return ytThumb;

  // 2. If a custom uploaded image exists and is not an invalid/placeholder string
  const resolvedImg = resolveImageUrl(rawImage);
  if (resolvedImg) return resolvedImg;

  // 3. Fallback to curated image for the category
  return getCategoryFallbackImage(article.category, isVlog);
}

