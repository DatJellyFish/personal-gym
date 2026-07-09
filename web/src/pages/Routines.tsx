import { useState } from 'react';
import { useAppData } from '../lib/AppDataContext';
import { createRoutine, updateRoutine, deleteRoutine } from '../lib/api';
import ExerciseAutocomplete from '../components/ExerciseAutocomplete';
import type { Routine, RoutineExerciseDraft } from '../lib/types';

function emptyExercise(): RoutineExerciseDraft {
  return { name: '', sets: [{ targetReps: '', targetWeight: '' }] };
}

export default function Routines() {
  const { routines, refreshRoutines, loading } = useAppData();
  const [editing, setEditing] = useState<Routine | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [notes, setNotes] = useState('');
  const [exercises, setExercises] = useState<RoutineExerciseDraft[]>([emptyExercise()]);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  function openNewForm() {
    setEditing(null);
    setName('');
    setNotes('');
    setExercises([emptyExercise()]);
    setShowForm(true);
  }

  function openEditForm(routine: Routine) {
    setEditing(routine);
    setName(routine.name);
    setNotes(routine.notes);
    setExercises(
      routine.exercises.length
        ? routine.exercises.map((ex) => ({
            name: ex.name,
            sets: ex.sets.length
              ? ex.sets.map((s) => ({
                  targetReps: s.targetReps?.toString() ?? '',
                  targetWeight: s.targetWeight?.toString() ?? '',
                }))
              : [{ targetReps: '', targetWeight: '' }],
          }))
        : [emptyExercise()],
    );
    setShowForm(true);
  }

  function updateExerciseName(index: number, value: string) {
    setExercises((prev) => prev.map((ex, i) => (i === index ? { ...ex, name: value } : ex)));
  }

  function addExercise() {
    setExercises((prev) => [...prev, emptyExercise()]);
  }

  function removeExercise(index: number) {
    setExercises((prev) => prev.filter((_, i) => i !== index));
  }

  function addSet(exIndex: number) {
    setExercises((prev) =>
      prev.map((ex, i) => (i === exIndex ? { ...ex, sets: [...ex.sets, { targetReps: '', targetWeight: '' }] } : ex)),
    );
  }

  function removeSet(exIndex: number, setIndex: number) {
    setExercises((prev) =>
      prev.map((ex, i) => (i === exIndex ? { ...ex, sets: ex.sets.filter((_, si) => si !== setIndex) } : ex)),
    );
  }

  function updateSet(exIndex: number, setIndex: number, field: 'targetReps' | 'targetWeight', value: string) {
    setExercises((prev) =>
      prev.map((ex, i) =>
        i === exIndex
          ? { ...ex, sets: ex.sets.map((s, si) => (si === setIndex ? { ...s, [field]: value } : s)) }
          : ex,
      ),
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { name: name.trim(), notes: notes.trim(), exercises };
      if (editing) {
        await updateRoutine(editing.id, payload);
      } else {
        await createRoutine(payload);
      }
      await refreshRoutines();
      setShowForm(false);
    } catch (err) {
      alert('Não foi possível salvar a rotina.');
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    try {
      await deleteRoutine(id);
      await refreshRoutines();
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">Rotinas</h1>
          <p className="text-sm text-ink-dim">Modelos reutilizáveis para iniciar seus treinos mais rápido.</p>
        </div>
        <button
          onClick={openNewForm}
          className="rounded-full bg-gradient-to-r from-accent to-accent-2 px-5 py-2.5 text-sm font-semibold text-bg"
        >
          + Nova rotina
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="flex flex-col gap-5 rounded-2xl border border-card-border bg-card p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">{editing ? 'Editar rotina' : 'Nova rotina'}</h2>
            <button type="button" onClick={() => setShowForm(false)} className="text-sm text-ink-dim hover:text-ink">
              Cancelar
            </button>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-ink-dim">Nome da rotina</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Treino A - Peito/Tríceps"
              required
              className="w-full rounded-lg border border-card-border bg-bg-soft px-3 py-2.5 text-sm outline-none focus:border-accent"
            />
          </div>

          <div className="flex flex-col gap-4">
            {exercises.map((ex, exIndex) => (
              <div key={exIndex} className="rounded-xl border border-card-border p-4">
                <div className="mb-3 flex items-center gap-2">
                  <ExerciseAutocomplete
                    value={ex.name}
                    onChange={(v) => updateExerciseName(exIndex, v)}
                    placeholder="Exercício"
                    className="w-full rounded-lg border border-card-border bg-bg-soft px-3 py-2 text-sm outline-none focus:border-accent"
                  />
                  <button
                    type="button"
                    onClick={() => removeExercise(exIndex)}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-danger/30 bg-danger/10 text-danger"
                  >
                    ✕
                  </button>
                </div>

                <div className="flex flex-col gap-2">
                  {ex.sets.map((set, setIndex) => (
                    <div key={setIndex} className="grid grid-cols-[auto_1fr_1fr_auto] items-center gap-2">
                      <span className="w-6 text-center text-xs text-ink-dim">{setIndex + 1}</span>
                      <input
                        type="number"
                        min={0}
                        placeholder="Reps alvo"
                        value={set.targetReps}
                        onChange={(e) => updateSet(exIndex, setIndex, 'targetReps', e.target.value)}
                        className="rounded-lg border border-card-border bg-bg-soft px-2 py-2 text-sm outline-none focus:border-accent"
                      />
                      <input
                        type="number"
                        min={0}
                        step={0.5}
                        placeholder="Kg alvo"
                        value={set.targetWeight}
                        onChange={(e) => updateSet(exIndex, setIndex, 'targetWeight', e.target.value)}
                        className="rounded-lg border border-card-border bg-bg-soft px-2 py-2 text-sm outline-none focus:border-accent"
                      />
                      <button
                        type="button"
                        onClick={() => removeSet(exIndex, setIndex)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-dim hover:text-danger"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => addSet(exIndex)}
                  className="mt-2 rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-xs font-semibold text-accent-2"
                >
                  + Série
                </button>
              </div>
            ))}

            <button
              type="button"
              onClick={addExercise}
              className="self-start rounded-full border border-accent/30 bg-accent/10 px-4 py-2 text-sm font-semibold text-accent-2"
            >
              + Exercício
            </button>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-ink-dim">Notas (opcional)</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Observações sobre essa rotina"
              className="w-full rounded-lg border border-card-border bg-bg-soft px-3 py-2.5 text-sm outline-none focus:border-accent"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="rounded-full bg-gradient-to-r from-accent to-accent-2 py-3 text-sm font-semibold text-bg disabled:opacity-60"
          >
            {saving ? 'Salvando...' : 'Salvar rotina'}
          </button>
        </form>
      )}

      {loading ? (
        <p className="text-sm text-ink-dim">Carregando...</p>
      ) : routines.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-card-border py-16 text-center text-ink-dim">
          <span className="text-3xl">🧩</span>
          <p className="text-sm">Nenhuma rotina criada ainda.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {routines.map((routine) => (
            <div key={routine.id} className="rounded-2xl border border-card-border bg-card p-5">
              <div className="mb-3 flex items-start justify-between gap-2">
                <h3 className="font-semibold">{routine.name}</h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => openEditForm(routine)}
                    title="Editar"
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-card-border text-ink-dim hover:text-ink"
                  >
                    ✎
                  </button>
                  <button
                    onClick={() => handleDelete(routine.id)}
                    disabled={deletingId === routine.id}
                    title="Excluir"
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-card-border text-ink-dim hover:border-danger/40 hover:bg-danger/10 hover:text-danger disabled:opacity-50"
                  >
                    🗑
                  </button>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                {routine.exercises.map((ex) => (
                  <div key={ex.id} className="text-sm">
                    <strong>{ex.name}</strong>
                    <span className="ml-2 text-xs text-ink-dim">
                      {ex.sets.length} série{ex.sets.length !== 1 ? 's' : ''}
                      {ex.sets.length > 0 &&
                        ` — ${ex.sets.map((s) => `${s.targetReps ?? '?'}x${s.targetWeight ?? '?'}kg`).join(', ')}`}
                    </span>
                  </div>
                ))}
              </div>
              {routine.notes && <p className="mt-3 text-sm italic text-ink-dim">{routine.notes}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
