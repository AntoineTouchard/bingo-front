import { XIcon, Plus, Lightbulb } from "lucide-react";
import { useState } from "react";
import { Proposition } from "../types";

export const PropositionManager = ({
  propositions,
  onAddProposition,
  onRemoveProposition,
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
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-soft p-6 mb-8 animate-slide-up">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-gradient-to-br from-warning-400 to-warning-500 rounded-lg">
          <Lightbulb size={20} className="text-white" />
        </div>
        <h2 className="text-xl font-bold text-gray-800">
          Gérer les propositions
        </h2>
        <div className="ml-auto bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-sm font-medium">
          {propositions.length} proposition{propositions.length > 1 ? "s" : ""}
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="flex gap-3 mb-6">
        <input
          type="text"
          value={newProposition}
          onChange={(e) => setNewProposition(e.target.value)}
          placeholder="Nouvelle proposition..."
          className="flex-1 p-3 border-2 border-gray-200 rounded-xl focus:border-primary-400 focus:ring-4 focus:ring-primary-100 outline-none transition-all duration-200"
        />
        <button
          type="submit"
          disabled={!newProposition.trim()}
          className="flex items-center gap-2 bg-gradient-to-r from-primary-500 to-primary-600 text-white px-6 py-3 rounded-xl hover:from-primary-600 hover:to-primary-700 transition-all duration-200 shadow-soft hover:shadow-medium disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          <Plus size={18} />
          Ajouter
        </button>
      </form>
      
      <div className="max-h-48 overflow-y-auto space-y-2">
        {propositions.map((prop, index) => (
          <div
            key={prop.id}
            className="flex justify-between items-center p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-200 group"
          >
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-gradient-to-br from-primary-400 to-secondary-400 rounded-full flex items-center justify-center text-white text-xs font-bold">
                {index + 1}
              </div>
              <span className="text-gray-700">{prop.text}</span>
            </div>
            <button
              onClick={() => onRemoveProposition(prop.id)}
              className="p-2 hover:bg-error-100 rounded-lg transition-colors duration-200 opacity-0 group-hover:opacity-100"
            >
              <XIcon size={16} className="text-error-500" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};