const express = require('express');
const { requireAuth } = require('../middleware/auth');
const userController = require('../controllers/userController');

const router = express.Router();

// Public endpoint — no auth required for contact form
router.post('/contact', userController.submitContactForm);

// Authenticated user endpoints
router.use(requireAuth);
router.get('/me', userController.getMe);
router.patch('/me', userController.updateProfile);
router.get('/me/points', userController.getPointsHistory);
router.get('/me/contests', userController.getMyContests);
router.get('/me/badges', userController.getMyBadges);

module.exports = router;
