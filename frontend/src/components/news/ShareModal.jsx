/**
 * ShareModal.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Bottom-sheet share modal with WhatsApp, Telegram, Facebook, Twitter/X,
 * and Copy Link. Uses Framer Motion for entry/exit animation.
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiCopy, FiCheck } from 'react-icons/fi';
import {
  FaWhatsapp, FaTelegramPlane, FaFacebookF, FaTwitter,
} from 'react-icons/fa';

function buildShareUrls(article) {
  const url   = encodeURIComponent(article.url || '');
  const title = encodeURIComponent(article.title || '');
  return {
    whatsapp: `https://wa.me/?text=${title}%20${url}`,
    telegram: `https://t.me/share/url?url=${url}&text=${title}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
    twitter:  `https://twitter.com/intent/tweet?text=${title}&url=${url}`,
  };
}

/**
 * @param {Object}   article  — article object
 * @param {Function} onClose  — close callback
 */
export default function ShareModal({ article, onClose }) {
  const [copied, setCopied] = useState(false);
  const urls = buildShareUrls(article);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(article.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* Fallback for older browsers */
      const el = document.createElement('input');
      el.value = article.url;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        className="modal-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="share-modal"
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0,  opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: 'spring', damping: 28, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="share-modal-header">
            <h3>Share Article</h3>
            <button className="modal-close-btn" onClick={onClose} aria-label="Close">
              <FiX />
            </button>
          </div>

          {/* Article preview */}
          <p style={{
            fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16,
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
            overflow: 'hidden', lineHeight: 1.5,
          }}>
            {article.title}
          </p>

          {/* Share buttons */}
          <div className="share-options">
            <a
              href={urls.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="share-option share-whatsapp"
            >
              <div className="share-icon"><FaWhatsapp /></div>
              <span>WhatsApp</span>
            </a>
            <a
              href={urls.telegram}
              target="_blank"
              rel="noopener noreferrer"
              className="share-option share-telegram"
            >
              <div className="share-icon"><FaTelegramPlane /></div>
              <span>Telegram</span>
            </a>
            <a
              href={urls.facebook}
              target="_blank"
              rel="noopener noreferrer"
              className="share-option share-facebook"
            >
              <div className="share-icon"><FaFacebookF /></div>
              <span>Facebook</span>
            </a>
            <a
              href={urls.twitter}
              target="_blank"
              rel="noopener noreferrer"
              className="share-option share-twitter"
            >
              <div className="share-icon"><FaTwitter /></div>
              <span>Twitter/X</span>
            </a>
            <button className="share-option share-copy" onClick={handleCopy}>
              <div className="share-icon">
                {copied ? <FiCheck /> : <FiCopy />}
              </div>
              <span>{copied ? 'Copied!' : 'Copy'}</span>
            </button>
          </div>

          {/* URL row */}
          <div className="share-url-row">
            <div className="share-url-input">{article.url}</div>
            <button
              className={`share-copy-btn ${copied ? 'copied' : ''}`}
              onClick={handleCopy}
            >
              {copied ? '✓ Copied' : 'Copy Link'}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
