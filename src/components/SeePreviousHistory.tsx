import { useEffect, useState } from "react";
import { Modal } from "./Modal";
import { fetchSaves } from "../services/Api.service";
import { GameState, SavesResponse } from "../types";
import { Check, List, X } from "lucide-react";
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
        className="flex items-center text-sm gap-2 bg-indigo-600 text-white px-3 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
      >
        <List size={16} />
        Voir les sauvegardes
      </button>
      <Modal isOpen={isOpened} onClose={() => setIsOpened(false)}>
        <div
          className="space-y-4 max-h-[800px] h-[80vh]"
          style={{ marginTop: "-10px" }}
        >
          <button
            className="absolute right-0"
            style={{ top: "-10px" }}
            onClick={() => setIsOpened(false)}
          >
            <X size={16} />
          </button>
          <h3 className="text-lg font-semibold pt-2">Liste des sauvegardes</h3>
          <div
            className="overflow-y-auto"
            style={{ height: "calc(100% - 60px)" }}
          >
            {saves.map((save) => (
              <div
                key={save.id}
                className="flex flex-col gap-[10px] items-center p-4 border-b pb-[30px]"
              >
                <div className="font-semibold text-gray-800">
                  {new Date(save.date).toLocaleString("fr-FR", datetimeFormat)}
                </div>
                <div>
                  {save.data.players
                    .sort(
                      (a, b) =>
                        b.validatedItems.length - a.validatedItems.length
                    )
                    .map((p) => (
                      <div className="flex justify-between gap-[20px] w-full">
                        <div>{p.name}</div>

                        <div className="flex gap-[5px] items-center">
                          {" "}
                          {p.validatedItems.length}{" "}
                          {p.validatedItems.length > 0 ? (
                            <Tooltip
                              content={
                                <div>
                                  {[...p.validatedItems].map(([key, item]) => (
                                    <div key={key} className="mb-2">
                                      <div className="font-bold flex flew-row">
                                        <Check
                                          className="text-green-500 mr-1"
                                          size={16}
                                        />
                                        {
                                          save.data.propositions.find(
                                            (e) => e.id === item.propositionId
                                          )?.text
                                        }
                                      </div>
                                      <div className=" opacity-90">
                                        {item.description}
                                      </div>

                                      <div className="text-[12px] italic opacity-70 flex flex-row items-center">
                                        {new Date(
                                          item.timestamp
                                        ).toLocaleString(
                                          "fr-FR",
                                          datetimeFormat
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              }
                            >
                              <Check className="text-green-500" size={16} />
                            </Tooltip>
                          ) : (
                            <X className="text-red-500" size={16} />
                          )}
                        </div>
                      </div>
                    ))}
                </div>
                <div className="text-gray-500 text-center flex flex-row gap-2">
                  <div>
                    {save.data.propositions.length} proposition
                    {save.data.propositions.length > 0 ? "s" : ""}
                  </div>
                  <div>-</div>
                  <div>
                    {save.data.players.length} joueur
                    {save.data.players.length > 0 ? "s" : ""}
                  </div>
                </div>
                <button
                  onClick={() => {
                    handleLoadGame(save.data);
                  }}
                  className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                >
                  Charger cette sauvegarde
                </button>
              </div>
            ))}
          </div>
        </div>
      </Modal>
    </div>
  );
};
