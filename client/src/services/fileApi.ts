import axios from 'axios';
import type { FileTreeNode } from '@/stores/fileStore';

const api = axios.create({
  baseURL: '/api/v1/files',
  timeout: 10000,
});

export interface FileData {
  id: string;
  name: string;
  path: string;
  type: 'file' | 'folder';
  content: string;
  language: string;
  size: number;
  lineCount: number;
  parentPath?: string;
  version: number;
  updatedAt?: string;
}

// ─── Fetch file tree ───
export async function fetchFileTree(projectId = 'default'): Promise<FileTreeNode[]> {
  const res = await api.get('/', { params: { projectId } });
  return res.data.data;
}

// ─── Fetch file content by ID ───
export async function fetchFileContent(fileId: string): Promise<FileData> {
  const res = await api.get(`/${fileId}`);
  return res.data.data;
}

// ─── Create file or folder ───
export async function createFile(data: {
  name: string;
  path: string;
  type: 'file' | 'folder';
  content?: string;
  projectId?: string;
}): Promise<FileData> {
  const res = await api.post('/', {
    ...data,
    projectId: data.projectId || 'default',
  });
  return res.data.data;
}

// ─── Update file content ───
export async function updateFileContent(fileId: string, content: string): Promise<FileData> {
  const res = await api.put(`/${fileId}`, { content });
  return res.data.data;
}

// ─── Rename file ───
export async function renameFileApi(fileId: string, newName: string): Promise<FileData> {
  const res = await api.put(`/${fileId}`, { name: newName });
  return res.data.data;
}

// ─── Delete file ───
export async function deleteFileApi(fileId: string): Promise<void> {
  await api.delete(`/${fileId}`);
}

// ─── Seed project ───
export async function seedProject(projectId = 'default'): Promise<void> {
  await api.post('/seed', { projectId });
}
