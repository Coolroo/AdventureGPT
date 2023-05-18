import { create } from "zustand";
import { Adventure, Item } from "../../types";

export interface GameStateStore {
  adventure?: Adventure;
  items: Item[];
  current_location?: string;
  ending?: number;
  started: boolean;
  setAdventure: (adventure: Adventure) => void;
  addItem: (item: Item) => void;
  setCurrentLocation: (location: string) => void;
  setEnding: (ending: number) => void;
  resetAdventure: () => void;
  clearAdventure: () => void;
  setStarted: (started: boolean) => void;
}

export const useGameState = create<GameStateStore>((set) => ({
  adventure: undefined,
  items: undefined,
  current_location: undefined,
  ending: undefined,
  started: false,
  setAdventure: (adventure: Adventure) =>
    set((state) => ({
      adventure,
      items: [],
      current_location: adventure.start_area,
      ending: undefined,
    })),
  addItem: (item: Item) =>
    set((state) => ({ ...state, items: [...state.items, item] })),
  setCurrentLocation: (location: string) =>
    set((state) => ({ ...state, current_location: location })),
  setEnding: (ending: number) =>
    set((state) => ({ ...state, ending, started: false })),
  resetAdventure: () =>
    set(
      (state) => ({
        adventure: state.adventure,
        items: [],
        current_location: state.adventure.start_area,
        ending: undefined,
        started: false,
      }),
      true
    ),
  clearAdventure: () =>
    set((state) => ({
      adventure: undefined,
      items: [],
      current_location: undefined,
      ending: undefined,
      started: false,
    })),
  setStarted: (started: boolean) =>
    set((state) => ({
      ...state,
      started: started,
    })),
}));
