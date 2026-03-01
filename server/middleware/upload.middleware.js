const multer = require('multer');
const path = require('path');

// Configure multer storage (for local temp storage before cloudinary or directly memory)
// Since we want to use Cloudinary, using memoryStorage is usually best in serverless or simple setups,
// but diskStorage allows easy preview checks. Let's use memory.

const storage = multer.memoryStorage();

// File filter (PDF, JPG, PNG)
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true);
    } else {
        cb(new Error('Only images (jpeg, jpg, png) and PDFs are allowed!'), false);
    }
};

const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter,
});

module.exports = upload;
