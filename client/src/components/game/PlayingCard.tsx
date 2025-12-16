import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { Card, Suit } from "@shared/types/game";
import { SUIT_SYMBOLS, SUIT_COLORS } from "@shared/types/game";

interface PlayingCardProps {
  card: Card;
  isSelected?: boolean;
  isDisabled?: boolean;
  isDealing?: boolean;
  dealDelay?: number;
  onClick?: () => void;
  size?: "sm" | "md" | "lg";
  faceDown?: boolean;
}

export function PlayingCard({
  card,
  isSelected = false,
  isDisabled = false,
  isDealing = false,
  dealDelay = 0,
  onClick,
  size = "md",
  faceDown = false,
}: PlayingCardProps) {
  const color = SUIT_COLORS[card.suit];
  const symbol = SUIT_SYMBOLS[card.suit];

  const sizeStyles: Record<string, { width: string; height: string; fontSize: string }> = {
    sm: { width: "3.5rem", height: "5rem", fontSize: "0.75rem" },
    md: { width: "4.5rem", height: "6.5rem", fontSize: "0.875rem" },
    lg: { width: "5.5rem", height: "8rem", fontSize: "1rem" },
  };

  const cardStyle = sizeStyles[size];

  const rankDisplay = card.rank === "10" ? "10" : card.rank;

  if (faceDown) {
    return (
      <motion.div
        initial={isDealing ? { y: -200, rotateY: 180, scale: 0.5, opacity: 0 } : false}
        animate={{ y: 0, rotateY: 0, scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, delay: dealDelay, ease: "easeOut" }}
        className={cn(
          "rounded-lg shadow-lg cursor-default select-none",
          "bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900",
          "border-2 border-blue-700"
        )}
        style={{ width: cardStyle.width, height: cardStyle.height, fontSize: cardStyle.fontSize }}
      >
        <div className="w-full h-full flex items-center justify-center">
          <div className="w-3/4 h-3/4 rounded border border-blue-600 bg-blue-800/50 flex items-center justify-center">
            <div className="text-blue-400 font-bold text-lg">?</div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={isDealing ? { y: -200, rotateY: 180, scale: 0.5, opacity: 0 } : false}
      animate={{ 
        y: isSelected ? -12 : 0, 
        rotateY: 0, 
        scale: isSelected ? 1.05 : 1, 
        opacity: isDisabled ? 0.5 : 1 
      }}
      transition={{ duration: isDealing ? 0.6 : 0.2, delay: isDealing ? dealDelay : 0, ease: "easeOut" }}
      whileHover={!isDisabled ? { y: -8, scale: 1.02 } : undefined}
      onClick={!isDisabled ? onClick : undefined}
      data-testid={`card-${card.rank}-${card.suit}`}
      className={cn(
        "rounded-lg shadow-lg cursor-pointer select-none relative",
        "bg-card-white border-2 transition-shadow duration-200",
        isSelected ? "border-primary ring-2 ring-primary/50 shadow-xl" : "border-gray-200 dark:border-gray-700",
        isDisabled && "cursor-not-allowed",
        !isDisabled && "hover:shadow-xl"
      )}
      style={{ width: cardStyle.width, height: cardStyle.height, fontSize: cardStyle.fontSize }}
    >
      <div className="absolute inset-0 p-1.5 flex flex-col">
        <div className={cn(
          "flex flex-col items-start leading-none",
          color === "red" ? "text-card-red" : "text-card-black"
        )}>
          <span className="font-bold">{rankDisplay}</span>
          <span className="text-lg -mt-1">{symbol}</span>
        </div>

        <div className={cn(
          "flex-1 flex items-center justify-center text-3xl",
          color === "red" ? "text-card-red" : "text-card-black"
        )}>
          {symbol}
        </div>

        <div className={cn(
          "flex flex-col items-end leading-none rotate-180",
          color === "red" ? "text-card-red" : "text-card-black"
        )}>
          <span className="font-bold">{rankDisplay}</span>
          <span className="text-lg -mt-1">{symbol}</span>
        </div>
      </div>

      {isSelected && (
        <div className="absolute inset-0 rounded-lg bg-primary/10 pointer-events-none" />
      )}
    </motion.div>
  );
}
