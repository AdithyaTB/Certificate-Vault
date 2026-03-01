const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const { uploadToCloudinary } = require('../services/storage.service');

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) { res.status(400); throw new Error('Please add all fields'); }

        const userExists = await User.findOne({ email });
        if (userExists) { res.status(400); throw new Error('User already exists'); }

        const user = await User.create({ name, email, password });
        if (user) {
            res.status(201).json({ _id: user.id, name: user.name, email: user.email, role: user.role, avatar: user.avatar, token: generateToken(user._id) });
        } else { res.status(400); throw new Error('Invalid user data'); }
    } catch (error) { res.status(res.statusCode || 500).json({ message: error.message }); }
};

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email }).select('+password');
        if (user && (await user.matchPassword(password))) {
            res.json({ _id: user.id, name: user.name, email: user.email, role: user.role, avatar: user.avatar, token: generateToken(user._id) });
        } else { res.status(401); throw new Error('Invalid credentials'); }
    } catch (error) { res.status(res.statusCode || 500).json({ message: error.message }); }
};

// @desc    Get user data
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
    try { res.status(200).json(req.user); }
    catch (error) { res.status(500).json({ message: error.message }); }
};

// @desc    Update user profile + settings
// @route   PUT /api/auth/update-profile
// @access  Private
const updateProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) { res.status(404); throw new Error('User not found'); }

        // Core profile fields
        const { name, bio, website, social, settings } = req.body;
        if (name !== undefined) user.name = name;
        if (bio !== undefined) user.bio = bio;
        if (website !== undefined) user.website = website;

        // Social links (merge) — can arrive as JSON string from FormData
        if (social) {
            const socialObj = typeof social === 'string' ? JSON.parse(social) : social;
            user.social = { ...(user.social?.toObject?.() || {}), ...socialObj };
        }

        // App settings (deep merge)
        if (settings) {
            if (settings.defaultVisibility !== undefined) user.settings.defaultVisibility = settings.defaultVisibility;
            if (settings.previewMode !== undefined) user.settings.previewMode = settings.previewMode;
            if (settings.notifications) {
                user.settings.notifications = { ...user.settings.notifications.toObject(), ...settings.notifications };
            }
            if (settings.privacy) {
                user.settings.privacy = { ...user.settings.privacy.toObject(), ...settings.privacy };
            }
            if (settings.analytics) {
                user.settings.analytics = { ...user.settings.analytics.toObject(), ...settings.analytics };
            }
        }

        // Avatar upload via Cloudinary (if file provided)
        if (req.file) {
            try {
                const result = await uploadToCloudinary(req.file.buffer, 'avatars');
                user.avatar = result.secure_url;
            } catch (e) { /* non-fatal, skip avatar update */ }
        } else if (req.body.avatar !== undefined) {
            user.avatar = req.body.avatar;
        }

        const updatedUser = await user.save();
        res.json(updatedUser);
    } catch (error) { res.status(res.statusCode || 500).json({ message: error.message }); }
};

// @desc    Change user password
// @route   PUT /api/auth/change-password
// @access  Private
const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        if (!currentPassword || !newPassword) { res.status(400); throw new Error('Please provide current and new password'); }
        if (newPassword.length < 6) { res.status(400); throw new Error('New password must be at least 6 characters'); }

        const user = await User.findById(req.user.id).select('+password');
        if (!user) { res.status(404); throw new Error('User not found'); }

        const isMatch = await user.matchPassword(currentPassword);
        if (!isMatch) { res.status(401); throw new Error('Current password is incorrect'); }

        user.password = newPassword;
        await user.save();
        res.json({ message: 'Password updated successfully' });
    } catch (error) { res.status(res.statusCode || 500).json({ message: error.message }); }
};

module.exports = { registerUser, loginUser, getMe, updateProfile, changePassword };

