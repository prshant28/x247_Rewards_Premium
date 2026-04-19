import { Router } from "express";
import { db } from "@workspace/db";
import { usersTable, userSessionsTable, giveawayEntriesTable, contestsTable, userBadgesTable, userFollowsTable, notificationsTable } from "@workspace/db";
import { eq, sql, and, count, desc, ne, notInArray, inArray } from "drizzle-orm";
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
    id: "silver",
    name: "Silver",
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
    id: "gold",
    name: "Gold",
    price: 499,
    currency: "INR",
    interval: "month",
    entriesPerContest: 15,
    features: [
      "15 entries per contest",
      "Voice AI chat (ElevenLabs)",
      "Unlimited text chat",
      "Verified badge on profile",
      "Exclusive partner deals",
      "Priority everything",
      "Dedicated VIP support",
    ],
    limits: { chatMessagesPerDay: -1, voiceChat: true, entriesPerContest: 15 },
  },
  {
    id: "black",
    name: "Black",
    price: 999,
    currency: "INR",
    interval: "month",
    entriesPerContest: -1,
    features: [
      "Unlimited entries per contest",
      "Voice AI chat (ElevenLabs)",
      "Verified badge on profile",
      "Black tier exclusive badge",
      "Early winner announcements",
      "Private concierge support",
      "Exclusive Black events",
      "Lifetime priority queue",
    ],
    limits: { chatMessagesPerDay: -1, voiceChat: true, entriesPerContest: -1 },
  },
];

function getActiveTier(user: any): string {
  if (!user.membershipTier || user.membershipTier === "free") return "free";
  if (user.membershipExpiresAt && new Date(user.membershipExpiresAt) < new Date()) return "free";
  return user.membershipTier;
}

