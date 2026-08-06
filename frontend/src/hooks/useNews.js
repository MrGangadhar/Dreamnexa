/**
 * useNews.js
 * ─────────────────────────────────────────────────────────────────────────────
 * React Query hooks for the news feature.
 *
 * Hooks exported:
 *   useNews(params)              — paginated news feed
 *   useNewsSearch(q, params)     — debounced search
 *   useNewsCategory(cat)         — category feed
 *   useBookmarks()               — user bookmark list (requires auth)
 *   useAddBookmark()             — mutation to add
 *   useRemoveBookmark()          — mutation to remove
 *   useInfiniteNews(params)      — infinite-scroll variant
 *   useAllArticles()             — admin: all articles
 *   useCreateArticle()           — admin: create mutation
 *   useUpdateArticle()           — admin: update mutation
 *   useDeleteArticle()           — admin: delete mutation
 */

import { useQuery, useMutation, useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo, useState, useEffect } from 'react';
import {
  fetchNews,
  searchNews,
  fetchByCategory,
  getBookmarks,
  addBookmark,
  removeBookmark,
  fetchAllArticles,
  createArticle,
  updateArticle,
  deleteArticle,
} from '../api/newsApi';

// ── Query keys ────────────────────────────────────────────────────────────────
export const newsKeys = {
  all:         ['news'],
  feed:        (params) => ['news', 'feed', params],
  search:      (q, params) => ['news', 'search', q, params],
  category:    (cat, params) => ['news', 'category', cat, params],
  bookmarks:   () => ['news', 'bookmarks'],
  infinite:    (params) => ['news', 'infinite', params],
  adminAll:    () => ['news', 'admin', 'all'],
};

// ── useNews ───────────────────────────────────────────────────────────────────
/**
 * Fetch a paginated news feed.
 * @param {Object} params - { page, pageSize, category, type }
 */
export function useNews(params = {}) {
  return useQuery({
    queryKey:  newsKeys.feed(params),
    queryFn:   () => fetchNews(params),
    staleTime: 5 * 60 * 1000,   // 5-min cache
    retry:     2,
    placeholderData: (prev) => prev,
  });
}

// ── useNewsSearch ─────────────────────────────────────────────────────────────
/**
 * Debounced news search.
 * @param {string} query
 * @param {Object} params - extra params
 * @param {number} debounceMs - delay in ms (default 400)
 */
export function useNewsSearch(query, params = {}, debounceMs = 400) {
  const [debouncedQ, setDebouncedQ] = useState(query);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQ(query), debounceMs);
    return () => clearTimeout(timer);
  }, [query, debounceMs]);

  return useQuery({
    queryKey:  newsKeys.search(debouncedQ, params),
    queryFn:   () => searchNews({ q: debouncedQ, ...params }),
    enabled:   debouncedQ.trim().length > 0,
    staleTime: 3 * 60 * 1000,
    retry:     1,
    placeholderData: (prev) => prev,
  });
}

// ── useNewsCategory ───────────────────────────────────────────────────────────
/**
 * Fetch news for a specific category.
 * @param {string} category
 * @param {Object} params - { page, pageSize }
 */
export function useNewsCategory(category, params = {}) {
  return useQuery({
    queryKey:  newsKeys.category(category, params),
    queryFn:   () => fetchByCategory(category, params),
    enabled:   !!category && category !== 'all',
    staleTime: 5 * 60 * 1000,
    retry:     2,
    placeholderData: (prev) => prev,
  });
}

// ── useInfiniteNews ───────────────────────────────────────────────────────────
/**
 * Infinite-scroll variant of the news feed.
 * Uses page numbers for pagination (DB-backed).
 * @param {Object} params - { pageSize, category }
 */
export function useInfiniteNews(params = {}) {
  const { category, ...rest } = params;

  return useInfiniteQuery({
    queryKey: newsKeys.infinite(params),
    queryFn: ({ pageParam = 1 }) => {
      if (category && category !== 'all') {
        return fetchByCategory(category, { ...rest, page: pageParam });
      }
      return fetchNews({ ...rest, page: pageParam });
    },
    getNextPageParam: (lastPage) => {
      // Backend returns nextPage as an integer or null
      return lastPage.nextPage || undefined;
    },
    staleTime: 5 * 60 * 1000,
    retry:     2,
  });
}

// ── useBookmarks ──────────────────────────────────────────────────────────────
/** Fetch the logged-in user's bookmarks. */
export function useBookmarks(enabled = true) {
  return useQuery({
    queryKey: newsKeys.bookmarks(),
    queryFn:  getBookmarks,
    enabled,
    staleTime: 60 * 1000,
    retry:     1,
  });
}

/**
 * Returns a Set of bookmarked URLs for quick O(1) lookup.
 * @param {Array} bookmarks
 */
export function useBookmarkUrlSet(bookmarks = []) {
  return useMemo(() => new Set(bookmarks.map((b) => b.news_url)), [bookmarks]);
}

/**
 * Returns a Map from news_url to bookmark DB id for deletion.
 * @param {Array} bookmarks
 */
export function useBookmarkIdMap(bookmarks = []) {
  return useMemo(() => {
    const m = new Map();
    bookmarks.forEach((b) => m.set(b.news_url, b.id));
    return m;
  }, [bookmarks]);
}

// ── useAddBookmark ────────────────────────────────────────────────────────────
/** Mutation: add a bookmark. Optimistically updates the cache. */
export function useAddBookmark() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: addBookmark,
    onSuccess: () => qc.invalidateQueries({ queryKey: newsKeys.bookmarks() }),
  });
}

// ── useRemoveBookmark ─────────────────────────────────────────────────────────
/** Mutation: remove a bookmark by its DB UUID. */
export function useRemoveBookmark() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: removeBookmark,
    onSuccess: () => qc.invalidateQueries({ queryKey: newsKeys.bookmarks() }),
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// ADMIN HOOKS
// ═══════════════════════════════════════════════════════════════════════════════

/** Admin: fetch all articles (including unpublished). */
export function useAllArticles(enabled = true) {
  return useQuery({
    queryKey: newsKeys.adminAll(),
    queryFn:  fetchAllArticles,
    enabled,
    staleTime: 30 * 1000,
    retry: 1,
  });
}

/** Admin: create a new article. */
export function useCreateArticle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createArticle,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: newsKeys.adminAll() });
      qc.invalidateQueries({ queryKey: newsKeys.all });
    },
  });
}

/** Admin: update an existing article. */
export function useUpdateArticle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }) => updateArticle(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: newsKeys.adminAll() });
      qc.invalidateQueries({ queryKey: newsKeys.all });
    },
  });
}

/** Admin: delete an article. */
export function useDeleteArticle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteArticle,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: newsKeys.adminAll() });
      qc.invalidateQueries({ queryKey: newsKeys.all });
    },
  });
}
