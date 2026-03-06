import { del, put } from '@vercel/blob';
import fs from 'fs';
import path from 'path';

const LOCAL_UPLOAD_DIR = path.join(process.cwd(), 'public', 'products', 'uploads');
const LOCAL_UPLOAD_URL_PREFIX = '/products/uploads/';
const BLOB_UPLOAD_PREFIX = 'products/uploads/';
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];
const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024;

function ensureLocalUploadDir() {
  if (!fs.existsSync(LOCAL_UPLOAD_DIR)) {
    fs.mkdirSync(LOCAL_UPLOAD_DIR, { recursive: true });
  }
}

function sanitizeFilename(filename: string) {
  return filename
    .toLowerCase()
    .replace(/[^a-z0-9.-]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function buildUniqueFilename(filename: string) {
  const safeName = sanitizeFilename(filename || 'image');
  const ext = safeName.includes('.') ? safeName.split('.').pop() : 'jpg';
  const baseName = safeName.replace(/\.[^.]+$/, '') || 'image';
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${baseName}.${ext}`;
}

function isBlobConfigured() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

function isBlobUrl(url: string) {
  return url.includes('.blob.vercel-storage.com/');
}

export function isManagedProductAsset(url: string) {
  return url.startsWith(LOCAL_UPLOAD_URL_PREFIX) || (isBlobUrl(url) && url.includes(`/${BLOB_UPLOAD_PREFIX}`));
}

export function validateImageFile(file: File) {
  if (!file) {
    throw new Error('No file provided');
  }

  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    throw new Error('Invalid file type. Allowed: JPEG, PNG, WebP, AVIF');
  }

  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    throw new Error('Image exceeds the 10MB upload limit');
  }
}

export async function uploadProductImage(file: File) {
  validateImageFile(file);

  const uniqueFilename = buildUniqueFilename(file.name);

  if (isBlobConfigured()) {
    const blob = await put(`${BLOB_UPLOAD_PREFIX}${uniqueFilename}`, file, {
      access: 'public',
      addRandomSuffix: false,
      contentType: file.type,
    });

    return {
      url: blob.url,
      pathname: blob.pathname,
      storage: 'blob' as const,
    };
  }

  ensureLocalUploadDir();

  const localPath = path.join(LOCAL_UPLOAD_DIR, uniqueFilename);
  const buffer = Buffer.from(await file.arrayBuffer());
  fs.writeFileSync(localPath, buffer);

  return {
    url: `${LOCAL_UPLOAD_URL_PREFIX}${uniqueFilename}`,
    pathname: localPath,
    storage: 'local' as const,
  };
}

function resolveLocalUploadPath(url: string) {
  if (!url.startsWith(LOCAL_UPLOAD_URL_PREFIX)) {
    return null;
  }

  const relativePath = url.slice(LOCAL_UPLOAD_URL_PREFIX.length);
  return path.join(LOCAL_UPLOAD_DIR, relativePath);
}

export async function deleteProductAssets(urls: string[]) {
  const managedUrls = urls.filter(isManagedProductAsset);

  if (managedUrls.length === 0) {
    return;
  }

  const blobUrls = managedUrls.filter(isBlobUrl);
  const localUrls = managedUrls.filter((url) => url.startsWith(LOCAL_UPLOAD_URL_PREFIX));

  if (blobUrls.length > 0 && isBlobConfigured()) {
    await del(blobUrls);
  }

  await Promise.allSettled(
    localUrls.map(async (url) => {
      const filePath = resolveLocalUploadPath(url);

      if (!filePath || !fs.existsSync(filePath)) {
        return;
      }

      await fs.promises.unlink(filePath);
    }),
  );
}
