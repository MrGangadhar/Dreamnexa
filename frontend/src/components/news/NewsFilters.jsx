/**
 * NewsFilters.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Filter bar section containing:
 *   - Horizontally scrollable category pills
 *   - Sort By select
 *   - Date Range select
 *   - Country/Language select
 * All filters call `onChange` with a delta of the filter state.
 */

import React from 'react';
import { motion } from 'framer-motion';
import { CATEGORIES, SORT_OPTIONS, DATE_OPTIONS } from '../../utils/newsUtils';

const LANGUAGE_OPTIONS = [
  { value: 'en,hi,kn', label: '🌐 All (En/Hi/Kn)' },
  { value: 'en', label: '🌐 English' },
  { value: 'hi', label: '🇮🇳 Hindi' },
  { value: 'kn', label: '🇮🇳 Kannada' },
];

const filterBarVariants = {
  hidden:  { opacity: 0, y: -8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

/**
 * @param {Object}   filters  — current filter state { category, sortBy, dateRange, language }
 * @param {Function} onChange — called with partial update: (delta) => void
 */
export default function NewsFilters({ filters, onChange }) {
  return (
    <motion.div variants={filterBarVariants} initial="hidden" animate="visible">
      {/* Category pills */}
      <div className="news-filter-bar" role="tablist" aria-label="News categories">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            role="tab"
            aria-selected={filters.category === cat.id}
            className={`category-pill ${filters.category === cat.id ? 'active' : ''}`}
            onClick={() => onChange({ category: cat.id })}
          >
            <span>{cat.emoji}</span>
            {cat.label}
          </button>
        ))}
      </div>
    </motion.div>
  );
}
