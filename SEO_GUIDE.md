# دليل SEO للـ Portfolio Backend

تم إضافة دعم كامل لـ SEO في هذا المشروع لضمان ظهور أفضل في محركات البحث.

---

## 🎯 الميزات المضافة

### 1. حقول SEO في قاعدة البيانات

#### للأعمال (PortfolioItem):
- `slug` - رابط صديق لمحركات البحث (يتم توليده تلقائياً من العنوان)
- `seoTitle` - عنوان مخصص لـ SEO
- `seoDescription` - وصف مخصص لـ SEO
- `keywords` - كلمات مفتاحية

#### للشركات (Company):
- `slug` - رابط صديق لمحركات البحث
- `seoTitle` - عنوان مخصص لـ SEO
- `seoDescription` - وصف مخصص لـ SEO
- `seoKeywords` - كلمات مفتاحية

#### إعدادات SEO العامة (SeoConfig):
- `siteTitle` - عنوان الموقع الافتراضي
- `siteDescription` - وصف الموقع الافتراضي
- `siteKeywords` - كلمات مفتاحية عامة
- `ogImage` - صورة Open Graph للموقع
- `twitterHandle` - معرف تويتر

---

## 📡 الـ Endpoints المتاحة

### 1. الحصول على إعدادات SEO العامة
```http
GET /api/seo/config
```

**Response:**
```json
{
  "seoConfig": {
    "siteTitle": "Rastaka Portfolio",
    "siteDescription": "معرض أعمال شركة Rastaka",
    "siteKeywords": "تصميم, تطوير, ريلز, شعارات",
    "ogImage": "/uploads/og-image.jpg",
    "twitterHandle": "@rastaka"
  }
}
```

---

### 2. تحديث إعدادات SEO (Admin)
```http
PUT /api/seo/config
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "siteTitle": "Rastaka - Portfolio",
  "siteDescription": "استكشف أعمالنا الإبداعية",
  "siteKeywords": "تصميم, برمجة, ريلز, شعارات, مواقع",
  "ogImage": "/uploads/og-default.jpg",
  "twitterHandle": "@rastaka"
}
```

---

### 3. الحصول على Metadata لصفحة محددة
```http
GET /api/seo/metadata/:type/:slug
```

**أمثلة:**
```
GET /api/seo/metadata/portfolio/شعار-شركة-abc
GET /api/seo/metadata/company/emall
```

**Response للعمل:**
```json
{
  "metadata": {
    "title": "شعار شركة ABC - Rastaka Portfolio",
    "description": "شعار احترافي تم تصميمه لشركة ABC",
    "keywords": "شعار, تصميم, ABC",
    "ogImage": "http://localhost:4000/uploads/logo-abc.jpg",
    "url": "http://localhost:4000/portfolio/شعار-شركة-abc",
    "type": "article",
    "publishedTime": "2025-12-07T..."
  }
}
```

**Response للشركة:**
```json
{
  "metadata": {
    "title": "E-mall - Rastaka Portfolio",
    "description": "جميع أعمالنا لصالح شركة E-mall",
    "keywords": "emall, تجارة إلكترونية",
    "ogImage": "http://localhost:4000/uploads/emall-logo.jpg",
    "url": "http://localhost:4000/companies/emall",
    "type": "website"
  }
}
```

---

### 4. Sitemap.xml
```http
GET /sitemap.xml
```

يولد ملف sitemap.xml تلقائياً يحتوي على:
- الصفحة الرئيسية
- جميع الأعمال (Portfolio Items)
- جميع الشركات (Companies)
- الصفحات الثابتة (مواقع، شعارات، ريلز، سوشيال ميديا)

**مثال على المحتوى:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>http://localhost:4000/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>http://localhost:4000/portfolio/شعار-abc</loc>
    <lastmod>2025-12-07T...</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <!-- ... المزيد -->
</urlset>
```

---

### 5. Robots.txt
```http
GET /robots.txt
```

**Response:**
```
User-agent: *
Allow: /

Sitemap: http://localhost:4000/sitemap.xml
```

---

## 🔧 التكامل مع Frontend

### 1. استخدام Metadata في رأس الصفحة

#### React/Next.js Example:
```jsx
import { useEffect, useState } from 'react';
import Head from 'next/head';

