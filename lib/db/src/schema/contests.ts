import { pgTable, text, serial, timestamp, boolean, integer, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const contestsTable = pgTable("contests", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  prize: text("prize").notNull(),
  prizeValue: text("prize_value"),
  maxSpots: integer("max_spots").notNull().default(100),
  status: text("status").notNull().default("active"),
  imageUrl: text("image_url"),
  slug: text("slug").notNull().unique(),
  partnerIds: json("partner_ids").$type<number[]>().default([]),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  endsAt: timestamp("ends_at"),
});

export const insertContestSchema = createInsertSchema(contestsTable).omit({ id: true, createdAt: true });
export type InsertContest = z.infer<typeof insertContestSchema>;
export type Contest = typeof contestsTable.$inferSelect;
