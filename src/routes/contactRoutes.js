// src/routes/contactRoutes.js
import express from 'express';
import {
  createContactSubmission,
  getAllSubmissions,
  getSubmissionById,
  updateSubmissionStatus,
  deleteSubmission,
  getSubmissionsStats
} from '../controllers/contactController.js';
import { authenticateAdmin } from '../middleware/auth.js';

const router = express.Router();

// Public route - لإرسال رسالة تواصل
router.post('/', createContactSubmission);

// Protected routes (Admin only)
router.get('/submissions', authenticateAdmin, getAllSubmissions);
router.get('/submissions/stats', authenticateAdmin, getSubmissionsStats);
router.get('/submissions/:id', authenticateAdmin, getSubmissionById);
router.patch('/submissions/:id/status', authenticateAdmin, updateSubmissionStatus);
router.delete('/submissions/:id', authenticateAdmin, deleteSubmission);

export default router;
