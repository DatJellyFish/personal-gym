import { useEffect, useRef, useState } from 'react';

const PRESETS = [30, 60, 90, 120];

function formatTime(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
  const s = Math.floor(totalSeconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

function playBeep() {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 880;
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    osc.start();
    osc.stop(ctx.currentTime + 0.4);
    osc.onended = () => ctx.close();
  } catch {
    // audio not available, ignore
  }
}

export default function RestTimer() {
  const [collapsed, setCollapsed] = useState(true);
  const [defaultSeconds, setDefaultSeconds] = useState(90);
  const [remaining, setRemaining] = useState(90);
  const [running, setRunning] = useState(false);
  const [finished, setFinished] = useState(false);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (!running) return;
    intervalRef.current = window.setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          setRunning(false);
          setFinished(true);
          playBeep();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running]);

  function selectPreset(seconds: number) {
    setRunning(false);
    setFinished(false);
    setDefaultSeconds(seconds);
    setRemaining(seconds);
  }

  function toggleStart() {
    if (running) {
      setRunning(false);
      return;
    }
    setFinished(false);
    setRunning(true);
  }

  function reset() {
    setRunning(false);
    setFinished(false);
    setRemaining(defaultSeconds);
  }

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3">
      {!collapsed && (
        <div className="flex w-56 flex-col items-center gap-3 rounded-2xl border border-card-border bg-card p-4 shadow-2xl">
          <span
            className={`font-display text-4xl font-bold gradient-text ${finished ? 'animate-pulse' : ''}`}
          >
            {formatTime(remaining)}
          </span>
          <div className="flex flex-wrap justify-center gap-1.5">
            {PRESETS.map((seconds) => (
              <button
                key={seconds}
                onClick={() => selectPreset(seconds)}
                className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                  defaultSeconds === seconds
                    ? 'border-accent-2 text-accent-2'
                    : 'border-card-border text-ink-dim hover:text-ink'
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
            <button
              onClick={reset}
              className="flex-1 rounded-full border border-card-border py-2 text-sm text-ink-dim"
            >
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
