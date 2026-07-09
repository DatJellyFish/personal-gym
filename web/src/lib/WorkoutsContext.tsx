import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Workout, WorkoutPlan } from './types';
import { fetchWorkouts, fetchPlans } from './api';

interface WorkoutsContextValue {
  workouts: Workout[];
  plans: WorkoutPlan[];
  loading: boolean;
  refreshWorkouts: () => Promise<void>;
  refreshPlans: () => Promise<void>;
}

const WorkoutsContext = createContext<WorkoutsContextValue | null>(null);

export function WorkoutsProvider({ children }: { children: ReactNode }) {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [plans, setPlans] = useState<WorkoutPlan[]>([]);
  const [loading, setLoading] = useState(true);

  async function refreshWorkouts() {
    setWorkouts(await fetchWorkouts());
  }

  async function refreshPlans() {
    setPlans(await fetchPlans());
  }

  useEffect(() => {
    Promise.all([fetchWorkouts(), fetchPlans()])
      .then(([w, p]) => {
        setWorkouts(w);
        setPlans(p);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <WorkoutsContext.Provider value={{ workouts, plans, loading, refreshWorkouts, refreshPlans }}>
      {children}
    </WorkoutsContext.Provider>
  );
}

export function useWorkouts() {
  const ctx = useContext(WorkoutsContext);
  if (!ctx) throw new Error('useWorkouts must be used within WorkoutsProvider');
  return ctx;
}
