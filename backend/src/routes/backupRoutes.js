const express = require('express');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const backupController = require('../controllers/backupController');

const router = express.Router();

// Admin-only: this workbook includes password hashes and full user PII,
// so it must never be reachable without a valid admin session.
router.use(requireAuth, requireAdmin);

router.get('/excel', backupController.downloadExcelBackup);
router.post('/excel/save', backupController.saveExcelBackup);

module.exports = router;
