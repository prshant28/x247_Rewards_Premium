import { pgTable, text, serial, timestamp, integer } from "drizzle-orm/pg-core";

export const winnersTable = pgTable("winners", {
  id: serial("id").primaryKey(),
  contestId: integer("contest_id").notNull(),
  entryId: integer("entry_id"),
  winnerName: text("winner_name").notNull(),
  winnerCity: text("winner_city"),
  prize: text("prize").notNull(),
  entryCode: text("entry_code"),
  announcedAt: timestamp("announced_at").defaultNow().notNull(),
});

export type Winner = typeof winnersTable.$inferSelect;
