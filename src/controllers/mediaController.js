// src/controllers/mediaController.js
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// ✅ helper لتحويل نص (string) إلى BigInt بأمان
function toBigIntOrError(value, fieldName, res) {
  try {
    return BigInt(value);
  } catch (e) {
    res
      .status(400)
      .json({ error: `${fieldName} must be a valid numeric value` });
    return null;
  }
}

// ✅ POST /media/image  → رفع صورة إضافية لعمل (وممكن سكشن)
export async function uploadImageForWork(req, res) {
  try {
    const { workId, sectionId, altText, isPrimary, sortOrder } = req.body;

    if (!workId) {
      return res.status(400).json({ error: "workId is required" });
    }

    if (!req.file) {
      return res.status(400).json({ error: "Image file is required" });
    }

    const workIdBigInt = toBigIntOrError(workId, "workId", res);
    if (!workIdBigInt) return;

    const work = await prisma.work.findUnique({
      where: { id: workIdBigInt },
    });

    if (!work) {
      return res.status(404).json({ error: "Work not found" });
    }

    let sectionIdBigInt = null;
    if (sectionId) {
      sectionIdBigInt = toBigIntOrError(sectionId, "sectionId", res);
      if (!sectionIdBigInt) return;

      const section = await prisma.workSection.findUnique({
        where: { id: sectionIdBigInt },
      });
      if (!section) {
        return res.status(404).json({ error: "WorkSection not found" });
      }
    }

    const filePath = `/uploads/${req.file.filename}`;

    const media = await prisma.media.create({
      data: {
        workId: workIdBigInt,
        sectionId: sectionIdBigInt,
        fileType: "IMAGE",
        fileUrl: filePath,
        altText: altText || null,
        thumbnailUrl: null,
        isPrimary: isPrimary === "true" || isPrimary === true,
        sortOrder: sortOrder ? Number(sortOrder) : 0,
      },
    });

    res.status(201).json(media);
  } catch (error) {
    console.error("Error uploading image media:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

// ✅ POST /media/reel  → رفع فيديو ريلز لعمل
export async function uploadReelForWork(req, res) {
  try {
    const { workId, altText, sortOrder, isCover } = req.body;

    if (!workId) {
      return res.status(400).json({ error: "workId is required" });
    }

    if (!req.file) {
      return res.status(400).json({ error: "Video file is required" });
    }

    const workIdBigInt = toBigIntOrError(workId, "workId", res);
    if (!workIdBigInt) return;

    const work = await prisma.work.findUnique({
      where: { id: workIdBigInt },
    });

    if (!work) {
      return res.status(404).json({ error: "Work not found" });
    }

    const filePath = `/uploads/${req.file.filename}`;

    const media = await prisma.media.create({
      data: {
        workId: workIdBigInt,
        sectionId: null,
        fileType: "VIDEO", // مهم!
        fileUrl: filePath,
        altText: altText || null,
        thumbnailUrl: null, // ممكن لاحقاً نضيف صورة غلاف للريلز
        isPrimary: false,
        sortOrder: sortOrder ? Number(sortOrder) : 0,
        // لو عندك حقل isCover في السكيمة فيك تضيفيه هون
      },
    });

    res.status(201).json(media);
  } catch (error) {
    console.error("Error uploading reel media:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

// ✅ GET /works/:id/media  → كل الميديا (صور + فيديوهات) لعمل معيّن
export async function getMediaForWork(req, res) {
  const { id } = req.params;

  const workIdBigInt = toBigIntOrError(id, "id", res);
  if (!workIdBigInt) return;

  try {
    const work = await prisma.work.findUnique({
      where: { id: workIdBigInt },
      select: { id: true },
    });

    if (!work) {
      return res.status(404).json({ error: "Work not found" });
    }

    const media = await prisma.media.findMany({
      where: { workId: workIdBigInt },
      orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
    });

    res.json(media);
  } catch (error) {
    console.error("Error fetching media for work:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

// ✅ PATCH /media/:id  → تعديل بيانات media
export async function updateMedia(req, res) {
  const { id } = req.params;
  const { altText, sortOrder, isPrimary } = req.body;

  const mediaIdBigInt = toBigIntOrError(id, "id", res);
  if (!mediaIdBigInt) return;

  const data = {};

  if (altText !== undefined) data.altText = altText;
  if (sortOrder !== undefined) data.sortOrder = Number(sortOrder);
  if (isPrimary !== undefined)
    data.isPrimary = isPrimary === "true" || isPrimary === true;

  if (Object.keys(data).length === 0) {
    return res.status(400).json({ error: "No fields to update" });
  }

  try {
    const updated = await prisma.media.update({
      where: { id: mediaIdBigInt },
      data,
    });

    res.json(updated);
  } catch (error) {
    console.error("Error updating media:", error);
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Media not found" });
    }
    res.status(500).json({ error: "Internal server error" });
  }
}

// ✅ DELETE /media/:id  → حذف media (صورة أو فيديو)
export async function deleteMedia(req, res) {
  const { id } = req.params;

  const mediaIdBigInt = toBigIntOrError(id, "id", res);
  if (!mediaIdBigInt) return;

  try {
    await prisma.media.delete({
      where: { id: mediaIdBigInt },
    });

    // ملاحظة: ما حذفنا الملف من الـ FS، ممكن نضيفها لاحقاً لو حابة
    res.json({ message: "Media deleted successfully" });
  } catch (error) {
    console.error("Error deleting media:", error);
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Media not found" });
    }
    res.status(500).json({ error: "Internal server error" });
  }
}
