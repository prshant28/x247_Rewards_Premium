import { pgTable, text, serial, timestamp, boolean, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const partnersTable = pgTable("partners", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  tagline: text("tagline").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull().default("Registration"),
  registrationUrl: text("registration_url").notNull(),
  accent: text("accent").notNull().default("navy"),
  badge: text("badge"),
  badgeSecondary: text("badge_secondary"),
  isActive: boolean("is_active").notNull().default(false),
  isRequired: boolean("is_required").notNull().default(false),
  entryPoints: integer("entry_points").notNull().default(1),
  whatYouGet: text("what_you_get"),
  sortOrder: serial("sort_order"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertPartnerSchema = createInsertSchema(partnersTable).omit({ id: true, createdAt: true, updatedAt: true, sortOrder: true });
export type InsertPartner = z.infer<typeof insertPartnerSchema>;
export type Partner = typeof partnersTable.$inferSelect;
