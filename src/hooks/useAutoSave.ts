import { useCallback, useRef } from 'react';
import { saveJson } from '../services/Api.service';
import { GameState, PlayerState, Proposition } from '../types';

interface UseAutoSaveReturn {
  autoSave: (gameState: GameState) => Promise<void>;
  isAutoSaving: boolean;
}

export const useAutoSave = (): UseAutoSaveReturn => {
  const isAutoSaving = useRef(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const autoSave = useCallback(async (gameState: GameState) => {
    // Éviter les sauvegardes multiples simultanées
    if (isAutoSaving.current) {
      return;
    }

    // Débounce pour éviter trop de sauvegardes rapides
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(async () => {
      try {
        isAutoSaving.current = true;
        await saveJson(gameState);
        console.log('Auto-save completed');
      } catch (error) {
        console.error('Auto-save failed:', error);
      } finally {
        isAutoSaving.current = false;
      }
    }, 500); // Délai de 500ms pour débouncer
  }, []);

  return {
    autoSave,
    isAutoSaving: isAutoSaving.current,
  };
};