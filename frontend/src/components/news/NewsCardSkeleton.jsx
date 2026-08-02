/**
 * NewsCardSkeleton.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Animated skeleton placeholder shown while news articles are loading.
 * Matches the exact layout of NewsCard.
 */

import React from 'react';

export default function NewsCardSkeleton() {
  return (
    <div className="news-card-skeleton" aria-hidden="true">
      {/* Image placeholder */}
      <div className="skeleton skeleton-img" />

      {/* Body */}
      <div className="skeleton-body">
        {/* Source row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
          <div className="skeleton skeleton-line h8 w-40" />
          <div className="skeleton skeleton-line h8 w-40" style={{ width: 70 }} />
        </div>

        {/* Title */}
        <div className="skeleton skeleton-line h16 w-full" style={{ marginBottom: 6 }} />
        <div className="skeleton skeleton-line h16 w-75" />

        {/* Description */}
        <div style={{ marginTop: 10 }}>
          <div className="skeleton skeleton-line h8 w-full" />
          <div className="skeleton skeleton-line h8 w-60" style={{ marginTop: 6 }} />
        </div>
      </div>

      {/* Footer */}
      <div className="skeleton-footer">
        <div className="skeleton skeleton-btn" style={{ width: 70 }} />
        <div className="skeleton skeleton-btn" style={{ width: 70 }} />
        <div className="skeleton skeleton-btn" style={{ flex: 1 }} />
      </div>
    </div>
  );
}
