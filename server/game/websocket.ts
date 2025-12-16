import { WebSocketServer, WebSocket } from "ws";
import type { Server } from "http";
import type { WebSocketMessage, Card, BotDifficulty } from "@shared/types/game";
import { gameManager } from "./gameManager";

interface ClientInfo {
  id: string;
  name: string;
  ws: WebSocket;
  roomCode: string | null;
}

class GameWebSocketServer {
  private wss: WebSocketServer | null = null;
  private clients: Map<WebSocket, ClientInfo> = new Map();

  setup(server: Server) {
    this.wss = new WebSocketServer({ server, path: "/ws" });

    gameManager.setBroadcastCallback((code, room) => {
      this.clients.forEach((client, ws) => {
        if (client.roomCode === code) {
          this.send(ws, {
            type: "game_state",
            payload: gameManager.sanitizeRoomForPlayer(room, client.id),
          });
        }
      });
      
      if (room.winnerId) {
        this.broadcastToRoom(code, {
          type: "game_ended",
          payload: { winnerId: room.winnerId },
        });
      }
    });

    this.wss.on("connection", (ws: WebSocket) => {
      const clientId = `player-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const clientInfo: ClientInfo = {
        id: clientId,
        name: "Player",
        ws,
        roomCode: null,
      };
      this.clients.set(ws, clientInfo);

      this.send(ws, {
        type: "connected",
        payload: { playerId: clientId },
      });

      ws.on("message", (data) => {
        try {
          const message: WebSocketMessage = JSON.parse(data.toString());
          this.handleMessage(ws, message);
        } catch (e) {
          this.sendError(ws, "Invalid message format");
        }
      });

      ws.on("close", () => {
        const client = this.clients.get(ws);
        if (client?.roomCode) {
          const room = gameManager.leaveRoom(client.id);
          if (room) {
            this.broadcastToRoom(room.code, {
              type: "game_state",
              payload: room,
            });
          }
        }
        this.clients.delete(ws);
      });
    });
  }

  private handleMessage(ws: WebSocket, message: WebSocketMessage) {
    const client = this.clients.get(ws);
    if (!client) return;

    switch (message.type) {
      case "create_room":
        this.handleCreateRoom(ws, client, message.payload);
        break;
      case "join_room":
        this.handleJoinRoom(ws, client, message.payload);
        break;
      case "leave_room":
        this.handleLeaveRoom(ws, client);
        break;
      case "start_game":
        this.handleStartGame(ws, client);
        break;
      case "play_cards":
        this.handlePlayCards(ws, client, message.payload);
        break;
      case "pass_turn":
        this.handlePassTurn(ws, client);
        break;
      case "bot_added":
        this.handleAddBot(ws, client);
        break;
      case "ready":
        this.handleReady(ws, client);
        break;
      case "set_difficulty":
        this.handleSetDifficulty(ws, client, message.payload);
        break;
      case "set_table_theme":
        this.handleSetTableTheme(ws, client, message.payload);
        break;
    }
  }

  private handleCreateRoom(ws: WebSocket, client: ClientInfo, payload: any) {
    const { gameMode, botDifficulty } = payload || {};
    const name = payload?.name || client.name;
    
    client.name = name;
    const room = gameManager.createRoom(client.id, name, gameMode || "online", botDifficulty || "medium");
    client.roomCode = room.code;

    this.send(ws, {
      type: "room_created",
      payload: { code: room.code },
    });

    this.send(ws, {
      type: "game_state",
      payload: gameManager.sanitizeRoomForPlayer(room, client.id),
    });
  }

  private handleJoinRoom(ws: WebSocket, client: ClientInfo, payload: any) {
    const { code, name } = payload || {};
    if (!code) {
      this.sendError(ws, "Room code required");
      return;
    }

    client.name = name || client.name;
    const room = gameManager.joinRoom(code.toUpperCase(), client.id, client.name);
    
    if (!room) {
      this.sendError(ws, "Room not found or full");
      return;
    }

    client.roomCode = room.code;

    this.broadcastToRoom(room.code, {
      type: "player_joined",
      payload: { playerId: client.id, playerName: client.name },
    });

    this.broadcastGameState(room.code);
  }

  private handleLeaveRoom(ws: WebSocket, client: ClientInfo) {
    if (!client.roomCode) return;

    const code = client.roomCode;
    const room = gameManager.leaveRoom(client.id);
    client.roomCode = null;

    if (room) {
      this.broadcastToRoom(code, {
        type: "player_left",
        payload: { playerId: client.id },
      });
      this.broadcastGameState(code);
    }
  }

  private handleStartGame(ws: WebSocket, client: ClientInfo) {
    if (!client.roomCode) {
      this.sendError(ws, "Not in a room");
      return;
    }

    const room = gameManager.getRoom(client.roomCode);
    if (!room) {
      this.sendError(ws, "Room not found");
      return;
    }

    if (room.hostId !== client.id) {
      this.sendError(ws, "Only host can start the game");
      return;
    }

    while (room.players.length < 4) {
      gameManager.addBot(client.roomCode);
    }

    const startedRoom = gameManager.startGame(client.roomCode);
    if (!startedRoom) {
      this.sendError(ws, "Cannot start game");
      return;
    }

    this.broadcastToRoom(client.roomCode, {
      type: "game_started",
    });

    this.broadcastGameState(client.roomCode);
  }

  private handlePlayCards(ws: WebSocket, client: ClientInfo, payload: any) {
    if (!client.roomCode) {
      this.sendError(ws, "Not in a room");
      return;
    }

    const { cards } = payload || {};
    if (!cards || !Array.isArray(cards)) {
      this.sendError(ws, "Cards required");
      return;
    }

    const result = gameManager.playCards(client.roomCode, client.id, cards as Card[]);
    
    if (result.error) {
      this.sendError(ws, result.error);
      return;
    }

    if (result.room) {
      this.broadcastToRoom(client.roomCode, {
        type: "cards_played",
        payload: { playerId: client.id, cards },
      });

      this.broadcastGameState(client.roomCode);

      if (result.room.winnerId) {
        this.broadcastToRoom(client.roomCode, {
          type: "game_ended",
          payload: { winnerId: result.room.winnerId },
        });
      }

      if (result.room.isHighestRuleActive) {
        this.broadcastToRoom(client.roomCode, {
          type: "highest_rule",
          payload: { targetId: result.room.highestRuleTargetId },
        });
      }
    }
  }

  private handlePassTurn(ws: WebSocket, client: ClientInfo) {
    if (!client.roomCode) {
      this.sendError(ws, "Not in a room");
      return;
    }

    const result = gameManager.passTurn(client.roomCode, client.id);
    
    if (result.error) {
      this.sendError(ws, result.error);
      return;
    }

    if (result.room) {
      this.broadcastToRoom(client.roomCode, {
        type: "turn_passed",
        payload: { playerId: client.id },
      });

      this.broadcastGameState(client.roomCode);

      if (result.room.isHighestRuleActive) {
        this.broadcastToRoom(client.roomCode, {
          type: "highest_rule",
          payload: { targetId: result.room.highestRuleTargetId },
        });
      }
    }
  }

  private handleAddBot(ws: WebSocket, client: ClientInfo) {
    if (!client.roomCode) {
      this.sendError(ws, "Not in a room");
      return;
    }

    const room = gameManager.addBot(client.roomCode);
    if (!room) {
      this.sendError(ws, "Cannot add bot");
      return;
    }

    this.broadcastGameState(client.roomCode);
  }

  private handleReady(ws: WebSocket, client: ClientInfo) {
    if (!client.roomCode) return;
    this.broadcastGameState(client.roomCode);
  }

  private handleSetDifficulty(ws: WebSocket, client: ClientInfo, payload: any) {
    if (!client.roomCode) {
      this.sendError(ws, "Not in a room");
      return;
    }

    const { difficulty } = payload || {};
    if (!difficulty) {
      this.sendError(ws, "Difficulty required");
      return;
    }

    const room = gameManager.setRoomDifficulty(client.roomCode, difficulty);
    if (room) {
      this.broadcastGameState(client.roomCode);
    }
  }

  private handleSetTableTheme(ws: WebSocket, client: ClientInfo, payload: any) {
    if (!client.roomCode) {
      this.sendError(ws, "Not in a room");
      return;
    }

    const { theme } = payload || {};
    if (!theme || !["classic", "green", "blue", "purple", "gold"].includes(theme)) {
      this.sendError(ws, "Valid theme required");
      return;
    }

    const room = gameManager.setTableTheme(client.roomCode, theme);
    if (room) {
      this.broadcastGameState(client.roomCode);
    }
  }

  private send(ws: WebSocket, message: WebSocketMessage) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
    }
  }

  private sendError(ws: WebSocket, error: string) {
    this.send(ws, { type: "error", error });
  }

  private broadcastToRoom(code: string, message: WebSocketMessage) {
    this.clients.forEach((client, ws) => {
      if (client.roomCode === code) {
        this.send(ws, message);
      }
    });
  }

  private broadcastGameState(code: string) {
    const room = gameManager.getRoom(code);
    if (!room) return;

    this.clients.forEach((client, ws) => {
      if (client.roomCode === code) {
        this.send(ws, {
          type: "game_state",
          payload: gameManager.sanitizeRoomForPlayer(room, client.id),
        });
      }
    });
  }
}

export const gameWebSocket = new GameWebSocketServer();
