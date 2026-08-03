const jwt = require('jsonwebtoken');
const crypto = require('crypto');

function resolveSecret(envName, fallback) {
  return process.env[envName] || fallback;
}

const ACCESS_SECRET = resolveSecret('JWT_ACCESS_SECRET', 'dreamnexa-access-secret-fallback');
const REFRESH_SECRET = resolveSecret('JWT_REFRESH_SECRET', 'dreamnexa-refresh-secret-fallback');

function signAccessToken(user) {
  return jwt.sign(
    { sub: user.id, role: user.role, username: user.username },
    ACCESS_SECRET,
    { expiresIn: process.env.JWT_ACCESS_EXPIRES || '15m' }
  );
}

function signRefreshToken(user) {
  return jwt.sign(
    { sub: user.id, type: 'refresh' },
    REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES || '30d' }
  );
}

function verifyAccessToken(token) {
  return jwt.verify(token, ACCESS_SECRET);
}

function verifyRefreshToken(token) {
  return jwt.verify(token, REFRESH_SECRET);
}

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function generateReferralCode(username) {
  const suffix = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `${username.slice(0, 4).toUpperCase()}${suffix}`.slice(0, 12);
}

module.exports = {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  hashToken,
  generateReferralCode,
};
