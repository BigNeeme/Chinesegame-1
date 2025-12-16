export type Suit = 'diamonds' | 'clubs' | 'hearts' | 'spades';
export type Rank = '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A' | '2';

export interface Card {
  rank: Rank;
  suit: Suit;
  id: string;
}

export type HandType = 'single' | 'double' | 'triple' | 'straight' | 'flush' | 'full_house' | 'four_of_a_kind' | 'straight_flush' | 'royal_flush';

export type GameState = 'waiting' | 'dealing' | 'playing' | 'round_reset' | 'finished';

export type BotDifficulty = 'easy' | 'medium' | 'hard';

export interface Player {
  id: string;
  name: string;
  isBot: boolean;
  isReady: boolean;
  cards: Card[];
  cardCount: number;
  hasPassed: boolean;
  position: 'bottom' | 'left' | 'top' | 'right';
  botDifficulty?: BotDifficulty;
  profileImageUrl?: string;
  isCurrentTurn: boolean;
}

export interface PlayedHand {
  playerId: string;
  cards: Card[];
  handType: HandType;
  timestamp: number;
}

export type TableTheme = 'classic' | 'green' | 'blue' | 'purple' | 'gold';

export interface GameRoom {
  id: string;
  code: string;
  hostId: string;
  players: Player[];
  state: GameState;
  currentTurnIndex: number;
  currentHandType: HandType | null;
  lastPlayedHand: PlayedHand | null;
  playedHandsHistory: PlayedHand[];
  roundStarterIndex: number;
  passedPlayers: string[];
  winnerId: string | null;
  turnTimer: number;
  turnStartTime: number | null;
  isHighestRuleActive: boolean;
  highestRuleTargetId: string | null;
  botDifficulty: BotDifficulty;
  gameMode: 'online' | 'local';
  tableTheme: TableTheme;
}

export interface GameAction {
  type: 'play' | 'pass';
  cards?: Card[];
  playerId: string;
}

export interface WebSocketMessage {
  type: 'join_room' | 'leave_room' | 'start_game' | 'play_cards' | 'pass_turn' | 'ready' | 'game_state' | 'error' | 'player_joined' | 'player_left' | 'game_started' | 'cards_played' | 'turn_passed' | 'round_reset' | 'game_ended' | 'highest_rule' | 'timer_update' | 'create_room' | 'room_created' | 'bot_added';
  payload?: any;
  error?: string;
}

export const RANK_ORDER: Record<Rank, number> = {
  '3': 1, '4': 2, '5': 3, '6': 4, '7': 5, '8': 6, '9': 7, '10': 8,
  'J': 9, 'Q': 10, 'K': 11, 'A': 12, '2': 13
};

export const SUIT_ORDER: Record<Suit, number> = {
  'diamonds': 1, 'clubs': 2, 'hearts': 3, 'spades': 4
};

export const SUIT_SYMBOLS: Record<Suit, string> = {
  'diamonds': '♦', 'clubs': '♣', 'hearts': '♥', 'spades': '♠'
};

export const SUIT_COLORS: Record<Suit, 'red' | 'black'> = {
  'diamonds': 'red', 'clubs': 'black', 'hearts': 'red', 'spades': 'black'
};
