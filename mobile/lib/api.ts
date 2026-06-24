import * as SecureStore from 'expo-secure-store';

const DEFAULT_URL = 'http://192.168.1.100:3333';
const SERVER_URL_KEY = 'gym_server_url';

export async function getServerUrl(): Promise<string> {
  const stored = await SecureStore.getItemAsync(SERVER_URL_KEY);
  return stored || DEFAULT_URL;
}

export async function setServerUrl(url: string): Promise<void> {
  await SecureStore.setItemAsync(SERVER_URL_KEY, url.replace(/\/$/, ''));
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const base = await getServerUrl();
  const res = await fetch(`${base}/api${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
  put: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'PUT', body: JSON.stringify(body) }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
};

export type WorkoutPlan = {
  id: number;
  name: string;
  description: string | null;
  type: 'strength' | 'cardio' | 'mixed';
  exercise_count: number;
  created_at: string;
  updated_at: string;
  exercises?: PlanExercise[];
};

export type PlanExercise = {
  id: number;
  plan_id: number;
  name: string;
  sets: number | null;
  reps: string | null;
  weight: number | null;
  rest_seconds: number | null;
  notes: string | null;
  order_index: number;
};

export type WorkoutSession = {
  id: number;
  plan_id: number | null;
  plan_name: string | null;
  name: string;
  type: 'strength' | 'cardio';
  notes: string | null;
  started_at: string;
  completed_at: string | null;
  duration_minutes: number | null;
  exercises?: SessionExercise[];
  cardio?: CardioLog[];
};

export type SessionExercise = {
  name: string;
  sets: { set: number; reps: number | null; weight: number | null; notes: string | null }[];
};

export type CardioLog = {
  id: number;
  activity: string;
  distance_km: number | null;
  duration_seconds: number | null;
  avg_heart_rate: number | null;
  notes: string | null;
};

export type Stats = {
  total_sessions: number;
  sessions_this_week: number;
  sessions_this_month: number;
  total_volume_kg: number;
  total_distance_km: number;
};

export type PR = {
  name: string;
  max_weight: number;
  reps_at_max: number;
  max_reps: number;
  sessions_count: number;
};
