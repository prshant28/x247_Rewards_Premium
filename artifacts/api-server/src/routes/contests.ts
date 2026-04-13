import { Router } from "express";
import { db } from "@workspace/db";
import { contestsTable, giveawayEntriesTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";

const router = Router();

router.get("/contests", async (_req, res) => {
  try {
    const contests = await db.select().from(contestsTable).orderBy(contestsTable.createdAt);

    const contestsWithStats = await Promise.all(
      contests.map(async (contest) => {
        const [result] = await db
          .select({ count: sql<number>`count(*)` })
          .from(giveawayEntriesTable)
          .where(eq(giveawayEntriesTable.contestId, contest.id));
        const totalEntries = Number(result?.count || 0);
        return {
          ...contest,
          totalEntries,
          spotsRemaining: Math.max(0, contest.maxSpots - totalEntries),
          isFull: totalEntries >= contest.maxSpots,
        };
      })
    );

    return res.json(contestsWithStats);
  } catch (err) {
    console.error("Contests list error:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

router.get("/contests/:slug", async (req, res) => {
  try {
    const { slug } = req.params;
    const [contest] = await db.select().from(contestsTable).where(eq(contestsTable.slug, slug)).limit(1);

    if (!contest) {
      return res.status(404).json({ error: "Contest not found" });
    }

    const [result] = await db
      .select({ count: sql<number>`count(*)` })
      .from(giveawayEntriesTable)
      .where(eq(giveawayEntriesTable.contestId, contest.id));
    const totalEntries = Number(result?.count || 0);

    return res.json({
      ...contest,
      totalEntries,
      spotsRemaining: Math.max(0, contest.maxSpots - totalEntries),
      isFull: totalEntries >= contest.maxSpots,
    });
  } catch (err) {
    console.error("Contest detail error:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

export default router;
