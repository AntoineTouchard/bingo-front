import React from "react";
import { Shuffle, Plus, Upload, Download, User, CheckCircle } from "lucide-react";
import { SeePreviousHistory } from "./SeePreviousHistory";
import { Tooltip } from "./Tooltip";
import { GameState } from "../types";

interface GameHeaderProps {
  playerCount: number;
  maxPlayers: number;
  isChanged: boolean;
  playerOnline?: number;
  showAllButtons?: boolean;
  onAddPlayer: () => void;
  onGenerateNewGrids: () => void;
  onDownloadGame: () => void;
  onLoadGame: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onLoadThisGame: (gameState: GameState) => void;
}

export const GameHeader: React.FC<GameHeaderProps> = ({
  playerCount,
  maxPlayers,
  isChanged,
  playerOnline,
  showAllButtons,
  onAddPlayer,
  onGenerateNewGrids,
  onDownloadGame,
  onLoadGame,
  onLoadThisGame,
}) => {
  return (
    <div className="flex justify-between flex-col md:flex-row gap-[15px] md:gap-[0px] items-center mb-8">
      <h1 className="text-3xl font-bold text-indigo-700">Bingo Anytime</h1>
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={onAddPlayer}
          disabled={playerCount >= maxPlayers}
          className="flex items-center text-sm gap-2 bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus size={16} />
          Ajouter un joueur
        </button>
        <button
          onClick={onGenerateNewGrids}
          className="flex items-center text-sm gap-2 bg-indigo-600 text-white px-3 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Shuffle size={16} />
          Nouvelles grilles
        </button>
        
        {/* Indicateur de sauvegarde automatique */}
        <Tooltip content="Sauvegarde automatique activée">
          <div className="flex items-center text-sm gap-2 bg-green-100 text-green-700 px-3 py-2 rounded-lg border border-green-200">
            <CheckCircle size={16} />
            Auto-save
          </div>
        </Tooltip>

        {showAllButtons && (
          <>
            <button
              onClick={onDownloadGame}
              className="flex items-center text-sm gap-2 bg-indigo-600 text-white px-3 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Download size={16} />
              Télécharger
            </button>
            <label className="flex items-center text-sm gap-2 bg-indigo-600 text-white px-3 py-2 rounded-lg hover:bg-indigo-700 transition-colors cursor-pointer">
              <Upload size={16} />
              Upload
              <input
                type="file"
                accept=".json"
                onChange={onLoadGame}
                className="hidden"
              />
            </label>
          </>
        )}
        <SeePreviousHistory loadThisGame={onLoadThisGame} />
        <Tooltip content="Utilisateurs sur le site">
          <div className="flex flex-row items-center gap-1 text-sm cursor-pointer">
            <User size={16} /> {playerOnline}
          </div>
        </Tooltip>
      </div>
    </div>
  );
};