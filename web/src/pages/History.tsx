import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppData } from '../lib/AppDataContext';
import { deleteSession } from '../lib/api';
import { formatDate, sortByDateDesc } from '../lib/utils';
import ProgressChartModal from '../components/ProgressChartModal';

export default function History() {
  const { sessions, refreshSessions, loading } = useAppData();
  const [query, setQuery] = useState('');
  const [activeExercise, setActiveExercise] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const sorted = sortByDateDesc(sessions);
    const q = query.trim().toLowerCase();
    if (!q) return sorted;
    return sorted.filter(
      (s) => s.name.toLowerCase().includes(q) || s.exercises.some((ex) => ex.name.toLowerCase().includes(q)),
    );
  }, [sessions, query]);

  async function handleDelete(id: string, e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setDeletingId(id);
    try {
      await deleteSession(id);
      await refreshSessions();
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-2xl font-bold">Histórico</h1>
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
            {sessions.length === 0 ? 'Nenhum treino concluído ainda.' : 'Nenhum treino encontrado para essa busca.'}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {filtered.map((session) => (
            <Link
              to={`/sessao/${session.id}`}
              key={session.id}
              className="block rounded-2xl border border-card-border bg-card p-5 transition-colors hover:border-accent/40"
            >
              <div className="mb-3 flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-semibold">{session.name}</h3>
                  <span className="text-xs font-semibold text-accent-2">{formatDate(session.date)}</span>
                </div>
                <button
                  onClick={(e) => handleDelete(session.id, e)}
                  disabled={deletingId === session.id}
                  title="Excluir treino"
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-card-border text-ink-dim transition-colors hover:border-danger/40 hover:bg-danger/10 hover:text-danger disabled:opacity-50"
                >
                  🗑
                </button>
              </div>

              {session.exercises.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {session.exercises.map((ex) => {
                    const completedSets = ex.sets.filter((s) => s.completed);
                    const summary = completedSets.map((s) => `${s.reps ?? '?'}x${s.weight ?? '?'}kg`).join(', ');
                    return (
                      <span
                        key={ex.id}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setActiveExercise(ex.name);
                        }}
                        className="cursor-pointer rounded-full border border-card-border bg-bg-soft px-3 py-1 text-xs text-ink-dim transition-colors hover:border-accent hover:bg-accent/10"
                      >
                        <strong className="text-ink">{ex.name}</strong>
                        {summary ? ` — ${summary}` : ''}
                      </span>
                    );
                  })}
                </div>
              )}

              {session.notes && (
                <p className="mt-3 border-l-2 border-card-border pl-3 text-sm italic text-ink-dim">
                  {session.notes}
                </p>
              )}
            </Link>
          ))}
        </div>
      )}

      <ProgressChartModal exerciseName={activeExercise} sessions={sessions} onClose={() => setActiveExercise(null)} />
    </div>
  );
}
