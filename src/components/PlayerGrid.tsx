import React from "react";
import { BingoGrid } from "./BingoGrid";
import { PlayerState, Proposition } from "../types";

interface PlayerGridProps {
  playerStates: PlayerState[];
  propositions: Proposition[];
  minPlayers: number;
  onUpdatePlayerName: (index: number, newName: string) => void;
  onRemovePlayer: (index: number) => void;
  onValidateItem: (playerIndex: number, itemIndex: number, description: string) => void;
  onRemoveValidation: (playerIndex: number, itemIndex: number) => void;
}

export const PlayerGrid: React.FC<PlayerGridProps> = ({
  playerStates,
  propositions,
  minPlayers,
  onUpdatePlayerName,
  onRemovePlayer,
  onValidateItem,
  onRemoveValidation,
}) => {
  // Créer un tableau avec les indices originaux et trier par nombre de cartes validées
  const sortedPlayersWithIndex = playerStates
    .map((state, originalIndex) => ({
      state,
      originalIndex,
      validatedCount: state.validatedItems.size,
    }))
    .sort((a, b) => b.validatedCount - a.validatedCount); // Tri décroissant

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {sortedPlayersWithIndex.map(({ state, originalIndex, validatedCount }, displayIndex) => (
        <div key={originalIndex} className="relative">
          {/* Badge de position pour les 3 premiers */}
          {displayIndex < 3 && validatedCount > 0 && (
            <div className={`absolute -top-2 -right-2 z-10 w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-medium ${
              displayIndex === 0 
                ? 'bg-gradient-to-br from-yellow-400 to-yellow-500' 
                : displayIndex === 1 
                ? 'bg-gradient-to-br from-gray-400 to-gray-500'
                : 'bg-gradient-to-br from-amber-600 to-amber-700'
            }`}>
              {displayIndex + 1}
            </div>
          )}
          
          <BingoGrid
            items={state.grid}
            playerName={state.name}
            onNameChange={(newName) => onUpdatePlayerName(originalIndex, newName)}
            onRemove={() => onRemovePlayer(originalIndex)}
            isRemovable={playerStates.length > minPlayers}
            propositions={propositions}
            validatedItems={state.validatedItems}
            onValidateItem={(itemIndex, description) =>
              onValidateItem(originalIndex, itemIndex, description)
            }
            onRemoveValidation={(itemIndex) =>
              onRemoveValidation(originalIndex, itemIndex)
            }
          />
        </div>
      ))}
    </div>
  );
};