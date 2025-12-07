// src/routes/workSectionRoutes.js
import express from "express";
import {
  getSectionsForWork,
  createSectionForWork,
} from "../controllers/workSectionController.js";

const router = express.Router({ mergeParams: true });

// GET /works/:workId/sections  → كل الأقسام لمشروع معيّن
router.get("/", getSectionsForWork);

// POST /works/:workId/sections → إضافة قسم جديد لمشروع معيّن
router.post("/", createSectionForWork);

export default router;
