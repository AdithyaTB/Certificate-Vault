const mongoose = require('mongoose');

// ── Config (singleton) ────────────────────────────────────────────────────────
// Stores platform-wide feature flags and the current announcement banner.
const configSchema = new mongoose.Schema(
    {
        key: { type: String, default: 'global', unique: true },

        // Feature flags
        features: {
            aiAutoTagging: { type: Boolean, default: false },
            publicSharing: { type: Boolean, default: true },
            bulkUpload: { type: Boolean, default: true },
            certificateModeration: { type: Boolean, default: false },
            maintenanceMode: { type: Boolean, default: false },
        },

        // Announcement banner shown to all users
        announcement: {
            enabled: { type: Boolean, default: false },
            message: { type: String, default: '' },
            type: { type: String, enum: ['info', 'warning', 'success'], default: 'info' },
            expiresAt: { type: Date, default: null },
        },

        // Verified issuers (admin-curated)
        verifiedIssuers: [
            {
                name: { type: String, required: true },
                website: { type: String, default: '' },
                logo: { type: String, default: '' },
                addedAt: { type: Date, default: Date.now },
            },
        ],
    },
    { timestamps: true }
);

module.exports = mongoose.model('Config', configSchema);
