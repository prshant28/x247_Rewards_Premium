import { Router } from "express";
import { db } from "@workspace/db";
import { usersTable, userSessionsTable, giveawayEntriesTable, contestsTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import crypto from "crypto";
import bcrypt from "bcryptjs";

const router = Router();

function generateToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

const MEMBERSHIP_PLANS = [
  {
    id: "free",
    name: "Free",
    price: 0,
    currency: "INR",
    interval: null,
    entriesPerContest: 2,
    features: [
      "2 entries per contest",
      "Text chat assistant",
      "Access to all partners",
      "Basic platform access",
    ],
    limits: { chatMessagesPerDay: 10, voiceChat: false, entriesPerContest: 2 },
  },
  {
    id: "basic",
    name: "Basic",
    price: 199,
    currency: "INR",
    interval: "month",
    entriesPerContest: 5,
    features: [
      "5 entries per contest",
      "Unlimited text chat",
      "Priority support",
      "Early access to new partners",
      "Partner insights & analytics",
    ],
    limits: { chatMessagesPerDay: -1, voiceChat: false, entriesPerContest: 5 },
  },
  {
    id: "premium",
    name: "Premium",
    price: 499,
    currency: "INR",
    interval: "month",
    entriesPerContest: -1,
    features: [
      "Unlimited entries per contest",
      "Voice AI chat (ElevenLabs)",
      "Unlimited text chat",
      "VIP badge on entries",
      "Exclusive partner deals",
      "Priority everything",
      "Dedicated VIP support",
    ],
    limits: { chatMessagesPerDay: -1, voiceChat: true, entriesPerContest: -1 },
  },
];

function getActiveTier(user: any): string {
  if (!user.membershipTier || user.membershipTier === "free") return "free";
  if (user.membershipExpiresAt && new Date(user.membershipExpiresAt) < new Date()) return "free";
  return user.membershipTier;
}

router.post("/users/register", async (req, res) => {
  try {
    const { fullName, email, phone, password, city } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({ error: "Name, email, and password are required" });
    }

    const [existing] = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
    if (existing) {
      return res.status(400).json({ error: "An account with this email already exists" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const [user] = await db.insert(usersTable).values({
      fullName,
      email,
      phone: phone || null,
      passwordHash,
      city: city || null,
    }).returning();

    const token = generateToken();
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    await db.insert(userSessionsTable).values({
      token,
      userId: user.id,
      expiresAt,
    });

    return res.json({
      success: true,
      token,
      user: { id: user.id, fullName: user.fullName, email: user.email },
    });
  } catch (err) {
    console.error("User register error:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

router.post("/users/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const token = generateToken();
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    await db.insert(userSessionsTable).values({
      token,
      userId: user.id,
      expiresAt,
    });

    return res.json({
      success: true,
      token,
      user: { id: user.id, fullName: user.fullName, email: user.email },
    });
  } catch (err) {
    console.error("User login error:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

router.get("/users/me", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const token = authHeader.substring(7);
    const [session] = await db.select().from(userSessionsTable).where(eq(userSessionsTable.token, token)).limit(1);

    if (!session || new Date(session.expiresAt) < new Date()) {
      return res.status(401).json({ error: "Session expired" });
    }

    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, session.userId)).limit(1);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const activeTier = getActiveTier(user);
    const plan = MEMBERSHIP_PLANS.find(p => p.id === activeTier);

    return res.json({
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      city: user.city,
      createdAt: user.createdAt,
      membershipTier: activeTier,
      membershipExpiresAt: user.membershipExpiresAt,
      membershipLimits: plan?.limits || MEMBERSHIP_PLANS[0].limits,
    });
  } catch (err) {
    console.error("User me error:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

router.get("/users/me/entries", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const token = authHeader.substring(7);
    const [session] = await db.select().from(userSessionsTable).where(eq(userSessionsTable.token, token)).limit(1);

    if (!session || new Date(session.expiresAt) < new Date()) {
      return res.status(401).json({ error: "Session expired" });
    }

    const entries = await db.select().from(giveawayEntriesTable).where(eq(giveawayEntriesTable.userId, session.userId));

    const entriesWithContest = await Promise.all(
      entries.map(async (entry) => {
        let contestName = "General Giveaway";
        if (entry.contestId) {
          const [contest] = await db.select().from(contestsTable).where(eq(contestsTable.id, entry.contestId)).limit(1);
          if (contest) contestName = contest.name;
        }
        return {
          id: entry.id,
          entryCode: entry.entryCode,
          entryCount: entry.entryCount,
          contestName,
          contestId: entry.contestId,
          partnersCompleted: (entry.completedPartners as number[]).length,
          submittedAt: entry.createdAt,
        };
      })
    );

    return res.json(entriesWithContest);
  } catch (err) {
    console.error("User entries error:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

router.post("/users/logout", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.substring(7);
      await db.delete(userSessionsTable).where(eq(userSessionsTable.token, token));
    }
    return res.json({ success: true });
  } catch (err) {
    return res.json({ success: true });
  }
});

router.get("/membership/plans", (_req, res) => {
  res.json(MEMBERSHIP_PLANS);
});

router.get("/membership/status", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return res.json({ tier: "free", limits: MEMBERSHIP_PLANS[0].limits });
    }

    const token = authHeader.substring(7);
    const [session] = await db.select().from(userSessionsTable).where(eq(userSessionsTable.token, token)).limit(1);

    if (!session || new Date(session.expiresAt) < new Date()) {
      return res.json({ tier: "free", limits: MEMBERSHIP_PLANS[0].limits });
    }

    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, session.userId)).limit(1);
    if (!user) {
      return res.json({ tier: "free", limits: MEMBERSHIP_PLANS[0].limits });
    }

    const activeTier = getActiveTier(user);
    const plan = MEMBERSHIP_PLANS.find(p => p.id === activeTier);

    return res.json({
      tier: activeTier,
      expiresAt: user.membershipExpiresAt,
      limits: plan?.limits || MEMBERSHIP_PLANS[0].limits,
    });
  } catch {
    return res.json({ tier: "free", limits: MEMBERSHIP_PLANS[0].limits });
  }
});

export default router;
