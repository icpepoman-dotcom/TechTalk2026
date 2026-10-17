import JSZip from 'jszip';

/**
 * Normalizes any image URL so that it resolves reliably in both
 * local dev and production static builds (like GitHub Pages).
 */
export function resolveImageUrl(url: string | undefined | null): string {
  if (!url) return '';
  if (url.startsWith('data:image/')) return url;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  if (url.startsWith('/src/assets/images/')) {
    return url.replace('/src/assets/images/', './images/');
  }
  if (url.startsWith('src/assets/images/')) {
    return url.replace('src/assets/images/', './images/');
  }
  if (url.startsWith('/images/')) {
    return '.' + url;
  }
  if (url.startsWith('images/')) {
    return './' + url;
  }
  return url;
}

/**
 * Automatically syncs a base64 image to the server disk (src/assets/images and public/images)
 * when running with the Node/Express backend. If running statically on GitHub Pages,
 * it fails gracefully without blocking the user.
 */
export async function syncImageToDisk(id: string, name: string, dataUrl: string): Promise<string | null> {
  if (!dataUrl || !dataUrl.startsWith('data:image/')) return null;
  try {
    const res = await fetch('/api/save-image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, name, dataUrl })
    });
    if (res.ok) {
      const json = await res.json();
      if (json.success && json.filePath) {
        return json.filePath;
      }
    }
  } catch {
    // Running on static hosting or server offline
  }
  return null;
}

/**
 * Helper to download a single file from a data URL or blob
 */
export function downloadFile(dataUrlOrBlob: string | Blob, filename: string) {
  const link = document.createElement('a');
  if (typeof dataUrlOrBlob === 'string') {
    link.href = dataUrlOrBlob;
  } else {
    link.href = URL.createObjectURL(dataUrlOrBlob);
  }
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  if (typeof dataUrlOrBlob !== 'string') {
    setTimeout(() => URL.revokeObjectURL(link.href), 1000);
  }
}

/**
 * Bundles all custom/active images into a ZIP archive and triggers a download.
 * This allows administrators to export all active pictures directly to their
 * local repository's public/images and src/assets/images folder before committing to GitHub.
 */
export async function downloadAllImagesZip(
  slots: Record<string, { customUrl?: string; defaultUrl?: string; name?: string }>,
  speakers: Array<{ id: string; name: string; photoUrl?: string }>,
  qrCodeUrl?: string
): Promise<{ count: number; filename: string }> {
  const zip = new JSZip();
  const folder = zip.folder('images');
  if (!folder) throw new Error('Could not create images folder in ZIP');

  let count = 0;

  // 1. Add custom image slots
  for (const [slotId, slot] of Object.entries(slots)) {
    const targetUrl = slot.customUrl || slot.defaultUrl;
    if (targetUrl && targetUrl.startsWith('data:image/')) {
      const match = targetUrl.match(/^data:image\/([a-zA-Z0-9\+\-\.]+);base64,(.+)$/);
      if (match) {
        let ext = match[1];
        if (ext === 'jpeg') ext = 'jpg';
        if (ext === 'svg+xml') ext = 'svg';
        const cleanName = (slot.name ? slot.name.replace(/[^a-zA-Z0-9_-]/g, '_') : slotId).toLowerCase();
        folder.file(`${cleanName}.${ext}`, match[2], { base64: true });
        count++;
      }
    }
  }

  // 2. Add speakers custom photos
  for (const spk of speakers) {
    if (spk.photoUrl && spk.photoUrl.startsWith('data:image/')) {
      const match = spk.photoUrl.match(/^data:image\/([a-zA-Z0-9\+\-\.]+);base64,(.+)$/);
      if (match) {
        let ext = match[1];
        if (ext === 'jpeg') ext = 'jpg';
        const cleanName = `speaker_${spk.name.replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase()}`;
        folder.file(`${cleanName}.${ext}`, match[2], { base64: true });
        count++;
      }
    }
  }

  // 3. Add QR code if data URL
  if (qrCodeUrl && qrCodeUrl.startsWith('data:image/')) {
    const match = qrCodeUrl.match(/^data:image\/([a-zA-Z0-9\+\-\.]+);base64,(.+)$/);
    if (match) {
      let ext = match[1];
      if (ext === 'jpeg') ext = 'jpg';
      folder.file(`qr_code_registration.${ext}`, match[2], { base64: true });
      count++;
    }
  }

  // If no custom base64 images, provide a README explaining how to update images
  if (count === 0) {
    folder.file(
      'README.txt',
      'No custom uploaded pictures were found in memory. Default website images are located in public/images/ and src/assets/images/ in the project directory.'
    );
  }

  const blob = await zip.generateAsync({ type: 'blob' });
  const filename = `icpep_techtalk_images_${new Date().toISOString().slice(0, 10)}.zip`;
  downloadFile(blob, filename);

  return { count, filename };
}
