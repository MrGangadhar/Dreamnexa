import { io } from 'socket.io-client';

let socket = null;

/**
 * Lazily connects to the backend's Socket.IO server (mounted directly on the
 * HTTP server, not under /api). Used only by the admin AI Proctoring tab to
 * get a live nudge when a new violation event comes in, so the dashboard
 * doesn't feel stale between manual refreshes. Entirely optional — if the
 * socket fails to connect (e.g. behind a proxy that doesn't support
 * WebSockets), the REST-based list still works fine on manual refresh.
 */
export function getSocket() {
  if (socket) return socket;

  // Same-origin by default: in dev, vite.config.js proxies /socket.io to the
  // backend; in production the frontend and backend are typically served
  // from (or behind) the same origin. Override with VITE_SOCKET_URL for a
  // split-origin deployment.
  const socketUrl = import.meta.env.VITE_SOCKET_URL || window.location.origin;
  const token = localStorage.getItem('accessToken');

  socket = io(socketUrl, {
    auth: { token },
    autoConnect: !!token,
    reconnectionAttempts: 3,
  });

  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
