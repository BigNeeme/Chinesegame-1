import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation, useSearch } from "wouter";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/hooks/use-auth";
import { useGameSocket } from "@/hooks/useGameSocket";
import {
  GameTable,
  PlayerHand,
  GameControls,
  GameLobby,
  TurnTimer,
  WinnerOverlay,
  RoomJoinModal,
} from "@/components/game";
import { detectHandType, canBeatHand, sortCards, has3ofDiamonds, includesCard } from "@/lib/gameLogic";
import { ArrowLeft, Loader2, Copy, Palette } from "lucide-react";
import { Logo } from "@/components/Logo";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { GameRoom, Card, Player, HandType, BotDifficulty, TableTheme } from "@shared/types/game";

export default function Game() {
  const [, setLocation] = useLocation();
  const searchString = useSearch();
  const params = new URLSearchParams(searchString);
  const mode = (params.get("mode") as "online" | "local") || "online";
  const joinCode = params.get("join");

  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();

  const [gameRoom, setGameRoom] = useState<GameRoom | null>(null);
  const [selectedCards, setSelectedCards] = useState<string[]>([]);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [joinError, setJoinError] = useState<string>();
  const [isStarting, setIsStarting] = useState(false);
  const [showWinner, setShowWinner] = useState(false);
  const [botDifficulty, setBotDifficulty] = useState<BotDifficulty>("medium");
  const [serverPlayerId, setServerPlayerId] = useState<string | null>(null);

  const currentPlayerId = serverPlayerId || user?.id || "guest";
  const currentPlayerName = user?.firstName || "Player";

  const {
    isConnected,
    isConnecting,
    connect,
    createRoom,
    joinRoom,
    startGame,
    playCards,
    passTurn,
    addBot,
    setDifficulty,
    setTableTheme,
  } = useGameSocket({
    onConnected: (playerId) => {
      setServerPlayerId(playerId);
    },
    onGameState: (room) => {
      setGameRoom(room);
      setIsStarting(false);
      if (room.winnerId) {
        setTimeout(() => setShowWinner(true), 500);
      }
    },
    onError: (error) => {
      toast({ title: "Error", description: error, variant: "destructive" });
      setJoinError(error);
    },
    onRoomCreated: (code) => {
      toast({ title: "Room Created", description: `Room code: ${code}` });
    },
    onHighestRule: (targetId) => {
      toast({ 
        title: "HIGHEST RULE!", 
        description: "You must play your highest single card!",
      });
    },
    onGameEnded: (winnerId) => {
      setTimeout(() => setShowWinner(true), 500);
    },
  });

  useEffect(() => {
    connect();
  }, [connect]);

  useEffect(() => {
    if (isConnected && serverPlayerId && !gameRoom) {
      if (joinCode) {
        joinRoom(joinCode);
      } else {
        createRoom(mode, botDifficulty);
      }
    }
  }, [isConnected, serverPlayerId, joinCode, mode, botDifficulty]);

  const currentPlayer = useMemo(() => 
    gameRoom?.players.find(p => p.id === currentPlayerId),
    [gameRoom, currentPlayerId]
  );

  const isCurrentTurn = currentPlayer?.isCurrentTurn ?? false;
  const isHost = gameRoom?.hostId === currentPlayerId;

  const myCards = useMemo(() => 
    sortCards(currentPlayer?.cards || []),
    [currentPlayer?.cards]
  );

  const selectedCardObjects = useMemo(() => 
    myCards.filter(c => selectedCards.includes(c.id)),
    [myCards, selectedCards]
  );

  const detectedHandType = useMemo(() => 
    detectHandType(selectedCardObjects),
    [selectedCardObjects]
  );

  const canPlay = useMemo(() => {
    if (!isCurrentTurn || selectedCardObjects.length === 0) return false;
    if (!detectedHandType) return false;

    if (gameRoom?.state === "playing" && !gameRoom.lastPlayedHand) {
      if (has3ofDiamonds(myCards) && !includesCard(selectedCardObjects, "3", "diamonds")) {
        return false;
      }
      return true;
    }

    if (gameRoom?.lastPlayedHand) {
      if (detectedHandType !== gameRoom.currentHandType) return false;
      return canBeatHand(selectedCardObjects, gameRoom.lastPlayedHand.cards, gameRoom.currentHandType!);
    }

    return true;
  }, [isCurrentTurn, selectedCardObjects, detectedHandType, gameRoom, myCards]);

  const canPass = useMemo(() => {
    if (!isCurrentTurn) return false;
    if (gameRoom?.state !== "playing") return false;
    if (!gameRoom?.lastPlayedHand && has3ofDiamonds(myCards)) return false;
    if (gameRoom?.isHighestRuleActive && gameRoom.highestRuleTargetId === currentPlayerId) return false;
    return true;
  }, [isCurrentTurn, gameRoom, myCards, currentPlayerId]);

  const handleCardSelect = useCallback((cardId: string) => {
    setSelectedCards(prev => 
      prev.includes(cardId) 
        ? prev.filter(id => id !== cardId)
        : [...prev, cardId]
    );
  }, []);

  const handlePlay = useCallback(() => {
    if (!canPlay) return;
    playCards(selectedCardObjects);
    setSelectedCards([]);
  }, [canPlay, selectedCardObjects, playCards]);

  const handlePass = useCallback(() => {
    if (!canPass) return;
    passTurn();
    setSelectedCards([]);
  }, [canPass, passTurn]);

  const handleClearSelection = useCallback(() => {
    setSelectedCards([]);
  }, []);

  const handleStartGame = useCallback(() => {
    setIsStarting(true);
    startGame();
  }, [startGame]);

  const handleAddBot = useCallback(() => {
    addBot();
  }, [addBot]);

  const handleCopyCode = useCallback(() => {
    if (gameRoom?.code) {
      navigator.clipboard.writeText(gameRoom.code);
      toast({ title: "Copied!", description: "Room code copied to clipboard" });
    }
  }, [gameRoom?.code, toast]);

  const handlePlayAgain = useCallback(() => {
    setShowWinner(false);
    setSelectedCards([]);
    createRoom(mode, botDifficulty);
  }, [createRoom, mode, botDifficulty]);

  const handleGoHome = useCallback(() => {
    setLocation("/");
  }, [setLocation]);

  if (isConnecting || !isConnected) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Connecting to game server...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="fixed top-0 left-0 right-0 z-50 border-b bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => setLocation("/")} data-testid="button-back-game">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <Logo size="sm" />
          </div>

          {gameRoom?.code && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Room:</span>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleCopyCode}
                className="font-mono"
                data-testid="button-room-code"
              >
                {gameRoom.code}
                <Copy className="h-3 w-3 ml-2" />
              </Button>
            </div>
          )}

          <div className="flex items-center gap-2">
            {gameRoom?.state === "playing" && isCurrentTurn && gameRoom.turnStartTime && (
              <TurnTimer
                duration={30}
                startTime={gameRoom.turnStartTime}
                isActive={isCurrentTurn}
                onTimeout={handlePass}
              />
            )}
            {gameRoom && (
              <Select 
                value={gameRoom.tableTheme || "classic"} 
                onValueChange={(value) => setTableTheme(value as TableTheme)}
              >
                <SelectTrigger className="w-28" data-testid="select-table-theme">
                  <Palette className="h-4 w-4 mr-1" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="classic">Classic</SelectItem>
                  <SelectItem value="green">Green</SelectItem>
                  <SelectItem value="blue">Blue</SelectItem>
                  <SelectItem value="purple">Purple</SelectItem>
                  <SelectItem value="gold">Gold</SelectItem>
                </SelectContent>
              </Select>
            )}
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="flex-1 pt-14 flex flex-col">
        {gameRoom?.state === "waiting" && (
          <div className="flex-1 flex items-center justify-center p-4">
            <GameLobby
              roomCode={gameRoom.code}
              players={gameRoom.players}
              isHost={isHost}
              currentPlayerId={currentPlayerId}
              botDifficulty={botDifficulty}
              gameMode={mode}
              isStarting={isStarting}
              onStartGame={handleStartGame}
              onAddBot={handleAddBot}
              onChangeDifficulty={(diff) => {
                setBotDifficulty(diff);
                setDifficulty(diff);
              }}
              onCopyCode={handleCopyCode}
            />
          </div>
        )}

        {(gameRoom?.state === "dealing" || gameRoom?.state === "playing" || gameRoom?.state === "round_reset") && (
          <div className="flex-1 flex flex-col p-4 gap-4">
            <div className="flex-1 flex items-center justify-center">
              <GameTable
                players={gameRoom.players}
                currentPlayerId={currentPlayerId}
                lastPlayedHand={gameRoom.lastPlayedHand}
                playedHandsHistory={gameRoom.playedHandsHistory || []}
                currentHandType={gameRoom.currentHandType}
                isHighestRuleActive={gameRoom.isHighestRuleActive}
                highestRuleTargetId={gameRoom.highestRuleTargetId}
                tableTheme={gameRoom.tableTheme || "classic"}
              />
            </div>

            <div className="flex flex-col items-center gap-4">
              <PlayerHand
                cards={myCards}
                selectedCards={selectedCards}
                onCardSelect={handleCardSelect}
                isCurrentTurn={isCurrentTurn}
                isDealing={gameRoom.state === "dealing"}
                disabled={!isCurrentTurn}
              />

              <GameControls
                selectedCardCount={selectedCards.length}
                detectedHandType={detectedHandType}
                requiredHandType={gameRoom.currentHandType}
                canPlay={canPlay}
                canPass={canPass}
                isCurrentTurn={isCurrentTurn}
                onPlay={handlePlay}
                onPass={handlePass}
                onClearSelection={handleClearSelection}
                isHighestRuleActive={gameRoom.isHighestRuleActive && gameRoom.highestRuleTargetId === currentPlayerId}
              />
            </div>
          </div>
        )}
      </main>

      <AnimatePresence>
        {showWinner && gameRoom?.winnerId && (
          <WinnerOverlay
            winnerName={gameRoom.players.find(p => p.id === gameRoom.winnerId)?.name || "Unknown"}
            isCurrentPlayer={gameRoom.winnerId === currentPlayerId}
            xpEarned={gameRoom.winnerId === currentPlayerId ? 50 : 10}
            onPlayAgain={handlePlayAgain}
            onGoHome={handleGoHome}
          />
        )}
      </AnimatePresence>

      <RoomJoinModal
        isOpen={isJoinModalOpen}
        onClose={() => setIsJoinModalOpen(false)}
        onJoin={(code) => {
          joinRoom(code);
          setIsJoinModalOpen(false);
        }}
        isJoining={false}
        error={joinError}
      />
    </div>
  );
}
