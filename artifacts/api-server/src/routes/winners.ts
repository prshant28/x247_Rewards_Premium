import { Router } from "express";
import { db } from "@workspace/db";
import { winnersTable, contestsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

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

export default router;
