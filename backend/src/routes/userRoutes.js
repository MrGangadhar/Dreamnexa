const express = require('express');
const { requireAuth } = require('../middleware/auth');
const userController = require('../controllers/userController');

const router = express.Router();

router.use(requireAuth);
router.get('/me', userController.getMe);
router.patch('/me', userController.updateProfile);
router.get('/me/points', userController.getPointsHistory);
router.get('/me/contests', userController.getMyContests);
router.get('/me/badges', userController.getMyBadges);

module.exports = router;
