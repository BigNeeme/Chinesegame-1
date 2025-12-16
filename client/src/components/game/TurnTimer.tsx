import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface TurnTimerProps {
  duration: number;
  startTime: number | null;
  isActive: boolean;
  onTimeout?: () => void;
}

export function TurnTimer({ duration, startTime, isActive, onTimeout }: TurnTimerProps) {
  const [timeLeft, setTimeLeft] = useState(duration);

  useEffect(() => {
    if (!isActive || !startTime) {
      setTimeLeft(duration);
      return;
    }

    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      const remaining = Math.max(0, duration - elapsed);
      setTimeLeft(remaining);

      if (remaining === 0 && onTimeout) {
        onTimeout();
        clearInterval(interval);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [duration, startTime, isActive, onTimeout]);

  const progress = timeLeft / duration;
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference * (1 - progress);

  const getColor = () => {
    if (progress > 0.5) return "stroke-primary";
    if (progress > 0.25) return "stroke-yellow-500";
    return "stroke-destructive";
  };

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={cn(
        "relative flex items-center justify-center",
        !isActive && "opacity-50"
      )}
      data-testid="turn-timer"
    >
      <svg width="100" height="100" className="transform -rotate-90">
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke="currentColor"
          strokeWidth="4"
          className="text-muted/30"
        />
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className={cn("transition-all duration-100", getColor())}
        />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          key={timeLeft}
          initial={{ scale: 1.2 }}
          animate={{ scale: 1 }}
          className={cn(
            "text-2xl font-bold tabular-nums",
            progress <= 0.25 && "text-destructive"
          )}
        >
          {timeLeft}
        </motion.span>
        <span className="text-xs text-muted-foreground">seconds</span>
      </div>

      {timeLeft <= 5 && timeLeft > 0 && (
        <motion.div
          initial={{ scale: 1 }}
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 0.5, repeat: Infinity }}
          className="absolute inset-0 rounded-full border-2 border-destructive opacity-50"
        />
      )}
    </motion.div>
  );
}
