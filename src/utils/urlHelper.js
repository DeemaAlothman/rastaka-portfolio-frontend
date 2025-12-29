// src/utils/urlHelper.js

/**
 * تحويل مسار نسبي إلى URL كامل
 * @param {string} relativePath - المسار النسبي مثل /uploads/image.jpg
 * @returns {string} - URL كامل مثل http://localhost:4000/uploads/image.jpg
 */
export const getFullUrl = (relativePath) => {
  if (!relativePath) return null;

  // إذا كان المسار يحتوي على http بالفعل، أرجعه كما هو
  if (relativePath.startsWith('http://') || relativePath.startsWith('https://')) {
    return relativePath;
  }

  const baseUrl = process.env.BASE_URL || 'http://localhost:4000';

  // تأكد من عدم وجود / مزدوج
  const path = relativePath.startsWith('/') ? relativePath : `/${relativePath}`;

  return `${baseUrl}${path}`;
};

/**
 * تحويل Portfolio Item لإضافة URLs كاملة
 * @param {Object} item - Portfolio item من قاعدة البيانات
 * @returns {Object} - Portfolio item مع URLs كاملة
 */
export const transformPortfolioItem = (item) => {
  if (!item) return null;

  const transformed = { ...item };

  // تحويل mediaUrl إلى URL كامل
  if (transformed.mediaUrl) {
    transformed.mediaUrl = getFullUrl(transformed.mediaUrl);
  }

  // تحويل mediaUrls (للسوشيال ميديا - JSON array)
  if (transformed.mediaUrls) {
    try {
      const urls = JSON.parse(transformed.mediaUrls);
      const fullUrls = urls.map(url => getFullUrl(url));
      transformed.mediaUrls = fullUrls; // إرجاع كـ array مباشرة، مش JSON string
    } catch (error) {
      console.error('Error parsing mediaUrls:', error);
    }
  }

  // تحويل شعار الشركة
  if (transformed.company && transformed.company.logo) {
    transformed.company.logo = getFullUrl(transformed.company.logo);
  }

  return transformed;
};

/**
 * تحويل Company لإضافة URL كامل للشعار
 * @param {Object} company - Company من قاعدة البيانات
 * @returns {Object} - Company مع logo URL كامل
 */
export const transformCompany = (company) => {
  if (!company) return null;

  const transformed = { ...company };

  if (transformed.logo) {
    transformed.logo = getFullUrl(transformed.logo);
  }

  return transformed;
};
