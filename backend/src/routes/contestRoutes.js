const express = require('express');
const { requireAuth } = require('../middleware/auth');
const contestController = require('../controllers/contestController');

const router = express.Router();

router.get('/', contestController.listContests);
router.get('/leaderboard', contestController.getLeaderboard);
router.get('/:id', contestController.getContest);
router.get('/:id/leaderboard', contestController.getContestLeaderboard);
router.post('/:id/join', requireAuth, contestController.joinContest);

module.exports = router;
