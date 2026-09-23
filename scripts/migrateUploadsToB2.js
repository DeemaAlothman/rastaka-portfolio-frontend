// scripts/migrateUploadsToB2.js
//
// ينقل الملفات المحلية القديمة (uploads/) إلى Backblaze B2، ملف ملف.
//
// - لا يحذف ولا يعدّل أي ملف محلي أبداً (نسخ بس).
// - يعدّل رابط السجل بقاعدة البيانات فقط بعد نجاح الرفع لهاد السجل تحديداً.
// - قابل للإيقاف والاستئناف: أي سجل رابطه أصلاً B2 (https://...) يُتخطى تلقائياً،
//   فتشغيله أكثر من مرة آمن 100% ومفيد لإعادة محاولة السجلات التي فشلت.
// - وضع فحص فقط (dry run) بدون أي تعديل: --dry-run
//
// تشغيل داخل الـ container:
//   docker exec -w /app portfolio-backend node scripts/migrateUploadsToB2.js --dry-run
//   docker exec -w /app portfolio-backend node scripts/migrateUploadsToB2.js

import { PrismaClient } from '@prisma/client';
import path from 'path';
import fs from 'fs';
import { uploadFileToB2 } from '../src/utils/b2Upload.js';

const prisma = new PrismaClient();

const DRY_RUN = process.argv.includes('--dry-run');
const CONCURRENCY = 5;
const UPLOADS_ROOT = path.join(process.cwd(), 'uploads');

const MIME_TYPES = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.mp4': 'video/mp4',
  '.mov': 'video/quicktime',
  '.avi': 'video/x-msvideo',
  '.webm': 'video/webm',
};

const getMimeType = (filePath) => MIME_TYPES[path.extname(filePath).toLowerCase()] || 'application/octet-stream';

const isAlreadyMigrated = (url) => !url || url.startsWith('http://') || url.startsWith('https://');

const stats = { alreadyMigrated: 0, missingFile: 0, uploaded: 0, wouldUpload: 0, failed: 0 };
const logLines = [];
const log = (line) => {
  const stamped = `[${new Date().toISOString()}] ${line}`;
  console.log(stamped);
  logLines.push(stamped);
};

// يهاجر رابط محلي واحد (مثلاً "/uploads/x.jpg") - يرجع الرابط الجديد أو null لو ما تغير شي
const migrateOneUrl = async (relativeUrl, contextLabel) => {
  if (isAlreadyMigrated(relativeUrl)) {
    if (relativeUrl) stats.alreadyMigrated++;
    return null;
  }

  const filename = path.basename(relativeUrl);
  const localPath = path.join(UPLOADS_ROOT, filename);

  if (!fs.existsSync(localPath)) {
    stats.missingFile++;
    log(`WARN  missing local file for ${contextLabel}: ${relativeUrl} (expected at ${localPath})`);
    return null;
  }

  if (DRY_RUN) {
    stats.wouldUpload++;
    log(`DRY   would upload ${contextLabel}: ${relativeUrl}`);
    return null; // dry run never changes the DB
  }

  const contentType = getMimeType(localPath);
  const newUrl = await uploadFileToB2(localPath, filename, contentType);

  if (!newUrl) {
    stats.failed++;
    log(`FAIL  upload failed for ${contextLabel}: ${relativeUrl} (local file kept as-is, will retry on next run)`);
    return null;
  }

  stats.uploaded++;
  log(`OK    migrated ${contextLabel}: ${relativeUrl} -> ${newUrl}`);
  return newUrl;
};

const runWithConcurrency = async (items, worker, concurrency) => {
  const queue = [...items];
  const runners = new Array(concurrency).fill(null).map(async () => {
    while (queue.length > 0) {
      const item = queue.shift();
      await worker(item);
    }
  });
  await Promise.all(runners);
};

const migratePortfolioItems = async () => {
  const items = await prisma.portfolioItem.findMany({
    select: { id: true, mediaUrl: true, mediaUrls: true },
  });
  log(`Found ${items.length} portfolio items to check.`);

  await runWithConcurrency(items, async (item) => {
    const update = {};

    if (item.mediaUrls) {
      // سجل كاروسيل/سوشيال ميديا: عدة ملفات بمصفوفة JSON
      let urls;
      try {
        urls = JSON.parse(item.mediaUrls);
      } catch (e) {
        log(`WARN  could not parse mediaUrls JSON for PortfolioItem ${item.id}: ${e.message}`);
        return;
      }

      let arrayChanged = false;
      const newUrls = [];
      for (const u of urls) {
        const migrated = await migrateOneUrl(u, `PortfolioItem ${item.id} (mediaUrls item)`);
        if (migrated) {
          newUrls.push(migrated);
          arrayChanged = true;
        } else {
          newUrls.push(u);
        }
      }

      if (arrayChanged) {
        update.mediaUrls = JSON.stringify(newUrls);
        update.mediaUrl = newUrls[0]; // نفس منطق الإنشاء: mediaUrl يعكس أول ملف بالمصفوفة
      }
    } else if (item.mediaUrl) {
      // سجل ملف واحد
      const migrated = await migrateOneUrl(item.mediaUrl, `PortfolioItem ${item.id} (mediaUrl)`);
      if (migrated) {
        update.mediaUrl = migrated;
      }
    }

    if (Object.keys(update).length > 0 && !DRY_RUN) {
      await prisma.portfolioItem.update({ where: { id: item.id }, data: update });
    }
  }, CONCURRENCY);
};

const migrateCompanyLogos = async () => {
  const companies = await prisma.company.findMany({ select: { id: true, logo: true } });
  log(`Found ${companies.length} companies to check.`);

  await runWithConcurrency(companies, async (company) => {
    const migrated = await migrateOneUrl(company.logo, `Company ${company.id} (logo)`);
    if (migrated && !DRY_RUN) {
      await prisma.company.update({ where: { id: company.id }, data: { logo: migrated } });
    }
  }, CONCURRENCY);
};

const main = async () => {
  if (!process.env.B2_KEY_ID || !process.env.B2_APPLICATION_KEY || !process.env.B2_PUBLIC_BASE_URL) {
    console.error('B2 env vars are not set. Aborting - nothing was touched.');
    process.exit(1);
  }

  log(`Starting migration. DRY_RUN=${DRY_RUN}`);

  await migratePortfolioItems();
  await migrateCompanyLogos();

  log('--- SUMMARY ---');
  log(`Already on B2 (skipped): ${stats.alreadyMigrated}`);
  log(`Missing local file (skipped, flagged): ${stats.missingFile}`);
  if (DRY_RUN) {
    log(`Would upload: ${stats.wouldUpload}`);
  } else {
    log(`Uploaded successfully: ${stats.uploaded}`);
    log(`Failed (kept local, will retry next run): ${stats.failed}`);
  }

  const logPath = path.join(process.cwd(), `b2-migration-${DRY_RUN ? 'dryrun-' : ''}${Date.now()}.log`);
  fs.writeFileSync(logPath, logLines.join('\n'));
  log(`Full log written to ${logPath}`);

  await prisma.$disconnect();
};

main().catch(async (e) => {
  console.error('Fatal error:', e);
  await prisma.$disconnect();
  process.exit(1);
});
