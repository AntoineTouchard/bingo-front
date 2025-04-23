import React, { useState, useEffect } from 'react';
import { Shuffle, Plus, X as XIcon, Edit2, Check, Save, Upload } from 'lucide-react';

interface Proposition {
  text: string;
  id: string;
}

interface ValidatedItem {
  propositionId: string;
  description: string;
  timestamp: number;
}

interface PlayerState {
  name: string;
  grid: string[];
  validatedItems: Map<number, ValidatedItem>;
}

interface GameState {
  players: PlayerState[];
  propositions: Proposition[];
}

const initialPropositions: Proposition[] = [
  "Max annule la piscine",
  "Il y a un problème d'export sur la croix rouge",
  "Quelqu'un laisse la machine à café vide",
  "Des tasses sont laissées sales",
  "On livre en avance",
  "Kévin dit : Je dois venir avec une brouette",
  "Antoine raconte l'histoire du paillasson",
  "Les sys-admin bricolent",
  "Corentin a une question",
  "Il n'y a plus de chargeur dispo",
  "Anytime paye son coup ou a mangé",
  "Il fait trop chaud / froid pour travailler à Nantes",
  "Dans la salle de réunion : Vous nous entendez ?",
  "Le tel de Antoine Babs sonne",
  "Quelqu'un porte un pull Anytime",
  "Il y a une fuite d'eau",
  "Petit déjeuner avec Bertrand",
  "Quelqu'un est croissanté",
  "Rollback en prod",
  "Plus personne ne veut aller à Paola",
  "Il manque un meuble dans les locaux",
  "Picota",
  "Quelqu'un veut venir manger sans avoir mis un pouce",
  "Seb fait une métaphore",
  "Audrey tape Antoine Babs"
].map(text => ({ text, id: crypto.randomUUID() }));

function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

function generateGrid(propositions: Proposition[], itemsPerGrid: number): string[] {
  return shuffleArray([...propositions]).slice(0, itemsPerGrid).map(p => p.id);
}

function generateGrids(propositions: Proposition[], count: number, itemsPerGrid: number): string[][] {
  return Array(count).fill(null).map(() => generateGrid(propositions, itemsPerGrid));
}

interface BingoGridProps {
  items: string[];
  playerName: string;
  onNameChange: (name: string) => void;
  onRemove: () => void;
  isRemovable: boolean;
  propositions: Proposition[];
  validatedItems: Map<number, ValidatedItem>;
  onValidateItem: (index: number, description: string) => void;
  onRemoveValidation: (index: number) => void;
}

function Modal({ 
  isOpen, 
  onClose, 
  children 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  children: React.ReactNode;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4">
        <div className="relative">
          {children}
        </div>
      </div>
    </div>
  );
}

