require('dotenv').config();
const { withTransaction, pool } = require('./src/db/pool');

async function cleanTestUsers() {
  console.log('🧹 Starting cleanup of test/demo users...');
  await withTransaction(async (client) => {
    // Select all test users
    const testUsersRes = await client.query(`
      SELECT id, username, email FROM users 
      WHERE username LIKE 'testuser_%' 
         OR email LIKE '%@example.com' 
         OR username IN ('priya_sharma', 'arjun_mehta', 'sneha_iyer', 'karan_patel', 'ananya_reddy', 'demo_user', 'aarav', 'maya', 'rohan')
    `);

    const ids = (testUsersRes.rows || []).map((r) => r.id);
    console.log(`Found ${ids.length} test user(s) to remove.`);

    if (ids.length === 0) {
      console.log('No test users found in DB.');
      return;
    }

    // Clear referred_by foreign key references across all profiles
    await client.query('UPDATE profiles SET referred_by = NULL');

    for (const id of ids) {
      await client.query('DELETE FROM quiz_answers WHERE attempt_id IN (SELECT id FROM quiz_attempts WHERE user_id = $1)', [id]);
      await client.query('DELETE FROM quiz_attempts WHERE user_id = $1', [id]);
      await client.query('DELETE FROM contest_participants WHERE user_id = $1', [id]);
      await client.query('DELETE FROM user_badges WHERE user_id = $1', [id]);
      await client.query('DELETE FROM notifications WHERE user_id = $1', [id]);
      await client.query('DELETE FROM points_transactions WHERE user_id = $1', [id]);
      await client.query('DELETE FROM points_history WHERE user_id = $1', [id]);
      await client.query('DELETE FROM reward_history WHERE user_id = $1', [id]);
      await client.query('DELETE FROM withdrawal_history WHERE user_id = $1', [id]);
      await client.query('DELETE FROM news_bookmarks WHERE user_id = $1', [id]);
      await client.query('DELETE FROM proctoring_events WHERE session_id IN (SELECT id FROM proctoring_sessions WHERE user_id = $1)', [id]);
      await client.query('DELETE FROM proctoring_sessions WHERE user_id = $1', [id]);
      await client.query('DELETE FROM wallets WHERE user_id = $1', [id]);
      await client.query('DELETE FROM profiles WHERE user_id = $1', [id]);
      await client.query('DELETE FROM users WHERE id = $1', [id]);
    }

    console.log(`✔ Successfully deleted all ${ids.length} test users from database.`);
  });
}

cleanTestUsers()
  .catch((err) => {
    console.error('✖ Cleanup failed:', err);
  })
  .finally(async () => {
    await pool.end();
  });
