const express = require('express');
const { requireAuth } = require('../middleware/auth');
const proctoringController = require('../controllers/proctoringController');

const router = express.Router();
router.use(requireAuth);

router.post('/:contestId/consent', proctoringController.submitConsent);
router.post('/:contestId/system-check', proctoringController.submitSystemCheck);
router.post('/:contestId/events', proctoringController.ingestEvent);
router.get('/:contestId/state', proctoringController.getSessionState);

module.exports = router;
