import { useEffect, useState } from "react";
import { Modal } from "./Modal";
import { fetchSaves } from "../services/Api.service";
import { GameState, SavesResponse } from "../types";
import { Check, List, X, Calendar, Users, FileText, Trophy } from "lucide-react";
import { Tooltip } from "./Tooltip";
import { datetimeFormat } from "../services/utils";

export const SeePreviousHistory = ({
  loadThisGame,
}: {
  loadThisGame: (data: GameState) => void;
}) => {
  const [isOpened, setIsOpened] = useState(false);
  const [saves, setSaves] = useState<SavesResponse[]>([]);

  const handleLoadGame = (data: GameState) => {
    loadThisGame(data);
    setIsOpened(false);
  };
  
  useEffect(() => {
    const fetchAllSaves = async () => {
      const savesResponse = await fetchSaves();
      setSaves(savesResponse);
    };
    if (isOpened) {
      fetchAllSaves();
    }
  }, [isOpened]);

  return (
    <div>
      <button
        onClick={() => setIsOpened(true)}
        className="flex items-center gap-2 bg-gradient-to-r from-secondary-500 to-secondary-600 text-white px-4 py-2.5 rounded-xl hover:from-secondary-600 hover:to-secondary-700 transition-all duration-200 shadow-soft hover:shadow-medium font-medium"
      >
        <List size={18} />
        Historique
      </button>
      
      <Modal isOpen={isOpened} onClose={() => setIsOpened(false)}>
        <div className="space-y-6 max-h-[80vh]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-secondary-500 to-secondary-600 rounded-lg">
                <Calendar size={20} className="text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-800">Historique des parties</h3>
            </div>
            <button
              onClick={() => setIsOpened(false)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
            >
              <X size={20} className="text-gray-500" />
            </button>
          </div>
          
          <div className="overflow-y-auto max-h-[60vh] space-y-4">
            {saves.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <FileText size={48} className="mx-auto mb-4 text-gray-300" />
                <p>Aucune sauvegarde trouvée</p>
              </div>
            ) : (
              saves.map((save) => (
                <div
                  key={save.id}
                  className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors duration-200"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <Calendar size={16} className="text-primary-500" />
                    <span className="font-semibold text-gray-800">
                      {new Date(save.date).toLocaleString("fr-FR", datetimeFormat)}
                    </span>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    {save.data.players
                      .sort((a, b) => b.validatedItems.length - a.validatedItems.length)
                      .map((player, index) => (
                        <div key={index} className="flex justify-between items-center p-2 bg-white rounded-lg">
                          <div className="flex items-center gap-2">
                            {index === 0 && player.validatedItems.length > 0 && (
                              <Trophy size={16} className="text-warning-500" />
                            )}
                            <span className="font-medium">{player.name}</span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600">
                              {player.validatedItems.length}/{save.data.players[0]?.grid?.length || 6}
                            </span>
                            {player.validatedItems.length > 0 ? (
                              <Tooltip
                                content={
                                  <div className="space-y-2">
                                    {player.validatedItems.map(([key, item]) => (
                                      <div key={key} className="text-xs">
                                        <div className="font-bold flex items-center gap-1">
                                          <Check size={12} className="text-success-400" />
                                          {save.data.propositions.find(e => e.id === item.propositionId)?.text}
                                        </div>
                                        <div className="opacity-90 ml-4">{item.description}</div>
                                        <div className="text-xs italic opacity-70 ml-4">
                                          {new Date(item.timestamp).toLocaleString("fr-FR", datetimeFormat)}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                }
                              >
                                <Check size={16} className="text-success-500" />
                              </Tooltip>
                            ) : (
                              <X size={16} className="text-gray-300" />
                            )}
                          </div>
                        </div>
                      ))}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <FileText size={14} />
                        {save.data.propositions.length} proposition{save.data.propositions.length > 1 ? "s" : ""}
                      </div>
                      <div className="flex items-center gap-1">
                        <Users size={14} />
                        {save.data.players.length} joueur{save.data.players.length > 1 ? "s" : ""}
                      </div>
                    </div>
                    
                    <button
                      onClick={() => handleLoadGame(save.data)}
                      className="px-4 py-2 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-lg hover:from-primary-600 hover:to-primary-700 transition-all duration-200 shadow-soft text-sm font-medium"
                    >
                      Charger
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
};