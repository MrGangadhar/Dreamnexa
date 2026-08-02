/**
 * NewsDetailModal.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Full-screen/drawer modal showing complete article details, with:
 *   - Large cover image
 *   - Full description
 *   - Meta (source, date, author, read time)
 *   - Bookmark + Share actions
 *   - Open original website button
 *   - Related articles carousel
 */

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiX, FiExternalLink, FiBookmark, FiShare2, FiClock, FiCalendar, FiUser,
} from 'react-icons/fi';
import { FaBookmark } from 'react-icons/fa';
import { formatDistanceToNow } from '../../utils/dateUtils';
import { estimateReadTime, getCategoryEmoji } from '../../utils/newsUtils';

function getSourceFavicon(article) {
  try {
    const domain = new URL(article.url).hostname;
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
  } catch {
    return null;
  }
}

/**
 * @param {Object}   article       — news article object
 * @param {boolean}  isBookmarked  — whether this article is bookmarked
 * @param {Function} onBookmark    — toggle bookmark callback
 * @param {Function} onShare       — open share modal callback
 * @param {Function} onClose       — close detail callback
 * @param {Array}    relatedArticles — related articles to show at bottom
 */
export default function NewsDetailModal({
  article,
  isBookmarked,
  onBookmark,
  onShare,
  onClose,
  relatedArticles = [],
}) {
  /* Lock body scroll while modal is open */
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  /* Close on Escape key */
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  if (!article) return null;

  const readTime    = estimateReadTime(article.content || article.description || '');
  const publishedAgo = formatDistanceToNow(article.publishedAt);
  const favicon     = getSourceFavicon(article);
  const emoji       = getCategoryEmoji(article._category);

  return (
    <AnimatePresence>
      <motion.div
        className="detail-modal-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="detail-modal"
          initial={{ y: 60, opacity: 0 }}
          animate={{ y: 0,  opacity: 1 }}
          exit={{ y: 60, opacity: 0 }}
          transition={{ type: 'spring', damping: 26, stiffness: 250 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Sticky header */}
          <div className="detail-modal-header">
            <button className="detail-back-btn" onClick={onClose}>
              <FiX size={14} /> Close
            </button>
            {article.source?.name && (
              <span style={{ fontSize: 13, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
                {favicon && <img src={favicon} alt="" style={{ width: 16, height: 16, borderRadius: 3 }} />}
                {article.source.name}
              </span>
            )}
            <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
              <button className="card-action-btn" onClick={onShare} title="Share">
                <FiShare2 size={14} />
              </button>
              <button
                className={`card-action-btn ${isBookmarked ? 'bookmarked' : ''}`}
                onClick={onBookmark}
                title={isBookmarked ? 'Remove bookmark' : 'Bookmark'}
              >
                {isBookmarked ? <FaBookmark size={13} /> : <FiBookmark size={14} />}
              </button>
            </div>
          </div>

          {/* Cover image */}
          {article.urlToImage ? (
            <img
              src={article.urlToImage}
              alt={article.title}
              className="detail-cover-img"
              loading="lazy"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          ) : (
            <div className="detail-cover-fallback">{emoji}</div>
          )}

          {/* Body */}
          <div className="detail-body">
            {/* Meta row */}
            <div className="detail-meta">
              {article.source?.name && (
                <span className="detail-meta-item">
                  {favicon && <img src={favicon} alt="" style={{ width: 14, height: 14, borderRadius: 2 }} />}
                  {article.source.name}
                </span>
              )}
              <span className="detail-meta-item"><FiCalendar size={12} />{publishedAgo}</span>
              {article.author && (
                <span className="detail-meta-item"><FiUser size={12} />{article.author}</span>
              )}
              <span className="detail-meta-item"><FiClock size={12} />{readTime} min read</span>
            </div>

            {/* Title */}
            <h1 className="detail-title">{article.title}</h1>

            {/* Description / content */}
            <div className="detail-description">
              {article.content
                ? article.content.replace(/\[\+\d+ chars\]$/, '')
                : article.description}
            </div>

            {/* Actions */}
            <div className="detail-actions">
              <a
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary"
                style={{ borderRadius: 'var(--radius-pill)', gap: 8 }}
              >
                <FiExternalLink size={14} /> Read Full Article
              </a>
              <button
                className={`btn btn-ghost ${isBookmarked ? 'bookmarked' : ''}`}
                onClick={onBookmark}
                style={{ borderRadius: 'var(--radius-pill)' }}
              >
                {isBookmarked ? <FaBookmark size={14} /> : <FiBookmark size={14} />}
                {isBookmarked ? 'Bookmarked' : 'Bookmark'}
              </button>
              <button
                className="btn btn-ghost"
                onClick={onShare}
                style={{ borderRadius: 'var(--radius-pill)' }}
              >
                <FiShare2 size={14} /> Share
              </button>
            </div>

            {/* Related articles */}
            {relatedArticles.length > 0 && (
              <div className="related-section">
                <h3>Related Articles</h3>
                <div className="related-list">
                  {relatedArticles.slice(0, 4).map((rel, i) => (
                    <a
                      key={i}
                      href={rel.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="related-item"
                    >
                      {rel.urlToImage ? (
                        <img
                          src={rel.urlToImage}
                          alt={rel.title}
                          className="related-img"
                          loading="lazy"
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                      ) : (
                        <div className="related-img" style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          background: 'var(--bg-raised)', fontSize: 28,
                        }}>
                          📰
                        </div>
                      )}
                      <div className="related-info">
                        <div className="related-title">{rel.title}</div>
                        <div className="related-source">{rel.source?.name} · {formatDistanceToNow(rel.publishedAt)}</div>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
