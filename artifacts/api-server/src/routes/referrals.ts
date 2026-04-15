import { Router } from "express";
import { db } from "@workspace/db";
import {
  referralPartnersTable,
  referralClicksTable,
  referralConversionsTable,
  userSessionsTable,
  usersTable,
  adminSessionsTable,
} from "@workspace/db";
import { eq, sql, desc, and } from "drizzle-orm";
import crypto from "crypto";

const router = Router();

function generateReferralCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `REF-${code}`;
}

function hashIp(ip: string): string {
  return crypto.createHash("sha256").update(ip || "unknown").digest("hex").substring(0, 16);
}

async function requireUser(req: any, res: any, next: any) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Authentication required" });
  }
  const token = authHeader.substring(7);
  const sessions = await db
    .select()
    .from(userSessionsTable)
    .where(eq(userSessionsTable.token, token));
  if (!sessions.length || new Date(sessions[0].expiresAt) < new Date()) {
    return res.status(401).json({ error: "Invalid or expired session" });
  }
  const users = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, sessions[0].userId));
  if (!users.length) {
    return res.status(401).json({ error: "User not found" });
  }
  (req as any).user = users[0];
  next();
}

async function requireAdmin(req: any, res: any, next: any) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const token = authHeader.substring(7);
  const sessions = await db
    .select()
    .from(adminSessionsTable)
    .where(eq(adminSessionsTable.token, token));
  if (!sessions.length || new Date(sessions[0].expiresAt) < new Date()) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
}

router.post("/referral/apply", requireUser, async (req: any, res) => {
  try {
    const user = req.user;
    const { bio, motivation, audienceSize, socialMedia, phone } = req.body;

    const existing = await db
      .select()
      .from(referralPartnersTable)
      .where(eq(referralPartnersTable.userId, user.id));

    if (existing.length) {
      return res.status(400).json({ error: "You have already applied as a referral partner", partner: existing[0] });
    }

    let code = generateReferralCode();
    let attempts = 0;
    while (attempts < 10) {
      const dup = await db.select().from(referralPartnersTable).where(eq(referralPartnersTable.code, code));
      if (!dup.length) break;
      code = generateReferralCode();
      attempts++;
    }

    const [partner] = await db
      .insert(referralPartnersTable)
      .values({
        userId: user.id,
        name: user.fullName,
        email: user.email,
        phone: phone || user.phone || null,
        code,
        status: "pending",
        bio: bio || null,
        motivation: motivation || null,
        audienceSize: audienceSize || null,
        socialMedia: socialMedia || null,
      })
      .returning();

    return res.json({ success: true, partner });
  } catch (err) {
    console.error("Referral apply error:", err);
    return res.status(500).json({ error: "Failed to submit application" });
  }
});

router.get("/referral/me", requireUser, async (req: any, res) => {
  try {
    const user = req.user;
    const partners = await db
      .select()
      .from(referralPartnersTable)
      .where(eq(referralPartnersTable.userId, user.id));

    if (!partners.length) {
      return res.json({ partner: null });
    }

    const partner = partners[0];

    const clicksResult = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(referralClicksTable)
      .where(eq(referralClicksTable.referralPartnerId, partner.id));

    const conversionsResult = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(referralConversionsTable)
      .where(eq(referralConversionsTable.referralPartnerId, partner.id));

    const signups = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(referralConversionsTable)
      .where(and(
        eq(referralConversionsTable.referralPartnerId, partner.id),
        eq(referralConversionsTable.type, "signup")
      ));

    const entries = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(referralConversionsTable)
      .where(and(
        eq(referralConversionsTable.referralPartnerId, partner.id),
        eq(referralConversionsTable.type, "entry")
      ));

    return res.json({
      partner: {
        ...partner,
        stats: {
          totalClicks: clicksResult[0]?.count || 0,
          totalConversions: conversionsResult[0]?.count || 0,
          totalSignups: signups[0]?.count || 0,
          totalEntries: entries[0]?.count || 0,
        },
      },
    });
  } catch (err) {
    console.error("Referral me error:", err);
    return res.status(500).json({ error: "Failed to fetch profile" });
  }
});

