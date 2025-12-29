// src/routes/seoRoutes.js
import express from 'express';
import {
  getSeoConfig,
  updateSeoConfig,
  getPageMetadata,
  generateSitemap,
  generateRobotsTxt
} from '../controllers/seoController.js';
import { authenticateAdmin } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/config', getSeoConfig);
router.get('/metadata/:type/:slug', getPageMetadata);
router.get('/sitemap.xml', generateSitemap);
router.get('/robots.txt', generateRobotsTxt);

// Admin routes
router.put('/config', authenticateAdmin, updateSeoConfig);

export default router;
