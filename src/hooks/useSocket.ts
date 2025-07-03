import { useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { GameState } from '../types';

interface UseSocketReturn {
  playerOnline: number | undefined;
  socket: Socket | null;
}

export const useSocket = (onNewChanges: (data: GameState) => void): UseSocketReturn => {
  const [playerOnline, setPlayerOnline] = useState<number>();
  const [socket, setSocket] = useState<Socket | null>(null);
  
  // Utiliser useRef pour garder une référence stable de la fonction callback
  const onNewChangesRef = useRef(onNewChanges);
  
  // Mettre à jour la référence quand la fonction change
  useEffect(() => {
    onNewChangesRef.current = onNewChanges;
  }, [onNewChanges]);

  useEffect(() => {
    const { hostname } = window.location;
    const newSocket = io(
      hostname === "localhost"
        ? "http://localhost:3200/save"
        : "https://bingo.check-pvp.fr/save",
      {
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        maxReconnectionAttempts: 5,
      }
    );

    newSocket.on("connected", (c) => {
      console.log("Socket connected:", c);
      setPlayerOnline(c.connectedUsers);
    });

    newSocket.on("new-changes", (newChanges: { data: GameState }) => {
      console.log("new-changes received:", newChanges);
      // Utiliser la référence stable
      onNewChangesRef.current(newChanges.data);
    });

    newSocket.on("users-updated", (c) => {
      console.log("Users updated:", c);
      setPlayerOnline(c.connectedUsers);
    });

    newSocket.on("disconnect", (reason) => {
      console.log("Socket disconnected:", reason);
    });

    newSocket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
    });

    setSocket(newSocket);

    return () => {
      console.log("Cleaning up socket connection");
      newSocket.disconnect();
    };
  }, []); // Dépendances vides pour éviter les reconnexions

  return { playerOnline, socket };
};