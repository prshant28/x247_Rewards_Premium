import { Router } from "express";
import { db } from "@workspace/db";
import { contestsTable, giveawayEntriesTable, adminSessionsTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import { openrouter } from "@workspace/integrations-openrouter-ai";

const router = Router();

async function requireAdmin(req: any, res: any, next: any) {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const [session] = await db.select().from(adminSessionsTable).where(eq(adminSessionsTable.token, token)).limit(1);
  if (!session || new Date(session.expiresAt) < new Date()) {
    return res.status(401).json({ error: "Session expired" });
  }
  next();
}

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
          partnerIds: contest.partnerIds || [],
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
      partnerIds: contest.partnerIds || [],
      totalEntries,
      spotsRemaining: Math.max(0, contest.maxSpots - totalEntries),
      isFull: totalEntries >= contest.maxSpots,
    });
  } catch (err) {
    console.error("Contest detail error:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

router.post("/contests", requireAdmin, async (req, res) => {
  try {
    const { name, description, prize, prizeValue, maxSpots, status, slug, partnerIds, endsAt } = req.body;
    if (!name || !description || !prize || !slug) {
      return res.status(400).json({ error: "Name, description, prize, and slug are required" });
    }
    const [contest] = await db.insert(contestsTable).values({
      name, description, prize,
      prizeValue: prizeValue || null,
      maxSpots: maxSpots || 100,
      status: status || "active",
      slug,
      partnerIds: partnerIds || [],
      endsAt: endsAt ? new Date(endsAt) : null,
    }).returning();
    return res.json(contest);
  } catch (err) {
    console.error("Create contest error:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

router.put("/contests/:id", requireAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { name, description, prize, prizeValue, maxSpots, status, slug, partnerIds, endsAt } = req.body;
    const updates: any = {};
    if (name !== undefined) updates.name = name;
    if (description !== undefined) updates.description = description;
    if (prize !== undefined) updates.prize = prize;
    if (prizeValue !== undefined) updates.prizeValue = prizeValue;
    if (maxSpots !== undefined) updates.maxSpots = maxSpots;
    if (status !== undefined) updates.status = status;
    if (slug !== undefined) updates.slug = slug;
    if (partnerIds !== undefined) updates.partnerIds = partnerIds;
    if (endsAt !== undefined) updates.endsAt = endsAt ? new Date(endsAt) : null;

    const [updated] = await db.update(contestsTable).set(updates).where(eq(contestsTable.id, id)).returning();
    if (!updated) return res.status(404).json({ error: "Contest not found" });
    return res.json(updated);
  } catch (err) {
    console.error("Update contest error:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

router.delete("/contests/:id", requireAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);
    await db.delete(contestsTable).where(eq(contestsTable.id, id));
    return res.json({ success: true });
  } catch (err) {
    console.error("Delete contest error:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

router.post("/contests/generate-ai", requireAdmin, async (req, res) => {
  try {
    const { theme, prize, description } = req.body;
    if (!theme && !description) {
      return res.status(400).json({ error: "Provide a theme or description" });
    }

    const prompt = theme
      ? `Create a giveaway contest with this theme: "${theme}". Prize hint: "${prize || "tech gadget"}".`
      : `Create a giveaway contest based on this description: "${description}".`;

    const response = await openrouter.chat.completions.create({
      model: "meta-llama/llama-4-scout",
      messages: [
        {
          role: "system",
          content: `You are an assistant that generates contest details for X247 Rewards, a student-focused giveaway platform.

Respond with ONLY a valid JSON object (no markdown, no code blocks). Use these exact keys:
{
  "name": "Contest name (concise, exciting, under 50 chars)",
  "slug": "url-slug-in-kebab-case",
  "description": "Engaging 2-3 sentence description of the contest and how to enter",
  "prize": "Prize name (e.g. iPhone 16 Pro, ₹10,000 Cash, MacBook Air M3)",
  "prizeValue": "Prize value string (e.g. $1,199, ₹10,000) or empty string",
  "maxSpots": 100
}`
        },
        { role: "user", content: prompt }
      ],
      max_tokens: 500,
      temperature: 0.8,
    });

    const content = response.choices?.[0]?.message?.content || "";
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return res.status(500).json({ error: "AI failed to generate valid contest data" });
    }

    const generated = JSON.parse(jsonMatch[0]);
    return res.json({
      name: generated.name || "",
      slug: generated.slug || "",
      description: generated.description || "",
      prize: generated.prize || "",
      prizeValue: generated.prizeValue || "",
      maxSpots: generated.maxSpots || 100,
    });
  } catch (err) {
    console.error("AI contest generate error:", err);
    return res.status(500).json({ error: "Failed to generate contest details" });
  }
});

export default router;
