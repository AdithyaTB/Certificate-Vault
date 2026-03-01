const Folder = require('../models/Folder');
const Certificate = require('../models/Certificate');

// @desc    Get user folders
// @route   GET /api/folders
// @access  Private
const getFolders = async (req, res, next) => {
    try {
        const folders = await Folder.find({ user: req.user.id }).sort('-createdAt');
        res.status(200).json(folders);
    } catch (err) {
        next(err);
    }
};

// @desc    Create new folder
// @route   POST /api/folders
// @access  Private
const createFolder = async (req, res, next) => {
    try {
        const { name, parent } = req.body;
        if (!name) {
            res.status(400);
            throw new Error('Please add a folder name');
        }

        // Check if parent exists (if provided)
        if (parent) {
            const parentFolder = await Folder.findById(parent);
            if (!parentFolder || parentFolder.user.toString() !== req.user.id) {
                res.status(404);
                throw new Error('Parent folder not found or unauthorized');
            }
        }

        const folder = await Folder.create({
            name,
            parent: parent || null,
            user: req.user.id,
        });

        res.status(201).json(folder);
    } catch (err) {
        next(err);
    }
};

// @desc    Delete a folder
// @route   DELETE /api/folders/:id
// @access  Private
const deleteFolder = async (req, res, next) => {
    try {
        const folder = await Folder.findById(req.params.id);

        if (!folder) {
            res.status(404);
            throw new Error('Folder not found');
        }

        // Check for user ownership
        if (folder.user.toString() !== req.user.id) {
            res.status(401);
            throw new Error('User not authorized');
        }

        // Unlink certificates
        await Certificate.updateMany({ folder: folder._id }, { folder: null });

        // Unlink any sub-folders to push them to the root
        await Folder.updateMany({ parent: folder._id }, { parent: null });

        await folder.deleteOne();

        res.status(200).json({ id: req.params.id });
    } catch (err) {
        next(err);
    }
};

module.exports = {
    getFolders,
    createFolder,
    deleteFolder,
};
