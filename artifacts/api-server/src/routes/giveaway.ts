import { Router } from "express";
import { db } from "@workspace/db";
import { giveawayEntriesTable, partnersTable, contestsTable, userSessionsTable } from "@workspace/db";
import { eq, sql, and } from "drizzle-orm";
import crypto from "crypto";

const router = Router();
const MAX_SPOTS = 100;

function hashIp(ip: string): string {
  return crypto.createHash("sha256").update(ip || "unknown").digest("hex").substring(0, 16);
}

function generateEntryCode(): string {
  const prefix = "X247";
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `${prefix}-${code.substring(0, 4)}-${code.substring(4)}`;
}

router.get("/activity/feed", async (_req, res) => {
  try {
    const recentEntries = await db
      .select({
        type: sql<string>`'entry'`,
        name: giveawayEntriesTable.fullName,
        city: giveawayEntriesTable.city,
        contestId: giveawayEntriesTable.contestId,
        createdAt: giveawayEntriesTable.createdAt,
      })
      .from(giveawayEntriesTable)
      .orderBy(sql`created_at DESC`)
      .limit(10);

    const winnersResult = await db.execute(sql`
      SELECT 'winner' as type, winner_name as name, winner_city as city, 
             w.contest_id, w.announced_at as created_at, w.prize,
             c.name as contest_name
      FROM winners w
      LEFT JOIN contests c ON w.contest_id = c.id
      ORDER BY w.announced_at DESC LIMIT 5
    `);
    const recentWinners = winnersResult.rows || winnersResult || [];

    const contestNames: Record<number, string> = {};
    const allContests = await db.select().from(contestsTable);
    for (const c of allContests) contestNames[c.id] = c.name;

    const feed = [
      ...recentEntries.map((e) => ({
        type: "entry",
        name: e.name ? e.name.split(" ").map((w: string, i: number) => i === 0 ? w[0] + "." : w[0] + ".").join(" ") : "Someone",
        city: e.city || "India",
        contest: e.contestId ? contestNames[e.contestId] || "Contest" : "Giveaway",
        time: e.createdAt,
      })),
      ...(recentWinners as any[]).map((w: any) => ({
        type: "winner",
        name: w.name || "Winner",
        city: w.city || "India",
        contest: w.contest_name || "Contest",
        prize: w.prize,
        time: w.created_at,
      })),
    ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 15);

    return res.json(feed);
  } catch (err) {
    console.error("Activity feed error:", err);
    return res.json([]);
  }
});

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
    const { fullName, email, phone, age, city, completedPartners, screenshotConfirmed, screenshotUrl, agreedToTerms, isAnonymous, contestId, userToken } = req.body;

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

    let userId: number | null = null;
    if (userToken) {
      const [session] = await db.select().from(userSessionsTable).where(eq(userSessionsTable.token, userToken)).limit(1);
      if (session && new Date(session.expiresAt) > new Date()) {
        userId = session.userId;
      }
    }

    const allActivePartners = await db.select().from(partnersTable).where(eq(partnersTable.isActive, true));
    const activePartnerMap = new Map(allActivePartners.map((p) => [p.id, p]));

    const validPartnerIds: number[] = completedPartners
      .map((id: any) => Number(id))
      .filter((id: number) => !isNaN(id) && activePartnerMap.has(id));

    if (validPartnerIds.length === 0) {
      return res.status(400).json({ error: "No valid active partner registrations selected" });
    }

    const entryCount = validPartnerIds.reduce((sum: number, id: number) => {
      return sum + (activePartnerMap.get(id)?.entryPoints || 1);
    }, 0);

    const entryCode = generateEntryCode();

    let resolvedContestId: number | null = null;
    if (contestId) {
      const [contest] = await db.select().from(contestsTable).where(eq(contestsTable.id, Number(contestId))).limit(1);
      if (!contest) {
        return res.status(400).json({ error: "Contest not found" });
      }
      resolvedContestId = contest.id;

      const [contestCount] = await db.select({ count: sql<number>`count(*)` }).from(giveawayEntriesTable).where(eq(giveawayEntriesTable.contestId, contest.id));
      if (Number(contestCount?.count || 0) >= contest.maxSpots) {
        return res.status(400).json({ error: "This contest is full. All spots have been taken." });
      }

      const [existingContestEntry] = await db.select().from(giveawayEntriesTable).where(and(eq(giveawayEntriesTable.contestId, contest.id), eq(giveawayEntriesTable.email, email))).limit(1);
      if (existingContestEntry) {
        return res.status(400).json({ error: "You have already entered this contest" });
      }
    } else {
      const [countResult] = await db.select({ count: sql<number>`count(*)` }).from(giveawayEntriesTable);
      if (Number(countResult?.count || 0) >= MAX_SPOTS) {
        return res.status(400).json({ error: "Contest is full. All spots have been taken." });
      }

      const [existingEntry] = await db.select().from(giveawayEntriesTable).where(eq(giveawayEntriesTable.email, email)).limit(1);
      if (existingEntry) {
        return res.status(400).json({ error: "This email has already been used to enter the giveaway" });
      }
    }

    const [entry] = await db.insert(giveawayEntriesTable).values({
      contestId: resolvedContestId,
      userId,
      fullName,
      email,
      phone,
      age: Number(age),
      city,
      completedPartners: validPartnerIds,
      screenshotConfirmed: true,
      screenshotUrl: screenshotUrl || null,
      agreedToTerms: true,
      ipHash,
      entryCount,
      entryCode,
      isAnonymous: isAnonymous ?? false,
    }).returning();

    return res.json({
      success: true,
      entry: {
        id: entry.id,
        fullName: isAnonymous ? "Anonymous" : entry.fullName,
        entryCount: entry.entryCount,
        entryCode: entry.entryCode,
        createdAt: entry.createdAt,
      },
      message: `Congratulations! You've earned ${entryCount} ${entryCount === 1 ? "entry" : "entries"} into the daily prize draw!`,
    });
  } catch (err: any) {
    console.error("Giveaway entry error:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

router.get("/giveaway/check/:code", async (req, res) => {
  try {
    const { code } = req.params;
    const [entry] = await db.select().from(giveawayEntriesTable).where(eq(giveawayEntriesTable.entryCode, code)).limit(1);

    if (!entry) {
      return res.status(404).json({ error: "Entry code not found. Please check your code and try again." });
    }

    return res.json({
      found: true,
      entry: {
        entryCode: entry.entryCode,
        fullName: entry.isAnonymous ? "Anonymous" : entry.fullName,
        entryCount: entry.entryCount,
        partnersCompleted: (entry.completedPartners as number[]).length,
        submittedAt: entry.createdAt,
      },
    });
  } catch (err) {
    console.error("Check entry error:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

export default router;
