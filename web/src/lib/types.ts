export interface RoutineSet {
  id: string;
  routineExerciseId: string;
  order: number;
  targetReps: number | null;
  targetWeight: number | null;
}

export interface RoutineExercise {
  id: string;
  routineId: string;
  name: string;
  order: number;
  sets: RoutineSet[];
}

export interface Routine {
  id: string;
  name: string;
  notes: string;
  order: number;
  createdAt: string;
  exercises: RoutineExercise[];
}

export interface SessionSet {
  id: string;
  exerciseId: string;
  order: number;
  reps: number | null;
  weight: number | null;
  completed: boolean;
}

export interface SessionExercise {
  id: string;
  sessionId: string;
  name: string;
  order: number;
  sets: SessionSet[];
}

export type SessionStatus = 'active' | 'completed';

export interface WorkoutSession {
  id: string;
  name: string;
  date: string;
  status: SessionStatus;
  startedAt: string;
  completedAt: string | null;
  notes: string;
  routineId: string | null;
  exercises: SessionExercise[];
}

export interface SetDraft {
  reps: string;
  weight: string;
  completed: boolean;
}

export interface ExerciseDraft {
  name: string;
  sets: SetDraft[];
}

export interface RoutineSetDraft {
  targetReps: string;
  targetWeight: string;
}

export interface RoutineExerciseDraft {
  name: string;
  sets: RoutineSetDraft[];
}

export interface ExerciseSuggestion {
  id: number | null;
  name: string;
}
