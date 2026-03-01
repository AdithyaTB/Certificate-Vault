const mongoose = require('mongoose');

const folderSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a folder name'],
        trim: true,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
    },
    parent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Folder',
        default: null,
    }
}, {
    timestamps: true,
});

module.exports = mongoose.model('Folder', folderSchema);
