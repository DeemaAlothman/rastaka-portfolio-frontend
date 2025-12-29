# 📚 دليل Config & Contact APIs

تم إضافة نظامين جديدين للـ Backend:
1. **Config API** - إدارة إعدادات الموقع
2. **Contact API** - إدارة رسائل التواصل

---

## 🔧 Config API

### الـ Endpoints:

| Method | Endpoint | الوصف | Auth |
|--------|----------|-------|------|
| GET | `/api/config` | عرض الإعدادات | ❌ Public |
| PUT | `/api/config` | تحديث الإعدادات | ✅ Admin |

---

### 1️⃣ عرض الإعدادات (Public)

```bash
GET /api/config
```

**Response:**
```json
{
  "config": {
    "id": "uuid",
    "siteName": "Rastaka",
    "siteDescription": "شركة راستاكا للتصميم والتطوير",
    "email": "info@rastaka.com",
    "phone": "+963 123 456 789",
    "address": "دمشق، سوريا",
    "facebookUrl": "https://facebook.com/rastaka",
    "instagramUrl": "https://instagram.com/rastaka",
    "twitterUrl": "https://twitter.com/rastaka",
    "linkedinUrl": "https://linkedin.com/company/rastaka",
    "youtubeUrl": "https://youtube.com/@rastaka",
    "whatsappNumber": "+963987654321",
    "footerText": "© 2025 Rastaka. جميع الحقوق محفوظة.",
    "createdAt": "2025-12-28T10:00:00.000Z",
    "updatedAt": "2025-12-28T10:00:00.000Z"
  }
}
```

---

### 2️⃣ تحديث الإعدادات (Admin)

```bash
PUT /api/config
Authorization: Bearer <token>
Content-Type: application/json
```

**Body:**
```json
{
  "siteName": "Rastaka",
  "siteDescription": "شركة راستاكا للتصميم والتطوير",
  "email": "info@rastaka.com",
  "phone": "+963 123 456 789",
  "address": "دمشق، سوريا",
  "facebookUrl": "https://facebook.com/rastaka",
  "instagramUrl": "https://instagram.com/rastaka",
  "twitterUrl": "https://twitter.com/rastaka",
  "linkedinUrl": "https://linkedin.com/company/rastaka",
  "youtubeUrl": "https://youtube.com/@rastaka",
  "whatsappNumber": "+963987654321",
  "footerText": "© 2025 Rastaka. جميع الحقوق محفوظة."
}
```

**ملاحظة:** جميع الحقول اختيارية - سيتم تحديث ما يتم إرساله فقط.

---

## 📧 Contact API

### الـ Endpoints:

| Method | Endpoint | الوصف | Auth |
|--------|----------|-------|------|
| POST | `/api/contact` | إرسال رسالة | ❌ Public |
| GET | `/api/contact/submissions` | عرض الرسائل | ✅ Admin |
| GET | `/api/contact/submissions/stats` | إحصائيات | ✅ Admin |
| GET | `/api/contact/submissions/:id` | عرض رسالة | ✅ Admin |
| PATCH | `/api/contact/submissions/:id/status` | تحديث حالة | ✅ Admin |
| DELETE | `/api/contact/submissions/:id` | حذف رسالة | ✅ Admin |

---

### 1️⃣ إرسال رسالة تواصل (Public)

```bash
POST /api/contact
Content-Type: application/json
```

**Body:**
```json
{
  "name": "أحمد محمد",
  "email": "ahmad@example.com",
  "phone": "+963987654321",
  "subject": "استفسار عن خدماتكم",
  "message": "مرحباً، أود الاستفسار عن خدمات التصميم المتوفرة لديكم."
}
```

**الحقول المطلوبة:**
- `name` ✅ (مطلوب)
- `email` ✅ (مطلوب - يجب أن يكون بريد إلكتروني صحيح)
- `message` ✅ (مطلوب)
- `phone` ❌ (اختياري)
- `subject` ❌ (اختياري)

**Response:**
```json
{
  "message": "تم إرسال رسالتك بنجاح، سنتواصل معك قريباً",
  "submission": {
    "id": "uuid",
    "name": "أحمد محمد",
    "email": "ahmad@example.com",
    "phone": "+963987654321",
    "subject": "استفسار عن خدماتكم",
    "message": "رسالة التواصل...",
    "status": "UNREAD",
    "createdAt": "2025-12-28T10:00:00.000Z",
    "updatedAt": "2025-12-28T10:00:00.000Z"
  }
}
```

---

### 2️⃣ عرض جميع الرسائل (Admin)

```bash
GET /api/contact/submissions
Authorization: Bearer <token>
```

**Query Parameters:**
- `status` - فلترة حسب الحالة (UNREAD, READ, ARCHIVED)
- `limit` - عدد الرسائل (افتراضي: 50)
- `offset` - التخطي (افتراضي: 0)

**مثال:**
```
GET /api/contact/submissions?status=UNREAD&limit=10&offset=0
```

**Response:**
```json
{
  "count": 10,
  "total": 25,
  "submissions": [
    {
      "id": "uuid",
      "name": "أحمد محمد",
      "email": "ahmad@example.com",
      "phone": "+963987654321",
      "subject": "استفسار",
      "message": "رسالة...",
      "status": "UNREAD",
      "createdAt": "2025-12-28T10:00:00.000Z",
      "updatedAt": "2025-12-28T10:00:00.000Z"
    }
  ]
}
```

