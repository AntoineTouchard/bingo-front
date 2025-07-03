import { useState, useCallback, useEffect } from 'react';
import { GameState, PlayerState, Proposition } from '../types';
import { generateGrid, generateGrids } from '../services/utils';

interface UseGameStateReturn {
  propositions: Proposition[];
  playerStates: PlayerState[];
  isChanged: boolean;
  isLoadedGame: boolean;
  hasUnsavedChanges: boolean;
  setPropositions: (propositions: Proposition[]) => void;
  setPlayerStates: (playerStates: PlayerState[]) => void;
  setIsChanged: (changed: boolean) => void;
  setIsLoadedGame: (loaded: boolean) => void;
  generateNewGrids: (playerCount?: number) => void;
  addPlayer: () => void;
  removePlayer: (index: number) => void;
  updatePlayerName: (index: number, newName: string) => void;
  validateItem: (playerIndex: number, itemIndex: number, description: string) => void;
  removeValidation: (playerIndex: number, itemIndex: number) => void;
  addProposition: (text: string) => void;
  removeProposition: (id: string) => void;
  loadGameState: (gameState: GameState, updateIsChanged?: boolean) => void;
  confirmUnsavedChanges: () => boolean;
}

export const useGameState = (
  initialPropositions: Proposition[],
  itemsPerGrid: number = 6,
  minPlayers: number = 0,
  maxPlayers: number = 100,
  onAutoSave?: () => void
): UseGameStateReturn => {
  const [propositions, setPropositions] = useState<Proposition[]>(initialPropositions);
  const [playerStates, setPlayerStates] = useState<PlayerState[]>([]);
  const [isChanged, setIsChanged] = useState<boolean>(false);
  const [isLoadedGame, setIsLoadedGame] = useState<boolean>(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);

  // Auto-save effect - DÉSACTIVÉ pour les parties chargées
  useEffect(() => {
    if (isChanged && !isLoadedGame && onAutoSave && !hasUnsavedChanges) {
      const timeoutId = setTimeout(() => {
        onAutoSave();
      }, 1000); // Délai de 1 seconde pour éviter trop de sauvegardes

      return () => clearTimeout(timeoutId);
    }
  }, [isChanged, isLoadedGame, onAutoSave, hasUnsavedChanges]);

  // Fonction pour confirmer les changements non sauvegardés
  const confirmUnsavedChanges = useCallback((): boolean => {
    if (hasUnsavedChanges) {
      return window.confirm(
        "Vous avez des modifications non sauvegardées. Voulez-vous vraiment continuer ? Toutes les modifications seront perdues."
      );
    }
    return true;
  }, [hasUnsavedChanges]);

  const generateNewGrids = useCallback((playerCount: number = playerStates.length || 6) => {
    if (!confirmUnsavedChanges()) return;
    
    const grids = generateGrids(propositions, playerCount, itemsPerGrid);
    setPlayerStates((prev) => {
      const newStates = Array(playerCount)
        .fill(null)
        .map((_, i) => ({
          name: prev[i]?.name || `Joueur ${i + 1}`,
          grid: grids[i],
          validatedItems: new Map(),
        }));
      return newStates;
    });
    setIsChanged(true);
    setIsLoadedGame(false);
    setHasUnsavedChanges(false);
  }, [propositions, playerStates.length, itemsPerGrid, confirmUnsavedChanges]);

  const addPlayer = useCallback(() => {
    if (playerStates.length < maxPlayers) {
      const newGrid = generateGrid(propositions, itemsPerGrid);
      setPlayerStates((prev) => [
        ...prev,
        {
          name: `Joueur ${prev.length + 1}`,
          grid: newGrid,
          validatedItems: new Map(),
        },
      ]);
    }
    setIsChanged(true);
    if (isLoadedGame) {
      setHasUnsavedChanges(true);
    }
  }, [playerStates.length, maxPlayers, propositions, itemsPerGrid, isLoadedGame]);

  const removePlayer = useCallback((index: number) => {
    if (playerStates.length > minPlayers) {
      setPlayerStates((prev) => prev.filter((_, i) => i !== index));
    }
    setIsChanged(true);
    if (isLoadedGame) {
      setHasUnsavedChanges(true);
    }
  }, [playerStates.length, minPlayers, isLoadedGame]);

  const updatePlayerName = useCallback((index: number, newName: string) => {
    setPlayerStates((prev) =>
      prev.map((state, i) =>
        i === index ? { ...state, name: newName } : state
      )
    );
    setIsChanged(true);
    if (isLoadedGame) {
      setHasUnsavedChanges(true);
    }
  }, [isLoadedGame]);

  const validateItem = useCallback((
    playerIndex: number,
    itemIndex: number,
    description: string
  ) => {
    setPlayerStates((prev) =>
      prev.map((state, i) => {
        if (i === playerIndex) {
          const newValidatedItems = new Map(state.validatedItems);
          newValidatedItems.set(itemIndex, {
            propositionId: state.grid[itemIndex],
            description,
            timestamp: Date.now(),
          });
          return { ...state, validatedItems: newValidatedItems };
        }
        return state;
      })
    );
    setIsChanged(true);
    if (isLoadedGame) {
      setHasUnsavedChanges(true);
    }
  }, [isLoadedGame]);

  const removeValidation = useCallback((playerIndex: number, itemIndex: number) => {
    setPlayerStates((prev) =>
      prev.map((state, i) => {
        if (i === playerIndex) {
          const newValidatedItems = new Map(state.validatedItems);
          newValidatedItems.delete(itemIndex);
          return { ...state, validatedItems: newValidatedItems };
        }
        return state;
      })
    );
    setIsChanged(true);
    if (isLoadedGame) {
      setHasUnsavedChanges(true);
    }
  }, [isLoadedGame]);

  const addProposition = useCallback((text: string) => {
    setPropositions((prev) => [...prev, { text, id: crypto.randomUUID() }]);
    setIsChanged(true);
    if (isLoadedGame) {
      setHasUnsavedChanges(true);
    }
  }, [isLoadedGame]);

  const removeProposition = useCallback((id: string) => {
    setPropositions((prev) => prev.filter((p) => p.id !== id));
    setIsChanged(true);
    if (isLoadedGame) {
      setHasUnsavedChanges(true);
    }
  }, [isLoadedGame]);

  const loadGameState = useCallback((gameState: GameState, updateIsChanged = true) => {
    if (hasUnsavedChanges && !confirmUnsavedChanges()) {
      return;
    }
    
    setPropositions(gameState.propositions);
    setPlayerStates(
      gameState.players.map((player) => ({
        ...player,
        validatedItems: new Map(player.validatedItems),
      }))
    );
    if (updateIsChanged) {
      setIsChanged(true);
    }
    setIsLoadedGame(true);
    setHasUnsavedChanges(false);
  }, [hasUnsavedChanges, confirmUnsavedChanges]);

  return {
    propositions,
    playerStates,
    isChanged,
    isLoadedGame,
    hasUnsavedChanges,
    setPropositions,
    setPlayerStates,
    setIsChanged,
    setIsLoadedGame,
    generateNewGrids,
    addPlayer,
    removePlayer,
    updatePlayerName,
    validateItem,
    removeValidation,
    addProposition,
    removeProposition,
    loadGameState,
    confirmUnsavedChanges,
  };
};