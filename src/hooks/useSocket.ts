import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { GameState } from '../types';

interface UseSocketReturn {
  playerOnline: number | undefined;
  socket: Socket | null;
}

export const useSocket = (onNewChanges: (data: GameState) => void): UseSocketReturn => {
  const [playerOnline, setPlayerOnline] = useState<number>();
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const { hostname, origin } = window.location;
    const newSocket = io(
      hostname === "localhost"
        ? "http://localhost:3200/save"
        : "https://bingo.check-pvp.fr/save",
      {
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
      }
    );

    newSocket.on("connected", (c) => {
      setPlayerOnline(c.connectedUsers);
    });

    newSocket.on("new-changes", (newChanges: { data: GameState }) => {
      console.log("new-changes", newChanges);
      onNewChanges(newChanges.data);
    });

    newSocket.on("users-updated", (c) => {
      setPlayerOnline(c.connectedUsers);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [onNewChanges]);

  return { playerOnline, socket };
};