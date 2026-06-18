import { useAuthStore } from '@/stores/authStore';

const BASE_URL = '/api/v1/auth';

function getHeaders(): HeadersInit {
  const token = useAuthStore.getState().accessToken;
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

export async function registerUser(fullName: string, email: string, password: string) {
  const res = await fetch(`${BASE_URL}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fullName, email, password }),
  });
  const json = await res.json();
  if (!json.success) {
    const msg = json.error?.details?.map((d: any) => d.message).join('. ') || json.error?.message || 'Registration failed';
    throw new Error(msg);
  }
  return json.data;
}

export async function loginUser(email: string, password: string) {
  const res = await fetch(`${BASE_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const json = await res.json();
  if (!json.success) {
    throw new Error(json.error?.message || 'Login failed');
  }
  return json.data;
}

export async function refreshAccessToken(refreshToken: string) {
  const res = await fetch(`${BASE_URL}/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  });
  const json = await res.json();
  if (!json.success) throw new Error('Token refresh failed');
  return json.data;
}

export async function logoutUser(refreshToken: string | null) {
  try {
    await fetch(`${BASE_URL}/logout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
  } catch {
    // Silently fail — local logout is sufficient
  }
}

export async function getMe() {
  const res = await fetch(`${BASE_URL}/me`, { headers: getHeaders() });
  const json = await res.json();
  if (!json.success) throw new Error(json.error?.message || 'Failed to fetch user');
  return json.data;
}

export async function updateMe(updates: Record<string, any>) {
  const res = await fetch(`${BASE_URL}/me`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(updates),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error?.message || 'Update failed');
  return json.data;
}

export async function changePassword(currentPassword: string, newPassword: string) {
  const res = await fetch(`${BASE_URL}/password`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify({ currentPassword, newPassword }),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error?.message || 'Password change failed');
  return json.data;
}
