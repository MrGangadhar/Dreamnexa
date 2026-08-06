/**
 * newsApi.js
 * ─────────────────────────────────────────────────────────────────────────────
 * All news-related API calls — routes through our backend which serves
 * admin-created content from the database.
 */

import client from './client';

// ── News Feed ─────────────────────────────────────────────────────────────────

/**
 * Fetch paginated news feed.
 * @param {Object} params - { page, pageSize, category, type }
 */
export const fetchNews = async (params = {}) => {
  const { data } = await client.get('/news', { params });
  return data;
};

/**
 * Search news by keyword.
 * @param {Object} params - { q, page, pageSize }
 */
export const searchNews = async (params = {}) => {
  const { data } = await client.get('/news/search', { params });
  return data;
};

/**
 * Fetch news by category.
 * @param {string} category
 * @param {Object} params - { page, pageSize }
 */
export const fetchByCategory = async (category, params = {}) => {
  const { data } = await client.get(`/news/category/${category}`, { params });
  return data;
};

// ── Bookmarks ─────────────────────────────────────────────────────────────────

/** Get current user's bookmarks. */
export const getBookmarks = async () => {
  const { data } = await client.get('/news/bookmarks');
  return data.bookmarks;
};

/**
 * Add a bookmark.
 * @param {Object} article - news article object
 */
export const addBookmark = async (article) => {
  const payload = {
    newsUrl:     article.url || article.id,
    title:       article.title,
    imageUrl:    article.urlToImage,
    sourceName:  article.source?.name,
    author:      article.author,
    description: article.description,
    publishedAt: article.publishedAt,
    category:    article.category,
  };
  const { data } = await client.post('/news/bookmark', payload);
  return data.bookmark;
};

/**
 * Remove a bookmark by its DB id.
 * @param {string} id - UUID from the DB
 */
export const removeBookmark = async (id) => {
  const { data } = await client.delete(`/news/bookmark/${id}`);
  return data;
};

// ── Admin: Article CRUD ───────────────────────────────────────────────────────

/**
 * List all articles including unpublished (admin only).
 */
export const fetchAllArticles = async (params = {}) => {
  const { data } = await client.get('/admin/news', { params });
  return data.articles;
};

/**
 * Create a new article (admin only).
 * @param {Object} articleData - { title, description, content, imageUrl, category, articleType, vlogUrl, authorName, isFeatured }
 */
export const createArticle = async (articleData) => {
  const { data } = await client.post('/admin/news', articleData);
  return data.article;
};

/**
 * Update an existing article (admin only).
 * @param {string} id - Article UUID
 * @param {Object} articleData - fields to update
 */
export const updateArticle = async (id, articleData) => {
  const { data } = await client.put(`/admin/news/${id}`, articleData);
  return data.article;
};

/**
 * Delete an article (admin only).
 * @param {string} id - Article UUID
 */
export const deleteArticle = async (id) => {
  const { data } = await client.delete(`/admin/news/${id}`);
  return data;
};
