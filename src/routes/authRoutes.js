// src/routes/authRoutes.js
import express from "express";
import {
  registerAdmin,
  loginAdmin,
  getMe,
} from "../controllers/authController.js";
import { auth } from "../middleware/auth.js";

const router = express.Router();

// ⚠️ استخدمي /auth/register أول مرة فقط لإنشاء أول أدمن
router.post("/register", registerAdmin);

// تسجيل دخول
router.post("/login", loginAdmin);

// بيانات الأدمن الحالي
router.get("/me", auth, getMe);

export default router;
