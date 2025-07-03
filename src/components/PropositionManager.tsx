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
        <div className="ml-1 px-2 py-0.5 rounded-full text-xs font-bold bg-warning-400 text-warning-800">
          {propositions.length}
        </div>
      </button>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <div className="flex flex-col h-full max-h-[80vh]">
          {/* Header compact */}
          <div className="flex items-center justify-between mb-4 flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-warning-400 to-warning-500 rounded-lg">
                <Lightbulb size={24} className="text-white" />
              </div>
              <div className="flex flex-col items-start gap-1">
                <h2 className="text-lg font-bold text-gray-800">
                  Propositions
                </h2>
                <div className="bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full text-xs font-medium">
                  {propositions.length} élément
                  {propositions.length > 1 ? "s" : ""}
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsModalOpen(false)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
            >
              <XIcon size={18} className="text-gray-500" />
            </button>
          </div>

          {/* Formulaire d'ajout */}
          <form
            onSubmit={handleSubmit}
            className="flex gap-2 mb-4 flex-shrink-0"
          >
            <input
              type="text"
              value={newProposition}
              onChange={(e) => setNewProposition(e.target.value)}
              placeholder="Nouvelle proposition..."
              className="flex-1 p-2.5 border-2 border-gray-200 rounded-lg focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none transition-all duration-200 text-sm"
              autoFocus
            />
            <button
              type="submit"
              disabled={!newProposition.trim()}
              className="flex items-center gap-1.5 bg-gradient-to-r from-primary-500 to-primary-600 text-white px-3 py-2.5 rounded-lg hover:from-primary-600 hover:to-primary-700 transition-all duration-200 shadow-soft hover:shadow-medium disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm"
            >
              <Plus size={14} />
              Ajouter
            </button>
          </form>

          {/* Liste des propositions - zone scrollable */}
          <div className="flex-1 min-h-0">
            <h3 className="font-semibold text-gray-700 mb-3 text-sm">
              Liste actuelle
            </h3>

            <div className="pb-6 h-full overflow-y-auto space-y-2 pr-2">
              {propositions.length === 0 ? (
                <div className="text-center py-6 text-gray-500">
                  <Lightbulb size={32} className="mx-auto mb-3 text-gray-300" />
                  <p className="text-sm">Aucune proposition</p>
                  <p className="text-xs text-gray-400">
                    Ajoutez-en une pour commencer !
                  </p>
                </div>
              ) : (
                propositions.map((prop, index) => (
                  <div
                    key={prop.id}
                    className="flex justify-between items-center p-2.5 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200 group"
                  >
                    <div className="flex items-center gap-2.5 flex-1 min-w-0">
                      <div className="w-5 h-5 bg-gradient-to-br from-primary-400 to-secondary-400 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {index + 1}
                      </div>
                      <span className="text-gray-700 text-sm truncate">
                        {prop.text}
                      </span>
                    </div>
                    <button
                      onClick={() => onRemoveProposition(prop.id)}
                      className="p-1.5 hover:bg-error-100 rounded-lg transition-colors duration-200 opacity-0 group-hover:opacity-100 flex-shrink-0"
                    >
                      <XIcon size={12} className="text-error-500" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
};
