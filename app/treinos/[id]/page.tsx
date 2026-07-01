"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import type { WorkoutWithSets } from "@/lib/types";

export default function TreinoDetalhePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [workout, setWorkout] = useState<WorkoutWithSets | null>(null);

  useEffect(() => {
    fetch(`/api/workouts/${id}`)
      .then((r) => r.json())
      .then(setWorkout);
  }, [id]);

  async function remove() {
    if (!confirm("Excluir este treino?")) return;
    await fetch(`/api/workouts/${id}`, { method: "DELETE" });
    router.push("/treinos");
  }

  if (!workout) return <p className="text-neutral-400">Carregando...</p>;

  const grouped = workout.sets.reduce<Record<string, typeof workout.sets>>(
    (acc, s) => {
      (acc[s.exercise_name] ||= []).push(s);
      return acc;
    },
    {}
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{workout.name || "Treino"}</h1>
          <p className="text-neutral-400 text-sm">
            {new Date(workout.date + "T00:00:00").toLocaleDateString("pt-BR")}
          </p>
        </div>
        <button onClick={remove} className="text-red-400 text-sm">
          Excluir
        </button>
      </div>

      {Object.entries(grouped).map(([exerciseName, sets]) => (
        <div
          key={exerciseName}
          className="rounded-xl border border-neutral-800 bg-neutral-900 p-4"
        >
          <p className="font-semibold mb-2">{exerciseName}</p>
          <div className="flex flex-col gap-1">
            {sets.map((s) => (
              <p key={s.id} className="text-neutral-300 text-sm">
                Série {s.set_number}: {s.reps} reps × {s.weight} kg
              </p>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
