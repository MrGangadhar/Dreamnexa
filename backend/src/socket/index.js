const { Server } = require('socket.io');
const { verifyAccessToken } = require('../utils/tokens');

/**
 * Real-time channel for the admin proctoring dashboard. Students never
 * subscribe to anything here — their client just POSTs events over the
 * regular REST API (see routes/proctoringRoutes.js); this socket layer
 * only fans those events out live to whichever admins are watching a
 * given contest's `Proctoring` tab, so cheating attempts don't require a
 * page refresh to show up.
 */
function initSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || '*',
      credentials: true,
    },
  });

  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error('Authentication required'));
      const payload = verifyAccessToken(token);
      socket.userId = payload.sub;
      socket.role = payload.role;
      next();
    } catch (err) {
      next(new Error('Invalid or expired token'));
    }
  });

  io.on('connection', (socket) => {
    // Admin dashboards are auto-joined to a global feed so the "AI Proctoring"
    // tab gets live nudges regardless of which contest is currently active —
    // there's no per-contest subscription UI to manage.
    if (socket.role === 'admin') {
      socket.join('admins');
    }

    socket.on('subscribe:contest', (contestId) => {
      if (socket.role === 'admin' && contestId) {
        socket.join(`contest:${contestId}`);
      }
    });

    socket.on('unsubscribe:contest', (contestId) => {
      if (contestId) socket.leave(`contest:${contestId}`);
    });
  });

  return io;
}

module.exports = { initSocket };
