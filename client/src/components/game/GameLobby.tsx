import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Users, Bot, Copy, Check, Play, Plus, Crown, 
  Loader2, Wifi, Monitor
} from "lucide-react";
import type { Player, BotDifficulty } from "@shared/types/game";

interface GameLobbyProps {
  roomCode: string;
  players: Player[];
  isHost: boolean;
  currentPlayerId: string;
  botDifficulty: BotDifficulty;
  gameMode: "online" | "local";
  isStarting: boolean;
  onStartGame: () => void;
  onAddBot: () => void;
  onChangeDifficulty: (difficulty: BotDifficulty) => void;
  onCopyCode: () => void;
}

export function GameLobby({
  roomCode,
  players,
  isHost,
  currentPlayerId,
  botDifficulty,
  gameMode,
  isStarting,
  onStartGame,
  onAddBot,
  onChangeDifficulty,
  onCopyCode,
}: GameLobbyProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    onCopyCode();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const canStart = players.length === 4 && isHost;
  const emptySlots = 4 - players.length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-2xl mx-auto p-4"
      data-testid="game-lobby"
    >
      <Card className="overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-game-table to-game-felt text-white">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {gameMode === "online" ? (
                <Wifi className="h-6 w-6" />
              ) : (
                <Monitor className="h-6 w-6" />
              )}
              <CardTitle className="text-xl">
                {gameMode === "online" ? "Online Game" : "Local Game"}
              </CardTitle>
            </div>
            <Badge variant="secondary" className="text-sm px-3 py-1">
              {players.length}/4 Players
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          {gameMode === "online" && (
            <div className="flex flex-col gap-2">
              <Label className="text-sm text-muted-foreground">Room Code</Label>
              <div className="flex items-center gap-2">
                <div className="flex-1 font-mono text-3xl font-bold tracking-wider text-center py-3 bg-muted rounded-lg">
                  {roomCode}
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleCopy}
                  data-testid="button-copy-code"
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          )}

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm text-muted-foreground">Players</Label>
              <div className="flex items-center gap-2">
                <Label className="text-xs text-muted-foreground">Bot Difficulty:</Label>
                <div className="flex gap-1">
                  {(["easy", "medium", "hard"] as BotDifficulty[]).map((diff) => (
                    <Button
                      key={diff}
                      variant={botDifficulty === diff ? "default" : "outline"}
                      size="sm"
                      onClick={() => onChangeDifficulty(diff)}
                      className="text-xs px-2"
                      data-testid={`button-difficulty-${diff}`}
                    >
                      {diff.charAt(0).toUpperCase()}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {players.map((player, index) => (
                <motion.div
                  key={player.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-lg border",
                    player.id === currentPlayerId && "border-primary bg-primary/5"
                  )}
                  data-testid={`player-slot-${index}`}
                >
                  <Avatar className="h-10 w-10">
                    {player.profileImageUrl ? (
                      <AvatarImage src={player.profileImageUrl} />
                    ) : null}
                    <AvatarFallback className={player.isBot ? "bg-secondary" : "bg-primary/20"}>
                      {player.isBot ? <Bot className="h-5 w-5" /> : player.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium truncate">{player.name}</span>
                      {player.id === currentPlayerId && (
                        <Badge variant="outline" className="text-xs">You</Badge>
                      )}
                      {players[0]?.id === player.id && (
                        <Crown className="h-4 w-4 text-gold" />
                      )}
                    </div>
                    {player.isBot && player.botDifficulty && (
                      <span className="text-xs text-muted-foreground">
                        {player.botDifficulty} bot
                      </span>
                    )}
                  </div>
                  {player.isReady && (
                    <Check className="h-5 w-5 text-green-500" />
                  )}
                </motion.div>
              ))}

              {Array.from({ length: emptySlots }).map((_, index) => (
                <motion.button
                  key={`empty-${index}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: (players.length + index) * 0.1 }}
                  onClick={onAddBot}
                  className="flex items-center justify-center gap-2 p-3 rounded-lg border-2 border-dashed border-muted-foreground/30 text-muted-foreground hover:border-primary hover:text-primary transition-colors"
                  data-testid={`button-add-player-${index}`}
                >
                  <Plus className="h-5 w-5" />
                  <span className="text-sm">Add Bot</span>
                </motion.button>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              className="flex-1"
              onClick={onAddBot}
              disabled={players.length >= 4}
              data-testid="button-add-bot"
            >
              <Bot className="h-4 w-4 mr-2" />
              Add Bot
            </Button>

            <Button
              className="flex-1"
              onClick={onStartGame}
              disabled={!canStart || isStarting}
              data-testid="button-start-game"
            >
              {isStarting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Play className="h-4 w-4 mr-2" />
              )}
              {isStarting ? "Starting..." : "Start Game"}
            </Button>
          </div>

          {!canStart && (
            <p className="text-center text-sm text-muted-foreground">
              {players.length < 4 
                ? `Need ${4 - players.length} more player${4 - players.length > 1 ? 's' : ''} to start`
                : !isHost 
                  ? "Waiting for host to start the game..."
                  : ""
              }
            </p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
