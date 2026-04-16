import { db } from "@workspace/db";
import { notificationsTable, pushSubscriptionsTable, notificationPreferencesTable, usersTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import webpush from "web-push";

const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY || "";
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || "";

if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    "mailto:admin@x247rewards.com",
    VAPID_PUBLIC_KEY,
    VAPID_PRIVATE_KEY
  );
}

type NotificationType = "contest" | "winner" | "system" | "streak";
type NotifIcon = "trophy" | "gift" | "star" | "bell" | "sparkles";

interface CreateNotificationOptions {
  userId?: number | null;
  type: NotificationType;
  icon: NotifIcon;
  title: string;
  body: string;
  data?: Record<string, unknown>;
}

export async function createNotification(opts: CreateNotificationOptions) {
  const [notification] = await db.insert(notificationsTable).values({
    userId: opts.userId ?? null,
    type: opts.type,
    icon: opts.icon,
    title: opts.title,
    body: opts.body,
    data: opts.data ?? null,
  }).returning();

  if (opts.userId) {
    await sendPushToUser(opts.userId, opts);
  }

  return notification;
}

export async function broadcastNotification(opts: Omit<CreateNotificationOptions, "userId">, preferenceField: "contestAlerts" | "winnerAnnouncements") {
  const users = await db.select({ id: usersTable.id }).from(usersTable);

  for (const user of users) {
    const [pref] = await db.select().from(notificationPreferencesTable)
      .where(eq(notificationPreferencesTable.userId, user.id)).limit(1);

    if (pref && !pref[preferenceField]) continue;

    await db.insert(notificationsTable).values({
      userId: user.id,
      type: opts.type,
      icon: opts.icon,
      title: opts.title,
      body: opts.body,
      data: opts.data ?? null,
    });
  }

  await broadcastPush(opts, preferenceField);
}

async function sendPushToUser(userId: number, payload: { title: string; body: string; data?: Record<string, unknown> }) {
  if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) return;

  const subscriptions = await db.select().from(pushSubscriptionsTable)
    .where(eq(pushSubscriptionsTable.userId, userId));

  for (const sub of subscriptions) {
    try {
      await webpush.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: { p256dh: sub.p256dh, auth: sub.auth },
        },
        JSON.stringify({
          title: payload.title,
          body: payload.body,
          data: payload.data || {},
          tag: `x247-${Date.now()}`,
        })
      );
    } catch (err: any) {
      if (err.statusCode === 410 || err.statusCode === 404) {
        await db.delete(pushSubscriptionsTable).where(eq(pushSubscriptionsTable.id, sub.id));
      }
    }
  }
}

async function broadcastPush(payload: { title: string; body: string; data?: Record<string, unknown> }, preferenceField: "contestAlerts" | "winnerAnnouncements") {
  if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) return;

  const subscriptions = await db.select().from(pushSubscriptionsTable);

  for (const sub of subscriptions) {
    const [pref] = await db.select().from(notificationPreferencesTable)
      .where(eq(notificationPreferencesTable.userId, sub.userId)).limit(1);

    if (pref && !pref[preferenceField]) continue;
    if (pref && !pref.pushEnabled) continue;

    try {
      await webpush.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: { p256dh: sub.p256dh, auth: sub.auth },
        },
        JSON.stringify({
          title: payload.title,
          body: payload.body,
          data: payload.data || {},
          tag: `x247-${Date.now()}`,
        })
      );
    } catch (err: any) {
      if (err.statusCode === 410 || err.statusCode === 404) {
        await db.delete(pushSubscriptionsTable).where(eq(pushSubscriptionsTable.id, sub.id));
      }
    }
  }
}

export function getVapidPublicKey() {
  return VAPID_PUBLIC_KEY;
}
