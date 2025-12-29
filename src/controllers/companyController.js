// src/controllers/companyController.js
import { PrismaClient } from '@prisma/client';
import { generateUniqueSlug } from '../utils/slugify.js';
import { transformCompany, transformPortfolioItem } from '../utils/urlHelper.js';

const prisma = new PrismaClient();

// إنشاء شركة جديدة
export const createCompany = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'اسم الشركة مطلوب' });
    }

    // توليد slug تلقائياً
    const slug = await generateUniqueSlug(prisma.company, name);

    const data = {
      name,
      description: description || null,
      slug,
      logo: req.file ? `/uploads/${req.file.filename}` : null
    };

    const company = await prisma.company.create({
      data
    });

    const transformedCompany = transformCompany(company);

    res.status(201).json({
      message: 'تم إضافة الشركة بنجاح',
      company: transformedCompany
    });
  } catch (error) {
    console.error('Error in createCompany:', error);
    res.status(500).json({ error: 'حدث خطأ في السيرفر' });
  }
};

// الحصول على جميع الشركات
export const getAllCompanies = async (req, res) => {
  try {
    const companies = await prisma.company.findMany({
      include: {
        _count: {
          select: { portfolioItems: true }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    const transformedCompanies = companies.map(company => transformCompany(company));

    res.json({
      count: transformedCompanies.length,
      companies: transformedCompanies
    });
  } catch (error) {
    console.error('Error in getAllCompanies:', error);
    res.status(500).json({ error: 'حدث خطأ في السيرفر' });
  }
};

// الحصول على شركة واحدة بالـ ID
export const getCompanyById = async (req, res) => {
  try {
    const { id } = req.params;

    const company = await prisma.company.findUnique({
      where: { id },
      include: {
        portfolioItems: {
          orderBy: {
            publishDate: 'desc'
          }
        }
      }
    });

    if (!company) {
      return res.status(404).json({ error: 'الشركة غير موجودة' });
    }

    const transformedCompany = transformCompany(company);

    res.json({ company: transformedCompany });
  } catch (error) {
    console.error('Error in getCompanyById:', error);
    res.status(500).json({ error: 'حدث خطأ في السيرفر' });
  }
};

// الحصول على أعمال شركة معينة
export const getCompanyPortfolio = async (req, res) => {
  try {
    const { id } = req.params;
    const { type } = req.query;

    const company = await prisma.company.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        description: true,
        logo: true
      }
    });

    if (!company) {
      return res.status(404).json({ error: 'الشركة غير موجودة' });
    }

    const where = { companyId: id };
    if (type) where.type = type;

    const portfolioItems = await prisma.portfolioItem.findMany({
      where,
      orderBy: {
        publishDate: 'desc'
      }
    });

    const transformedCompany = transformCompany(company);
    const transformedItems = portfolioItems.map(item => transformPortfolioItem(item));

    res.json({
      company: transformedCompany,
      count: transformedItems.length,
      portfolioItems: transformedItems
    });
  } catch (error) {
    console.error('Error in getCompanyPortfolio:', error);
    res.status(500).json({ error: 'حدث خطأ في السيرفر' });
  }
};

// تحديث شركة
export const updateCompany = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    const existingCompany = await prisma.company.findUnique({
      where: { id }
    });

    if (!existingCompany) {
      return res.status(404).json({ error: 'الشركة غير موجودة' });
    }

    const updateData = {
      ...(name && { name }),
      ...(description !== undefined && { description })
    };

    if (req.file) {
      updateData.logo = `/uploads/${req.file.filename}`;
    }

    const company = await prisma.company.update({
      where: { id },
      data: updateData
    });

    const transformedCompany = transformCompany(company);

    res.json({
      message: 'تم تحديث الشركة بنجاح',
      company: transformedCompany
    });
  } catch (error) {
    console.error('Error in updateCompany:', error);
    res.status(500).json({ error: 'حدث خطأ في السيرفر' });
  }
};

// حذف شركة
export const deleteCompany = async (req, res) => {
  try {
    const { id } = req.params;

    const existingCompany = await prisma.company.findUnique({
      where: { id },
      include: {
        _count: {
          select: { portfolioItems: true }
        }
      }
    });

    if (!existingCompany) {
      return res.status(404).json({ error: 'الشركة غير موجودة' });
    }

    if (existingCompany._count.portfolioItems > 0) {
      return res.status(400).json({
        error: `لا يمكن حذف الشركة لأنها تحتوي على ${existingCompany._count.portfolioItems} عمل/أعمال`
      });
    }

    await prisma.company.delete({
      where: { id }
    });

    res.json({ message: 'تم حذف الشركة بنجاح' });
  } catch (error) {
    console.error('Error in deleteCompany:', error);
    res.status(500).json({ error: 'حدث خطأ في السيرفر' });
  }
};
