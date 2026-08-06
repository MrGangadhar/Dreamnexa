/**
 * newsRoutes.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Express router for the /api/news namespace.
 *
 * Public endpoints:
 *   GET  /api/news                    — latest news feed (paginated)
 *   GET  /api/news/search             — keyword search
 *   GET  /api/news/category/:category — category filter
 *
 * Protected endpoints (JWT required):
 *   GET    /api/news/bookmarks        — list user's bookmarks
 *   POST   /api/news/bookmark         — add bookmark
 *   DELETE /api/news/bookmark/:id     — remove bookmark
 *
 * Admin endpoints (JWT + admin role required):
 *   GET    /api/news/articles/all     — list all articles (incl. unpublished)
 *   POST   /api/news/articles         — create article
 *   PUT    /api/news/articles/:id     — update article
 *   DELETE /api/news/articles/:id     — delete article
 */

'use strict';

const express = require('express');
const rateLimit = require('express-rate-limit');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const nc = require('../controllers/newsController');

const router = express.Router();

// Rate limiter: 60 news API requests per minute per IP
const newsLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  message: { error: 'Too many requests. Please slow down.' },
});

// ── Public ────────────────────────────────────────────────────────────────────
router.get('/',                  newsLimiter, nc.getNews);
router.get('/search',            newsLimiter, nc.searchNews);
router.get('/category/:category',newsLimiter, nc.getByCategory);

// ── Protected (JWT) ───────────────────────────────────────────────────────────
router.get(   '/bookmarks',      requireAuth, nc.getBookmarks);
router.post(  '/bookmark',       requireAuth, nc.addBookmark);
router.delete('/bookmark/:id',   requireAuth, nc.removeBookmark);

// ── Admin (JWT + admin role) ──────────────────────────────────────────────────
router.get(   '/articles/all',   requireAuth, requireAdmin, nc.listAllArticles);
router.post(  '/articles',       requireAuth, requireAdmin, nc.createArticle);
router.put(   '/articles/:id',   requireAuth, requireAdmin, nc.updateArticle);
router.delete('/articles/:id',   requireAuth, requireAdmin, nc.deleteArticle);

module.exports = router;
