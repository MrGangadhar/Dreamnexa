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
router.get('/users/:id', adminController.getUserDetails);
router.put('/users/:id', adminController.updateUserAccess);
router.delete('/users/:id', adminController.deleteUser);
router.patch('/users/:id/status', adminController.setUserStatus);
router.post('/users/:id/points-adjustment', adminController.adjustPoints);
router.post('/users/:id/wallet-adjustment', adminController.adjustUserWallet);
router.post('/users/bulk-credit', adminController.bulkCreditPoints);

router.get('/logs', adminController.getAdminLogs);

router.get('/coupons', adminController.listCoupons);
router.post('/coupons', adminController.createCoupon);
router.put('/coupons/:id', adminController.updateCoupon);
router.delete('/coupons/:id', adminController.deleteCoupon);
router.get('/coupons/redemptions', adminController.listCouponRedemptions);

router.get('/withdrawals', adminController.listWithdrawals);
router.put('/withdrawals/:id', adminController.updateWithdrawalStatus);

router.post('/announcements', adminController.createAnnouncement);

// ── News & Vlogs management ──────────────────────────────────────────────────
router.get('/news', newsController.listAllArticles);
router.post('/news', newsController.createArticle);
router.put('/news/:id', newsController.updateArticle);
router.delete('/news/:id', newsController.deleteArticle);

module.exports = router;
