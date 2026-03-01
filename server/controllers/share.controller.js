const crypto = require('crypto');
const ShareLink = require('../models/ShareLink');
const Certificate = require('../models/Certificate');

// @desc    Generate a share link for a certificate
// @route   POST /api/share/:certificateId
// @access  Private
const generateShareLink = async (req, res) => {
    try {
        const { certificateId } = req.params;
        const { expiresAt } = req.body; // Optional expiration date

        // Validate certificate ownership
        const certificate = await Certificate.findById(certificateId);
        if (!certificate) {
            res.status(404);
            throw new Error('Certificate not found');
        }

        if (certificate.user.toString() !== req.user._id.toString()) {
            res.status(401);
            throw new Error('Not authorized to share this certificate');
        }

        // Check if link already exists
        let shareLink = await ShareLink.findOne({ certificateId });

        if (shareLink) {
            // Update expiry if provided, or just return existing
            if (expiresAt) {
                shareLink.expiresAt = expiresAt;
                await shareLink.save();
            }
            return res.status(200).json(shareLink);
        }

        // Generate unique token
        const publicToken = crypto.randomBytes(20).toString('hex');

        shareLink = await ShareLink.create({
            certificateId,
            publicToken,
            expiresAt: expiresAt || null,
        });

        res.status(201).json(shareLink);
    } catch (error) {
        res.status(res.statusCode === 200 ? 500 : res.statusCode).json({ message: error.message });
    }
};

// @desc    Get certificate via public token
// @route   GET /api/public/:token
// @access  Public
const getPublicCertificate = async (req, res) => {
    try {
        const { token } = req.params;

        const shareLink = await ShareLink.findOne({ publicToken: token }).populate({
            path: 'certificateId',
            populate: { path: 'category', select: 'name color' }
        });

        if (!shareLink) {
            res.status(404);
            throw new Error('Invalid or expired link');
        }

        // Check expiration
        if (shareLink.expiresAt && new Date(shareLink.expiresAt) < new Date()) {
            // Optional: Clean up expired link
            await shareLink.deleteOne();
            res.status(410);
            throw new Error('This share link has expired');
        }

        // Optionally increment view count on certificate here if model had one

        res.status(200).json(shareLink.certificateId);
    } catch (error) {
        res.status(res.statusCode === 200 ? 500 : res.statusCode).json({ message: error.message });
    }
};

module.exports = {
    generateShareLink,
    getPublicCertificate,
};
