'use strict';

const express = require('express');
const jc      = require('../controllers/govtJobsController');

const router = express.Router();

// Public (no auth required)
router.get('/',        jc.listPublished);
router.get('/states',  jc.listStates);

module.exports = router;
