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
  setHasUnsavedChanges: (hasChanges: boolean) => void;
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

  // Auto-save effect - ACTIVÉ pour toutes les actions
  useEffect(() => {
    if (isChanged && onAutoSave) {
      const timeoutId = setTimeout(() => {
        onAutoSave();
      }, 1000); // Délai de 1 seconde pour éviter trop de sauvegardes

      return () => clearTimeout(timeoutId);
    }
  }, [isChanged, onAutoSave]);

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
          id: prev[i]?.id || crypto.randomUUID(), // Conserver l'ID existant ou en créer un nouveau
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
          id: crypto.randomUUID(), // Générer un ID unique pour le nouveau joueur
          name: `Joueur ${prev.length + 1}`,
          grid: newGrid,
          validatedItems: new Map(),
        },
      ]);
      setIsChanged(true);
    }
  }, [playerStates.length, maxPlayers, propositions, itemsPerGrid]);

  const removePlayer = useCallback((index: number) => {
    if (playerStates.length > minPlayers) {
      setPlayerStates((prev) => prev.filter((_, i) => i !== index));
      setIsChanged(true);
    }
  }, [playerStates.length, minPlayers]);

  const updatePlayerName = useCallback((index: number, newName: string) => {
    setPlayerStates((prev) =>
      prev.map((state, i) =>
        i === index ? { ...state, name: newName } : state
      )
    );
    setIsChanged(true);
  }, []);

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
  }, []);

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
  }, []);

  const addProposition = useCallback((text: string) => {
    setPropositions((prev) => [...prev, { text, id: crypto.randomUUID() }]);
    setIsChanged(true);
  }, []);

  const removeProposition = useCallback((id: string) => {
    setPropositions((prev) => prev.filter((p) => p.id !== id));
    setIsChanged(true);
  }, []);

  const loadGameState = useCallback((gameState: GameState, updateIsChanged = true, markAsLoaded = true) => {
    if (hasUnsavedChanges && !confirmUnsavedChanges()) {
      return;
    }
    
    setPropositions(gameState.propositions);
    setPlayerStates(
      gameState.players.map((player) => ({
        id: player.id || crypto.randomUUID(), // Assurer qu'il y a toujours un ID
        name: player.name,
        grid: player.grid,
        validatedItems: new Map(player.validatedItems),
      }))
    );
    setIsChanged(false); // Important: réinitialiser isChanged lors du chargement
    setIsLoadedGame(markAsLoaded); // Permettre de contrôler si on marque comme "chargé"
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
    setHasUnsavedChanges,
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