import { Router } from "express";
import { db } from "@workspace/db";
import { adminUsersTable, adminSessionsTable, giveawayEntriesTable, partnersTable } from "@workspace/db";
import { eq, desc, ilike, or } from "drizzle-orm";
import crypto from "crypto";
import bcrypt from "bcryptjs";

const router = Router();

function generateToken(): string {
  return crypto.randomBytes(48).toString("hex");
}

router.post("/admin/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: "Username and password required" });
    }

    const [user] = await db.select().from(adminUsersTable).where(eq(adminUsersTable.username, username)).limit(1);
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = generateToken();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await db.insert(adminSessionsTable).values({
      token,
      adminId: user.id,
      expiresAt,
    });

    return res.json({ token, expiresAt: expiresAt.toISOString() });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

router.post("/admin/verify", async (req, res) => {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");
    if (!token) {
      return res.status(401).json({ valid: false });
    }

    const [session] = await db.select().from(adminSessionsTable).where(eq(adminSessionsTable.token, token)).limit(1);
    if (!session || new Date(session.expiresAt) < new Date()) {
      return res.status(401).json({ valid: false });
    }

    return res.json({ valid: true });
  } catch {
    return res.status(500).json({ valid: false });
  }
});

router.post("/admin/logout", async (req, res) => {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");
    if (token) {
      await db.delete(adminSessionsTable).where(eq(adminSessionsTable.token, token));
    }
    return res.json({ success: true });
  } catch {
    return res.status(500).json({ error: "Server error" });
  }
});

async function requireAdmin(req: any, res: any, next: any) {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!token) return res.status(401).json({ error: "Unauthorized" });
  const [session] = await db.select().from(adminSessionsTable).where(eq(adminSessionsTable.token, token)).limit(1);
  if (!session || new Date(session.expiresAt) < new Date()) return res.status(401).json({ error: "Session expired" });
  next();
}

router.get("/admin/entries", requireAdmin, async (req, res) => {
  try {
    const { search, limit: limitStr, offset: offsetStr } = req.query as any;
    const pageLimit = Math.min(parseInt(limitStr) || 50, 200);
    const pageOffset = parseInt(offsetStr) || 0;

    const entries = await db
      .select()
      .from(giveawayEntriesTable)
      .orderBy(desc(giveawayEntriesTable.createdAt))
      .limit(pageLimit)
      .offset(pageOffset);

    const partners = await db.select({ id: partnersTable.id, name: partnersTable.name }).from(partnersTable);
    const partnerMap = Object.fromEntries(partners.map((p) => [p.id, p.name]));

    const enriched = entries.map((e) => ({
      ...e,
      partnerNames: (e.completedPartners as number[]).map((id) => partnerMap[id] || `Partner #${id}`),
    }));

    return res.json({ entries: enriched, total: entries.length });
  } catch (err) {
    console.error("Admin entries error:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

export default router;
