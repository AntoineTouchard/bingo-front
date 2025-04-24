export interface Proposition {
  text: string;
  id: string;
}

export interface ValidatedItem {
  propositionId: string;
  description: string;
  timestamp: number;
}

export interface PlayerState {
  name: string;
  grid: string[];
  validatedItems: Map<number, ValidatedItem>;
}

export interface GameState {
  players: PlayerState[];
  propositions: Proposition[];
}


export interface SaveResponse {
    id: number
    date: string
    data?: string
}

export interface SavesResponse {
  id: number
  date: string
  data: GameState
}

export const initialPropositions: Proposition[] = [
  "Max annule la piscine",
  "Il y a un problème d'export sur la croix rouge",
  "Quelqu'un laisse la machine à café vide",
  "Des tasses sont laissées sales",
  "On livre en avance",
  "Kévin dit : Je dois venir avec une brouette",
  "Antoine raconte l'histoire du paillasson",
  "Les sys-admin bricolent",
  "Corentin a une question",
  "Il n'y a plus de chargeur dispo",
  "Anytime paye son coup ou a mangé",
  "Il fait trop chaud / froid pour travailler à Nantes",
  "Dans la salle de réunion : Vous nous entendez ?",
  "Le tel de Antoine Babs sonne",
  "Quelqu'un porte un pull Anytime",
  "Il y a une fuite d'eau",
  "Petit déjeuner avec Bertrand",
  "Quelqu'un est croissanté",
  "Rollback en prod",
  "Plus personne ne veut aller à Paola",
  "Il manque un meuble dans les locaux",
  "Picota",
  "Quelqu'un veut venir manger sans avoir mis un pouce",
  "Seb fait une métaphore",
  "Audrey tape Antoine Babs"
].map(text => ({ text, id: crypto.randomUUID() }));