router.get("/referral/me/stats", requireUser, async (req: any, res) => {
  try {
    const user = req.user;
    const partners = await db
      .select()
      .from(referralPartnersTable)
      .where(eq(referralPartnersTable.userId, user.id));

    if (!partners.length) {
      return res.status(404).json({ error: "Not a referral partner" });
    }

    const partner = partners[0];

    const dailyClicks = await db.execute(sql`
      SELECT date_trunc('day', created_at)::date as day, count(*)::int as clicks
      FROM referral_clicks
      WHERE referral_partner_id = ${partner.id}
      AND created_at > now() - interval '30 days'
      GROUP BY day ORDER BY day DESC
    `);

    const dailyConversions = await db.execute(sql`
      SELECT date_trunc('day', created_at)::date as day, type, count(*)::int as total
      FROM referral_conversions
      WHERE referral_partner_id = ${partner.id}
      AND created_at > now() - interval '30 days'
      GROUP BY day, type ORDER BY day DESC
    `);

    const recentConversions = await db
      .select({
        id: referralConversionsTable.id,
        type: referralConversionsTable.type,
        createdAt: referralConversionsTable.createdAt,
        userName: usersTable.fullName,
        userCity: usersTable.city,
      })
      .from(referralConversionsTable)
      .leftJoin(usersTable, eq(referralConversionsTable.referredUserId, usersTable.id))
      .where(eq(referralConversionsTable.referralPartnerId, partner.id))
      .orderBy(desc(referralConversionsTable.createdAt))
      .limit(20);

    const maskedConversions = recentConversions.map((c) => ({
      ...c,
      userName: c.userName
        ? c.userName.split(" ").map((w: string) => w[0] + "***").join(" ")
        : "Anonymous",
    }));

    return res.json({
      dailyClicks: (dailyClicks as any).rows || dailyClicks,
      dailyConversions: (dailyConversions as any).rows || dailyConversions,
      recentConversions: maskedConversions,
    });
  } catch (err) {
    console.error("Referral stats error:", err);
    return res.status(500).json({ error: "Failed to fetch stats" });
  }
});

router.get("/r/:code", async (req, res) => {
  try {
    const { code } = req.params;
    const partners = await db
      .select()
      .from(referralPartnersTable)
      .where(eq(referralPartnersTable.code, code.toUpperCase()));

    if (partners.length && partners[0].status === "approved") {
      const ip = (req.headers["x-forwarded-for"] as string)?.split(",")[0] || req.ip || "";
      await db.insert(referralClicksTable).values({
        referralPartnerId: partners[0].id,
        ipHash: hashIp(ip),
        userAgent: (req.headers["user-agent"] || "").substring(0, 200),
        source: req.query.src as string || null,
      });
    }

    const baseUrl = process.env.REPLIT_DEV_DOMAIN
      ? `https://${process.env.REPLIT_DEV_DOMAIN}`
      : "";
    return res.redirect(`${baseUrl}/?ref=${code}`);
  } catch (err) {
    console.error("Referral track error:", err);
    const baseUrl = process.env.REPLIT_DEV_DOMAIN
      ? `https://${process.env.REPLIT_DEV_DOMAIN}`
      : "";
    return res.redirect(`${baseUrl}/`);
  }
});

