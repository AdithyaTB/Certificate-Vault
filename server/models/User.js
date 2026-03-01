const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
    {
        name: { type: String, required: [true, 'Please add a name'] },
        email: {
            type: String,
            required: [true, 'Please add an email'],
            unique: true,
            match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please add a valid email'],
        },
        password: { type: String, required: [true, 'Please add a password'], minlength: 6, select: false },
        avatar: { type: String, default: '' },
        role: { type: String, enum: ['user', 'admin'], default: 'user' },
        status: { type: String, enum: ['active', 'banned', 'suspended'], default: 'active' },

        storageUsed: { type: Number, default: 0 },

        // Extended profile
        bio: { type: String, default: '', maxlength: 200 },
        website: { type: String, default: '' },
        social: {
            linkedin: { type: String, default: '' },
            github: { type: String, default: '' },
            twitter: { type: String, default: '' },
        },

        // App-level settings
        settings: {
            // Certificate preferences
            defaultVisibility: { type: String, enum: ['public', 'private'], default: 'private' },
            previewMode: { type: String, enum: ['grid', 'list'], default: 'grid' },
            // Notifications
            notifications: {
                emailOnUpload: { type: Boolean, default: true },
                emailOnShare: { type: Boolean, default: true },
                monthlyReport: { type: Boolean, default: false },
                weeklyEmailReport: { type: Boolean, default: false },
            },
            // Privacy
            privacy: {
                publicProfile: { type: Boolean, default: false },
                privateCertificates: { type: Boolean, default: true },
                hideIssuerDetails: { type: Boolean, default: false },
                disableDownloads: { type: Boolean, default: false },
            },
            // Analytics widget visibility
            analytics: {
                showUploadTrend: { type: Boolean, default: true },
                showSkillsChart: { type: Boolean, default: true },
                showFolderChart: { type: Boolean, default: true },
            },
        },
    },
    { timestamps: true }
);

// Encrypt password using bcrypt
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
