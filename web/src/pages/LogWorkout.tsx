import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWorkouts } from '../lib/WorkoutsContext';
import { createWorkout } from '../lib/api';
import { todayISO } from '../lib/utils';
import ExerciseAutocomplete from '../components/ExerciseAutocomplete';
import type { ExerciseDraft } from '../lib/types';

const emptyExercise: ExerciseDraft = { name: '', sets: '', reps: '', weight: '' };

export default function LogWorkout() {
  const { plans, refreshWorkouts } = useWorkouts();
  const navigate = useNavigate();

  const [planId, setPlanId] = useState('');
  const [name, setName] = useState('');
  const [date, setDate] = useState(todayISO());
  const [notes, setNotes] = useState('');
  const [exercises, setExercises] = useState<ExerciseDraft[]>([{ ...emptyExercise }]);
  const [saving, setSaving] = useState(false);

  function applyPlan(id: string) {
    setPlanId(id);
    if (!id) return;
    const plan = plans.find((p) => p.id === id);
    if (!plan) return;
    setName(plan.name);
    setExercises(
      plan.exercises.length
        ? plan.exercises.map((ex) => ({
            name: ex.name,
            sets: ex.targetSets?.toString() ?? '',
            reps: ex.targetReps?.toString() ?? '',
            weight: '',
          }))
        : [{ ...emptyExercise }],
    );
  }

  function updateExercise(index: number, field: keyof ExerciseDraft, value: string) {
    setExercises((prev) => prev.map((ex, i) => (i === index ? { ...ex, [field]: value } : ex)));
  }

  function addExerciseRow() {
    setExercises((prev) => [...prev, { ...emptyExercise }]);
  }

  function removeExerciseRow(index: number) {
    setExercises((prev) => prev.filter((_, i) => i !== index));
  }

  function resetForm() {
    setPlanId('');
    setName('');
    setDate(todayISO());
    setNotes('');
    setExercises([{ ...emptyExercise }]);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await createWorkout({
        name: name.trim(),
        date,
        notes: notes.trim(),
        planId: planId || null,
        exercises,
      });
      await refreshWorkouts();
      resetForm();
      navigate('/treinos');
    } catch (err) {
      alert('Não foi possível salvar o treino. Verifique se o servidor está rodando.');
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Registrar treino</h1>
        <p className="text-sm text-ink-dim">Parta de um modelo salvo ou registre um treino do zero.</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-2xl border border-card-border bg-card p-6">
        {plans.length > 0 && (
          <div>
            <label className="mb-1 block text-xs font-medium text-ink-dim">Usar modelo (opcional)</label>
            <select
              value={planId}
              onChange={(e) => applyPlan(e.target.value)}
              className="w-full rounded-lg border border-card-border bg-bg-soft px-3 py-2.5 text-sm outline-none focus:border-accent"
            >
              <option value="">Começar do zero</option>
              {plans.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="flex gap-4">
          <div className="flex-1">
            <label className="mb-1 block text-xs font-medium text-ink-dim">Nome do treino</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Costas e Bíceps"
              required
              className="w-full rounded-lg border border-card-border bg-bg-soft px-3 py-2.5 text-sm outline-none focus:border-accent"
            />
          </div>
          <div className="w-40">
            <label className="mb-1 block text-xs font-medium text-ink-dim">Data</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="w-full rounded-lg border border-card-border bg-bg-soft px-3 py-2.5 text-sm outline-none focus:border-accent"
            />
          </div>
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
              <div key={i} className="grid grid-cols-[2fr_0.7fr_0.7fr_0.7fr_auto] gap-2">
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
                  value={ex.sets}
                  onChange={(e) => updateExercise(i, 'sets', e.target.value)}
                  className="rounded-lg border border-card-border bg-bg-soft px-2 py-2 text-sm outline-none focus:border-accent"
                />
                <input
                  type="number"
                  min={0}
                  placeholder="Reps"
                  value={ex.reps}
                  onChange={(e) => updateExercise(i, 'reps', e.target.value)}
                  className="rounded-lg border border-card-border bg-bg-soft px-2 py-2 text-sm outline-none focus:border-accent"
                />
                <input
                  type="number"
                  min={0}
                  step={0.5}
                  placeholder="Kg"
                  value={ex.weight}
                  onChange={(e) => updateExercise(i, 'weight', e.target.value)}
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
            placeholder="Como se sentiu, recordes pessoais, etc."
            className="w-full rounded-lg border border-card-border bg-bg-soft px-3 py-2.5 text-sm outline-none focus:border-accent"
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="rounded-full bg-gradient-to-r from-accent to-accent-2 py-3 text-sm font-semibold text-bg disabled:opacity-60"
        >
          {saving ? 'Salvando...' : 'Salvar treino'}
        </button>
      </form>
    </div>
  );
}
