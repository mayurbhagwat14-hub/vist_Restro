/**
 * Thin storage adapter used by the delivery module (ported from DoorDish).
 * Vist stores files through localUpload.service (local disk or Cloudinary);
 * this module exposes the subset of the DoorDish storage API that delivery code needs.
 */
import { uploadImageBuffer as uploadImageBufferImpl, deleteLocalFile } from './localUpload.service.js';

export const extractAssetUrl = (value) => {
    if (!value) return '';
    if (typeof value === 'string') return value.trim();
    if (typeof value === 'object') {
        return String(value.url || value.secure_url || value.imageUrl || value.iconUrl || value.src || '').trim();
    }
    return '';
};

export const extractAssetUrls = (value) => {
    if (value == null || value === '') return [];
    if (Array.isArray(value)) {
        return [...new Set(value.flatMap(extractAssetUrls).filter(Boolean))];
    }
    const one = extractAssetUrl(value);
    return one ? [one] : [];
};

export const uploadImageBuffer = async (buffer, folder = 'uploads') => uploadImageBufferImpl(buffer, folder);

export const deleteStoredAssets = async (urls = []) => {
    const list = extractAssetUrls(urls);
    await Promise.all(list.map((url) => deleteLocalFile(url).catch(() => false)));
};

/** Delete previous files that are no longer referenced after a successful replace. */
export const deleteReplacedAssets = async (previous, next) => {
    const prev = new Set(extractAssetUrls(previous));
    const curr = new Set(extractAssetUrls(next));
    const removed = [...prev].filter((url) => !curr.has(url));
    if (!removed.length) return;
    await deleteStoredAssets(removed);
};
