import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Trophy, Star, Home, RotateCcw } from "lucide-react";

interface WinnerOverlayProps {
  winnerName: string;
  isCurrentPlayer: boolean;
  xpEarned: number;
  onPlayAgain: () => void;
  onGoHome: () => void;
}

function Confetti({ delay, x }: { delay: number; x: number }) {
  const colors = ["bg-yellow-400", "bg-red-500", "bg-blue-500", "bg-green-500", "bg-purple-500", "bg-pink-500"];
  const color = colors[Math.floor(Math.random() * colors.length)];

  return (
    <motion.div
      initial={{ y: -20, x, opacity: 1, rotate: 0 }}
      animate={{ y: 400, opacity: 0, rotate: 720 }}
      transition={{ duration: 2, delay, ease: "easeOut" }}
      className={cn("absolute w-3 h-3 rounded-sm", color)}
      style={{ left: `${x}%` }}
    />
  );
}

export function WinnerOverlay({
  winnerName,
  isCurrentPlayer,
  xpEarned,
  onPlayAgain,
  onGoHome,
}: WinnerOverlayProps) {
  const confettiPieces = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    delay: Math.random() * 0.5,
    x: Math.random() * 100,
  }));

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
        data-testid="winner-overlay"
      >
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {confettiPieces.map((piece) => (
            <Confetti key={piece.id} delay={piece.delay} x={piece.x} />
          ))}
        </div>

        <motion.div
          initial={{ scale: 0, rotate: -10 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", damping: 15, stiffness: 300, delay: 0.2 }}
          className="relative bg-card rounded-2xl p-8 shadow-2xl max-w-md w-full mx-4 border border-card-border"
        >
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col items-center gap-6"
          >
            <div className="relative">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.5 }}
                className="w-24 h-24 rounded-full bg-gold/20 flex items-center justify-center"
              >
                <Trophy className="w-12 h-12 text-gold" />
              </motion.div>

              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 rounded-full border-2 border-dashed border-gold/30"
              />
            </div>

            <div className="text-center">
              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="text-2xl font-bold mb-2"
              >
                {isCurrentPlayer ? "You Win!" : `${winnerName} Wins!`}
              </motion.h2>

              {isCurrentPlayer && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.7 }}
                  className="flex items-center justify-center gap-2 text-gold"
                >
                  <Star className="w-5 h-5 fill-gold" />
                  <span className="font-medium">+{xpEarned} XP</span>
                  <Star className="w-5 h-5 fill-gold" />
                </motion.div>
              )}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="flex gap-3 w-full"
            >
              <Button
                variant="outline"
                className="flex-1"
                onClick={onGoHome}
                data-testid="button-go-home"
              >
                <Home className="w-4 h-4 mr-2" />
                Home
              </Button>
              <Button
                className="flex-1"
                onClick={onPlayAgain}
                data-testid="button-play-again"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Play Again
              </Button>
            </motion.div>
          </motion.div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
