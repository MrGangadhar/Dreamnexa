/**
 * Points Service
 * ---------------------------------------------------------------------
 * QuizArena uses an in-app points ledger instead of a real-money wallet.
 *
 * Hard rules enforced by design:
 *   1. Points can NEVER be purchased with real money — there is no
 *      deposit endpoint anywhere in this codebase.
 *   2. Points can NEVER be withdrawn or cashed out — there is no
 *      withdrawal endpoint anywhere in this codebase.
 *   3. Points are earned only via free actions: signing up, daily
 *      logins, referrals, and contest participation/ranking.
 *   4. Contest "entry cost" (if a template sets one > 0) is paid out of
 *      previously-earned points, never out of purchased points, so the
 *      whole system is closed-loop and money never enters it.
 * ---------------------------------------------------------------------
 */

async function getBalance(client, userId) {
  const res = await client.query(
    `SELECT COALESCE(SUM(amount), 0)::int AS balance FROM points_transactions WHERE user_id = $1`,
    [userId]
  );
  return res.rows[0].balance;
}

async function credit(client, { userId, amount, type, referenceId = null, description = '' }) {
  if (amount <= 0) throw new Error('Credit amount must be positive.');
  await client.query(
    `INSERT INTO points_transactions (user_id, amount, type, reference_id, description)
     VALUES ($1, $2, $3, $4, $5)`,
    [userId, amount, type, referenceId, description]
  );
  await client.query(
    `UPDATE profiles SET total_points = total_points + $1, updated_at = now() WHERE user_id = $2`,
    [amount, userId]
  );
}

async function debit(client, { userId, amount, type, referenceId = null, description = '' }) {
  if (amount <= 0) throw new Error('Debit amount must be positive.');
  const balance = await getBalance(client, userId);
  if (balance < amount) {
    const err = new Error('Insufficient points balance.');
    err.status = 400;
    err.publicMessage = 'You do not have enough points to join this contest.';
    throw err;
  }
  await client.query(
    `INSERT INTO points_transactions (user_id, amount, type, reference_id, description)
     VALUES ($1, $2, $3, $4, $5)`,
    [userId, -amount, type, referenceId, description]
  );
  await client.query(
    `UPDATE profiles SET total_points = total_points - $1, updated_at = now() WHERE user_id = $2`,
    [amount, userId]
  );
}

module.exports = { getBalance, credit, debit };
