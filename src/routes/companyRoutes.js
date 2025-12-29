// src/routes/companyRoutes.js
import express from 'express';
import {
  createCompany,
  getAllCompanies,
  getCompanyById,
  getCompanyPortfolio,
  updateCompany,
  deleteCompany
} from '../controllers/companyController.js';
import { authenticateAdmin } from '../middleware/auth.js';
import { upload } from '../utils/multerConfig.js';

const router = express.Router();

// Routes العامة (للزوار)
router.get('/', getAllCompanies);
router.get('/:id', getCompanyById);
router.get('/:id/portfolio', getCompanyPortfolio);

// Routes الأدمن (محمية)
router.post('/', authenticateAdmin, upload.single('logo'), createCompany);
router.put('/:id', authenticateAdmin, upload.single('logo'), updateCompany);
router.delete('/:id', authenticateAdmin, deleteCompany);

export default router;
