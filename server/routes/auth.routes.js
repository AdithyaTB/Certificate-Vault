const express = require('express');
const router = express.Router();
const {
    registerUser,
    loginUser,
    getMe,
    updateProfile,
    changePassword,
} = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getMe);
router.put('/update-profile', protect, upload.single('avatar'), updateProfile);
router.put('/change-password', protect, changePassword);

module.exports = router;
