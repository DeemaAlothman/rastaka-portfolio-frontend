// src/routes/portfolioRoutes.js
import express from 'express';
import {
  createPortfolioItem,
  getAllPortfolioItems,
  getPortfolioItemById,
  getPortfolioItemsByType,
  updatePortfolioItem,
  deletePortfolioItem,
  getPortfolioStats
} from '../controllers/portfolioController.js';
import { authenticateAdmin } from '../middleware/auth.js';
import { upload } from '../utils/multerConfig.js';

const router = express.Router();

// Routes العامة (للزوار)
router.get('/', getAllPortfolioItems);
router.get('/stats', getPortfolioStats);
router.get('/type/:type', getPortfolioItemsByType);
router.get('/:id', getPortfolioItemById);

// Routes الأدمن (محمية)
// استخدام upload.array للسوشيال ميديا (صور متعددة)
router.post('/', authenticateAdmin, upload.array('media', 10), createPortfolioItem);
router.put('/:id', authenticateAdmin, upload.array('media', 10), updatePortfolioItem);
router.delete('/:id', authenticateAdmin, deletePortfolioItem);

export default router;
