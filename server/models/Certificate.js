const mongoose = require('mongoose');

const certificateSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        title: {
            type: String,
            required: [true, 'Please add a certificate title'],
            trim: true,
        },
        category: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Category',
            default: null,
        },
        folder: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Folder',
            default: null,
        },
        tags: {
            type: [String],
            default: [],
        },
        issuer: {
            type: String,
            default: 'Unknown Issuer',
        },
        issueDate: {
            type: Date,
            default: Date.now,
        },
        expiryDate: {
            type: Date,
        },
        credentialId: {
            type: String,
        },
        credentialUrl: {
            type: String,
        },
        skills: {
            type: [String],
            default: [],
        },
        description: {
            type: String,
        },
        fileUrl: {
            type: String,
            required: [true, 'Please provide the file URL'],
        },
        fileType: {
            type: String,
            enum: ['pdf', 'jpg', 'jpeg', 'png'],
            required: true,
        },
        size: {
            type: Number, // In bytes
            required: true,
        },
        isFavorite: {
            type: Boolean,
            default: false,
        },
        // ── Admin moderation ──
        moderationStatus: {
            type: String,
            enum: ['pending', 'approved', 'flagged', 'rejected'],
            default: 'pending',
        },
        moderationReason: { type: String, default: '' },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Certificate', certificateSchema);
