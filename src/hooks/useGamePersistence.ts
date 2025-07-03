import { useCallback } from 'react';
import { fetchLastSave, saveJson } from '../services/Api.service';
import { GameState } from '../types';

interface UseGamePersistenceReturn {
  saveGame: (gameState: GameState) => Promise<void>;
  downloadGame: (gameState: GameState) => Promise<void>;
  loadLastGame: () => Promise<GameState | null>;
  loadGameFromFile: (file: File) => Promise<GameState | null>;
}

export const useGamePersistence = (
  propositions: any[],
  playerStates: any[]
): UseGamePersistenceReturn => {

  const saveGame = useCallback(async (gameState: GameState) => {
    try {
      await saveJson(gameState);
    } catch (error) {
      console.error("Error saving game:", error);
      throw new Error("Erreur lors de la sauvegarde du fichier source");
    }
  }, []);

  const downloadGame = useCallback(async (gameState: GameState) => {
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
  }, []);

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
    saveGame,
    downloadGame,
    loadLastGame,
    loadGameFromFile,
  };
};