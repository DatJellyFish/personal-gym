"use client";

import { useEffect, useState } from "react";
import type { Exercise } from "@/lib/types";

const MUSCLE_GROUPS = [
  "Peito",
  "Costas",
  "Pernas",
  "Ombro",
  "Bíceps",
  "Tríceps",
  "Abdômen",
  "Outro",
];

export default function ExerciciosPage() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [name, setName] = useState("");
  const [group, setGroup] = useState(MUSCLE_GROUPS[0]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    const res = await fetch("/api/exercises");
    setExercises(await res.json());
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function addExercise(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const res = await fetch("/api/exercises", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, muscle_group: group }),
    });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Erro ao adicionar");
      return;
    }
    setName("");
    load();
  }

  async function removeExercise(id: number) {
    if (!confirm("Remover este exercício?")) return;
    await fetch(`/api/exercises/${id}`, { method: "DELETE" });
    load();
  }

  const grouped = exercises.reduce<Record<string, Exercise[]>>((acc, ex) => {
    (acc[ex.muscle_group] ||= []).push(ex);
    return acc;
  }, {});

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Exercícios</h1>

      <form
        onSubmit={addExercise}
        className="rounded-xl border border-neutral-800 bg-neutral-900 p-4 flex flex-col gap-3"
      >
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nome do exercício"
          required
          className="rounded-lg bg-neutral-800 px-3 py-2 outline-none"
        />
        <select
          value={group}
          onChange={(e) => setGroup(e.target.value)}
          className="rounded-lg bg-neutral-800 px-3 py-2 outline-none"
        >
          {MUSCLE_GROUPS.map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </select>
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <button className="rounded-lg bg-emerald-500 text-neutral-950 font-semibold py-2">
          Adicionar exercício
        </button>
      </form>

      {loading ? (
        <p className="text-neutral-400">Carregando...</p>
      ) : (
        Object.entries(grouped).map(([groupName, items]) => (
          <div key={groupName}>
            <h2 className="text-sm font-semibold text-neutral-400 uppercase mb-2">
              {groupName}
            </h2>
            <div className="flex flex-col gap-2">
              {items.map((ex) => (
                <div
                  key={ex.id}
                  className="flex items-center justify-between rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2"
                >
                  <span>{ex.name}</span>
                  <button
                    onClick={() => removeExercise(ex.id)}
                    className="text-neutral-500 hover:text-red-400 text-sm"
                  >
                    remover
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
