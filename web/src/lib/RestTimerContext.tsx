import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';

const PRESETS = [30, 60, 90, 120];

function playBeep() {
  try {
    const AudioCtx =
      window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
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

interface RestTimerContextValue {
  collapsed: boolean;
  setCollapsed: (v: boolean | ((prev: boolean) => boolean)) => void;
  presets: number[];
  defaultSeconds: number;
  remaining: number;
  running: boolean;
  finished: boolean;
  selectPreset: (seconds: number) => void;
  toggleStart: () => void;
  reset: () => void;
  trigger: (seconds?: number) => void;
}

const RestTimerContext = createContext<RestTimerContextValue | null>(null);

export function RestTimerProvider({ children }: { children: ReactNode }) {
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

  function trigger(seconds?: number) {
    const s = seconds ?? defaultSeconds;
    setDefaultSeconds(s);
    setRemaining(s);
    setFinished(false);
    setRunning(true);
    setCollapsed(false);
  }

  return (
    <RestTimerContext.Provider
      value={{
        collapsed,
        setCollapsed,
        presets: PRESETS,
        defaultSeconds,
        remaining,
        running,
        finished,
        selectPreset,
        toggleStart,
        reset,
        trigger,
      }}
    >
      {children}
    </RestTimerContext.Provider>
  );
}

export function useRestTimer() {
  const ctx = useContext(RestTimerContext);
  if (!ctx) throw new Error('useRestTimer must be used within RestTimerProvider');
  return ctx;
}
