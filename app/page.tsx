import Link from "next/link";
import { db } from "@/lib/db";
import type { WorkoutSummary } from "@/lib/types";

export const dynamic = "force-dynamic";

export default function Home() {
  const stats = db
    .prepare(
      `SELECT COUNT(*) as total_workouts,
              (SELECT COUNT(*) FROM exercises) as total_exercises
       FROM workouts`
    )
    .get() as { total_workouts: number; total_exercises: number };

  const lastWorkout = db
    .prepare(
      `SELECT w.*,
        COUNT(DISTINCT ws.exercise_id) as exercise_count,
        COUNT(ws.id) as set_count,
        COALESCE(SUM(ws.reps * ws.weight), 0) as total_volume
       FROM workouts w
       LEFT JOIN workout_sets ws ON ws.workout_id = w.id
       GROUP BY w.id
       ORDER BY w.date DESC, w.id DESC
       LIMIT 1`
    )
    .get() as WorkoutSummary | undefined;

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-2xl font-bold">Personal Gym</h1>
        <p className="text-neutral-400 text-sm">Seu registro de treinos</p>
      </header>

      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-4">
          <p className="text-3xl font-bold">{stats.total_workouts}</p>
          <p className="text-neutral-400 text-sm">treinos registrados</p>
        </div>
        <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-4">
          <p className="text-3xl font-bold">{stats.total_exercises}</p>
          <p className="text-neutral-400 text-sm">exercícios na biblioteca</p>
        </div>
      </div>

      <Link
        href="/treinos/novo"
        className="rounded-xl bg-emerald-500 text-neutral-950 font-semibold text-center py-4"
      >
        + Registrar treino
      </Link>

      {lastWorkout && (
        <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-4">
          <p className="text-neutral-400 text-sm mb-1">Último treino</p>
          <p className="font-semibold">
            {lastWorkout.name || "Treino"} —{" "}
            {new Date(lastWorkout.date + "T00:00:00").toLocaleDateString(
              "pt-BR"
            )}
          </p>
          <p className="text-neutral-400 text-sm mt-1">
            {lastWorkout.exercise_count} exercícios · {lastWorkout.set_count}{" "}
            séries · {lastWorkout.total_volume.toLocaleString("pt-BR")} kg
            volume
          </p>
          <Link
            href={`/treinos/${lastWorkout.id}`}
            className="inline-block mt-3 text-emerald-400 text-sm"
          >
            Ver detalhes →
          </Link>
        </div>
      )}
    </div>
  );
}
