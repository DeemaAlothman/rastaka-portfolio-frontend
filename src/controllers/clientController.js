import { PrismaClient } from "@prisma/client";
import { generateUniqueSlug } from "../utils/slugify.js";

const prisma = new PrismaClient();

// ✅ GET /clients?type=COMPANY|INDIVIDUAL (اختياري)
export async function getClients(req, res) {
  try {
    const { type } = req.query;

    const where = {};
    if (type) {
      if (!["COMPANY", "INDIVIDUAL"].includes(type)) {
        return res
          .status(400)
          .json({ error: "type must be COMPANY or INDIVIDUAL" });
      }
      where.type = type;
    }

    const clients = await prisma.client.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    res.json(clients);
  } catch (error) {
    console.error("Error fetching clients:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

// ✅ GET /clients/:slug  → للواجهة
export async function getClientBySlug(req, res) {
  const { slug } = req.params;

  try {
    const client = await prisma.client.findUnique({
      where: { slug },
    });

    if (!client) {
      return res.status(404).json({ error: "Client not found" });
    }

    res.json(client);
  } catch (error) {
    console.error("Error fetching client by slug:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

// ✅ GET /clients/id/:id  → للـ admin
export async function getClientById(req, res) {
  const { id } = req.params;

  let clientIdBigInt;
  try {
    clientIdBigInt = BigInt(id);
  } catch (e) {
    return res.status(400).json({ error: "id must be a valid number" });
  }

  try {
    const client = await prisma.client.findUnique({
      where: { id: clientIdBigInt },
    });

    if (!client) {
      return res.status(404).json({ error: "Client not found" });
    }

    res.json(client);
  } catch (error) {
    console.error("Error fetching client by id:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

// ✅ POST /clients  → إنشاء عميل جديد (مع ملف لوجو اختياري)
export async function createClient(req, res) {
  try {
    const { name, type, description, websiteUrl } = req.body;
    const file = req.file; // 👈 صورة أو فيديو

    if (!name || !type) {
      return res
        .status(400)
        .json({ error: "name and type are required (INDIVIDUAL or COMPANY)" });
    }

    if (!["INDIVIDUAL", "COMPANY"].includes(type)) {
      return res
        .status(400)
        .json({ error: "type must be either INDIVIDUAL or COMPANY" });
    }

    const slug = await generateUniqueSlug(prisma.client, name);

    const logoUrl = file ? `/uploads/${file.filename}` : null;

    const client = await prisma.client.create({
      data: {
        name,
        type,
        slug,
        description: description || null,
        websiteUrl: websiteUrl || null,
        logoUrl, // 👈 مخزن كمسار، مش كرابط كامل
      },
    });

    res.status(201).json(client);
  } catch (error) {
    console.error("Error creating client:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

// ✅ PATCH /clients/:id  → تعديل عميل (مع إمكانية تغيير اللوجو)
export async function updateClient(req, res) {
  const { id } = req.params;
  const { name, type, description, websiteUrl } = req.body;
  const file = req.file; // 👈 لوجو جديد (صورة/فيديو) لو مرفوع

  let clientIdBigInt;
  try {
    clientIdBigInt = BigInt(id);
  } catch (e) {
    return res.status(400).json({ error: "id must be a valid number" });
  }

  const data = {};

  if (name !== undefined) data.name = name;
  if (description !== undefined) data.description = description;
  if (websiteUrl !== undefined) data.websiteUrl = websiteUrl;

  if (type !== undefined) {
    if (!["INDIVIDUAL", "COMPANY"].includes(type)) {
      return res
        .status(400)
        .json({ error: "type must be either INDIVIDUAL or COMPANY" });
    }
    data.type = type;
  }

  if (name) {
    const newSlug = await generateUniqueSlug(prisma.client, name);
    data.slug = newSlug;
  }

  // لو جاي ملف جديد، نحدث logoUrl
  if (file) {
    data.logoUrl = `/uploads/${file.filename}`;
  }

  if (Object.keys(data).length === 0) {
    return res.status(400).json({ error: "No fields to update" });
  }

  try {
    const updated = await prisma.client.update({
      where: { id: clientIdBigInt },
      data,
    });

    res.json(updated);
  } catch (error) {
    console.error("Error updating client:", error);
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Client not found" });
    }
    res.status(500).json({ error: "Internal server error" });
  }
}

// ✅ DELETE /clients/:id  → حذف عميل (مع حماية لو عنده أعمال)
export async function deleteClient(req, res) {
  const { id } = req.params;

  let clientIdBigInt;
  try {
    clientIdBigInt = BigInt(id);
  } catch (e) {
    return res.status(400).json({ error: "id must be a valid number" });
  }

  try {
    const worksCount = await prisma.work.count({
      where: { clientId: clientIdBigInt },
    });

    if (worksCount > 0) {
      return res.status(400).json({
        error:
          "Cannot delete client that has works. Please delete or reassign works first.",
      });
    }

    await prisma.client.delete({
      where: { id: clientIdBigInt },
    });

    res.json({ message: "Client deleted successfully" });
  } catch (error) {
    console.error("Error deleting client:", error);
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Client not found" });
    }
    res.status(500).json({ error: "Internal server error" });
  }
}
