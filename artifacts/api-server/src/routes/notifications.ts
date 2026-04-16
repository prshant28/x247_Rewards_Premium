import { Router } from "express";
import { db } from "@workspace/db";
import { notificationsTable, pushSubscriptionsTable, notificationPreferencesTable, userSessionsTable } from "@workspace/db";
import { eq, desc, and } from "drizzle-orm";
import { getVapidPublicKey } from "../lib/notifications";

const router = Router();

async function getAuthUserId(req: any): Promise<number | null> {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) return null;
  const token = authHeader.substring(7);
  const [session] = await db.select().from(userSessionsTable).where(eq(userSessionsTable.token, token)).limit(1);
  if (!session || new Date(session.expiresAt) < new Date()) return null;
  return session.userId;
}

router.get("/notifications/vapid-key", (_req, res) => {
  return res.json({ publicKey: getVapidPublicKey() });
});

router.get("/notifications", async (req, res) => {
  try {
    const userId = await getAuthUserId(req);
    if (!userId) return res.status(401).json({ error: "Not authenticated" });

    const notifications = await db.select().from(notificationsTable)
      .where(eq(notificationsTable.userId, userId))
      .orderBy(desc(notificationsTable.createdAt))
      .limit(50);

    return res.json(notifications);
  } catch (err) {
    console.error("Notifications list error:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

router.post("/notifications/read/:id", async (req, res) => {
  try {
    const userId = await getAuthUserId(req);
    if (!userId) return res.status(401).json({ error: "Not authenticated" });

    const id = Number(req.params.id);
    await db.update(notificationsTable)
      .set({ read: true })
      .where(and(eq(notificationsTable.id, id), eq(notificationsTable.userId, userId)));

    return res.json({ success: true });
  } catch (err) {
    console.error("Notification read error:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

router.post("/notifications/read-all", async (req, res) => {
  try {
    const userId = await getAuthUserId(req);
    if (!userId) return res.status(401).json({ error: "Not authenticated" });

    await db.update(notificationsTable)
      .set({ read: true })
      .where(eq(notificationsTable.userId, userId));

    return res.json({ success: true });
  } catch (err) {
    console.error("Notification read-all error:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

router.post("/notifications/subscribe", async (req, res) => {
  try {
    const userId = await getAuthUserId(req);
    if (!userId) return res.status(401).json({ error: "Not authenticated" });

    const { endpoint, keys } = req.body;
    if (!endpoint || !keys?.p256dh || !keys?.auth) {
      return res.status(400).json({ error: "Invalid subscription data" });
    }

    const existing = await db.select().from(pushSubscriptionsTable)
      .where(and(
        eq(pushSubscriptionsTable.userId, userId),
        eq(pushSubscriptionsTable.endpoint, endpoint)
      )).limit(1);

    if (existing.length > 0) {
      await db.update(pushSubscriptionsTable)
        .set({ p256dh: keys.p256dh, auth: keys.auth })
        .where(eq(pushSubscriptionsTable.id, existing[0].id));
    } else {
      await db.insert(pushSubscriptionsTable).values({
        userId,
        endpoint,
        p256dh: keys.p256dh,
        auth: keys.auth,
      });
    }

    await db.insert(notificationPreferencesTable).values({
      userId,
      pushEnabled: true,
    }).onConflictDoUpdate({
      target: notificationPreferencesTable.userId,
      set: { pushEnabled: true },
    });

    return res.json({ success: true });
  } catch (err) {
    console.error("Push subscribe error:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

router.delete("/notifications/subscribe", async (req, res) => {
  try {
    const userId = await getAuthUserId(req);
    if (!userId) return res.status(401).json({ error: "Not authenticated" });

    const { endpoint } = req.body;
    if (endpoint) {
      await db.delete(pushSubscriptionsTable).where(
        and(
          eq(pushSubscriptionsTable.userId, userId),
          eq(pushSubscriptionsTable.endpoint, endpoint)
        )
      );
    } else {
      await db.delete(pushSubscriptionsTable).where(eq(pushSubscriptionsTable.userId, userId));
    }

    await db.insert(notificationPreferencesTable).values({
      userId,
      pushEnabled: false,
    }).onConflictDoUpdate({
      target: notificationPreferencesTable.userId,
      set: { pushEnabled: false },
    });

    return res.json({ success: true });
  } catch (err) {
    console.error("Push unsubscribe error:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

router.get("/notifications/preferences", async (req, res) => {
  try {
    const userId = await getAuthUserId(req);
    if (!userId) return res.status(401).json({ error: "Not authenticated" });

    const [prefs] = await db.select().from(notificationPreferencesTable)
      .where(eq(notificationPreferencesTable.userId, userId)).limit(1);

    return res.json(prefs || {
      contestAlerts: true,
      winnerAnnouncements: true,
      pushEnabled: false,
    });
  } catch (err) {
    console.error("Notification preferences error:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

router.put("/notifications/preferences", async (req, res) => {
  try {
    const userId = await getAuthUserId(req);
    if (!userId) return res.status(401).json({ error: "Not authenticated" });

    const { contestAlerts, winnerAnnouncements, pushEnabled } = req.body;

    const toBool = (v: unknown): boolean | undefined => {
      if (v === true || v === false) return v;
      if (v === undefined) return undefined;
      return undefined;
    };

    const ca = toBool(contestAlerts);
    const wa = toBool(winnerAnnouncements);
    const pe = toBool(pushEnabled);

    if (ca === undefined && wa === undefined && pe === undefined) {
      return res.status(400).json({ error: "Provide boolean values for contestAlerts, winnerAnnouncements, or pushEnabled" });
    }

    const values: any = { userId };
    if (ca !== undefined) values.contestAlerts = ca;
    if (wa !== undefined) values.winnerAnnouncements = wa;
    if (pe !== undefined) values.pushEnabled = pe;

    const setClause: any = {};
    if (ca !== undefined) setClause.contestAlerts = ca;
    if (wa !== undefined) setClause.winnerAnnouncements = wa;
    if (pe !== undefined) setClause.pushEnabled = pe;

    const [result] = await db.insert(notificationPreferencesTable).values(values)
      .onConflictDoUpdate({
        target: notificationPreferencesTable.userId,
        set: setClause,
      }).returning();

    return res.json(result);
  } catch (err) {
    console.error("Notification preferences update error:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

export default router;
