# 🎨 Rastaka Portfolio Backend

Backend API لمعرض الأعمال الخاص بشركة Rastaka - نظام احترافي لإدارة وعرض الأعمال والمشاريع.

## 📋 المحتويات

- [الميزات](#-الميزات)
- [المتطلبات](#-المتطلبات)
- [التثبيت](#-التثبيت)
- [البنية](#-بنية-المشروع)
- [API Documentation](#-api-documentation)
- [أمثلة الاستخدام](#-أمثلة-الاستخدام)
- [التطوير](#-التطوير)

---

## ✨ الميزات

### 🎯 للزوار (Public API)
- ✅ تصفح معرض الأعمال مع فلترة متقدمة
- ✅ عرض الأعمال حسب النوع (شعارات، مواقع، سوشيال ميديا، ريلز)
- ✅ فصل الأعمال الفردية عن أعمال الشركات
- ✅ صفحات تفصيلية لكل عمل
- ✅ صفحة خاصة لكل شركة تعرض جميع أعمالها
- ✅ إحصائيات الأعمال
- ✅ دعم كامل لـ SEO (Slugs تلقائية، Metadata، Sitemap.xml)
- ✅ Open Graph & Twitter Cards

### 🔐 للإداريين (Admin Panel)
- ✅ إدارة الشركات (إضافة، تعديل، حذف)
- ✅ إدارة الأعمال مع تصنيفات متعددة
- ✅ رفع الصور والفيديوهات بـ Multer
- ✅ نظام مصادقة بـ JWT
- ✅ حماية الـ endpoints بـ Authentication
- ✅ تخصيص إعدادات SEO

### 📊 التصنيفات
- **WorkType**: `WEBSITE` | `LOGO` | `REEL` | `SOCIAL_MEDIA`
- **WorkCategory**: `INDIVIDUAL` | `CORPORATE`
- **MediaType**: `IMAGE` | `VIDEO`

---

## 🛠 المتطلبات

- Node.js >= 18.x
- PostgreSQL >= 13.x
- npm أو yarn

---

## 🚀 التثبيت

### 1. استنساخ المشروع

```bash
git clone <repository-url>
cd portfolio-backend
```

### 2. تثبيت المكتبات

```bash
npm install
```

### 3. إعداد قاعدة البيانات

أنشئ ملف `.env` في المجلد الرئيسي:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/portfolio_db"

# JWT Secret
JWT_SECRET="your_super_secret_jwt_key_change_this_in_production"

# Server
PORT=4000
NODE_ENV=development
```

### 4. تشغيل Migrations

```bash
npx prisma migrate dev
```

### 5. (اختياري) إضافة بيانات تجريبية

```bash
npx prisma studio
```

### 6. تشغيل السيرفر

```bash
# Development
npm run dev

# Production
npm start
```

السيرفر سيعمل على: `http://localhost:4000`

---

## 📁 بنية المشروع

```
portfolio-backend/
├── prisma/
│   ├── schema.prisma           # نماذج قاعدة البيانات
│   └── migrations/             # ملفات الـ migration
├── src/
│   ├── controllers/            # منطق العمليات
│   │   ├── authController.js        # المصادقة (تسجيل دخول/خروج)
│   │   ├── portfolioController.js   # إدارة الأعمال (CRUD)
│   │   └── companyController.js     # إدارة الشركات (CRUD)
│   ├── routes/                 # تعريف المسارات
│   │   ├── authRoutes.js            # مسارات المصادقة
│   │   ├── portfolioRoutes.js       # مسارات الأعمال
│   │   └── companyRoutes.js         # مسارات الشركات
│   ├── middleware/             # Middleware functions
│   │   └── auth.js                  # JWT authentication
│   ├── utils/                  # وظائف مساعدة
│   │   ├── multerConfig.js          # إعداد رفع الملفات
│   │   └── slugify.js
│   └── server.js               # نقطة البداية
├── uploads/                    # مجلد الملفات المرفوعة
├── .env                        # المتغيرات البيئية
├── package.json
├── API_DOCUMENTATION.md        # توثيق API مفصل
├── FRONTEND_GUIDE.md           # دليل التكامل مع Frontend
└── README.md                   # هذا الملف
```

---

## 📖 API Documentation

للاطلاع على التوثيق الكامل لجميع الـ endpoints، راجع ملف [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)

### أهم الـ Endpoints

#### Public (لا تحتاج authentication)

```http
GET  /api/portfolio                      # جميع الأعمال مع فلترة
GET  /api/portfolio/type/:type           # أعمال حسب النوع
GET  /api/portfolio/:id                  # تفاصيل عمل محدد
GET  /api/portfolio/stats                # إحصائيات
GET  /api/companies                      # جميع الشركات
GET  /api/companies/:id                  # تفاصيل شركة
GET  /api/companies/:id/portfolio        # أعمال شركة معينة

# SEO
GET  /api/seo/config                     # إعدادات SEO العامة
GET  /api/seo/metadata/:type/:slug       # Metadata لصفحة محددة
GET  /sitemap.xml                        # خريطة الموقع
GET  /robots.txt                         # ملف robots.txt
```

#### Admin (تحتاج authentication)

```http
# Authentication
POST   /api/auth/register                # تسجيل أدمن (مرة واحدة)
POST   /api/auth/login                   # تسجيل دخول
GET    /api/auth/me                      # معلومات الأدمن الحالي

# Portfolio Management
POST   /api/portfolio                    # إضافة عمل جديد
PUT    /api/portfolio/:id                # تحديث عمل
DELETE /api/portfolio/:id                # حذف عمل

# Company Management
POST   /api/companies                    # إضافة شركة
PUT    /api/companies/:id                # تحديث شركة
DELETE /api/companies/:id                # حذف شركة

# SEO Management
PUT    /api/seo/config                   # تحديث إعدادات SEO
```

---

## 💡 أمثلة الاستخدام

### 1. جلب جميع الريلز

```javascript
const response = await fetch('http://localhost:4000/api/portfolio/type/REEL');
const { portfolioItems } = await response.json();

portfolioItems.forEach(reel => {
  console.log(reel.title, reel.mediaUrl, reel.clientName || reel.company.name);
});
```

### 2. عرض أعمال شركة معينة مع التصنيفات

```javascript
// الصفحة الرئيسية للشركة
const response = await fetch('http://localhost:4000/api/companies/:id');
const { company } = await response.json();

// أعمال الشركة - كل الأنواع
const allWorks = await fetch('http://localhost:4000/api/companies/:id/portfolio');

// فلترة حسب النوع - ريلز فقط
const reels = await fetch('http://localhost:4000/api/companies/:id/portfolio?type=REEL');

// فلترة حسب النوع - شعارات فقط
const logos = await fetch('http://localhost:4000/api/companies/:id/portfolio?type=LOGO');
```

### 3. فصل الأعمال الفردية عن الشركات

```javascript
// أعمال الشركات فقط
const corporateWorks = await fetch('http://localhost:4000/api/portfolio?category=CORPORATE');

// أعمال الأفراد فقط
const individualWorks = await fetch('http://localhost:4000/api/portfolio?category=INDIVIDUAL');
```

### 4. إضافة عمل جديد (Admin)

```javascript
const formData = new FormData();
formData.append('title', 'شعار شركة ABC');
formData.append('description', 'شعار احترافي');
formData.append('type', 'LOGO');
formData.append('category', 'CORPORATE');
formData.append('companyId', 'company-uuid');
formData.append('media', fileInput.files[0]);

const token = localStorage.getItem('token');

const response = await fetch('http://localhost:4000/api/portfolio', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});

const result = await response.json();
console.log(result.message);
```

---

## 🎨 Frontend Integration

للاطلاع على دليل كامل للتكامل مع Frontend، راجع ملف [FRONTEND_GUIDE.md](./FRONTEND_GUIDE.md)

### مثال سريع

```javascript
// جلب جميع الشعارات
const logos = await fetch('http://localhost:4000/api/portfolio/type/LOGO');

// جلب أعمال شركة معينة
const companyWorks = await fetch('http://localhost:4000/api/companies/:id/portfolio');

// إضافة عمل جديد (Admin)
const formData = new FormData();
formData.append('title', 'عمل جديد');
formData.append('description', 'وصف العمل');
formData.append('type', 'LOGO');
formData.append('category', 'INDIVIDUAL');
formData.append('clientName', 'اسم العميل');
formData.append('media', file);

await fetch('http://localhost:4000/api/portfolio', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` },
  body: formData
});
```

---

## 🔧 التطوير

### إضافة عميل جديد (Admin)

```bash
# أولاً، احصل على token
curl -X POST http://localhost:4000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@rastaka.net",
    "password": "your_password"
  }'

# ثم أضف العميل
curl -X POST http://localhost:4000/clients \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "E-mall",
    "type": "COMPANY",
    "description": "منصة تسوق إلكتروني",
    "websiteUrl": "https://emall.com",
    "industry": "تجارة إلكترونية"
  }'
```

### تحديث الإعدادات

```bash
curl -X PATCH http://localhost:4000/api/config/colors \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "primaryColor": "#007f7f",
    "secondaryColor": "#222222"
  }'
```

### Prisma Commands

```bash
# فتح Prisma Studio لإدارة البيانات بشكل مرئي
npm run prisma:studio

# إنشاء migration جديد
npm run prisma:migrate

# إعادة توليد Prisma Client
npx prisma generate

# Reset database (⚠️ يحذف جميع البيانات)
npx prisma migrate reset
```

---

## 📊 Database Schema

### النماذج الرئيسية

```prisma
Admin {
  - id, email (unique), password (hashed)
  - name, createdAt, updatedAt
}

Company {
  - id, name, description, logo
  - portfolioItems[] (one-to-many)
  - createdAt, updatedAt
}

PortfolioItem {
  - id, title, description
  - type (WEBSITE/LOGO/REEL/SOCIAL_MEDIA)
  - category (INDIVIDUAL/CORPORATE)
  - websiteUrl (للمواقع)
  - mediaUrl, mediaType (IMAGE/VIDEO)
  - clientName (للأعمال الفردية)
  - companyId, company (للأعمال الخاصة بالشركات)
  - publishDate, createdAt, updatedAt
}
```

---

## 🔒 الأمان

- ✅ JWT Authentication للـ Admin routes
- ✅ Password hashing باستخدام bcryptjs
- ✅ Input validation
- ✅ CORS enabled
- ✅ Cascade delete لحماية سلامة البيانات
- ✅ Environment variables للمعلومات الحساسة

---

## 🐛 Troubleshooting

### مشكلة الاتصال بقاعدة البيانات

```bash
# تأكد من أن PostgreSQL شغال
# تحقق من DATABASE_URL في .env
```

### مشكلة BigInt في JSON

```javascript
// تم حلها في server.js
BigInt.prototype.toJSON = function() {
  return this.toString();
};
```

### Port already in use

```bash
# Windows
netstat -ano | findstr :4000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:4000 | xargs kill -9
```

---

## 🚀 الخطوات التالية

### للبدء مع المشروع:

1. **إنشاء حساب أدمن:**
   ```bash
   POST /api/auth/register
   {
     "email": "admin@rastaka.com",
     "password": "your-password",
     "name": "Admin"
   }
   ```

2. **تسجيل الدخول:**
   ```bash
   POST /api/auth/login
   ```

3. **إضافة شركات:**
   ```bash
   POST /api/companies
   ```

4. **إضافة أعمال:**
   ```bash
   POST /api/portfolio
   ```

### للتطوير:
- راجع [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) للتفاصيل الكاملة
- راجع [FRONTEND_GUIDE.md](./FRONTEND_GUIDE.md) للتكامل مع Frontend
- راجع [SEO_GUIDE.md](./SEO_GUIDE.md) لتحسين محركات البحث

---

## 🤝 المساهمة

نرحب بالمساهمات! يرجى فتح Issue أو Pull Request.

---

## 📄 الترخيص

هذا المشروع مملوك لشركة Rastaka.

---

## 📞 التواصل

- **Website:** [rastaka.net](https://rastaka.net)
- **Email:** info@rastaka.net
- **Portfolio:** [rastaka.net/portfolio](https://rastaka.net/portfolio/)

---

**Made with ❤️ by Rastaka Team**
