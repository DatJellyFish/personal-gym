"use client";

import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { Exercise } from "@/lib/types";

interface ProgressPoint {
  date: string;
  max_weight: number;
  volume: number;
}

export default function ProgressoPage() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [exerciseId, setExerciseId] = useState("");
  const [data, setData] = useState<ProgressPoint[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/exercises")
      .then((r) => r.json())
      .then(setExercises);
  }, []);

  useEffect(() => {
    if (!exerciseId) {
      setData([]);
      return;
    }
    setLoading(true);
    fetch(`/api/progress/${exerciseId}`)
      .then((r) => r.json())
      .then((rows) => {
        setData(rows);
        setLoading(false);
      });
  }, [exerciseId]);

  const chartData = data.map((d) => ({
    ...d,
    label: new Date(d.date + "T00:00:00").toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
    }),
  }));

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Progresso</h1>

      <select
        value={exerciseId}
        onChange={(e) => setExerciseId(e.target.value)}
        className="rounded-lg bg-neutral-800 px-3 py-2 outline-none"
      >
        <option value="">Selecione um exercício</option>
        {exercises.map((e) => (
          <option key={e.id} value={e.id}>
            {e.name}
          </option>
        ))}
      </select>

      {loading && <p className="text-neutral-400">Carregando...</p>}

      {!loading && exerciseId && data.length === 0 && (
        <p className="text-neutral-400">
          Nenhum registro ainda para este exercício.
        </p>
      )}

      {!loading && data.length > 0 && (
        <>
          <div>
            <p className="text-sm font-semibold text-neutral-400 mb-2">
              Carga máxima (kg) por treino
            </p>
            <div className="h-64 rounded-xl border border-neutral-800 bg-neutral-900 p-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="label" stroke="#888" fontSize={12} />
                  <YAxis stroke="#888" fontSize={12} />
                  <Tooltip
                    contentStyle={{ background: "#171717", border: "1px solid #333" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="max_weight"
                    stroke="#34d399"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold text-neutral-400 mb-2">
              Volume total (reps × kg) por treino
            </p>
            <div className="h-64 rounded-xl border border-neutral-800 bg-neutral-900 p-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="label" stroke="#888" fontSize={12} />
                  <YAxis stroke="#888" fontSize={12} />
                  <Tooltip
                    contentStyle={{ background: "#171717", border: "1px solid #333" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="volume"
                    stroke="#60a5fa"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
