
import { create } from 'zustand';

interface AppState {
  sidebarCollapsed: boolean;
  theme: 'light' | 'dark';
  currentPage: string;
  toggleSidebar: () => void;
  toggleTheme: () => void;
  setCurrentPage: (page: string) => void;
}

export const useAppStore = create<AppState>((set) => ({
  sidebarCollapsed: false,
  theme: 'light',
  currentPage: 'dashboard',
  toggleSidebar: () => 
    set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  toggleTheme: () => 
    set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),
  setCurrentPage: (page) => 
    set({ currentPage: page })
}));
