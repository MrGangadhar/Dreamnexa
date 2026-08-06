/**
 * newsController.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Handles all news-related API logic:
 *   • Serves admin-created news articles & vlogs from PostgreSQL
 *   • Supports search, category filtering, pagination
 *   • Bookmark CRUD against PostgreSQL
 *   • Admin CRUD for creating/managing articles
 *
 * No external API dependency — all content is managed by admins.
 */

'use strict';

const { query } = require('../db/pool');

// ── Default page size ──────────────────────────────────────────────────────
const DEFAULT_PAGE_SIZE = 12;

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/news
// Fetch published articles with pagination, optional category & type filter
// ─────────────────────────────────────────────────────────────────────────────
async function getNews(req, res, next) {
  try {
    const {
      page = 1,
      pageSize = DEFAULT_PAGE_SIZE,
      category,
      type,  // 'news' | 'vlog'
    } = req.query;

    const offset = (Math.max(1, parseInt(page, 10)) - 1) * parseInt(pageSize, 10);
    const limit = parseInt(pageSize, 10);

    const conditions = ['is_published = true'];
    const params = [];
    let paramIdx = 0;

    if (category && category !== 'all') {
      paramIdx++;
      conditions.push(`category = $${paramIdx}`);
      params.push(category.toLowerCase());
    }

    if (type) {
      paramIdx++;
      conditions.push(`article_type = $${paramIdx}`);
      params.push(type);
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Count total
    const countResult = await query(
      `SELECT COUNT(*)::int AS total FROM news_articles ${where}`,
      params,
    );
    const totalResults = countResult.rows[0]?.total ?? 0;

    // Fetch page
    const articlesResult = await query(
      `SELECT id, title, description, content, image_url, category,
              article_type, vlog_url, author_name, is_featured,
              created_at, updated_at
       FROM news_articles
       ${where}
       ORDER BY is_featured DESC, created_at DESC
       LIMIT $${paramIdx + 1} OFFSET $${paramIdx + 2}`,
      [...params, limit, offset],
    );

    const currentPage = Math.max(1, parseInt(page, 10));
    const totalPages = Math.ceil(totalResults / limit);

    // Transform to the frontend article shape
    const articles = articlesResult.rows.map(transformArticle);

    return res.json({
      articles,
      totalResults,
      page: currentPage,
      totalPages,
      nextPage: currentPage < totalPages ? currentPage + 1 : null,
    });
  } catch (err) {
    next(err);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/news/search
// Full-text search on title, description, content
// ─────────────────────────────────────────────────────────────────────────────
async function searchNews(req, res, next) {
  try {
    const { q = '', page = 1, pageSize = DEFAULT_PAGE_SIZE } = req.query;

    if (!q.trim()) {
      return res.json({ articles: [], totalResults: 0, page: 1, totalPages: 0 });
    }

    const offset = (Math.max(1, parseInt(page, 10)) - 1) * parseInt(pageSize, 10);
    const limit = parseInt(pageSize, 10);
    const searchTerm = q.trim();

    // Use ILIKE for simple pattern matching (works without FTS setup too)
    const searchPattern = `%${searchTerm}%`;

    const countResult = await query(
      `SELECT COUNT(*)::int AS total FROM news_articles
       WHERE is_published = true
         AND (title ILIKE $1 OR description ILIKE $1 OR content ILIKE $1)`,
      [searchPattern],
    );
    const totalResults = countResult.rows[0]?.total ?? 0;

    const articlesResult = await query(
      `SELECT id, title, description, content, image_url, category,
              article_type, vlog_url, author_name, is_featured,
              created_at, updated_at
       FROM news_articles
       WHERE is_published = true
         AND (title ILIKE $1 OR description ILIKE $1 OR content ILIKE $1)
       ORDER BY is_featured DESC, created_at DESC
       LIMIT $2 OFFSET $3`,
      [searchPattern, limit, offset],
    );

    const currentPage = Math.max(1, parseInt(page, 10));
    const totalPages = Math.ceil(totalResults / limit);

    return res.json({
      articles: articlesResult.rows.map(transformArticle),
      totalResults,
      page: currentPage,
      totalPages,
      nextPage: currentPage < totalPages ? currentPage + 1 : null,
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
    const { page = 1, pageSize = DEFAULT_PAGE_SIZE } = req.query;

    const offset = (Math.max(1, parseInt(page, 10)) - 1) * parseInt(pageSize, 10);
    const limit = parseInt(pageSize, 10);

    const countResult = await query(
      `SELECT COUNT(*)::int AS total FROM news_articles
       WHERE is_published = true AND category = $1`,
      [category.toLowerCase()],
    );
    const totalResults = countResult.rows[0]?.total ?? 0;

    const articlesResult = await query(
      `SELECT id, title, description, content, image_url, category,
              article_type, vlog_url, author_name, is_featured,
              created_at, updated_at
       FROM news_articles
       WHERE is_published = true AND category = $1
       ORDER BY is_featured DESC, created_at DESC
       LIMIT $2 OFFSET $3`,
      [category.toLowerCase(), limit, offset],
    );

    const currentPage = Math.max(1, parseInt(page, 10));
    const totalPages = Math.ceil(totalResults / limit);

    return res.json({
      articles: articlesResult.rows.map(transformArticle),
      totalResults,
      category,
      page: currentPage,
      totalPages,
      nextPage: currentPage < totalPages ? currentPage + 1 : null,
    });
  } catch (err) {
    next(err);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN: POST /api/news/articles  (requireAuth + requireAdmin)
// Create a new news article or vlog
// ─────────────────────────────────────────────────────────────────────────────
async function createArticle(req, res, next) {
  try {
    const {
      title, description, content, imageUrl, category = 'general',
      articleType = 'news', vlogUrl, authorName, isFeatured = false,
    } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Title is required.' });
    }

    if (articleType === 'vlog' && !vlogUrl) {
      return res.status(400).json({ error: 'Vlog URL is required for vlog articles.' });
    }

    const result = await query(
      `INSERT INTO news_articles
         (title, description, content, image_url, category, article_type,
          vlog_url, author_name, is_featured, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [title, description || null, content || null, imageUrl || null,
       category.toLowerCase(), articleType, vlogUrl || null,
       authorName || null, isFeatured, req.user.id],
    );

    return res.status(201).json({ article: result.rows[0] });
  } catch (err) {
    next(err);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN: PUT /api/news/articles/:id  (requireAuth + requireAdmin)
// Update an existing article
// ─────────────────────────────────────────────────────────────────────────────
async function updateArticle(req, res, next) {
  try {
    const { id } = req.params;
    const {
      title, description, content, imageUrl, category,
      articleType, vlogUrl, authorName, isPublished, isFeatured,
    } = req.body;

    const result = await query(
      `UPDATE news_articles SET
         title        = COALESCE($1, title),
         description  = COALESCE($2, description),
         content      = COALESCE($3, content),
         image_url    = COALESCE($4, image_url),
         category     = COALESCE($5, category),
         article_type = COALESCE($6, article_type),
         vlog_url     = COALESCE($7, vlog_url),
         author_name  = COALESCE($8, author_name),
         is_published = COALESCE($9, is_published),
         is_featured  = COALESCE($10, is_featured),
         updated_at   = now()
       WHERE id = $11
       RETURNING *`,
      [title, description, content, imageUrl,
       category ? category.toLowerCase() : null,
       articleType, vlogUrl, authorName,
       isPublished, isFeatured, id],
    );

    if (!result.rows[0]) {
      return res.status(404).json({ error: 'Article not found.' });
    }

    return res.json({ article: result.rows[0] });
  } catch (err) {
    next(err);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN: DELETE /api/news/articles/:id  (requireAuth + requireAdmin)
// Hard-delete an article
// ─────────────────────────────────────────────────────────────────────────────
async function deleteArticle(req, res, next) {
  try {
    const { id } = req.params;
    const { rowCount } = await query(
      `DELETE FROM news_articles WHERE id = $1`,
      [id],
    );

    if (!rowCount) {
      return res.status(404).json({ error: 'Article not found.' });
    }

    return res.json({ success: true, message: 'Article deleted.' });
  } catch (err) {
    next(err);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN: GET /api/news/articles/all  (requireAuth + requireAdmin)
// List ALL articles including unpublished, for admin management
// ─────────────────────────────────────────────────────────────────────────────
async function listAllArticles(req, res, next) {
  try {
    const { page = 1, pageSize = 50 } = req.query;
    const offset = (Math.max(1, parseInt(page, 10)) - 1) * parseInt(pageSize, 10);
    const limit = parseInt(pageSize, 10);

    const result = await query(
      `SELECT na.*, u.username AS created_by_username
       FROM news_articles na
       LEFT JOIN users u ON u.id = na.created_by
       ORDER BY na.created_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset],
    );

    return res.json({ articles: result.rows });
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

// ── Helper: transform DB row to frontend article shape ────────────────────
function transformArticle(row) {
  return {
    id:          row.id,
    url:         `/news/${row.id}`,  // internal link
    title:       row.title,
    description: row.description,
    content:     row.content,
    urlToImage:  row.image_url,
    source:      { name: row.author_name || 'DreamNexa' },
    author:      row.author_name,
    publishedAt: row.created_at,
    category:    row.category,
    articleType:  row.article_type,
    vlogUrl:     row.vlog_url,
    isFeatured:  row.is_featured,
  };
}

module.exports = {
  getNews,
  searchNews,
  getByCategory,
  createArticle,
  updateArticle,
  deleteArticle,
  listAllArticles,
  getBookmarks,
  addBookmark,
  removeBookmark,
};
