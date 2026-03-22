import { create } from 'zustand';

interface WebsiteDesignState {
  renderedCode: string;
  isViewingSnapshot: boolean;
  isIframeReady: boolean;
  selectedScreenSize: string;
  showSettings: boolean;
  regenHint: string;
  undoStack: string[];
  redoStack: string[];
  lastQuickAction: { label: string; lastHtml?: string } | null;
  
  // Actions
  setRenderedCode: (code: string) => void;
  setIsViewingSnapshot: (value: boolean) => void;
  setIsIframeReady: (value: boolean) => void;
  setSelectedScreenSize: (size: string) => void;
  setShowSettings: (show: boolean) => void;
  setRegenHint: (hint: string) => void;
  pushUndo: (code: string) => void;
  popUndo: () => string | undefined;
  pushRedo: (code: string) => void;
  popRedo: () => string | undefined;
  clearRedoStack: () => void;
  setLastQuickAction: (action: { label: string; lastHtml?: string } | null) => void;
}

export const useWebsiteDesignStore = create<WebsiteDesignState>((set, get) => ({
  renderedCode: '',
  isViewingSnapshot: false,
  isIframeReady: false,
  selectedScreenSize: 'web',
  showSettings: false,
  regenHint: '',
  undoStack: [],
  redoStack: [],
  lastQuickAction: null,
  
  setRenderedCode: (code) => set({ renderedCode: code }),
  setIsViewingSnapshot: (value) => set({ isViewingSnapshot: value }),
  setIsIframeReady: (value) => set({ isIframeReady: value }),
  setSelectedScreenSize: (size) => set({ selectedScreenSize: size }),
  setShowSettings: (show) => set({ showSettings: show }),
  setRegenHint: (hint) => set({ regenHint: hint }),
  
  pushUndo: (code) => set((state) => ({ 
    undoStack: [...state.undoStack, code] 
  })),
  
  popUndo: () => {
    const stack = get().undoStack;
    if (stack.length === 0) return undefined;
    const code = stack[stack.length - 1];
    set({ undoStack: stack.slice(0, -1) });
    return code;
  },
  
  pushRedo: (code) => set((state) => ({ 
    redoStack: [...state.redoStack, code] 
  })),
  
  popRedo: () => {
    const stack = get().redoStack;
    if (stack.length === 0) return undefined;
    const code = stack[stack.length - 1];
    set({ redoStack: stack.slice(0, -1) });
    return code;
  },
  
  clearRedoStack: () => set({ redoStack: [] }),
  
  setLastQuickAction: (action) => set({ lastQuickAction: action }),
}));