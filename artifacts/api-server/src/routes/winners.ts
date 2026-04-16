import { Router } from "express";
import { db } from "@workspace/db";
import { winnersTable, contestsTable, adminSessionsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { broadcastNotification } from "../lib/notifications";

async function requireAdmin(req: any, res: any, next: any) {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!token) return res.status(401).json({ error: "Unauthorized" });
  const [session] = await db.select().from(adminSessionsTable).where(eq(adminSessionsTable.token, token)).limit(1);
  if (!session || new Date(session.expiresAt) < new Date()) return res.status(401).json({ error: "Session expired" });
  next();
}

const router = Router();

router.get("/winners", async (_req, res) => {
  try {
    const winners = await db.select().from(winnersTable).orderBy(winnersTable.announcedAt);

    const winnersWithContest = await Promise.all(
      winners.map(async (winner) => {
        let contestName = "General Giveaway";
        if (winner.contestId) {
          const [contest] = await db.select().from(contestsTable).where(eq(contestsTable.id, winner.contestId)).limit(1);
          if (contest) contestName = contest.name;
        }
        return {
          id: winner.id,
          winnerName: winner.winnerName,
          winnerCity: winner.winnerCity,
          prize: winner.prize,
          contestName,
          entryCode: winner.entryCode,
          announcedAt: winner.announcedAt,
        };
      })
    );

    return res.json(winnersWithContest);
  } catch (err) {
    console.error("Winners list error:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

router.post("/admin/winners", requireAdmin, async (req, res) => {
  try {
    const { contestId, entryId, winnerName, winnerCity, prize, entryCode } = req.body;
    if (!winnerName || !prize) {
      return res.status(400).json({ error: "winnerName and prize are required" });
    }
    const [winner] = await db.insert(winnersTable).values({
      contestId: contestId || 0,
      entryId: entryId || null,
      winnerName,
      winnerCity: winnerCity || null,
      prize,
      entryCode: entryCode || null,
    }).returning();

    let contestName = "a giveaway";
    if (contestId) {
      const [contest] = await db.select().from(contestsTable).where(eq(contestsTable.id, contestId)).limit(1);
      if (contest) contestName = contest.name;
    }

    broadcastNotification({
      type: "winner",
      icon: "gift",
      title: "Winner Announced!",
      body: `${winnerName} just won ${prize} in ${contestName}! Could you be next?`,
      data: { url: "/winners" },
    }, "winnerAnnouncements").catch(err => console.error("Broadcast notification error:", err));

    return res.json(winner);
  } catch (err) {
    console.error("Create winner error:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

router.delete("/admin/winners/:id", requireAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);
    await db.delete(winnersTable).where(eq(winnersTable.id, id));
    return res.json({ success: true });
  } catch (err) {
    console.error("Delete winner error:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

export default router;
