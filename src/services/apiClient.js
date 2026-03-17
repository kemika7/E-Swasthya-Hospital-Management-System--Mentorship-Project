const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api';

export async function apiFetch(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  const token = localStorage.getItem('token');

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const resp = await fetch(url, {
    ...options,
    headers,
  });

  const contentType = resp.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');
  const data = isJson ? await resp.json() : await resp.text();

  if (!resp.ok) {
    const errorMsg = typeof data === 'string' ? data : (data?.error || data?.message || `Request failed with status ${resp.status}`);
    const error = new Error(errorMsg);
    error.status = resp.status;
    error.path = path;
    console.error(`API Error [${resp.status}] ${path}:`, data);
    throw error;
  }
  return data;
}
