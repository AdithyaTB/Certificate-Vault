const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadToCloudinary = (fileBuffer, folder = 'certificates') => {
    return new Promise((resolve, reject) => {
        let stream = cloudinary.uploader.upload_stream(
            {
                folder: folder,
                resource_type: 'auto', // Auto detects image or raw(pdf)
            },
            (error, result) => {
                if (result) {
                    resolve(result);
                } else {
                    reject(error);
                }
            }
        );
        streamifier.createReadStream(fileBuffer).pipe(stream);
    });
};

const deleteFromCloudinary = async (publicId) => {
    try {
        await cloudinary.uploader.destroy(publicId);
    } catch (error) {
        console.error(`Failed to delete asset ${publicId} from Cloudinary`, error);
    }
};

module.exports = {
    uploadToCloudinary,
    deleteFromCloudinary,
};
