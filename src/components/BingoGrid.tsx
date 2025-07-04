import { useState } from "react";
import { Proposition, ValidatedItem } from "../types";
import { Check, Edit2, XIcon, Trophy, Target, AlertTriangle } from "lucide-react";
import { Modal } from "./Modal";
import { Tooltip } from "./Tooltip";
import { shortDateFormat } from "../services/utils";

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
  hasUnsavedChanges?: boolean;
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
  hasUnsavedChanges = false,
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

  const handleRemoveValidation = (index: number) => {
    onRemoveValidation(index);
  };

  const handleRemovePlayer = () => {
    onRemove();
  };

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleItemClick = (index: number, propositionText: string) => {
    if (!validatedItems.has(index)) {
      setSelectedItem({ index, text: propositionText });
    }
  };

  const getPropositionById = (id: string) => {
    return propositions.find((p) => p.id === id)?.text || "";
  };

  const validatedCount = validatedItems.size;
  const progressPercentage = (validatedCount / items.length) * 100;

  const renderPlayerHeader = () => (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-4">
        {isEditing ? (
          <div className="flex gap-2 items-center">
            <input
              type="text"
              value={editedName}
              onChange={(e) => setEditedName(e.target.value)}
              className="text-xl font-bold text-primary-600 border-b-2 border-primary-200 focus:border-primary-600 outline-none bg-transparent"
              onKeyPress={(e) => e.key === "Enter" && handleNameSubmit()}
              autoFocus
            />
            <button
              onClick={handleNameSubmit}
              className="p-2 rounded-full transition-colors duration-200 hover:bg-primary-100 text-primary-600"
            >
              <Check size={18} />
            </button>
          </div>
        ) : (
          <div className="flex gap-3 items-center">
            <div className="p-2 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg">
              <Target size={20} className="text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-800">{playerName}</h2>
            <button
              onClick={handleEditClick}
              className="p-2 rounded-full hover:bg-gray-100 text-gray-400 transition-colors duration-200"
            >
              <Edit2 size={16} />
            </button>
          </div>
        )}
        {isRemovable && (
          <button
            onClick={handleRemovePlayer}
            className="p-2 rounded-full hover:bg-error-100 text-error-500 transition-colors duration-200"
          >
            <XIcon size={18} />
          </button>
        )}
      </div>
      
      {/* Progress bar */}
      <div className="space-y-2">
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-600">Progression</span>
          <div className="flex items-center gap-2">
            <Trophy size={16} className="text-warning-500" />
            <span className="font-bold text-gray-800">{validatedCount}/{items.length}</span>
          </div>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-success-400 to-success-500 h-2 rounded-full transition-all duration-500"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
      </div>
    </div>
  );

  const renderGridItem = (itemId: string, index: number) => {
    const isValidated = validatedItems.has(index);
    const validatedItem = validatedItems.get(index);
    const propositionText = getPropositionById(itemId);

    // Fonction pour tronquer le texte élégamment
    const truncateText = (text: string, maxLength: number = 60) => {
      if (text.length <= maxLength) return text;
      return text.substring(0, maxLength).trim() + "...";
    };

    const description = validatedItem?.description || "";
    const isDescriptionTruncated = description.length > 60;

    return (
      <div key={index} className="relative group">
        <div
          onClick={() => handleItemClick(index, propositionText)}
          className={`p-4 border-2 rounded-xl h-[180px] text-center transition-all duration-300 text-sm relative overflow-hidden flex flex-col ${
            isValidated
              ? "bg-gradient-to-br from-success-500 to-success-600 text-white border-success-600 shadow-medium transform scale-105"
              : "border-gray-200 hover:border-primary-300 hover:bg-primary-50 hover:shadow-soft bg-white cursor-pointer"
          }`}
        >
          {/* Titre de la proposition */}
          <div className="flex-shrink-0 mb-3">
            <div
              className={`text-sm font-bold leading-tight ${
                isValidated ? "text-white" : "text-gray-700"
              }`}
            >
              {propositionText.length > 80 ? (
                <Tooltip
                  content={
                    <div className="max-w-xs">
                      <div className="text-sm leading-relaxed">{propositionText}</div>
                    </div>
                  }
                  side="top"
                >
                  <div className="cursor-help">
                    {truncateText(propositionText, 80)}
                  </div>
                </Tooltip>
              ) : (
                propositionText
              )}
            </div>
          </div>
          
          {/* Zone de contenu validé */}
          {isValidated && (
            <div className="flex-1 flex flex-col justify-between min-h-0">
              {/* Description */}
              <div className="flex-1 flex items-center justify-center mb-3">
                {isDescriptionTruncated ? (
                  <Tooltip
                    content={
                      <div className="max-w-xs">
                        <div className="text-sm leading-relaxed">{description}</div>
                      </div>
                    }
                    side="top"
                  >
                    <div className="text-xs italic opacity-90 leading-tight cursor-help text-center">
                      {truncateText(description)}
                    </div>
                  </Tooltip>
                ) : (
                  <div className="text-xs italic opacity-90 leading-tight text-center">
                    {description}
                  </div>
                )}
              </div>
              
              {/* Date en bas */}
              <div className="flex-shrink-0 text-xs italic opacity-80 flex items-center justify-center gap-1">
                <Check size={12} className="text-success-200" />
                {new Date(validatedItem?.timestamp).toLocaleString(
                  "fr-FR",
                  shortDateFormat
                )}
              </div>
              
              {/* Bouton de suppression */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveValidation(index);
                }}
                className="absolute top-2 right-2 p-1 rounded-full hover:bg-success-600 opacity-0 group-hover:opacity-100 transition-all duration-200"
              >
                <XIcon size={14} />
              </button>
            </div>
          )}
          
          {/* Effet de survol pour les cartes non validées */}
          {!isValidated && (
            <div className="absolute inset-0 bg-gradient-to-br from-primary-500/0 to-secondary-500/0 group-hover:from-primary-500/5 group-hover:to-secondary-500/5 transition-all duration-300 rounded-xl"></div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-soft p-6 hover:shadow-medium transition-all duration-300 animate-fade-in">
      {renderPlayerHeader()}
      <div className="grid grid-cols-2 gap-4">
        {items.map((itemId, index) => renderGridItem(itemId, index))}
      </div>

      <Modal
        isOpen={selectedItem !== null}
        onClose={() => setSelectedItem(null)}
      >
        <div className="space-y-6">
          <div className="text-center">
            <div className="p-3 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Check size={24} className="text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              Validation de la proposition
            </h3>
            <p className="text-gray-600 bg-gray-50 p-3 rounded-lg">{selectedItem?.text}</p>
          </div>
          
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Décrivez le contexte de cette validation..."
            className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-primary-400 focus:ring-4 focus:ring-primary-100 outline-none transition-all duration-200 resize-none"
            rows={4}
            autoFocus
          />
          
          <div className="flex gap-3">
            <button
              onClick={() => setSelectedItem(null)}
              className="flex-1 px-4 py-3 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors duration-200 font-medium"
            >
              Annuler
            </button>
            <button
              onClick={handleValidation}
              disabled={!description.trim()}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-success-500 to-success-600 text-white rounded-xl hover:from-success-600 hover:to-success-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-soft"
            >
              Valider
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};