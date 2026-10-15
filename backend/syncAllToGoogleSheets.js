/**
 * syncAllToGoogleSheets.js
 * ---------------------------------------------------------------------
 * Standalone script to back up all website data into Google Sheets.
 * Run directly with:
 *   node syncAllToGoogleSheets.js
 * ---------------------------------------------------------------------
 */

'use strict';

require('dotenv').config();
const { syncAllDataToGoogleSheets } = require('./src/utils/googleSheetsSync');
const { pool } = require('./src/db/pool');

async function main() {
  console.log('🚀 Initiating full website data backup to Google Sheets...');
  try {
    const result = await syncAllDataToGoogleSheets();
    console.log('✅ Full backup completed successfully!');
    console.log('📊 Records Synced:');
    console.log(`   - Users: ${result.summary.usersCount}`);
    console.log(`   - Quiz Attempts: ${result.summary.attemptsCount}`);
    console.log(`   - Contest Leaderboard: ${result.summary.leaderboardCount}`);
    console.log(`   - Contests Schedule: ${result.summary.contestsCount}`);
    console.log(`   - Quizzes: ${result.summary.quizzesCount}`);
    console.log(`   - Points Transactions: ${result.summary.pointsCount}`);
    console.log(`   - Govt Jobs: ${result.summary.jobsCount}`);
    console.log('🎉 Check your Google Sheet to view all the synced tabs!');
  } catch (err) {
    console.error('❌ Failed to sync to Google Sheets:', err.message);
  } finally {
    try { await pool.end(); } catch {}
  }
}

main();
