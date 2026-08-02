/**
 * ErrorState.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Displays contextual error messages for different failure scenarios:
 *   - No internet connection
 *   - API rate limit exceeded
 *   - No search results
 *   - Generic error
 */

import React from 'react';
import { FiWifiOff, FiAlertCircle, FiSearch, FiRefreshCw } from 'react-icons/fi';

const ERROR_CONFIGS = {
  offline: {
    icon: '📡',
    IconComp: FiWifiOff,
    title: 'No Internet Connection',
    message: 'Please check your network connection and try again.',
  },
  rateLimit: {
    icon: '⏳',
    IconComp: FiAlertCircle,
    title: 'API Limit Reached',
    message: 'Too many requests. Please wait a moment before trying again.',
  },
  noResults: {
    icon: '🔍',
    IconComp: FiSearch,
    title: 'No Results Found',
    message: 'Try different keywords or adjust your filters to find articles.',
    hideRetry: true,
  },
  generic: {
    icon: '⚠️',
    IconComp: FiAlertCircle,
    title: 'Something Went Wrong',
    message: 'We could not load the news right now. Please try again.',
  },
};

/**
 * @param {'offline'|'rateLimit'|'noResults'|'generic'} type
 * @param {Function} onRetry
 * @param {string} [message] - custom override
 */
export default function ErrorState({ type = 'generic', onRetry, message }) {
  const config = ERROR_CONFIGS[type] || ERROR_CONFIGS.generic;

  return (
    <div className="news-error-state" role="alert">
      <div className="error-icon">{config.icon}</div>
      <h3>{config.title}</h3>
      <p>{message || config.message}</p>
      {!config.hideRetry && onRetry && (
        <button className="retry-btn" onClick={onRetry}>
          <FiRefreshCw style={{ marginRight: 6, verticalAlign: 'middle' }} />
          Try Again
        </button>
      )}
    </div>
  );
}