function PortfolioPage({ slug }) {
  const [metadata, setMetadata] = useState(null);

  useEffect(() => {
    fetch(`http://localhost:4000/api/seo/metadata/portfolio/${slug}`)
      .then(res => res.json())
      .then(data => setMetadata(data.metadata));
  }, [slug]);

  if (!metadata) return null;

  return (
    <>
      <Head>
        <title>{metadata.title}</title>
        <meta name="description" content={metadata.description} />
        <meta name="keywords" content={metadata.keywords} />

        {/* Open Graph */}
        <meta property="og:title" content={metadata.title} />
        <meta property="og:description" content={metadata.description} />
        <meta property="og:image" content={metadata.ogImage} />
        <meta property="og:url" content={metadata.url} />
        <meta property="og:type" content={metadata.type} />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={metadata.title} />
        <meta name="twitter:description" content={metadata.description} />
        <meta name="twitter:image" content={metadata.ogImage} />
      </Head>

      {/* محتوى الصفحة */}
    </>
  );
}
```

---

### 2. إضافة SEO عند إنشاء عمل جديد

```javascript
const createPortfolioWithSEO = async () => {
  const formData = new FormData();

  formData.append('title', 'شعار شركة ABC');
  formData.append('description', 'شعار احترافي مميز');
  formData.append('type', 'LOGO');
  formData.append('category', 'CORPORATE');
  formData.append('companyId', 'company-uuid');
  formData.append('media', file);

  // سيتم توليد slug تلقائياً من title
  // slug: "شعار-شركة-abc"

  const token = localStorage.getItem('token');

  await fetch('http://localhost:4000/api/portfolio', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  });
};
```

الـ slug سيتم توليده تلقائياً من العنوان!

---

### 3. استخدام Structured Data (JSON-LD)

```jsx
function PortfolioItem({ item }) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    "name": item.title,
    "description": item.description,
    "image": `http://localhost:4000${item.mediaUrl}`,
    "datePublished": item.publishDate,
    "creator": {
      "@type": "Organization",
      "name": "Rastaka"
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      {/* محتوى الصفحة */}
    </>
  );
}
```

---

## 🚀 أفضل الممارسات

### 1. عناوين SEO
- استخدم عناوين واضحة ووصفية
- اجعل العنوان بين 50-60 حرف
- ضمّن الكلمة المفتاحية الرئيسية

**مثال:**
```
سيء: "عمل جديد"
جيد: "شعار احترافي لشركة ABC | Rastaka"
```

---

### 2. الوصف (Description)
- اكتب وصف جذاب بين 150-160 حرف
- ضمّن call-to-action
- أضف الكلمات المفتاحية بشكل طبيعي

**مثال:**
```
"شعار احترافي مميز صممناه لشركة ABC. استكشف المزيد من أعمالنا الإبداعية في التصميم والبرمجة."
```

---

### 3. الكلمات المفتاحية
- استخدم 5-10 كلمات مفتاحية ذات صلة
- افصلها بفواصل

**مثال:**
```
"شعار, تصميم شعارات, برمجة, تطوير مواقع, ريلز, سوشيال ميديا"
```

---

### 4. الصور (OG Images)
- استخدم صور بدقة 1200x630 بكسل
- حجم الملف أقل من 1MB
- استخدم صيغة JPG أو PNG

---

## 📊 مراقبة الأداء

### أدوات مفيدة:
1. **Google Search Console** - لمراقبة ظهور الموقع في جوجل
2. **Google PageSpeed Insights** - لاختبار سرعة الموقع
3. **Lighthouse** - لتقييم SEO والأداء
4. **Screaming Frog** - لفحص الـ sitemap والروابط

---

## 🔗 روابط مفيدة

### تسجيل Sitemap:
1. افتح [Google Search Console](https://search.google.com/search-console)
2. اختر موقعك
3. اذهب إلى Sitemaps
4. أضف: `https://yoursite.com/sitemap.xml`

---

## ⚡ الخطوات القادمة

### لتحسين SEO أكثر:
1. إضافة schema.org markup لكل نوع محتوى
2. تحسين سرعة تحميل الصور
3. إضافة alt text للصور
4. تحسين بنية الروابط الداخلية
5. إضافة canonical URLs
6. إنشاء محتوى فريد ومفيد

---

## 📞 الخلاصة

تم إضافة نظام SEO متكامل يشمل:
- ✅ Slugs تلقائية لجميع الأعمال والشركات
- ✅ Metadata API لكل صفحة
- ✅ Sitemap.xml تلقائي
- ✅ Robots.txt
- ✅ إعدادات SEO قابلة للتخصيص
- ✅ دعم Open Graph و Twitter Cards

**استخدم هذه الأدوات لضمان أفضل ظهور في محركات البحث! 🚀**
