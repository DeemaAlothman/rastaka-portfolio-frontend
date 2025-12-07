// src/routes/clientRoutes.js
import express from "express";
import {
  getClients,
  getClientBySlug,
  getClientById,
  createClient,
  updateClient,
  deleteClient,
} from "../controllers/clientController.js";

import upload from "../middleware/upload.js";

const router = express.Router();

// GET /clients?type=COMPANY|INDIVIDUAL
router.get("/", getClients);

// GET /clients/id/:id   → للـ admin
router.get("/id/:id", getClientById);

// GET /clients/:slug    → للواجهة (صفحة شركة/شخص)
router.get("/:slug", getClientBySlug);

// ✅ POST /clients  → نفس endpoint لكن يستقبل ملف لوجو (صورة أو فيديو)
router.post("/", upload.single("logo"), createClient);

// ✅ PATCH /clients/:id → نفس endpoint مع إمكانية تحديث اللوجو
router.patch("/:id", upload.single("logo"), updateClient);

// DELETE /clients/:id   → حذف عميل
router.delete("/:id", deleteClient);

export default router;
