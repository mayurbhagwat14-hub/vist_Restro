import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import sharp from 'sharp';
import { fileURLToPath } from 'url';
import { v2 as cloudinary } from 'cloudinary';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rawUploadsDir = process.env.UPLOADS_DIR || path.resolve(__dirname, '../../uploads');

// Resolve relative paths (like ./uploads) to absolute from project root
const UPLOADS_DIR = path.isAbsolute(rawUploadsDir)
    ? rawUploadsDir
    : path.resolve(process.cwd(), rawUploadsDir);

if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

/**
 * Check if Cloudinary upload is enabled and configured in environment.
 */
export const isCloudinaryEnabled = () => {
    const isFlagOn = process.env.USE_CLOUDINARY === 'true' || process.env.CLOUDINARY_ENABLED === 'true';
    if (!isFlagOn) return false;

    const hasCreds = Boolean(
        process.env.CLOUDINARY_CLOUD_NAME &&
        process.env.CLOUDINARY_API_KEY &&
        process.env.CLOUDINARY_API_SECRET
    );

    if (!hasCreds) {
        console.warn('[UploadService] USE_CLOUDINARY is set to true, but Cloudinary credentials (CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET) are missing. Falling back to local storage.');
        return false;
    }
    return true;
};

/**
 * Configure Cloudinary with current env credentials.
 */
const configureCloudinary = () => {
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
        secure: true
    });
};

/**
 * Upload buffer to Cloudinary using stream.
 */
const uploadBufferToCloudinary = (buffer, options = {}) => {
    configureCloudinary();
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(options, (error, result) => {
            if (error) {
                return reject(error);
            }
            resolve(result);
        });
        uploadStream.end(buffer);
    });
};

/**
 * Extract Cloudinary public_id from a Cloudinary URL.
 */
export const getCloudinaryPublicIdFromUrl = (url) => {
    if (!url || typeof url !== 'string') return null;
    if (!url.includes('res.cloudinary.com')) return null;

    try {
        const uploadIndex = url.indexOf('/upload/');
        if (uploadIndex === -1) return null;

        const afterUpload = url.substring(uploadIndex + 8);
        const segments = afterUpload.split('/');

        // Strip transformations and version prefix (e.g. v1729000000)
        while (
            segments.length > 1 &&
            ((segments[0].startsWith('v') && /^v\d+$/.test(segments[0])) ||
                segments[0].includes(',') ||
                segments[0].includes('_'))
        ) {
            segments.shift();
        }

        const remainingPath = segments.join('/');
        const dotIndex = remainingPath.lastIndexOf('.');
        if (dotIndex !== -1) {
            return remainingPath.substring(0, dotIndex);
        }
        return remainingPath;
    } catch {
        return null;
    }
};

const generateFilename = (prefix = 'file', ext = '.webp') => {
    const timestamp = Date.now();
    const hash = crypto.randomBytes(4).toString('hex');
    return `${prefix}_${timestamp}_${hash}${ext}`;
};

/**
 * Local upload helpers
 */
const uploadImageLocally = async (buffer, folder = 'misc') => {
    const targetDir = path.join(UPLOADS_DIR, folder);
    if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
    }

    const filename = generateFilename('img', '.webp');
    const filePath = path.join(targetDir, filename);

    await sharp(buffer)
        .webp({ quality: 80 })
        .toFile(filePath);

    return `/uploads/${folder}/${filename}`.replace(/\\/g, '/');
};

const uploadVideoLocally = async (buffer, folder = 'misc') => {
    const targetDir = path.join(UPLOADS_DIR, folder);
    if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
    }

    const filename = generateFilename('vid', '.mp4');
    const filePath = path.join(targetDir, filename);

    fs.writeFileSync(filePath, buffer);

    return `/uploads/${folder}/${filename}`.replace(/\\/g, '/');
};

const uploadFileLocally = async (buffer, folder = 'misc', options = {}) => {
    const targetDir = path.join(UPLOADS_DIR, folder);
    if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
    }

    const ext = options.format ? `.${options.format}` : '.pdf';
    const rawName = options.fileName
        ? options.fileName.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '_')
        : 'doc';

    const timestamp = Date.now();
    const hash = crypto.randomBytes(4).toString('hex');
    const filename = `${rawName}_${timestamp}_${hash}${ext}`;

    const filePath = path.join(targetDir, filename);
    fs.writeFileSync(filePath, buffer);

    return `/uploads/${folder}/${filename}`.replace(/\\/g, '/');
};

/**
 * Upload Image (returns URL string: Cloudinary HTTPS URL or local /uploads/... URL)
 */
