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

export async function apiGoogleAuth(idToken: string): Promise<AuthResponseData> {
  const res = await fetch(`${API_BASE}/google`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ idToken }),
  });

  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.message || 'Google authentication failed');
  }
  return json.data;
}

export async function apiUpdateProfile(
  accessToken: string,
  data: {
    displayName?: string;
    dateOfBirth?: string | null;
    biologicalSex?: 'male' | 'female' | 'other' | null;
    height?: number | null;
    currentWeight?: number | null;
    targetWeight?: number | null;
    activityLevel?: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active' | null;
    fitnessGoal?: 'muscle_gain' | 'fat_loss' | 'maintenance' | 'strength' | null;
    preferredUnits?: 'metric' | 'imperial';
    locale?: 'en' | 'vi';
  }
): Promise<User> {
  const res = await fetch(`${API_BASE}/profile`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    credentials: 'include',
    body: JSON.stringify(data),
  });

  const json = await res.json().catch(() => ({ message: 'Network response error' }));
  if (!res.ok) {
    const error: any = new Error(json.message || 'Failed to update profile');
    error.status = res.status;
    error.statusCode = res.status;
    throw error;
  }
  return json.data.user;
}

