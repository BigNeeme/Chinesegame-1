import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import type { Card, PlayedHand, HandType, Player, TableTheme } from "@shared/types/game";
import { PlayingCard } from "./PlayingCard";
import { OpponentArea } from "./OpponentArea";

interface GameTableProps {
  players: Player[];
  currentPlayerId: string;
  lastPlayedHand: PlayedHand | null;
  playedHandsHistory: PlayedHand[];
  currentHandType: HandType | null;
  isHighestRuleActive: boolean;
  highestRuleTargetId: string | null;
  tableTheme: TableTheme;
}

const THEME_STYLES: Record<TableTheme, { felt: string; rim: string }> = {
  classic: {
    felt: "linear-gradient(145deg, hsl(0 45% 35%) 0%, hsl(0 45% 28%) 50%, hsl(0 45% 22%) 100%)",
    rim: "hsl(0 30% 15%)",
  },
  green: {
    felt: "linear-gradient(145deg, hsl(140 45% 30%) 0%, hsl(140 45% 24%) 50%, hsl(140 45% 18%) 100%)",
    rim: "hsl(140 30% 12%)",
  },
  blue: {
    felt: "linear-gradient(145deg, hsl(210 45% 35%) 0%, hsl(210 45% 28%) 50%, hsl(210 45% 22%) 100%)",
    rim: "hsl(210 30% 15%)",
  },
  purple: {
    felt: "linear-gradient(145deg, hsl(270 40% 35%) 0%, hsl(270 40% 28%) 50%, hsl(270 40% 22%) 100%)",
    rim: "hsl(270 30% 15%)",
  },
  gold: {
    felt: "linear-gradient(145deg, hsl(45 50% 35%) 0%, hsl(45 50% 28%) 50%, hsl(45 45% 22%) 100%)",
    rim: "hsl(45 40% 12%)",
  },
};

const HAND_TYPE_LABELS: Record<HandType, string> = {
  single: "Single",
  double: "Double",
  triple: "Triple",
  straight: "Straight",
  flush: "Flush",
  full_house: "Full House",
  four_of_a_kind: "Four of a Kind",
  straight_flush: "Straight Flush",
  royal_flush: "Royal Flush",
};

