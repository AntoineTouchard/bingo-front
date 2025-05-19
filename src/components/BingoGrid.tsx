import { useState } from "react";
import { Proposition, ValidatedItem } from "../types";
import { Check, Edit2, XIcon } from "lucide-react";
import { Modal } from "./Modal";

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

export const BingoGrid = ({
  items,
  playerName,
  onNameChange,
  onRemove,
  isRemovable,
  propositions,
  validatedItems,
  onValidateItem,
  onRemoveValidation,
}: BingoGridProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(playerName);
  const [selectedItem, setSelectedItem] = useState<{
    index: number;
    text: string;
  } | null>(null);
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
    return propositions.find((p) => p.id === id)?.text || "";
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
              onKeyPress={(e) => e.key === "Enter" && handleNameSubmit()}
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
                onClick={() =>
                  !isValidated &&
                  setSelectedItem({ index, text: propositionText })
                }
                className={`p-3 border-2 rounded-lg cursor-pointer h-[160px] text-center transition-all duration-200 text-sm ${
                  isValidated
                    ? "bg-indigo-600 text-white border-indigo-700 shadow-inner overflow-y-auto"
                    : "border-indigo-200 hover:bg-indigo-50"
                }`}
              >
                <div className="text-[14px] leading-none text-indigo-600 font-bold">
                  {propositionText}
                </div>
                {isValidated && (
                  <>
                    <div className="mt-2 leading-none text-[12px] italic">
                      {validatedItem?.description}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveValidation(index);
                      }}
                      className="absolute top-2 right-3 p-1 hover:bg-indigo-700 rounded-full"
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
          <h3 className="text-lg font-semibold">
            Validation de la proposition
          </h3>
          <p className="text-gray-600">{selectedItem?.text}</p>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Décrivez le contexte..."
            className="w-full p-2 border rounded-lg focus:outline-indigo-500"
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
};
