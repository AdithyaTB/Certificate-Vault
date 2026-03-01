const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Please add a category name'],
            trim: true,
        },
        color: {
            type: String,
            default: '#3b82f6', // Default blue, but UI uses monochrome/custom
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Category', categorySchema);
