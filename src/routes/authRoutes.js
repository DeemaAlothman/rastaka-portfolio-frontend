// src/routes/authRoutes.js
import express from 'express';
import { registerAdmin, loginAdmin, getCurrentAdmin } from '../controllers/authController.js';
import { authenticateAdmin } from '../middleware/auth.js';

const router = express.Router();

// تسجيل أدمن جديد (استخدمها مرة واحدة فقط)
router.post('/register', registerAdmin);

// تسجيل الدخول
router.post('/login', loginAdmin);

// الحصول على معلومات الأدمن الحالي
router.get('/me', authenticateAdmin, getCurrentAdmin);

export default router;
