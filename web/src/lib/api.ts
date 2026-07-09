import type { Workout, WorkoutPlan, ExerciseSuggestion, ExerciseDraft, PlanExerciseDraft } from './types';

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

export function fetchWorkouts(): Promise<Workout[]> {
  return request('/workouts');
}

export function createWorkout(data: {
  name: string;
  date: string;
  notes: string;
  planId?: string | null;
  exercises: ExerciseDraft[];
}): Promise<Workout> {
  return request('/workouts', { method: 'POST', body: JSON.stringify(data) });
}

export function deleteWorkout(id: string): Promise<void> {
  return request(`/workouts/${id}`, { method: 'DELETE' });
}

export function fetchPlans(): Promise<WorkoutPlan[]> {
  return request('/plans');
}

export function createPlan(data: {
  name: string;
  notes: string;
  exercises: PlanExerciseDraft[];
}): Promise<WorkoutPlan> {
  return request('/plans', { method: 'POST', body: JSON.stringify(data) });
}

export function updatePlan(
  id: string,
  data: { name: string; notes: string; exercises: PlanExerciseDraft[] },
): Promise<WorkoutPlan> {
  return request(`/plans/${id}`, { method: 'PUT', body: JSON.stringify(data) });
}

export function deletePlan(id: string): Promise<void> {
  return request(`/plans/${id}`, { method: 'DELETE' });
}

export async function searchExercises(term: string): Promise<ExerciseSuggestion[]> {
  if (term.trim().length < 2) return [];
  return request(`/exercises/search?q=${encodeURIComponent(term)}`);
}
