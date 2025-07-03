import { useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { GameState } from '../types';

interface UseSocketReturn {
  playerOnline: number | undefined;
  socket: Socket | null;
  isConnected: boolean;
  connectionError: string | null;
}

export const useSocket = (onNewChanges: (data: GameState) => void): UseSocketReturn => {
  const [playerOnline, setPlayerOnline] = useState<number>();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  
  // Utiliser useRef pour garder une référence stable de la fonction callback
  const onNewChangesRef = useRef(onNewChanges);
  
  // Mettre à jour la référence quand la fonction change
  useEffect(() => {
    onNewChangesRef.current = onNewChanges;
  }, [onNewChanges]);

  useEffect(() => {
    const { hostname } = window.location;
    const socketUrl = hostname === "localhost"
      ? "http://localhost:3200/save"
      : "https://bingo.check-pvp.fr/save";

    const newSocket = io(socketUrl, {
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      maxReconnectionAttempts: 3, // Reduced attempts to avoid spam
      timeout: 5000, // Add connection timeout
    });

    newSocket.on("connect", () => {
      console.log("Socket connected successfully");
      setIsConnected(true);
      setConnectionError(null);
    });

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
      setIsConnected(false);
      if (reason === 'io server disconnect') {
        // Server disconnected the socket, don't try to reconnect
        setConnectionError("Server disconnected");
      }
    });

    newSocket.on("connect_error", (error) => {
      console.warn("Socket connection failed - running in offline mode:", error.message);
      setIsConnected(false);
      setConnectionError(`Connection failed: ${error.message}`);
      
      // Don't spam the console with errors in development
      if (hostname === "localhost") {
        console.info("Backend server not available. The app will work in offline mode.");
      }
    });

    newSocket.on("reconnect_failed", () => {
      console.warn("Socket reconnection failed - continuing in offline mode");
      setConnectionError("Unable to connect to server - running in offline mode");
    });

    setSocket(newSocket);

    return () => {
      console.log("Cleaning up socket connection");
      newSocket.disconnect();
    };
  }, []); // Dépendances vides pour éviter les reconnexions

  return { 
    playerOnline, 
    socket, 
    isConnected, 
    connectionError 
  };
};