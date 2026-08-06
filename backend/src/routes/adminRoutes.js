const express = require('express');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const adminController = require('../controllers/adminController');
const newsController = require('../controllers/newsController');

const router = express.Router();

router.use(requireAuth, requireAdmin);

router.get('/dashboard', adminController.getDashboardStats);

router.get('/templates', adminController.listTemplates);
router.post('/templates', adminController.createTemplate);
router.patch('/templates/:id', adminController.updateTemplate);

router.get('/quizzes', adminController.listQuizzes);
router.post('/quizzes', adminController.createQuiz);

router.get('/users', adminController.listUsers);
router.patch('/users/:id/status', adminController.setUserStatus);
router.post('/users/:id/points-adjustment', adminController.adjustPoints);

router.post('/announcements', adminController.createAnnouncement);

// ── News & Vlogs management ──────────────────────────────────────────────────
router.get('/news', newsController.listAllArticles);
router.post('/news', newsController.createArticle);
router.put('/news/:id', newsController.updateArticle);
router.delete('/news/:id', newsController.deleteArticle);

module.exports = router;
