import React, { useState, useEffect } from 'react';
import { Shuffle, Plus, Save, Upload, Download } from 'lucide-react';
import { fetchLastSave, saveJson } from './services/Api.service';
import { GameState, initialPropositions, PlayerState, Proposition } from './types';
import { generateGrid, generateGrids } from './services/utils';
import { PropositionManager } from './components/PropositionManager';
import { BingoGrid } from './components/BingoGrid';
import { SeePreviousHistory } from './components/SeePreviousHistory';


function App() {
  const [propositions, setPropositions] = useState<Proposition[]>(initialPropositions);
  const [playerStates, setPlayerStates] = useState<PlayerState[]>([]);
  const [isChanged, setIsChanged] = useState<boolean>(false);
  const ITEMS_PER_GRID = 6;
  const MIN_PLAYERS = 0;
  const MAX_PLAYERS = 100;

  const generateNewGrids = (playerCount: number = playerStates.length || 6) => {
    const grids = generateGrids(propositions, playerCount, ITEMS_PER_GRID);
    setPlayerStates(prev => {
      const newStates = Array(playerCount).fill(null).map((_, i) => ({
        name: prev[i]?.name || `Joueur ${i + 1}`,
        grid: grids[i],
        validatedItems: new Map()
      }));
      return newStates;
    });
    setIsChanged(true);
  };

  const addPlayer = () => {
    if (playerStates.length < MAX_PLAYERS) {
      const newGrid = generateGrid(propositions, ITEMS_PER_GRID);
      setPlayerStates(prev => [...prev, {
        name: `Joueur ${prev.length + 1}`,
        grid: newGrid,
        validatedItems: new Map()
      }]);
    }
    setIsChanged(true);
  };

  const removePlayer = (index: number) => {
    if (playerStates.length > MIN_PLAYERS) {
      setPlayerStates(prev => prev.filter((_, i) => i !== index));
    }
    setIsChanged(true);
  };

  const updatePlayerName = (index: number, newName: string) => {
    setPlayerStates(prev => prev.map((state, i) => 
      i === index ? { ...state, name: newName } : state
    ));
    setIsChanged(true);
  };

  const validateItem = (playerIndex: number, itemIndex: number, description: string) => {
    setPlayerStates(prev => prev.map((state, i) => {
      if (i === playerIndex) {
        const newValidatedItems = new Map(state.validatedItems);
        newValidatedItems.set(itemIndex, {
          propositionId: state.grid[itemIndex],
          description,
          timestamp: Date.now()
        });
        return { ...state, validatedItems: newValidatedItems };
      }
      return state;
    }));
    setIsChanged(true);
  };

  const removeValidation = (playerIndex: number, itemIndex: number) => {
    setPlayerStates(prev => prev.map((state, i) => {
      if (i === playerIndex) {
        const newValidatedItems = new Map(state.validatedItems);
        newValidatedItems.delete(itemIndex);
        return { ...state, validatedItems: newValidatedItems };
      }
      return state;
    }));
    setIsChanged(true);
  };

  const addProposition = (text: string) => {
    setPropositions(prev => [...prev, { text, id: crypto.randomUUID() }]);
    setIsChanged(true);
  };

  const removeProposition = (id: string) => {
    setPropositions(prev => prev.filter(p => p.id !== id));
    setIsChanged(true);
  };

  const saveGame = async () => {
    const gameState: GameState = {
      players: playerStates.map(playerState => ({
        ...playerState,
        validatedItems: Array.from(playerState.validatedItems.entries())
      })),
      propositions
    };
    
    try {
      saveJson(gameState)
      setIsChanged(false);
    } catch (error) {
      console.error('Error saving game:', error);
      alert('Erreur lors de la sauvegarde du fichier source');
    }
  };

  const downloadGame = async () => {
    const gameState: GameState = {
      players: playerStates.map(state => ({
        ...state,
        validatedItems: Array.from(state.validatedItems.entries())
      })),
      propositions
    };
    
    try {
      // Save to file download
      const blob = new Blob([JSON.stringify(gameState, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `bingo-anytime-${new Date().toISOString().replace('T', '_').substring(0, 19)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error saving game:', error);
      alert('Erreur lors de la sauvegarde du fichier source');
    }
  };

  const loadLastGame = async () => {
    try {
      const lastSave = await fetchLastSave()
      if(!lastSave?.data) {
        alert('Aucune sauvegarde trouvée');
        return;
      }
      const gameState = JSON.parse(lastSave.data) as GameState;
      setPropositions(gameState.propositions);
      setPlayerStates(gameState.players.map(player => ({
        ...player,
        validatedItems: new Map(player.validatedItems)
      })));
    } catch (error) {
      alert('Erreur lors du chargement du fichier : ' + error);
      generateNewGrids();
    }
  };

  const loadThisGame = (gameState: GameState) => {
    setPropositions(gameState.propositions);
    setPlayerStates(gameState.players.map(player => ({
      ...player,
      validatedItems: new Map(player.validatedItems)
    })));
    setIsChanged(true);
  }

  const loadGame = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const gameState = JSON.parse(e.target?.result as string) as GameState;
          setPropositions(gameState.propositions);
          setPlayerStates(gameState.players.map(player => ({
            ...player,
            validatedItems: new Map(player.validatedItems)
          })));
        } catch (error) {
          console.error('Error loading game:', error);
          alert('Erreur lors du chargement du fichier');
        }
      };
      reader.readAsText(file);
      setIsChanged(true);
    }
  };

  useEffect(() => {
    loadLastGame();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between flex-col md:flex-row gap-[15px] md:gap-[0px] items-center mb-8">
          <h1 className="text-3xl font-bold text-indigo-700">Bingo Anytime</h1>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={addPlayer}
              disabled={playerStates.length >= MAX_PLAYERS}
              className="flex items-center text-sm gap-2 bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus size={16} />
              Ajouter un joueur
            </button>
            <button
              onClick={() => generateNewGrids()}
              className="flex items-center text-sm gap-2 bg-indigo-600 text-white px-3 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Shuffle size={16} />
              Nouvelles grilles
            </button>
            <button
              onClick={saveGame}
              disabled={!isChanged}
              style={{ opacity: isChanged ? 1 : 0.5, pointerEvents: isChanged ? 'auto' : 'none' }}
              className="flex items-center text-sm gap-2 bg-indigo-600 text-white px-3 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Save size={16} />
              Sauvegarder
            </button>
            <button
              onClick={downloadGame}
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
                onChange={loadGame}
                className="hidden"
              />
            </label>
            <SeePreviousHistory loadThisGame={loadThisGame}/>
            {/* <button
              onClick={loadLastGame}
              disabled={!isChanged}
              style={{ opacity: isChanged ? 1 : 0.5, pointerEvents: isChanged ? 'auto' : 'none' }}
              className="flex items-center text-sm gap-2 bg-indigo-600 text-white px-3 py-1 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <RefreshCcw size={16} />
              Dernière sauvegarde  
            </button> */}
          </div>
        </div>

        <PropositionManager
          propositions={propositions}
          onAddProposition={addProposition}
          onRemoveProposition={removeProposition}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {playerStates.map((state, index) => (
            <BingoGrid 
              key={index} 
              items={state.grid}
              playerName={state.name}
              onNameChange={(newName) => updatePlayerName(index, newName)}
              onRemove={() => removePlayer(index)}
              isRemovable={playerStates.length > MIN_PLAYERS}
              propositions={propositions}
              validatedItems={state.validatedItems}
              onValidateItem={(itemIndex, description) => validateItem(index, itemIndex, description)}
              onRemoveValidation={(itemIndex) => removeValidation(index, itemIndex)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;