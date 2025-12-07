// src/controllers/workSectionController.js
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// ✅ GET /works/:workId/sections
export async function getSectionsForWork(req, res) {
  const { workId } = req.params;

  let workIdBigInt;
  try {
    workIdBigInt = BigInt(workId);
  } catch (e) {
    return res.status(400).json({ error: "workId must be a valid number" });
  }

  try {
    // تأكد أن الـ Work موجود
    const work = await prisma.work.findUnique({
      where: { id: workIdBigInt },
    });

    if (!work) {
      return res.status(404).json({ error: "Work not found" });
    }

    const sections = await prisma.workSection.findMany({
      where: { workId: workIdBigInt },
      orderBy: [
        { sortOrder: "asc" },
        { id: "asc" }, // لثبات الترتيب
      ],
    });

    res.json(sections);
  } catch (error) {
    console.error("Error fetching sections:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

// ✅ POST /works/:workId/sections
export async function createSectionForWork(req, res) {
  const { workId } = req.params;
  const { sectionType, title, body, sortOrder, highlight } = req.body;

  let workIdBigInt;
  try {
    workIdBigInt = BigInt(workId);
  } catch (e) {
    return res.status(400).json({ error: "workId must be a valid number" });
  }

  // التحقق من الحقول الأساسية
  if (!sectionType || !title || !body) {
    return res.status(400).json({
      error: "sectionType, title and body are required",
    });
  }

  const allowedSectionTypes = [
    "OVERVIEW",
    "GOALS",
    "PROCESS",
    "RESULTS",
    "BRAND_STORY",
    "TECH_STACK",
    "OTHER",
  ];

  if (!allowedSectionTypes.includes(sectionType)) {
    return res.status(400).json({
      error: "sectionType must be one of: " + allowedSectionTypes.join(", "),
    });
  }

  try {
    // تأكد أن الـ Work موجود
    const work = await prisma.work.findUnique({
      where: { id: workIdBigInt },
    });

    if (!work) {
      return res.status(404).json({ error: "Work not found" });
    }

    const section = await prisma.workSection.create({
      data: {
        workId: workIdBigInt,
        sectionType,
        title,
        body,
        sortOrder: sortOrder ? Number(sortOrder) : 0,
        highlight: highlight === "true" || highlight === true,
      },
    });

    res.status(201).json(section);
  } catch (error) {
    console.error("Error creating section:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
// ✅ GET /sections/:id → جلب Section واحد (اختياري لو حابّة تستخدمينه)
export async function getSectionById(req, res) {
  const { id } = req.params;

  let sectionIdBigInt;
  try {
    sectionIdBigInt = BigInt(id);
  } catch (e) {
    return res.status(400).json({ error: "id must be a valid number" });
  }

  try {
    const section = await prisma.workSection.findUnique({
      where: { id: sectionIdBigInt },
    });

    if (!section) {
      return res.status(404).json({ error: "Section not found" });
    }

    res.json(section);
  } catch (error) {
    console.error("Error fetching section:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

// ✅ PATCH /sections/:id → تعديل Section
export async function updateSection(req, res) {
  const { id } = req.params;
  const { sectionType, title, body, sortOrder, highlight } = req.body;

  let sectionIdBigInt;
  try {
    sectionIdBigInt = BigInt(id);
  } catch (e) {
    return res.status(400).json({ error: "id must be a valid number" });
  }

  const allowedSectionTypes = [
    "OVERVIEW",
    "GOALS",
    "PROCESS",
    "RESULTS",
    "BRAND_STORY",
    "TECH_STACK",
    "OTHER",
  ];

  const data = {};

  if (sectionType) {
    if (!allowedSectionTypes.includes(sectionType)) {
      return res.status(400).json({
        error:
          "sectionType must be one of: " + allowedSectionTypes.join(", "),
      });
    }
    data.sectionType = sectionType;
  }

  if (title !== undefined) data.title = title;
  if (body !== undefined) data.body = body;
  if (sortOrder !== undefined) data.sortOrder = Number(sortOrder);
  if (highlight !== undefined)
    data.highlight = highlight === "true" || highlight === true;

  if (Object.keys(data).length === 0) {
    return res.status(400).json({ error: "No fields to update" });
  }

  try {
    const updated = await prisma.workSection.update({
      where: { id: sectionIdBigInt },
      data,
    });

    res.json(updated);
  } catch (error) {
    console.error("Error updating section:", error);
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Section not found" });
    }
    res.status(500).json({ error: "Internal server error" });
  }
}

// ✅ DELETE /sections/:id → حذف Section (مع فك ارتباط media)
export async function deleteSection(req, res) {
  const { id } = req.params;

  let sectionIdBigInt;
  try {
    sectionIdBigInt = BigInt(id);
  } catch (e) {
    return res.status(400).json({ error: "id must be a valid number" });
  }

  try {
    // أولاً: فك ارتباط الـ media بهذا الـ section (نخلي sectionId = null)
    await prisma.media.updateMany({
      where: { sectionId: sectionIdBigInt },
      data: { sectionId: null },
    });

    // ثانياً: حذف الـ section
    await prisma.workSection.delete({
      where: { id: sectionIdBigInt },
    });

    res.json({ message: "Section deleted successfully" });
  } catch (error) {
    console.error("Error deleting section:", error);
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Section not found" });
    }
    res.status(500).json({ error: "Internal server error" });
  }
}
