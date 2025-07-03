import { useEffect, useState } from "react";
import { Modal } from "./Modal";
import { fetchSaves } from "../services/Api.service";
import { GameState, SavesResponse } from "../types";
import {
  Check,
  List,
  X,
  Calendar,
  Users,
  FileText,
  Trophy,
  Plus,
  Minus,
  Edit,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { Tooltip } from "./Tooltip";
import { datetimeFormat } from "../services/utils";

export const SeePreviousHistory = ({
  loadThisGame,
}: {
  loadThisGame: (data: GameState) => void;
}) => {
  const [isOpened, setIsOpened] = useState(false);
  const [saves, setSaves] = useState<SavesResponse[]>([]);
  const [expandedDiffs, setExpandedDiffs] = useState<Set<string>>(new Set());

  const handleLoadGame = (data: GameState) => {
    loadThisGame(data);
    setIsOpened(false);
  };

  const toggleDiffExpansion = (saveId: string) => {
    const newExpanded = new Set(expandedDiffs);
    if (newExpanded.has(saveId)) {
      newExpanded.delete(saveId);
    } else {
      newExpanded.add(saveId);
    }
    setExpandedDiffs(newExpanded);
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

  // Fonction pour déterminer qui mérite le trophée
  const getWinners = (players: any[]) => {
    if (players.length === 0) return [];

    const sortedPlayers = [...players].sort(
      (a, b) => b.validatedItems.length - a.validatedItems.length
    );
    const maxScore = sortedPlayers[0].validatedItems.length;

    // Si le score max est 0, personne ne gagne
    if (maxScore === 0) return [];

    // Retourner tous les joueurs avec le score maximum
    return sortedPlayers.filter(
      (player) => player.validatedItems.length === maxScore
    );
  };

  // Fonction pour calculer les différences entre deux sauvegardes
  const calculateDifferences = (
    currentSave: SavesResponse,
    previousSave: SavesResponse | null
  ) => {
    if (!previousSave) return null;

    const differences = {
      playersAdded: [] as string[],
      playersRemoved: [] as string[],
      playersRenamed: [] as { from: string; to: string }[],
      validationsAdded: [] as {
        player: string;
        proposition: string;
        description: string;
      }[],
      validationsRemoved: [] as { player: string; proposition: string }[],
      propositionsAdded: [] as string[],
      propositionsRemoved: [] as string[],
    };

    // Créer des maps pour faciliter la comparaison par ID
    const currentPlayersById = new Map(
      currentSave.data.players.map((p) => [p.id || p.name, p])
    );
    const previousPlayersById = new Map(
      previousSave.data.players.map((p) => [p.id || p.name, p])
    );

    // Comparer les joueurs par ID
    const currentPlayerIds = new Set(currentPlayersById.keys());
    const previousPlayerIds = new Set(previousPlayersById.keys());

    // Joueurs ajoutés (nouveaux IDs)
    for (const id of currentPlayerIds) {
      if (!previousPlayerIds.has(id)) {
        const player = currentPlayersById.get(id);
        if (player) {
          differences.playersAdded.push(player.name);
        }
      }
    }

    // Joueurs supprimés (IDs qui n'existent plus)
    for (const id of previousPlayerIds) {
      if (!currentPlayerIds.has(id)) {
        const player = previousPlayersById.get(id);
        if (player) {
          differences.playersRemoved.push(player.name);
        }
      }
    }

    // Joueurs renommés (même ID, nom différent)
    for (const id of currentPlayerIds) {
      if (previousPlayerIds.has(id)) {
        const currentPlayer = currentPlayersById.get(id);
        const previousPlayer = previousPlayersById.get(id);
        if (
          currentPlayer &&
          previousPlayer &&
          currentPlayer.name !== previousPlayer.name
        ) {
          differences.playersRenamed.push({
            from: previousPlayer.name,
            to: currentPlayer.name,
          });
        }
      }
    }

    // Comparer les validations pour chaque joueur (par ID)
    for (const id of currentPlayerIds) {
      if (previousPlayerIds.has(id)) {
        const currentPlayer = currentPlayersById.get(id);
        const previousPlayer = previousPlayersById.get(id);

        if (currentPlayer && previousPlayer) {
          // Validations ajoutées
          currentPlayer.validatedItems.forEach(([index, validation]) => {
            const wasValidated = previousPlayer.validatedItems.some(
              ([prevIndex]) => prevIndex === index
            );
            if (!wasValidated) {
              const proposition = currentSave.data.propositions.find(
                (p) => p.id === validation.propositionId
              );
              if (proposition) {
                differences.validationsAdded.push({
                  player: currentPlayer.name,
                  proposition: proposition.text,
                  description: validation.description,
                });
              }
            }
          });

          // Validations supprimées
          previousPlayer.validatedItems.forEach(([index, validation]) => {
            const stillValidated = currentPlayer.validatedItems.some(
              ([currIndex]) => currIndex === index
            );
            if (!stillValidated) {
              const proposition = previousSave.data.propositions.find(
                (p) => p.id === validation.propositionId
              );
              if (proposition) {
                differences.validationsRemoved.push({
                  player: currentPlayer.name,
                  proposition: proposition.text,
                });
              }
            }
          });
        }
      }
    }

    // Comparer les propositions
    const currentPropositionTexts = currentSave.data.propositions.map(
      (p) => p.text
    );
    const previousPropositionTexts = previousSave.data.propositions.map(
      (p) => p.text
    );

    differences.propositionsAdded = currentPropositionTexts.filter(
      (text) => !previousPropositionTexts.includes(text)
    );
    differences.propositionsRemoved = previousPropositionTexts.filter(
      (text) => !currentPropositionTexts.includes(text)
    );

    // Vérifier s'il y a des différences
    const hasDifferences =
      differences.playersAdded.length > 0 ||
      differences.playersRemoved.length > 0 ||
      differences.playersRenamed.length > 0 ||
      differences.validationsAdded.length > 0 ||
      differences.validationsRemoved.length > 0 ||
      differences.propositionsAdded.length > 0 ||
      differences.propositionsRemoved.length > 0;

    return hasDifferences ? differences : null;
  };

  const renderDifferences = (differences: any) => {
    if (!differences) return null;

    return (
      <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200 space-y-2">
        <h4 className="text-sm font-semibold text-blue-800 mb-2">
          Changements depuis la sauvegarde précédente :
        </h4>

        {differences.playersAdded.length > 0 && (
          <div className="flex items-start gap-2">
            <Plus size={14} className="text-success-600 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-success-700">
              <span className="font-medium">Joueurs ajoutés :</span>{" "}
              {differences.playersAdded.join(", ")}
            </div>
          </div>
        )}

        {differences.playersRemoved.length > 0 && (
          <div className="flex items-start gap-2">
            <Minus size={14} className="text-error-600 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-error-700">
              <span className="font-medium">Joueurs supprimés :</span>{" "}
              {differences.playersRemoved.join(", ")}
            </div>
          </div>
        )}

        {differences.playersRenamed.length > 0 && (
          <div className="flex items-start gap-2">
            <Edit size={14} className="text-warning-600 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-warning-700">
              <span className="font-medium">Joueurs renommés :</span>
              <div className="ml-2 space-y-1">
                {differences.playersRenamed.map(
                  (rename: any, index: number) => (
                    <div
                      key={index}
                      className="bg-warning-100 p-2 rounded text-xs"
                    >
                      <span className="font-medium">{rename.from}</span> →{" "}
                      <span className="font-medium">{rename.to}</span>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        )}

        {differences.validationsAdded.length > 0 && (
          <div className="flex items-start gap-2">
            <Check
              size={14}
              className="text-success-600 mt-0.5 flex-shrink-0"
            />
            <div className="text-xs text-success-700">
              <span className="font-medium">Validations ajoutées :</span>
              <div className="ml-2 space-y-1">
                {differences.validationsAdded.map(
                  (validation: any, index: number) => (
                    <div
                      key={index}
                      className="bg-success-100 p-2 rounded text-xs"
                    >
                      <div className="font-medium">
                        {validation.player} → {validation.proposition}
                      </div>
                      <div className="text-success-600 italic">
                        {validation.description}
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        )}

        {differences.validationsRemoved.length > 0 && (
          <div className="flex items-start gap-2">
            <X size={14} className="text-error-600 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-error-700">
              <span className="font-medium">Validations supprimées :</span>
              <div className="ml-2 space-y-1">
                {differences.validationsRemoved.map(
                  (validation: any, index: number) => (
                    <div
                      key={index}
                      className="bg-error-100 p-2 rounded text-xs"
                    >
                      <div className="font-medium">
                        {validation.player} → {validation.proposition}
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        )}

        {differences.propositionsAdded.length > 0 && (
          <div className="flex items-start gap-2">
            <Plus size={14} className="text-primary-600 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-primary-700">
              <span className="font-medium">Propositions ajoutées :</span>{" "}
              {differences.propositionsAdded.join(", ")}
            </div>
          </div>
        )}

        {differences.propositionsRemoved.length > 0 && (
          <div className="flex items-start gap-2">
            <Minus size={14} className="text-error-600 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-error-700">
              <span className="font-medium">Propositions supprimées :</span>{" "}
              {differences.propositionsRemoved.join(", ")}
            </div>
          </div>
        )}
      </div>
    );
  };

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
              <h3 className="text-xl font-bold text-gray-800">
                Historique des parties
              </h3>
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
              saves.map((save, index) => {
                const winners = getWinners(save.data.players);
                const winnerNames = winners.map((w) => w.name);
                const previousSave =
                  index < saves.length - 1 ? saves[index + 1] : null;
                const differences = calculateDifferences(save, previousSave);
                const isExpanded = expandedDiffs.has(save.id);

                return (
                  <div
                    key={save.id}
                    className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors duration-200"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <Calendar size={16} className="text-primary-500" />
                      <span className="font-semibold text-gray-800">
                        {new Date(save.date).toLocaleString(
                          "fr-FR",
                          datetimeFormat
                        )}
                      </span>
                      {winners.length > 1 && (
                        <div className="ml-auto flex items-center gap-1 bg-warning-100 text-warning-700 px-2 py-1 rounded-full text-xs font-medium">
                          <Trophy size={12} />
                          Égalité
                        </div>
                      )}
                      {differences && (
                        <Tooltip content="Cette sauvegarde contient des changements par rapport à la précédente">
                          <button
                            onClick={() => toggleDiffExpansion(save.id)}
                            className="ml-auto flex items-center gap-1 bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium hover:bg-blue-200 transition-colors duration-200"
                          >
                            <Edit size={12} />
                            Changements
                            {isExpanded ? (
                              <ChevronDown size={12} />
                            ) : (
                              <ChevronRight size={12} />
                            )}
                          </button>
                        </Tooltip>
                      )}
                    </div>

                    {/* Affichage des différences si développé */}
                    {differences &&
                      isExpanded &&
                      renderDifferences(differences)}

                    <div className="space-y-2 my-4">
                      {save.data.players
                        .sort(
                          (a, b) =>
                            b.validatedItems.length - a.validatedItems.length
                        )
                        .map((player, playerIndex) => {
                          const isWinner = winnerNames.includes(player.name);

                          return (
                            <div
                              key={player.id || playerIndex}
                              className={`flex justify-between items-center p-2 rounded-lg transition-all duration-200 ${
                                isWinner
                                  ? "bg-gradient-to-r from-warning-50 to-warning-100 border border-warning-200"
                                  : "bg-white"
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                {isWinner && (
                                  <Trophy
                                    size={16}
                                    className={`${
                                      winners.length > 1
                                        ? "text-warning-500 animate-bounce-subtle"
                                        : "text-warning-500"
                                    }`}
                                  />
                                )}
                                <span
                                  className={`font-medium ${isWinner ? "text-warning-800" : "text-gray-700"}`}
                                >
                                  {player.name}
                                </span>
                                {winners.length > 1 && isWinner && (
                                  <span className="text-xs bg-warning-200 text-warning-800 px-2 py-0.5 rounded-full font-medium">
                                    Ex æquo
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center gap-2">
                                <span
                                  className={`text-sm ${isWinner ? "text-warning-700 font-bold" : "text-gray-600"}`}
                                >
                                  {player.validatedItems.length}/
                                  {save.data.players[0]?.grid?.length || 6}
                                </span>
                                {player.validatedItems.length > 0 ? (
                                  <Tooltip
                                    content={
                                      <div className="space-y-2">
                                        {player.validatedItems.map(
                                          ([key, item]) => (
                                            <div key={key} className="text-xs">
                                              <div className="font-bold flex items-center gap-1">
                                                <Check
                                                  size={12}
                                                  className="text-success-400"
                                                />
                                                {
                                                  save.data.propositions.find(
                                                    (e) =>
                                                      e.id ===
                                                      item.propositionId
                                                  )?.text
                                                }
                                              </div>
                                              <div className="opacity-90 ml-4">
                                                {item.description}
                                              </div>
                                              <div className="text-xs italic opacity-70 ml-4">
                                                {new Date(
                                                  item.timestamp
                                                ).toLocaleString(
                                                  "fr-FR",
                                                  datetimeFormat
                                                )}
                                              </div>
                                            </div>
                                          )
                                        )}
                                      </div>
                                    }
                                  >
                                    <Check
                                      size={16}
                                      className="text-success-500"
                                    />
                                  </Tooltip>
                                ) : (
                                  <X size={16} className="text-gray-300" />
                                )}
                              </div>
                            </div>
                          );
                        })}
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <FileText size={14} />
                          {save.data.propositions.length} proposition
                          {save.data.propositions.length > 1 ? "s" : ""}
                        </div>
                        <div className="flex items-center gap-1">
                          <Users size={14} />
                          {save.data.players.length} joueur
                          {save.data.players.length > 1 ? "s" : ""}
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
                );
              })
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
};
