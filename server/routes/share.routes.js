const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const {
    generateShareLink,
    getPublicCertificate,
} = require('../controllers/share.controller');

// Generate link requires auth
router.post('/share/:certificateId', protect, generateShareLink);

// View public certificate is public
router.get('/public/:token', getPublicCertificate);

module.exports = router;
