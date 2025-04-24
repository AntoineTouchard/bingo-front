import { Proposition } from "../types";

export function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

export function generateGrid(propositions: Proposition[], itemsPerGrid: number): string[] {
  return shuffleArray([...propositions]).slice(0, itemsPerGrid).map(p => p.id);
}

export function generateGrids(propositions: Proposition[], count: number, itemsPerGrid: number): string[][] {
  return Array(count).fill(null).map(() => generateGrid(propositions, itemsPerGrid));
}

