# Frontend Integration Guide

دليل التكامل مع الـ Frontend لنظام معرض أعمال Rastaka

---

## 1. البنية الأساسية للموقع

### الصفحات المطلوبة:

#### للزوار (Public Pages):
1. **الصفحة الرئيسية** - عرض جميع الأعمال
2. **صفحة المواقع** - `/websites` - عرض جميع المواقع
3. **صفحة الشعارات** - `/logos` - عرض جميع الشعارات
4. **صفحة الريلز** - `/reels` - عرض جميع الريلز
5. **صفحة السوشيال ميديا** - `/social-media` - عرض جميع تصاميم السوشيال ميديا
6. **صفحة الأعمال الفردية** - `/individual` - عرض الأعمال الفردية فقط
7. **صفحة الشركات** - `/companies` - عرض قائمة الشركات
8. **صفحة تفاصيل الشركة** - `/companies/:id` - عرض أعمال شركة معينة
9. **صفحة تفاصيل العمل** - `/portfolio/:id` - عرض تفاصيل عمل واحد

#### للأدمن (Admin Dashboard):
1. **صفحة تسجيل الدخول** - `/admin/login`
2. **لوحة التحكم الرئيسية** - `/admin/dashboard`
3. **إدارة الأعمال** - `/admin/portfolio`
4. **إضافة عمل جديد** - `/admin/portfolio/new`
5. **تعديل عمل** - `/admin/portfolio/edit/:id`
6. **إدارة الشركات** - `/admin/companies`
7. **إضافة شركة** - `/admin/companies/new`
8. **تعديل شركة** - `/admin/companies/edit/:id`

---

## 2. أمثلة Fetch Requests

### Authentication

#### تسجيل الدخول:
```javascript
const login = async (email, password) => {
  const response = await fetch('http://localhost:4000/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email, password })
  });

  const data = await response.json();

  if (response.ok) {
    // حفظ الـ token في localStorage
    localStorage.setItem('token', data.token);
    localStorage.setItem('admin', JSON.stringify(data.admin));
    return data;
  } else {
    throw new Error(data.error);
  }
};
```

#### التحقق من تسجيل الدخول:
```javascript
const checkAuth = async () => {
  const token = localStorage.getItem('token');

  if (!token) {
    return false;
  }

  const response = await fetch('http://localhost:4000/api/auth/me', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  return response.ok;
};
```

---

### Portfolio Endpoints

#### جلب جميع الأعمال:
```javascript
const getAllPortfolio = async () => {
  const response = await fetch('http://localhost:4000/api/portfolio');
  const data = await response.json();
  return data.portfolioItems;
};
```

#### جلب الأعمال حسب النوع (مثلاً: الشعارات):
```javascript
const getLogos = async () => {
  const response = await fetch('http://localhost:4000/api/portfolio/type/LOGO');
  const data = await response.json();
  return data.portfolioItems;
};
```

#### جلب الأعمال الفردية فقط:
```javascript
const getIndividualWork = async () => {
  const response = await fetch('http://localhost:4000/api/portfolio?category=INDIVIDUAL');
  const data = await response.json();
  return data.portfolioItems;
};
```

#### جلب تفاصيل عمل واحد:
```javascript
const getPortfolioItem = async (id) => {
  const response = await fetch(`http://localhost:4000/api/portfolio/${id}`);
  const data = await response.json();
  return data.portfolioItem;
};
```

#### إضافة عمل جديد (Admin):
```javascript
const createPortfolioItem = async (formData) => {
  const token = localStorage.getItem('token');

  const response = await fetch('http://localhost:4000/api/portfolio', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData // FormData object
  });

  const data = await response.json();
  return data;
};

