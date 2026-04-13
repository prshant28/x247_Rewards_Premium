import { pgTable, text, serial, timestamp, integer } from "drizzle-orm/pg-core";

export const adminUsersTable = pgTable("admin_users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const adminSessionsTable = pgTable("admin_sessions", {
  id: serial("id").primaryKey(),
  token: text("token").notNull().unique(),
  adminId: integer("admin_id").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type AdminUser = typeof adminUsersTable.$inferSelect;
export type AdminSession = typeof adminSessionsTable.$inferSelect;
