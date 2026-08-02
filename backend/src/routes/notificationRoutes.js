const express = require('express');
const { requireAuth } = require('../middleware/auth');
const { query } = require('../db/pool');

const router = express.Router();
router.use(requireAuth);

router.get('/', async (req, res, next) => {
  try {
    const result = await query(
      `SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

router.patch('/:id/read', async (req, res, next) => {
  try {
    await query(`UPDATE notifications SET is_read = true WHERE id = $1 AND user_id = $2`, [req.params.id, req.user.id]);
    res.json({ message: 'Marked as read.' });
  } catch (err) {
    next(err);
  }
});

router.get('/announcements/active', async (req, res, next) => {
  try {
    const result = await query(`SELECT * FROM announcements WHERE is_active = true ORDER BY created_at DESC LIMIT 10`);
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
