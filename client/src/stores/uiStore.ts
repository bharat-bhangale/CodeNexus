import { create } from 'zustand';

export type RightPanelView = 'chat' | 'intent' | 'memory' | 'health' | 'review';

interface UIState {
  sidebarVisible: boolean;
  rightPanelVisible: boolean;
  bottomPanelVisible: boolean;
  activeRightPanel: RightPanelView;
  theme: 'dark' | 'light';
  commandPaletteOpen: boolean;

  toggleSidebar: () => void;
  toggleRightPanel: () => void;
  toggleBottomPanel: () => void;
  setActiveRightPanel: (panel: RightPanelView) => void;
  setTheme: (theme: 'dark' | 'light') => void;
  setSidebarVisible: (visible: boolean) => void;
  setRightPanelVisible: (visible: boolean) => void;
  setBottomPanelVisible: (visible: boolean) => void;
  setCommandPaletteOpen: (open: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarVisible: true,
  rightPanelVisible: true,
  bottomPanelVisible: false,
  activeRightPanel: 'chat',
  theme: 'dark',
  commandPaletteOpen: false,

  toggleSidebar: () => set((s) => ({ sidebarVisible: !s.sidebarVisible })),
  toggleRightPanel: () => set((s) => ({ rightPanelVisible: !s.rightPanelVisible })),
  toggleBottomPanel: () => set((s) => ({ bottomPanelVisible: !s.bottomPanelVisible })),
  setActiveRightPanel: (panel) => set({ activeRightPanel: panel, rightPanelVisible: true }),
  setTheme: (theme) => set({ theme }),
  setSidebarVisible: (visible) => set({ sidebarVisible: visible }),
  setRightPanelVisible: (visible) => set({ rightPanelVisible: visible }),
  setBottomPanelVisible: (visible) => set({ bottomPanelVisible: visible }),
  setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),
}));
