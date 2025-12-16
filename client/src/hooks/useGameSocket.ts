import { useEffect, useRef, useState, useCallback } from "react";
import type { WebSocketMessage, GameRoom, Card, BotDifficulty } from "@shared/types/game";

interface UseGameSocketOptions {
  onGameState?: (room: GameRoom) => void;
  onError?: (error: string) => void;
  onRoomCreated?: (code: string) => void;
  onHighestRule?: (targetId: string) => void;
  onGameEnded?: (winnerId: string) => void;
  onConnected?: (playerId: string) => void;
}

export function useGameSocket(options: UseGameSocketOptions = {}) {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const socketRef = useRef<WebSocket | null>(null);

  const connect = useCallback(() => {
    if (socketRef.current?.readyState === WebSocket.OPEN) return;

    setIsConnecting(true);
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    const socket = new WebSocket(wsUrl);

    socket.onopen = () => {
      setIsConnected(true);
      setIsConnecting(false);
    };

    socket.onclose = () => {
      setIsConnected(false);
      setIsConnecting(false);
    };

    socket.onerror = () => {
      setIsConnected(false);
      setIsConnecting(false);
      options.onError?.("Connection error");
    };

    socket.onmessage = (event) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data);
        handleMessage(message);
      } catch (e) {
        console.error("Failed to parse message:", e);
      }
    };

    socketRef.current = socket;
  }, []);

  const handleMessage = (message: WebSocketMessage) => {
    switch (message.type) {
      case "connected":
        options.onConnected?.(message.payload.playerId);
        break;
      case "game_state":
        options.onGameState?.(message.payload);
        break;
      case "room_created":
        options.onRoomCreated?.(message.payload.code);
        break;
      case "highest_rule":
        options.onHighestRule?.(message.payload.targetId);
        break;
      case "game_ended":
        options.onGameEnded?.(message.payload.winnerId);
        break;
      case "error":
        options.onError?.(message.error || "Unknown error");
        break;
    }
  };

  const send = useCallback((message: WebSocketMessage) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(message));
    }
  }, []);

  const createRoom = useCallback((gameMode: "online" | "local", botDifficulty: BotDifficulty) => {
    send({ type: "create_room", payload: { gameMode, botDifficulty } });
  }, [send]);

  const joinRoom = useCallback((code: string) => {
    send({ type: "join_room", payload: { code } });
  }, [send]);

  const leaveRoom = useCallback(() => {
    send({ type: "leave_room" });
  }, [send]);

  const startGame = useCallback(() => {
    send({ type: "start_game" });
  }, [send]);

  const playCards = useCallback((cards: Card[]) => {
    send({ type: "play_cards", payload: { cards } });
  }, [send]);

  const passTurn = useCallback(() => {
    send({ type: "pass_turn" });
  }, [send]);

  const addBot = useCallback(() => {
    send({ type: "bot_added" });
  }, [send]);

  const setReady = useCallback(() => {
    send({ type: "ready" });
  }, [send]);

  const setDifficulty = useCallback((difficulty: BotDifficulty) => {
    send({ type: "set_difficulty", payload: { difficulty } });
  }, [send]);

  const setTableTheme = useCallback((theme: "classic" | "green" | "blue" | "purple" | "gold") => {
    send({ type: "set_table_theme", payload: { theme } });
  }, [send]);

  const disconnect = useCallback(() => {
    socketRef.current?.close();
    socketRef.current = null;
    setIsConnected(false);
  }, []);

  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    isConnected,
    isConnecting,
    connect,
    disconnect,
    createRoom,
    joinRoom,
    leaveRoom,
    startGame,
    playCards,
    passTurn,
    addBot,
    setReady,
    setDifficulty,
    setTableTheme,
  };
}
