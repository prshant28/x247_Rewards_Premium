import { pgTable, text, serial, timestamp, boolean, integer, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const giveawayEntriesTable = pgTable("giveaway_entries", {
  id: serial("id").primaryKey(),
  fullName: text("full_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  age: integer("age").notNull(),
  city: text("city").notNull(),
  completedPartners: json("completed_partners").$type<number[]>().notNull(),
  screenshotConfirmed: boolean("screenshot_confirmed").notNull().default(false),
  agreedToTerms: boolean("agreed_to_terms").notNull().default(false),
  ipHash: text("ip_hash"),
  entryCount: integer("entry_count").notNull().default(1),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertGiveawayEntrySchema = createInsertSchema(giveawayEntriesTable).omit({ id: true, createdAt: true, ipHash: true, entryCount: true });
export type InsertGiveawayEntry = z.infer<typeof insertGiveawayEntrySchema>;
export type GiveawayEntry = typeof giveawayEntriesTable.$inferSelect;
