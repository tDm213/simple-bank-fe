export const API_BASE = 'http://localhost:3001/api';

export function getToken() {
  return localStorage.getItem('token');
}

export function setToken(token) {
  localStorage.setItem('token', token);
}

export function removeToken() {
  localStorage.removeItem('token');
}

export async function fetchJSON(url, options = {}) {
  const token = getToken();
  options.headers = {
    ...options.headers,
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
  };
  const res = await fetch(url, options);
  const data = await res.json();
  return { ok: res.ok, data };
}
