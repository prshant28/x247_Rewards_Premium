import { Router } from "express";
import { db } from "@workspace/db";
import { giveawayEntriesTable, partnersTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import crypto from "crypto";

const router = Router();
const MAX_SPOTS = 100;

function hashIp(ip: string): string {
  return crypto.createHash("sha256").update(ip || "unknown").digest("hex").substring(0, 16);
}

router.get("/giveaway/status", async (_req, res) => {
  try {
    const [result] = await db.select({ count: sql<number>`count(*)` }).from(giveawayEntriesTable);
    const totalEntries = Number(result?.count || 0);
    const spotsRemaining = Math.max(0, MAX_SPOTS - totalEntries);
    const isFull = totalEntries >= MAX_SPOTS;

    return res.json({
      totalEntries,
      maxSpots: MAX_SPOTS,
      spotsRemaining,
      isFull,
      announcementDate: "2026-05-15T18:00:00Z",
    });
  } catch (err) {
    console.error("Giveaway status error:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

router.post("/giveaway/enter", async (req, res) => {
  try {
    const [countResult] = await db.select({ count: sql<number>`count(*)` }).from(giveawayEntriesTable);
    if (Number(countResult?.count || 0) >= MAX_SPOTS) {
      return res.status(400).json({ error: "Contest is full. All spots have been taken." });
    }

    const { fullName, email, phone, age, city, completedPartners, screenshotConfirmed, agreedToTerms } = req.body;

    if (!fullName || !email || !phone || !age || !city) {
      return res.status(400).json({ error: "All fields are required" });
    }

    if (!completedPartners || !Array.isArray(completedPartners) || completedPartners.length === 0) {
      return res.status(400).json({ error: "You must select at least one partner registration" });
    }

    if (!screenshotConfirmed) {
      return res.status(400).json({ error: "You must confirm you have screenshot proof" });
    }

    if (!agreedToTerms) {
      return res.status(400).json({ error: "You must agree to the terms and conditions" });
    }

    if (age < 18) {
      return res.status(400).json({ error: "You must be 18 or older to participate" });
    }

    const ipHash = hashIp(req.ip || "");

    const [existingEntry] = await db.select().from(giveawayEntriesTable).where(eq(giveawayEntriesTable.email, email)).limit(1);
    if (existingEntry) {
      return res.status(400).json({ error: "This email has already been used to enter the giveaway" });
    }

    const validPartnerIds = completedPartners.filter((id: number) => typeof id === "number" && id > 0);
    const entryCount = validPartnerIds.length;

    const [entry] = await db.insert(giveawayEntriesTable).values({
      fullName,
      email,
      phone,
      age: Number(age),
      city,
      completedPartners: validPartnerIds,
      screenshotConfirmed: true,
      agreedToTerms: true,
      ipHash,
      entryCount,
    }).returning();

    return res.json({
      success: true,
      entry: {
        id: entry.id,
        fullName: entry.fullName,
        entryCount: entry.entryCount,
        createdAt: entry.createdAt,
      },
      message: `Congratulations! You've earned ${entryCount} ${entryCount === 1 ? "entry" : "entries"} into the daily prize draw!`,
    });
  } catch (err: any) {
    console.error("Giveaway entry error:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

export default router;
