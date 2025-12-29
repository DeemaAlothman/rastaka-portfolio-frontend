# ملخص المشروع - Rastaka Portfolio Backend

## 🎯 نظرة عامة

تم بناء Backend API متكامل لمعرض أعمال شركة Rastaka، يدعم عرض وإدارة الأعمال بطريقة احترافية ومنظمة.

---

## ✅ ما تم إنجازه

### 1. قاعدة البيانات (Database Schema)
- ✅ نموذج Admin للأدمن
- ✅ نموذج Company للشركات
- ✅ نموذج PortfolioItem للأعمال
- ✅ نموذج SeoConfig لإعدادات SEO
- ✅ Enums لتصنيفات الأعمال
- ✅ Relations بين الجداول
- ✅ Indexes للبحث السريع

### 2. نظام المصادقة (Authentication)
- ✅ تسجيل أدمن جديد
- ✅ تسجيل دخول بـ JWT
- ✅ Middleware للحماية
- ✅ Password hashing بـ bcryptjs

### 3. إدارة الأعمال (Portfolio Management)
- ✅ إضافة عمل جديد (CRUD)
- ✅ تحديث عمل
- ✅ حذف عمل
- ✅ عرض الأعمال مع فلترة
- ✅ عرض حسب النوع (مواقع، شعارات، ريلز، سوشيال ميديا)
- ✅ فصل الأعمال الفردية عن الشركات
- ✅ إحصائيات الأعمال

### 4. إدارة الشركات (Company Management)
- ✅ إضافة شركة (CRUD)
- ✅ تحديث شركة
- ✅ حذف شركة (مع حماية)
- ✅ عرض أعمال شركة معينة
- ✅ فلترة أعمال الشركة حسب النوع

### 5. رفع الملفات (File Upload)
- ✅ Multer configuration
- ✅ دعم الصور (jpg, png, gif, webp)
- ✅ دعم الفيديو (mp4, mov, avi, webm)
- ✅ حد أقصى 50MB
- ✅ File validation

### 6. SEO Support
- ✅ Slugs تلقائية للأعمال والشركات
- ✅ حقول SEO (title, description, keywords)
- ✅ Metadata API لكل صفحة
- ✅ Sitemap.xml تلقائي
- ✅ Robots.txt
- ✅ إعدادات SEO قابلة للتخصيص
- ✅ Open Graph & Twitter Cards support

---

## 📁 هيكل الملفات

```
portfolio-backend/
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── src/
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── portfolioController.js
│   │   ├── companyController.js
│   │   └── seoController.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── portfolioRoutes.js
│   │   ├── companyRoutes.js
│   │   └── seoRoutes.js
│   ├── middleware/
│   │   └── auth.js
│   ├── utils/
│   │   ├── multerConfig.js
│   │   └── slugify.js
│   └── server.js
├── uploads/
├── .env
├── package.json
├── API_DOCUMENTATION.md
├── FRONTEND_GUIDE.md
├── SEO_GUIDE.md
└── README.md
```

---

## 🔌 الـ API Endpoints

### Authentication
```
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me
```

### Portfolio
```
GET    /api/portfolio
GET    /api/portfolio/type/:type
GET    /api/portfolio/:id
GET    /api/portfolio/stats
POST   /api/portfolio (Admin)
PUT    /api/portfolio/:id (Admin)
DELETE /api/portfolio/:id (Admin)
```

### Companies
```
GET    /api/companies
GET    /api/companies/:id
GET    /api/companies/:id/portfolio
POST   /api/companies (Admin)
PUT    /api/companies/:id (Admin)
DELETE /api/companies/:id (Admin)
```

### SEO
```
GET  /api/seo/config
GET  /api/seo/metadata/:type/:slug
PUT  /api/seo/config (Admin)
GET  /sitemap.xml
GET  /robots.txt
```

---

## 🗄️ نماذج البيانات

### Admin
- id, email, password (hashed), name

### Company
- id, name, description, logo
- slug, seoTitle, seoDescription, seoKeywords
- portfolioItems[] (relation)

### PortfolioItem
- id, title, description
- type (WEBSITE | LOGO | REEL | SOCIAL_MEDIA)
- category (INDIVIDUAL | CORPORATE)
- websiteUrl, mediaUrl, mediaType (IMAGE | VIDEO)
- clientName, companyId
- slug, seoTitle, seoDescription, keywords
- publishDate

