import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, XCircle, RotateCcw } from "lucide-react";
import type { HandType } from "@shared/types/game";

interface GameControlsProps {
  selectedCardCount: number;
  detectedHandType: HandType | null;
  requiredHandType: HandType | null;
  canPlay: boolean;
  canPass: boolean;
  isCurrentTurn: boolean;
  onPlay: () => void;
  onPass: () => void;
  onClearSelection: () => void;
  isHighestRuleActive?: boolean;
}

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

export function GameControls({
  selectedCardCount,
  detectedHandType,
  requiredHandType,
  canPlay,
  canPass,
  isCurrentTurn,
  onPlay,
  onPass,
  onClearSelection,
  isHighestRuleActive = false,
}: GameControlsProps) {
  return (
    <motion.div
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className={cn(
        "flex flex-col items-center gap-4 p-4 rounded-xl bg-card/90 backdrop-blur-sm border border-card-border shadow-lg",
        isCurrentTurn && "ring-2 ring-primary/30"
      )}
      data-testid="game-controls"
    >
      <div className="flex items-center gap-3">
        <Badge variant="outline" className="text-sm px-3 py-1">
          {selectedCardCount} selected
        </Badge>

        {requiredHandType && (
          <Badge variant="secondary" className="text-sm px-3 py-1">
            Need: {HAND_TYPE_LABELS[requiredHandType]}
          </Badge>
        )}

        {detectedHandType && (
          <Badge 
            variant={canPlay ? "default" : "destructive"} 
            className="text-sm px-3 py-1"
          >
            {canPlay ? HAND_TYPE_LABELS[detectedHandType] : "Invalid"}
          </Badge>
        )}

        {isHighestRuleActive && (
          <Badge className="bg-gold text-gold-foreground text-sm px-3 py-1 animate-gold-glow">
            HIGHEST RULE
          </Badge>
        )}
      </div>

      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearSelection}
          disabled={selectedCardCount === 0}
          data-testid="button-clear"
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          Clear
        </Button>

        <Button
          variant="secondary"
          size="lg"
          onClick={onPass}
          disabled={!canPass || !isCurrentTurn}
          className="min-w-24"
          data-testid="button-pass"
        >
          <XCircle className="h-4 w-4 mr-2" />
          Pass
        </Button>

        <Button
          size="lg"
          onClick={onPlay}
          disabled={!canPlay || !isCurrentTurn}
          className="min-w-32"
          data-testid="button-play"
        >
          <Play className="h-4 w-4 mr-2" />
          Play Cards
        </Button>
      </div>

      {!isCurrentTurn && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-sm text-muted-foreground"
        >
          Waiting for your turn...
        </motion.p>
      )}

      {isCurrentTurn && (
        <motion.p
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm font-medium text-primary"
        >
          Your turn!
        </motion.p>
      )}
    </motion.div>
  );
}
