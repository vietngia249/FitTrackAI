import { AuthResponseData, User } from './types.js';

const API_BASE = '/api/v1/auth';

export async function apiRegister(data: {
  email: string;
  password: string;
  displayName: string;
  fitnessGoal?: string;
  preferredUnits?: string;
  locale?: string;
}): Promise<AuthResponseData> {
  const res = await fetch(`${API_BASE}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  });

  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.message || 'Registration failed');
  }
  return json.data;
}

export async function apiLogin(data: {
  email: string;
  password: string;
}): Promise<AuthResponseData> {
  const res = await fetch(`${API_BASE}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  });

  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.message || 'Login failed');
  }
  return json.data;
}

export async function apiRefreshToken(): Promise<AuthResponseData> {
  const res = await fetch(`${API_BASE}/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  });

  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.message || 'Session expired');
  }
  return json.data;
}

export async function apiLogout(): Promise<void> {
  await fetch(`${API_BASE}/logout`, {
    method: 'POST',
    credentials: 'include',
  });
}

export async function apiGetMe(accessToken: string): Promise<User> {
  const res = await fetch(`${API_BASE}/me`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    credentials: 'include',
  });

  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.message || 'Failed to fetch user profile');
  }
  return json.data.user;
}
