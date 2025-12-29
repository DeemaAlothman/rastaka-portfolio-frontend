# دليل رفع الصور المتعددة للسوشيال ميديا

تم إضافة دعم رفع صور متعددة لأعمال السوشيال ميديا.

---

## ✅ التحديثات الجديدة

### 1. قاعدة البيانات
- إضافة حقل `mediaUrls` لتخزين مصفوفة JSON من روابط الصور
- جعل الحقول التالية اختيارية: `description`, `mediaUrl`, `mediaType`

### 2. رفع الملفات
- دعم رفع حتى 10 صور في طلب واحد
- يتم استخدام `upload.array('media', 10)` بدلاً من `upload.single('media')`

---

## 📤 كيفية رفع عمل سوشيال ميديا جديد

### مثال باستخدام JavaScript/Fetch:

```javascript
const uploadSocialMediaPost = async (files) => {
  const formData = new FormData();

  // البيانات الأساسية
  formData.append('title', 'منشور سوشيال ميديا جديد');
  formData.append('description', 'وصف المنشور (اختياري)');
  formData.append('type', 'SOCIAL_MEDIA');
  formData.append('category', 'INDIVIDUAL'); // أو CORPORATE

  // إذا كان للعميل فردي
  formData.append('clientName', 'اسم العميل');

  // أو إذا كان لشركة
  // formData.append('companyId', 'uuid-of-company');

  // رفع الصور المتعددة (حتى 10 صور)
  files.forEach(file => {
    formData.append('media', file);
  });

  const token = localStorage.getItem('token');

  const response = await fetch('http://localhost:4000/api/portfolio', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  });

  const result = await response.json();
  console.log(result);
};

// استخدام:
const fileInput = document.querySelector('input[type="file"]');
fileInput.addEventListener('change', (e) => {
  const files = Array.from(e.target.files);
  uploadSocialMediaPost(files);
});
```

---

## 🔄 تحديث عمل سوشيال ميديا موجود

```javascript
const updateSocialMediaPost = async (itemId, files) => {
  const formData = new FormData();

  // تحديث البيانات (اختياري)
  formData.append('title', 'عنوان محدث');
  formData.append('description', 'وصف محدث');

  // رفع صور جديدة (سيتم استبدال الصور القديمة)
  files.forEach(file => {
    formData.append('media', file);
  });

  const token = localStorage.getItem('token');

  const response = await fetch(`http://localhost:4000/api/portfolio/${itemId}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  });

  const result = await response.json();
  console.log(result);
};
```

---

## 📥 عرض الصور في Frontend

عند جلب عمل سوشيال ميديا، ستحصل على الاستجابة التالية:

```json
{
  "portfolioItem": {
    "id": "uuid",
    "title": "منشور سوشيال ميديا",
    "description": "وصف المنشور",
    "type": "SOCIAL_MEDIA",
    "category": "INDIVIDUAL",
    "mediaUrls": "[\"uploads/image1.jpg\",\"uploads/image2.jpg\",\"uploads/image3.jpg\"]",
    "mediaUrl": null,
    "mediaType": null,
    "slug": "منشور-سوشيال-ميديا",
    "publishDate": "2025-12-27T..."
  }
}
```

### كيفية عرض الصور:

```javascript
const displaySocialMediaPost = (portfolioItem) => {
  // تحويل mediaUrls من JSON string إلى array
  const imageUrls = JSON.parse(portfolioItem.mediaUrls);

  // عرض الصور
  imageUrls.forEach(url => {
    const img = document.createElement('img');
    img.src = `http://localhost:4000${url}`;
    document.body.appendChild(img);
  });
};
```

### مثال React:

```jsx
function SocialMediaPost({ portfolioItem }) {
  const imageUrls = JSON.parse(portfolioItem.mediaUrls || '[]');

  return (
    <div className="social-media-post">
      <h2>{portfolioItem.title}</h2>
      <p>{portfolioItem.description}</p>

      <div className="images-grid">
        {imageUrls.map((url, index) => (
          <img
            key={index}
            src={`http://localhost:4000${url}`}
            alt={`${portfolioItem.title} - صورة ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
```

---

## 🔍 الفرق بين أنواع الأعمال

### SOCIAL_MEDIA (صور متعددة):
```javascript
{
  "mediaUrls": "[\"uploads/img1.jpg\",\"uploads/img2.jpg\"]",
  "mediaUrl": null,
  "mediaType": null
}
```

### LOGO / REEL / WEBSITE (ملف واحد):
```javascript
{
  "mediaUrls": null,
  "mediaUrl": "uploads/logo.jpg",
  "mediaType": "IMAGE" // أو "VIDEO" للريلز
}
```

---

## ⚠️ ملاحظات مهمة

1. **عدد الصور**: يمكن رفع حتى 10 صور في المرة الواحدة
2. **الحجم**: الحد الأقصى 50MB لكل ملف
3. **الصيغ المدعومة**: jpg, jpeg, png, gif, webp
4. **التحديث**: عند رفع صور جديدة، سيتم استبدال الصور القديمة بالكامل
5. **JSON Format**: يتم تخزين الصور كـ JSON string، لذا يجب استخدام `JSON.parse()` عند القراءة

---

## 🎨 مثال HTML كامل

```html
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <title>رفع منشور سوشيال ميديا</title>
</head>
<body>
  <h1>إضافة منشور سوشيال ميديا</h1>

  <form id="socialMediaForm">
    <input type="text" name="title" placeholder="عنوان المنشور" required>
    <textarea name="description" placeholder="وصف المنشور"></textarea>
    <input type="text" name="clientName" placeholder="اسم العميل">

    <label>اختر الصور (حتى 10 صور):</label>
    <input type="file" name="media" multiple accept="image/*" required>

    <button type="submit">رفع المنشور</button>
  </form>

  <script>
    const form = document.getElementById('socialMediaForm');

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const formData = new FormData();
      formData.append('title', form.title.value);
      formData.append('description', form.description.value);
      formData.append('type', 'SOCIAL_MEDIA');
      formData.append('category', 'INDIVIDUAL');
      formData.append('clientName', form.clientName.value);

      const files = form.media.files;
      for (let i = 0; i < files.length; i++) {
        formData.append('media', files[i]);
      }

      const token = localStorage.getItem('token');

      const response = await fetch('http://localhost:4000/api/portfolio', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const result = await response.json();

      if (response.ok) {
        alert('تم رفع المنشور بنجاح!');
        console.log(result);
      } else {
        alert('حدث خطأ: ' + result.error);
      }
    });
  </script>
</body>
</html>
```

---

## ✅ الخلاصة

تم إضافة دعم كامل للصور المتعددة في أعمال السوشيال ميديا:

- ✅ رفع حتى 10 صور في طلب واحد
- ✅ تخزين الصور كـ JSON array في حقل `mediaUrls`
- ✅ دعم التحديث مع الاحتفاظ بنفس المنطق
- ✅ تطبيق Migration على قاعدة البيانات
- ✅ توافق كامل مع باقي أنواع الأعمال (LOGO, REEL, WEBSITE)

**جاهز للاستخدام! 🚀**
