// src/utils/slugify.js

// تحويل النص لـ slug بسيط (يدعم كلمات عربية، المتصفحات بتتعامل معها)
export function slugify(text) {
  if (!text) return "";

  // إزالة فراغات البداية والنهاية
  let slug = text.trim().toLowerCase();

  // استبدال المسافات والـ tabs بشرطات -
  slug = slug.replace(/\s+/g, "-");

  // إزالة كل شيء غريب (نخلي الأحرف، الأرقام، الشرطة والشرطة السفلية)
  // (نترك الأحرف العربية كما هي، لأنها ما بتنطابق مع [a-z0-9])
  slug = slug.replace(/[^-\w\u0600-\u06FF]+/g, "");

  // إزالة الشرطات المكررة
  slug = slug.replace(/-+/g, "-");

  // إزالة الشرطة من البداية والنهاية
  slug = slug.replace(/^-+|-+$/g, "");

  return slug;
}

// توليد slug فريد (Unique) لأي موديل (Client, Work, ...)
export async function generateUniqueSlug(model, baseText) {
  let baseSlug = slugify(baseText);
  if (!baseSlug) {
    baseSlug = "item";
  }

  let slug = baseSlug;
  let counter = 1;

  // نفترض أن الموديل فيه حقل slug
  // ونكرر لحد ما نلاقي slug غير مستخدم
  // مثال على model: prisma.client أو prisma.work
  // نوقف بعد رقم معقول حتى ما ندخل في loop
  // (بس عمليًا ما رح توصلي لهون غالبًا)
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const existing = await model.findUnique({
      where: { slug },
    });

    if (!existing) {
      return slug;
    }

    counter += 1;
    slug = `${baseSlug}-${counter}`;
  }
}
