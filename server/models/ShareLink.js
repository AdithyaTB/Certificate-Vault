const mongoose = require('mongoose');

const shareLinkSchema = new mongoose.Schema(
    {
        certificateId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Certificate',
            required: true,
        },
        publicToken: {
            type: String,
            required: true,
            unique: true,
        },
        expiresAt: {
            type: Date,
            default: null, // null means never expires
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('ShareLink', shareLinkSchema);
