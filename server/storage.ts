import { playerStats, gameHistory, type PlayerStats, type GameHistory, type InsertPlayerStats, type InsertGameHistory } from "@shared/schema";
import { db } from "./db";
import { eq, desc, sql } from "drizzle-orm";

export interface IStorage {
  getPlayerStats(userId: string): Promise<PlayerStats | undefined>;
  createPlayerStats(stats: InsertPlayerStats): Promise<PlayerStats>;
  updatePlayerStats(userId: string, updates: Partial<InsertPlayerStats>): Promise<PlayerStats | undefined>;
  getOrCreatePlayerStats(userId: string): Promise<PlayerStats>;
  
  getGameHistory(userId: string): Promise<GameHistory[]>;
  addGameHistory(history: InsertGameHistory): Promise<GameHistory>;
  
  getLeaderboard(limit?: number): Promise<PlayerStats[]>;
}

export class DatabaseStorage implements IStorage {
  async getPlayerStats(userId: string): Promise<PlayerStats | undefined> {
    const [stats] = await db.select().from(playerStats).where(eq(playerStats.userId, userId));
    return stats;
  }

  async createPlayerStats(stats: InsertPlayerStats): Promise<PlayerStats> {
    const [created] = await db.insert(playerStats).values(stats).returning();
    return created;
  }

  async updatePlayerStats(userId: string, updates: Partial<InsertPlayerStats>): Promise<PlayerStats | undefined> {
    const [updated] = await db
      .update(playerStats)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(playerStats.userId, userId))
      .returning();
    return updated;
  }

  async getOrCreatePlayerStats(userId: string): Promise<PlayerStats> {
    let stats = await this.getPlayerStats(userId);
    if (!stats) {
      stats = await this.createPlayerStats({
        userId,
        gamesPlayed: 0,
        gamesWon: 0,
        gamesLost: 0,
        totalPoints: 0,
        level: 1,
        xp: 0,
      });
    }
    return stats;
  }

  async getGameHistory(userId: string): Promise<GameHistory[]> {
    return db
      .select()
      .from(gameHistory)
      .where(eq(gameHistory.userId, userId))
      .orderBy(gameHistory.playedAt);
  }

  async addGameHistory(history: InsertGameHistory): Promise<GameHistory> {
    const [created] = await db.insert(gameHistory).values(history).returning();
    return created;
  }

  async getLeaderboard(limit: number = 50): Promise<PlayerStats[]> {
    return db
      .select()
      .from(playerStats)
      .where(sql`${playerStats.gamesPlayed} > 0`)
      .orderBy(desc(playerStats.totalPoints), desc(playerStats.gamesWon))
      .limit(limit);
  }
}

export const storage = new DatabaseStorage();
