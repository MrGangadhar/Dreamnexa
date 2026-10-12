const path = require('path');
const fs = require('fs');
const { buildBackupWorkbook } = require('../utils/excelBackup');

const BACKUP_DIR = path.join(__dirname, '../../backups');

function timestampedFilename() {
  const ts = new Date().toISOString().replace(/[:.]/g, '-');
  return `dreamnexa-backup-${ts}.xlsx`;
}

/**
 * GET /api/admin/backup/excel
 * Streams a freshly generated .xlsx straight to the admin's browser —
 * nothing is written to disk.
 */
async function downloadExcelBackup(req, res, next) {
  try {
    const workbook = await buildBackupWorkbook();
    const filename = timestampedFilename();

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/admin/backup/excel/save
 * Generates the workbook and saves it under backend/backups/ on the
 * server's disk (handy for a cron job or manual periodic backups),
 * returning the saved filename instead of the file bytes.
 */
async function saveExcelBackup(req, res, next) {
  try {
    if (!fs.existsSync(BACKUP_DIR)) {
      fs.mkdirSync(BACKUP_DIR, { recursive: true });
    }

    const workbook = await buildBackupWorkbook();
    const filename = timestampedFilename();
    const filePath = path.join(BACKUP_DIR, filename);

    await workbook.xlsx.writeFile(filePath);

    res.status(201).json({
      message: 'Excel backup saved on the server.',
      filename,
      path: `/backups/${filename}`,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { downloadExcelBackup, saveExcelBackup };
