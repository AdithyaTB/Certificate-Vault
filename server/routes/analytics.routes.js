const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const { getDashboardStats } = require('../controllers/analytics.controller');

router.use(protect);

router.route('/dashboard').get(getDashboardStats);

module.exports = router;
