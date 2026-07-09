import type { Workout } from './types';

export function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('-');
  return `${day}/${month}/${year}`;
}

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export function calcStreak(workouts: Workout[]): number {
  const days = new Set(workouts.map((w) => w.date));
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

export function calcWeekCount(workouts: Workout[]): number {
  const now = new Date();
  const weekAgo = new Date(now);
  weekAgo.setDate(now.getDate() - 6);
  const weekAgoKey = weekAgo.toISOString().slice(0, 10);
  return workouts.filter((w) => w.date >= weekAgoKey && w.date <= now.toISOString().slice(0, 10)).length;
}

export function sortByDateDesc(workouts: Workout[]): Workout[] {
  return [...workouts].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
}
