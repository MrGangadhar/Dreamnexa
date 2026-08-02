const express = require('express');
const { requireAuth } = require('../middleware/auth');
const quizController = require('../controllers/quizController');

const router = express.Router();

router.use(requireAuth);
router.get('/:contestId/play', quizController.getQuizForAttempt);
router.post('/:contestId/submit', quizController.submitAttempt);

module.exports = router;
