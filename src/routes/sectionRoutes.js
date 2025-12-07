// src/routes/sectionRoutes.js
import express from "express";
import {
  getSectionById,
  updateSection,
  deleteSection,
} from "../controllers/workSectionController.js";

const router = express.Router();

// GET /sections/:id → جلب Section واحد (اختياري للاستخدام في الـ Admin)
router.get("/:id", getSectionById);

// PATCH /sections/:id → تعديل Section
router.patch("/:id", updateSection);

// DELETE /sections/:id → حذف Section
router.delete("/:id", deleteSection);

export default router;