function generateProfileSlug(fullName: string): string {
  const base = fullName
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 20);
  const suffix = crypto.randomBytes(3).toString("hex").slice(0, 5);
  return `${base}-${suffix}`;
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
    const autoSlug = generateProfileSlug(fullName);
    const [user] = await db.insert(usersTable).values({
      fullName,
      email,
      phone: phone || null,
      passwordHash,
      city: city || null,
      profileSlug: autoSlug,
      isPublic: true,
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

    let [user] = await db.select().from(usersTable).where(eq(usersTable.id, session.userId)).limit(1);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (!user.profileSlug) {
      const autoSlug = generateProfileSlug(user.fullName);
      const [updated] = await db.update(usersTable)
        .set({ profileSlug: autoSlug, isPublic: true })
        .where(eq(usersTable.id, user.id))
        .returning();
      if (updated) user = updated;
    }

    const activeTier = getActiveTier(user);
    const plan = MEMBERSHIP_PLANS.find(p => p.id === activeTier);

    const [badges, followersResult, followingResult] = await Promise.all([
      db.select().from(userBadgesTable).where(eq(userBadgesTable.userId, user.id)),
      db.select({ count: count() }).from(userFollowsTable).where(eq(userFollowsTable.followingId, user.id)),
      db.select({ count: count() }).from(userFollowsTable).where(eq(userFollowsTable.followerId, user.id)),
    ]);

    return res.json({
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      city: user.city,
      bio: user.bio,
      avatarUrl: user.avatarUrl,
      profileSlug: user.profileSlug,
      isPublic: user.isPublic,
      isVerified: user.isVerified,
      selectedBadge: user.selectedBadge,
      badges: badges.map(b => b.badgeId),
      createdAt: user.createdAt,
      membershipTier: activeTier,
      membershipExpiresAt: user.membershipExpiresAt,
      membershipLimits: plan?.limits || MEMBERSHIP_PLANS[0].limits,
      followersCount: Number(followersResult[0]?.count ?? 0),
      followingCount: Number(followingResult[0]?.count ?? 0),
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

const AVAILABLE_BADGES = [
  { id: "early-adopter", name: "Early Adopter", description: "Joined during the launch phase", icon: "🚀" },
  { id: "streak-master", name: "Streak Master", description: "Maintained a 7-day streak", icon: "🔥" },
  { id: "first-win", name: "First Win", description: "Won your first giveaway", icon: "🏆" },
  { id: "social-butterfly", name: "Social Butterfly", description: "Referred 5 friends", icon: "🦋" },
  { id: "partner-pro", name: "Partner Pro", description: "Completed 10 partner tasks", icon: "⭐" },
  { id: "community-hero", name: "Community Hero", description: "Active community contributor", icon: "🛡️" },
  { id: "lucky-charm", name: "Lucky Charm", description: "Won 3 giveaways", icon: "🍀" },
  { id: "mega-streak", name: "Mega Streak", description: "Maintained a 30-day streak", icon: "💎" },
];

router.put("/users/me/profile", async (req, res) => {
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

    const { bio, avatarUrl, profileSlug, isPublic, selectedBadge, fullName, phone, city } = req.body;

    if (profileSlug !== undefined) {
      const slug = profileSlug.toLowerCase().replace(/[^a-z0-9-]/g, "").slice(0, 30);
      if (slug.length < 3) {
        return res.status(400).json({ error: "Profile slug must be at least 3 characters" });
      }
      const [existing] = await db.select().from(usersTable)
        .where(and(eq(usersTable.profileSlug, slug), sql`${usersTable.id} != ${session.userId}`)).limit(1);
      if (existing) {
        return res.status(400).json({ error: "This profile link is already taken" });
      }
    }

    const updateData: any = {};
    if (fullName !== undefined) updateData.fullName = fullName.trim().slice(0, 80);
    if (phone !== undefined) updateData.phone = phone.trim().slice(0, 20) || null;
    if (city !== undefined) updateData.city = city.trim().slice(0, 50) || null;
    if (bio !== undefined) updateData.bio = bio.slice(0, 200);
    if (avatarUrl !== undefined) updateData.avatarUrl = avatarUrl;
    if (profileSlug !== undefined) updateData.profileSlug = profileSlug.toLowerCase().replace(/[^a-z0-9-]/g, "").slice(0, 30);
    if (isPublic !== undefined) updateData.isPublic = Boolean(isPublic);
    if (selectedBadge !== undefined) {
      if (selectedBadge === null || selectedBadge === "") {
        updateData.selectedBadge = null;
      } else {
        const [hasBadge] = await db.select().from(userBadgesTable)
          .where(and(eq(userBadgesTable.userId, session.userId), eq(userBadgesTable.badgeId, selectedBadge))).limit(1);
        if (!hasBadge) {
          return res.status(400).json({ error: "You haven't earned this badge yet" });
        }
        updateData.selectedBadge = selectedBadge;
      }
    }

    const [updated] = await db.update(usersTable).set(updateData).where(eq(usersTable.id, session.userId)).returning();
    const badges = await db.select().from(userBadgesTable).where(eq(userBadgesTable.userId, session.userId));

    return res.json({
      id: updated.id,
      fullName: updated.fullName,
      bio: updated.bio,
      avatarUrl: updated.avatarUrl,
      profileSlug: updated.profileSlug,
      isPublic: updated.isPublic,
      isVerified: updated.isVerified,
      selectedBadge: updated.selectedBadge,
      badges: badges.map(b => b.badgeId),
    });
  } catch (err) {
    console.error("Profile update error:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

router.put("/users/me/change-password", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) return res.status(401).json({ error: "Not authenticated" });
    const token = authHeader.substring(7);
    const [session] = await db.select().from(userSessionsTable).where(eq(userSessionsTable.token, token)).limit(1);
    if (!session || new Date(session.expiresAt) < new Date()) return res.status(401).json({ error: "Session expired" });

    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) return res.status(400).json({ error: "Both fields are required" });
    if (newPassword.length < 6) return res.status(400).json({ error: "New password must be at least 6 characters" });

    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, session.userId)).limit(1);
    if (!user) return res.status(404).json({ error: "User not found" });
    const valid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!valid) return res.status(400).json({ error: "Current password is incorrect" });

    const newHash = await bcrypt.hash(newPassword, 10);
    await db.update(usersTable).set({ passwordHash: newHash }).where(eq(usersTable.id, session.userId));
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: "Server error" });
  }
});

