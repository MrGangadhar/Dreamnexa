/**
 * dateUtils.js — lightweight date formatting utilities for QuizArena News.
 * Does NOT import any external library to keep the bundle small.
 */

/**
 * Returns a human-readable relative time string.
 * @param {string|Date} dateStr
 * @returns {string}  e.g. "3 hours ago", "2 days ago"
 */
export function formatDistanceToNow(dateStr) {
  if (!dateStr) return 'Unknown date';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return 'Unknown date';

  const diff = Date.now() - date.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours   = Math.floor(minutes / 60);
  const days    = Math.floor(hours   / 24);
  const weeks   = Math.floor(days    / 7);
  const months  = Math.floor(days    / 30);

  if (seconds < 60)  return 'just now';
  if (minutes < 60)  return `${minutes}m ago`;
  if (hours   < 24)  return `${hours}h ago`;
  if (days    < 7)   return `${days}d ago`;
  if (weeks   < 5)   return `${weeks}w ago`;
  if (months  < 12)  return `${months}mo ago`;
  return date.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
}

/**
 * Format a date string as "29 Jul 2026 · 6:30 PM"
 * @param {string|Date} dateStr
 * @returns {string}
 */
export function formatDateTime(dateStr) {
  if (!dateStr) return '';
  try {
    return new Date(dateStr).toLocaleString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit', hour12: true,
    });
  } catch {
    return '';
  }
}
