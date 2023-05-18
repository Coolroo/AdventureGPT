import { create } from "zustand";

import { ConsoleMessage } from "../../types";

import { clamp } from "../../utils/mathUtils";

export interface HistoryStore {
  messageHistory: ConsoleMessage[];
  commandHistory: string[];
  pos: number;
  command: string;
  addToMessageHistory: (message: ConsoleMessage) => void;
  addToCommandHistory: (command: string) => void;
  clearHistory: () => void;
  incrementPos: () => void;
  decrementPos: () => void;
  setPos: (pos: number) => void;
  setCommand: (command: string) => void;
}

export const useHistoryStore = create<HistoryStore>((set) => ({
  commandHistory: [] as string[],
  messageHistory: [] as ConsoleMessage[],
  pos: 0,
  command: "",
  addToMessageHistory: (message: ConsoleMessage) =>
    set((state) => ({
      ...state,
      messageHistory: [...state.messageHistory, message],
    })),
  addToCommandHistory: (command: string) =>
    set((state) => ({
      ...state,
      commandHistory: [...state.commandHistory, command],
      pos: state.commandHistory.length,
    })),
  clearHistory: () =>
    set((state) => ({
      ...state,
      commandHistory: [],
      messageHistory: [],
      pos: 0,
    })),
  incrementPos: () =>
    set((state) => ({
      ...state,
      pos: Math.min(state.pos + 1, state.commandHistory.length - 1),
      command:
        state.commandHistory[
          Math.min(state.pos + 1, state.commandHistory.length - 1)
        ],
    })),
  decrementPos: () =>
    set((state) => ({
      ...state,
      pos: Math.max(state.pos - 1, 0),
      command: state.commandHistory[Math.max(state.pos - 1, 0)],
    })),
  setPos: (pos: number) =>
    set((state) => ({
      ...state,
      pos: clamp(pos, state.commandHistory.length - 1, 0),
      command:
        state.commandHistory[clamp(pos, state.commandHistory.length - 1, 0)],
    })),
  setCommand: (command: string) => set((state) => ({ ...state, command })),
}));
