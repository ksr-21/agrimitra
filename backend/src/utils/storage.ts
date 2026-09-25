import fs from 'fs';
import path from 'path';
import { env } from '../config/env';

/**
 * Storage abstraction — currently writes to local filesystem.
 * Structured so it can be swapped to S3-compatible storage later
 * by just changing the implementation of these functions.
 */

const uploadDir = path.resolve(env.UPLOAD_DIR);

/** Ensure the upload directory exists */
export function ensureUploadDir(): void {
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
}

/** Get the absolute path for a stored file */
export function getFilePath(filename: string): string {
  return path.join(uploadDir, filename);
}

/** Get the public URL for a stored file (for dev, just the relative path) */
export function getFileUrl(filename: string): string {
  return `/uploads/${filename}`;
}

/** Delete a stored file */
export function deleteFile(filename: string): void {
  const filePath = getFilePath(filename);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
}
