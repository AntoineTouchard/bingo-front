import React from "react";
import { Shuffle, Plus, Save, Upload, Download, User, Gamepad2, Zap } from "lucide-react";
import { SeePreviousHistory } from "./SeePreviousHistory";
import { Tooltip } from "./Tooltip";
import { GameState } from "../types";

interface GameHeaderProps {
  playerCount: number;
  maxPlayers: number;
  isChanged: boolean;
  isLoadedGame: boolean;
  playerOnline?: number;
  showAllButtons?: boolean;
  onAddPlayer: () => void;
  onGenerateNewGrids: () => void;
  onSaveGame: () => void;
  onDownloadGame: () => void;
  onLoadGame: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onLoadThisGame: (gameState: GameState) => void;
}

export const GameHeader: React.FC<GameHeaderProps> = ({
  playerCount,
  maxPlayers,
  isChanged,
  isLoadedGame,
  playerOnline,
  showAllButtons,
  onAddPlayer,
  onGenerateNewGrids,
  onSaveGame,
  onDownloadGame,
  onLoadGame,
  onLoadThisGame,
}) => {
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-soft p-6 mb-8 animate-fade-in">
      <div className="flex justify-between flex-col lg:flex-row gap-6 lg:gap-0 items-center">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl shadow-medium">
            <Gamepad2 size={28} className="text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
              Bingo Anytime
            </h1>
            <div className="flex items-center gap-2">
              <p className="text-gray-500 text-sm">Créez et jouez en temps réel</p>
              {!isLoadedGame && (
                <div className="flex items-center gap-1 bg-success-100 text-success-700 px-2 py-1 rounded-full text-xs font-medium">
                  <Zap size={12} />
                  Sauvegarde auto
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex gap-3 flex-wrap justify-center lg:justify-end">
          <button
            onClick={onAddPlayer}
            disabled={playerCount >= maxPlayers}
            className="flex items-center gap-2 bg-gradient-to-r from-success-500 to-success-600 text-white px-4 py-2.5 rounded-xl hover:from-success-600 hover:to-success-700 transition-all duration-200 shadow-soft hover:shadow-medium disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            <Plus size={18} />
            Ajouter joueur
          </button>
          
          <button
            onClick={onGenerateNewGrids}
            className="flex items-center gap-2 bg-gradient-to-r from-primary-500 to-primary-600 text-white px-4 py-2.5 rounded-xl hover:from-primary-600 hover:to-primary-700 transition-all duration-200 shadow-soft hover:shadow-medium font-medium"
          >
            <Shuffle size={18} />
            Nouvelles grilles
          </button>
          
          {/* Afficher le bouton sauvegarder seulement si c'est une partie chargée */}
          {isLoadedGame && (
            <button
              onClick={onSaveGame}
              disabled={!isChanged}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all duration-200 font-medium ${
                isChanged
                  ? "bg-gradient-to-r from-warning-500 to-warning-600 text-white hover:from-warning-600 hover:to-warning-700 shadow-soft hover:shadow-medium"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
              }`}
            >
              <Save size={18} />
              Sauvegarder
            </button>
          )}
          
          {showAllButtons && (
            <>
              <button
                onClick={onDownloadGame}
                className="flex items-center gap-2 bg-gradient-to-r from-secondary-500 to-secondary-600 text-white px-4 py-2.5 rounded-xl hover:from-secondary-600 hover:to-secondary-700 transition-all duration-200 shadow-soft hover:shadow-medium font-medium"
              >
                <Download size={18} />
                Télécharger
              </button>
              
              <label className="flex items-center gap-2 bg-gradient-to-r from-primary-500 to-secondary-500 text-white px-4 py-2.5 rounded-xl hover:from-primary-600 hover:to-secondary-600 transition-all duration-200 shadow-soft hover:shadow-medium cursor-pointer font-medium">
                <Upload size={18} />
                Charger
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
          
          <Tooltip content="Utilisateurs connectés">
            <div className="flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2.5 rounded-xl font-medium">
              <User size={18} className="text-primary-500" />
              <span className="font-bold text-primary-600">{playerOnline}</span>
            </div>
          </Tooltip>
        </div>
      </div>
    </div>
  );
};