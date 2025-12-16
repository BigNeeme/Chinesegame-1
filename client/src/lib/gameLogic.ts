import type { Card, HandType, Rank, Suit } from "@shared/types/game";
import { RANK_ORDER, SUIT_ORDER } from "@shared/types/game";

export function sortCards(cards: Card[]): Card[] {
  return [...cards].sort((a, b) => {
    const rankDiff = RANK_ORDER[a.rank] - RANK_ORDER[b.rank];
    if (rankDiff !== 0) return rankDiff;
    return SUIT_ORDER[a.suit] - SUIT_ORDER[b.suit];
  });
}

export function getCardValue(card: Card): number {
  return RANK_ORDER[card.rank] * 10 + SUIT_ORDER[card.suit];
}

export function compareCards(a: Card, b: Card): number {
  const rankDiff = RANK_ORDER[a.rank] - RANK_ORDER[b.rank];
  if (rankDiff !== 0) return rankDiff;
  return SUIT_ORDER[a.suit] - SUIT_ORDER[b.suit];
}

export function detectHandType(cards: Card[]): HandType | null {
  const count = cards.length;
  
  if (count === 1) return "single";
  if (count === 2 && cards[0].rank === cards[1].rank) return "double";
  if (count === 3 && cards[0].rank === cards[1].rank && cards[1].rank === cards[2].rank) return "triple";
  
  if (count === 5) {
    return detect5CardHand(cards);
  }
  
  return null;
}

function detect5CardHand(cards: Card[]): HandType | null {
  const sorted = sortCards(cards);
  const ranks = sorted.map(c => RANK_ORDER[c.rank]);
  const suits = sorted.map(c => c.suit);
  
  const isFlush = suits.every(s => s === suits[0]);
  const isStraight = checkStraight(ranks);
  const rankCounts = getRankCounts(cards);
  const countValues = Object.values(rankCounts);
  
  if (isStraight && isFlush) {
    const highRank = sorted[4].rank;
    if (highRank === 'A' && sorted[0].rank === '10') {
      return "royal_flush";
    }
    return "straight_flush";
  }
  
  if (countValues.includes(4)) return "four_of_a_kind";
  if (countValues.includes(3) && countValues.includes(2)) return "full_house";
  if (isFlush) return "flush";
  if (isStraight) return "straight";
  
  return null;
}

function checkStraight(ranks: number[]): boolean {
  const sorted = [...ranks].sort((a, b) => a - b);
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i] !== sorted[i - 1] + 1) return false;
  }
  return true;
}

function getRankCounts(cards: Card[]): Record<Rank, number> {
  const counts: Partial<Record<Rank, number>> = {};
  for (const card of cards) {
    counts[card.rank] = (counts[card.rank] || 0) + 1;
  }
  return counts as Record<Rank, number>;
}

export function canBeatHand(currentHand: Card[], previousHand: Card[], handType: HandType): boolean {
  if (currentHand.length !== previousHand.length) return false;
  
  const currentType = detectHandType(currentHand);
  if (currentType !== handType) return false;
  
  if (handType === "single") {
    return compareCards(currentHand[0], previousHand[0]) > 0;
  }
  
  if (handType === "double" || handType === "triple") {
    const currentMax = Math.max(...currentHand.map(getCardValue));
    const prevMax = Math.max(...previousHand.map(getCardValue));
    return currentMax > prevMax;
  }
  
  if (["straight", "flush", "full_house", "four_of_a_kind", "straight_flush", "royal_flush"].includes(handType)) {
    return compare5CardHands(currentHand, previousHand, handType);
  }
  
  return false;
}

function compare5CardHands(current: Card[], previous: Card[], type: HandType): boolean {
  const HAND_RANK: Record<HandType, number> = {
    single: 0, double: 0, triple: 0,
    straight: 1,
    flush: 2,
    full_house: 3,
    four_of_a_kind: 4,
    straight_flush: 5,
    royal_flush: 6,
  };
  
  const currentType = detectHandType(current);
  const prevType = detectHandType(previous);
  
  if (!currentType || !prevType) return false;
  
  if (HAND_RANK[currentType] > HAND_RANK[prevType]) return true;
  if (HAND_RANK[currentType] < HAND_RANK[prevType]) return false;
  
  if (type === "flush") {
    const currentSuit = SUIT_ORDER[current[0].suit];
    const prevSuit = SUIT_ORDER[previous[0].suit];
    return currentSuit > prevSuit;
  }
  
  if (type === "straight" || type === "straight_flush" || type === "royal_flush") {
    const currentSorted = sortCards(current);
    const prevSorted = sortCards(previous);
    const currentHigh = currentSorted[4];
    const prevHigh = prevSorted[4];
    return compareCards(currentHigh, prevHigh) > 0;
  }
  
  if (type === "full_house" || type === "four_of_a_kind") {
    const currentTriple = findMostFrequentRank(current);
    const prevTriple = findMostFrequentRank(previous);
    return RANK_ORDER[currentTriple] > RANK_ORDER[prevTriple];
  }
  
  return false;
}

function findMostFrequentRank(cards: Card[]): Rank {
  const counts = getRankCounts(cards);
  let maxCount = 0;
  let maxRank: Rank = "3";
  for (const [rank, count] of Object.entries(counts)) {
    if (count > maxCount) {
      maxCount = count;
      maxRank = rank as Rank;
    }
  }
  return maxRank;
}

export function getHighestCard(cards: Card[]): Card {
  return cards.reduce((highest, card) => 
    compareCards(card, highest) > 0 ? card : highest
  );
}

export function has3ofDiamonds(cards: Card[]): boolean {
  return cards.some(c => c.rank === "3" && c.suit === "diamonds");
}

export function includesCard(cards: Card[], targetRank: Rank, targetSuit: Suit): boolean {
  return cards.some(c => c.rank === targetRank && c.suit === targetSuit);
}

export function createDeck(): Card[] {
  const suits: Suit[] = ["diamonds", "clubs", "hearts", "spades"];
  const ranks: Rank[] = ["3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A", "2"];
  
  const deck: Card[] = [];
  for (const suit of suits) {
    for (const rank of ranks) {
      deck.push({ rank, suit, id: `${rank}${suit}` });
    }
  }
  return deck;
}

export function shuffleDeck(deck: Card[]): Card[] {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function dealCards(deck: Card[], playerCount: number = 4): Card[][] {
  const hands: Card[][] = Array.from({ length: playerCount }, () => []);
  deck.forEach((card, i) => {
    hands[i % playerCount].push(card);
  });
  return hands.map(hand => sortCards(hand));
}
