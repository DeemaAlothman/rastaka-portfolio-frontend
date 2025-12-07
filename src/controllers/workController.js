// src/controllers/workController.js
import { PrismaClient } from "@prisma/client";
import { generateUniqueSlug } from "../utils/slugify.js";

const prisma = new PrismaClient();

// ✅ GET /works  → مع فلاتر: status, type, clientId, clientType
export async function getWorks(req, res) {
  try {
    const { status, type, clientId, clientType } = req.query;

    const where = {};

    // حالة العمل (افتراضي PUBLISHED)
    if (status) {
      if (!["DRAFT", "PUBLISHED", "ARCHIVED"].includes(status)) {
        return res.status(400).json({
          error: "status must be DRAFT, PUBLISHED or ARCHIVED",
        });
      }
      where.status = status;
    } else {
      where.status = "PUBLISHED";
    }

    // نوع العمل (LOGO / WEBSITE / SOCIAL_MEDIA / REEL)
    if (type) {
      if (!["LOGO", "WEBSITE", "SOCIAL_MEDIA", "REEL"].includes(type)) {
        return res.status(400).json({
          error: "type must be LOGO, WEBSITE, SOCIAL_MEDIA or REEL",
        });
      }
      where.type = type;
    }

    // فلترة حسب clientId (شركة معيّنة)
    if (clientId) {
      try {
        where.clientId = BigInt(clientId);
      } catch (e) {
        return res
          .status(400)
          .json({ error: "clientId must be a valid number" });
      }
    }

    // include مع فلترة clientType (COMPANY / INDIVIDUAL) لو موجود
    const include = {
      client: true,
      tags: {
        include: { tag: true },
      },
      media: {
        where: { isPrimary: true },
        orderBy: { sortOrder: "asc" },
      },
    };

    if (clientType) {
      if (!["COMPANY", "INDIVIDUAL"].includes(clientType)) {
        return res.status(400).json({
          error: "clientType must be COMPANY or INDIVIDUAL",
        });
      }

      include.client = {
        where: { type: clientType },
      };
    }

    const works = await prisma.work.findMany({
      where,
      include,
      orderBy: {
        publishDate: "desc",
      },
    });

    res.json(works);
  } catch (error) {
    console.error("Error fetching works:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

// ✅ GET /works/:slug  → صفحة العمل للواجهة
export async function getWorkBySlug(req, res) {
  const { slug } = req.params;

  try {
    const work = await prisma.work.findUnique({
      where: { slug },
      include: {
        client: true,
        sections: {
          orderBy: { sortOrder: "asc" },
        },
        media: {
          orderBy: { sortOrder: "asc" },
        },
        tags: {
          include: { tag: true },
        },
      },
    });

    if (!work) {
      return res.status(404).json({ error: "Work not found" });
    }

    res.json(work);
  } catch (error) {
    console.error("Error fetching work by slug:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

// ✅ GET /works/id/:id  → للـ admin (فورم التعديل)
export async function getWorkById(req, res) {
  const { id } = req.params;

  let workIdBigInt;
  try {
    workIdBigInt = BigInt(id);
  } catch (e) {
    return res.status(400).json({ error: "id must be a valid number" });
  }

  try {
    const work = await prisma.work.findUnique({
      where: { id: workIdBigInt },
      include: {
        client: true,
        media: {
          orderBy: { sortOrder: "asc" },
        },
        tags: {
          include: { tag: true },
        },
        sections: {
          orderBy: { sortOrder: "asc" },
        },
      },
    });

    if (!work) {
      return res.status(404).json({ error: "Work not found" });
    }

    res.json(work);
  } catch (error) {
    console.error("Error fetching work by id:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

// ✅ POST /works  → إنشاء عمل جديد + صورة أساسية (logo/hero)
export async function createWork(req, res) {
  try {
    const {
      clientId,
      type,
      status,
      title,
      shortDesc,
      heroSubtitle,
      publishDate,
      visitUrl,
      isFeatured,
      seoTitle,
      seoDescription,
      seoKeywords,
      tagIds,
    } = req.body;

    if (!clientId || !type || !title) {
      return res.status(400).json({
        error: "clientId, type, and title are required",
      });
    }

    if (!["LOGO", "WEBSITE", "SOCIAL_MEDIA", "REEL"].includes(type)) {
      return res.status(400).json({
        error: "type must be one of: LOGO, WEBSITE, SOCIAL_MEDIA, REEL",
      });
    }

    let clientIdBigInt;
    try {
      clientIdBigInt = BigInt(clientId);
    } catch (e) {
      return res.status(400).json({ error: "clientId must be a valid number" });
    }

    const client = await prisma.client.findUnique({
      where: { id: clientIdBigInt },
    });

    if (!client) {
      return res.status(404).json({ error: "Client not found" });
    }

    const slug = await generateUniqueSlug(prisma.work, title);

    let publishDateValue = null;
    if (publishDate) {
      const d = new Date(publishDate);
      if (isNaN(d.getTime())) {
        return res.status(400).json({
          error: "publishDate is not a valid date",
        });
      }
      publishDateValue = d;
    }

    const data = {
      clientId: clientIdBigInt,
      type,
      status: status || "PUBLISHED",
      title,
      slug,
      shortDesc: shortDesc || null,
      heroSubtitle: heroSubtitle || null,
      publishDate: publishDateValue,
      visitUrl: visitUrl || null,
      isFeatured: isFeatured === "true" || isFeatured === true,

      seoTitle: seoTitle || null,
      seoDescription: seoDescription || null,
      seoKeywords: seoKeywords || null,
    };

    const createdWork = await prisma.work.create({ data });

    // معالجة tagIds
    let parsedTagIds = [];
    if (tagIds) {
      if (Array.isArray(tagIds)) {
        parsedTagIds = tagIds;
      } else if (typeof tagIds === "string") {
        let temp = tagIds.trim();
        if (temp.startsWith("[") && temp.endsWith("]")) {
          try {
            const arr = JSON.parse(temp);
            if (Array.isArray(arr)) parsedTagIds = arr;
          } catch {}
        } else if (temp.includes(",")) {
          parsedTagIds = temp.split(",").map((x) => x.trim());
        } else {
          parsedTagIds = [temp];
        }
      }

      if (parsedTagIds.length > 0) {
        const workTagsData = parsedTagIds.map((tagId) => ({
          workId: createdWork.id,
          tagId: BigInt(tagId),
        }));

        await prisma.workTag.createMany({
          data: workTagsData,
          skipDuplicates: true,
        });
      }
    }

    // صورة أساسية لو فيه ملف
    if (req.file) {
      const filePath = `/uploads/${req.file.filename}`;

      await prisma.media.create({
        data: {
          workId: createdWork.id,
          sectionId: null,
          fileType: "IMAGE",
          fileUrl: filePath,
          altText: seoTitle || title,
          thumbnailUrl: null,
          isPrimary: true,
          sortOrder: 0,
        },
      });
    }

    const fullWork = await prisma.work.findUnique({
      where: { id: createdWork.id },
      include: {
        client: true,
        media: {
          where: { isPrimary: true },
          orderBy: { sortOrder: "asc" },
        },
        tags: {
          include: { tag: true },
        },
      },
    });

    res.status(201).json(fullWork);
  } catch (error) {
    console.error("Error creating work:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

// ✅ PATCH /works/:id  → تعديل عمل (بدون تغيير الصورة حالياً)
export async function updateWork(req, res) {
  const { id } = req.params;
  const {
    clientId,
    type,
    status,
    title,
    shortDesc,
    heroSubtitle,
    publishDate,
    visitUrl,
    isFeatured,
    seoTitle,
    seoDescription,
    seoKeywords,
  } = req.body;

  let workIdBigInt;
  try {
    workIdBigInt = BigInt(id);
  } catch (e) {
    return res.status(400).json({ error: "id must be a valid number" });
  }

  const data = {};

  // clientId
  if (clientId !== undefined) {
    try {
      const clientIdBigInt = BigInt(clientId);
      const client = await prisma.client.findUnique({
        where: { id: clientIdBigInt },
      });
      if (!client) {
        return res.status(404).json({ error: "Client not found" });
      }
      data.clientId = clientIdBigInt;
    } catch (e) {
      return res.status(400).json({ error: "clientId must be a valid number" });
    }
  }

  // type
  if (type !== undefined) {
    if (!["LOGO", "WEBSITE", "SOCIAL_MEDIA", "REEL"].includes(type)) {
      return res.status(400).json({
        error: "type must be LOGO, WEBSITE, SOCIAL_MEDIA or REEL",
      });
    }
    data.type = type;
  }

  // status
  if (status !== undefined) {
    if (!["DRAFT", "PUBLISHED", "ARCHIVED"].includes(status)) {
      return res.status(400).json({
        error: "status must be DRAFT, PUBLISHED or ARCHIVED",
      });
    }
    data.status = status;
  }

  if (title !== undefined) {
    data.title = title;
    // ممكن نعيد توليد slug حسب العنوان الجديد
    const newSlug = await generateUniqueSlug(prisma.work, title);
    data.slug = newSlug;
  }

  if (shortDesc !== undefined) data.shortDesc = shortDesc;
  if (heroSubtitle !== undefined) data.heroSubtitle = heroSubtitle;
  if (visitUrl !== undefined) data.visitUrl = visitUrl;
  if (isFeatured !== undefined)
    data.isFeatured = isFeatured === "true" || isFeatured === true;

  if (seoTitle !== undefined) data.seoTitle = seoTitle;
  if (seoDescription !== undefined) data.seoDescription = seoDescription;
  if (seoKeywords !== undefined) data.seoKeywords = seoKeywords;

  if (publishDate !== undefined) {
    if (publishDate === null || publishDate === "") {
      data.publishDate = null;
    } else {
      const d = new Date(publishDate);
      if (isNaN(d.getTime())) {
        return res.status(400).json({
          error: "publishDate is not a valid date",
        });
      }
      data.publishDate = d;
    }
  }

  if (Object.keys(data).length === 0) {
    return res.status(400).json({ error: "No fields to update" });
  }

  try {
    const updated = await prisma.work.update({
      where: { id: workIdBigInt },
      data,
    });

    res.json(updated);
  } catch (error) {
    console.error("Error updating work:", error);
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Work not found" });
    }
    res.status(500).json({ error: "Internal server error" });
  }
}

// ✅ DELETE /works/:id  → حذف عمل (مع Sections و Media)
export async function deleteWork(req, res) {
  const { id } = req.params;

  let workIdBigInt;
  try {
    workIdBigInt = BigInt(id);
  } catch (e) {
    return res.status(400).json({ error: "id must be a valid number" });
  }

  try {
    // أولاً نحذف media
    await prisma.media.deleteMany({
      where: { workId: workIdBigInt },
    });

    // ثم نحذف sections
    await prisma.workSection.deleteMany({
      where: { workId: workIdBigInt },
    });

    // ثم نحذف WorkTag
    await prisma.workTag.deleteMany({
      where: { workId: workIdBigInt },
    });

    // أخيراً نحذف الـ Work نفسه
    await prisma.work.delete({
      where: { id: workIdBigInt },
    });

    res.json({ message: "Work deleted successfully" });
  } catch (error) {
    console.error("Error deleting work:", error);
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Work not found" });
    }
    res.status(500).json({ error: "Internal server error" });
  }
}
