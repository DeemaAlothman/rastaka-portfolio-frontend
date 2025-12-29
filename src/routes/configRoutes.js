// src/routes/configRoutes.js
import express from 'express';
import { getConfig, updateConfig } from '../controllers/configController.js';
import { authenticateAdmin } from '../middleware/auth.js';

const router = express.Router();

// Public route
router.get('/', getConfig);

// Protected routes (Admin only)
router.put('/', authenticateAdmin, updateConfig);

export default router;
