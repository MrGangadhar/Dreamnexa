const express = require('express');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const adminController = require('../controllers/adminController');
const newsController = require('../controllers/newsController');
const govtJobsController = require('../controllers/govtJobsController');
const proctoringController = require('../controllers/proctoringController');

const router = express.Router();

router.use(requireAuth, requireAdmin);

router.get('/dashboard', adminController.getDashboardStats);

router.get('/templates', adminController.listTemplates);
router.post('/templates', adminController.createTemplate);
router.patch('/templates/:id', adminController.updateTemplate);

// Contest scheduling (admin can set time/date per contest)
router.get('/contests', adminController.listAllContests);
router.patch('/contests/:id/schedule', adminController.scheduleContest);

router.get('/quizzes', adminController.listQuizzes);
router.post('/quizzes', adminController.createQuiz);
router.patch('/quizzes/:id', adminController.updateQuiz);

router.get('/users', adminController.listUsers);
router.get('/users/:id', adminController.getUserDetails);
router.get('/attempts/:id', adminController.getAttemptDetail);
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

// ── AI Quiz Proctor — review flagged sessions ────────────────────────────────
router.get('/proctoring/sessions', proctoringController.listSessions);
router.get('/proctoring/sessions/:id', proctoringController.getSessionDetail);
router.post('/proctoring/sessions/:id/decision', proctoringController.resolveReview);

// ── News & Vlogs management ──────────────────────────────────────────────────
router.get('/news', newsController.listAllArticles);
router.post('/news', newsController.createArticle);
router.put('/news/:id', newsController.updateArticle);
router.delete('/news/:id', newsController.deleteArticle);

// ── Government Jobs management ────────────────────────────────────────────────
router.get('/jobs',        govtJobsController.listAll);
router.post('/jobs',       govtJobsController.createJob);
router.put('/jobs/:id',    govtJobsController.updateJob);
router.delete('/jobs/:id', govtJobsController.deleteJob);

module.exports = router;
