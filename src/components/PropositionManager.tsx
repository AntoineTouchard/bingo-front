import { XIcon } from "lucide-react";
import { useState } from "react";
import { Proposition } from "../types";

export const PropositionManager = ({ 
  propositions,
  onAddProposition,
  onRemoveProposition 
}: {
  propositions: Proposition[];
  onAddProposition: (text: string) => void;
  onRemoveProposition: (id: string) => void;
}) => {
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
          className="flex-1 p-2 border rounded-lg outline-indigo-700"
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