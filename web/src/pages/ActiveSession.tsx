import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppData } from '../lib/AppDataContext';
import { useRestTimer } from '../lib/RestTimerContext';
import { fetchSession, updateSession, finishSession, deleteSession } from '../lib/api';
import { formatDate, formatElapsed } from '../lib/utils';
import ExerciseAutocomplete from '../components/ExerciseAutocomplete';
import type { ExerciseDraft, WorkoutSession } from '../lib/types';

function toDraft(session: WorkoutSession): ExerciseDraft[] {
  return session.exercises.map((ex) => ({
    name: ex.name,
    sets: ex.sets.map((s) => ({
      reps: s.reps?.toString() ?? '',
      weight: s.weight?.toString() ?? '',
      completed: s.completed,
    })),
  }));
}

export default function ActiveSession() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { refreshActiveSession, refreshSessions } = useAppData();
  const { trigger: triggerRestTimer } = useRestTimer();

  const [session, setSession] = useState<WorkoutSession | null>(null);
  const [name, setName] = useState('');
  const [notes, setNotes] = useState('');
  const [exercises, setExercises] = useState<ExerciseDraft[]>([]);
  const [loading, setLoading] = useState(true);
  const [finishing, setFinishing] = useState(false);
  const [, setTick] = useState(0);
  const loadedRef = useRef(false);

  useEffect(() => {
    if (!id) return;
    fetchSession(id)
      .then((s) => {
        setSession(s);
        setName(s.name);
        setNotes(s.notes);
        setExercises(toDraft(s));
      })
      .catch((err) => console.error(err))
      .finally(() => {
        setLoading(false);
        setTimeout(() => (loadedRef.current = true), 0);
      });
  }, [id]);

  useEffect(() => {
    if (!session || session.status !== 'active') return;
    const interval = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(interval);
  }, [session]);

  useEffect(() => {
    if (!session || session.status !== 'active' || !loadedRef.current) return;
    const timer = setTimeout(() => {
      updateSession(session.id, { name, date: session.date, notes, exercises }).catch((err) =>
        console.error('autosave failed', err),
      );
    }, 700);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name, notes, exercises]);

  if (loading) return <p className="text-sm text-ink-dim">Carregando...</p>;
  if (!session) return <p className="text-sm text-ink-dim">Treino não encontrado.</p>;

  const isActive = session.status === 'active';

  function updateExerciseName(exIndex: number, value: string) {
    setExercises((prev) => prev.map((ex, i) => (i === exIndex ? { ...ex, name: value } : ex)));
  }

  function addExercise() {
    setExercises((prev) => [...prev, { name: '', sets: [{ reps: '', weight: '', completed: false }] }]);
  }

  function removeExercise(exIndex: number) {
    setExercises((prev) => prev.filter((_, i) => i !== exIndex));
  }

  function addSet(exIndex: number) {
    setExercises((prev) =>
      prev.map((ex, i) => {
        if (i !== exIndex) return ex;
        const last = ex.sets[ex.sets.length - 1];
        return {
          ...ex,
          sets: [...ex.sets, { reps: last?.reps ?? '', weight: last?.weight ?? '', completed: false }],
        };
      }),
    );
  }

  function removeSet(exIndex: number, setIndex: number) {
    setExercises((prev) =>
      prev.map((ex, i) => (i === exIndex ? { ...ex, sets: ex.sets.filter((_, si) => si !== setIndex) } : ex)),
    );
  }

  function updateSetField(exIndex: number, setIndex: number, field: 'reps' | 'weight', value: string) {
    setExercises((prev) =>
      prev.map((ex, i) =>
        i === exIndex
          ? { ...ex, sets: ex.sets.map((s, si) => (si === setIndex ? { ...s, [field]: value } : s)) }
          : ex,
      ),
    );
  }

  function toggleSetCompleted(exIndex: number, setIndex: number) {
    setExercises((prev) =>
      prev.map((ex, i) => {
        if (i !== exIndex) return ex;
        return {
          ...ex,
          sets: ex.sets.map((s, si) => {
            if (si !== setIndex) return s;
            const nextCompleted = !s.completed;
            if (nextCompleted) triggerRestTimer();
            return { ...s, completed: nextCompleted };
          }),
        };
      }),
    );
  }

  async function handleFinish() {
    if (!session) return;
    setFinishing(true);
    try {
      await updateSession(session.id, { name, date: session.date, notes, exercises });
      await finishSession(session.id);
      await Promise.all([refreshActiveSession(), refreshSessions()]);
      navigate(`/historico`);
    } catch (err) {
      alert('Não foi possível finalizar o treino.');
      console.error(err);
    } finally {
      setFinishing(false);
    }
  }

  async function handleDiscard() {
    if (!session) return;
    if (!confirm('Descartar esse treino em andamento? Essa ação não pode ser desfeita.')) return;
    await deleteSession(session.id);
    await refreshActiveSession();
    navigate('/');
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex-1">
          {isActive ? (
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-transparent font-display text-2xl font-bold outline-none"
            />
          ) : (
            <h1 className="font-display text-2xl font-bold">{name}</h1>
          )}
          <p className="text-xs text-ink-dim">{formatDate(session.date)}</p>
        </div>
        {isActive ? (
          <div className="flex items-center gap-3">
            <span className="font-display text-xl font-semibold text-accent-2">
              ⏱ {formatElapsed(session.startedAt)}
            </span>
            <button
              onClick={handleDiscard}
              className="rounded-full border border-danger/30 bg-danger/10 px-4 py-2 text-sm font-semibold text-danger"
            >
              Descartar
            </button>
            <button
              onClick={handleFinish}
              disabled={finishing}
              className="rounded-full bg-gradient-to-r from-accent to-accent-2 px-6 py-2.5 text-sm font-semibold text-bg disabled:opacity-60"
            >
              {finishing ? 'Finalizando...' : 'Finalizar treino'}
            </button>
          </div>
        ) : (
          <span className="rounded-full border border-card-border px-3 py-1 text-xs text-ink-dim">Concluído</span>
        )}
      </div>

      <div className="flex flex-col gap-4">
        {exercises.map((ex, exIndex) => (
          <div key={exIndex} className="rounded-2xl border border-card-border bg-card p-5">
            <div className="mb-3 flex items-center gap-2">
              {isActive ? (
                <ExerciseAutocomplete
                  value={ex.name}
                  onChange={(v) => updateExerciseName(exIndex, v)}
                  placeholder="Exercício"
                  className="w-full rounded-lg border border-card-border bg-bg-soft px-3 py-2 text-sm font-semibold outline-none focus:border-accent"
                />
              ) : (
                <h3 className="font-semibold">{ex.name}</h3>
              )}
              {isActive && (
                <button
                  onClick={() => removeExercise(exIndex)}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-danger/30 bg-danger/10 text-danger"
                >
                  ✕
                </button>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <div className="grid grid-cols-[auto_1fr_1fr_auto_auto] gap-2 px-1 text-xs text-ink-dim">
                <span className="w-6 text-center">#</span>
                <span>Reps</span>
                <span>Kg</span>
                <span className="w-9 text-center">✓</span>
                {isActive && <span className="w-9" />}
              </div>
              {ex.sets.map((set, setIndex) => (
                <div
                  key={setIndex}
                  className={`grid grid-cols-[auto_1fr_1fr_auto_auto] items-center gap-2 rounded-lg p-1 transition-colors ${
                    set.completed ? 'bg-accent-2/10' : ''
                  }`}
                >
                  <span className="w-6 text-center text-xs text-ink-dim">{setIndex + 1}</span>
                  <input
                    type="number"
                    min={0}
                    placeholder="0"
                    value={set.reps}
                    disabled={!isActive}
                    onChange={(e) => updateSetField(exIndex, setIndex, 'reps', e.target.value)}
                    className="rounded-lg border border-card-border bg-bg-soft px-2 py-2 text-sm outline-none focus:border-accent disabled:opacity-70"
                  />
                  <input
                    type="number"
                    min={0}
                    step={0.5}
                    placeholder="0"
                    value={set.weight}
                    disabled={!isActive}
                    onChange={(e) => updateSetField(exIndex, setIndex, 'weight', e.target.value)}
                    className="rounded-lg border border-card-border bg-bg-soft px-2 py-2 text-sm outline-none focus:border-accent disabled:opacity-70"
                  />
                  <button
                    type="button"
                    disabled={!isActive}
                    onClick={() => toggleSetCompleted(exIndex, setIndex)}
                    className={`flex h-9 w-9 items-center justify-center rounded-lg border text-sm transition-colors ${
                      set.completed
                        ? 'border-accent-2 bg-accent-2 text-bg'
                        : 'border-card-border text-ink-dim hover:border-accent-2'
                    }`}
                  >
                    ✓
                  </button>
                  {isActive && (
                    <button
                      onClick={() => removeSet(exIndex, setIndex)}
                      className="flex h-9 w-9 items-center justify-center rounded-lg text-ink-dim hover:text-danger"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>

            {isActive && (
              <button
                onClick={() => addSet(exIndex)}
                className="mt-3 rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-xs font-semibold text-accent-2"
              >
                + Série
              </button>
            )}
          </div>
        ))}

        {isActive && (
          <button
            onClick={addExercise}
            className="self-start rounded-full border border-accent/30 bg-accent/10 px-4 py-2 text-sm font-semibold text-accent-2"
          >
            + Exercício
          </button>
        )}
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-ink-dim">Notas</label>
        {isActive ? (
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Como se sentiu, recordes pessoais, etc."
            className="w-full rounded-lg border border-card-border bg-bg-soft px-3 py-2.5 text-sm outline-none focus:border-accent"
          />
        ) : (
          notes && <p className="text-sm italic text-ink-dim">{notes}</p>
        )}
      </div>
    </div>
  );
}
