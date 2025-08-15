// stores/usePlaySettings.ts
import { create } from "zustand";

type PlaySettingsStore = {
  autoSave: boolean;
  setAutoSave: (value: boolean) => void;
  showTestPanel: boolean;
  setShowTestPanel: (value: boolean) => void;
  isLibFunctionsOpen: boolean;
  setIsLibFunctionsOpen: (value: boolean) => void;
  QuestionCardOpen: boolean;
  setQuestionCardOpen: (value: boolean) => void;
  showSubmissions?: boolean;
  toggleSubmissions?: (value: boolean) => void;
  leaderBoardFullScreen?: boolean;
  setLeaderBoardFullScreen?: (value: boolean) => void;
};

export const usePlaySettings = create<PlaySettingsStore>((set) => ({
  autoSave: true,
  showTestPanel: false,
  setAutoSave: (value) => set({ autoSave: value }),
  setShowTestPanel: (value) => set({ showTestPanel: value }),
  isLibFunctionsOpen: true,
  setIsLibFunctionsOpen: (value) => set({ isLibFunctionsOpen: value }),
  QuestionCardOpen: true,
  setQuestionCardOpen: (value) => set({ QuestionCardOpen: value }),
  showSubmissions: false,
  toggleSubmissions: () => set((state) => ({ showSubmissions: !state.showSubmissions })),
  leaderBoardFullScreen: false,
  setLeaderBoardFullScreen: (value) => set({ leaderBoardFullScreen: value }),
}));