export const uploadImageBuffer = async (buffer, folder = 'misc') => {
    if (!buffer) {
        throw new Error('File buffer is required');
    }

    if (isCloudinaryEnabled()) {
        const webpBuffer = await sharp(buffer)
            .webp({ quality: 80 })
            .toBuffer();

        const result = await uploadBufferToCloudinary(webpBuffer, {
            folder,
            resource_type: 'image'
        });
        return result.secure_url;
    }

    return uploadImageLocally(buffer, folder);
};

/**
 * Upload Image Detailed (returns { secure_url, public_id })
 */
export const uploadImageBufferDetailed = async (buffer, folder = 'misc') => {
    if (!buffer) {
        throw new Error('File buffer is required');
    }

    if (isCloudinaryEnabled()) {
        const webpBuffer = await sharp(buffer)
            .webp({ quality: 80 })
            .toBuffer();

        const result = await uploadBufferToCloudinary(webpBuffer, {
            folder,
            resource_type: 'image'
        });
        return {
            secure_url: result.secure_url,
            public_id: result.public_id
        };
    }

    const url = await uploadImageLocally(buffer, folder);
    return {
        secure_url: url,
        public_id: url
    };
};

/**
 * Upload Video (returns URL string)
 */
export const uploadVideoBuffer = async (buffer, folder = 'misc') => {
    if (!buffer) {
        throw new Error('File buffer is required');
    }

    if (isCloudinaryEnabled()) {
        const result = await uploadBufferToCloudinary(buffer, {
            folder,
            resource_type: 'video'
        });
        return result.secure_url;
    }

    return uploadVideoLocally(buffer, folder);
};

/**
 * Upload Document/Raw File (returns URL string)
 */
export const uploadFileBuffer = async (buffer, folder = 'misc', options = {}) => {
    if (!buffer) {
        throw new Error('File buffer is required');
    }

    if (isCloudinaryEnabled()) {
        const result = await uploadBufferToCloudinary(buffer, {
            folder,
            resource_type: 'auto'
        });
        return result.secure_url;
    }

    return uploadFileLocally(buffer, folder, options);
};

export const buildRawDownloadUrlFromFileUrl = (fileUrl, options = {}) => {
    if (!fileUrl) return '';
    return fileUrl;
};

/**
 * Delete File: handles Cloudinary assets (URLs or public_ids) and local files (/uploads/...)
 */
export const deleteLocalFile = async (fileUrlOrPublicId) => {
    if (!fileUrlOrPublicId || typeof fileUrlOrPublicId !== 'string') return false;

    // 1. Cloudinary asset via URL
    if (fileUrlOrPublicId.includes('res.cloudinary.com')) {
        const publicId = getCloudinaryPublicIdFromUrl(fileUrlOrPublicId);
        if (publicId) {
            try {
                configureCloudinary();
                const isVideo =
                    /\.(mp4|webm|mov|mkv)(\?.*)?$/i.test(fileUrlOrPublicId) ||
                    fileUrlOrPublicId.includes('/video/upload/');
                await cloudinary.uploader.destroy(publicId, {
                    resource_type: isVideo ? 'video' : 'image'
                });
                return true;
            } catch (err) {
                console.error('[UploadService] Error deleting Cloudinary asset:', err.message);
                return false;
            }
        }
    }

    // 2. Local file in /uploads/
    if (fileUrlOrPublicId.includes('/uploads/')) {
        try {
            const urlParts = fileUrlOrPublicId.split('/uploads/');
            if (urlParts.length < 2) return false;

            const relativePath = urlParts[1].split('?')[0];
            const absolutePath = path.join(UPLOADS_DIR, relativePath);

            const normalizedPath = path.normalize(absolutePath);
            if (!normalizedPath.startsWith(UPLOADS_DIR)) return false;

            if (fs.existsSync(normalizedPath)) {
                fs.unlinkSync(normalizedPath);
                return true;
            }
        } catch (err) {
            console.error('[UploadService] Error deleting local file:', err.message);
        }
        return false;
    }

    // 3. Fallback: Raw Cloudinary public_id string without /uploads/ or URL prefix
    if (
        isCloudinaryEnabled() &&
        !fileUrlOrPublicId.startsWith('/') &&
        !fileUrlOrPublicId.startsWith('.') &&
        !fileUrlOrPublicId.startsWith('http')
    ) {
        try {
            configureCloudinary();
            await cloudinary.uploader.destroy(fileUrlOrPublicId);
            return true;
        } catch {
            return false;
        }
    }

    return false;
};

export const deleteFile = deleteLocalFile;
