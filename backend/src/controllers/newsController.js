/**
 * newsController.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Handles all news-related API logic:
 *   • Proxies requests to NewsData.io (keeps API key server-side)
 *   • In-memory TTL cache to avoid hitting rate limits
 *   • Bookmark CRUD against PostgreSQL
 *
 * Environment variables required:
 *   NEWS_API_KEY        — your NewsData.io API key
 *   NEWS_API_BASE_URL   — https://newsdata.io/api/1
 */

'use strict';

const axios = require('axios');
const { query } = require('../db/pool');

const FALLBACK_NEWS = [
  {
    url: 'https://news.google.com/',
    title: 'News feed is temporarily running in fallback mode',
    urlToImage: null,
    source: { name: 'QuizArena' },
    author: 'System',
    description: 'Configure NEWS_API_KEY and NEWS_API_BASE_URL in production to restore live news.',
    publishedAt: new Date().toISOString(),
    content: 'Live news is unavailable until the provider credentials are configured.',
  },
  {
    url: 'https://news.google.com/',
    title: 'Add NEWS_API_KEY to the backend environment',
    urlToImage: null,
    source: { name: 'QuizArena' },
    author: 'System',
    description: 'Render needs the news provider key and base URL for the backend to fetch live articles.',
    publishedAt: new Date().toISOString(),
    content: 'Set the news provider variables in the Render service environment.',
  },
];

// ── Simple in-memory TTL cache ──────────────────────────────────────────────
const cache = new Map();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

function cacheGet(key) {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.ts > CACHE_TTL_MS) {
    cache.delete(key);
    return null;
  }
  return entry.data;
}

function cacheSet(key, data) {
  cache.set(key, { ts: Date.now(), data });
}

// ── NewsData.io axios instance ────────────────────────────────────────────────
const newsApi = axios.create({
  baseURL: process.env.NEWS_API_BASE_URL || 'https://newsdata.io/api/1',
  params: { apikey: process.env.NEWS_API_KEY },
  timeout: 10_000,
});

function fallbackNewsResponse(category = null) {
  return {
    articles: FALLBACK_NEWS.map((item) => ({
      ...item,
      ...(category ? { category } : {}),
    })),
    totalResults: FALLBACK_NEWS.length,
    nextPage: null,
  };
}

// ── Category → NewsAPI query keyword map ────────────────────────────────────
const CATEGORY_QUERY_MAP = {
  technology: 'technology',
  education:  'education exam student',
  government: 'government India UPSC SSC',
  economy:    'economy finance market',
  science:    'science research NASA',
  sports:     'sports cricket IPL',
  international: 'world international',
  india:      'India',
  business:   'business startup',
  jobs:       'jobs recruitment hiring',
  ai:         'artificial intelligence AI machine learning',
};

// ── Helper: build cache key from params ─────────────────────────────────────
function buildKey(prefix, params) {
  return `${prefix}:${JSON.stringify(params)}`;
}

