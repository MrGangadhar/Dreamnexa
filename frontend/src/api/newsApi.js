/**
 * newsApi.js
 * ─────────────────────────────────────────────────────────────────────────────
 * All news-related API calls — routes through our backend proxy
 * so the NewsAPI key stays server-side.
 */

import client from './client';

// ── News Feed ─────────────────────────────────────────────────────────────────

/**
 * Fetch paginated news feed.
 * @param {Object} params - { q, page, pageSize, sortBy, from, to }
 */
export const fetchNews = async (params = {}) => {
  const { data } = await client.get('/news', { params });
  return data;
};

/**
 * Search news by keyword.
 * @param {Object} params - { q, page, pageSize, sortBy }
 */
export const searchNews = async (params = {}) => {
  const { data } = await client.get('/news/search', { params });
  return data;
};

/**
 * Fetch news by category.
 * @param {string} category
 * @param {Object} params - { page, pageSize, sortBy }
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
    newsUrl:     article.url,
    title:       article.title,
    imageUrl:    article.urlToImage,
    sourceName:  article.source?.name,
    author:      article.author,
    description: article.description,
    publishedAt: article.publishedAt,
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
