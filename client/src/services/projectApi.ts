import { useAuthStore } from '@/stores/authStore';

const BASE_URL = '/api/v1/projects';

function getHeaders(): HeadersInit {
  const token = useAuthStore.getState().accessToken;
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

export async function fetchProjects() {
  const res = await fetch(BASE_URL, { headers: getHeaders() });
  const json = await res.json();
  if (!json.success) throw new Error(json.error?.message || 'Failed to fetch projects');
  return json.data;
}

export async function fetchProject(id: string) {
  const res = await fetch(`${BASE_URL}/${id}`, { headers: getHeaders() });
  const json = await res.json();
  if (!json.success) throw new Error(json.error?.message || 'Failed to fetch project');
  return json.data;
}

export async function createProject(data: { name: string; description?: string; template?: string }) {
  const res = await fetch(BASE_URL, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error?.message || 'Failed to create project');
  return json.data;
}

export async function updateProject(id: string, updates: Record<string, any>) {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(updates),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error?.message || 'Failed to update project');
  return json.data;
}

export async function deleteProject(id: string) {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error?.message || 'Failed to delete project');
  return json;
}
