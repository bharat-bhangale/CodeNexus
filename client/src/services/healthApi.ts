const BASE_URL = '/api/v1/code-health';

export async function analyzeHealth(projectId: string = 'default') {
  const res = await fetch(`${BASE_URL}/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ projectId }),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error?.message || 'Health analysis failed');
  return json.data;
}

export async function getLatestHealth(projectId: string = 'default') {
  const res = await fetch(`${BASE_URL}?projectId=${encodeURIComponent(projectId)}`);
  const json = await res.json();
  if (!json.success) throw new Error(json.error?.message || 'Failed to fetch health');
  return json.data;
}

export async function getHealthHistory(projectId: string = 'default', limit: number = 7) {
  const res = await fetch(
    `${BASE_URL}/history?projectId=${encodeURIComponent(projectId)}&limit=${limit}`
  );
  const json = await res.json();
  if (!json.success) throw new Error(json.error?.message || 'Failed to fetch health history');
  return json.data;
}
