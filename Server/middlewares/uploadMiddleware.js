const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Note: Cloudinary SDK automatically picks up CLOUDINARY_URL from process.env

// Configure Cloudinary storage for Multer
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'jantagarage_complaints',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
        transformation: [{ width: 1000, height: 1000, crop: 'limit' }]
    }
});

// File filter validator (extra validation check on client headers)
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const isMimeMatch = allowedTypes.test(file.mimetype);

    if (isMimeMatch) {
        cb(null, true);
    } else {
        cb(new Error('Only image files (jpg, jpeg, png, webp) are allowed!'), false);
    }
};

// Configured Multer instance for Cloudinary
const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB limit
    fileFilter: fileFilter
});

module.exports = upload.single('image');
