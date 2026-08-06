/**
 * News.jsx — /news route
 * ─────────────────────────────────────────────────────────────────────────────
 * Full-featured news page showing admin-created articles & vlogs:
 *   1. Breaking news carousel (featured articles with images)
 *   2. Search bar (debounced)
 *   3. Category filter pills + Sort / Date / Language selects
 *   4. Infinite-scroll news grid with skeleton loaders
 *   5. Bookmark, Share, Detail modal
 *   6. Back-to-top FAB
 *   7. Dark mode toggle
 *   8. Dynamic SEO meta tags
 *   9. Error boundary states
 *
 * State is local (not Redux) — React Query handles all server state.
 */

import React, {
  useState, useCallback, useEffect, useRef,
} from 'react';
import toast from 'react-hot-toast';
import {
  FiSearch, FiRefreshCw, FiX, FiMoon, FiSun, FiChevronUp,
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

/* ── Local imports ─────────────────────────────────────────────────────────── */
import { useInfiniteNews, useNewsSearch, useBookmarks, useAddBookmark, useRemoveBookmark, useBookmarkUrlSet, useBookmarkIdMap } from '../hooks/useNews';
import { classifyError } from '../utils/newsUtils';
import { useAuth } from '../context/AuthContext';

import BreakingNewsCarousel from '../components/news/BreakingNewsCarousel';
import NewsCard             from '../components/news/NewsCard';
import NewsCardSkeleton     from '../components/news/NewsCardSkeleton';
import NewsFilters          from '../components/news/NewsFilters';
import ShareModal           from '../components/news/ShareModal';
import NewsDetailModal      from '../components/news/NewsDetailModal';
import ErrorState           from '../components/news/ErrorState';

import '../styles/news.css';

// ── Default filter state ───────────────────────────────────────────────────
const DEFAULT_FILTERS = {
  category:  'all',
};

// ── News Page ──────────────────────────────────────────────────────────────
export default function News({ defaultCategory = 'all' }) {
  const { user } = useAuth();

  /* Filter / search state */
  const [filters,      setFilters]      = useState({ ...DEFAULT_FILTERS, category: defaultCategory });
  const [searchQuery,  setSearchQuery]  = useState('');

  /* UI state */
  const [darkMode,     setDarkMode]     = useState(() =>
    typeof window !== 'undefined' && document.documentElement.getAttribute('data-theme') === 'dark'
  );
  const [shareArticle, setShareArticle] = useState(null);
  const [detailArticle,setDetailArticle]= useState(null);
  const [showScrollTop,setShowScrollTop]= useState(false);

  /* Infinite scroll sentinel */
  const sentinelRef = useRef(null);

  /* ── Page title for SEO ─────────────────────────────────────────────── */
  useEffect(() => {
    document.title = 'Latest News | DreamNexa — Exam Prep & Current Affairs';
    return () => { document.title = 'DreamNexa'; };
  }, []);

  /* ── Dark mode effect ─────────────────────────────────────────────────── */
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  /* ── Scroll-to-top button visibility ─────────────────────────────────── */
  useEffect(() => {
    const handler = () => setShowScrollTop(window.scrollY > 400);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  /* ── Build infinite query params ────────────────────────────────────── */
  const infiniteParams = {
    category:  filters.category !== 'all' ? filters.category : undefined,
    pageSize:  12,
  };

  const infiniteQuery = useInfiniteNews(infiniteParams);

  /* ── Debounced search query ─────────────────────────────────────────── */
  const searchQueryResult = useNewsSearch(searchQuery, { pageSize: 12 }, 400);

  /* Detect active mode */
  const activeSearch = searchQuery.trim().length > 0;
  const query       = activeSearch ? searchQueryResult : infiniteQuery;
  const isInfinite  = !activeSearch;

  /* Flatten paginated results */
  const articles = isInfinite
    ? (infiniteQuery.data?.pages?.flatMap((p) => p.articles) ?? [])
    : (searchQueryResult.data?.articles ?? []);

  const totalResults = isInfinite
    ? (infiniteQuery.data?.pages?.[0]?.totalResults ?? 0)
    : (searchQueryResult.data?.totalResults ?? 0);

  /* ── Bookmarks ──────────────────────────────────────────────────────── */
  const { data: bookmarks = [] } = useBookmarks(!!user);
  const bookmarkUrlSet  = useBookmarkUrlSet(bookmarks);
  const bookmarkIdMap   = useBookmarkIdMap(bookmarks);
  const addBookmark     = useAddBookmark();
  const removeBookmark  = useRemoveBookmark();

  const handleToggleBookmark = useCallback(async (article) => {
    if (!user) {
      toast.error('Please log in to bookmark articles.');
      return;
    }
    const url = article.url || article.id;
    if (bookmarkUrlSet.has(url)) {
      const id = bookmarkIdMap.get(url);
      await removeBookmark.mutateAsync(id);
      toast.success('Bookmark removed.');
    } else {
      await addBookmark.mutateAsync(article);
      toast.success('Article bookmarked! 🔖');
    }
  }, [user, bookmarkUrlSet, bookmarkIdMap, addBookmark, removeBookmark]);

  /* ── Infinite scroll observer ───────────────────────────────────────── */
  useEffect(() => {
    if (!isInfinite || !sentinelRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && infiniteQuery.hasNextPage && !infiniteQuery.isFetchingNextPage) {
          infiniteQuery.fetchNextPage();
        }
      },
      { rootMargin: '200px' }
    );
    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [isInfinite, infiniteQuery]);

  /* ── Filter change handler ──────────────────────────────────────────── */
  const handleFilterChange = useCallback((delta) => {
    setFilters((prev) => ({ ...prev, ...delta }));
  }, []);

  /* ── Refresh ────────────────────────────────────────────────────────── */
  const handleRefresh = () => {
    infiniteQuery.refetch();
    searchQueryResult.refetch();
    toast.success('News refreshed!');
  };

  /* ── Error classification ───────────────────────────────────────────── */
  const error = query.error;
  const errorType = error ? classifyError(error) : null;

  /* ── Carousel articles (featured or first 5 with images) ─────────────*/
  const carouselArticles = articles
    .filter((a) => a.urlToImage)
    .sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0))
    .slice(0, 5);

  /* ── Skeleton count ─────────────────────────────────────────────────── */
  const skeletonCount = 9;

  /* ── Related articles for detail modal ─────────────────────────────── */
  const getRelated = (current) =>
    articles.filter((a) => (a.url || a.id) !== (current?.url || current?.id)).slice(0, 4);

  return (
    <>
      <div className="news-page">
        <div className="container">

          {/* ── Page Header ─────────────────────────────────────────────── */}
          <div className="news-header">
            <div className="news-header-top">
              <div>
                <h1>📰 Latest News</h1>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>
                  Curated for competitive exam aspirants
                </p>
              </div>
              <div className="news-header-actions">
                <button
                  className={`news-refresh-btn ${query.isFetching ? 'spinning' : ''}`}
                  onClick={handleRefresh}
                  title="Refresh news"
                >
                  <FiRefreshCw size={13} />
                  {query.isFetching ? 'Refreshing…' : 'Refresh'}
                </button>
                <button
                  className="dark-toggle-btn"
                  onClick={() => setDarkMode((d) => !d)}
                  title="Toggle dark mode"
                  aria-label="Toggle dark mode"
                >
                  {darkMode ? <FiSun size={15} /> : <FiMoon size={15} />}
                </button>
              </div>
            </div>

            {/* Search */}
            <div className="news-search-wrap">
              <FiSearch className="search-icon" />
              <input
                id="news-search"
                className="news-search-input"
                type="search"
                placeholder="Search news, topics, sources…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Search news"
              />
              {searchQuery && (
                <button
                  className="news-search-clear"
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear search"
                >
                  <FiX size={14} />
                </button>
              )}
            </div>
          </div>

          {/* ── Filters ─────────────────────────────────────────────────── */}
          {!activeSearch && (
            <NewsFilters filters={filters} onChange={handleFilterChange} />
          )}

          {/* ── Breaking Carousel ────────────────────────────────────────── */}
          {!activeSearch && !query.isLoading && carouselArticles.length > 0 && (
            <BreakingNewsCarousel
              articles={carouselArticles}
              onCardClick={setDetailArticle}
            />
          )}

          {/* ── Stats bar ────────────────────────────────────────────────── */}
          {!query.isLoading && !error && articles.length > 0 && (
            <div className="news-stats-bar">
              <span>
                {activeSearch
                  ? `${totalResults.toLocaleString()} results for "${searchQuery}"`
                  : `${articles.length} articles loaded`}
              </span>
              {activeSearch && (
                <button
                  className="news-refresh-btn"
                  onClick={() => setSearchQuery('')}
                  style={{ fontSize: 12, padding: '5px 12px' }}
                >
                  <FiX size={12} /> Clear search
                </button>
              )}
            </div>
          )}

          {/* ── Error state ──────────────────────────────────────────────── */}
          {error && (
            <ErrorState
              type={errorType}
              onRetry={() => { infiniteQuery.refetch(); searchQueryResult.refetch(); }}
            />
          )}

          {/* ── No results ───────────────────────────────────────────────── */}
          {!query.isLoading && !error && articles.length === 0 && (
            <ErrorState type="noResults" />
          )}

          {/* ── News Grid ────────────────────────────────────────────────── */}
          {!error && (
            <div className="news-grid">
              {/* Skeleton loaders */}
              {query.isLoading &&
                Array.from({ length: skeletonCount }).map((_, i) => (
                  <NewsCardSkeleton key={i} />
                ))
              }

              {/* Article cards */}
              <AnimatePresence>
                {articles.map((article, index) => (
                  <NewsCard
                    key={article.id || article.url || index}
                    article={article}
                    isBookmarked={bookmarkUrlSet.has(article.url || article.id)}
                    category={filters.category !== 'all' ? filters.category : article.category}
                    onBookmark={() => handleToggleBookmark(article)}
                    onShare={() => setShareArticle(article)}
                    onClick={() => setDetailArticle({ ...article, _category: filters.category })}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}

          {/* ── Infinite scroll sentinel ──────────────────────────────────── */}
          {isInfinite && (
            <div ref={sentinelRef} className="load-more-trigger" />
          )}

          {/* ── Fetch next page loading indicator ────────────────────────── */}
          {isInfinite && infiniteQuery.isFetchingNextPage && (
            <div className="news-grid" style={{ marginTop: 20 }}>
              {Array.from({ length: 3 }).map((_, i) => (
                <NewsCardSkeleton key={`more-${i}`} />
              ))}
            </div>
          )}

          {/* ── Load more button fallback ─────────────────────────────────── */}
          {isInfinite && infiniteQuery.hasNextPage && !infiniteQuery.isFetchingNextPage && (
            <div style={{ textAlign: 'center', marginTop: 32 }}>
              <button
                className="load-more-btn"
                onClick={() => infiniteQuery.fetchNextPage()}
              >
                Load More Articles
              </button>
            </div>
          )}

          {/* ── All articles loaded ───────────────────────────────────────── */}
          {isInfinite && !infiniteQuery.hasNextPage && articles.length > 0 && (
            <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '32px 0', fontSize: 13 }}>
              ✓ You've reached the end — all articles loaded.
            </p>
          )}

        </div>
      </div>

      {/* ── Share Modal ──────────────────────────────────────────────────── */}
      {shareArticle && (
        <ShareModal
          article={shareArticle}
          onClose={() => setShareArticle(null)}
        />
      )}

      {/* ── Detail Modal ─────────────────────────────────────────────────── */}
      {detailArticle && (
        <NewsDetailModal
          article={detailArticle}
          isBookmarked={bookmarkUrlSet.has(detailArticle.url || detailArticle.id)}
          onBookmark={() => handleToggleBookmark(detailArticle)}
          onShare={() => {
            setDetailArticle(null);
            setShareArticle(detailArticle);
          }}
          onClose={() => setDetailArticle(null)}
          relatedArticles={getRelated(detailArticle)}
        />
      )}

      {/* ── Back to top FAB ──────────────────────────────────────────────── */}
      {showScrollTop && (
        <motion.button
          className="back-to-top"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0 }}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          aria-label="Back to top"
        >
          <FiChevronUp size={20} />
        </motion.button>
      )}
    </>
  );
}
