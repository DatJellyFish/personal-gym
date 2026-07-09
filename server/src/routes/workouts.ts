import { Router } from 'express';
import { prisma } from '../db';

export const workoutsRouter = Router();

workoutsRouter.get('/', async (_req, res) => {
  const workouts = await prisma.workout.findMany({
    include: { exercises: { orderBy: { order: 'asc' } } },
    orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
  });
  res.json(workouts);
});

workoutsRouter.post('/', async (req, res) => {
  const { name, date, notes, exercises, planId } = req.body ?? {};

  if (typeof name !== 'string' || !name.trim()) {
    return res.status(400).json({ error: 'name is required' });
  }
  if (typeof date !== 'string' || !date.trim()) {
    return res.status(400).json({ error: 'date is required' });
  }
  if (!Array.isArray(exercises)) {
    return res.status(400).json({ error: 'exercises must be an array' });
  }

  const workout = await prisma.workout.create({
    data: {
      name: name.trim(),
      date: date.trim(),
      notes: typeof notes === 'string' ? notes.trim() : '',
      planId: typeof planId === 'string' && planId ? planId : null,
      exercises: {
        create: exercises
          .filter((ex) => ex && typeof ex.name === 'string' && ex.name.trim())
          .map((ex, index) => ({
            name: ex.name.trim(),
            sets: toIntOrNull(ex.sets),
            reps: toIntOrNull(ex.reps),
            weight: toFloatOrNull(ex.weight),
            order: index,
          })),
      },
    },
    include: { exercises: { orderBy: { order: 'asc' } } },
  });

  res.status(201).json(workout);
});

workoutsRouter.delete('/:id', async (req, res) => {
  try {
    await prisma.workout.delete({ where: { id: req.params.id } });
    res.status(204).end();
  } catch {
    res.status(404).json({ error: 'workout not found' });
  }
});

function toIntOrNull(value: unknown): number | null {
  const n = Number(value);
  return Number.isFinite(n) && value !== '' && value !== null && value !== undefined ? Math.trunc(n) : null;
}

function toFloatOrNull(value: unknown): number | null {
  const n = Number(value);
  return Number.isFinite(n) && value !== '' && value !== null && value !== undefined ? n : null;
}
