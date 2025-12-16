import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export * from "./models/auth";

export const playerStats = pgTable("player_stats", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  gamesPlayed: integer("games_played").default(0).notNull(),
  gamesWon: integer("games_won").default(0).notNull(),
  gamesLost: integer("games_lost").default(0).notNull(),
  totalPoints: integer("total_points").default(0).notNull(),
  level: integer("level").default(1).notNull(),
  xp: integer("xp").default(0).notNull(),
  cardBack: varchar("card_back").default("classic").notNull(),
  tableTheme: varchar("table_theme").default("red").notNull(),
  avatar: varchar("avatar").default("default").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const gameHistory = pgTable("game_history", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  roomCode: varchar("room_code").notNull(),
  position: integer("position").notNull(),
  playersCount: integer("players_count").default(4).notNull(),
  isWin: boolean("is_win").default(false).notNull(),
  xpEarned: integer("xp_earned").default(0).notNull(),
  gameMode: varchar("game_mode").default("online").notNull(),
  botDifficulty: varchar("bot_difficulty"),
  playedAt: timestamp("played_at").defaultNow(),
});

export const insertPlayerStatsSchema = createInsertSchema(playerStats).omit({ id: true, createdAt: true, updatedAt: true });
export const insertGameHistorySchema = createInsertSchema(gameHistory).omit({ id: true, playedAt: true });

export type InsertPlayerStats = z.infer<typeof insertPlayerStatsSchema>;
export type InsertGameHistory = z.infer<typeof insertGameHistorySchema>;
export type PlayerStats = typeof playerStats.$inferSelect;
export type GameHistory = typeof gameHistory.$inferSelect;
