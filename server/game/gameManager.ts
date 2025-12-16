import type { GameRoom, Player, Card, BotDifficulty, PlayedHand, HandType } from "@shared/types/game";
import {
  createDeck,
  shuffleDeck,
  dealCards,
  sortCards,
  createGameRoom,
  createPlayer,
  find3ofDiamondsPlayerIndex,
  detectHandType,
  canBeatHand,
  removeCardsFromHand,
  getNextPlayerIndex,
  checkHighestRule,
  getHighestCard,
  has3ofDiamonds,
  includesCard,
} from "./gameEngine";
import { makeBotDecision } from "./botAI";

const POSITIONS: Player["position"][] = ["bottom", "left", "top", "right"];
const BOT_NAMES = ["Alice Bot", "Bob Bot", "Charlie Bot", "Diana Bot"];

type BroadcastCallback = (code: string, room: GameRoom) => void;

class GameManager {
  private rooms: Map<string, GameRoom> = new Map();
  private playerRooms: Map<string, string> = new Map();
  private botTimeouts: Map<string, NodeJS.Timeout> = new Map();
  private broadcastCallback: BroadcastCallback | null = null;

  setBroadcastCallback(callback: BroadcastCallback) {
    this.broadcastCallback = callback;
  }

  private broadcast(code: string, room: GameRoom) {
    if (this.broadcastCallback) {
      this.broadcastCallback(code, room);
    }
  }

  createRoom(hostId: string, hostName: string, gameMode: "online" | "local", botDifficulty: BotDifficulty): GameRoom {
    const room = createGameRoom(hostId, gameMode, botDifficulty);
    const host = createPlayer(hostId, hostName, false, POSITIONS[0]);
    host.isReady = true;
    room.players.push(host);
    
    this.rooms.set(room.code, room);
    this.playerRooms.set(hostId, room.code);
    
    return room;
  }

  joinRoom(code: string, playerId: string, playerName: string): GameRoom | null {
    const room = this.rooms.get(code);
    if (!room || room.state !== "waiting" || room.players.length >= 4) {
      return null;
    }

    const existingPlayer = room.players.find(p => p.id === playerId);
    if (existingPlayer) return room;

    const position = POSITIONS[room.players.length];
    const player = createPlayer(playerId, playerName, false, position);
    player.isReady = true;
    room.players.push(player);
    
    this.playerRooms.set(playerId, room.code);
    
    return room;
  }

  leaveRoom(playerId: string): GameRoom | null {
    const code = this.playerRooms.get(playerId);
    if (!code) return null;

    const room = this.rooms.get(code);
    if (!room) return null;

    room.players = room.players.filter(p => p.id !== playerId);
    this.playerRooms.delete(playerId);

    if (room.players.length === 0) {
      this.rooms.delete(code);
      return null;
    }

    if (room.hostId === playerId && room.players.length > 0) {
      room.hostId = room.players[0].id;
    }

    return room;
  }

  addBot(code: string): GameRoom | null {
    const room = this.rooms.get(code);
    if (!room || room.state !== "waiting" || room.players.length >= 4) {
      return null;
    }

    const botIndex = room.players.filter(p => p.isBot).length;
    const botId = `bot-${Date.now()}-${botIndex}`;
    const botName = BOT_NAMES[botIndex] || `Bot ${botIndex + 1}`;
    const position = POSITIONS[room.players.length];
    
    const bot = createPlayer(botId, botName, true, position, room.botDifficulty);
    room.players.push(bot);

    return room;
  }

