export interface Exercise {
  id: string;
  workoutId: string;
  name: string;
  sets: number | null;
  reps: number | null;
  weight: number | null;
  order: number;
}

export interface Workout {
  id: string;
  name: string;
  date: string;
  notes: string;
  createdAt: string;
  planId: string | null;
  exercises: Exercise[];
}

export interface ExerciseDraft {
  name: string;
  sets: string;
  reps: string;
  weight: string;
}

export interface PlanExercise {
  id: string;
  planId: string;
  name: string;
  targetSets: number | null;
  targetReps: number | null;
  order: number;
}

export interface WorkoutPlan {
  id: string;
  name: string;
  notes: string;
  createdAt: string;
  exercises: PlanExercise[];
}

export interface PlanExerciseDraft {
  name: string;
  targetSets: string;
  targetReps: string;
}

export interface ExerciseSuggestion {
  id: number | null;
  name: string;
}
