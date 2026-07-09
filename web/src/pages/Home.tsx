import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAppData } from '../lib/AppDataContext';
import { startSession } from '../lib/api';
import { calcStreak, calcWeekCount, formatDate, todayISO } from '../lib/utils';

export default function Home() {
  const { routines, sessions, activeSession, loading, refreshActiveSession } = useAppData();
  const navigate = useNavigate();
  const [starting, setStarting] = useState(false);

  const recent = sessions.slice(0, 3);
  const stats = [
    { label: 'treinos concluídos', value: sessions.length },
    { label: 'essa semana', value: calcWeekCount(sessions) },
    { label: 'dias de sequência', value: calcStreak(sessions) },
  ];

  async function handleStart(routineId?: string, name?: string) {
    if (activeSession) {
      navigate(`/sessao/${activeSession.id}`);
      return;
    }
    setStarting(true);
    try {
      const session = await startSession({
        name: name ?? 'Treino livre',
        date: todayISO(),
        routineId: routineId ?? null,
      });
      await refreshActiveSession();
      navigate(`/sessao/${session.id}`);
    } catch (err) {
      alert('Não foi possível iniciar o treino.');
      console.error(err);
    } finally {
      setStarting(false);
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <span className="inline-block rounded-full border border-accent-2/25 bg-accent-2/10 px-3 py-1 text-xs text-accent-2">
          Bem-vindo de volta
        </span>
        <h1 className="mt-4 font-display text-4xl font-bold">
          Registre. Evolua. <span className="gradient-text">Repita.</span>
        </h1>
        <p className="mt-2 max-w-xl text-ink-dim">Inicie um treino agora e loga cada série em tempo real.</p>
        <button
          onClick={() => handleStart()}
          disabled={starting}
          className="mt-6 rounded-full bg-gradient-to-r from-accent to-accent-2 px-6 py-3 text-sm font-semibold text-bg shadow-lg shadow-accent/25 disabled:opacity-60"
        >
          {activeSession ? 'Continuar treino' : starting ? 'Iniciando...' : '▶ Iniciar treino em branco'}
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl border border-card-border bg-card p-5">
            <div className="font-display text-3xl font-bold gradient-text">{s.value}</div>
            <div className="mt-1 text-xs text-ink-dim">{s.label}</div>
          </div>
        ))}
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Suas rotinas</h2>
          <Link to="/rotinas" className="text-sm text-accent-2 hover:underline">
            Gerenciar
          </Link>
        </div>

        {loading ? (
          <p className="text-sm text-ink-dim">Carregando...</p>
        ) : routines.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-card-border py-10 text-center text-ink-dim">
            <span className="text-3xl">🧩</span>
            <p className="text-sm">Nenhuma rotina criada ainda.</p>
            <Link to="/rotinas" className="text-sm text-accent-2 hover:underline">
              Criar a primeira
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {routines.map((routine) => (
              <button
                key={routine.id}
                onClick={() => handleStart(routine.id, routine.name)}
                disabled={starting}
                className="rounded-2xl border border-card-border bg-card p-5 text-left transition-colors hover:border-accent/40 disabled:opacity-60"
              >
                <h3 className="font-semibold">{routine.name}</h3>
                <p className="mt-1 text-xs text-ink-dim">
                  {routine.exercises.length} exercício{routine.exercises.length !== 1 ? 's' : ''}
                </p>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-card-border bg-card p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Treinos recentes</h2>
          <Link to="/historico" className="text-sm text-accent-2 hover:underline">
            Ver todos
          </Link>
        </div>

        {recent.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-10 text-center text-ink-dim">
            <span className="text-3xl">🏋️</span>
            <p className="text-sm">Nenhum treino concluído ainda.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {recent.map((s) => (
              <div key={s.id} className="rounded-xl border border-card-border p-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">{s.name}</h3>
                  <span className="text-xs font-semibold text-accent-2">{formatDate(s.date)}</span>
                </div>
                <p className="mt-1 text-xs text-ink-dim">
                  {s.exercises.length} exercício{s.exercises.length !== 1 ? 's' : ''} ·{' '}
                  {s.exercises.reduce((acc, ex) => acc + ex.sets.filter((set) => set.completed).length, 0)} séries
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
