// src/controllers/seoController.js
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// الحصول على SEO config
export const getSeoConfig = async (req, res) => {
  try {
    let seoConfig = await prisma.seoConfig.findFirst();

    if (!seoConfig) {
      // إنشاء SEO config افتراضي
      seoConfig = await prisma.seoConfig.create({
        data: {}
      });
    }

    res.json({ seoConfig });
  } catch (error) {
    console.error('Error in getSeoConfig:', error);
    res.status(500).json({ error: 'حدث خطأ في السيرفر' });
  }
};

// تحديث SEO config (Admin)
export const updateSeoConfig = async (req, res) => {
  try {
    const { siteTitle, siteDescription, siteKeywords, ogImage, twitterHandle } = req.body;

    let seoConfig = await prisma.seoConfig.findFirst();

    if (!seoConfig) {
      seoConfig = await prisma.seoConfig.create({
        data: {
          siteTitle,
          siteDescription,
          siteKeywords,
          ogImage,
          twitterHandle
        }
      });
    } else {
      seoConfig = await prisma.seoConfig.update({
        where: { id: seoConfig.id },
        data: {
          ...(siteTitle && { siteTitle }),
          ...(siteDescription && { siteDescription }),
          ...(siteKeywords && { siteKeywords }),
          ...(ogImage !== undefined && { ogImage }),
          ...(twitterHandle !== undefined && { twitterHandle })
        }
      });
    }

    res.json({
      message: 'تم تحديث إعدادات SEO بنجاح',
      seoConfig
    });
  } catch (error) {
    console.error('Error in updateSeoConfig:', error);
    res.status(500).json({ error: 'حدث خطأ في السيرفر' });
  }
};

// الحصول على metadata لصفحة محددة
export const getPageMetadata = async (req, res) => {
  try {
    const { type, slug } = req.params;

    const seoConfig = await prisma.seoConfig.findFirst();

    let metadata = {
      title: seoConfig?.siteTitle || 'Rastaka Portfolio',
      description: seoConfig?.siteDescription || 'معرض أعمال شركة Rastaka',
      keywords: seoConfig?.siteKeywords || 'تصميم, تطوير',
      ogImage: seoConfig?.ogImage || null,
      twitterHandle: seoConfig?.twitterHandle || null
    };

    if (type === 'portfolio' && slug) {
      // Metadata لعمل محدد
      const item = await prisma.portfolioItem.findUnique({
        where: { slug },
        include: { company: true }
      });

      if (item) {
        metadata = {
          title: item.seoTitle || `${item.title} - Rastaka Portfolio`,
          description: item.seoDescription || item.description,
          keywords: item.keywords || seoConfig?.siteKeywords || '',
          ogImage: item.mediaUrl ? `${req.protocol}://${req.get('host')}${item.mediaUrl}` : null,
          url: `${req.protocol}://${req.get('host')}/portfolio/${item.slug}`,
          type: 'article',
          publishedTime: item.publishDate
        };
      }
    } else if (type === 'company' && slug) {
      // Metadata لشركة محددة
      const company = await prisma.company.findUnique({
        where: { slug }
      });

      if (company) {
        metadata = {
          title: company.seoTitle || `${company.name} - Rastaka Portfolio`,
          description: company.seoDescription || company.description || '',
          keywords: company.seoKeywords || seoConfig?.siteKeywords || '',
          ogImage: company.logo ? `${req.protocol}://${req.get('host')}${company.logo}` : null,
          url: `${req.protocol}://${req.get('host')}/companies/${company.slug}`,
          type: 'website'
        };
      }
    }

    res.json({ metadata });
  } catch (error) {
    console.error('Error in getPageMetadata:', error);
    res.status(500).json({ error: 'حدث خطأ في السيرفر' });
  }
};

// توليد Sitemap
export const generateSitemap = async (req, res) => {
  try {
    const baseUrl = `${req.protocol}://${req.get('host')}`;

    // جلب جميع الأعمال
    const portfolioItems = await prisma.portfolioItem.findMany({
      where: {
        slug: { not: null }
      },
      select: {
        slug: true,
        updatedAt: true
      }
    });

    // جلب جميع الشركات
    const companies = await prisma.company.findMany({
      where: {
        slug: { not: null }
      },
      select: {
        slug: true,
        updatedAt: true
      }
    });

    // بناء XML sitemap
    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Home Page -->
  <url>
    <loc>${baseUrl}/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>

  <!-- Portfolio Items -->
${portfolioItems.map(item => `  <url>
    <loc>${baseUrl}/portfolio/${item.slug}</loc>
    <lastmod>${item.updatedAt.toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`).join('\n')}

  <!-- Companies -->
${companies.map(company => `  <url>
    <loc>${baseUrl}/companies/${company.slug}</loc>
    <lastmod>${company.updatedAt.toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`).join('\n')}

  <!-- Static Pages -->
  <url>
    <loc>${baseUrl}/websites</loc>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>
  <url>
    <loc>${baseUrl}/logos</loc>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>
  <url>
    <loc>${baseUrl}/reels</loc>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>
  <url>
    <loc>${baseUrl}/social-media</loc>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>
</urlset>`;

    res.header('Content-Type', 'application/xml');
    res.send(sitemap);
  } catch (error) {
    console.error('Error in generateSitemap:', error);
    res.status(500).json({ error: 'حدث خطأ في السيرفر' });
  }
};

// توليد robots.txt
export const generateRobotsTxt = async (req, res) => {
  try {
    const baseUrl = `${req.protocol}://${req.get('host')}`;

    const robotsTxt = `User-agent: *
Allow: /

Sitemap: ${baseUrl}/sitemap.xml`;

    res.header('Content-Type', 'text/plain');
    res.send(robotsTxt);
  } catch (error) {
    console.error('Error in generateRobotsTxt:', error);
    res.status(500).send('User-agent: *\nAllow: /');
  }
};
