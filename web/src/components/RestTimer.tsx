import { useRestTimer } from '../lib/RestTimerContext';

function formatTime(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
  const s = Math.floor(totalSeconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

export default function RestTimer() {
  const {
    collapsed,
    setCollapsed,
    presets,
    defaultSeconds,
    remaining,
    running,
    finished,
    selectPreset,
    toggleStart,
    reset,
  } = useRestTimer();

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3">
      {!collapsed && (
        <div className="flex w-56 flex-col items-center gap-3 rounded-2xl border border-card-border bg-card p-4 shadow-2xl">
          <span className={`font-display text-4xl font-bold gradient-text ${finished ? 'animate-pulse' : ''}`}>
            {formatTime(remaining)}
          </span>
          <div className="flex flex-wrap justify-center gap-1.5">
            {presets.map((seconds) => (
              <button
                key={seconds}
                onClick={() => selectPreset(seconds)}
                className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                  defaultSeconds === seconds ? 'border-accent-2 text-accent-2' : 'border-card-border text-ink-dim hover:text-ink'
                }`}
              >
                {seconds}s
              </button>
            ))}
          </div>
          <div className="flex w-full gap-2">
            <button
              onClick={toggleStart}
              className="flex-1 rounded-full bg-gradient-to-r from-accent to-accent-2 py-2 text-sm font-semibold text-bg"
            >
              {running ? 'Pausar' : 'Iniciar'}
            </button>
            <button onClick={reset} className="flex-1 rounded-full border border-card-border py-2 text-sm text-ink-dim">
              Zerar
            </button>
          </div>
        </div>
      )}
      <button
        onClick={() => setCollapsed((c) => !c)}
        title="Cronômetro de descanso"
        className="flex items-center justify-center rounded-full bg-gradient-to-r from-accent to-accent-2 text-xl text-bg shadow-xl transition-transform hover:scale-105"
        style={{ width: '52px', height: '52px' }}
      >
        ⏱
      </button>
    </div>
  );
}
