export interface Exercise {
  id: number;
  name: string;
  muscle_group: string;
  notes: string | null;
}

export interface SetInput {
  exercise_id: number;
  reps: number;
  weight: number;
}

export interface WorkoutSet {
  id: number;
  workout_id: number;
  exercise_id: number;
  exercise_name: string;
  set_number: number;
  reps: number;
  weight: number;
}

export interface Workout {
  id: number;
  date: string;
  name: string | null;
  notes: string | null;
}

export interface WorkoutWithSets extends Workout {
  sets: WorkoutSet[];
}

export interface WorkoutSummary extends Workout {
  exercise_count: number;
  set_count: number;
  total_volume: number;
}
