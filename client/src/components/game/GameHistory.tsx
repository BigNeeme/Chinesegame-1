import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Trophy, XCircle, Clock, Bot, Users } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface GameHistoryItem {
  id: string;
  position: number;
  isWin: boolean;
  xpEarned: number;
  gameMode: string;
  botDifficulty?: string;
  playedAt: Date;
}

interface GameHistoryProps {
  games: GameHistoryItem[];
}

export function GameHistory({ games }: GameHistoryProps) {
  if (games.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Game History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
            <Clock className="h-8 w-8 mb-2" />
            <p>No games played yet</p>
            <p className="text-sm">Start playing to see your history!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      data-testid="game-history"
    >
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Game History</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-64">
            <div className="divide-y">
              {games.map((game, index) => (
                <motion.div
                  key={game.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
                  data-testid={`game-history-item-${game.id}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${game.isWin ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
                      {game.isWin ? (
                        <Trophy className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          {game.isWin ? 'Victory' : `${getOrdinal(game.position)} Place`}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {game.gameMode === 'online' ? (
                            <><Users className="h-3 w-3 mr-1" /> Online</>
                          ) : (
                            <><Bot className="h-3 w-3 mr-1" /> Local</>
                          )}
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(game.playedAt), { addSuffix: true })}
                      </div>
                    </div>
                  </div>
                  <Badge variant={game.isWin ? "default" : "secondary"}>
                    +{game.xpEarned} XP
                  </Badge>
                </motion.div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function getOrdinal(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}
