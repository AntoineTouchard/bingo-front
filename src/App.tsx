import React, { useEffect } from "react";
import { initialPropositions } from "./types";
import { useGameState } from "./hooks/useGameState";
import { useGamePersistence } from "./hooks/useGamePersistence";
import { useSocket } from "./hooks/useSocket";
import { PropositionManager } from "./components/PropositionManager";
import { GameHeader } from "./components/GameHeader";
import { PlayerGrid } from "./components/PlayerGrid";

function App() {
  const ITEMS_PER_GRID = 6;
  const MIN_PLAYERS = 0;
  const MAX_PLAYERS = 100;
  const params = new URLSearchParams(window.location.search);
  const showAllButtons = params.get("showAllButtons");

  const gameState = useGameState(initialPropositions, ITEMS_PER_GRID, MIN_PLAYERS, MAX_PLAYERS);
  const {
    propositions,
    playerStates,
    isChanged,
    setIsChanged,
    generateNewGrids,
    addPlayer,
    removePlayer,
    updatePlayerName,
    validateItem,
    removeValidation,
    addProposition,
    removeProposition,
    loadGameState,
  } = gameState;

  const persistence = useGamePersistence(propositions, playerStates);
  const { downloadGame, loadLastGame, loadGameFromFile } = persistence;

  const handleNewChanges = (data: any) => {
    loadGameState(data, false);
  };

  const { playerOnline } = useSocket(handleNewChanges);

  const handleDownloadGame = async () => {
    try {
      await downloadGame();
    } catch (error) {
      alert(error instanceof Error ? error.message : "Erreur lors du téléchargement");
    }
  };

  const handleLoadGame = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        const gameStateData = await loadGameFromFile(file);
        if (gameStateData) {
          loadGameState(gameStateData);
        }
      } catch (error) {
        alert(error instanceof Error ? error.message : "Erreur lors du chargement du fichier");
      }
    }
  };

  const handleLoadLastGame = async () => {
    try {
      const lastGameState = await loadLastGame();
      if (lastGameState) {
        loadGameState(lastGameState, false);
      } else {
        console.log("Aucune sauvegarde trouvée, génération de nouvelles grilles");
        generateNewGrids();
      }
    } catch (error) {
      console.error("Erreur lors du chargement :", error);
      generateNewGrids();
    }
  };

  useEffect(() => {
    handleLoadLastGame();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <GameHeader
          playerCount={playerStates.length}
          maxPlayers={MAX_PLAYERS}
          isChanged={isChanged}
          playerOnline={playerOnline}
          showAllButtons={!!showAllButtons}
          onAddPlayer={addPlayer}
          onGenerateNewGrids={() => generateNewGrids()}
          onDownloadGame={handleDownloadGame}
          onLoadGame={handleLoadGame}
          onLoadThisGame={loadGameState}
        />

        <PropositionManager
          propositions={propositions}
          onAddProposition={addProposition}
          onRemoveProposition={removeProposition}
        />

        <PlayerGrid
          playerStates={playerStates}
          propositions={propositions}
          minPlayers={MIN_PLAYERS}
          onUpdatePlayerName={updatePlayerName}
          onRemovePlayer={removePlayer}
          onValidateItem={validateItem}
          onRemoveValidation={removeValidation}
        />
      </div>
    </div>
  );
}

export default App;