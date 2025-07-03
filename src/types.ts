export interface Proposition {
  id: string;
  text: string;
}

export interface ValidatedItem {
  propositionId: string;
  description: string;
  timestamp: number;
}

export interface PlayerState {
  id: string; // Ajout d'un ID unique pour chaque joueur
  name: string;
  grid: string[];
  validatedItems: Map<number, ValidatedItem>;
}

export interface GameState {
  players: Array<{
    id: string; // Ajout de l'ID dans la structure de sauvegarde
    name: string;
    grid: string[];
    validatedItems: Array<[number, ValidatedItem]>;
  }>;
  propositions: Proposition[];
}

export interface SaveResponse {
  id: string;
  data: string;
  date: string;
}

export interface SavesResponse {
  id: string;
  data: GameState;
  date: string;
}

export const initialPropositions: Proposition[] = [
  { id: "1", text: "Quelqu'un arrive en retard" },
  { id: "2", text: "On parle de la météo" },
  { id: "3", text: "Quelqu'un boit du café" },
  { id: "4", text: "On mentionne un projet en cours" },
  { id: "5", text: "Quelqu'un vérifie son téléphone" },
  { id: "6", text: "On parle de weekend" },
  { id: "7", text: "Quelqu'un pose une question technique" },
  { id: "8", text: "On évoque les vacances" },
  { id: "9", text: "Quelqu'un mange quelque chose" },
  { id: "10", text: "On parle d'un collègue absent" },
  { id: "11", text: "Quelqu'un fait une blague" },
  { id: "12", text: "On mentionne un client" },
  { id: "13", text: "Quelqu'un bâille" },
  { id: "14", text: "On parle de sport" },
  { id: "15", text: "Quelqu'un prend des notes" },
  { id: "16", text: "On évoque un problème technique" },
  { id: "17", text: "Quelqu'un dit 'exactement'" },
  { id: "18", text: "On parle de budget" },
  { id: "19", text: "Quelqu'un regarde par la fenêtre" },
  { id: "20", text: "On mentionne une deadline" },
];