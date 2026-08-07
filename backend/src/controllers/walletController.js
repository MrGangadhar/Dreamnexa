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
      
      await client.query(
        `UPDATE wallets SET available_prize = available_prize - $1, updated_at = now() WHERE user_id = $2`,
        [withdrawAmount, req.user.id]
      );
      
      const insertRes = await client.query(
        `INSERT INTO withdrawal_history (user_id, amount, method, status)
         VALUES ($1, $2, $3, 'Processing') RETURNING id`,
        [req.user.id, withdrawAmount, method]
      );
      
      return insertRes.rows[0].id;
    });
    
    res.json({ message: 'Withdrawal requested successfully', transactionId: result });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getWalletSummary,
  getPointsHistory,
  getPrizeHistory,
  getWithdrawHistory,
  withdraw
};
