const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload.middleware');
const { protect } = require('../middleware/auth.middleware');
const {
    uploadCertificate,
    getCertificates,
    getCertificateById,
    updateCertificate,
    deleteCertificate,
} = require('../controllers/certificate.controller');

// Protect all routes
router.use(protect);

router.route('/')
    .get(getCertificates);

router.route('/upload')
    .post(upload.single('file'), uploadCertificate);

router.route('/:id')
    .get(getCertificateById)
    .put(updateCertificate)
    .delete(deleteCertificate);

module.exports = router;