---

### 3️⃣ عرض رسالة محددة (Admin)

```bash
GET /api/contact/submissions/:id
Authorization: Bearer <token>
```

**ملاحظة:** عند قراءة الرسالة، يتم تحديث حالتها إلى `READ` تلقائياً.

---

### 4️⃣ إحصائيات الرسائل (Admin)

```bash
GET /api/contact/submissions/stats
Authorization: Bearer <token>
```

**Response:**
```json
{
  "stats": {
    "total": 50,
    "unread": 15,
    "read": 25,
    "archived": 10
  }
}
```

---

### 5️⃣ تحديث حالة رسالة (Admin)

```bash
PATCH /api/contact/submissions/:id/status
Authorization: Bearer <token>
Content-Type: application/json
```

**Body:**
```json
{
  "status": "READ"
}
```

**الحالات المتاحة:**
- `UNREAD` - غير مقروءة
- `READ` - مقروءة
- `ARCHIVED` - مؤرشفة

---

### 6️⃣ حذف رسالة (Admin)

```bash
DELETE /api/contact/submissions/:id
Authorization: Bearer <token>
```

---

## 🎨 أمثلة Frontend

### React Example - عرض الإعدادات:

```jsx
function SiteConfig() {
  const [config, setConfig] = useState(null);

  useEffect(() => {
    fetch('http://localhost:4000/api/config')
      .then(res => res.json())
      .then(data => setConfig(data.config));
  }, []);

  if (!config) return <div>Loading...</div>;

  return (
    <footer>
      <h3>{config.siteName}</h3>
      <p>{config.siteDescription}</p>
      <p>Email: {config.email}</p>
      <p>Phone: {config.phone}</p>
      <a href={config.facebookUrl}>Facebook</a>
      <a href={config.instagramUrl}>Instagram</a>
      <p>{config.footerText}</p>
    </footer>
  );
}
```

---

### React Example - نموذج تواصل:

```jsx
function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    const response = await fetch('http://localhost:4000/api/contact', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData)
    });

    const result = await response.json();

    if (response.ok) {
      alert(result.message);
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
    } else {
      alert(result.error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="الاسم"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        required
      />
      <input
        type="email"
        placeholder="البريد الإلكتروني"
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        required
      />
      <input
        type="tel"
        placeholder="رقم الهاتف (اختياري)"
        value={formData.phone}
        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
      />
      <input
        type="text"
        placeholder="الموضوع (اختياري)"
        value={formData.subject}
        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
      />
      <textarea
        placeholder="الرسالة"
        value={formData.message}
        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
        required
      />
      <button type="submit">إرسال</button>
    </form>
  );
}
```

---

### React Example - عرض الرسائل (Admin):

```jsx
function ContactSubmissions() {
  const [submissions, setSubmissions] = useState([]);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');

    // جلب الإحصائيات
    fetch('http://localhost:4000/api/contact/submissions/stats', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(res => res.json())
      .then(data => setStats(data.stats));

    // جلب الرسائل
    fetch('http://localhost:4000/api/contact/submissions', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(res => res.json())
      .then(data => setSubmissions(data.submissions));
  }, []);

  const handleDelete = async (id) => {
    const token = localStorage.getItem('token');

    await fetch(`http://localhost:4000/api/contact/submissions/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    setSubmissions(submissions.filter(s => s.id !== id));
  };

  return (
    <div>
      {stats && (
        <div className="stats">
          <p>المجموع: {stats.total}</p>
          <p>غير مقروءة: {stats.unread}</p>
          <p>مقروءة: {stats.read}</p>
          <p>مؤرشفة: {stats.archived}</p>
        </div>
      )}

      <table>
        <thead>
          <tr>
            <th>الاسم</th>
            <th>البريد</th>
            <th>الموضوع</th>
            <th>الحالة</th>
            <th>التاريخ</th>
            <th>إجراءات</th>
          </tr>
        </thead>
        <tbody>
          {submissions.map(sub => (
            <tr key={sub.id}>
              <td>{sub.name}</td>
              <td>{sub.email}</td>
              <td>{sub.subject || '-'}</td>
              <td>{sub.status}</td>
              <td>{new Date(sub.createdAt).toLocaleDateString('ar')}</td>
              <td>
                <button onClick={() => handleDelete(sub.id)}>حذف</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

---

## 📦 ملف Postman

تم إنشاء ملف Postman Collection: **`Config_Contact_API.postman_collection.json`**

### كيفية الاستخدام:
1. افتح Postman
2. Import → اختر الملف
3. شغّل "Login Admin" أولاً لحفظ التوكن
4. جرّب باقي الـ Endpoints

---

## ✅ الخلاصة

تم إضافة:
- ✅ **Config API** - إعدادات الموقع (اسم، وصف، روابط السوشيال ميديا، إلخ)
- ✅ **Contact API** - نظام رسائل التواصل بالكامل
- ✅ **Database Models** - Config و ContactSubmission
- ✅ **Migration** - تطبيق التغييرات على قاعدة البيانات
- ✅ **Postman Collection** - للاختبار السريع

**جاهز للاستخدام! 🚀**
