import { useMemo, useState } from 'react';
import { useWorkouts } from '../lib/WorkoutsContext';
import { deleteWorkout } from '../lib/api';
import { formatDate, sortByDateDesc } from '../lib/utils';
import ProgressChartModal from '../components/ProgressChartModal';

export default function History() {
  const { workouts, refreshWorkouts, loading } = useWorkouts();
  const [query, setQuery] = useState('');
  const [activeExercise, setActiveExercise] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const sorted = sortByDateDesc(workouts);
    const q = query.trim().toLowerCase();
    if (!q) return sorted;
    return sorted.filter(
      (w) =>
        w.name.toLowerCase().includes(q) || w.exercises.some((ex) => ex.name.toLowerCase().includes(q)),
    );
  }, [workouts, query]);

  async function handleDelete(id: string) {
    setDeletingId(id);
    try {
      await deleteWorkout(id);
      await refreshWorkouts();
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-2xl font-bold">Treinos salvos</h1>
        <input
          type="search"
          placeholder="Buscar por treino ou exercício..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-72 max-w-full rounded-lg border border-card-border bg-bg-soft px-3 py-2 text-sm outline-none focus:border-accent"
        />
      </div>

      {loading ? (
        <p className="text-sm text-ink-dim">Carregando...</p>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-card-border py-16 text-center text-ink-dim">
          <span className="text-3xl">🏋️</span>
          <p className="text-sm">
            {workouts.length === 0
              ? 'Nenhum treino registrado ainda.'
              : 'Nenhum treino encontrado para essa busca.'}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {filtered.map((w) => (
            <article
              key={w.id}
              className="rounded-2xl border border-card-border bg-card p-5 transition-colors hover:border-accent/40"
            >
              <div className="mb-3 flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-semibold">{w.name}</h3>
                  <span className="text-xs font-semibold text-accent-2">{formatDate(w.date)}</span>
                </div>
                <button
                  onClick={() => handleDelete(w.id)}
                  disabled={deletingId === w.id}
                  title="Excluir treino"
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-card-border text-ink-dim transition-colors hover:border-danger/40 hover:bg-danger/10 hover:text-danger disabled:opacity-50"
                >
                  🗑
                </button>
              </div>

              {w.exercises.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {w.exercises.map((ex) => {
                    const parts = [];
                    if (ex.sets) parts.push(`${ex.sets}x`);
                    if (ex.reps) parts.push(`${ex.reps}`);
                    let detail = parts.join('');
                    if (ex.weight) detail += (detail ? ' · ' : '') + `${ex.weight}kg`;
                    return (
                      <button
                        key={ex.id}
                        onClick={() => setActiveExercise(ex.name)}
                        className="rounded-full border border-card-border bg-bg-soft px-3 py-1 text-xs text-ink-dim transition-colors hover:border-accent hover:bg-accent/10"
                      >
                        <strong className="text-ink">{ex.name}</strong>
                        {detail ? ` — ${detail}` : ''}
                      </button>
                    );
                  })}
                </div>
              )}

              {w.notes && (
                <p className="mt-3 border-l-2 border-card-border pl-3 text-sm italic text-ink-dim">
                  {w.notes}
                </p>
              )}
            </article>
          ))}
        </div>
      )}

      <ProgressChartModal
        exerciseName={activeExercise}
        workouts={workouts}
        onClose={() => setActiveExercise(null)}
      />
    </div>
  );
}
