import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type SessionDisplayStore = {
  showRecentSection: boolean;
  showArchivedSessions: boolean;
  setShowRecentSection: (show: boolean) => void;
  setShowArchivedSessions: (show: boolean) => void;
  toggleRecentSection: () => void;
  toggleArchivedSessions: () => void;
};

export const useSessionDisplayStore = create<SessionDisplayStore>()(
  persist(
    (set) => ({
      showRecentSection: true,
      showArchivedSessions: true,
      setShowRecentSection: (show) => set({ showRecentSection: show }),
      setShowArchivedSessions: (show) => set({ showArchivedSessions: show }),
      toggleRecentSection: () => set((state) => ({ showRecentSection: !state.showRecentSection })),
      toggleArchivedSessions: () => set((state) => ({ showArchivedSessions: !state.showArchivedSessions })),
    }),
    {
      name: 'session-display-mode',
    },
  ),
);
