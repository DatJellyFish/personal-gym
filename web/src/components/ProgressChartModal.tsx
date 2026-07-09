import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend } from 'chart.js';
import { Line } from 'react-chartjs-2';
import type { Workout } from '../lib/types';
import { formatDate } from '../lib/utils';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

interface Props {
  exerciseName: string | null;
  workouts: Workout[];
  onClose: () => void;
}

export default function ProgressChartModal({ exerciseName, workouts, onClose }: Props) {
  if (!exerciseName) return null;

  const points = workouts
    .filter((w) => w.exercises.some((ex) => ex.name.toLowerCase() === exerciseName.toLowerCase() && ex.weight))
    .map((w) => {
      const ex = w.exercises.find((e) => e.name.toLowerCase() === exerciseName.toLowerCase() && e.weight)!;
      return { date: w.date, weight: ex.weight as number };
    })
    .sort((a, b) => (a.date > b.date ? 1 : -1));

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/75 p-5"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-lg rounded-2xl border border-card-border bg-card p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Evolução — {exerciseName}</h3>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-card-border text-ink-dim hover:text-ink"
          >
            ✕
          </button>
        </div>

        {points.length === 0 ? (
          <p className="py-8 text-center text-sm text-ink-dim">
            Nenhum registro de carga para este exercício ainda.
          </p>
        ) : (
          <Line
            data={{
              labels: points.map((p) => formatDate(p.date)),
              datasets: [
                {
                  label: 'Carga (kg)',
                  data: points.map((p) => p.weight),
                  borderColor: '#7c5cff',
                  backgroundColor: 'rgba(124, 92, 255, 0.15)',
                  tension: 0.3,
                  fill: true,
                  pointBackgroundColor: '#22d3c9',
                },
              ],
            }}
            options={{
              responsive: true,
              plugins: { legend: { labels: { color: '#eef1f7' } } },
              scales: {
                x: { ticks: { color: '#9aa4b8' }, grid: { color: 'rgba(255,255,255,0.05)' } },
                y: { ticks: { color: '#9aa4b8' }, grid: { color: 'rgba(255,255,255,0.05)' } },
              },
            }}
          />
        )}
      </div>
    </div>
  );
}
