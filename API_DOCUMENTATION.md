# API Documentation - Rastaka Portfolio Backend

## Base URL
```
http://localhost:4000/api
```

---

## Authentication Endpoints

### 1. Register Admin (استخدمها مرة واحدة فقط)
```http
POST /api/auth/register
```

**Request Body:**
```json
{
  "email": "admin@rastaka.com",
  "password": "your-secure-password",
  "name": "Admin Name"
}
```

**Response:**
```json
{
  "message": "تم إنشاء حساب الأدمن بنجاح",
  "admin": {
    "id": "uuid",
    "email": "admin@rastaka.com",
    "name": "Admin Name"
  }
}
```

---

### 2. Login
```http
POST /api/auth/login
```

**Request Body:**
```json
{
  "email": "admin@rastaka.com",
  "password": "your-secure-password"
}
```

**Response:**
```json
{
  "message": "تم تسجيل الدخول بنجاح",
  "token": "jwt-token-here",
  "admin": {
    "id": "uuid",
    "email": "admin@rastaka.com",
    "name": "Admin Name"
  }
}
```

---

### 3. Get Current Admin (Protected)
```http
GET /api/auth/me
```

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "admin": {
    "id": "uuid",
    "email": "admin@rastaka.com",
    "name": "Admin Name",
    "createdAt": "2025-12-07T..."
  }
}
```

---

## Portfolio Endpoints

### 1. Get All Portfolio Items (Public)
```http
GET /api/portfolio
```

**Query Parameters:**
- `type` (optional): WEBSITE | LOGO | REEL | SOCIAL_MEDIA
- `category` (optional): INDIVIDUAL | CORPORATE
- `companyId` (optional): uuid

**Examples:**
```
GET /api/portfolio
GET /api/portfolio?type=LOGO
GET /api/portfolio?category=INDIVIDUAL
GET /api/portfolio?type=WEBSITE&category=CORPORATE
GET /api/portfolio?companyId=uuid-here
```

**Response:**
```json
{
  "count": 10,
  "portfolioItems": [
    {
      "id": "uuid",
      "title": "موقع شركة ABC",
      "description": "موقع إلكتروني حديث",
      "type": "WEBSITE",
      "category": "CORPORATE",
      "websiteUrl": "https://example.com",
      "mediaUrl": "/uploads/image.jpg",
      "mediaType": "IMAGE",
      "clientName": null,
      "companyId": "uuid",
      "company": {
        "id": "uuid",
        "name": "ABC Company",
        "logo": "/uploads/logo.png"
      },
      "publishDate": "2025-12-07T...",
      "createdAt": "2025-12-07T...",
      "updatedAt": "2025-12-07T..."
    }
  ]
}
```

---

### 2. Get Portfolio Items by Type (Public)
```http
GET /api/portfolio/type/:type
```

**Types:** `WEBSITE` | `LOGO` | `REEL` | `SOCIAL_MEDIA`

**Query Parameters:**
- `category` (optional): INDIVIDUAL | CORPORATE

**Examples:**
```
GET /api/portfolio/type/LOGO
GET /api/portfolio/type/REEL?category=INDIVIDUAL
GET /api/portfolio/type/WEBSITE?category=CORPORATE
```

---

### 3. Get Portfolio Item by ID (Public)
```http
GET /api/portfolio/:id
```

**Response:**
```json
{
  "portfolioItem": {
    "id": "uuid",
    "title": "شعار شركة XYZ",
    "description": "شعار احترافي",
    "type": "LOGO",
    "category": "CORPORATE",
    "mediaUrl": "/uploads/logo.png",
    "mediaType": "IMAGE",
    "company": {
      "id": "uuid",
      "name": "XYZ Company",
      "description": "شركة تقنية",
      "logo": "/uploads/company-logo.png"
    }
  }
}
```

---

### 4. Get Portfolio Statistics (Public)
```http
GET /api/portfolio/stats
```

**Response:**
```json
{
  "stats": {
    "total": 25,
    "byType": {
      "WEBSITE": 8,
      "LOGO": 10,
      "REEL": 5,
      "SOCIAL_MEDIA": 2
    },
    "byCategory": {
      "INDIVIDUAL": 15,
      "CORPORATE": 10
    }
  }
}
```

---

### 5. Create Portfolio Item (Protected - Admin Only)
```http
POST /api/portfolio
```

**Headers:**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Form Data:**
- `title` (required): string
- `description` (required): string
- `type` (required): WEBSITE | LOGO | REEL | SOCIAL_MEDIA
- `category` (required): INDIVIDUAL | CORPORATE
- `media` (required): file (image or video)
- `websiteUrl` (optional): string (للمواقع فقط)
- `clientName` (optional): string (للأعمال الفردية)
- `companyId` (optional): uuid (للأعمال الخاصة بالشركات)
- `publishDate` (optional): ISO date string

**Example - Individual Logo:**
```
title: "شعار محل القهوة"
description: "شعار مميز لمحل قهوة محلي"
type: "LOGO"
category: "INDIVIDUAL"
clientName: "محل القهوة"
media: [file]
```

**Example - Corporate Website:**
```
title: "موقع شركة التقنية"
description: "موقع شركة احترافي"
type: "WEBSITE"
category: "CORPORATE"
companyId: "uuid-here"
websiteUrl: "https://example.com"
media: [file]
```

---

### 6. Update Portfolio Item (Protected - Admin Only)
```http
PUT /api/portfolio/:id
```

**Headers:**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Form Data:** (all optional)
- `title`: string
- `description`: string
- `type`: WEBSITE | LOGO | REEL | SOCIAL_MEDIA
- `category`: INDIVIDUAL | CORPORATE
- `media`: file
- `websiteUrl`: string
- `clientName`: string
- `companyId`: uuid
- `publishDate`: ISO date string

---

### 7. Delete Portfolio Item (Protected - Admin Only)
```http
DELETE /api/portfolio/:id
```

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "message": "تم حذف العمل بنجاح"
}
```

