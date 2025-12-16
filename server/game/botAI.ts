import type { Card, HandType, BotDifficulty, GameRoom } from "@shared/types/game";
import { detectHandType, canBeatHand, sortCards, getHighestCard, has3ofDiamonds, includesCard } from "./gameEngine";

interface BotDecision {
  action: "play" | "pass";
  cards: Card[];
}

export function makeBotDecision(
  room: GameRoom,
  botId: string,
  difficulty: BotDifficulty
): BotDecision {
  const bot = room.players.find(p => p.id === botId);
  if (!bot) return { action: "pass", cards: [] };

  const myCards = sortCards(bot.cards);
  
  if (room.isHighestRuleActive && room.highestRuleTargetId === botId) {
    const highest = getHighestCard(myCards);
    return { action: "play", cards: [highest] };
  }

  if (!room.lastPlayedHand) {
    if (has3ofDiamonds(myCards)) {
      const threeOfDiamonds = myCards.find(c => c.rank === "3" && c.suit === "diamonds")!;
      return { action: "play", cards: [threeOfDiamonds] };
    }
    const lowestCard = myCards[0];
    return { action: "play", cards: [lowestCard] };
  }

  const requiredType = room.currentHandType;
  if (!requiredType) return { action: "pass", cards: [] };

  switch (difficulty) {
    case "easy":
      return easyBotStrategy(myCards, room.lastPlayedHand.cards, requiredType);
    case "medium":
      return mediumBotStrategy(myCards, room.lastPlayedHand.cards, requiredType);
    case "hard":
      return hardBotStrategy(myCards, room.lastPlayedHand.cards, requiredType, room);
    default:
      return { action: "pass", cards: [] };
  }
}

function easyBotStrategy(myCards: Card[], lastPlayed: Card[], requiredType: HandType): BotDecision {
  const validHands = findAllValidHands(myCards, lastPlayed, requiredType);
  
  if (validHands.length === 0) {
    return { action: "pass", cards: [] };
  }

  if (Math.random() < 0.3) {
    return { action: "pass", cards: [] };
  }

  const randomIndex = Math.floor(Math.random() * validHands.length);
  return { action: "play", cards: validHands[randomIndex] };
}

function mediumBotStrategy(myCards: Card[], lastPlayed: Card[], requiredType: HandType): BotDecision {
  const validHands = findAllValidHands(myCards, lastPlayed, requiredType);
  
  if (validHands.length === 0) {
    return { action: "pass", cards: [] };
  }

  validHands.sort((a, b) => handStrength(a) - handStrength(b));
  return { action: "play", cards: validHands[0] };
}

function hardBotStrategy(myCards: Card[], lastPlayed: Card[], requiredType: HandType, room: GameRoom): BotDecision {
  const validHands = findAllValidHands(myCards, lastPlayed, requiredType);
  
  if (validHands.length === 0) {
    return { action: "pass", cards: [] };
  }

  const minCards = Math.min(...room.players.map(p => p.cardCount));
  const shouldPlayAggressive = myCards.length <= 3 || minCards <= 2;
  
  validHands.sort((a, b) => handStrength(a) - handStrength(b));
  
  if (shouldPlayAggressive) {
    const strongHands = validHands.filter(h => handStrength(h) > handStrength(lastPlayed) * 1.5);
    if (strongHands.length > 0) {
      return { action: "play", cards: strongHands[strongHands.length - 1] };
    }
  }

  return { action: "play", cards: validHands[0] };
}

function findAllValidHands(myCards: Card[], lastPlayed: Card[], requiredType: HandType): Card[][] {
  const validHands: Card[][] = [];
  const cardCount = lastPlayed.length;

  if (requiredType === "single") {
    for (const card of myCards) {
      if (canBeatHand([card], lastPlayed, requiredType)) {
        validHands.push([card]);
      }
    }
  } else if (requiredType === "double") {
    const pairs = findPairs(myCards);
    for (const pair of pairs) {
      if (canBeatHand(pair, lastPlayed, requiredType)) {
        validHands.push(pair);
      }
    }
  } else if (requiredType === "triple") {
    const triples = findTriples(myCards);
    for (const triple of triples) {
      if (canBeatHand(triple, lastPlayed, requiredType)) {
        validHands.push(triple);
      }
    }
  } else {
    const fiveCardHands = find5CardHands(myCards, requiredType);
    for (const hand of fiveCardHands) {
      if (canBeatHand(hand, lastPlayed, requiredType)) {
        validHands.push(hand);
      }
    }
  }

  return validHands;
}

function findPairs(cards: Card[]): Card[][] {
  const pairs: Card[][] = [];
  const byRank = groupByRank(cards);
  
  for (const [rank, group] of Object.entries(byRank)) {
    if (group.length >= 2) {
      for (let i = 0; i < group.length - 1; i++) {
        for (let j = i + 1; j < group.length; j++) {
          pairs.push([group[i], group[j]]);
        }
      }
    }
  }
  
  return pairs;
}

function findTriples(cards: Card[]): Card[][] {
  const triples: Card[][] = [];
  const byRank = groupByRank(cards);
  
  for (const [rank, group] of Object.entries(byRank)) {
    if (group.length >= 3) {
      for (let i = 0; i < group.length - 2; i++) {
        for (let j = i + 1; j < group.length - 1; j++) {
          for (let k = j + 1; k < group.length; k++) {
            triples.push([group[i], group[j], group[k]]);
          }
        }
      }
    }
  }
  
  return triples;
}

function find5CardHands(cards: Card[], requiredType: HandType): Card[][] {
  const hands: Card[][] = [];
  
  if (cards.length < 5) return hands;

  for (let i = 0; i < cards.length - 4; i++) {
    for (let j = i + 1; j < cards.length - 3; j++) {
      for (let k = j + 1; k < cards.length - 2; k++) {
        for (let l = k + 1; l < cards.length - 1; l++) {
          for (let m = l + 1; m < cards.length; m++) {
            const combo = [cards[i], cards[j], cards[k], cards[l], cards[m]];
            const handType = detectHandType(combo);
            if (handType === requiredType) {
              hands.push(combo);
            }
          }
        }
      }
    }
  }
  
  return hands;
}

function groupByRank(cards: Card[]): Record<string, Card[]> {
  const groups: Record<string, Card[]> = {};
  for (const card of cards) {
    if (!groups[card.rank]) groups[card.rank] = [];
    groups[card.rank].push(card);
  }
  return groups;
}

function handStrength(cards: Card[]): number {
  if (cards.length === 0) return 0;
  
  let strength = 0;
  for (const card of cards) {
    strength += (cards[0].rank === "2" ? 1000 : 0);
    strength += parseInt(String(cards[0].rank)) || 
      (cards[0].rank === "J" ? 11 : cards[0].rank === "Q" ? 12 : cards[0].rank === "K" ? 13 : cards[0].rank === "A" ? 14 : 15);
  }
  
  return strength;
}