### SeoConfig
- siteTitle, siteDescription, siteKeywords
- ogImage, twitterHandle

---

## 🔧 التقنيات المستخدمة

- **Backend**: Node.js + Express
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT + bcryptjs
- **File Upload**: Multer
- **CORS**: Enabled
- **Environment**: dotenv

---

## 📚 الملفات التوثيقية

1. **[README.md](README.md)** - دليل التثبيت والاستخدام الأساسي
2. **[API_DOCUMENTATION.md](API_DOCUMENTATION.md)** - توثيق شامل لجميع الـ endpoints
3. **[FRONTEND_GUIDE.md](FRONTEND_GUIDE.md)** - دليل التكامل مع Frontend
4. **[SEO_GUIDE.md](SEO_GUIDE.md)** - دليل تحسين محركات البحث

---

## 🚀 الخطوات القادمة للاستخدام

### 1. إعداد البيئة
```bash
npm install
```

### 2. إعداد .env
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/portfolio_db"
JWT_SECRET="your-secret-key"
PORT=4000
```

### 3. Migration
```bash
npx prisma migrate dev
```

### 4. تشغيل السيرفر
```bash
npm run dev
```

### 5. إنشاء حساب أدمن
```bash
POST /api/auth/register
{
  "email": "admin@rastaka.com",
  "password": "your-password",
  "name": "Admin"
}
```

### 6. تسجيل الدخول
```bash
POST /api/auth/login
{
  "email": "admin@rastaka.com",
  "password": "your-password"
}
```

### 7. البدء بإضافة البيانات
- إضافة شركات
- إضافة أعمال لكل شركة
- إضافة أعمال فردية

---

## 🎨 أمثلة الاستخدام

### إضافة شركة
```javascript
const formData = new FormData();
formData.append('name', 'شركة ABC');
formData.append('description', 'شركة تقنية رائدة');
formData.append('logo', logoFile);

fetch('http://localhost:4000/api/companies', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` },
  body: formData
});
```

### إضافة عمل
```javascript
const formData = new FormData();
formData.append('title', 'شعار شركة ABC');
formData.append('description', 'شعار احترافي');
formData.append('type', 'LOGO');
formData.append('category', 'CORPORATE');
formData.append('companyId', 'company-uuid');
formData.append('media', file);

fetch('http://localhost:4000/api/portfolio', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` },
  body: formData
});
```

### عرض أعمال شركة
```javascript
fetch('http://localhost:4000/api/companies/company-id/portfolio?type=LOGO')
  .then(res => res.json())
  .then(data => console.log(data.portfolioItems));
```

---

## 🔒 الأمان

- ✅ JWT Authentication
- ✅ Password hashing
- ✅ Protected admin routes
- ✅ Input validation
- ✅ CORS enabled
- ✅ Environment variables
- ✅ Cascade delete protection

---

## 📊 الإحصائيات

- **Endpoints**: 20+
- **Models**: 4
- **Controllers**: 4
- **Routes**: 4
- **Middleware**: 1
- **Utils**: 2

---

## 🎯 الميزات الرئيسية

1. **نظام مصادقة آمن** - JWT + bcryptjs
2. **إدارة متكاملة** - CRUD للأعمال والشركات
3. **رفع ملفات قوي** - صور وفيديو بـ Multer
4. **SEO محسّن** - Slugs، Metadata، Sitemap
5. **فلترة متقدمة** - حسب النوع، الفئة، الشركة
6. **API موثّق** - توثيق شامل ومفصّل
7. **سهل التكامل** - دليل Frontend كامل

---

## ✅ النتيجة النهائية

تم بناء **Backend API متكامل وجاهز للاستخدام** يدعم:
- ✅ عرض الأعمال بشكل منظم ومصنف
- ✅ لوحة تحكم للأدمن
- ✅ رفع صور وفيديوهات
- ✅ SEO محسّن
- ✅ API موثّق بالكامل
- ✅ جاهز للتكامل مع Frontend

**المشروع جاهز للتطوير والنشر! 🚀**

---

Made with ❤️ for Rastaka
