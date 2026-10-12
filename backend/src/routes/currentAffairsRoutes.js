'use strict';

const express = require('express');
const router = express.Router();
const controller = require('../controllers/currentAffairsController');
const { requireAuth, requireAdmin } = require('../middleware/auth');

// Public routes
router.get('/', controller.getCurrentAffairs);
router.get('/categories', controller.getCategories);
router.get('/:id', controller.getCurrentAffairById);

// Admin routes
router.get('/admin/all', requireAuth, requireAdmin, controller.adminGetAll);
router.post('/admin', requireAuth, requireAdmin, controller.adminCreate);
router.put('/admin/:id', requireAuth, requireAdmin, controller.adminUpdate);
router.delete('/admin/:id', requireAuth, requireAdmin, controller.adminDelete);

module.exports = router;
