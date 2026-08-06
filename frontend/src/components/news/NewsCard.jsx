/**
 * NewsCard.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Premium news article card with:
 *   - Lazy-loaded image with fallback emoji
 *   - Source name, publish date
 *   - Category badge (top-left on image)
 *   - Vlog play overlay for vlog-type articles
 *   - Title (2-line clamp) + description (2-line clamp)
 *   - Author + estimated read time
 *   - Footer: Share | Bookmark | Read / Watch
 *
 * Hover: card lifts + image zooms (CSS transition).
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiShare2, FiBookmark, FiUser, FiClock, FiExternalLink, FiPlay } from 'react-icons/fi';
import { FaBookmark } from 'react-icons/fa';
import { formatDistanceToNow } from '../../utils/dateUtils';
import { estimateReadTime, getCategoryEmoji, getCategoryLabel } from '../../utils/newsUtils';

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

  const isVlog = article.articleType === 'vlog';
  const readTime    = estimateReadTime(article.content || article.description || '');
  const publishedAgo = formatDistanceToNow(article.publishedAt);
  const displayCategory = category || article.category;
  const categoryLabel = getCategoryLabel(displayCategory || '');
  const emoji        = getCategoryEmoji(displayCategory);
  const showCategory = displayCategory && displayCategory !== 'all';

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
          <div className="news-card-img-fallback">{isVlog ? '🎥' : emoji}</div>
        )}
        {showCategory && (
          <span className="news-card-category-badge">{categoryLabel}</span>
        )}
        {/* Vlog play overlay */}
        {isVlog && (
          <div style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(0,0,0,0.25)',
            borderRadius: 'inherit',
            pointerEvents: 'none',
          }}>
            <div style={{
              width: 52, height: 52,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.92)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
            }}>
              <FiPlay size={22} style={{ color: '#ef4444', marginLeft: 3 }} />
            </div>
          </div>
        )}
      </div>

      {/* ── Body ───────────────────────────────────────────────── */}
      <div className="news-card-body">
        {/* Source + Date */}
        <div className="news-card-source-row">
          <div className="news-card-source">
            {isVlog && (
              <span style={{
                fontSize: 10, fontWeight: 700, color: '#ef4444',
                background: 'rgba(239,68,68,0.1)',
                padding: '1px 6px', borderRadius: 3, marginRight: 6,
              }}>
                VLOG
              </span>
            )}
            <span className="source-name">{article.source?.name || 'DreamNexa'}</span>
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
            {isVlog ? 'Watch' : `${readTime} min read`}
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

          <button
            className="card-action-btn primary"
            onClick={(e) => { e.stopPropagation(); onClick?.(); }}
          >
            {isVlog ? <><FiPlay size={13} /> Watch</> : <><FiExternalLink size={13} /> Read</>}
          </button>
        </div>
      </div>
    </motion.article>
  );
}