export function GameTable({
  players,
  currentPlayerId,
  lastPlayedHand,
  playedHandsHistory,
  currentHandType,
  isHighestRuleActive,
  highestRuleTargetId,
  tableTheme,
}: GameTableProps) {
  const currentPlayer = players.find(p => p.id === currentPlayerId);
  const opponents = players.filter(p => p.id !== currentPlayerId);
  const themeStyle = THEME_STYLES[tableTheme] || THEME_STYLES.classic;

  const getOpponentByPosition = (pos: "top" | "left" | "right") => {
    const positionMap: Record<string, number> = { left: 0, top: 1, right: 2 };
    return opponents[positionMap[pos]];
  };

  const recentHistory = playedHandsHistory.slice(-5);

  return (
    <div className="relative w-full h-full min-h-[500px] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gradient-radial from-transparent via-black/30 to-black/60 pointer-events-none" />
      
      <div 
        className="relative w-full max-w-4xl aspect-[16/10] rounded-[50px] overflow-hidden"
        data-testid="game-table"
        style={{
          boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05)"
        }}
      >
        <div 
          className="absolute inset-0 rounded-[50px]"
          style={{ 
            backgroundColor: themeStyle.rim,
            boxShadow: "inset 0 2px 4px rgba(255,255,255,0.1)"
          }}
        />
        
        <div 
          className="absolute inset-4 rounded-[42px]"
          style={{
            background: themeStyle.felt,
            boxShadow: "inset 0 8px 32px rgba(0,0,0,0.4)"
          }}
        />
        
        <div 
          className="absolute inset-8 rounded-[34px] border border-white/10"
        />

        <div className="absolute inset-0 p-8 flex flex-col">
          <div className="flex justify-center">
            {getOpponentByPosition("top") && (
              <OpponentArea 
                player={getOpponentByPosition("top")!} 
                position="top"
                isHighestTarget={highestRuleTargetId === getOpponentByPosition("top")?.id}
              />
            )}
          </div>

          <div className="flex-1 flex items-center justify-between px-2">
            <div className="flex items-center">
              {getOpponentByPosition("left") && (
                <OpponentArea 
                  player={getOpponentByPosition("left")!} 
                  position="left"
                  isHighestTarget={highestRuleTargetId === getOpponentByPosition("left")?.id}
                />
              )}
            </div>

            <div className="flex-1 flex flex-col items-center justify-center gap-4">
              <div className="relative h-36 w-72" data-testid="played-cards">
                {recentHistory.length > 0 ? (
                  <>
                    {recentHistory.slice(0, -1).map((hand, historyIndex) => (
                      <div
                        key={hand.timestamp}
                        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex gap-0.5 justify-center pointer-events-none"
                        style={{
                          transform: `translate(-50%, calc(-50% + ${(historyIndex - recentHistory.length + 1) * 6}px))`,
                          zIndex: historyIndex,
                          opacity: 0.4 + historyIndex * 0.1,
                        }}
                      >
                        {hand.cards.map((card) => (
                          <div key={card.id} style={{ transform: "scale(0.85)" }}>
                            <PlayingCard card={card} size="md" />
                          </div>
                        ))}
                      </div>
                    ))}
                    
                    {lastPlayedHand && (
                      <motion.div
                        key={lastPlayedHand.timestamp}
                        initial={{ y: 50, opacity: 0, scale: 0.9 }}
                        animate={{ y: 0, opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-3"
                        style={{ zIndex: 10 }}
                      >
                        <div className="flex gap-1 justify-center">
                          {lastPlayedHand.cards.map((card, index) => (
                            <motion.div
                              key={card.id}
                              initial={{ y: 80, opacity: 0, rotate: -5 }}
                              animate={{ y: 0, opacity: 1, rotate: 0 }}
                              transition={{ delay: index * 0.04, duration: 0.25 }}
                            >
                              <PlayingCard card={card} size="lg" />
                            </motion.div>
                          ))}
                        </div>
                        <motion.div
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.15 }}
                          className="text-white text-xs font-semibold bg-black/50 px-4 py-1.5 rounded-full border border-white/20"
                        >
                          {HAND_TYPE_LABELS[lastPlayedHand.handType]}
                        </motion.div>
                      </motion.div>
                    )}
                  </>
                ) : currentHandType ? (
                  <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white/70 text-sm font-medium bg-black/30 backdrop-blur-sm px-4 py-2 rounded-full border border-white/10">
                    Waiting for: {HAND_TYPE_LABELS[currentHandType]}
                  </div>
                ) : (
                  <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                    <h2 className="text-white/90 text-2xl font-bold tracking-wider" style={{ textShadow: "0 2px 8px rgba(0,0,0,0.5)" }}>
                      Chinese Game
                    </h2>
                    <p className="text-white/50 text-sm italic mt-2">
                      Play any hand to start
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center">
              {getOpponentByPosition("right") && (
                <OpponentArea 
                  player={getOpponentByPosition("right")!} 
                  position="right"
                  isHighestTarget={highestRuleTargetId === getOpponentByPosition("right")?.id}
                />
              )}
            </div>
          </div>

          <div className="h-16" />
        </div>

        <AnimatePresence>
          {isHighestRuleActive && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute inset-0 pointer-events-none"
              data-testid="highest-rule-overlay"
            >
              <div className="absolute inset-0 border-4 border-gold rounded-[40px] animate-gold-glow" />
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <motion.div
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="bg-gradient-to-r from-yellow-600 to-yellow-500 text-black px-8 py-4 rounded-xl font-bold text-xl shadow-2xl border-2 border-yellow-400"
                  style={{ textShadow: "0 1px 2px rgba(0,0,0,0.2)" }}
                >
                  HIGHEST RULE!
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
