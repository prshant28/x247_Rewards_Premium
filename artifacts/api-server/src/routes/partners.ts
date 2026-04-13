import { Router } from "express";
import { db } from "@workspace/db";
import { partnersTable, clicksTable, impressionsTable, formFillsTable } from "@workspace/db";
import { eq, sql, and, gte } from "drizzle-orm";
import { adminSessionsTable } from "@workspace/db";
import { openrouter } from "@workspace/integrations-openrouter-ai";
import crypto from "crypto";

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

function hashIp(ip: string): string {
  return crypto.createHash("sha256").update(ip || "unknown").digest("hex").substring(0, 16);
}

router.get("/partners", async (_req, res) => {
  try {
    const partners = await db.select().from(partnersTable).orderBy(partnersTable.sortOrder);

    const partnersWithStats = await Promise.all(
      partners.map(async (p) => {
        const [clickCount] = await db.select({ count: sql<number>`count(*)` }).from(clicksTable).where(eq(clicksTable.partnerId, p.id));
        const [impressionCount] = await db.select({ count: sql<number>`count(*)` }).from(impressionsTable).where(eq(impressionsTable.partnerId, p.id));
        const [formFillCount] = await db.select({ count: sql<number>`count(*)` }).from(formFillsTable).where(eq(formFillsTable.partnerId, p.id));

        return {
          ...p,
          stats: {
            clicks: Number(clickCount?.count || 0),
            impressions: Number(impressionCount?.count || 0),
            formFills: Number(formFillCount?.count || 0),
          },
        };
      })
    );

    return res.json(partnersWithStats);
  } catch (err) {
    console.error("Get partners error:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

router.get("/partners/:slug", async (req, res) => {
  try {
    const { slug } = req.params;
    const idNum = parseInt(slug);
    const condition = isNaN(idNum)
      ? eq(partnersTable.slug, slug)
      : eq(partnersTable.id, idNum);

    const [partner] = await db.select().from(partnersTable).where(condition).limit(1);
    if (!partner) {
      return res.status(404).json({ error: "Partner not found" });
    }

    const [clickCount] = await db.select({ count: sql<number>`count(*)` }).from(clicksTable).where(eq(clicksTable.partnerId, partner.id));
    const [impressionCount] = await db.select({ count: sql<number>`count(*)` }).from(impressionsTable).where(eq(impressionsTable.partnerId, partner.id));
    const [formFillCount] = await db.select({ count: sql<number>`count(*)` }).from(formFillsTable).where(eq(formFillsTable.partnerId, partner.id));

    return res.json({
      ...partner,
      stats: {
        clicks: Number(clickCount?.count || 0),
        impressions: Number(impressionCount?.count || 0),
        formFills: Number(formFillCount?.count || 0),
      },
    });
  } catch (err) {
    console.error("Get partner error:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

router.post("/partners", requireAdmin, async (req, res) => {
  try {
    const { name, tagline, description, category, registrationUrl, accent, badge, badgeSecondary, isActive, isRequired, slug } = req.body;

    if (!name || !registrationUrl || !slug) {
      return res.status(400).json({ error: "Name, slug, and registration URL are required" });
    }

    const [partner] = await db.insert(partnersTable).values({
      slug,
      name,
      tagline: tagline || "",
      description: description || "",
      category: category || "Registration",
      registrationUrl,
      accent: accent || "navy",
      badge: badge || null,
      badgeSecondary: badgeSecondary || null,
      isActive: isActive ?? false,
      isRequired: isRequired ?? false,
    }).returning();

    return res.json(partner);
  } catch (err: any) {
    if (err?.code === "23505") {
      return res.status(400).json({ error: "A partner with this slug already exists" });
    }
    console.error("Create partner error:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

router.put("/partners/:id", requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { name, tagline, description, category, registrationUrl, accent, badge, badgeSecondary, isActive, isRequired, slug } = req.body;

    const [partner] = await db.update(partnersTable)
      .set({
        ...(name !== undefined && { name }),
        ...(slug !== undefined && { slug }),
        ...(tagline !== undefined && { tagline }),
        ...(description !== undefined && { description }),
        ...(category !== undefined && { category }),
        ...(registrationUrl !== undefined && { registrationUrl }),
        ...(accent !== undefined && { accent }),
        ...(badge !== undefined && { badge }),
        ...(badgeSecondary !== undefined && { badgeSecondary }),
        ...(isActive !== undefined && { isActive }),
        ...(isRequired !== undefined && { isRequired }),
        updatedAt: new Date(),
      })
      .where(eq(partnersTable.id, id))
      .returning();

    if (!partner) {
      return res.status(404).json({ error: "Partner not found" });
    }

    return res.json(partner);
  } catch (err) {
    console.error("Update partner error:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

router.delete("/partners/:id", requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await db.delete(partnersTable).where(eq(partnersTable.id, id));
    return res.json({ success: true });
  } catch (err) {
    console.error("Delete partner error:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

router.post("/partners/:id/click", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const ipHash = hashIp(req.ip || "");
    const userAgent = req.headers["user-agent"] || "";
    const referrer = req.headers.referer || "";

    await db.insert(clicksTable).values({
      partnerId: id,
      ipHash,
      userAgent,
      referrer,
    });

    return res.json({ success: true });
  } catch (err) {
    console.error("Track click error:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

router.post("/partners/:id/impression", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const ipHash = hashIp(req.ip || "");

    await db.insert(impressionsTable).values({
      partnerId: id,
      ipHash,
    });

    return res.json({ success: true });
  } catch (err) {
    console.error("Track impression error:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

router.post("/partners/:id/form-fill", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const ipHash = hashIp(req.ip || "");

    await db.insert(formFillsTable).values({
      partnerId: id,
      ipHash,
    });

    return res.json({ success: true });
  } catch (err) {
    console.error("Track form fill error:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

router.post("/partners/generate-ai", requireAdmin, async (req, res) => {
  try {
    const { url, description } = req.body;
    if (!url && !description) {
      return res.status(400).json({ error: "Provide a URL or description" });
    }

    const prompt = url
      ? `Given this registration/partner URL: "${url}"
Analyze the URL and generate partner details for a giveaway platform. Infer what the platform/event is about from the URL structure, domain name, and any path segments.`
      : `Given this description of a partner: "${description}"
Generate partner details for a giveaway platform.`;

    const response = await openrouter.chat.completions.create({
      model: "meta-llama/llama-4-scout",
      messages: [
        {
          role: "system",
          content: `You are an assistant that generates partner listing details for X247 Rewards, a giveaway platform. Generate realistic, professional partner data.

You MUST respond with ONLY a valid JSON object (no markdown, no code blocks, no extra text). The JSON must have these exact keys:
{
  "name": "Partner Name (short, catchy title)",
  "slug": "kebab-case-slug",
  "tagline": "A short catchy tagline (under 60 chars)",
  "description": "A compelling 2-3 sentence description of the partner and what users need to register for",
  "category": "Registration",
  "badge": "One of: Required, New, Popular, Exclusive, Limited (pick most appropriate)",
  "badgeSecondary": "Optional second badge like 'Students Only', 'Free Entry', 'Open for All', or empty string",
  "accent": "One of: navy, red, neutral (pick based on brand feel)"
}`
        },
        { role: "user", content: prompt }
      ],
      max_tokens: 500,
      temperature: 0.7,
    });

    const content = response.choices?.[0]?.message?.content || "";

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return res.status(500).json({ error: "AI failed to generate valid partner data" });
    }

    const generated = JSON.parse(jsonMatch[0]);

    return res.json({
      name: generated.name || "",
      slug: generated.slug || "",
      tagline: generated.tagline || "",
      description: generated.description || "",
      category: generated.category || "Registration",
      registrationUrl: url || "",
      accent: generated.accent || "navy",
      badge: generated.badge || "",
      badgeSecondary: generated.badgeSecondary || "",
      isActive: false,
      isRequired: false,
    });
  } catch (err) {
    console.error("AI generate partner error:", err);
    return res.status(500).json({ error: "Failed to generate partner details" });
  }
});

router.get("/admin/analytics", requireAdmin, async (_req, res) => {
  try {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    const partners = await db.select().from(partnersTable).orderBy(partnersTable.sortOrder);

    const analytics = await Promise.all(
      partners.map(async (p) => {
        const [totalClicks] = await db.select({ count: sql<number>`count(*)` }).from(clicksTable).where(eq(clicksTable.partnerId, p.id));
        const [totalImpressions] = await db.select({ count: sql<number>`count(*)` }).from(impressionsTable).where(eq(impressionsTable.partnerId, p.id));
        const [totalFormFills] = await db.select({ count: sql<number>`count(*)` }).from(formFillsTable).where(eq(formFillsTable.partnerId, p.id));

        const [todayClicks] = await db.select({ count: sql<number>`count(*)` }).from(clicksTable).where(and(eq(clicksTable.partnerId, p.id), gte(clicksTable.createdAt, today)));
        const [todayImpressions] = await db.select({ count: sql<number>`count(*)` }).from(impressionsTable).where(and(eq(impressionsTable.partnerId, p.id), gte(impressionsTable.createdAt, today)));
        const [todayFormFills] = await db.select({ count: sql<number>`count(*)` }).from(formFillsTable).where(and(eq(formFillsTable.partnerId, p.id), gte(formFillsTable.createdAt, today)));

        const [weekClicks] = await db.select({ count: sql<number>`count(*)` }).from(clicksTable).where(and(eq(clicksTable.partnerId, p.id), gte(clicksTable.createdAt, weekAgo)));

        return {
          partner: p,
          total: {
            clicks: Number(totalClicks?.count || 0),
            impressions: Number(totalImpressions?.count || 0),
            formFills: Number(totalFormFills?.count || 0),
          },
          today: {
            clicks: Number(todayClicks?.count || 0),
            impressions: Number(todayImpressions?.count || 0),
            formFills: Number(todayFormFills?.count || 0),
          },
          weekClicks: Number(weekClicks?.count || 0),
        };
      })
    );

    const [totalClicksAll] = await db.select({ count: sql<number>`count(*)` }).from(clicksTable);
    const [totalImpressionsAll] = await db.select({ count: sql<number>`count(*)` }).from(impressionsTable);
    const [totalFormFillsAll] = await db.select({ count: sql<number>`count(*)` }).from(formFillsTable);

    return res.json({
      overview: {
        totalClicks: Number(totalClicksAll?.count || 0),
        totalImpressions: Number(totalImpressionsAll?.count || 0),
        totalFormFills: Number(totalFormFillsAll?.count || 0),
        totalPartners: partners.length,
        activePartners: partners.filter(p => p.isActive).length,
      },
      partners: analytics,
    });
  } catch (err) {
    console.error("Analytics error:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

export default router;
