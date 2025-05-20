import { Proposition } from "../types";

export function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

export function generateGrid(
  propositions: Proposition[],
  itemsPerGrid: number
): string[] {
  return shuffleArray([...propositions])
    .slice(0, itemsPerGrid)
    .map((p) => p.id);
}

export function generateGrids(
  propositions: Proposition[],
  count: number,
  itemsPerGrid: number
): string[][] {
  return Array(count)
    .fill(null)
    .map(() => generateGrid(propositions, itemsPerGrid));
}

export const datetimeFormat = {
  weekday: "long", // "jeudi"
  month: "long", // "avril"
  day: "numeric", // "24"
  hour: "2-digit", // "15"
  minute: "2-digit", // "07"
  second: "2-digit", // "23"
};

export const shortDateFormat = {
  weekday: "long", // "jeudi"
  month: "long", // "avril"
  day: "numeric", // "24"
  hour: "2-digit", // "15"
  minute: "2-digit", // "07"
};
