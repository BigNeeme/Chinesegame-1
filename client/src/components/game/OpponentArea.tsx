import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Bot } from "lucide-react";
import type { Player } from "@shared/types/game";

interface OpponentAreaProps {
  player: Player;
  position: "top" | "left" | "right";
  isHighestTarget?: boolean;
}

const SUIT_ICONS = ["♠", "♥", "♦", "♣"];

export function OpponentArea({ player, position, isHighestTarget = false }: OpponentAreaProps) {
  const positionClasses = {
    top: "flex-col",
    left: "flex-row",
    right: "flex-row-reverse",
  };

  const cardStackDirection = position === "top" ? "horizontal" : "vertical";
  const maxVisibleCards = 8;
  const visibleCount = Math.min(player.cardCount, maxVisibleCards);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={cn(
        "flex items-center gap-4 p-4 rounded-2xl",
        "bg-black/40 backdrop-blur-md border border-white/10",
        positionClasses[position],
        player.isCurrentTurn && "ring-2 ring-primary shadow-lg shadow-primary/20",
        player.hasPassed && "opacity-50",
        isHighestTarget && "ring-2 ring-gold animate-gold-glow"
      )}
      data-testid={`opponent-area-${player.id}`}
    >
      <div className="flex flex-col items-center gap-2">
        <div className="relative">
          <Avatar className="h-12 w-12 border-2 border-white/20">
            {player.profileImageUrl ? (
              <AvatarImage src={player.profileImageUrl} alt={player.name} />
            ) : null}
            <AvatarFallback className="bg-gradient-to-br from-slate-700 to-slate-900 text-white font-medium">
              {player.isBot ? (
                <Bot className="h-5 w-5" />
              ) : (
                player.name.charAt(0).toUpperCase()
              )}
            </AvatarFallback>
          </Avatar>
          {player.isCurrentTurn && (
            <div className="absolute -inset-1 rounded-full border-2 border-primary animate-pulse" />
          )}
        </div>

        <div className="flex items-center gap-2">
          <span className="font-semibold text-white text-sm truncate max-w-20" data-testid={`player-name-${player.id}`}>
            {player.name}
          </span>
          {player.isBot && player.botDifficulty && (
            <span className="text-xs text-white/50 bg-white/10 px-1.5 py-0.5 rounded">
              {player.botDifficulty.charAt(0).toUpperCase()}
            </span>
          )}
        </div>

        <div className="flex items-center gap-0.5">
          {SUIT_ICONS.map((suit, i) => (
            <span 
              key={i} 
              className={cn(
                "text-xs",
                i % 2 === 0 ? "text-white/50" : "text-red-400/70"
              )}
            >
              {suit}
            </span>
          ))}
        </div>
      </div>

      <div className="flex flex-col items-center gap-2">
        <div 
          className={cn(
            "flex",
            cardStackDirection === "horizontal" ? "flex-row" : "flex-col"
          )}
        >
          {Array.from({ length: visibleCount }).map((_, i) => (
            <div
              key={i}
              className="w-7 h-10 rounded-md bg-gradient-to-br from-slate-600 via-slate-700 to-slate-800 border border-slate-500 shadow-md flex items-center justify-center"
              style={{ 
                marginLeft: cardStackDirection === "horizontal" && i > 0 ? -16 : 0,
                marginTop: cardStackDirection === "vertical" && i > 0 ? -24 : 0,
                zIndex: i,
              }}
            >
              <div className="w-5 h-7 rounded border border-slate-400/40 flex items-center justify-center bg-slate-700/50">
                <span className="text-slate-300 text-xs font-bold">C</span>
              </div>
            </div>
          ))}
        </div>

        <div 
          className={cn(
            "flex items-center justify-center px-3 py-1.5 rounded-full font-bold text-sm min-w-8",
            player.cardCount === 1 
              ? "bg-red-500 text-white animate-pulse" 
              : player.cardCount <= 3 
                ? "bg-yellow-500 text-black"
                : "bg-white/20 text-white"
          )}
          data-testid={`card-count-${player.id}`}
        >
          {player.cardCount}
        </div>

        {player.hasPassed && (
          <Badge variant="secondary" className="text-xs bg-white/10 text-white/70 border-0">
            Passed
          </Badge>
        )}
      </div>
    </motion.div>
  );
}