// ── Helper: safe NewsData call with structured error handling ─────────────────
async function callNewsApi(endpoint, params) {
  const cacheKey = buildKey(endpoint, params);
  const cached = cacheGet(cacheKey);
  if (cached) return cached;

  if (!process.env.NEWS_API_KEY) {
    return fallbackNewsResponse(params.category || null);
  }

  try {
    const { data } = await newsApi.get(endpoint, { params });

    if (data.status !== 'success') {
      return fallbackNewsResponse(params.category || null);
    }

    // Transform NewsData format into the frontend's article shape.
    const transformed = {
      totalResults: data.totalResults || 0,
      nextPage: data.nextPage,
      articles: (data.results || []).map(item => ({
        url: item.link,
        title: item.title,
        urlToImage: item.image_url,
        source: { name: item.source_id },
        author: item.creator ? item.creator.join(', ') : null,
        description: item.description,
        publishedAt: item.pubDate,
        content: item.content
      }))
    };

    cacheSet(cacheKey, transformed);
    return transformed;
  } catch (err) {
    return fallbackNewsResponse(params.category || null);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/news
// ─────────────────────────────────────────────────────────────────────────────
async function getNews(req, res, next) {
  try {
    const {
      q        = 'India',
      page, // NewsData uses string tokens for pagination, not integers
      language = 'en,hi,kn', // English, Hindi, Kannada
    } = req.query;

    const params = {
      q,
      language,
      ...(page && page !== '1' && { page }),
    };

    const data = await callNewsApi('/latest', params);
    return res.json({
      articles:    data.articles || [],
      totalResults: data.totalResults || 0,
      nextPage:    data.nextPage,
    });
  } catch (err) {
    next(err);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/news/search
// ─────────────────────────────────────────────────────────────────────────────
async function searchNews(req, res, next) {
  try {
    const { q = '', page, language = 'en,hi,kn' } = req.query;
    if (!q.trim()) return res.json({ articles: [], totalResults: 0 });

    const params = {
      q: q.trim(),
      language,
      ...(page && page !== '1' && { page }),
    };

    const data = await callNewsApi('/latest', params);
    return res.json({
      articles:    data.articles || [],
      totalResults: data.totalResults || 0,
      nextPage:    data.nextPage,
    });
  } catch (err) {
    next(err);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/news/category/:category
// ─────────────────────────────────────────────────────────────────────────────
async function getByCategory(req, res, next) {
  try {
    const { category } = req.params;
    const { page, language = 'en,hi,kn' } = req.query;

    const q = CATEGORY_QUERY_MAP[category.toLowerCase()] || category;

    const params = {
      q,
      language,
      ...(page && page !== '1' && { page }),
    };

    const data = await callNewsApi('/latest', { ...params, category });
    return res.json({
      articles:    data.articles || [],
      totalResults: data.totalResults || 0,
      category,
      nextPage:    data.nextPage,
    });
  } catch (err) {
    next(err);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/news/bookmarks  (requireAuth)
// ─────────────────────────────────────────────────────────────────────────────
async function getBookmarks(req, res, next) {
  try {
    const { rows } = await query(
      `SELECT * FROM news_bookmarks WHERE user_id = $1 ORDER BY created_at DESC`,
      [req.user.id],
    );
    return res.json({ bookmarks: rows });
  } catch (err) {
    next(err);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/news/bookmark  (requireAuth)
// Body: { newsUrl, title, imageUrl, sourceName, author, description, category, publishedAt }
// ─────────────────────────────────────────────────────────────────────────────
async function addBookmark(req, res, next) {
  try {
    const {
      newsUrl, title, imageUrl, sourceName,
      author, description, category, publishedAt,
    } = req.body;

    if (!newsUrl || !title) {
      return res.status(400).json({ error: 'newsUrl and title are required.' });
    }

    const { rows } = await query(
      `INSERT INTO news_bookmarks
         (user_id, news_url, title, image_url, source_name, author, description, category, published_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
       ON CONFLICT (user_id, news_url) DO NOTHING
       RETURNING *`,
      [req.user.id, newsUrl, title, imageUrl || null, sourceName || null,
       author || null, description || null, category || null, publishedAt || null],
    );

    if (!rows.length) {
      return res.status(409).json({ error: 'Already bookmarked.' });
    }
    return res.status(201).json({ bookmark: rows[0] });
  } catch (err) {
    next(err);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /api/news/bookmark/:id  (requireAuth)
// ─────────────────────────────────────────────────────────────────────────────
async function removeBookmark(req, res, next) {
  try {
    const { id } = req.params;
    const { rowCount } = await query(
      `DELETE FROM news_bookmarks WHERE id = $1 AND user_id = $2`,
      [id, req.user.id],
    );
    if (!rowCount) return res.status(404).json({ error: 'Bookmark not found.' });
    return res.json({ success: true });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getNews,
  searchNews,
  getByCategory,
  getBookmarks,
  addBookmark,
  removeBookmark,
};
