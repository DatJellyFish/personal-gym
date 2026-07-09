import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Routine, WorkoutSession } from './types';
import { fetchRoutines, fetchSessions } from './api';

interface AppDataContextValue {
  routines: Routine[];
  sessions: WorkoutSession[];
  activeSession: WorkoutSession | null;
  loading: boolean;
  refreshRoutines: () => Promise<void>;
  refreshSessions: () => Promise<void>;
  refreshActiveSession: () => Promise<void>;
  setActiveSession: (session: WorkoutSession | null) => void;
}

const AppDataContext = createContext<AppDataContextValue | null>(null);

export function AppDataProvider({ children }: { children: ReactNode }) {
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [activeSession, setActiveSession] = useState<WorkoutSession | null>(null);
  const [loading, setLoading] = useState(true);

  async function refreshRoutines() {
    setRoutines(await fetchRoutines());
  }

  async function refreshSessions() {
    setSessions(await fetchSessions('completed'));
  }

  async function refreshActiveSession() {
    const active = await fetchSessions('active');
    setActiveSession(active[0] ?? null);
  }

  useEffect(() => {
    Promise.all([fetchRoutines(), fetchSessions('completed'), fetchSessions('active')])
      .then(([r, s, active]) => {
        setRoutines(r);
        setSessions(s);
        setActiveSession(active[0] ?? null);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <AppDataContext.Provider
      value={{
        routines,
        sessions,
        activeSession,
        loading,
        refreshRoutines,
        refreshSessions,
        refreshActiveSession,
        setActiveSession,
      }}
    >
      {children}
    </AppDataContext.Provider>
  );
}

export function useAppData() {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error('useAppData must be used within AppDataProvider');
  return ctx;
}