router.get("/users/profile/:slug", async (req, res) => {
  try {
    const { slug } = req.params;
    const [user] = await db.select().from(usersTable).where(eq(usersTable.profileSlug, slug)).limit(1);

    if (!user || !user.isPublic) {
      return res.status(404).json({ error: "Profile not found" });
    }

    const authHeader = req.headers.authorization;
    let viewerId: number | null = null;
    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.substring(7);
      const [session] = await db.select().from(userSessionsTable).where(eq(userSessionsTable.token, token)).limit(1);
      if (session && new Date(session.expiresAt) > new Date()) {
        viewerId = session.userId;
      }
    }

    const [badges, entries, followersResult, followingResult] = await Promise.all([
      db.select().from(userBadgesTable).where(eq(userBadgesTable.userId, user.id)),
      db.select().from(giveawayEntriesTable).where(eq(giveawayEntriesTable.userId, user.id)),
      db.select({ count: count() }).from(userFollowsTable).where(eq(userFollowsTable.followingId, user.id)),
      db.select({ count: count() }).from(userFollowsTable).where(eq(userFollowsTable.followerId, user.id)),
    ]);

    let isFollowing = false;
    let followsYou = false;
    if (viewerId && viewerId !== user.id) {
      const [existingFollow, reverseFollow] = await Promise.all([
        db.select().from(userFollowsTable)
          .where(and(eq(userFollowsTable.followerId, viewerId), eq(userFollowsTable.followingId, user.id)))
          .limit(1),
        db.select().from(userFollowsTable)
          .where(and(eq(userFollowsTable.followerId, user.id), eq(userFollowsTable.followingId, viewerId)))
          .limit(1),
      ]);
      isFollowing = existingFollow.length > 0;
      followsYou = reverseFollow.length > 0;
    }

    const totalEntries = entries.reduce((sum, e) => sum + (e.entryCount || 0), 0);
    const contestsWithDetails = await db
      .select({ contestId: giveawayEntriesTable.contestId, entryCount: giveawayEntriesTable.entryCount, createdAt: giveawayEntriesTable.createdAt })
      .from(giveawayEntriesTable)
      .where(eq(giveawayEntriesTable.userId, user.id))
      .limit(100);

    const tier = getActiveTier(user);
    const memberSinceDate = new Date(user.createdAt ?? Date.now());
    const daysSinceMember = Math.floor((Date.now() - memberSinceDate.getTime()) / (1000 * 60 * 60 * 24));

    const toDateStr = (d: Date) =>
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

    const activityDates: string[] = contestsWithDetails
      .filter(e => e.createdAt)
      .map(e => toDateStr(new Date(e.createdAt!)));

    return res.json({
      fullName: user.fullName,
      bio: user.bio,
      avatarUrl: user.avatarUrl,
      isVerified: user.isVerified,
      selectedBadge: user.selectedBadge,
      badges: badges.map(b => b.badgeId),
      membershipTier: tier,
      city: user.city ?? null,
      followersCount: Number(followersResult[0]?.count ?? 0),
      followingCount: Number(followingResult[0]?.count ?? 0),
      isFollowing,
      followsYou,
      isOwnProfile: viewerId === user.id,
      stats: {
        entries: totalEntries,
        contestsJoined: entries.length,
        badgesEarned: badges.length,
        daysActive: daysSinceMember,
      },
      activityDates,
      recentContests: contestsWithDetails.slice(0, 6).map(e => ({
        contestId: e.contestId,
        entries: e.entryCount,
      })),
      memberSince: user.createdAt,
      profileSlug: user.profileSlug,
    });
  } catch (err) {
    console.error("Public profile error:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

router.post("/users/profile/:slug/follow", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) return res.status(401).json({ error: "Not authenticated" });
    const token = authHeader.substring(7);
    const [session] = await db.select().from(userSessionsTable).where(eq(userSessionsTable.token, token)).limit(1);
    if (!session || new Date(session.expiresAt) < new Date()) return res.status(401).json({ error: "Session expired" });

    const { slug } = req.params;
    const [target] = await db.select().from(usersTable).where(eq(usersTable.profileSlug, slug)).limit(1);
    if (!target) return res.status(404).json({ error: "User not found" });
    if (target.id === session.userId) return res.status(400).json({ error: "Cannot follow yourself" });

    const [existing] = await db.select().from(userFollowsTable)
      .where(and(eq(userFollowsTable.followerId, session.userId), eq(userFollowsTable.followingId, target.id)))
      .limit(1);
    if (existing) return res.json({ success: true, action: "already_following" });

    await db.insert(userFollowsTable).values({ followerId: session.userId, followingId: target.id });

    // Notify the user who got followed
    try {
      const [follower] = await db.select().from(usersTable).where(eq(usersTable.id, session.userId)).limit(1);
      if (follower) {
        await db.insert(notificationsTable).values({
          userId: target.id,
          type: "follow",
          icon: "user-plus",
          title: "New follower",
          body: `${follower.fullName} started following you`,
          data: { followerSlug: follower.profileSlug, followerName: follower.fullName, followerId: follower.id },
        });
      }
    } catch (e) { console.error("Follow notification error:", e); }

    return res.json({ success: true, action: "followed" });
  } catch (err) {
    console.error("Follow error:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

/* ─── List followers / following / suggestions ───────────────────────── */
async function getViewerId(req: any): Promise<number | null> {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) return null;
  const token = authHeader.substring(7);
  const [session] = await db.select().from(userSessionsTable).where(eq(userSessionsTable.token, token)).limit(1);
  if (!session || new Date(session.expiresAt) < new Date()) return null;
  return session.userId;
}

async function decorateUsers(rows: any[], viewerId: number | null) {
  if (rows.length === 0) return [];
  const ids = rows.map(r => r.id);
  let followingIds = new Set<number>();
  if (viewerId) {
    const myFollows = await db.select({ id: userFollowsTable.followingId })
      .from(userFollowsTable)
      .where(and(eq(userFollowsTable.followerId, viewerId), inArray(userFollowsTable.followingId, ids)));
    followingIds = new Set(myFollows.map(f => f.id));
  }
  // followers count for each
  const counts = await db
    .select({ id: userFollowsTable.followingId, c: count() })
    .from(userFollowsTable)
    .where(inArray(userFollowsTable.followingId, ids))
    .groupBy(userFollowsTable.followingId);
  const countMap = new Map(counts.map(c => [c.id, Number(c.c)]));
  return rows.map(u => ({
    id: u.id,
    fullName: u.fullName,
    profileSlug: u.profileSlug,
    city: u.city,
    isVerified: u.isVerified,
    membershipTier: getActiveTier(u),
    selectedBadge: u.selectedBadge,
    followersCount: countMap.get(u.id) ?? 0,
    isFollowing: followingIds.has(u.id),
    isSelf: viewerId === u.id,
  }));
}

router.get("/users/profile/:slug/followers", async (req, res) => {
  try {
    const { slug } = req.params;
    const limit = Math.min(50, Math.max(1, parseInt((req.query.limit as string) || "20")));
    const offset = Math.max(0, parseInt((req.query.offset as string) || "0"));
    const [target] = await db.select().from(usersTable).where(eq(usersTable.profileSlug, slug)).limit(1);
    if (!target) return res.status(404).json({ error: "User not found" });
    const viewerId = await getViewerId(req);

    const rows = await db
      .select({
        id: usersTable.id, fullName: usersTable.fullName, profileSlug: usersTable.profileSlug,
        city: usersTable.city, isVerified: usersTable.isVerified, selectedBadge: usersTable.selectedBadge,
        membershipTier: usersTable.membershipTier, membershipExpiresAt: usersTable.membershipExpiresAt,
        createdAt: userFollowsTable.createdAt,
      })
      .from(userFollowsTable)
      .innerJoin(usersTable, eq(usersTable.id, userFollowsTable.followerId))
      .where(eq(userFollowsTable.followingId, target.id))
      .orderBy(desc(userFollowsTable.createdAt))
      .limit(limit).offset(offset);

    const [{ total }] = await db.select({ total: count() }).from(userFollowsTable)
      .where(eq(userFollowsTable.followingId, target.id));

    const users = await decorateUsers(rows, viewerId);
    return res.json({ users, total: Number(total), limit, offset });
  } catch (err) {
    console.error("List followers error:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

router.get("/users/profile/:slug/following", async (req, res) => {
  try {
    const { slug } = req.params;
    const limit = Math.min(50, Math.max(1, parseInt((req.query.limit as string) || "20")));
    const offset = Math.max(0, parseInt((req.query.offset as string) || "0"));
    const [target] = await db.select().from(usersTable).where(eq(usersTable.profileSlug, slug)).limit(1);
    if (!target) return res.status(404).json({ error: "User not found" });
    const viewerId = await getViewerId(req);

    const rows = await db
      .select({
        id: usersTable.id, fullName: usersTable.fullName, profileSlug: usersTable.profileSlug,
        city: usersTable.city, isVerified: usersTable.isVerified, selectedBadge: usersTable.selectedBadge,
        membershipTier: usersTable.membershipTier, membershipExpiresAt: usersTable.membershipExpiresAt,
        createdAt: userFollowsTable.createdAt,
      })
      .from(userFollowsTable)
      .innerJoin(usersTable, eq(usersTable.id, userFollowsTable.followingId))
      .where(eq(userFollowsTable.followerId, target.id))
      .orderBy(desc(userFollowsTable.createdAt))
      .limit(limit).offset(offset);

    const [{ total }] = await db.select({ total: count() }).from(userFollowsTable)
      .where(eq(userFollowsTable.followerId, target.id));

    const users = await decorateUsers(rows, viewerId);
    return res.json({ users, total: Number(total), limit, offset });
  } catch (err) {
    console.error("List following error:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

/* Suggested users — top by follower count, excluding self & those already followed */
router.get("/users/suggestions", async (req, res) => {
  try {
    const viewerId = await getViewerId(req);
    const limit = Math.min(20, Math.max(1, parseInt((req.query.limit as string) || "8")));

    let excludeIds: number[] = [];
    if (viewerId) {
      const myFollows = await db.select({ id: userFollowsTable.followingId })
        .from(userFollowsTable)
        .where(eq(userFollowsTable.followerId, viewerId));
      excludeIds = [viewerId, ...myFollows.map(f => f.id)];
    }

    // top users by follower count, must be public
    const topRows = await db
      .select({
        id: usersTable.id, fullName: usersTable.fullName, profileSlug: usersTable.profileSlug,
        city: usersTable.city, isVerified: usersTable.isVerified, selectedBadge: usersTable.selectedBadge,
        membershipTier: usersTable.membershipTier, membershipExpiresAt: usersTable.membershipExpiresAt,
        followers: count(userFollowsTable.id),
      })
      .from(usersTable)
      .leftJoin(userFollowsTable, eq(userFollowsTable.followingId, usersTable.id))
      .where(
        excludeIds.length > 0
          ? and(eq(usersTable.isPublic, true), notInArray(usersTable.id, excludeIds))
          : eq(usersTable.isPublic, true)
      )
      .groupBy(usersTable.id)
      .orderBy(desc(count(userFollowsTable.id)), desc(usersTable.createdAt))
      .limit(limit);

    const users = topRows.map(u => ({
      id: u.id,
      fullName: u.fullName,
      profileSlug: u.profileSlug,
      city: u.city,
      isVerified: u.isVerified,
      selectedBadge: u.selectedBadge,
      membershipTier: getActiveTier(u as any),
      followersCount: Number(u.followers ?? 0),
      isFollowing: false,
      isSelf: false,
    }));

    return res.json({ users });
  } catch (err) {
    console.error("Suggestions error:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

router.delete("/users/profile/:slug/follow", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) return res.status(401).json({ error: "Not authenticated" });
    const token = authHeader.substring(7);
    const [session] = await db.select().from(userSessionsTable).where(eq(userSessionsTable.token, token)).limit(1);
    if (!session || new Date(session.expiresAt) < new Date()) return res.status(401).json({ error: "Session expired" });

    const { slug } = req.params;
    const [target] = await db.select().from(usersTable).where(eq(usersTable.profileSlug, slug)).limit(1);
    if (!target) return res.status(404).json({ error: "User not found" });

    await db.delete(userFollowsTable)
      .where(and(eq(userFollowsTable.followerId, session.userId), eq(userFollowsTable.followingId, target.id)));
    return res.json({ success: true, action: "unfollowed" });
  } catch (err) {
    console.error("Unfollow error:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

router.get("/users/me/badges", async (req, res) => {
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

    const earned = await db.select().from(userBadgesTable).where(eq(userBadgesTable.userId, session.userId));
    const earnedIds = earned.map(b => b.badgeId);

    return res.json({
      available: AVAILABLE_BADGES,
      earned: earnedIds,
    });
  } catch (err) {
    console.error("Badges error:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

router.post("/membership/purchase", async (req, res) => {
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

    const { planId } = req.body;
    const plan = MEMBERSHIP_PLANS.find(p => p.id === planId);
    if (!plan || plan.id === "free") {
      return res.status(400).json({ error: "Invalid plan" });
    }

    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    const isVerified = planId === "gold" || planId === "black";

    const [updated] = await db.update(usersTable).set({
      membershipTier: planId,
      membershipExpiresAt: expiresAt,
      isVerified,
    }).where(eq(usersTable.id, session.userId)).returning();

    if (isVerified) {
      const [existingBadge] = await db.select().from(userBadgesTable)
        .where(and(eq(userBadgesTable.userId, session.userId), eq(userBadgesTable.badgeId, "early-adopter"))).limit(1);
      if (!existingBadge) {
        await db.insert(userBadgesTable).values({ userId: session.userId, badgeId: "early-adopter" });
      }
    }

    return res.json({
      success: true,
      membershipTier: planId,
      isVerified,
      expiresAt,
    });
  } catch (err) {
    console.error("Membership purchase error:", err);
    return res.status(500).json({ error: "Server error" });
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
