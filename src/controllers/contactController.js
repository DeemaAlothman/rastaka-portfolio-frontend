// src/controllers/contactController.js
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// إرسال رسالة تواصل جديدة (Public - لا يحتاج auth)
export const createContactSubmission = async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    // التحقق من الحقول المطلوبة
    if (!name || !email || !message) {
      return res.status(400).json({
        error: 'الحقول المطلوبة: name, email, message'
      });
    }

    // التحقق من صحة البريد الإلكتروني
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'البريد الإلكتروني غير صحيح' });
    }

    const submission = await prisma.contactSubmission.create({
      data: {
        name,
        email,
        phone: phone || null,
        subject: subject || null,
        message
      }
    });

    res.status(201).json({
      message: 'تم إرسال رسالتك بنجاح، سنتواصل معك قريباً',
      submission
    });
  } catch (error) {
    console.error('Error in createContactSubmission:', error);
    res.status(500).json({ error: 'حدث خطأ في السيرفر' });
  }
};

// الحصول على جميع الرسائل (Admin only)
export const getAllSubmissions = async (req, res) => {
  try {
    const { status, limit = 50, offset = 0 } = req.query;

    const where = {};
    if (status) where.status = status;

    const submissions = await prisma.contactSubmission.findMany({
      where,
      orderBy: {
        createdAt: 'desc'
      },
      take: parseInt(limit),
      skip: parseInt(offset)
    });

    const total = await prisma.contactSubmission.count({ where });

    res.json({
      count: submissions.length,
      total,
      submissions
    });
  } catch (error) {
    console.error('Error in getAllSubmissions:', error);
    res.status(500).json({ error: 'حدث خطأ في السيرفر' });
  }
};

// الحصول على رسالة واحدة (Admin only)
export const getSubmissionById = async (req, res) => {
  try {
    const { id } = req.params;

    const submission = await prisma.contactSubmission.findUnique({
      where: { id }
    });

    if (!submission) {
      return res.status(404).json({ error: 'الرسالة غير موجودة' });
    }

    // تحديث الحالة إلى READ عند القراءة
    if (submission.status === 'UNREAD') {
      await prisma.contactSubmission.update({
        where: { id },
        data: { status: 'READ' }
      });
    }

    res.json({ submission });
  } catch (error) {
    console.error('Error in getSubmissionById:', error);
    res.status(500).json({ error: 'حدث خطأ في السيرفر' });
  }
};

// تحديث حالة رسالة (Admin only)
export const updateSubmissionStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !['UNREAD', 'READ', 'ARCHIVED'].includes(status)) {
      return res.status(400).json({
        error: 'حالة غير صحيحة. الحالات المتاحة: UNREAD, READ, ARCHIVED'
      });
    }

    const submission = await prisma.contactSubmission.update({
      where: { id },
      data: { status }
    });

    res.json({
      message: 'تم تحديث حالة الرسالة بنجاح',
      submission
    });
  } catch (error) {
    console.error('Error in updateSubmissionStatus:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'الرسالة غير موجودة' });
    }
    res.status(500).json({ error: 'حدث خطأ في السيرفر' });
  }
};

// حذف رسالة (Admin only)
export const deleteSubmission = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.contactSubmission.delete({
      where: { id }
    });

    res.json({ message: 'تم حذف الرسالة بنجاح' });
  } catch (error) {
    console.error('Error in deleteSubmission:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'الرسالة غير موجودة' });
    }
    res.status(500).json({ error: 'حدث خطأ في السيرفر' });
  }
};

// الحصول على إحصائيات الرسائل (Admin only)
export const getSubmissionsStats = async (req, res) => {
  try {
    const total = await prisma.contactSubmission.count();
    const unread = await prisma.contactSubmission.count({
      where: { status: 'UNREAD' }
    });
    const read = await prisma.contactSubmission.count({
      where: { status: 'READ' }
    });
    const archived = await prisma.contactSubmission.count({
      where: { status: 'ARCHIVED' }
    });

    res.json({
      stats: {
        total,
        unread,
        read,
        archived
      }
    });
  } catch (error) {
    console.error('Error in getSubmissionsStats:', error);
    res.status(500).json({ error: 'حدث خطأ في السيرفر' });
  }
};
