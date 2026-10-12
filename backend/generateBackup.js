/**
 * generateBackup.js
 * ─────────────────────────────────────────────────────────────────────
 * Standalone script that generates a full DreamNexa Excel backup and
 * saves it to backend/backups/ without needing the HTTP server.
 *
 * Usage (from the backend/ directory):
 *   node generateBackup.js
 *
 * Or from the project root:
 *   node backend/generateBackup.js
 * ─────────────────────────────────────────────────────────────────────
 */

require('dotenv').config();         // loads .env from backend/ (or cwd)
const path = require('path');
const fs   = require('fs');
const { buildBackupWorkbook } = require('./src/utils/excelBackup');
const { pool }               = require('./src/db/pool');

const BACKUP_DIR = path.join(__dirname, 'backups');

function timestampedFilename() {
  const ts = new Date().toISOString().replace(/[:.]/g, '-');
  return `dreamnexa-backup-${ts}.xlsx`;
}

(async () => {
  try {
    console.log('🔄  Building DreamNexa Excel backup…');

    if (!fs.existsSync(BACKUP_DIR)) {
      fs.mkdirSync(BACKUP_DIR, { recursive: true });
    }

    const workbook = await buildBackupWorkbook();
    const filename = timestampedFilename();
    const filePath = path.join(BACKUP_DIR, filename);

    await workbook.xlsx.writeFile(filePath);

    console.log(`✅  Backup saved: backups/${filename}`);
    console.log(`📂  Full path   : ${filePath}`);
  } catch (err) {
    console.error('✖  Backup failed:', err.message);
    process.exitCode = 1;
  } finally {
    // Close DB pool so the script exits cleanly
    try { await pool.end(); } catch (_) {}
  }
})();
