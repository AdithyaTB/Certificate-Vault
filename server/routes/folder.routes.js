const express = require('express');
const router = express.Router();
const {
    getFolders,
    createFolder,
    deleteFolder,
} = require('../controllers/folder.controller');
const { protect } = require('../middleware/auth.middleware');

router.route('/')
    .get(protect, getFolders)
    .post(protect, createFolder);

router.route('/:id')
    .delete(protect, deleteFolder);

module.exports = router;
