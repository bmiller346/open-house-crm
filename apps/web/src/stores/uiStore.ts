import React from 'react';
import { create } from 'zustand';

interface UIStore {
  sidebarOpen: boolean;
  selectedWorkspace: string | null;
  toggleSidebar: () => void;
  setSelectedWorkspace: (workspaceId: string) => void;
}

export const useUIStore = create<UIStore>((set) => ({
  sidebarOpen: true,
  selectedWorkspace: null,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSelectedWorkspace: (workspaceId) => set({ selectedWorkspace: workspaceId }),
}));
