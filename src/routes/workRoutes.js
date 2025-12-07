// src/routes/workRoutes.js
import express from "express";
import {
  getWorks,
  getWorkBySlug,
  getWorkById,
  createWork,
  updateWork,
  deleteWork,
} from "../controllers/workController.js";
import upload from "../middleware/upload.js";


const router = express.Router();

// GET /works        → قائمة الأعمال مع فلاتر
router.get("/", getWorks);

// GET /works/id/:id → للـ admin
router.get("/id/:id", getWorkById);

// GET /works/:slug  → صفحة العمل للواجهة (SEO URL)
router.get("/:slug", getWorkBySlug);

// POST /works       → إنشاء عمل جديد + صورة أساسية
router.patch("/:id", upload.single("file"), updateWork);

// PATCH /works/:id  → تعديل عمل (JSON فقط حالياً)
router.patch("/:id", updateWork);

// DELETE /works/:id → حذف عمل
router.delete("/:id", deleteWork);

export default router;
