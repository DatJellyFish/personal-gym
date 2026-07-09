import { useState } from 'react';
import { useAppData } from '../lib/AppDataContext';
import { calcPersonalRecords, calcStreak, calcWeekCount, formatDate } from '../lib/utils';
import ProgressChartModal from '../components/ProgressChartModal';

export default function Profile() {
  const { sessions, routines, loading } = useAppData();
  const [activeExercise, setActiveExercise] = useState<string | null>(null);

  const totalSets = sessions.reduce(
    (acc, s) => acc + s.exercises.reduce((a, ex) => a + ex.sets.filter((set) => set.completed).length, 0),
    0,
  );
  const totalVolume = sessions.reduce(
    (acc, s) =>
      acc +
      s.exercises.reduce(
        (a, ex) =>
          a + ex.sets.reduce((b, set) => b + (set.completed && set.reps && set.weight ? set.reps * set.weight : 0), 0),
        0,
      ),
    0,
  );

  const stats = [
    { label: 'treinos concluídos', value: sessions.length },
    { label: 'dias de sequência', value: calcStreak(sessions) },
    { label: 'essa semana', value: calcWeekCount(sessions) },
    { label: 'rotinas salvas', value: routines.length },
    { label: 'séries totais', value: totalSets },
    { label: 'volume total (kg)', value: Math.round(totalVolume).toLocaleString('pt-BR') },
  ];

  const records = calcPersonalRecords(sessions);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-display text-2xl font-bold">Perfil</h1>
        <p className="text-sm text-ink-dim">Seu progresso geral e recordes pessoais.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl border border-card-border bg-card p-5">
            <div className="font-display text-3xl font-bold gradient-text">{s.value}</div>
            <div className="mt-1 text-xs text-ink-dim">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-card-border bg-card p-6">
        <h2 className="mb-4 text-lg font-semibold">Recordes pessoais</h2>
        {loading ? (
          <p className="text-sm text-ink-dim">Carregando...</p>
        ) : records.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-10 text-center text-ink-dim">
            <span className="text-3xl">🏆</span>
            <p className="text-sm">Nenhum recorde ainda. Complete um treino para começar.</p>
          </div>
        ) : (
          <div className="flex flex-col divide-y divide-card-border">
            {records.map((r) => (
              <button
                key={r.name}
                onClick={() => setActiveExercise(r.name)}
                className="flex items-center justify-between py-3 text-left transition-colors hover:text-accent-2"
              >
                <span className="font-medium">{r.name}</span>
                <span className="flex items-center gap-3 text-sm text-ink-dim">
                  <span className="font-display font-semibold text-ink">{r.weight}kg</span>
                  <span>{formatDate(r.date)}</span>
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      <ProgressChartModal exerciseName={activeExercise} sessions={sessions} onClose={() => setActiveExercise(null)} />
    </div>
  );
}
