import { pgTable, text, serial, timestamp, integer, json, boolean } from "drizzle-orm/pg-core";
import { usersTable } from "./users";

export const referralPartnersTable = pgTable("referral_partners", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  code: text("code").notNull().unique(),
  status: text("status").notNull().default("pending"),
  bio: text("bio"),
  socialMedia: json("social_media").$type<{ whatsapp?: string; discord?: string; twitter?: string; telegram?: string; instagram?: string; youtube?: string }>(),
  motivation: text("motivation"),
  audienceSize: text("audience_size"),
  isVerified: boolean("is_verified").notNull().default(false),
  approvedAt: timestamp("approved_at"),
  rejectedAt: timestamp("rejected_at"),
  rejectionReason: text("rejection_reason"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const referralClicksTable = pgTable("referral_clicks", {
  id: serial("id").primaryKey(),
  referralPartnerId: integer("referral_partner_id").notNull().references(() => referralPartnersTable.id, { onDelete: "cascade" }),
  ipHash: text("ip_hash"),
  userAgent: text("user_agent"),
  source: text("source"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const referralConversionsTable = pgTable("referral_conversions", {
  id: serial("id").primaryKey(),
  referralPartnerId: integer("referral_partner_id").notNull().references(() => referralPartnersTable.id, { onDelete: "cascade" }),
  referredUserId: integer("referred_user_id").references(() => usersTable.id),
  contestId: integer("contest_id"),
  type: text("type").notNull().default("signup"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type ReferralPartner = typeof referralPartnersTable.$inferSelect;
export type ReferralClick = typeof referralClicksTable.$inferSelect;
export type ReferralConversion = typeof referralConversionsTable.$inferSelect;
