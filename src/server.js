// src/server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";

import clientRoutes from "./routes/clientRoutes.js";
import workRoutes from "./routes/workRoutes.js";
import workSectionRoutes from "./routes/workSectionRoutes.js";
import sectionRoutes from "./routes/sectionRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import mediaRoutes from "./routes/mediaRoutes.js";

// ✅ حل مشكلة BigInt مع JSON
BigInt.prototype.toJSON = function () {
  return this.toString();
};

dotenv.config();

const app = express();
const prisma = new PrismaClient();
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

// --------- Routes ---------

// اختبار بسيط للتأكد أن السيرفر شغال
app.get("/", (req, res) => {
  res.json({ message: "Portfolio API is running 🚀" });
});
app.use("/auth", authRoutes);

// Routes for clients
app.use("/clients", clientRoutes);
app.use("/media", mediaRoutes);
// Routes for works
app.use("/works", workRoutes);
app.use("/works/:workId/sections", workSectionRoutes);
app.use("/sections", sectionRoutes);
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
