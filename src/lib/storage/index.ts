// Storage utilities
export {
  uploadImage,
  deleteImage,
  getSignedUrl,
  resizeImage,
  validateImage,
  getImageDimensions,
  generateUniqueFileName,
  uploadMultipleImages,
  createThumbnail,
} from './upload';

export {
  BUCKETS,
  getImageUrl,
  getThumbnailUrl,
  getHeroImageUrl,
  buildHotelImagePath,
  buildRoomImagePath,
  buildAvatarPath,
  getFileNameFromPath,
  checkBucketAccess,
  listImages,
  getFileSize,
  copyImage,
  moveImage,
} from './buckets';

export type { BucketName, ImageTransformOptions } from './buckets';
