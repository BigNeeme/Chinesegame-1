import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Logo } from "@/components/Logo";
import { useAuth } from "@/hooks/use-auth";
import { 
  Trophy, Medal, Award, Crown, ArrowLeft, 
  Loader2, Users, Target, TrendingUp
} from "lucide-react";
import { useLocation } from "wouter";
import type { PlayerStats } from "@shared/schema";

export default function Leaderboard() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  const { data: leaderboard, isLoading, error } = useQuery<PlayerStats[]>({
    queryKey: ["/api/leaderboard"],
  });

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Award className="h-5 w-5 text-amber-600" />;
      default:
        return <span className="text-muted-foreground font-mono w-5 text-center">{rank}</span>;
    }
  };

  const getRankStyle = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-gradient-to-r from-yellow-500/20 to-yellow-600/10 border-yellow-500/30";
      case 2:
        return "bg-gradient-to-r from-gray-400/20 to-gray-500/10 border-gray-400/30";
      case 3:
        return "bg-gradient-to-r from-amber-600/20 to-amber-700/10 border-amber-600/30";
      default:
        return "";
    }
  };

  const getWinRate = (stats: PlayerStats) => {
    if (stats.gamesPlayed === 0) return 0;
    return Math.round((stats.gamesWon / stats.gamesPlayed) * 100);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setLocation("/")}
              data-testid="button-back"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <Logo size="md" />
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-3xl mx-auto"
        >
          <div className="flex items-center gap-3 mb-8">
            <Trophy className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Global Leaderboard</h1>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-8">
            <Card>
              <CardContent className="pt-6 text-center">
                <Users className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                <p className="text-2xl font-bold">{leaderboard?.length || 0}</p>
                <p className="text-sm text-muted-foreground">Players</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <Target className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                <p className="text-2xl font-bold">
                  {leaderboard?.reduce((sum, p) => sum + p.gamesPlayed, 0) || 0}
                </p>
                <p className="text-sm text-muted-foreground">Games Played</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <TrendingUp className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                <p className="text-2xl font-bold">
                  {leaderboard?.reduce((sum, p) => sum + p.totalPoints, 0) || 0}
                </p>
                <p className="text-sm text-muted-foreground">Total Points</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                Top Players
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : error ? (
                <div className="text-center py-12 text-muted-foreground">
                  Failed to load leaderboard
                </div>
              ) : leaderboard && leaderboard.length > 0 ? (
                <div className="space-y-2">
                  {leaderboard.map((player, index) => {
                    const rank = index + 1;
                    const isCurrentUser = user?.id === player.userId;
                    
                    return (
                      <motion.div
                        key={player.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={`flex items-center gap-4 p-4 rounded-lg border ${getRankStyle(rank)} ${
                          isCurrentUser ? "ring-2 ring-primary" : ""
                        }`}
                        data-testid={`leaderboard-row-${index}`}
                      >
                        <div className="flex items-center justify-center w-8">
                          {getRankIcon(rank)}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium truncate">
                              Player {player.userId.slice(0, 8)}
                            </span>
                            {isCurrentUser && (
                              <Badge variant="secondary" className="text-xs">You</Badge>
                            )}
                            <Badge variant="outline" className="text-xs">
                              Lv.{player.level}
                            </Badge>
                          </div>
                        </div>

                        <div className="flex items-center gap-6 text-sm">
                          <div className="text-center">
                            <p className="font-bold text-primary">{player.totalPoints}</p>
                            <p className="text-xs text-muted-foreground">Points</p>
                          </div>
                          <div className="text-center">
                            <p className="font-medium">{player.gamesWon}</p>
                            <p className="text-xs text-muted-foreground">Wins</p>
                          </div>
                          <div className="text-center">
                            <p className="font-medium">{getWinRate(player)}%</p>
                            <p className="text-xs text-muted-foreground">Win Rate</p>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Trophy className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                  <p className="text-muted-foreground mb-2">No players yet</p>
                  <p className="text-sm text-muted-foreground">
                    Be the first to play and claim the top spot!
                  </p>
                  <Button 
                    className="mt-4" 
                    onClick={() => setLocation("/play?mode=local")}
                    data-testid="button-play-now"
                  >
                    Play Now
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
}
