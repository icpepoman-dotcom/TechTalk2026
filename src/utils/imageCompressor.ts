/**
 * Client-side image compressor & optimizer.
 * Resizes large photos (DSLR / mobile 4K shots) down to responsive dimensions
 * and compresses them into WebP/JPEG to prevent QuotaExceededError and keep memory low.
 */

export interface CompressOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0 to 1
  mimeType?: 'image/webp' | 'image/jpeg' | 'image/png';
}

export async function compressImage(
  source: File | Blob | string,
  options: CompressOptions = {}
): Promise<string> {
  const {
    maxWidth = 1200,
    maxHeight = 1200,
    quality = 0.85,
    mimeType = 'image/webp'
  } = options;

  // If source is already an SVG data URL or SVG file, keep SVG intact (vector is already tiny and scalable)
  if (typeof source !== 'string' && source.type === 'image/svg+xml') {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(source);
    });
  }

  if (typeof source === 'string' && source.startsWith('data:image/svg+xml')) {
    return source;
  }

  // If source is a remote URL (http/https), return as is
  if (typeof source === 'string' && (source.startsWith('http://') || source.startsWith('https://') || source.startsWith('/'))) {
    return source;
  }

  // Load the image into an HTMLImageElement
  const img = await loadImage(source);

  // If already tiny in dimensions and under 200KB dataURL, return
  if (img.width <= maxWidth && img.height <= maxHeight && typeof source === 'string' && source.length < 250000) {
    return source;
  }

  // Calculate new constrained dimensions while maintaining aspect ratio
  let targetWidth = img.width;
  let targetHeight = img.height;

  if (targetWidth > maxWidth || targetHeight > maxHeight) {
    const ratio = Math.min(maxWidth / targetWidth, maxHeight / targetHeight);
    targetWidth = Math.round(targetWidth * ratio);
    targetHeight = Math.round(targetHeight * ratio);
  }

  // Canvas render
  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Canvas 2D context not available');
  }

  // Smooth scaling
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // Check if original is PNG with transparency
  const isTransparent =
    (typeof source !== 'string' && source.type === 'image/png') ||
    (typeof source === 'string' && source.startsWith('data:image/png'));

  // Draw image
  ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

  // If transparent PNG, export as PNG or WebP with alpha preservation
  if (isTransparent) {
    // Try webp first for better compression if supported, else png
    try {
      const webpUrl = canvas.toDataURL('image/webp', quality);
      if (webpUrl.startsWith('data:image/webp')) {
        return webpUrl;
      }
    } catch {
      // Fallback to png
    }
    return canvas.toDataURL('image/png');
  }

  // Default export
  try {
    const webpUrl = canvas.toDataURL(mimeType, quality);
    if (webpUrl.startsWith(`data:${mimeType}`)) {
      return webpUrl;
    }
  } catch {
    // WebP might not be supported in very old browsers, fallback to jpeg
  }

  return canvas.toDataURL('image/jpeg', quality);
}

function loadImage(source: File | Blob | string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => resolve(img);
    img.onerror = (e) => reject(new Error('Failed to load image for compression: ' + e));

    if (typeof source === 'string') {
      img.src = source;
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        img.src = e.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(source);
    }
  });
}
