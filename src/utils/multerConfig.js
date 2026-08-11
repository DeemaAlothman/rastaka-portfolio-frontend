// src/utils/multerConfig.js
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const rawName = path.basename(file.originalname, ext);

    // تقصير الاسم الأصلي لتفادي ENAMETOOLONG: أسماء عربية/إيموجي طويلة
    // ممكن توصل لمئات البايتات بترميز UTF-8 وتتجاوز حد نظام الملفات (255 بايت)
    let safeName = '';
    let byteLength = 0;
    for (const char of rawName) {
      const charBytes = Buffer.byteLength(char, 'utf8');
      if (byteLength + charBytes > 60) break;
      safeName += char;
      byteLength += charBytes;
    }
    safeName = safeName.trim() || 'file';

    cb(null, safeName + '-' + uniqueSuffix + ext);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|mp4|mov|avi|webm|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('نوع الملف غير مدعوم! (الصور: jpg, png, gif, webp - الفيديو: mp4, mov, avi, webm)'));
  }
};

export const upload = multer({
  storage: storage,
  limits: {
    fileSize: 500 * 1024 * 1024, // 500MB max (للفيديوهات الطويلة)
    fieldSize: 25 * 1024 * 1024   // 25MB للحقول الأخرى
  },
  fileFilter: fileFilter
});
