// src/controllers/configController.js
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// الحصول على الإعدادات (أو إنشاء إعدادات افتراضية إذا لم تكن موجودة)
export const getConfig = async (req, res) => {
  try {
    let config = await prisma.config.findFirst();

    // إذا لم توجد إعدادات، أنشئ إعدادات افتراضية
    if (!config) {
      config = await prisma.config.create({
        data: {
          siteName: 'Rastaka',
          siteDescription: 'شركة راستاكا للتصميم والتطوير'
        }
      });
    }

    res.json({ config });
  } catch (error) {
    console.error('Error in getConfig:', error);
    res.status(500).json({ error: 'حدث خطأ في السيرفر' });
  }
};

// تحديث الإعدادات
export const updateConfig = async (req, res) => {
  try {
    const {
      siteName,
      siteDescription,
      email,
      phone,
      address,
      facebookUrl,
      instagramUrl,
      twitterUrl,
      linkedinUrl,
      youtubeUrl,
      whatsappNumber,
      footerText
    } = req.body;

    // الحصول على الإعدادات الحالية أو إنشائها
    let config = await prisma.config.findFirst();

    if (!config) {
      // إذا لم توجد إعدادات، أنشئها
      config = await prisma.config.create({
        data: {
          siteName: siteName || 'Rastaka',
          siteDescription,
          email,
          phone,
          address,
          facebookUrl,
          instagramUrl,
          twitterUrl,
          linkedinUrl,
          youtubeUrl,
          whatsappNumber,
          footerText
        }
      });
    } else {
      // تحديث الإعدادات الموجودة
      config = await prisma.config.update({
        where: { id: config.id },
        data: {
          ...(siteName !== undefined && { siteName }),
          ...(siteDescription !== undefined && { siteDescription }),
          ...(email !== undefined && { email }),
          ...(phone !== undefined && { phone }),
          ...(address !== undefined && { address }),
          ...(facebookUrl !== undefined && { facebookUrl }),
          ...(instagramUrl !== undefined && { instagramUrl }),
          ...(twitterUrl !== undefined && { twitterUrl }),
          ...(linkedinUrl !== undefined && { linkedinUrl }),
          ...(youtubeUrl !== undefined && { youtubeUrl }),
          ...(whatsappNumber !== undefined && { whatsappNumber }),
          ...(footerText !== undefined && { footerText })
        }
      });
    }

    res.json({
      message: 'تم تحديث الإعدادات بنجاح',
      config
    });
  } catch (error) {
    console.error('Error in updateConfig:', error);
    res.status(500).json({ error: 'حدث خطأ في السيرفر' });
  }
};
