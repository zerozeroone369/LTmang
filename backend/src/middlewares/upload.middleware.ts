import fs from 'fs';
import multer from 'multer';
import path from 'path';
import { AppError } from '../utils/errors';

const UPLOAD_DIR = path.resolve(process.cwd(), 'uploads/documents');
const POST_UPLOAD_DIR = path.resolve(process.cwd(), 'uploads/posts');

// Ensure upload directories exist
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}
if (!fs.existsSync(POST_UPLOAD_DIR)) {
  fs.mkdirSync(POST_UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (_req, file, cb) => {
    // Generate safe unique filename
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const baseName = path
      .basename(file.originalname, ext)
      .replace(/[^a-zA-Z0-9_.-]/g, '_')
      .slice(0, 50);
    cb(null, `${baseName}-${uniqueSuffix}${ext}`);
  },
});

const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain',
  'application/zip',
  'application/x-zip-compressed',
  'application/x-rar-compressed',
  'application/octet-stream',
];

const ALLOWED_EXTENSIONS = [
  '.pdf',
  '.doc',
  '.docx',
  '.ppt',
  '.pptx',
  '.xls',
  '.xlsx',
  '.txt',
  '.zip',
  '.rar',
];

export const documentUpload = multer({
  storage,
  limits: {
    fileSize: 20 * 1024 * 1024, // 20 MB max file size
  },
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext) && !ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      return cb(
        AppError.badRequest(
          `Định dạng tệp không được hỗ trợ (${ext}). Chỉ chấp nhận: PDF, DOCX, PPTX, XLSX, TXT, ZIP.`,
        ),
      );
    }
    cb(null, true);
  },
});

const postMediaStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, POST_UPLOAD_DIR);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const baseName = path
      .basename(file.originalname, ext)
      .replace(/[^a-zA-Z0-9_.-]/g, '_')
      .slice(0, 50);
    cb(null, `${baseName}-${uniqueSuffix}${ext}`);
  },
});

const ALLOWED_POST_EXTENSIONS = [
  '.jpg',
  '.jpeg',
  '.png',
  '.webp',
  '.gif',
  '.pdf',
  '.doc',
  '.docx',
  '.txt',
];

export const postMediaUpload = multer({
  storage: postMediaStorage,
  limits: {
    fileSize: 25 * 1024 * 1024, // 25 MB max file size
  },
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (
      !ALLOWED_POST_EXTENSIONS.includes(ext) &&
      !file.mimetype.startsWith('image/') &&
      !ALLOWED_MIME_TYPES.includes(file.mimetype)
    ) {
      return cb(
        AppError.badRequest(
          `Định dạng tệp không được hỗ trợ (${ext}). Chấp nhận hình ảnh (JPG, PNG, WEBP, GIF) hoặc văn bản (PDF, DOCX, TXT).`,
        ),
      );
    }
    cb(null, true);
  },
});
