const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const {
    getCategories,
    createCategory,
    deleteCategory,
} = require('../controllers/category.controller');

router.use(protect);

router.route('/')
    .get(getCategories)
    .post(createCategory);

router.route('/:id')
    .delete(deleteCategory);

module.exports = router;
