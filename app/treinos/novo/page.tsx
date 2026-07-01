"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Exercise } from "@/lib/types";

interface SetRow {
  reps: string;
  weight: string;
}

interface Block {
  exercise_id: number;
  exercise_name: string;
  sets: SetRow[];
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

export default function NovoTreinoPage() {
  const router = useRouter();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [date, setDate] = useState(today());
  const [name, setName] = useState("");
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [pickExerciseId, setPickExerciseId] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/exercises")
      .then((r) => r.json())
      .then(setExercises);
  }, []);

  function addBlock() {
    if (!pickExerciseId) return;
    const ex = exercises.find((e) => e.id === Number(pickExerciseId));
    if (!ex) return;
    if (blocks.some((b) => b.exercise_id === ex.id)) return;
    setBlocks([
      ...blocks,
      { exercise_id: ex.id, exercise_name: ex.name, sets: [{ reps: "", weight: "" }] },
    ]);
    setPickExerciseId("");
  }

  function removeBlock(exerciseId: number) {
    setBlocks(blocks.filter((b) => b.exercise_id !== exerciseId));
  }

  function addSet(exerciseId: number) {
    setBlocks(
      blocks.map((b) =>
        b.exercise_id === exerciseId
          ? { ...b, sets: [...b.sets, { reps: "", weight: "" }] }
          : b
      )
    );
  }

  function removeSet(exerciseId: number, index: number) {
    setBlocks(
      blocks.map((b) =>
        b.exercise_id === exerciseId
          ? { ...b, sets: b.sets.filter((_, i) => i !== index) }
          : b
      )
    );
  }

  function updateSet(
    exerciseId: number,
    index: number,
    field: "reps" | "weight",
    value: string
  ) {
    setBlocks(
      blocks.map((b) =>
        b.exercise_id === exerciseId
          ? {
              ...b,
              sets: b.sets.map((s, i) =>
                i === index ? { ...s, [field]: value } : s
              ),
            }
          : b
      )
    );
  }

  async function save() {
    setError("");
    const sets = blocks.flatMap((b) =>
      b.sets
        .filter((s) => s.reps && s.weight)
        .map((s) => ({
          exercise_id: b.exercise_id,
          reps: Number(s.reps),
          weight: Number(s.weight),
        }))
    );

    if (sets.length === 0) {
      setError("Adicione ao menos uma série com reps e carga preenchidos.");
      return;
    }

    setSaving(true);
    const res = await fetch("/api/workouts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date, name, sets }),
    });
    setSaving(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Erro ao salvar treino");
      return;
    }

    const data = await res.json();
    router.push(`/treinos/${data.id}`);
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Novo treino</h1>

      <div className="flex gap-3">
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="rounded-lg bg-neutral-800 px-3 py-2 outline-none flex-1"
        />
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nome (opcional)"
          className="rounded-lg bg-neutral-800 px-3 py-2 outline-none flex-1"
        />
      </div>

      <div className="flex gap-2">
        <select
          value={pickExerciseId}
          onChange={(e) => setPickExerciseId(e.target.value)}
          className="rounded-lg bg-neutral-800 px-3 py-2 outline-none flex-1"
        >
          <option value="">Selecione um exercício</option>
          {exercises
            .filter((e) => !blocks.some((b) => b.exercise_id === e.id))
            .map((e) => (
              <option key={e.id} value={e.id}>
                {e.name} ({e.muscle_group})
              </option>
            ))}
        </select>
        <button
          onClick={addBlock}
          className="rounded-lg bg-neutral-800 px-4 py-2 font-semibold"
        >
          Adicionar
        </button>
      </div>

      {blocks.map((b) => (
        <div
          key={b.exercise_id}
          className="rounded-xl border border-neutral-800 bg-neutral-900 p-4 flex flex-col gap-3"
        >
          <div className="flex items-center justify-between">
            <p className="font-semibold">{b.exercise_name}</p>
            <button
              onClick={() => removeBlock(b.exercise_id)}
              className="text-neutral-500 hover:text-red-400 text-sm"
            >
              remover
            </button>
          </div>

          {b.sets.map((s, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="text-neutral-500 text-sm w-6">{i + 1}</span>
              <input
                type="number"
                inputMode="numeric"
                placeholder="reps"
                value={s.reps}
                onChange={(e) =>
                  updateSet(b.exercise_id, i, "reps", e.target.value)
                }
                className="rounded-lg bg-neutral-800 px-3 py-2 outline-none w-20"
              />
              <input
                type="number"
                inputMode="decimal"
                placeholder="kg"
                value={s.weight}
                onChange={(e) =>
                  updateSet(b.exercise_id, i, "weight", e.target.value)
                }
                className="rounded-lg bg-neutral-800 px-3 py-2 outline-none w-20"
              />
              <button
                onClick={() => removeSet(b.exercise_id, i)}
                className="text-neutral-500 hover:text-red-400 text-sm ml-auto"
              >
                x
              </button>
            </div>
          ))}

          <button
            onClick={() => addSet(b.exercise_id)}
            className="text-emerald-400 text-sm text-left"
          >
            + série
          </button>
        </div>
      ))}

      {error && <p className="text-red-400 text-sm">{error}</p>}

      <button
        onClick={save}
        disabled={saving || blocks.length === 0}
        className="rounded-xl bg-emerald-500 disabled:opacity-50 text-neutral-950 font-semibold py-4"
      >
        {saving ? "Salvando..." : "Salvar treino"}
      </button>
    </div>
  );
}
