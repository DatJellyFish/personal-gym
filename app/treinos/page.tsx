"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { WorkoutSummary } from "@/lib/types";

export default function TreinosPage() {
  const [workouts, setWorkouts] = useState<WorkoutSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/workouts")
      .then((r) => r.json())
      .then((data) => {
        setWorkouts(data);
        setLoading(false);
      });
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Treinos</h1>
        <Link
          href="/treinos/novo"
          className="rounded-lg bg-emerald-500 text-neutral-950 font-semibold px-3 py-2 text-sm"
        >
          + Novo
        </Link>
      </div>

      {loading ? (
        <p className="text-neutral-400">Carregando...</p>
      ) : workouts.length === 0 ? (
        <p className="text-neutral-400">Nenhum treino registrado ainda.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {workouts.map((w) => (
            <Link
              key={w.id}
              href={`/treinos/${w.id}`}
              className="rounded-xl border border-neutral-800 bg-neutral-900 p-4"
            >
              <p className="font-semibold">
                {w.name || "Treino"} —{" "}
                {new Date(w.date + "T00:00:00").toLocaleDateString("pt-BR")}
              </p>
              <p className="text-neutral-400 text-sm mt-1">
                {w.exercise_count} exercícios · {w.set_count} séries ·{" "}
                {w.total_volume.toLocaleString("pt-BR")} kg volume
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
