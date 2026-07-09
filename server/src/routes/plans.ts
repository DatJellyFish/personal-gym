import { Router } from 'express';
import { prisma } from '../db';

export const plansRouter = Router();

plansRouter.get('/', async (_req, res) => {
  const plans = await prisma.workoutPlan.findMany({
    include: { exercises: { orderBy: { order: 'asc' } } },
    orderBy: { createdAt: 'desc' },
  });
  res.json(plans);
});

plansRouter.post('/', async (req, res) => {
  const { name, notes, exercises } = req.body ?? {};

  if (typeof name !== 'string' || !name.trim()) {
    return res.status(400).json({ error: 'name is required' });
  }
  if (!Array.isArray(exercises)) {
    return res.status(400).json({ error: 'exercises must be an array' });
  }

  const plan = await prisma.workoutPlan.create({
    data: {
      name: name.trim(),
      notes: typeof notes === 'string' ? notes.trim() : '',
      exercises: { create: buildExerciseData(exercises) },
    },
    include: { exercises: { orderBy: { order: 'asc' } } },
  });

  res.status(201).json(plan);
});

plansRouter.put('/:id', async (req, res) => {
  const { name, notes, exercises } = req.body ?? {};

  if (typeof name !== 'string' || !name.trim()) {
    return res.status(400).json({ error: 'name is required' });
  }
  if (!Array.isArray(exercises)) {
    return res.status(400).json({ error: 'exercises must be an array' });
  }

  try {
    await prisma.planExercise.deleteMany({ where: { planId: req.params.id } });
    const plan = await prisma.workoutPlan.update({
      where: { id: req.params.id },
      data: {
        name: name.trim(),
        notes: typeof notes === 'string' ? notes.trim() : '',
        exercises: { create: buildExerciseData(exercises) },
      },
      include: { exercises: { orderBy: { order: 'asc' } } },
    });
    res.json(plan);
  } catch {
    res.status(404).json({ error: 'plan not found' });
  }
});

plansRouter.delete('/:id', async (req, res) => {
  try {
    await prisma.workoutPlan.delete({ where: { id: req.params.id } });
    res.status(204).end();
  } catch {
    res.status(404).json({ error: 'plan not found' });
  }
});

function buildExerciseData(exercises: unknown[]) {
  return exercises
    .filter(
      (ex): ex is { name: string; targetSets?: unknown; targetReps?: unknown } =>
        !!ex && typeof (ex as { name?: unknown }).name === 'string' && (ex as { name: string }).name.trim().length > 0,
    )
    .map((ex, index) => ({
      name: ex.name.trim(),
      targetSets: toIntOrNull(ex.targetSets),
      targetReps: toIntOrNull(ex.targetReps),
      order: index,
    }));
}

function toIntOrNull(value: unknown): number | null {
  const n = Number(value);
  return Number.isFinite(n) && value !== '' && value !== null && value !== undefined ? Math.trunc(n) : null;
}
