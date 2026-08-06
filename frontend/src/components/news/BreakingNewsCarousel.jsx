/**
 * BreakingNewsCarousel.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Hero carousel at the top of the News page featuring:
 *   - Auto-sliding (5-second interval)
 *   - "Breaking" + "Trending" badges
 *   - Gradient text overlay
 *   - Dot navigation at bottom-right
 *   - Pauses on hover
 *   - Click to open article detail
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { FiCalendar } from 'react-icons/fi';
import { formatDistanceToNow } from '../../utils/dateUtils';
import { getCategoryEmoji } from '../../utils/newsUtils';

const SLIDE_INTERVAL = 5000; // ms

/**
 * @param {Array}    articles    — top N articles to feature (5–7 recommended)
 * @param {Function} onCardClick — open detail modal
 */
export default function BreakingNewsCarousel({ articles = [], onCardClick }) {
  const [current, setCurrent] = useState(0);
  const [paused,  setPaused]  = useState(false);
  const timerRef = useRef(null);

  const goTo = useCallback((index) => {
    setCurrent(index);
  }, []);

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % articles.length);
  }, [articles.length]);

  /* Auto-slide */
  useEffect(() => {
    if (!paused && articles.length > 1) {
      timerRef.current = setInterval(next, SLIDE_INTERVAL);
    }
    return () => clearInterval(timerRef.current);
  }, [paused, next, articles.length]);

  if (!articles.length) return null;

  return (
    <div
      className="breaking-carousel"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {articles.map((article, i) => {
        const emoji = getCategoryEmoji(article._category || article.category);
        return (
          <div
            key={article.url || i}
            className={`carousel-slide ${i === current ? 'active' : ''}`}
            onClick={() => onCardClick?.(article)}
            style={{ cursor: 'pointer' }}
          >
            {/* Background image */}
            {article.urlToImage ? (
              <img
                className="carousel-img"
                src={article.urlToImage}
                alt={article.title}
                loading={i === 0 ? 'eager' : 'lazy'}
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            ) : (
              <div className="carousel-img-fallback">{emoji}</div>
            )}

            {/* Gradient overlay */}
            <div className="carousel-overlay" />

            {/* Content */}
            <div className="carousel-content">
              <div className="carousel-badges">
                <span className="badge-breaking">Breaking</span>
                {i === 0 && <span className="badge-trending">🔥 Trending</span>}
              </div>

              <h2>{article.title}</h2>

              <div className="carousel-meta">
                {article.source?.name && (
                  <span>{article.source.name}</span>
                )}
                <span>
                  <FiCalendar size={12} />
                  {formatDistanceToNow(article.publishedAt)}
                </span>
              </div>
            </div>
          </div>
        );
      })}

      {/* Dot navigation */}
      {articles.length > 1 && (
        <div className="carousel-dots">
          {articles.map((_, i) => (
            <button
              key={i}
              className={`carousel-dot ${i === current ? 'active' : ''}`}
              onClick={(e) => { e.stopPropagation(); goTo(i); }}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
