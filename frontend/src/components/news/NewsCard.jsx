/**
 * NewsCard.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Premium news article card with:
 *   - Lazy-loaded image with fallback emoji
 *   - Source favicon + name, publish date
 *   - Category badge (top-left on image)
 *   - Title (2-line clamp) + description (2-line clamp)
 *   - Author + estimated read time
 *   - Footer: Share | Bookmark | Read Full Article
 *
 * Hover: card lifts + image zooms (CSS transition).
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiShare2, FiBookmark, FiUser, FiClock, FiExternalLink } from 'react-icons/fi';
import { FaBookmark } from 'react-icons/fa';
import { formatDistanceToNow } from '../../utils/dateUtils';
import { estimateReadTime, getCategoryEmoji, getCategoryLabel } from '../../utils/newsUtils';

function getSourceFavicon(url) {
  try {
    const domain = new URL(url).hostname;
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
  } catch {
    return null;
  }
}

const cardVariants = {
  hidden:  { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
};

/**
 * @param {Object}   article      — news article
 * @param {boolean}  isBookmarked — current bookmark state
 * @param {Function} onBookmark   — toggle bookmark
 * @param {Function} onShare      — open share modal
 * @param {Function} onClick      — open detail modal
 * @param {string}   [category]   — active category for badge color
 */
export default function NewsCard({
  article,
  isBookmarked = false,
  onBookmark,
  onShare,
  onClick,
  category,
}) {
  const [imgError, setImgError] = useState(false);

  const readTime    = estimateReadTime(article.content || article.description || '');
  const publishedAgo = formatDistanceToNow(article.publishedAt);
  const favicon     = article.url ? getSourceFavicon(article.url) : null;
  const categoryLabel = getCategoryLabel(category || '');
  const emoji        = getCategoryEmoji(category);
  const showCategory = category && category !== 'all';

  return (
    <motion.article
      className="news-card"
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter') onClick?.(); }}
    >
      {/* ── Image ──────────────────────────────────────────────── */}
      <div className="news-card-img-wrap">
        {article.urlToImage && !imgError ? (
          <img
            src={article.urlToImage}
            alt={article.title}
            loading="lazy"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="news-card-img-fallback">{emoji}</div>
        )}
        {showCategory && (
          <span className="news-card-category-badge">{categoryLabel}</span>
        )}
      </div>

      {/* ── Body ───────────────────────────────────────────────── */}
      <div className="news-card-body">
        {/* Source + Date */}
        <div className="news-card-source-row">
          <div className="news-card-source">
            {favicon && (
              <img
                src={favicon}
                alt=""
                className="source-logo"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            )}
            <span className="source-name">{article.source?.name || 'Unknown Source'}</span>
          </div>
          <span className="news-card-date">{publishedAgo}</span>
        </div>

        {/* Title */}
        <h2 className="news-card-title">{article.title}</h2>

        {/* Description */}
        {article.description && (
          <p className="news-card-desc">{article.description}</p>
        )}

        {/* Author + Read time */}
        <div className="news-card-author-row">
          {article.author && (
            <span className="news-card-author">
              <FiUser size={11} />
              {article.author}
            </span>
          )}
          <span className="news-card-read-time">
            <FiClock size={11} />
            {readTime} min read
          </span>
        </div>

        {/* Footer actions */}
        <div className="news-card-footer" onClick={(e) => e.stopPropagation()}>
          <button
            className="card-action-btn"
            onClick={(e) => { e.stopPropagation(); onShare?.(article); }}
            title="Share"
          >
            <FiShare2 size={13} /> Share
          </button>

          <button
            className={`card-action-btn ${isBookmarked ? 'bookmarked' : ''}`}
            onClick={(e) => { e.stopPropagation(); onBookmark?.(article); }}
            title={isBookmarked ? 'Remove bookmark' : 'Bookmark'}
          >
            {isBookmarked ? <FaBookmark size={12} /> : <FiBookmark size={13} />}
            {isBookmarked ? 'Saved' : 'Save'}
          </button>

          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="card-action-btn primary"
            title="Read full article"
            onClick={(e) => e.stopPropagation()}
          >
            <FiExternalLink size={13} /> Read
          </a>
        </div>
      </div>
    </motion.article>
  );
}
