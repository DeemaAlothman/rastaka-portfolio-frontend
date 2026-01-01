// src/server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import authRoutes from "./routes/authRoutes.js";
import portfolioRoutes from "./routes/portfolioRoutes.js";
import companyRoutes from "./routes/companyRoutes.js";
import seoRoutes from "./routes/seoRoutes.js";
import configRoutes from "./routes/configRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";
import path from "path";

// ✅ حل مشكلة BigInt مع JSON
BigInt.prototype.toJSON = function () {
  return this.toString();
};

dotenv.config();

const app = express();
const prisma = new PrismaClient();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// زيادة timeout للـ requests (10 دقائق للفيديوهات الكبيرة)
app.use((req, res, next) => {
  req.setTimeout(600000); // 10 minutes
  res.setTimeout(600000); // 10 minutes
  next();
});

// --------- Routes ---------

// Root endpoint
app.get("/", (req, res) => {
  res.json({
    message: "Rastaka Portfolio API 🚀",
    version: "1.0.0",
    endpoints: {
      auth: "/api/auth",
      portfolio: "/api/portfolio",
      companies: "/api/companies"
    }
  });
});

// SEO Routes (يجب أن تكون قبل /api لأنها direct routes)
app.use(seoRoutes);

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/portfolio", portfolioRoutes);
app.use("/api/companies", companyRoutes);
app.use("/api/seo", seoRoutes);
app.use("/api/config", configRoutes);
app.use("/api/contact", contactRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'حدث خطأ في السيرفر' });
});

const PORT = process.env.PORT || 4000;
const server = app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});

// زيادة timeout للسيرفر نفسه (10 دقائق)
server.timeout = 600000; // 10 minutes
server.keepAliveTimeout = 610000; // أكثر شوي من timeout
server.headersTimeout = 620000; // أكثر شوي من keepAliveTimeout
