import { pgTable, text, serial, timestamp, integer, boolean, json } from "drizzle-orm/pg-core";
import { usersTable } from "./users";

export const notificationsTable = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => usersTable.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  icon: text("icon").notNull().default("bell"),
  title: text("title").notNull(),
  body: text("body").notNull(),
  read: boolean("read").notNull().default(false),
  data: json("data"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const pushSubscriptionsTable = pgTable("push_subscriptions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  endpoint: text("endpoint").notNull(),
  p256dh: text("p256dh").notNull(),
  auth: text("auth").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const notificationPreferencesTable = pgTable("notification_preferences", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }).unique(),
  contestAlerts: boolean("contest_alerts").notNull().default(true),
  winnerAnnouncements: boolean("winner_announcements").notNull().default(true),
  pushEnabled: boolean("push_enabled").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Notification = typeof notificationsTable.$inferSelect;
export type PushSubscription = typeof pushSubscriptionsTable.$inferSelect;
export type NotificationPreference = typeof notificationPreferencesTable.$inferSelect;
