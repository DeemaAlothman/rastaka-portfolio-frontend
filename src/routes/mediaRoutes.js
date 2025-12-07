// src/routes/mediaRoutes.js
import express from "express";
import {
  uploadImageForWork,
  uploadReelForWork,
  getMediaForWork,
  updateMedia,
  deleteMedia,
} from "../controllers/mediaController.js";
import { uploadImage, uploadVideo } from "../middleware/upload.js";
import { auth, allowRoles } from "../middleware/auth.js";

const router = express.Router();

// ✅ رفع صورة إضافية لعمل
router.post(
  "/image",
  auth,
  allowRoles("ADMIN"),
  uploadImage.single("file"),
  uploadImageForWork
);

// ✅ رفع ريلز (فيديو) لعمل
router.post(
  "/reel",
  auth,
  allowRoles("ADMIN"),
  uploadVideo.single("file"),
  uploadReelForWork
);

// ✅ كل الميديا لعمل معيّن (صور + فيديو)
router.get("/work/:id", getMediaForWork);

// ✅ تعديل media (altText, sortOrder, isPrimary)
router.patch("/:id", auth, allowRoles("ADMIN"), updateMedia);

// ✅ حذف media
router.delete("/:id", auth, allowRoles("ADMIN"), deleteMedia);

export default router;