// مثال استخدام:
const handleSubmit = async (e) => {
  e.preventDefault();

  const formData = new FormData();
  formData.append('title', 'شعار شركة ABC');
  formData.append('description', 'شعار احترافي');
  formData.append('type', 'LOGO');
  formData.append('category', 'CORPORATE');
  formData.append('companyId', 'uuid-here');
  formData.append('media', fileInput.files[0]);

  await createPortfolioItem(formData);
};
```

#### تحديث عمل (Admin):
```javascript
const updatePortfolioItem = async (id, formData) => {
  const token = localStorage.getItem('token');

  const response = await fetch(`http://localhost:4000/api/portfolio/${id}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  });

  return await response.json();
};
```

#### حذف عمل (Admin):
```javascript
const deletePortfolioItem = async (id) => {
  const token = localStorage.getItem('token');

  const response = await fetch(`http://localhost:4000/api/portfolio/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  return await response.json();
};
```

---

### Company Endpoints

#### جلب جميع الشركات:
```javascript
const getAllCompanies = async () => {
  const response = await fetch('http://localhost:4000/api/companies');
  const data = await response.json();
  return data.companies;
};
```

#### جلب تفاصيل شركة:
```javascript
const getCompany = async (id) => {
  const response = await fetch(`http://localhost:4000/api/companies/${id}`);
  const data = await response.json();
  return data.company;
};
```

#### جلب أعمال شركة معينة:
```javascript
const getCompanyPortfolio = async (id, type = null) => {
  const url = type
    ? `http://localhost:4000/api/companies/${id}/portfolio?type=${type}`
    : `http://localhost:4000/api/companies/${id}/portfolio`;

  const response = await fetch(url);
  const data = await response.json();
  return data.portfolioItems;
};
```

#### إضافة شركة (Admin):
```javascript
const createCompany = async (formData) => {
  const token = localStorage.getItem('token');

  const response = await fetch('http://localhost:4000/api/companies', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  });

  return await response.json();
};

