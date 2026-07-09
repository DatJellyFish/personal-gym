import { Router } from 'express';
import { prisma } from '../db';

export const routinesRouter = Router();

const includeTree = {
  exercises: {
    orderBy: { order: 'asc' as const },
    include: { sets: { orderBy: { order: 'asc' as const } } },
  },
};

routinesRouter.get('/', async (_req, res) => {
  const routines = await prisma.routine.findMany({
    include: includeTree,
    orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
  });
  res.json(routines);
});

routinesRouter.post('/', async (req, res) => {
  const { name, notes, exercises } = req.body ?? {};

  if (typeof name !== 'string' || !name.trim()) {
    return res.status(400).json({ error: 'name is required' });
  }
  if (!Array.isArray(exercises)) {
    return res.status(400).json({ error: 'exercises must be an array' });
  }

  const routine = await prisma.routine.create({
    data: {
      name: name.trim(),
      notes: typeof notes === 'string' ? notes.trim() : '',
      exercises: { create: buildExercisesData(exercises) },
    },
    include: includeTree,
  });

  res.status(201).json(routine);
});

routinesRouter.put('/:id', async (req, res) => {
  const { name, notes, exercises } = req.body ?? {};

  if (typeof name !== 'string' || !name.trim()) {
    return res.status(400).json({ error: 'name is required' });
  }
  if (!Array.isArray(exercises)) {
    return res.status(400).json({ error: 'exercises must be an array' });
  }

  try {
    await prisma.routineExercise.deleteMany({ where: { routineId: req.params.id } });
    const routine = await prisma.routine.update({
      where: { id: req.params.id },
      data: {
        name: name.trim(),
        notes: typeof notes === 'string' ? notes.trim() : '',
        exercises: { create: buildExercisesData(exercises) },
      },
      include: includeTree,
    });
    res.json(routine);
  } catch {
    res.status(404).json({ error: 'routine not found' });
  }
});

routinesRouter.delete('/:id', async (req, res) => {
  try {
    await prisma.routine.delete({ where: { id: req.params.id } });
    res.status(204).end();
  } catch {
    res.status(404).json({ error: 'routine not found' });
  }
});

interface ExerciseInput {
  name?: unknown;
  sets?: unknown;
}

interface SetInput {
  targetReps?: unknown;
  targetWeight?: unknown;
}

function buildExercisesData(exercises: unknown[]) {
  return (exercises as ExerciseInput[])
    .filter((ex) => ex && typeof ex.name === 'string' && ex.name.trim().length > 0)
    .map((ex, index) => ({
      name: (ex.name as string).trim(),
      order: index,
      sets: {
        create: (Array.isArray(ex.sets) ? (ex.sets as SetInput[]) : []).map((s, sIndex) => ({
          order: sIndex,
          targetReps: toIntOrNull(s.targetReps),
          targetWeight: toFloatOrNull(s.targetWeight),
        })),
      },
    }));
}

function toIntOrNull(value: unknown): number | null {
  const n = Number(value);
  return Number.isFinite(n) && value !== '' && value !== null && value !== undefined ? Math.trunc(n) : null;
}

function toFloatOrNull(value: unknown): number | null {
  const n = Number(value);
  return Number.isFinite(n) && value !== '' && value !== null && value !== undefined ? n : null;
}
