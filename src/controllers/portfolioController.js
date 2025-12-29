// src/controllers/portfolioController.js
import { PrismaClient } from '@prisma/client';
import { generateUniqueSlug } from '../utils/slugify.js';
import { transformPortfolioItem } from '../utils/urlHelper.js';

const prisma = new PrismaClient();

// إنشاء عمل جديد
export const createPortfolioItem = async (req, res) => {
  try {
    const { title, description, type, category, websiteUrl, clientName, companyId, publishDate } = req.body;

    if (!title || !type || !category) {
      return res.status(400).json({ error: 'الحقول المطلوبة: title, type, category' });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'يجب رفع ملف واحد على الأقل' });
    }

    // التحقق من صحة category و companyId
    if (category === 'CORPORATE' && !companyId) {
      return res.status(400).json({ error: 'يجب تحديد الشركة للأعمال الخاصة بالشركات' });
    }

    if (category === 'INDIVIDUAL' && companyId) {
      return res.status(400).json({ error: 'الأعمال الفردية لا يمكن ربطها بشركة' });
    }

    // توليد slug تلقائياً
    const slug = await generateUniqueSlug(prisma.portfolioItem, title);

    const data = {
      title,
      description: description || null,
      type,
      category,
      slug,
      websiteUrl: websiteUrl || null,
      clientName: category === 'INDIVIDUAL' ? clientName : null,
      companyId: category === 'CORPORATE' ? companyId : null,
      publishDate: publishDate ? new Date(publishDate) : new Date()
    };

    // معالجة الملفات حسب نوع العمل
    if (type === 'SOCIAL_MEDIA') {
      // صور متعددة للسوشيال ميديا
      const imageUrls = req.files.map(file => `/uploads/${file.filename}`);
      data.mediaUrls = JSON.stringify(imageUrls);
    } else {
      // ملف واحد للباقي (LOGO, REEL, WEBSITE)
      const file = req.files[0];
      data.mediaUrl = `/uploads/${file.filename}`;
      data.mediaType = file.mimetype.startsWith('video/') ? 'VIDEO' : 'IMAGE';
    }

    const portfolioItem = await prisma.portfolioItem.create({
      data,
      include: {
        company: true
      }
    });

    // تحويل المسارات النسبية إلى URLs كاملة
    const transformedItem = transformPortfolioItem(portfolioItem);

    res.status(201).json({
      message: 'تم إضافة العمل بنجاح',
      portfolioItem: transformedItem
    });
  } catch (error) {
    console.error('Error in createPortfolioItem:', error);
    res.status(500).json({ error: 'حدث خطأ في السيرفر', details: error.message });
  }
};

// الحصول على جميع الأعمال (مع فلترة)
export const getAllPortfolioItems = async (req, res) => {
  try {
    const { type, category, companyId } = req.query;

    const where = {};

    if (type) where.type = type;
    if (category) where.category = category;
    if (companyId) where.companyId = companyId;

    const portfolioItems = await prisma.portfolioItem.findMany({
      where,
      include: {
        company: {
          select: {
            id: true,
            name: true,
            logo: true
          }
        }
      },
      orderBy: {
        publishDate: 'desc'
      }
    });

    // تحويل جميع الأعمال
    const transformedItems = portfolioItems.map(item => transformPortfolioItem(item));

    res.json({
      count: transformedItems.length,
      portfolioItems: transformedItems
    });
  } catch (error) {
    console.error('Error in getAllPortfolioItems:', error);
    res.status(500).json({ error: 'حدث خطأ في السيرفر' });
  }
};

// الحصول على عمل واحد بالـ ID
export const getPortfolioItemById = async (req, res) => {
  try {
    const { id } = req.params;

    const portfolioItem = await prisma.portfolioItem.findUnique({
      where: { id },
      include: {
        company: true
      }
    });

    if (!portfolioItem) {
      return res.status(404).json({ error: 'العمل غير موجود' });
    }

    const transformedItem = transformPortfolioItem(portfolioItem);

    res.json({ portfolioItem: transformedItem });
  } catch (error) {
    console.error('Error in getPortfolioItemById:', error);
    res.status(500).json({ error: 'حدث خطأ في السيرفر' });
  }
};