function BingoGrid({ 
  items, 
  playerName, 
  onNameChange, 
  onRemove, 
  isRemovable, 
  propositions,
  validatedItems,
  onValidateItem,
  onRemoveValidation
}: BingoGridProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(playerName);
  const [selectedItem, setSelectedItem] = useState<{index: number; text: string} | null>(null);
  const [description, setDescription] = useState("");

  const handleNameSubmit = () => {
    onNameChange(editedName);
    setIsEditing(false);
  };

  const handleValidation = () => {
    if (selectedItem && description.trim()) {
      onValidateItem(selectedItem.index, description.trim());
      setDescription("");
      setSelectedItem(null);
    }
  };

  const getPropositionById = (id: string) => {
    return propositions.find(p => p.id === id)?.text || '';
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-4">
        {isEditing ? (
          <div className="flex gap-2 items-center">
            <input
              type="text"
              value={editedName}
              onChange={(e) => setEditedName(e.target.value)}
              className="text-xl font-bold text-indigo-600 border-b-2 border-indigo-200 focus:border-indigo-600 outline-none"
              onKeyPress={(e) => e.key === 'Enter' && handleNameSubmit()}
              autoFocus
            />
            <button
              onClick={handleNameSubmit}
              className="p-1 hover:bg-indigo-50 rounded-full"
            >
              <Check size={18} className="text-indigo-600" />
            </button>
          </div>
        ) : (
          <div className="flex gap-2 items-center">
            <h2 className="text-xl font-bold text-indigo-600">{playerName}</h2>
            <button
              onClick={() => setIsEditing(true)}
              className="p-1 hover:bg-indigo-50 rounded-full"
            >
              <Edit2 size={18} className="text-indigo-400" />
            </button>
          </div>
        )}
        {isRemovable && (
          <button
            onClick={onRemove}
            className="p-1 hover:bg-red-50 rounded-full"
          >
            <XIcon size={18} className="text-red-500" />
          </button>
        )}
      </div>
      <div className="grid grid-cols-2 gap-4">
        {items.map((itemId, index) => {
          const isValidated = validatedItems.has(index);
          const validatedItem = validatedItems.get(index);
          const propositionText = getPropositionById(itemId);
          
          return (
            <div key={index} className="relative">
              <div 
                onClick={() => !isValidated && setSelectedItem({ index, text: propositionText })}
                className={`p-4 border-2 rounded-lg cursor-pointer h-[120px] flex flex-col items-center justify-center text-center transition-all duration-200 text-sm ${
                  isValidated
                    ? 'bg-indigo-600 text-white border-indigo-700 shadow-inner'
                    : 'border-indigo-200 hover:bg-indigo-50'
                }`}
              >
                <div>{propositionText}</div>
                {isValidated && (
                  <>
                    <div className="mt-2 text-xs italic">{validatedItem?.description}</div>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveValidation(index);
                      }}
                      className="absolute top-2 right-2 p-1 hover:bg-indigo-700 rounded-full"
                    >
                      <XIcon size={14} />
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <Modal 
        isOpen={selectedItem !== null} 
        onClose={() => setSelectedItem(null)}
      >
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Validation de la proposition</h3>
          <p className="text-gray-600">{selectedItem?.text}</p>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Décrivez le contexte..."
            className="w-full p-2 border rounded-lg"
            rows={3}
            autoFocus
          />
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setSelectedItem(null)}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
            >
              Annuler
            </button>
            <button
              onClick={handleValidation}
              disabled={!description.trim()}
              className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50"
            >
              Valider
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function PropositionManager({ 
  propositions,
  onAddProposition,
  onRemoveProposition 
}: {
  propositions: Proposition[];
  onAddProposition: (text: string) => void;
  onRemoveProposition: (id: string) => void;
}) {
  const [newProposition, setNewProposition] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newProposition.trim()) {
      onAddProposition(newProposition.trim());
      setNewProposition("");
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
      <h2 className="text-xl font-bold text-indigo-600 mb-4">Gérer les propositions</h2>
      <form onSubmit={handleSubmit} className="flex gap-2 mb-4">
        <input
          type="text"
          value={newProposition}
          onChange={(e) => setNewProposition(e.target.value)}
          placeholder="Nouvelle proposition..."
          className="flex-1 p-2 border rounded-lg"
        />
        <button
          type="submit"
          disabled={!newProposition.trim()}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
        >
          Ajouter
        </button>
      </form>
      <div className="max-h-40 overflow-y-auto">
        {propositions.map((prop) => (
          <div key={prop.id} className="flex justify-between items-center py-2 border-b">
            <span>{prop.text}</span>
            <button
              onClick={() => onRemoveProposition(prop.id)}
              className="p-1 hover:bg-red-50 rounded-full"
            >
              <XIcon size={16} className="text-red-500" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function App() {
  const [propositions, setPropositions] = useState<Proposition[]>(initialPropositions);
  const [playerStates, setPlayerStates] = useState<PlayerState[]>([]);
  const ITEMS_PER_GRID = 6;
  const MIN_PLAYERS = 2;
  const MAX_PLAYERS = 8;

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
  };

  const removePlayer = (index: number) => {
    if (playerStates.length > MIN_PLAYERS) {
      setPlayerStates(prev => prev.filter((_, i) => i !== index));
    }
  };

  const updatePlayerName = (index: number, newName: string) => {
    setPlayerStates(prev => prev.map((state, i) => 
      i === index ? { ...state, name: newName } : state
    ));
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
  };

  const addProposition = (text: string) => {
    setPropositions(prev => [...prev, { text, id: crypto.randomUUID() }]);
  };

  const removeProposition = (id: string) => {
    setPropositions(prev => prev.filter(p => p.id !== id));
  };

  const saveGame = async () => {
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
      a.download = `bingo-anytime-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      // Save to source file
      const response = await fetch('/src/bingo.json', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(gameState, null, 2)
      });

      if (!response.ok) {
        throw new Error('Failed to save to source file');
      }
    } catch (error) {
      console.error('Error saving game:', error);
      alert('Erreur lors de la sauvegarde du fichier source');
    }
  };

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
    }
  };

  useEffect(() => {
    generateNewGrids();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-indigo-800">Bingo Anytime</h1>
          <div className="flex gap-4">
            <button
              onClick={addPlayer}
              disabled={playerStates.length >= MAX_PLAYERS}
              className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus size={20} />
              Ajouter un joueur
            </button>
            <button
              onClick={() => generateNewGrids()}
              className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Shuffle size={20} />
              Nouvelles grilles
            </button>
            <button
              onClick={saveGame}
              className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Save size={20} />
              Sauvegarder
            </button>
            <label className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors cursor-pointer">
              <Upload size={20} />
              Charger
              <input
                type="file"
                accept=".json"
                onChange={loadGame}
                className="hidden"
              />
            </label>
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