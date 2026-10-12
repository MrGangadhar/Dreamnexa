/**
 * migratePayoutDetails.js
 * Creates payout_details table and adds payout_snapshot column to withdrawal_history.
 */
'use strict';
require('dotenv').config();
const { query } = require('./pool');

async function runMigration() {
  console.log('Starting payout_details & withdrawal_history migration...');

  try {
    // 1. Create payout_details table
    await query(`
      CREATE TABLE IF NOT EXISTS payout_details (
        id                CHAR(36)      PRIMARY KEY,
        user_id           CHAR(36)      NOT NULL UNIQUE,
        upi_id            VARCHAR(100)  DEFAULT NULL,
        account_holder    VARCHAR(150)  DEFAULT NULL,
        account_number    VARCHAR(30)   DEFAULT NULL,
        ifsc_code         VARCHAR(15)   DEFAULT NULL,
        bank_name         VARCHAR(100)  DEFAULT NULL,
        preferred_method  VARCHAR(10)   NOT NULL DEFAULT 'UPI',
        updated_at        DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
    console.log('✅ payout_details table ready.');

    // 2. Add payout_snapshot column directly
    try {
      await query(`
        ALTER TABLE withdrawal_history 
        ADD COLUMN payout_snapshot JSON DEFAULT NULL AFTER method
      `);
      console.log('✅ Added payout_snapshot column to withdrawal_history.');
    } catch (err) {
      if (err.code === 'ER_DUP_FIELDNAME' || (err.message && err.message.includes('Duplicate column'))) {
        console.log('ℹ️ payout_snapshot column already exists.');
      } else {
        throw err;
      }
    }

    console.log('Migration completed successfully.');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

runMigration();
