const Category = require('../models/Category');

const DEFAULT_CATEGORIES = [
    { name: 'Web Development', color: '#3b82f6' },
    { name: 'AI / Machine Learning', color: '#8b5cf6' },
    { name: 'Cloud Computing', color: '#06b6d4' },
    { name: 'Data Science', color: '#10b981' },
    { name: 'Cybersecurity', color: '#ef4444' },
    { name: 'DevOps', color: '#f59e0b' },
    { name: 'Mobile Development', color: '#ec4899' },
    { name: 'UI / UX Design', color: '#14b8a6' },
    { name: 'Blockchain', color: '#f97316' },
    { name: 'Hackathons', color: '#6366f1' },
    { name: 'Internships', color: '#84cc16' },
    { name: 'Other', color: '#6b7280' },
];

// @desc    Get all categories for a user
// @route   GET /api/categories
// @access  Private
const getCategories = async (req, res) => {
    try {
        let categories = await Category.find({ createdBy: req.user._id }).sort('name');

        // Auto-seed defaults for new users
        if (categories.length === 0) {
            const seeded = await Category.insertMany(
                DEFAULT_CATEGORIES.map(c => ({ ...c, createdBy: req.user._id }))
            );
            categories = seeded.sort((a, b) => a.name.localeCompare(b.name));
        }

        res.status(200).json(categories);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a category
// @route   POST /api/categories
// @access  Private
const createCategory = async (req, res) => {
    try {
        const { name, color } = req.body;

        if (!name) {
            res.status(400);
            throw new Error('Category name is required');
        }

        const categoryExists = await Category.findOne({ name, createdBy: req.user._id });

        if (categoryExists) {
            res.status(400);
            throw new Error('Category already exists');
        }

        const category = await Category.create({
            name,
            color: color || '#808080',
            createdBy: req.user._id,
        });

        res.status(201).json(category);
    } catch (error) {
        res.status(res.statusCode === 200 ? 500 : res.statusCode).json({ message: error.message });
    }
};

// @desc    Delete a category
// @route   DELETE /api/categories/:id
// @access  Private
const deleteCategory = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);

        if (!category) {
            res.status(404);
            throw new Error('Category not found');
        }

        // Verify ownership
        if (category.createdBy.toString() !== req.user._id.toString()) {
            res.status(401);
            throw new Error('Not authorized to delete this category');
        }

        await category.deleteOne();

        res.status(200).json({ id: req.params.id, message: 'Category deleted successfully' });
    } catch (error) {
        res.status(res.statusCode === 200 ? 500 : res.statusCode).json({ message: error.message });
    }
};

module.exports = {
    getCategories,
    createCategory,
    deleteCategory,
};