// مثال:
const handleSubmit = async (e) => {
  e.preventDefault();

  const formData = new FormData();
  formData.append('name', 'ABC Company');
  formData.append('description', 'شركة تقنية رائدة');
  formData.append('logo', logoFile);

  await createCompany(formData);
};
```

---

## 3. مكونات React/Vue المقترحة

### مكون عرض بطاقة العمل:
```jsx
// PortfolioCard.jsx
function PortfolioCard({ item }) {
  const isVideo = item.mediaType === 'VIDEO';

  return (
    <div className="portfolio-card">
      {isVideo ? (
        <video src={`http://localhost:4000${item.mediaUrl}`} controls />
      ) : (
        <img src={`http://localhost:4000${item.mediaUrl}`} alt={item.title} />
      )}

      <h3>{item.title}</h3>
      <p>{item.description}</p>

      {item.type === 'WEBSITE' && (
        <a href={item.websiteUrl} target="_blank">
          زيارة الموقع
        </a>
      )}

      {item.company && (
        <div className="company-info">
          <img src={`http://localhost:4000${item.company.logo}`} alt={item.company.name} />
          <span>{item.company.name}</span>
        </div>
      )}

      {item.clientName && (
        <div className="client-info">
          <span>العميل: {item.clientName}</span>
        </div>
      )}
    </div>
  );
}
```

### صفحة الشعارات:
```jsx
// LogosPage.jsx
function LogosPage() {
  const [logos, setLogos] = useState([]);
  const [filter, setFilter] = useState('ALL'); // ALL, INDIVIDUAL, CORPORATE

  useEffect(() => {
    fetchLogos();
  }, [filter]);

  const fetchLogos = async () => {
    let url = 'http://localhost:4000/api/portfolio/type/LOGO';

    if (filter !== 'ALL') {
      url += `?category=${filter}`;
    }

    const response = await fetch(url);
    const data = await response.json();
    setLogos(data.portfolioItems);
  };

  return (
    <div>
      <h1>الشعارات</h1>

      <div className="filters">
        <button onClick={() => setFilter('ALL')}>الكل</button>
        <button onClick={() => setFilter('INDIVIDUAL')}>أعمال فردية</button>
        <button onClick={() => setFilter('CORPORATE')}>شركات</button>
      </div>

      <div className="portfolio-grid">
        {logos.map(logo => (
          <PortfolioCard key={logo.id} item={logo} />
        ))}
      </div>
    </div>
  );
}
```

### صفحة الشركات:
```jsx
// CompaniesPage.jsx
function CompaniesPage() {
  const [companies, setCompanies] = useState([]);

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    const response = await fetch('http://localhost:4000/api/companies');
    const data = await response.json();
    setCompanies(data.companies);
  };

  return (
    <div>
      <h1>أعمال الشركات</h1>

      <div className="companies-grid">
        {companies.map(company => (
          <div key={company.id} className="company-card">
            <img src={`http://localhost:4000${company.logo}`} alt={company.name} />
            <h3>{company.name}</h3>
            <p>{company.description}</p>
            <p>عدد الأعمال: {company._count.portfolioItems}</p>
            <Link to={`/companies/${company.id}`}>
              عرض الأعمال
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
```

### صفحة تفاصيل الشركة:
```jsx
// CompanyDetailsPage.jsx
function CompanyDetailsPage() {
  const { id } = useParams();
  const [company, setCompany] = useState(null);
  const [portfolioItems, setPortfolioItems] = useState([]);
  const [typeFilter, setTypeFilter] = useState(null);

  useEffect(() => {
    fetchCompanyData();
  }, [id, typeFilter]);

  const fetchCompanyData = async () => {
    // جلب معلومات الشركة
    const companyRes = await fetch(`http://localhost:4000/api/companies/${id}`);
    const companyData = await companyRes.json();
    setCompany(companyData.company);

    // جلب أعمال الشركة
    let url = `http://localhost:4000/api/companies/${id}/portfolio`;
    if (typeFilter) {
      url += `?type=${typeFilter}`;
    }

    const portfolioRes = await fetch(url);
    const portfolioData = await portfolioRes.json();
    setPortfolioItems(portfolioData.portfolioItems);
  };

  if (!company) return <div>Loading...</div>;

  return (
    <div>
      <div className="company-header">
        <img src={`http://localhost:4000${company.logo}`} alt={company.name} />
        <h1>{company.name}</h1>
        <p>{company.description}</p>
      </div>

      <div className="type-filters">
        <button onClick={() => setTypeFilter(null)}>الكل</button>
        <button onClick={() => setTypeFilter('WEBSITE')}>مواقع</button>
        <button onClick={() => setTypeFilter('LOGO')}>شعارات</button>
        <button onClick={() => setTypeFilter('REEL')}>ريلز</button>
        <button onClick={() => setTypeFilter('SOCIAL_MEDIA')}>سوشيال ميديا</button>
      </div>

      <div className="portfolio-grid">
        {portfolioItems.map(item => (
          <PortfolioCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}
```

### نموذج إضافة عمل (Admin):
```jsx
// AddPortfolioForm.jsx
function AddPortfolioForm() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'WEBSITE',
    category: 'INDIVIDUAL',
    websiteUrl: '',
    clientName: '',
    companyId: ''
  });
  const [mediaFile, setMediaFile] = useState(null);
  const [companies, setCompanies] = useState([]);

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    const response = await fetch('http://localhost:4000/api/companies');
    const data = await response.json();
    setCompanies(data.companies);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formDataToSend = new FormData();
    formDataToSend.append('title', formData.title);
    formDataToSend.append('description', formData.description);
    formDataToSend.append('type', formData.type);
    formDataToSend.append('category', formData.category);

    if (formData.websiteUrl) {
      formDataToSend.append('websiteUrl', formData.websiteUrl);
    }

    if (formData.category === 'INDIVIDUAL' && formData.clientName) {
      formDataToSend.append('clientName', formData.clientName);
    }

    if (formData.category === 'CORPORATE' && formData.companyId) {
      formDataToSend.append('companyId', formData.companyId);
    }

    if (mediaFile) {
      formDataToSend.append('media', mediaFile);
    }

    const token = localStorage.getItem('token');

    const response = await fetch('http://localhost:4000/api/portfolio', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formDataToSend
    });

    if (response.ok) {
      alert('تم إضافة العمل بنجاح');
      // إعادة توجيه أو مسح النموذج
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="العنوان"
        value={formData.title}
        onChange={(e) => setFormData({...formData, title: e.target.value})}
        required
      />

      <textarea
        placeholder="الوصف"
        value={formData.description}
        onChange={(e) => setFormData({...formData, description: e.target.value})}
        required
      />

      <select
        value={formData.type}
        onChange={(e) => setFormData({...formData, type: e.target.value})}
      >
        <option value="WEBSITE">موقع</option>
        <option value="LOGO">شعار</option>
        <option value="REEL">ريلز</option>
        <option value="SOCIAL_MEDIA">سوشيال ميديا</option>
      </select>

      <select
        value={formData.category}
        onChange={(e) => setFormData({...formData, category: e.target.value})}
      >
        <option value="INDIVIDUAL">عمل فردي</option>
        <option value="CORPORATE">شركة</option>
      </select>

      {formData.type === 'WEBSITE' && (
        <input
          type="url"
          placeholder="رابط الموقع"
          value={formData.websiteUrl}
          onChange={(e) => setFormData({...formData, websiteUrl: e.target.value})}
        />
      )}

      {formData.category === 'INDIVIDUAL' && (
        <input
          type="text"
          placeholder="اسم العميل"
          value={formData.clientName}
          onChange={(e) => setFormData({...formData, clientName: e.target.value})}
        />
      )}

      {formData.category === 'CORPORATE' && (
        <select
          value={formData.companyId}
          onChange={(e) => setFormData({...formData, companyId: e.target.value})}
        >
          <option value="">اختر الشركة</option>
          {companies.map(company => (
            <option key={company.id} value={company.id}>
              {company.name}
            </option>
          ))}
        </select>
      )}

      <input
        type="file"
        accept="image/*,video/*"
        onChange={(e) => setMediaFile(e.target.files[0])}
        required
      />

      <button type="submit">إضافة</button>
    </form>
  );
}
```

---

## 4. ملاحظات مهمة

### CORS:
السيرفر مفعّل عليه CORS، لذلك يمكنك الاتصال من أي domain.

### الصور والفيديوهات:
- جميع الملفات المرفوعة موجودة في `/uploads/`
- للوصول إليها: `http://localhost:4000/uploads/filename.ext`
- الـ API يرجع المسار كامل مثل: `/uploads/image.jpg`
- استخدمه كالتالي: `http://localhost:4000${item.mediaUrl}`

### التوكن (Token):
- بعد تسجيل الدخول، احفظ الـ token في `localStorage`
- أضف الـ token في header الـ Authorization لكل طلب محمي
- الصيغة: `Authorization: Bearer <token>`

### أنواع الأعمال (Work Types):
- `WEBSITE` - مواقع
- `LOGO` - شعارات
- `REEL` - ريلز
- `SOCIAL_MEDIA` - سوشيال ميديا

### فئات الأعمال (Categories):
- `INDIVIDUAL` - أعمال فردية
- `CORPORATE` - أعمال شركات

---

## 5. مثال Route Structure (React Router)

```jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/websites" element={<WebsitesPage />} />
        <Route path="/logos" element={<LogosPage />} />
        <Route path="/reels" element={<ReelsPage />} />
        <Route path="/social-media" element={<SocialMediaPage />} />
        <Route path="/individual" element={<IndividualWorkPage />} />
        <Route path="/companies" element={<CompaniesPage />} />
        <Route path="/companies/:id" element={<CompanyDetailsPage />} />
        <Route path="/portfolio/:id" element={<PortfolioItemPage />} />

        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<ProtectedRoute />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="portfolio" element={<AdminPortfolioList />} />
          <Route path="portfolio/new" element={<AddPortfolioForm />} />
          <Route path="portfolio/edit/:id" element={<EditPortfolioForm />} />
          <Route path="companies" element={<AdminCompaniesList />} />
          <Route path="companies/new" element={<AddCompanyForm />} />
          <Route path="companies/edit/:id" element={<EditCompanyForm />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
```

---

تم! الآن لديك كل ما تحتاجه للتكامل مع الـ Frontend 🚀
