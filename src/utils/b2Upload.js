// src/utils/b2Upload.js
// رفع الملفات المرفوعة حديثاً إلى Backblaze B2 (متوافق مع S3 API)
// لا يُستخدم لأي عملية حذف أو نقل للملفات القديمة - فقط لرفع نسخة إضافية من الملفات الجديدة
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import fs from 'fs';

let s3Client;
let clientInitAttempted = false;

const getRegionFromEndpoint = (endpoint) => {
  const match = endpoint.match(/^s3\.([a-z0-9-]+)\.backblazeb2\.com$/i);
  return match ? match[1] : 'us-east-1';
};

const getClient = () => {
  if (clientInitAttempted) return s3Client;
  clientInitAttempted = true;

  const { B2_KEY_ID, B2_APPLICATION_KEY, B2_ENDPOINT } = process.env;
  if (!B2_KEY_ID || !B2_APPLICATION_KEY || !B2_ENDPOINT) {
    return null;
  }

  const rawEndpoint = B2_ENDPOINT.replace(/^https?:\/\//, '');
  s3Client = new S3Client({
    region: getRegionFromEndpoint(rawEndpoint),
    endpoint: `https://${rawEndpoint}`,
    credentials: {
      accessKeyId: B2_KEY_ID,
      secretAccessKey: B2_APPLICATION_KEY,
    },
  });

  return s3Client;
};

/**
 * يرفع ملف محلي (موجود أصلاً على القرص بعد multer) إلى B2.
 * يرجع الرابط العام لو نجح الرفع، أو null لو فشل أو لو إعدادات B2 غير مكتملة.
 * لا يحذف أو يعدّل الملف المحلي أبداً - الرفع نسخة إضافية بس.
 */
export const uploadFileToB2 = async (localFilePath, remoteKey, contentType) => {
  const client = getClient();
  const { B2_BUCKET_NAME, B2_PUBLIC_BASE_URL } = process.env;

  if (!client || !B2_BUCKET_NAME || !B2_PUBLIC_BASE_URL) {
    return null;
  }

  try {
    const fileBuffer = fs.readFileSync(localFilePath);
    await client.send(new PutObjectCommand({
      Bucket: B2_BUCKET_NAME,
      Key: remoteKey,
      Body: fileBuffer,
      ContentType: contentType,
    }));

    const base = B2_PUBLIC_BASE_URL.replace(/\/$/, '');
    return `${base}/${remoteKey}`;
  } catch (error) {
    console.error('B2 upload failed, keeping local file as fallback:', error.message);
    return null;
  }
};

/**
 * يحدد رابط الميديا اللي لازم يتخزن بقاعدة البيانات لملف مرفوع حديثاً عبر multer:
 * رابط B2 لو نجح الرفع، وإلا المسار المحلي (نفس السلوك القديم بالضبط) كـ fallback آمن.
 */
export const resolveUploadedMediaUrl = async (file) => {
  const b2Url = await uploadFileToB2(file.path, file.filename, file.mimetype);
  return b2Url || `/uploads/${file.filename}`;
};
