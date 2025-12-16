import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { Card } from "@shared/types/game";
import { PlayingCard } from "./PlayingCard";

interface PlayerHandProps {
  cards: Card[];
  selectedCards: string[];
  onCardSelect: (cardId: string) => void;
  isCurrentTurn: boolean;
  isDealing?: boolean;
  disabled?: boolean;
}

export function PlayerHand({
  cards,
  selectedCards,
  onCardSelect,
  isCurrentTurn,
  isDealing = false,
  disabled = false,
}: PlayerHandProps) {
  const cardOverlap = cards.length > 10 ? -44 : cards.length > 7 ? -40 : -36;

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={cn(
        "relative flex items-center justify-center py-6 px-10 rounded-2xl",
        isCurrentTurn && "bg-primary/10 ring-2 ring-primary/40"
      )}
      data-testid="player-hand"
    >
      {isCurrentTurn && (
        <div className="absolute inset-0 rounded-2xl animate-pulse-ring bg-primary/5 pointer-events-none" />
      )}

      <div 
        className="flex items-end justify-center"
        style={{ marginLeft: Math.abs(cardOverlap) }}
      >
        {cards.map((card, index) => (
          <div
            key={card.id}
            style={{ 
              marginLeft: index === 0 ? 0 : cardOverlap,
              zIndex: selectedCards.includes(card.id) ? 50 + index : index,
            }}
          >
            <PlayingCard
              card={card}
              isSelected={selectedCards.includes(card.id)}
              isDisabled={disabled}
              isDealing={isDealing}
              dealDelay={index * 0.1}
              onClick={() => onCardSelect(card.id)}
              size="lg"
            />
          </div>
        ))}
      </div>

      {cards.length === 0 && (
        <div className="text-muted-foreground text-sm">No cards</div>
      )}
    </motion.div>
  );
}
