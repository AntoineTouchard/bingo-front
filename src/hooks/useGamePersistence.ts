import { useCallback } from 'react';
import { fetchLastSave } from '../services/Api.service';
import { GameState, PlayerState, Proposition } from '../types';

interface UseGamePersistenceReturn {
  downloadGame: () => Promise<void>;
  loadLastGame: () => Promise<GameState | null>;
  loadGameFromFile: (file: File) => Promise<GameState | null>;
}

export const useGamePersistence = (
  propositions: Proposition[],
  playerStates: PlayerState[]
): UseGamePersistenceReturn => {
  const createGameState = useCallback((): GameState => ({
    players: playerStates.map((playerState) => ({
      ...playerState,
      validatedItems: Array.from(playerState.validatedItems.entries()),
    })),
    propositions,
  }), [propositions, playerStates]);

  const downloadGame = useCallback(async () => {
    const gameState = createGameState();
    try {
      const blob = new Blob([JSON.stringify(gameState, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `bingo-anytime-${new Date().toISOString().replace("T", "_").substring(0, 19)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading game:", error);
      throw new Error("Erreur lors du téléchargement du fichier");
    }
  }, [createGameState]);

  const loadLastGame = useCallback(async (): Promise<GameState | null> => {
    try {
      const lastSave = await fetchLastSave();
      if (!lastSave?.data) {
        return null;
      }
      return JSON.parse(lastSave.data) as GameState;
    } catch (error) {
      console.error("Error loading last game:", error);
      return null;
    }
  }, []);

  const loadGameFromFile = useCallback((file: File): Promise<GameState | null> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const gameState = JSON.parse(e.target?.result as string) as GameState;
          resolve(gameState);
        } catch (error) {
          console.error("Error loading game from file:", error);
          reject(new Error("Erreur lors du chargement du fichier"));
        }
      };
      reader.onerror = () => reject(new Error("Erreur lors de la lecture du fichier"));
      reader.readAsText(file);
    });
  }, []);

  return {
    downloadGame,
    loadLastGame,
    loadGameFromFile,
  };
};