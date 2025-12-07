// src/controllers/authController.js
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_key_change_me";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

function generateToken(user) {
  return jwt.sign(
    {
      userId: user.id.toString(),
      email: user.email,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

// ✅ POST /auth/register
export async function registerAdmin(req, res) {
  try {
    const { email, password, name, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "email and password are required" });
    }

    const existing = await prisma.adminUser.findUnique({
      where: { email },
    });

    if (existing) {
      return res.status(400).json({ error: "Email already exists" });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    // ✅ HERE: we map `name` → `fullName` because Prisma expects fullName
    const admin = await prisma.adminUser.create({
      data: {
        email,
        passwordHash,
        fullName: name || "Admin User",
        // if your model also has `name` field, you can add it too:
        // name: name || null,
        role: role || "ADMIN",
      },
    });

    const token = generateToken(admin);

    res.status(201).json({
      token,
      user: {
        id: admin.id,
        email: admin.email,
        name: admin.fullName, // return fullName as name to frontend
        role: admin.role,
      },
    });
  } catch (error) {
    console.error("Error registering admin:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function loginAdmin(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "email and password are required" });
    }

    const admin = await prisma.adminUser.findUnique({
      where: { email },
    });

    if (!admin) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, admin.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = generateToken(admin);

    res.json({
      token,
      user: {
        id: admin.id,
        email: admin.email,
        name: admin.fullName, // 👈 use fullName here
        role: admin.role,
      },
    });
  } catch (error) {
    console.error("Error logging in admin:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function getMe(req, res) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const adminIdBigInt = BigInt(req.user.id);

    const admin = await prisma.adminUser.findUnique({
      where: { id: adminIdBigInt },
      select: {
        id: true,
        email: true,
        fullName: true, // 👈
        role: true,
        createdAt: true,
      },
    });

    if (!admin) {
      return res.status(404).json({ error: "Admin not found" });
    }

    res.json({
      id: admin.id,
      email: admin.email,
      name: admin.fullName, // 👈 return as name
      role: admin.role,
      createdAt: admin.createdAt,
    });
  } catch (error) {
    console.error("Error in /auth/me:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
