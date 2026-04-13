import { pgTable, text, serial, timestamp, integer } from "drizzle-orm/pg-core";
import { partnersTable } from "./partners";

export const clicksTable = pgTable("clicks", {
  id: serial("id").primaryKey(),
  partnerId: integer("partner_id").notNull().references(() => partnersTable.id, { onDelete: "cascade" }),
  ipHash: text("ip_hash"),
  userAgent: text("user_agent"),
  referrer: text("referrer"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const impressionsTable = pgTable("impressions", {
  id: serial("id").primaryKey(),
  partnerId: integer("partner_id").notNull().references(() => partnersTable.id, { onDelete: "cascade" }),
  ipHash: text("ip_hash"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const formFillsTable = pgTable("form_fills", {
  id: serial("id").primaryKey(),
  partnerId: integer("partner_id").notNull().references(() => partnersTable.id, { onDelete: "cascade" }),
  ipHash: text("ip_hash"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Click = typeof clicksTable.$inferSelect;
export type Impression = typeof impressionsTable.$inferSelect;
export type FormFill = typeof formFillsTable.$inferSelect;
