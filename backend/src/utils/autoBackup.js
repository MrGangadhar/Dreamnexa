/**
 * utils/autoBackup.js
 * ---------------------------------------------------------------------
 * Automatic Excel Backup Service
 *
 * Automatically generates and updates Excel backup files containing:
 *  - Latest Government Job Notifications
 *  - User Earning Points & Transaction History
 *  - User Credentials & Profiles
 *  - Quizzes, Attempts, Answers, and Prize History
 *
 * Provides:
 *  1. `triggerAutoBackup(reason)` — Debounced event-driven backup.
 *  2. `startScheduledBackups()` — Background cron job for periodic backups.
 * ---------------------------------------------------------------------
 */

'use strict';

const path = require('path');
const fs = require('fs');
const cron = require('node-cron');
const { buildBackupWorkbook } = require('./excelBackup');

const BACKUP_DIR = path.join(__dirname, '../../backups');
const LATEST_BACKUP_FILE = path.join(BACKUP_DIR, 'dreamnexa-latest-backup.xlsx');

let debounceTimer = null;
let isBackingUp = false;

function ensureBackupDir() {
  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
  }
}

function getTimestampedFilename() {
  const ts = new Date().toISOString().replace(/[:.]/g, '-');
  return `dreamnexa-backup-${ts}.xlsx`;
}

/**
 * Performs the actual Excel file write operation.
 */
async function performBackup(reason = 'Manual/Triggered') {
  if (isBackingUp) {
    return;
  }
  isBackingUp = true;
  try {
    ensureBackupDir();

    const workbook = await buildBackupWorkbook();

    // 1. Update master 'dreamnexa-latest-backup.xlsx' file
    await workbook.xlsx.writeFile(LATEST_BACKUP_FILE);

    // 2. Write timestamped backup file
    const timestampedFile = path.join(BACKUP_DIR, getTimestampedFilename());
    await workbook.xlsx.writeFile(timestampedFile);

    console.log(`[AutoBackup] ✅ Backup updated successfully (Trigger: "${reason}")`);
    console.log(`[AutoBackup] 📂 Latest master: backups/dreamnexa-latest-backup.xlsx`);
    console.log(`[AutoBackup] 📂 Timestamped: backups/${path.basename(timestampedFile)}`);
  } catch (err) {
    console.error(`[AutoBackup] ❌ Backup failed (Trigger: "${reason}"):`, err.message);
  } finally {
    isBackingUp = false;
  }
}

/**
 * Debounced trigger for auto backup.
 * Prevents multiple rapid updates from spamming disk writes.
 */
function triggerAutoBackup(reason = 'Data Update', delayMs = 2000) {
  if (process.env.NODE_ENV === 'test') return;
  if (debounceTimer) {
    clearTimeout(debounceTimer);
  }
  debounceTimer = setTimeout(() => {
    debounceTimer = null;
    performBackup(reason).catch((err) => {
      console.error('[AutoBackup] Unhandled error during backup:', err);
    });
  }, delayMs);
}

/**
 * Starts a background scheduled cron job.
 * Default: Every hour ('0 * * * *') or configurable via env AUTO_BACKUP_CRON.
 */
function startScheduledBackups(cronSchedule = process.env.AUTO_BACKUP_CRON || '0 * * * *') {
  if (!cron.validate(cronSchedule)) {
    console.warn(`[AutoBackup] Invalid cron schedule "${cronSchedule}". Defaulting to '0 * * * *' (hourly).`);
    cronSchedule = '0 * * * *';
  }

  console.log(`[AutoBackup] ⏰ Background cron job initialized with schedule: "${cronSchedule}"`);
  cron.schedule(cronSchedule, () => {
    performBackup('Scheduled Cron Job').catch((err) => {
      console.error('[AutoBackup] Error in cron backup:', err);
    });
  });
}

module.exports = {
  triggerAutoBackup,
  performBackup,
  startScheduledBackups,
  LATEST_BACKUP_FILE,
  BACKUP_DIR,
};
