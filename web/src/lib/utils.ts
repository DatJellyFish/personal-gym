import type { WorkoutSession } from './types';

export function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('-');
  return `${day}/${month}/${year}`;
}

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export function calcStreak(sessions: WorkoutSession[]): number {
  const days = new Set(sessions.map((s) => s.date));
  let streak = 0;
  const cursor = new Date();
  while (true) {
    const key = cursor.toISOString().slice(0, 10);
    if (days.has(key)) {
      streak += 1;
      cursor.setDate(cursor.getDate() - 1);
    } else {
      break;
    }
  }
  return streak;
}

export function calcWeekCount(sessions: WorkoutSession[]): number {
  const now = new Date();
  const weekAgo = new Date(now);
  weekAgo.setDate(now.getDate() - 6);
  const weekAgoKey = weekAgo.toISOString().slice(0, 10);
  return sessions.filter((s) => s.date >= weekAgoKey && s.date <= now.toISOString().slice(0, 10)).length;
}

export function sortByDateDesc(sessions: WorkoutSession[]): WorkoutSession[] {
  return [...sessions].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
}

export function formatElapsed(startedAt: string): string {
  const seconds = Math.max(0, Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000));
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export interface PersonalRecord {
  name: string;
  weight: number;
  date: string;
}

export function calcPersonalRecords(sessions: WorkoutSession[]): PersonalRecord[] {
  const best = new Map<string, PersonalRecord>();
  for (const session of sessions) {
    for (const exercise of session.exercises) {
      for (const set of exercise.sets) {
        if (!set.completed || !set.weight) continue;
        const key = exercise.name.toLowerCase();
        const current = best.get(key);
        if (!current || set.weight > current.weight) {
          best.set(key, { name: exercise.name, weight: set.weight, date: session.date });
        }
      }
    }
  }
  return Array.from(best.values()).sort((a, b) => b.weight - a.weight);
}
