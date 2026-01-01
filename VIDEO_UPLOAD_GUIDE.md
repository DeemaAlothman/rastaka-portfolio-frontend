# 🎥 دليل رفع الفيديوهات الكبيرة

تم تحديث الـ Backend لدعم رفع الفيديوهات الكبيرة (حتى دقيقة أو أكثر).

---

## ✅ التحديثات في Backend

### 1. زيادة حجم الملفات المسموح:
- **من:** 50MB
- **إلى:** 200MB

### 2. زيادة Timeout:
- **Request Timeout:** 10 دقائق
- **Server Timeout:** 10 دقائق
- **Keep Alive:** 10 دقائق

### 3. دعم Body كبير:
- **JSON Limit:** 50MB
- **URL Encoded Limit:** 50MB

---

## 🎨 Frontend Implementation

### ⚠️ المشاكل الشائعة:
1. ❌ **No Progress Feedback** - المستخدم ما بيعرف شو صار
2. ❌ **Timeout في Frontend** - الـ fetch بيوقف بعد دقيقة
3. ❌ **UX سيئة** - loading indicator عادي مش كافي

---

## ✅ الحل الكامل (React + Axios)

### 1️⃣ تثبيت Axios:
```bash
npm install axios
```

### 2️⃣ Component كامل مع Progress Bar:

```jsx
import { useState } from 'react';
import axios from 'axios';

function UploadReelForm() {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'REEL',
    category: 'INDIVIDUAL',
    clientName: ''
  });
  const [videoFile, setVideoFile] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!videoFile) {
      alert('الرجاء اختيار ملف فيديو');
      return;
    }

    setUploading(true);
    setProgress(0);

    const data = new FormData();
    data.append('title', formData.title);
    data.append('description', formData.description);
    data.append('type', formData.type);
    data.append('category', formData.category);
    data.append('clientName', formData.clientName);
    data.append('media', videoFile);

    try {
      const response = await axios.post(
        'http://localhost:4000/api/portfolio',
        data,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          timeout: 600000, // 10 minutes
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setProgress(percentCompleted);
          }
        }
      );

      alert('تم رفع الفيديو بنجاح!');
      console.log(response.data);

      // Reset form
      setFormData({
        title: '',
        description: '',
        type: 'REEL',
        category: 'INDIVIDUAL',
        clientName: ''
      });
      setVideoFile(null);
      setProgress(0);
    } catch (error) {
      console.error('Error uploading:', error);
      alert('حدث خطأ أثناء الرفع: ' + (error.response?.data?.error || error.message));
    } finally {
      setUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>رفع ريلز</h2>

      <input
        type="text"
        placeholder="عنوان الريلز"
        value={formData.title}
        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        required
        disabled={uploading}
      />

      <textarea
        placeholder="وصف الريلز"
        value={formData.description}
        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        disabled={uploading}
      />

      <input
        type="text"
        placeholder="اسم العميل"
        value={formData.clientName}
        onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
        disabled={uploading}
      />

      <div className="file-input">
        <label>اختر الفيديو (حتى 200MB):</label>
        <input
          type="file"
          accept="video/mp4,video/mov,video/avi,video/webm"
          onChange={(e) => setVideoFile(e.target.files[0])}
          required
          disabled={uploading}
        />
        {videoFile && (
          <p>الملف المختار: {videoFile.name} ({(videoFile.size / 1024 / 1024).toFixed(2)} MB)</p>
        )}
      </div>

      {uploading && (
        <div className="progress-container">
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p>{progress}% - جاري الرفع...</p>
        </div>
      )}

      <button type="submit" disabled={uploading}>
        {uploading ? 'جاري الرفع...' : 'رفع الريلز'}
      </button>
    </form>
  );
}

export default UploadReelForm;
```

### 3️⃣ CSS للـ Progress Bar:

```css
.progress-container {
  margin: 20px 0;
}

.progress-bar {
  width: 100%;
  height: 30px;
  background-color: #e0e0e0;
  border-radius: 15px;
  overflow: hidden;
  box-shadow: inset 0 2px 4px rgba(0,0,0,0.1);
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #4CAF50 0%, #45a049 100%);
  transition: width 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
}

.file-input {
  margin: 15px 0;
}

.file-input p {
  margin-top: 5px;
  color: #666;
  font-size: 14px;
}
```

---

## 🎯 مميزات الحل:

