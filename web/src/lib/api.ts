import type {
  Routine,
  WorkoutSession,
  ExerciseSuggestion,
  ExerciseDraft,
  RoutineExerciseDraft,
  SessionStatus,
} from './types';

const API = '/api';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    throw new Error(`Request failed: ${options?.method ?? 'GET'} ${path} (${res.status})`);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export function fetchRoutines(): Promise<Routine[]> {
  return request('/routines');
}

export function createRoutine(data: { name: string; notes: string; exercises: RoutineExerciseDraft[] }): Promise<Routine> {
  return request('/routines', { method: 'POST', body: JSON.stringify(data) });
}

export function updateRoutine(
  id: string,
  data: { name: string; notes: string; exercises: RoutineExerciseDraft[] },
): Promise<Routine> {
  return request(`/routines/${id}`, { method: 'PUT', body: JSON.stringify(data) });
}

export function deleteRoutine(id: string): Promise<void> {
  return request(`/routines/${id}`, { method: 'DELETE' });
}

export function fetchSessions(status?: SessionStatus): Promise<WorkoutSession[]> {
  return request(`/sessions${status ? `?status=${status}` : ''}`);
}

export function fetchSession(id: string): Promise<WorkoutSession> {
  return request(`/sessions/${id}`);
}

export function startSession(data: { name: string; date: string; routineId?: string | null }): Promise<WorkoutSession> {
  return request('/sessions', { method: 'POST', body: JSON.stringify(data) });
}

export function updateSession(
  id: string,
  data: { name: string; date: string; notes: string; exercises: ExerciseDraft[] },
): Promise<WorkoutSession> {
  return request(`/sessions/${id}`, { method: 'PUT', body: JSON.stringify(data) });
}

export function finishSession(id: string): Promise<WorkoutSession> {
  return request(`/sessions/${id}/finish`, { method: 'POST' });
}

export function deleteSession(id: string): Promise<void> {
  return request(`/sessions/${id}`, { method: 'DELETE' });
}

export async function searchExercises(term: string): Promise<ExerciseSuggestion[]> {
  if (term.trim().length < 2) return [];
  return request(`/exercises/search?q=${encodeURIComponent(term)}`);
}
