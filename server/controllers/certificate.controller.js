const Certificate = require('../models/Certificate');
const Category = require('../models/Category');
const { uploadToCloudinary, deleteFromCloudinary } = require('../services/storage.service');
const APIFeatures = require('../utils/apiFeatures');

// @desc    Upload a new certificate
// @route   POST /api/certificates/upload
// @access  Private
const uploadCertificate = async (req, res) => {
    try {
        if (!req.file) {
            res.status(400);
            throw new Error('Please upload a file');
        }

        const { title, category, folder, tags, issuer, issueDate, expiryDate, credentialId, credentialUrl, skills, description } = req.body;

        if (!title) {
            res.status(400);
            throw new Error('Please provide a title');
        }

        // Upload to Cloudinary
        let cloudResult;
        try {
            cloudResult = await uploadToCloudinary(req.file.buffer, `certificates/${req.user._id}`);
        } catch (error) {
            res.status(500);
            throw new Error('Image upload failed');
        }

        // Process tags and skills
        let parsedTags = [];
        if (tags) {
            parsedTags = Array.isArray(tags) ? tags : tags.split(',').map(tag => tag.trim());
        }
        let parsedSkills = [];
        if (skills) {
            parsedSkills = Array.isArray(skills) ? skills : skills.split(',').map(skill => skill.trim());
        }

        const certificate = await Certificate.create({
            user: req.user._id,
            title,
            category: category || null,
            folder: folder || null,
            tags: parsedTags,
            issuer: issuer || 'Unknown Issuer',
            issueDate: issueDate || Date.now(),
            expiryDate: expiryDate || null,
            credentialId: credentialId || '',
            credentialUrl: credentialUrl || '',
            skills: parsedSkills,
            description: description || '',
            fileUrl: cloudResult.secure_url,
            fileType: cloudResult.format || req.file.mimetype.split('/')[1],
            size: req.file.size,
        });

        res.status(201).json(certificate);
    } catch (error) {
        res.status(res.statusCode === 200 ? 500 : res.statusCode).json({ message: error.message });
    }
};

// @desc    Get all active user's certificates
// @route   GET /api/certificates
// @access  Private
const getCertificates = async (req, res) => {
    try {
        // Basic query ensures a user only sees their own
        let baseQuery = Certificate.find({ user: req.user._id })
            .populate('category', 'name color')
            .populate('folder', 'name');

        const features = new APIFeatures(baseQuery, req.query)
            .search()
            .filter()
            .sort()
            .paginate();

        const certificates = await features.query;

        // Total count for pagination
        const totalCount = await Certificate.countDocuments({ user: req.user._id });

        res.status(200).json({
            count: certificates.length,
            total: totalCount,
            data: certificates,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get a single certificate
// @route   GET /api/certificates/:id
// @access  Private
const getCertificateById = async (req, res) => {
    try {
        const certificate = await Certificate.findById(req.params.id)
            .populate('category', 'name color')
            .populate('folder', 'name');

        if (!certificate) {
            res.status(404);
            throw new Error('Certificate not found');
        }

        // Verify ownership
        if (certificate.user.toString() !== req.user._id.toString()) {
            res.status(401);
            throw new Error('Not authorized to access this certificate');
        }

        res.status(200).json(certificate);
    } catch (error) {
        res.status(res.statusCode === 200 ? 500 : res.statusCode).json({ message: error.message });
    }
};

// @desc    Update a certificate
// @route   PUT /api/certificates/:id
// @access  Private
const updateCertificate = async (req, res) => {
    try {
        let certificate = await Certificate.findById(req.params.id);

        if (!certificate) {
            res.status(404);
            throw new Error('Certificate not found');
        }

        // Verify ownership
        if (certificate.user.toString() !== req.user._id.toString()) {
            res.status(401);
            throw new Error('Not authorized to update this certificate');
        }

        const { title, category, folder, tags, issuer, issueDate, expiryDate, credentialId, credentialUrl, skills, description, isFavorite } = req.body;
        let updateFields = { title, category, folder, issuer, issueDate, expiryDate, credentialId, credentialUrl, description, isFavorite };

        if (skills) {
            updateFields.skills = Array.isArray(skills) ? skills : skills.split(',').map(skill => skill.trim());
        }
        if (tags) {
            updateFields.tags = Array.isArray(tags) ? tags : tags.split(',').map(tag => tag.trim());
        }

        certificate = await Certificate.findByIdAndUpdate(
            req.params.id,
            { $set: updateFields },
            { new: true, runValidators: true }
        );

        res.status(200).json(certificate);
    } catch (error) {
        res.status(res.statusCode === 200 ? 500 : res.statusCode).json({ message: error.message });
    }
};

// @desc    Delete a certificate
// @route   DELETE /api/certificates/:id
// @access  Private
const deleteCertificate = async (req, res) => {
    try {
        const certificate = await Certificate.findById(req.params.id);

        if (!certificate) {
            res.status(404);
            throw new Error('Certificate not found');
        }

        // Verify ownership
        if (certificate.user.toString() !== req.user._id.toString()) {
            res.status(401);
            throw new Error('Not authorized to delete this certificate');
        }

        // Extract public_id from Cloudinary URL if possible to delete it
        // Example: https://res.cloudinary.com/cloud_name/image/upload/v123456789/folder/xyz.jpg => folder/xyz
        try {
            if (certificate.fileUrl && certificate.fileUrl.includes('cloudinary')) {
                const urlParts = certificate.fileUrl.split('/');
                const filenameWithExt = urlParts.pop();
                const folderNameParts = urlParts.slice(urlParts.indexOf('upload') + 2); // skipping version
                const folderPath = folderNameParts.join('/');
                const publicId = `${folderPath}/${filenameWithExt.split('.')[0]}`;
                await deleteFromCloudinary(publicId);
            }
        } catch (e) {
            console.warn('Could not delete file from cloudinary', e);
        }

        await certificate.deleteOne();

        res.status(200).json({ id: req.params.id, message: 'Certificate deleted successfully' });
    } catch (error) {
        res.status(res.statusCode === 200 ? 500 : res.statusCode).json({ message: error.message });
    }
};

module.exports = {
    uploadCertificate,
    getCertificates,
    getCertificateById,
    updateCertificate,
    deleteCertificate,
};
