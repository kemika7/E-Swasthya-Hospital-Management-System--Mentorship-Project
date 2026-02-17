const BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

export async function apiFetch(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  const resp = await fetch(url, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  });
  const contentType = resp.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');
  const data = isJson ? await resp.json() : await resp.text();
  if (!resp.ok) {
    throw new Error(typeof data === 'string' ? data : data?.message || 'Request failed');
  }
  return data;
}