  startGame(code: string): GameRoom | null {
    const room = this.rooms.get(code);
    if (!room || room.state !== "waiting" || room.players.length !== 4) {
      return null;
    }

    while (room.players.length < 4) {
      this.addBot(code);
    }

    room.state = "dealing";

    const deck = shuffleDeck(createDeck());
    const hands = dealCards(deck, 4);

    room.players.forEach((player, i) => {
      player.cards = hands[i];
      player.cardCount = hands[i].length;
      player.hasPassed = false;
      player.isCurrentTurn = false;
    });

    const starterIndex = find3ofDiamondsPlayerIndex(room.players);
    room.currentTurnIndex = starterIndex;
    room.roundStarterIndex = starterIndex;
    room.players[starterIndex].isCurrentTurn = true;
    room.turnStartTime = Date.now();
    room.passedPlayers = [];
    room.currentHandType = null;
    room.lastPlayedHand = null;
    room.playedHandsHistory = [];
    room.winnerId = null;
    room.isHighestRuleActive = false;
    room.highestRuleTargetId = null;

    room.state = "playing";

    this.scheduleBotTurnIfNeeded(room);

    return room;
  }

  playCards(code: string, playerId: string, cards: Card[]): { room: GameRoom | null; error?: string } {
    const room = this.rooms.get(code);
    if (!room || room.state !== "playing") {
      return { room: null, error: "Game not in progress" };
    }

    const playerIndex = room.players.findIndex(p => p.id === playerId);
    if (playerIndex === -1 || playerIndex !== room.currentTurnIndex) {
      return { room: null, error: "Not your turn" };
    }

    const player = room.players[playerIndex];
    
    const hasCards = cards.every(c => 
      player.cards.some(pc => pc.id === c.id)
    );
    if (!hasCards) {
      return { room: null, error: "You don't have these cards" };
    }

    const handType = detectHandType(cards);
    if (!handType) {
      return { room: null, error: "Invalid hand type" };
    }

    if (!room.lastPlayedHand) {
      if (has3ofDiamonds(player.cards) && !includesCard(cards, "3", "diamonds")) {
        return { room: null, error: "Must include 3 of Diamonds in first play" };
      }
    } else {
      if (handType !== room.currentHandType) {
        return { room: null, error: `Must play ${room.currentHandType}` };
      }
      if (!canBeatHand(cards, room.lastPlayedHand.cards, room.currentHandType!)) {
        return { room: null, error: "Cards are not strong enough" };
      }
    }

    player.cards = removeCardsFromHand(player.cards, cards);
    player.cardCount = player.cards.length;
    player.isCurrentTurn = false;

    const playedHand = {
      playerId,
      cards,
      handType,
      timestamp: Date.now(),
    };
    room.lastPlayedHand = playedHand;
    room.playedHandsHistory.push(playedHand);
    room.currentHandType = handType;
    room.passedPlayers = [];

    if (player.cardCount === 0) {
      room.state = "finished";
      room.winnerId = playerId;
      this.clearBotTimeout(code);
      return { room };
    }

    this.advanceTurn(room);
    return { room };
  }

  passTurn(code: string, playerId: string): { room: GameRoom | null; error?: string } {
    const room = this.rooms.get(code);
    if (!room || room.state !== "playing") {
      return { room: null, error: "Game not in progress" };
    }

    const playerIndex = room.players.findIndex(p => p.id === playerId);
    if (playerIndex === -1 || playerIndex !== room.currentTurnIndex) {
      return { room: null, error: "Not your turn" };
    }

    const player = room.players[playerIndex];

    if (!room.lastPlayedHand && has3ofDiamonds(player.cards)) {
      return { room: null, error: "Cannot pass - must play 3 of Diamonds" };
    }

    if (room.isHighestRuleActive && room.highestRuleTargetId === playerId) {
      const highest = getHighestCard(player.cards);
      return this.playCards(code, playerId, [highest]);
    }

    player.hasPassed = true;
    player.isCurrentTurn = false;
    room.passedPlayers.push(playerId);

    const activePlayers = room.players.filter(p => !room.passedPlayers.includes(p.id));
    
    if (activePlayers.length === 1) {
      const winnerOfRound = activePlayers[0];
      room.state = "round_reset";
      room.currentHandType = null;
      room.lastPlayedHand = null;
      room.playedHandsHistory = [];
      room.passedPlayers = [];
      room.players.forEach(p => p.hasPassed = false);
      
      const newStarterIndex = room.players.findIndex(p => p.id === winnerOfRound.id);
      room.currentTurnIndex = newStarterIndex;
      room.roundStarterIndex = newStarterIndex;
      room.players[newStarterIndex].isCurrentTurn = true;
      room.turnStartTime = Date.now();
      room.isHighestRuleActive = false;
      room.highestRuleTargetId = null;
      
      room.state = "playing";
      this.scheduleBotTurnIfNeeded(room);
      return { room };
    }

    this.advanceTurn(room);
    return { room };
  }

