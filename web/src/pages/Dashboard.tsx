import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useWorkouts } from '../lib/WorkoutsContext';
import { calcStreak, calcWeekCount, formatDate, sortByDateDesc } from '../lib/utils';
import ProgressChartModal from '../components/ProgressChartModal';

export default function Dashboard() {
  const { workouts, plans, loading } = useWorkouts();
  const [activeExercise, setActiveExercise] = useState<string | null>(null);
  const recent = sortByDateDesc(workouts).slice(0, 5);

  const stats = [
    { label: 'treinos registrados', value: workouts.length },
    { label: 'essa semana', value: calcWeekCount(workouts) },
    { label: 'dias de sequência', value: calcStreak(workouts) },
    { label: 'modelos salvos', value: plans.length },
  ];

  return (
    <div className="flex flex-col gap-8">
      <div>
        <span className="inline-block rounded-full border border-accent-2/25 bg-accent-2/10 px-3 py-1 text-xs text-accent-2">
          Bem-vindo de volta
        </span>
        <h1 className="mt-4 font-display text-4xl font-bold">
          Registre. Evolua. <span className="gradient-text">Repita.</span>
        </h1>
        <p className="mt-2 max-w-xl text-ink-dim">
          Acompanhe sua evolução, monte seus treinos e registre cada sessão em segundos.
        </p>
        <div className="mt-6 flex gap-3">
          <Link
            to="/registrar"
            className="rounded-full bg-gradient-to-r from-accent to-accent-2 px-6 py-3 text-sm font-semibold text-bg shadow-lg shadow-accent/25"
          >
            Registrar treino
          </Link>
          <Link
            to="/montar"
            className="rounded-full border border-card-border px-6 py-3 text-sm font-semibold text-ink hover:bg-white/5"
          >
            Montar treino
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl border border-card-border bg-card p-5">
            <div className="font-display text-3xl font-bold gradient-text">{s.value}</div>
            <div className="mt-1 text-xs text-ink-dim">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-card-border bg-card p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Treinos recentes</h2>
          <Link to="/treinos" className="text-sm text-accent-2 hover:underline">
            Ver todos
          </Link>
        </div>

        {loading ? (
          <p className="text-sm text-ink-dim">Carregando...</p>
        ) : recent.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-10 text-center text-ink-dim">
            <span className="text-3xl">🏋️</span>
            <p className="text-sm">Nenhum treino registrado ainda.</p>
            <Link to="/registrar" className="text-sm text-accent-2 hover:underline">
              Registrar o primeiro
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {recent.map((w) => (
              <div key={w.id} className="rounded-xl border border-card-border p-4">
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="font-semibold">{w.name}</h3>
                  <span className="text-xs font-semibold text-accent-2">{formatDate(w.date)}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {w.exercises.map((ex) => (
                    <button
                      key={ex.id}
                      onClick={() => setActiveExercise(ex.name)}
                      className="rounded-full border border-card-border bg-bg-soft px-3 py-1 text-xs text-ink-dim transition-colors hover:border-accent hover:bg-accent/10"
                    >
                      <strong className="text-ink">{ex.name}</strong>
                      {ex.weight ? ` — ${ex.weight}kg` : ''}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ProgressChartModal
        exerciseName={activeExercise}
        workouts={workouts}
        onClose={() => setActiveExercise(null)}
      />
    </div>
  );
}
