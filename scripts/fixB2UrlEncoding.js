// scripts/fixB2UrlEncoding.js
//
// تصحيح شكل روابط B2 المخزنة بقاعدة البيانات فقط (نص الرابط، مو الملف نفسه).
// السبب: دفعة الترحيل الأولى خزّنت روابط فيها مسافات/حروف عربية بدون ترميز URL صحيح.
//
// - لا يرفع ولا يحذف ولا يلمس أي ملف على B2 أو محلياً إطلاقاً - تعديل نص فقط بقاعدة البيانات.
// - يلمس فقط الروابط التي تبدأ بـ B2_PUBLIC_BASE_URL (لا يلمس أي رابط محلي /uploads/... متبقٍ).
// - يتخطى أي رابط مرمّز أصلاً بشكل صحيح (لا تغيير = لا كتابة) - آمن للتشغيل أكثر من مرة.
// - وضع فحص فقط: --dry-run
//
// تشغيل داخل الـ container:
//   docker exec -w /app portfolio-backend node scripts/fixB2UrlEncoding.js --dry-run
//   docker exec -w /app portfolio-backend node scripts/fixB2UrlEncoding.js

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const DRY_RUN = process.argv.includes('--dry-run');

const B2_BASE = (process.env.B2_PUBLIC_BASE_URL || '').replace(/\/$/, '');

const stats = { checked: 0, alreadyFine: 0, notB2: 0, fixed: 0 };
const logLines = [];
const log = (line) => {
  const stamped = `[${new Date().toISOString()}] ${line}`;
  console.log(stamped);
  logLines.push(stamped);
};

// يرجع الرابط المصحح، أو null لو ما في داعي تغيير (مو رابط B2، أو أصلاً مرمّز صح)
const fixUrl = (url) => {
  if (!url) return null;
  stats.checked++;

  if (!B2_BASE || !url.startsWith(`${B2_BASE}/`)) {
    stats.notB2++;
    return null; // رابط محلي أو خارجي - ما إلنا علاقة فيه هون
  }

  const rawKey = url.slice(B2_BASE.length + 1);
  const properUrl = `${B2_BASE}/${encodeURIComponent(rawKey)}`;

  if (properUrl === url) {
    stats.alreadyFine++;
    return null; // مرمّز صح أصلاً
  }

  return properUrl;
};

const fixPortfolioItems = async () => {
  const items = await prisma.portfolioItem.findMany({
    select: { id: true, mediaUrl: true, mediaUrls: true },
  });
  log(`Found ${items.length} portfolio items to check.`);

  for (const item of items) {
    const update = {};

    const fixedMediaUrl = fixUrl(item.mediaUrl);
    if (fixedMediaUrl) {
      update.mediaUrl = fixedMediaUrl;
    }

    if (item.mediaUrls) {
      let urls;
      try {
        urls = JSON.parse(item.mediaUrls);
      } catch (e) {
        log(`WARN  could not parse mediaUrls JSON for PortfolioItem ${item.id}: ${e.message}`);
        urls = null;
      }

      if (urls) {
        let arrayChanged = false;
        const newUrls = urls.map((u) => {
          const fixed = fixUrl(u);
          if (fixed) arrayChanged = true;
          return fixed || u;
        });

        if (arrayChanged) {
          update.mediaUrls = JSON.stringify(newUrls);
          // نفس منطق الإنشاء: mediaUrl يعكس أول ملف بالمصفوفة، صحّحه لو ما انصحح فوق
          if (!update.mediaUrl) update.mediaUrl = newUrls[0];
        }
      }
    }

    if (Object.keys(update).length > 0) {
      log(`FIX   PortfolioItem ${item.id}: ${JSON.stringify(update)}`);
      stats.fixed++;
      if (!DRY_RUN) {
        await prisma.portfolioItem.update({ where: { id: item.id }, data: update });
      }
    }
  }
};

const fixCompanyLogos = async () => {
  const companies = await prisma.company.findMany({ select: { id: true, logo: true } });
  log(`Found ${companies.length} companies to check.`);

  for (const company of companies) {
    const fixedLogo = fixUrl(company.logo);
    if (fixedLogo) {
      log(`FIX   Company ${company.id} logo: ${company.logo} -> ${fixedLogo}`);
      stats.fixed++;
      if (!DRY_RUN) {
        await prisma.company.update({ where: { id: company.id }, data: { logo: fixedLogo } });
      }
    }
  }
};

const main = async () => {
  if (!B2_BASE) {
    console.error('B2_PUBLIC_BASE_URL is not set. Aborting - nothing was touched.');
    process.exit(1);
  }

  log(`Starting URL-encoding fix-up. DRY_RUN=${DRY_RUN}. B2_BASE=${B2_BASE}`);

  await fixPortfolioItems();
  await fixCompanyLogos();

  log('--- SUMMARY ---');
  log(`Links checked: ${stats.checked}`);
  log(`Not a B2 link (skipped): ${stats.notB2}`);
  log(`Already correctly encoded (skipped): ${stats.alreadyFine}`);
  log(`${DRY_RUN ? 'Would fix' : 'Fixed'}: ${stats.fixed}`);

  await prisma.$disconnect();
};

main().catch(async (e) => {
  console.error('Fatal error:', e);
  await prisma.$disconnect();
  process.exit(1);
});
