import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, registerAuthRoutes, isAuthenticated } from "./replit_integrations/auth";
import { gameWebSocket } from "./game/websocket";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  try {
    await setupAuth(app);
    registerAuthRoutes(app);
  } catch (error) {
    console.error("Auth setup failed, continuing without auth:", error);
  }

  gameWebSocket.setup(httpServer);

  app.get("/api/stats", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const stats = await storage.getOrCreatePlayerStats(userId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  app.get("/api/history", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const history = await storage.getGameHistory(userId);
      res.json(history);
    } catch (error) {
      console.error("Error fetching history:", error);
      res.status(500).json({ message: "Failed to fetch history" });
    }
  });

  app.patch("/api/preferences", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const { cardBack, tableTheme, avatar } = req.body;
      const updates: any = {};
      
      if (cardBack) updates.cardBack = cardBack;
      if (tableTheme) updates.tableTheme = tableTheme;
      if (avatar) updates.avatar = avatar;
      
      const stats = await storage.updatePlayerStats(userId, updates);
      res.json(stats);
    } catch (error) {
      console.error("Error updating preferences:", error);
      res.status(500).json({ message: "Failed to update preferences" });
    }
  });

  app.get("/api/leaderboard", async (req, res) => {
    try {
      const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
      const leaderboard = await storage.getLeaderboard(limit);
      res.json(leaderboard);
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
      res.status(500).json({ message: "Failed to fetch leaderboard" });
    }
  });

  app.post("/api/game/result", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const { roomCode, position, isWin, xpEarned, gameMode, botDifficulty } = req.body;

      await storage.addGameHistory({
        userId,
        roomCode,
        position,
        playersCount: 4,
        isWin,
        xpEarned,
        gameMode,
        botDifficulty,
      });

      const currentStats = await storage.getOrCreatePlayerStats(userId);
      const newXp = (currentStats.xp || 0) + xpEarned;
      const xpPerLevel = 100;
      const newLevel = Math.floor(newXp / xpPerLevel) + 1;

      await storage.updatePlayerStats(userId, {
        gamesPlayed: (currentStats.gamesPlayed || 0) + 1,
        gamesWon: (currentStats.gamesWon || 0) + (isWin ? 1 : 0),
        gamesLost: (currentStats.gamesLost || 0) + (isWin ? 0 : 1),
        xp: newXp % xpPerLevel,
        level: newLevel,
        totalPoints: (currentStats.totalPoints || 0) + xpEarned,
      });

      res.json({ success: true });
    } catch (error) {
      console.error("Error saving game result:", error);
      res.status(500).json({ message: "Failed to save game result" });
    }
  });

  return httpServer;
}
