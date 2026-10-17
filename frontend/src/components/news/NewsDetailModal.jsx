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
import {
  estimateReadTime,
  getCategoryEmoji,
  getYouTubeThumbnail,
  getYouTubeEmbedUrl,
  resolveImageUrl,
  resolveArticleThumbnail,
  getCategoryFallbackImage,
} from '../../utils/newsUtils';
import AdBanner from '../AdBanner';

/**
 * Lightweight HTML sanitizer — allow-list only safe tags.
 * Strips all other tags and dangerous attributes.
 */
const ALLOWED_TAGS = [
  'p','br','b','strong','i','em','u','s','strike',
  'h1','h2','h3','h4','h5','h6',
  'ul','ol','li',
  'blockquote','pre','code',
  'a','img',
  'table','thead','tbody','tr','th','td',
  'span','div','figure','figcaption',
  'hr',
];
const ALLOWED_ATTRS = ['href','src','alt','title','target','rel','style','class'];
const FORBIDDEN_CSS = /expression|javascript|url\s*\(/i;

function sanitizeHTML(html) {
  if (!html) return '';
  // If it looks like plain text (no <), wrap in paragraphs
  if (!/<[a-z][\s\S]*>/i.test(html)) {
    return html.split(/\n{2,}/).map(p => `<p>${p.replace(/\n/g, '<br/>')}</p>`).join('');
  }
  const el = document.createElement('div');
  el.innerHTML = html;
  function clean(node) {
    if (node.nodeType === Node.TEXT_NODE) return;
    if (node.nodeType !== Node.ELEMENT_NODE) { node.remove(); return; }
    const tag = node.tagName.toLowerCase();
    if (!ALLOWED_TAGS.includes(tag)) {
      // Replace node with its children (unwrap)
      while (node.firstChild) node.parentNode.insertBefore(node.firstChild, node);
      node.remove();
      return;
    }
    // Remove forbidden attributes
    for (const attr of [...node.attributes]) {
      if (!ALLOWED_ATTRS.includes(attr.name)) { node.removeAttribute(attr.name); continue; }
      if (attr.name === 'href' || attr.name === 'src') {
        if (/^javascript:/i.test(attr.value)) node.removeAttribute(attr.name);
      }
      if (attr.name === 'style' && FORBIDDEN_CSS.test(attr.value)) node.removeAttribute(attr.name);
    }
    if (tag === 'a') { node.setAttribute('target', '_blank'); node.setAttribute('rel', 'noopener noreferrer'); }
    [...node.childNodes].forEach(clean);
  }
  [...el.childNodes].forEach(clean);
  return el.innerHTML;
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

  const isVlog = article.articleType === 'vlog' || article.article_type === 'vlog';
  const readTime    = estimateReadTime(article.content || article.description || '');
  const publishedAgo = formatDistanceToNow(article.publishedAt);
  const emoji       = getCategoryEmoji(article._category || article.category);
  const vlogUrl     = article.vlogUrl || article.vlog_url;
  const embedUrl    = isVlog ? getYouTubeEmbedUrl(vlogUrl) : null;
  const coverThumb  = resolveArticleThumbnail(article);

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
          ) : coverThumb ? (
            <img
              src={coverThumb}
              alt={article.title}
              className="detail-cover-img"
              loading="lazy"
              referrerPolicy="no-referrer"
              onError={(e) => {
                const fallback = getCategoryFallbackImage(article._category || article.category, isVlog);
                if (e.target.src !== fallback) {
                  e.target.src = fallback;
                } else {
                  e.target.style.display = 'none';
                }
              }}
              style={{ width: '100%', height: '320px', objectFit: 'cover', objectPosition: 'center', display: 'block', borderRadius: '12px' }}
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

            {/* Description / content — rendered as rich HTML */}
            <div
              className="detail-description rich-content"
              dangerouslySetInnerHTML={{ __html: sanitizeHTML(article.content || article.description || '') }}
            />

            {/* Inline ad after article body */}
            <div style={{ margin: '24px 0' }}>
              <AdBanner position="inline" variant={1} dismissible={true} />
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
                      {resolveArticleThumbnail(rel) ? (
                        <img
                          src={resolveArticleThumbnail(rel)}
                          alt={rel.title}
                          className="related-img"
                          loading="lazy"
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            const fallback = getCategoryFallbackImage(rel.category, rel.articleType === 'vlog' || rel.article_type === 'vlog');
                            if (e.target.src !== fallback) {
                              e.target.src = fallback;
                            } else {
                              e.target.style.display = 'none';
                            }
                          }}
                          style={{ width: '80px', height: '60px', objectFit: 'cover', objectPosition: 'center', borderRadius: '8px', flexShrink: 0 }}
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