router.get("/admin/referrals", requireAdmin, async (_req, res) => {
  try {
    const partners = await db
      .select({
        id: referralPartnersTable.id,
        userId: referralPartnersTable.userId,
        name: referralPartnersTable.name,
        email: referralPartnersTable.email,
        phone: referralPartnersTable.phone,
        code: referralPartnersTable.code,
        status: referralPartnersTable.status,
        bio: referralPartnersTable.bio,
        motivation: referralPartnersTable.motivation,
        audienceSize: referralPartnersTable.audienceSize,
        socialMedia: referralPartnersTable.socialMedia,
        isVerified: referralPartnersTable.isVerified,
        approvedAt: referralPartnersTable.approvedAt,
        rejectedAt: referralPartnersTable.rejectedAt,
        rejectionReason: referralPartnersTable.rejectionReason,
        createdAt: referralPartnersTable.createdAt,
      })
      .from(referralPartnersTable)
      .orderBy(desc(referralPartnersTable.createdAt));

    const enriched = await Promise.all(
      partners.map(async (p) => {
        const clicks = await db
          .select({ count: sql<number>`count(*)::int` })
          .from(referralClicksTable)
          .where(eq(referralClicksTable.referralPartnerId, p.id));
        const conversions = await db
          .select({ count: sql<number>`count(*)::int` })
          .from(referralConversionsTable)
          .where(eq(referralConversionsTable.referralPartnerId, p.id));
        return {
          ...p,
          totalClicks: clicks[0]?.count || 0,
          totalConversions: conversions[0]?.count || 0,
        };
      })
    );

    return res.json(enriched);
  } catch (err) {
    console.error("Admin referrals error:", err);
    return res.status(500).json({ error: "Failed to fetch referrals" });
  }
});

router.put("/admin/referrals/:id/status", requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, rejectionReason } = req.body;

    if (!["approved", "rejected", "suspended", "pending"].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const updateData: any = { status };
    if (status === "approved") {
      updateData.approvedAt = new Date();
      updateData.rejectedAt = null;
      updateData.rejectionReason = null;
    } else if (status === "rejected") {
      updateData.rejectedAt = new Date();
      updateData.rejectionReason = rejectionReason || null;
    } else if (status === "suspended") {
      updateData.rejectedAt = new Date();
      updateData.rejectionReason = rejectionReason || "Account suspended";
    }

    const [updated] = await db
      .update(referralPartnersTable)
      .set(updateData)
      .where(eq(referralPartnersTable.id, parseInt(id)))
      .returning();

    if (!updated) {
      return res.status(404).json({ error: "Partner not found" });
    }

    return res.json({ success: true, partner: updated });
  } catch (err) {
    console.error("Admin referral status error:", err);
    return res.status(500).json({ error: "Failed to update status" });
  }
});

router.post("/referral/track-conversion", async (req, res) => {
  try {
    const { refCode, userId, type, contestId } = req.body;
    if (!refCode || !type) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const allowedTypes = ["signup", "entry"];
    if (!allowedTypes.includes(type)) {
      return res.status(400).json({ error: "Invalid conversion type" });
    }

    const partners = await db
      .select()
      .from(referralPartnersTable)
      .where(eq(referralPartnersTable.code, refCode.toUpperCase()));

    if (!partners.length || partners[0].status !== "approved") {
      return res.json({ success: false, error: "Invalid referral code" });
    }

    if (userId && partners[0].userId === userId) {
      return res.json({ success: false, error: "Cannot refer yourself" });
    }

    if (userId) {
      const existingConversion = await db
        .select({ id: referralConversionsTable.id })
        .from(referralConversionsTable)
        .where(and(
          eq(referralConversionsTable.referredUserId, userId),
          eq(referralConversionsTable.type, type)
        ))
        .limit(1);
      if (existingConversion.length) {
        return res.json({ success: true, duplicate: true });
      }
    }

    await db.insert(referralConversionsTable).values({
      referralPartnerId: partners[0].id,
      referredUserId: userId || null,
      contestId: contestId || null,
      type,
    });

    return res.json({ success: true });
  } catch (err) {
    console.error("Track conversion error:", err);
    return res.status(500).json({ error: "Failed to track conversion" });
  }
});

export default router;
