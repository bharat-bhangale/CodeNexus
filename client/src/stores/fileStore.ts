import { create } from 'zustand';

export interface FileTreeNode {
  id: string;
  name: string;
  path: string;
  isDirectory: boolean;
  language?: string;
  children?: FileTreeNode[];
}

interface FileState {
  fileTree: FileTreeNode[];
  projectName: string;
  selectedFilePath: string | null;
  isLoading: boolean;

  setFileTree: (tree: FileTreeNode[]) => void;
  setProjectName: (name: string) => void;
  setSelectedFilePath: (path: string | null) => void;
  addFile: (parentPath: string, file: FileTreeNode) => void;
  deleteFile: (filePath: string) => void;
  renameFile: (filePath: string, newName: string) => void;
  setLoading: (loading: boolean) => void;
}

function updateTreeRecursive(
  nodes: FileTreeNode[],
  parentPath: string,
  updater: (node: FileTreeNode) => FileTreeNode
): FileTreeNode[] {
  return nodes.map((node) => {
    if (node.path === parentPath) {
      return updater(node);
    }
    if (node.isDirectory && node.children) {
      return {
        ...node,
        children: updateTreeRecursive(node.children, parentPath, updater),
      };
    }
    return node;
  });
}

function removeFromTree(nodes: FileTreeNode[], filePath: string): FileTreeNode[] {
  return nodes
    .filter((node) => node.path !== filePath)
    .map((node) => {
      if (node.isDirectory && node.children) {
        return { ...node, children: removeFromTree(node.children, filePath) };
      }
      return node;
    });
}

export const useFileStore = create<FileState>((set) => ({
  fileTree: [],
  projectName: 'CodeNexus',
  selectedFilePath: null,
  isLoading: false,

  setFileTree: (tree) => set({ fileTree: tree }),
  setProjectName: (name) => set({ projectName: name }),
  setSelectedFilePath: (path) => set({ selectedFilePath: path }),
  setLoading: (loading) => set({ isLoading: loading }),

  addFile: (parentPath, file) =>
    set((state) => ({
      fileTree: updateTreeRecursive(state.fileTree, parentPath, (node) => ({
        ...node,
        children: [...(node.children || []), file],
      })),
    })),

  deleteFile: (filePath) =>
    set((state) => ({
      fileTree: removeFromTree(state.fileTree, filePath),
    })),

  renameFile: (filePath, newName) =>
    set((state) => ({
      fileTree: updateTreeRecursive(state.fileTree, filePath, (node) => ({
        ...node,
        name: newName,
      })),
    })),
}));