  private advanceTurn(room: GameRoom) {
    const nextIndex = getNextPlayerIndex(room.currentTurnIndex, room.players, room.passedPlayers);
    room.currentTurnIndex = nextIndex;
    room.players.forEach((p, i) => p.isCurrentTurn = i === nextIndex);
    room.turnStartTime = Date.now();

    const highestCheck = checkHighestRule(room.players, nextIndex);
    room.isHighestRuleActive = highestCheck.isActive;
    room.highestRuleTargetId = highestCheck.targetId;

    this.scheduleBotTurnIfNeeded(room);
  }

  private scheduleBotTurnIfNeeded(room: GameRoom) {
    this.clearBotTimeout(room.code);

    const currentPlayer = room.players[room.currentTurnIndex];
    if (!currentPlayer?.isBot) return;

    const delay = currentPlayer.botDifficulty === "easy" ? 1000 : 
                  currentPlayer.botDifficulty === "medium" ? 1500 : 2000;

    const timeout = setTimeout(() => {
      this.executeBotTurn(room.code, currentPlayer.id);
    }, delay);

    this.botTimeouts.set(room.code, timeout);
  }

  private executeBotTurn(code: string, botId: string) {
    const room = this.rooms.get(code);
    if (!room || room.state !== "playing") return;

    const bot = room.players.find(p => p.id === botId);
    if (!bot || !bot.isBot) return;

    const decision = makeBotDecision(room, botId, bot.botDifficulty!);

    let result;
    if (decision.action === "play" && decision.cards.length > 0) {
      result = this.playCards(code, botId, decision.cards);
    } else {
      result = this.passTurn(code, botId);
    }

    if (result.room) {
      this.broadcast(code, result.room);
    }
  }

  setRoomDifficulty(code: string, difficulty: BotDifficulty): GameRoom | null {
    const room = this.rooms.get(code);
    if (!room || room.state !== "waiting") return null;
    
    room.botDifficulty = difficulty;
    room.players.forEach(p => {
      if (p.isBot) {
        p.botDifficulty = difficulty;
      }
    });
    
    return room;
  }

  setTableTheme(code: string, theme: "classic" | "green" | "blue" | "purple" | "gold"): GameRoom | null {
    const room = this.rooms.get(code);
    if (!room) return null;
    
    room.tableTheme = theme;
    return room;
  }

  private clearBotTimeout(code: string) {
    const existing = this.botTimeouts.get(code);
    if (existing) {
      clearTimeout(existing);
      this.botTimeouts.delete(code);
    }
  }

  getRoom(code: string): GameRoom | null {
    return this.rooms.get(code) || null;
  }

  getRoomByPlayerId(playerId: string): GameRoom | null {
    const code = this.playerRooms.get(playerId);
    return code ? this.rooms.get(code) || null : null;
  }

  getPlayerRoom(playerId: string): string | null {
    return this.playerRooms.get(playerId) || null;
  }

  sanitizeRoomForPlayer(room: GameRoom, playerId: string): GameRoom {
    const sanitized: GameRoom = {
      ...room,
      playedHandsHistory: room.playedHandsHistory?.slice(-5) || [],
      tableTheme: room.tableTheme || "classic",
      players: room.players.map(p => ({
        ...p,
        cards: p.id === playerId ? p.cards : [],
      })),
    };
    return sanitized;
  }
}

export const gameManager = new GameManager();
