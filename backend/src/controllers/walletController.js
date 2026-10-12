const { query, withTransaction } = require('../db/pool');

const TARGET_POINTS = 5000;
const REWARD_AMOUNT = 500.00;
const MIN_WITHDRAWAL = 300.00;

// Auto-credit rewards if the user has reached thresholds
async function processAutoRewards(client, userId, totalPoints) {
  const claimedRes = await client.query(
    `SELECT COUNT(*) AS count FROM reward_history WHERE user_id = $1 AND status = 'Credited'`,
    [userId]
  );
  let claimedCount = parseInt(claimedRes.rows[0].count, 10);

  let newRewards = 0;
  while (totalPoints - (claimedCount * TARGET_POINTS) >= TARGET_POINTS) {
    // Credit reward
    await client.query(
      `INSERT INTO reward_history (user_id, reward_amount, points_used, status)
       VALUES ($1, $2, $3, $4)`,
      [userId, REWARD_AMOUNT, TARGET_POINTS, 'Credited']
    );
    await client.query(
      `UPDATE wallets
       SET available_prize = available_prize + $1,
           lifetime_prize = lifetime_prize + $2,
           updated_at = now()
       WHERE user_id = $3`,
      [REWARD_AMOUNT, REWARD_AMOUNT, userId]
    );
    claimedCount += 1;
    newRewards += 1;
  }

  // Surface the milestone to the user immediately (previously this was
  // silent — the wallet balance updated but nothing told the user, so
  // they'd only ever notice it if they happened to open the Wallet page).
  if (newRewards > 0) {
    await client.query(
      `INSERT INTO notifications (user_id, type, title, message)
       VALUES ($1, 'reward_earned', '🎉 Reward unlocked!', $2)`,
      [
        userId,
        newRewards === 1
          ? `You've crossed ${TARGET_POINTS} points and earned ₹${REWARD_AMOUNT.toFixed(2)}! Head to your Wallet to request a withdrawal.`
          : `You've earned ${newRewards} rewards worth ₹${(REWARD_AMOUNT * newRewards).toFixed(2)} total! Head to your Wallet to request a withdrawal.`,
      ]
    );
  }

  return claimedCount;
}

async function getWalletSummary(req, res, next) {
  try {
    const userId = req.user.id;
    
    const summary = await withTransaction(async (client) => {
      // Ensure wallet exists
      await client.query(
        `INSERT INTO wallets (user_id) VALUES ($1) ON CONFLICT (user_id) DO NOTHING`,
        [userId]
      );
      
      const profileRes = await client.query(
        `SELECT total_points FROM profiles WHERE user_id = $1`,
        [userId]
      );
      const totalPoints = parseInt(profileRes.rows[0].total_points, 10) || 0;
      
      const claimedCount = await processAutoRewards(client, userId, totalPoints);
      
      const walletRes = await client.query(
        `SELECT * FROM wallets WHERE user_id = $1`,
        [userId]
      );
      const wallet = walletRes.rows[0];
      
      // Compute today points (using points_history or points_transactions)
      const todayRes = await client.query(
        `SELECT COALESCE(SUM(amount), 0)::int AS today_points 
         FROM points_transactions 
         WHERE user_id = $1 AND created_at >= CURRENT_DATE AND amount > 0`,
        [userId]
      );
      const todayPoints = parseInt(todayRes.rows[0].today_points, 10);
      
      const progressPoints = Math.max(0, totalPoints - (claimedCount * TARGET_POINTS));
      const progress = Math.min(100, Math.floor((progressPoints / TARGET_POINTS) * 100));
      const remainingPoints = Math.max(0, TARGET_POINTS - progressPoints);
      
      return {
        currentPoints: totalPoints,
        targetPoints: TARGET_POINTS,
        rewardAmount: REWARD_AMOUNT,
        progress: progress,
        remainingPoints: remainingPoints,
        availablePrize: parseFloat(wallet.available_prize),
        lifetimePrize: parseFloat(wallet.lifetime_prize),
        todayPoints: todayPoints,
        claimedRewards: claimedCount
      };
    });
    
    res.json(summary);
  } catch (err) {
    next(err);
  }
}

