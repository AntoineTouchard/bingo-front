import { XIcon, Plus, Lightbulb, Settings } from "lucide-react";
import { useState } from "react";
import { Proposition } from "../types";
import { Modal } from "./Modal";

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
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newProposition.trim()) {
      onAddProposition(newProposition.trim());
      setNewProposition("");
    }
  };

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="flex items-center gap-2 bg-gradient-to-r from-warning-500 to-warning-600 text-white px-4 py-2.5 rounded-xl hover:from-warning-600 hover:to-warning-700 transition-all duration-200 shadow-soft hover:shadow-medium font-medium"
      >
        <Settings size={18} />
        Gérer les propositions
        <div className="ml-1 bg-warning-400 text-warning-800 px-2 py-0.5 rounded-full text-xs font-bold">
          {propositions.length}
        </div>
      </button>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <div className="space-y-4">
          {/* Header compact */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-warning-400 to-warning-500 rounded-lg">
                <Lightbulb size={20} className="text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-800">
                  Gérer les propositions
                </h2>
                <div className="bg-primary-100 text-primary-700 px-2 py-1 rounded-full text-xs font-medium">
                  {propositions.length} proposition{propositions.length > 1 ? "s" : ""}
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsModalOpen(false)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
            >
              <XIcon size={20} className="text-gray-500" />
            </button>
          </div>
          
          {/* Formulaire d'ajout */}
          <form onSubmit={handleSubmit} className="flex gap-3">
            <input
              type="text"
              value={newProposition}
              onChange={(e) => setNewProposition(e.target.value)}
              placeholder="Nouvelle proposition..."
              className="flex-1 p-3 border-2 border-gray-200 rounded-xl focus:border-primary-400 focus:ring-4 focus:ring-primary-100 outline-none transition-all duration-200"
              autoFocus
            />
            <button
              type="submit"
              disabled={!newProposition.trim()}
              className="flex items-center gap-2 bg-gradient-to-r from-primary-500 to-primary-600 text-white px-4 py-3 rounded-xl hover:from-primary-600 hover:to-primary-700 transition-all duration-200 shadow-soft hover:shadow-medium disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              <Plus size={16} />
              Ajouter
            </button>
          </form>
          
          {/* Liste des propositions avec hauteur limitée */}
          <div className="border-t pt-4">
            <h3 className="font-semibold text-gray-700 mb-3">
              Propositions actuelles
            </h3>
            
            <div className="max-h-64 overflow-y-auto space-y-2 pr-2">
              {propositions.length === 0 ? (
                <div className="text-center py-6 text-gray-500">
                  <Lightbulb size={32} className="mx-auto mb-3 text-gray-300" />
                  <p className="text-sm">Aucune proposition pour le moment</p>
                  <p className="text-xs text-gray-400">Ajoutez-en une pour commencer !</p>
                </div>
              ) : (
                propositions.map((prop, index) => (
                  <div
                    key={prop.id}
                    className="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200 group"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-6 h-6 bg-gradient-to-br from-primary-400 to-secondary-400 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {index + 1}
                      </div>
                      <span className="text-gray-700 text-sm truncate">{prop.text}</span>
                    </div>
                    <button
                      onClick={() => onRemoveProposition(prop.id)}
                      className="p-1.5 hover:bg-error-100 rounded-lg transition-colors duration-200 opacity-0 group-hover:opacity-100 flex-shrink-0"
                    >
                      <XIcon size={14} className="text-error-500" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
          
          {/* Footer compact */}
          <div className="flex justify-end pt-3 border-t">
            <button
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200 font-medium text-sm"
            >
              Fermer
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};