// الحصول على أعمال حسب النوع (مواقع، شعارات، ريلز، سوشيال ميديا)
export const getPortfolioItemsByType = async (req, res) => {
  try {
    const { type } = req.params;
    const { category } = req.query;

    const validTypes = ['WEBSITE', 'LOGO', 'REEL', 'SOCIAL_MEDIA'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ error: 'نوع العمل غير صحيح' });
    }

    const where = { type };
    if (category) where.category = category;

    const portfolioItems = await prisma.portfolioItem.findMany({
      where,
      include: {
        company: {
          select: {
            id: true,
            name: true,
            logo: true
          }
        }
      },
      orderBy: {
        publishDate: 'desc'
      }
    });

    const transformedItems = portfolioItems.map(item => transformPortfolioItem(item));

    res.json({
      type,
      count: transformedItems.length,
      portfolioItems: transformedItems
    });
  } catch (error) {
    console.error('Error in getPortfolioItemsByType:', error);
    res.status(500).json({ error: 'حدث خطأ في السيرفر' });
  }
};

// تحديث عمل
export const updatePortfolioItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, type, category, websiteUrl, clientName, companyId, publishDate } = req.body;

    const existingItem = await prisma.portfolioItem.findUnique({
      where: { id }
    });

    if (!existingItem) {
      return res.status(404).json({ error: 'العمل غير موجود' });
    }

    const updateData = {
      ...(title && { title }),
      ...(description !== undefined && { description }),
      ...(type && { type }),
      ...(category && { category }),
      ...(websiteUrl !== undefined && { websiteUrl }),
      ...(clientName !== undefined && { clientName }),
      ...(companyId !== undefined && { companyId }),
      ...(publishDate && { publishDate: new Date(publishDate) })
    };

    // إذا تم رفع ملفات جديدة
    if (req.files && req.files.length > 0) {
      const typeToUse = type || existingItem.type;

      if (typeToUse === 'SOCIAL_MEDIA') {
        // صور متعددة للسوشيال ميديا
        const imageUrls = req.files.map(file => `/uploads/${file.filename}`);
        updateData.mediaUrls = JSON.stringify(imageUrls);
        // مسح الملف الفردي القديم إن وجد
        updateData.mediaUrl = null;
        updateData.mediaType = null;
      } else {
        // ملف واحد للباقي (LOGO, REEL, WEBSITE)
        const file = req.files[0];
        updateData.mediaUrl = `/uploads/${file.filename}`;
        updateData.mediaType = file.mimetype.startsWith('video/') ? 'VIDEO' : 'IMAGE';
        // مسح الملفات المتعددة القديمة إن وجدت
        updateData.mediaUrls = null;
      }
    }

    const portfolioItem = await prisma.portfolioItem.update({
      where: { id },
      data: updateData,
      include: {
        company: true
      }
    });

    const transformedItem = transformPortfolioItem(portfolioItem);

    res.json({
      message: 'تم تحديث العمل بنجاح',
      portfolioItem: transformedItem
    });
  } catch (error) {
    console.error('Error in updatePortfolioItem:', error);
    res.status(500).json({ error: 'حدث خطأ في السيرفر' });
  }
};

// حذف عمل
export const deletePortfolioItem = async (req, res) => {
  try {
    const { id } = req.params;

    const existingItem = await prisma.portfolioItem.findUnique({
      where: { id }
    });

    if (!existingItem) {
      return res.status(404).json({ error: 'العمل غير موجود' });
    }

    await prisma.portfolioItem.delete({
      where: { id }
    });

    res.json({ message: 'تم حذف العمل بنجاح' });
  } catch (error) {
    console.error('Error in deletePortfolioItem:', error);
    res.status(500).json({ error: 'حدث خطأ في السيرفر' });
  }
};

// إحصائيات الأعمال
export const getPortfolioStats = async (req, res) => {
  try {
    const totalItems = await prisma.portfolioItem.count();

    const byType = await prisma.portfolioItem.groupBy({
      by: ['type'],
      _count: true
    });

    const byCategory = await prisma.portfolioItem.groupBy({
      by: ['category'],
      _count: true
    });

    const stats = {
      total: totalItems,
      byType: byType.reduce((acc, item) => {
        acc[item.type] = item._count;
        return acc;
      }, {}),
      byCategory: byCategory.reduce((acc, item) => {
        acc[item.category] = item._count;
        return acc;
      }, {})
    };

    res.json({ stats });
  } catch (error) {
    console.error('Error in getPortfolioStats:', error);
    res.status(500).json({ error: 'حدث خطأ في السيرفر' });
  }
};
