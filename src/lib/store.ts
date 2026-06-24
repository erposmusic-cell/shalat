import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AdminUser } from './types';

interface AppState {
  // Auth
  admin: AdminUser | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;

  // UI State
  selectedStudentId: string | null;
  setSelectedStudentId: (id: string | null) => void;
  currentPrayerId: string | null;
  setCurrentPrayerId: (id: string | null) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Auth
      admin: null,
      isAuthenticated: false,
      login: async (username: string, password: string) => {
        try {
          const res = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
          });
          const data = await res.json();
          if (data.success) {
            set({
              admin: { username: data.user.username, name: data.user.name },
              isAuthenticated: true,
            });
            return true;
          }
          return false;
        } catch {
          return false;
        }
      },
      logout: () => {
        set({ admin: null, isAuthenticated: false });
      },

      // UI State
      selectedStudentId: null,
      setSelectedStudentId: (id) => set({ selectedStudentId: id }),
      currentPrayerId: null,
      setCurrentPrayerId: (id) => set({ currentPrayerId: id }),
    }),
    {
      name: 'absensi-sholat-store',
      partialize: (state) => ({
        admin: state.admin,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);