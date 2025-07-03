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
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {playerStates.map((state, index) => (
        <BingoGrid
          key={index}
          items={state.grid}
          playerName={state.name}
          onNameChange={(newName) => onUpdatePlayerName(index, newName)}
          onRemove={() => onRemovePlayer(index)}
          isRemovable={playerStates.length > minPlayers}
          propositions={propositions}
          validatedItems={state.validatedItems}
          onValidateItem={(itemIndex, description) =>
            onValidateItem(index, itemIndex, description)
          }
          onRemoveValidation={(itemIndex) =>
            onRemoveValidation(index, itemIndex)
          }
          hasUnsavedChanges={hasUnsavedChanges}
        />
      ))}
    </div>
  );
};