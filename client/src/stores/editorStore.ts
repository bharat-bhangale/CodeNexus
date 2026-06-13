import { create } from 'zustand';

export interface OpenFile {
  id: string;
  name: string;
  path: string;
  content: string;
  language: string;
  isDirty: boolean;
}

export interface CursorPosition {
  lineNumber: number;
  column: number;
}

export interface Selection {
  startLineNumber: number;
  startColumn: number;
  endLineNumber: number;
  endColumn: number;
}

interface EditorState {
  openFiles: OpenFile[];
  activeFileId: string | null;
  cursorPosition: CursorPosition;
  selection: Selection | null;

  openFile: (file: Omit<OpenFile, 'isDirty'>) => void;
  closeFile: (fileId: string) => void;
  setActiveFile: (fileId: string) => void;
  updateFileContent: (fileId: string, content: string) => void;
  markFileSaved: (fileId: string) => void;
  setCursorPosition: (position: CursorPosition) => void;
  setSelection: (selection: Selection | null) => void;
  getActiveFile: () => OpenFile | undefined;
}

export const useEditorStore = create<EditorState>((set, get) => ({
  openFiles: [],
  activeFileId: null,
  cursorPosition: { lineNumber: 1, column: 1 },
  selection: null,

  openFile: (file) => {
    const { openFiles } = get();
    const existing = openFiles.find((f) => f.id === file.id);
    if (existing) {
      set({ activeFileId: file.id });
      return;
    }
    set({
      openFiles: [...openFiles, { ...file, isDirty: false }],
      activeFileId: file.id,
    });
  },

  closeFile: (fileId) => {
    const { openFiles, activeFileId } = get();
    const idx = openFiles.findIndex((f) => f.id === fileId);
    const nextFiles = openFiles.filter((f) => f.id !== fileId);

    let nextActiveId = activeFileId;
    if (activeFileId === fileId) {
      if (nextFiles.length === 0) {
        nextActiveId = null;
      } else if (idx >= nextFiles.length) {
        nextActiveId = nextFiles[nextFiles.length - 1].id;
      } else {
        nextActiveId = nextFiles[idx].id;
      }
    }

    set({ openFiles: nextFiles, activeFileId: nextActiveId });
  },

  setActiveFile: (fileId) => set({ activeFileId: fileId }),

  updateFileContent: (fileId, content) => {
    set((state) => ({
      openFiles: state.openFiles.map((f) =>
        f.id === fileId ? { ...f, content, isDirty: true } : f
      ),
    }));
  },

  markFileSaved: (fileId) => {
    set((state) => ({
      openFiles: state.openFiles.map((f) =>
        f.id === fileId ? { ...f, isDirty: false } : f
      ),
    }));
  },

  setCursorPosition: (position) => set({ cursorPosition: position }),

  setSelection: (selection) => set({ selection }),

  getActiveFile: () => {
    const { openFiles, activeFileId } = get();
    return openFiles.find((f) => f.id === activeFileId);
  },
}));
