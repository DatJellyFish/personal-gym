import { useState } from 'react';
import { useWorkouts } from '../lib/WorkoutsContext';
import { createPlan, updatePlan, deletePlan } from '../lib/api';
import ExerciseAutocomplete from '../components/ExerciseAutocomplete';
import type { PlanExerciseDraft, WorkoutPlan } from '../lib/types';

const emptyExercise: PlanExerciseDraft = { name: '', targetSets: '', targetReps: '' };

export default function Plans() {
  const { plans, refreshPlans, loading } = useWorkouts();
  const [editing, setEditing] = useState<WorkoutPlan | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [notes, setNotes] = useState('');
  const [exercises, setExercises] = useState<PlanExerciseDraft[]>([{ ...emptyExercise }]);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  function openNewForm() {
    setEditing(null);
    setName('');
    setNotes('');
    setExercises([{ ...emptyExercise }]);
    setShowForm(true);
  }

  function openEditForm(plan: WorkoutPlan) {
    setEditing(plan);
    setName(plan.name);
    setNotes(plan.notes);
    setExercises(
      plan.exercises.length
        ? plan.exercises.map((ex) => ({
            name: ex.name,
            targetSets: ex.targetSets?.toString() ?? '',
            targetReps: ex.targetReps?.toString() ?? '',
          }))
        : [{ ...emptyExercise }],
    );
    setShowForm(true);
  }

  function updateExercise(index: number, field: keyof PlanExerciseDraft, value: string) {
    setExercises((prev) => prev.map((ex, i) => (i === index ? { ...ex, [field]: value } : ex)));
  }

  function addExerciseRow() {
    setExercises((prev) => [...prev, { ...emptyExercise }]);
  }

  function removeExerciseRow(index: number) {
    setExercises((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { name: name.trim(), notes: notes.trim(), exercises };
      if (editing) {
        await updatePlan(editing.id, payload);
      } else {
        await createPlan(payload);
      }
      await refreshPlans();
      setShowForm(false);
    } catch (err) {
      alert('Não foi possível salvar o modelo de treino.');
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    try {
      await deletePlan(id);
      await refreshPlans();
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">Montar treino</h1>
          <p className="text-sm text-ink-dim">Crie modelos reutilizáveis para registrar suas sessões mais rápido.</p>
        </div>
        <button
          onClick={openNewForm}
          className="rounded-full bg-gradient-to-r from-accent to-accent-2 px-5 py-2.5 text-sm font-semibold text-bg"
        >
          + Novo modelo
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4 rounded-2xl border border-card-border bg-card p-6"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">{editing ? 'Editar modelo' : 'Novo modelo'}</h2>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="text-sm text-ink-dim hover:text-ink"
            >
              Cancelar
            </button>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-ink-dim">Nome do modelo</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Treino A - Peito/Tríceps"
              required
              className="w-full rounded-lg border border-card-border bg-bg-soft px-3 py-2.5 text-sm outline-none focus:border-accent"
            />
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="text-xs font-medium text-ink-dim">Exercícios</label>
              <button
                type="button"
                onClick={addExerciseRow}
                className="rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-xs font-semibold text-accent-2"
              >
                + Exercício
              </button>
            </div>
            <div className="flex flex-col gap-2">
              {exercises.map((ex, i) => (
                <div key={i} className="grid grid-cols-[2fr_0.8fr_0.8fr_auto] gap-2">
                  <ExerciseAutocomplete
                    value={ex.name}
                    onChange={(v) => updateExercise(i, 'name', v)}
                    placeholder="Exercício"
                    className="w-full rounded-lg border border-card-border bg-bg-soft px-3 py-2 text-sm outline-none focus:border-accent"
                  />
                  <input
                    type="number"
                    min={0}
                    placeholder="Séries"
                    value={ex.targetSets}
                    onChange={(e) => updateExercise(i, 'targetSets', e.target.value)}
                    className="rounded-lg border border-card-border bg-bg-soft px-2 py-2 text-sm outline-none focus:border-accent"
                  />
                  <input
                    type="number"
                    min={0}
                    placeholder="Reps"
                    value={ex.targetReps}
                    onChange={(e) => updateExercise(i, 'targetReps', e.target.value)}
                    className="rounded-lg border border-card-border bg-bg-soft px-2 py-2 text-sm outline-none focus:border-accent"
                  />
                  <button
                    type="button"
                    onClick={() => removeExerciseRow(i)}
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-danger/30 bg-danger/10 text-danger"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-ink-dim">Notas (opcional)</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Observações sobre esse modelo de treino"
              className="w-full rounded-lg border border-card-border bg-bg-soft px-3 py-2.5 text-sm outline-none focus:border-accent"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="rounded-full bg-gradient-to-r from-accent to-accent-2 py-3 text-sm font-semibold text-bg disabled:opacity-60"
          >
            {saving ? 'Salvando...' : 'Salvar modelo'}
          </button>
        </form>
      )}

      {loading ? (
        <p className="text-sm text-ink-dim">Carregando...</p>
      ) : plans.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-card-border py-16 text-center text-ink-dim">
          <span className="text-3xl">🧩</span>
          <p className="text-sm">Nenhum modelo de treino criado ainda.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {plans.map((plan) => (
            <div key={plan.id} className="rounded-2xl border border-card-border bg-card p-5">
              <div className="mb-3 flex items-start justify-between gap-2">
                <h3 className="font-semibold">{plan.name}</h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => openEditForm(plan)}
                    title="Editar"
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-card-border text-ink-dim hover:text-ink"
                  >
                    ✎
                  </button>
                  <button
                    onClick={() => handleDelete(plan.id)}
                    disabled={deletingId === plan.id}
                    title="Excluir"
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-card-border text-ink-dim hover:border-danger/40 hover:bg-danger/10 hover:text-danger disabled:opacity-50"
                  >
                    🗑
                  </button>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {plan.exercises.map((ex) => (
                  <span
                    key={ex.id}
                    className="rounded-full border border-card-border bg-bg-soft px-3 py-1 text-xs text-ink-dim"
                  >
                    <strong className="text-ink">{ex.name}</strong>
                    {ex.targetSets || ex.targetReps
                      ? ` — ${ex.targetSets ?? '?'}x${ex.targetReps ?? '?'}`
                      : ''}
                  </span>
                ))}
              </div>
              {plan.notes && <p className="mt-3 text-sm italic text-ink-dim">{plan.notes}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
