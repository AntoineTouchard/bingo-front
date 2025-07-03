import React from "react";
import { BingoGrid } from "./BingoGrid";
import { PlayerState, Proposition } from "../types";

interface PlayerGridProps {
  playerStates: PlayerState[];
  propositions: Proposition[];
  minPlayers: number;
  hasUnsavedChanges?: boolean;
  onUpdatePlayerName: (index: number, newName: string) => void;
  onRemovePlayer: (index: number) => void;
  onValidateItem: (playerIndex: number, itemIndex: number, description: string) => void;
  onRemoveValidation: (playerIndex: number, itemIndex: number) => void;
}

export const PlayerGrid: React.FC<PlayerGridProps> = ({
  playerStates,
  propositions,
  minPlayers,
  hasUnsavedChanges = false,
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

  // Fonction pour déterminer la position réelle en tenant compte des égalités
  const getRealPosition = (currentIndex: number, validatedCount: number) => {
    if (validatedCount === 0) return null;
    
    // Compter combien de joueurs ont un score strictement supérieur
    const playersWithHigherScore = sortedPlayersWithIndex
      .slice(0, currentIndex)
      .filter(player => player.validatedCount > validatedCount).length;
    
    return playersWithHigherScore + 1;
  };

  // Fonction pour vérifier s'il y a égalité à cette position
  const hasEqualityAtPosition = (currentIndex: number, validatedCount: number) => {
    if (validatedCount === 0) return false;
    
    // Vérifier s'il y a d'autres joueurs avec le même score
    return sortedPlayersWithIndex.some((player, index) => 
      index !== currentIndex && player.validatedCount === validatedCount
    );
  };

  // Fonction pour obtenir les couleurs du badge selon la position
  const getBadgeColors = (position: number) => {
    switch (position) {
      case 1:
        return 'bg-gradient-to-br from-yellow-400 to-yellow-500 border-yellow-300';
      case 2:
        return 'bg-gradient-to-br from-gray-400 to-gray-500 border-gray-300';
      case 3:
        return 'bg-gradient-to-br from-amber-600 to-amber-700 border-amber-500';
      default:
        return 'bg-gradient-to-br from-blue-500 to-blue-600 border-blue-400';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {sortedPlayersWithIndex.map(({ state, originalIndex, validatedCount }, displayIndex) => {
        const realPosition = getRealPosition(displayIndex, validatedCount);
        const hasEquality = hasEqualityAtPosition(displayIndex, validatedCount);
        const showBadge = realPosition && realPosition <= 3;

        return (
          <div key={originalIndex} className="relative">
            {/* Badge de position pour les 3 premiers avec gestion des égalités */}
            {showBadge && (
              <div className="absolute -top-3 -right-3 z-10 flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg border-2 ${getBadgeColors(realPosition)} ${
                  hasEquality ? 'animate-pulse' : ''
                }`}>
                  {realPosition}
                </div>
                
                {/* Indicateur d'égalité */}
                {hasEquality && (
                  <div className="mt-1 bg-white text-gray-700 px-2 py-0.5 rounded-full text-xs font-bold shadow-md border border-gray-200 animate-bounce-subtle">
                    Ex æquo
                  </div>
                )}
              </div>
            )}
            
            {/* Effet visuel pour les égalités */}
            <div className={`${hasEquality && showBadge ? 'ring-2 ring-warning-300 ring-opacity-50' : ''} rounded-2xl transition-all duration-300`}>
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
                hasUnsavedChanges={hasUnsavedChanges}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};