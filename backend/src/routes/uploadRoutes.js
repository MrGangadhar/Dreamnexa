'use strict';

const express  = require('express');
const fs       = require('fs');
const path     = require('path');
const multer   = require('multer');
const { v4: uuidv4 } = require('uuid');
const { requireAuth, requireAdmin } = require('../middleware/auth');

const router = express.Router();

/* ── Storage config ──────────────────────────────────────────────────────── */
const UPLOAD_DIR = path.join(__dirname, '../../uploads');
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
    cb(null, `${uuidv4()}${ext}`);
  },
});

const fileFilter = (_req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed (jpeg, png, gif, webp, svg).'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 8 * 1024 * 1024 }, // 8 MB max
});

/* ── POST /api/upload/image ── admin only ─────────────────────────────────── */
router.post(
  '/image',
  requireAuth,
  requireAdmin,
  upload.single('image'),
  (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided.' });
    }
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const url = `${baseUrl}/uploads/${req.file.filename}`;
    return res.json({ url, filename: req.file.filename });
  },
);

/* ── Multer error handler ────────────────────────────────────────────────── */
router.use((err, _req, res, _next) => {
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ error: 'Image too large. Maximum size is 8 MB.' });
  }
  return res.status(400).json({ error: err.message || 'Upload failed.' });
});

module.exports = router;
