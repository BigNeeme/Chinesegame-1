import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Trophy, Target, Flame, Star, TrendingUp } from "lucide-react";

interface PlayerStatsProps {
  gamesPlayed: number;
  gamesWon: number;
  gamesLost: number;
  level: number;
  xp: number;
  xpToNextLevel: number;
}

export function PlayerStats({
  gamesPlayed,
  gamesWon,
  gamesLost,
  level,
  xp,
  xpToNextLevel,
}: PlayerStatsProps) {
  const winRate = gamesPlayed > 0 ? Math.round((gamesWon / gamesPlayed) * 100) : 0;
  const xpProgress = (xp / xpToNextLevel) * 100;

  const stats = [
    { label: "Games Played", value: gamesPlayed, icon: Target, color: "text-blue-500" },
    { label: "Wins", value: gamesWon, icon: Trophy, color: "text-green-500" },
    { label: "Losses", value: gamesLost, icon: Flame, color: "text-red-500" },
    { label: "Win Rate", value: `${winRate}%`, icon: TrendingUp, color: "text-purple-500" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      data-testid="player-stats"
    >
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Your Statistics</CardTitle>
            <Badge className="bg-gold text-gold-foreground">
              <Star className="h-3 w-3 mr-1 fill-current" />
              Level {level}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">XP Progress</span>
              <span className="font-medium">{xp} / {xpToNextLevel}</span>
            </div>
            <Progress value={xpProgress} className="h-2" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center gap-3 p-3 rounded-lg bg-muted/50"
              >
                <div className={`p-2 rounded-lg bg-background ${stat.color}`}>
                  <stat.icon className="h-4 w-4" />
                </div>
                <div>
                  <div className="font-bold text-lg" data-testid={`stat-${stat.label.toLowerCase().replace(' ', '-')}`}>
                    {stat.value}
                  </div>
                  <div className="text-xs text-muted-foreground">{stat.label}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