async function getPointsHistory(req, res, next) {
  try {
    const result = await query(
      `SELECT created_at as date, description as "quizName", amount as points, 'Completed' as status 
       FROM points_transactions 
       WHERE user_id = $1 
       ORDER BY created_at DESC LIMIT 50`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
}

async function getPrizeHistory(req, res, next) {
  try {
    const result = await query(
      `SELECT created_at as date, '₹' || reward_amount || ' Prize' as reward, points_used as "pointsUsed", status 
       FROM reward_history 
       WHERE user_id = $1 
       ORDER BY created_at DESC`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
}

async function getWithdrawHistory(req, res, next) {
  try {
    const result = await query(
      `SELECT created_at as date, amount, method, status 
       FROM withdrawal_history 
       WHERE user_id = $1 
       ORDER BY created_at DESC`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
}

async function getPayoutDetails(req, res, next) {
  try {
    const result = await query(
      `SELECT upi_id, account_holder, account_number, ifsc_code, bank_name, preferred_method, updated_at
       FROM payout_details 
       WHERE user_id = $1`,
      [req.user.id]
    );
    res.json(result.rows[0] || null);
  } catch (err) {
    next(err);
  }
}

async function updatePayoutDetails(req, res, next) {
  try {
    const { upi_id, account_holder, account_number, ifsc_code, bank_name, preferred_method } = req.body;
    
    const method = preferred_method === 'Bank' ? 'Bank' : 'UPI';
    
    const cleanUpi = upi_id ? upi_id.trim() : null;
    const cleanHolder = account_holder ? account_holder.trim() : null;
    const cleanAccNum = account_number ? account_number.trim() : null;
    const cleanIfsc = ifsc_code ? ifsc_code.trim().toUpperCase() : null;
    const cleanBank = bank_name ? bank_name.trim() : null;

    if (method === 'UPI' && !cleanUpi) {
      return res.status(400).json({ error: 'UPI ID is required when UPI is selected.' });
    }
    if (method === 'Bank' && (!cleanAccNum || !cleanIfsc)) {
      return res.status(400).json({ error: 'Account number and IFSC code are required when Bank Transfer is selected.' });
    }

    const existingRes = await query(`SELECT id FROM payout_details WHERE user_id = $1`, [req.user.id]);
    const exists = existingRes.rows && existingRes.rows.length > 0;

    if (exists) {
      await query(
        `UPDATE payout_details 
         SET upi_id = $1,
             account_holder = $2,
             account_number = $3,
             ifsc_code = $4,
             bank_name = $5,
             preferred_method = $6,
             updated_at = NOW()
         WHERE user_id = $7`,
        [cleanUpi, cleanHolder, cleanAccNum, cleanIfsc, cleanBank, method, req.user.id]
      );
    } else {
      const { v4: uuidv4 } = require('uuid');
      const id = uuidv4();
      await query(
        `INSERT INTO payout_details (id, user_id, upi_id, account_holder, account_number, ifsc_code, bank_name, preferred_method, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())`,
        [id, req.user.id, cleanUpi, cleanHolder, cleanAccNum, cleanIfsc, cleanBank, method]
      );
    }

    res.json({ message: 'Payment details updated successfully.' });

  } catch (err) {
    next(err);
  }
}

async function withdraw(req, res, next) {
  try {
    const { amount, method } = req.body;
    const withdrawAmount = parseFloat(amount);
    
    if (isNaN(withdrawAmount) || withdrawAmount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }
    
    if (withdrawAmount < MIN_WITHDRAWAL) {
      return res.status(400).json({ error: `Minimum withdrawal is ₹${MIN_WITHDRAWAL}` });
    }
    
    const result = await withTransaction(async (client) => {
      const walletRes = await client.query(
        `SELECT available_prize FROM wallets WHERE user_id = $1 FOR UPDATE`,
        [req.user.id]
      );
      const available = parseFloat(walletRes.rows[0].available_prize);
      
      if (available < withdrawAmount) {
        throw Object.assign(new Error('Insufficient prize balance'), { status: 400 });
      }

      // Fetch saved payout details to snapshot
      const payoutRes = await client.query(
        `SELECT upi_id, account_holder, account_number, ifsc_code, bank_name, preferred_method
         FROM payout_details WHERE user_id = $1`,
        [req.user.id]
      );
      const payoutRow = payoutRes.rows[0];
      const snapshot = payoutRow ? {
        upi_id: payoutRow.upi_id,
        account_holder: payoutRow.account_holder,
        account_number: payoutRow.account_number,
        ifsc_code: payoutRow.ifsc_code,
        bank_name: payoutRow.bank_name,
        preferred_method: payoutRow.preferred_method
      } : null;
      
      await client.query(
        `UPDATE wallets SET available_prize = available_prize - $1, updated_at = now() WHERE user_id = $2`,
        [withdrawAmount, req.user.id]
      );
      
      const insertRes = await client.query(
        `INSERT INTO withdrawal_history (user_id, amount, method, payout_snapshot, status)
         VALUES ($1, $2, $3, $4, 'Processing') RETURNING id`,
        [req.user.id, withdrawAmount, method || (payoutRow ? payoutRow.preferred_method : 'UPI'), snapshot]
      );
      
      return insertRes.rows[0].id;
    });
    
    res.json({ message: 'Withdrawal requested successfully', transactionId: result });
  } catch (err) {
    next(err);
  }
}

async function redeemCoupon(req, res, next) {
  try {
    const { code } = req.body;
    if (!code) return res.status(400).json({ error: 'Coupon code is required.' });

    const result = await withTransaction(async (client) => {
      // Fetch the coupon with a row lock
      const couponRes = await client.query(
        `SELECT * FROM coupons WHERE code = $1 FOR UPDATE`,
        [code.toUpperCase().trim()]
      );
      if (!couponRes.rows[0]) throw Object.assign(new Error('Invalid coupon code.'), { status: 400 });
      const coupon = couponRes.rows[0];

      if (!coupon.is_active) throw Object.assign(new Error('This coupon is no longer active.'), { status: 400 });
      if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
        throw Object.assign(new Error('This coupon has expired.'), { status: 400 });
      }
      if (coupon.max_redemptions !== null && coupon.redemptions_count >= coupon.max_redemptions) {
        throw Object.assign(new Error('This coupon has reached its maximum redemptions.'), { status: 400 });
      }

      // Check if user already redeemed this coupon
      const alreadyRes = await client.query(
        `SELECT id FROM coupon_redemptions WHERE user_id = $1 AND coupon_id = $2`,
        [req.user.id, coupon.id]
      );
      if (alreadyRes.rows[0]) {
        throw Object.assign(new Error('You have already redeemed this coupon.'), { status: 400 });
      }

      const pointsAwarded = parseInt(coupon.points, 10) || 0;
      const rewardAwarded = parseFloat(coupon.reward_amount) || 0;

      // Award points
      if (pointsAwarded > 0) {
        const pointsService = require('../utils/pointsService');
        await pointsService.credit(client, {
          userId: req.user.id,
          amount: pointsAwarded,
          type: 'admin_adjustment',
          description: `Coupon redeemed: ${coupon.code}`,
        });
      }

      // Award prize balance
      if (rewardAwarded > 0) {
        await client.query(
          `INSERT INTO wallets (user_id) VALUES ($1) ON CONFLICT (user_id) DO NOTHING`,
          [req.user.id]
        );
        await client.query(
          `UPDATE wallets SET
            available_prize = available_prize + $1,
            lifetime_prize  = lifetime_prize + $1,
            updated_at = now()
           WHERE user_id = $2`,
          [rewardAwarded, req.user.id]
        );
      }

      // Record the redemption
      await client.query(
        `INSERT INTO coupon_redemptions (coupon_id, user_id, points_awarded, reward_awarded)
         VALUES ($1, $2, $3, $4)`,
        [coupon.id, req.user.id, pointsAwarded, rewardAwarded]
      );

      // Increment redemptions count
      await client.query(
        `UPDATE coupons SET redemptions_count = redemptions_count + 1 WHERE id = $1`,
        [coupon.id]
      );

      return { pointsAwarded, rewardAwarded, code: coupon.code };
    });

    res.json({
      message: `Coupon "${result.code}" redeemed successfully! 🎉`,
      pointsAwarded: result.pointsAwarded,
      rewardAwarded: result.rewardAwarded,
    });
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message });
    next(err);
  }
}

module.exports = {
  getWalletSummary,
  getPointsHistory,
  getPrizeHistory,
  getWithdrawHistory,
  getPayoutDetails,
  updatePayoutDetails,
  withdraw,
  redeemCoupon,
};