✅ **Progress Bar حقيقي** - يعرض نسبة الرفع
✅ **Timeout طويل** - 10 دقائق (كافي لأي فيديو)
✅ **حجم كبير** - حتى 200MB
✅ **UX ممتاز** - المستخدم يعرف شو عم يصير
✅ **Error Handling** - رسائل خطأ واضحة

---

## 📊 مثال بدون Axios (Pure Fetch + XMLHttpRequest)

إذا ما بدك تستخدم Axios:

```jsx
const uploadWithProgress = (formData, onProgress) => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable) {
        const percentComplete = (e.loaded / e.total) * 100;
        onProgress(percentComplete);
      }
    });

    xhr.addEventListener('load', () => {
      if (xhr.status === 201) {
        resolve(JSON.parse(xhr.responseText));
      } else {
        reject(new Error(xhr.statusText));
      }
    });

    xhr.addEventListener('error', () => reject(new Error('Network Error')));

    xhr.open('POST', 'http://localhost:4000/api/portfolio');
    xhr.setRequestHeader('Authorization', `Bearer ${localStorage.getItem('token')}`);
    xhr.timeout = 600000; // 10 minutes
    xhr.send(formData);
  });
};

// الاستخدام:
const handleSubmit = async (e) => {
  e.preventDefault();

  const formData = new FormData();
  // ... إضافة البيانات

  try {
    const result = await uploadWithProgress(formData, (progress) => {
      setProgress(Math.round(progress));
    });
    console.log('Success:', result);
  } catch (error) {
    console.error('Error:', error);
  }
};
```

---

## 🚀 Next.js مع Server Actions

إذا بتستخدم Next.js 13+:

```tsx
'use client';

import { useState } from 'react';

export default function UploadForm() {
  const [progress, setProgress] = useState(0);

  async function handleSubmit(formData: FormData) {
    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable) {
        setProgress(Math.round((e.loaded / e.total) * 100));
      }
    });

    return new Promise((resolve, reject) => {
      xhr.onload = () => resolve(xhr.response);
      xhr.onerror = () => reject(xhr.statusText);
      xhr.open('POST', 'http://localhost:4000/api/portfolio');
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      xhr.timeout = 600000;
      xhr.send(formData);
    });
  }

  return (
    <form action={handleSubmit}>
      {/* Form fields */}
      {progress > 0 && <ProgressBar value={progress} />}
    </form>
  );
}
```

---

## 📱 Compression قبل الرفع (اختياري)

لتقليل حجم الفيديو في Frontend:

```bash
npm install browser-image-compression
```

```jsx
import imageCompression from 'browser-image-compression';

const compressVideo = async (videoFile) => {
  const options = {
    maxSizeMB: 50, // حجم أقصى بعد الضغط
    useWebWorker: true
  };

  try {
    const compressedFile = await imageCompression(videoFile, options);
    return compressedFile;
  } catch (error) {
    console.error('Compression error:', error);
    return videoFile; // استخدم الملف الأصلي إذا فشل الضغط
  }
};
```

---

## ⚙️ إعدادات إضافية للـ Production

### Nginx (إذا كنت تستخدمه):

```nginx
http {
    client_max_body_size 200M;
    client_body_timeout 600s;
    proxy_read_timeout 600s;
    proxy_connect_timeout 600s;
    proxy_send_timeout 600s;
}
```

### PM2 (Process Manager):

```bash
pm2 start src/server.js --name portfolio-backend --max-memory-restart 1G
```

---

## 🎯 التوصيات النهائية

### Backend:
✅ زيادة حجم الملفات إلى 200MB
✅ زيادة timeout إلى 10 دقائق
✅ جاهز للاستخدام!

### Frontend:
✅ استخدم **Axios** للـ Progress Bar
✅ أضف **Loading State** واضح
✅ عرض **حجم الملف** قبل الرفع
✅ عرض **نسبة التقدم** خلال الرفع
✅ **Disable Form** خلال الرفع
✅ رسائل **Error واضحة**

### Production:
⚠️ استخدم **Cloudinary أو AWS S3** لرفع الفيديوهات بدل الـ server مباشرة (أفضل performance)
⚠️ أضف **Video Compression** في Backend بعد الرفع
⚠️ استخدم **CDN** لتوزيع الفيديوهات

---

## ✅ الخلاصة

**Backend جاهز الآن لدعم:**
- ✅ فيديوهات حتى 200MB
- ✅ Timeout 10 دقائق
- ✅ رفع سريع وآمن

**Frontend محتاج:**
- ✅ Axios مع onUploadProgress
- ✅ Progress Bar
- ✅ UX محسّن

**جاهز للاستخدام! 🚀**
