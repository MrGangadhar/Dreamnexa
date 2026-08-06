/**
 * NewsDetailModal.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Full-screen/drawer modal showing complete article details, with:
 *   - Large cover image (or YouTube embed for vlogs)
 *   - Full description / content
 *   - Meta (source, date, author, read time)
 *   - Bookmark + Share actions
 *   - Related articles carousel
 */

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiX, FiExternalLink, FiBookmark, FiShare2, FiClock, FiCalendar, FiUser, FiPlay,
} from 'react-icons/fi';
import { FaBookmark } from 'react-icons/fa';
import { formatDistanceToNow } from '../../utils/dateUtils';
import { estimateReadTime, getCategoryEmoji } from '../../utils/newsUtils';

/**
 * Extract YouTube embed URL from various YouTube URL formats.
 */
function getYouTubeEmbedUrl(url) {
  if (!url) return null;
  try {
    const u = new URL(url);
    // youtube.com/watch?v=xxx
    if (u.hostname.includes('youtube.com') && u.searchParams.get('v')) {
      return `https://www.youtube.com/embed/${u.searchParams.get('v')}`;
    }
    // youtu.be/xxx
    if (u.hostname === 'youtu.be') {
      return `https://www.youtube.com/embed${u.pathname}`;
    }
    // already an embed URL
    if (u.pathname.includes('/embed/')) {
      return url;
    }
  } catch { /* ignore */ }
  return url; // fallback: use as-is
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

  const isVlog = article.articleType === 'vlog';
  const readTime    = estimateReadTime(article.content || article.description || '');
  const publishedAgo = formatDistanceToNow(article.publishedAt);
  const emoji       = getCategoryEmoji(article._category || article.category);
  const embedUrl    = isVlog ? getYouTubeEmbedUrl(article.vlogUrl) : null;

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
            <span style={{ fontSize: 13, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
              {isVlog && (
                <span style={{
                  fontSize: 10, fontWeight: 700, color: '#ef4444',
                  background: 'rgba(239,68,68,0.1)',
                  padding: '2px 8px', borderRadius: 4,
                }}>
                  VLOG
                </span>
              )}
              {article.source?.name || 'DreamNexa'}
            </span>
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

          {/* Cover image or Vlog embed */}
          {isVlog && embedUrl ? (
            <div style={{
              position: 'relative',
              width: '100%',
              paddingTop: '56.25%', /* 16:9 aspect ratio */
              background: '#000',
              borderRadius: 'var(--radius-card, 12px)',
              overflow: 'hidden',
              marginBottom: 4,
            }}>
              <iframe
                src={embedUrl}
                title={article.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                style={{
                  position: 'absolute',
                  top: 0, left: 0,
                  width: '100%', height: '100%',
                }}
              />
            </div>
          ) : article.urlToImage ? (
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
              <span className="detail-meta-item">
                {article.source?.name || 'DreamNexa'}
              </span>
              <span className="detail-meta-item"><FiCalendar size={12} />{publishedAgo}</span>
              {article.author && (
                <span className="detail-meta-item"><FiUser size={12} />{article.author}</span>
              )}
              <span className="detail-meta-item">
                {isVlog ? <><FiPlay size={12} /> Video</> : <><FiClock size={12} />{readTime} min read</>}
              </span>
            </div>

            {/* Title */}
            <h1 className="detail-title">{article.title}</h1>

            {/* Description / content */}
            <div className="detail-description">
              {article.content || article.description || 'No content available.'}
            </div>

            {/* Vlog external link */}
            {isVlog && article.vlogUrl && (
              <a
                href={article.vlogUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-ghost"
                style={{ borderRadius: 'var(--radius-pill)', gap: 8, marginTop: 12, display: 'inline-flex' }}
              >
                <FiExternalLink size={14} /> Open in YouTube
              </a>
            )}

            {/* Actions */}
            <div className="detail-actions">
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
                    <div
                      key={rel.id || i}
                      className="related-item"
                      style={{ cursor: 'pointer' }}
                      onClick={() => {/* parent handles navigation */}}
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
                          {rel.articleType === 'vlog' ? '🎥' : '📰'}
                        </div>
                      )}
                      <div className="related-info">
                        <div className="related-title">{rel.title}</div>
                        <div className="related-source">{rel.source?.name || 'DreamNexa'} · {formatDistanceToNow(rel.publishedAt)}</div>
                      </div>
                    </div>
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
