const express = require('express');
const { requireAuth } = require('../middleware/auth');
const wc = require('../controllers/walletController');

const router = express.Router();

// All wallet endpoints are protected
router.use(requireAuth);

router.get('/', wc.getWalletSummary);
router.get('/history', wc.getPointsHistory);
router.get('/prize-history', wc.getPrizeHistory);
router.get('/withdraw-history', wc.getWithdrawHistory);
router.post('/withdraw', wc.withdraw);
router.post('/redeem-coupon', wc.redeemCoupon);

module.exports = router;