---

## Company Endpoints

### 1. Get All Companies (Public)
```http
GET /api/companies
```

**Response:**
```json
{
  "count": 5,
  "companies": [
    {
      "id": "uuid",
      "name": "ABC Company",
      "description": "شركة تقنية رائدة",
      "logo": "/uploads/logo.png",
      "createdAt": "2025-12-07T...",
      "updatedAt": "2025-12-07T...",
      "_count": {
        "portfolioItems": 8
      }
    }
  ]
}
```

---

### 2. Get Company by ID (Public)
```http
GET /api/companies/:id
```

**Response:**
```json
{
  "company": {
    "id": "uuid",
    "name": "ABC Company",
    "description": "شركة تقنية",
    "logo": "/uploads/logo.png",
    "portfolioItems": [
      {
        "id": "uuid",
        "title": "موقع الشركة",
        "description": "موقع احترافي",
        "type": "WEBSITE",
        "mediaUrl": "/uploads/site.jpg",
        "publishDate": "2025-12-07T..."
      }
    ]
  }
}
```

---

### 3. Get Company Portfolio (Public)
```http
GET /api/companies/:id/portfolio
```

**Query Parameters:**
- `type` (optional): WEBSITE | LOGO | REEL | SOCIAL_MEDIA

**Examples:**
```
GET /api/companies/uuid-here/portfolio
GET /api/companies/uuid-here/portfolio?type=LOGO
```

**Response:**
```json
{
  "company": {
    "id": "uuid",
    "name": "ABC Company",
    "description": "شركة تقنية",
    "logo": "/uploads/logo.png"
  },
  "count": 8,
  "portfolioItems": [...]
}
```

---

### 4. Create Company (Protected - Admin Only)
```http
POST /api/companies
```

**Headers:**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Form Data:**
- `name` (required): string
- `description` (optional): string
- `logo` (optional): file (image)

---

### 5. Update Company (Protected - Admin Only)
```http
PUT /api/companies/:id
```

**Headers:**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Form Data:** (all optional)
- `name`: string
- `description`: string
- `logo`: file

---

### 6. Delete Company (Protected - Admin Only)
```http
DELETE /api/companies/:id
```

**Headers:**
```
Authorization: Bearer <token>
```

**Note:** لا يمكن حذف شركة تحتوي على أعمال مرتبطة بها

---

## Error Responses

### 400 Bad Request
```json
{
  "error": "رسالة الخطأ"
}
```

### 401 Unauthorized
```json
{
  "error": "غير مصرح - لا يوجد token"
}
```

### 404 Not Found
```json
{
  "error": "العنصر غير موجود"
}
```

### 500 Internal Server Error
```json
{
  "error": "حدث خطأ في السيرفر"
}
```

---

## File Upload Notes

- **Max file size:** 50MB
- **Supported image formats:** jpg, jpeg, png, gif, webp
- **Supported video formats:** mp4, mov, avi, webm
- **Upload folder:** `/uploads/`
- **Access uploaded files:** `http://localhost:4000/uploads/filename.ext`

---

## Workflow Examples

### للزوار (Public)

1. **عرض جميع الشعارات:**
   ```
   GET /api/portfolio/type/LOGO
   ```

2. **عرض الأعمال الفردية فقط:**
   ```
   GET /api/portfolio?category=INDIVIDUAL
   ```

3. **عرض قائمة الشركات:**
   ```
   GET /api/companies
   ```

4. **عرض أعمال شركة معينة:**
   ```
   GET /api/companies/:id/portfolio
   ```

---

### للأدمن (Dashboard)

1. **تسجيل الدخول:**
   ```
   POST /api/auth/login
   ```

2. **إضافة شركة جديدة:**
   ```
   POST /api/companies
   ```

3. **إضافة عمل لشركة:**
   ```
   POST /api/portfolio
   (مع تحديد companyId و category=CORPORATE)
   ```

4. **إضافة عمل فردي:**
   ```
   POST /api/portfolio
   (مع تحديد clientName و category=INDIVIDUAL)
   ```

5. **تحديث عمل:**
   ```
   PUT /api/portfolio/:id
   ```

6. **حذف عمل:**
   ```
   DELETE /api/portfolio/:id
   ```
