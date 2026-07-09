import { Router } from 'express';
import { prisma } from '../db';

export const sessionsRouter = Router();

const includeTree = {
  exercises: {
    orderBy: { order: 'asc' as const },
    include: { sets: { orderBy: { order: 'asc' as const } } },
  },
};

sessionsRouter.get('/', async (req, res) => {
  const status = typeof req.query.status === 'string' ? req.query.status : undefined;
  const sessions = await prisma.workoutSession.findMany({
    where: status ? { status } : undefined,
    include: includeTree,
    orderBy: [{ date: 'desc' }, { startedAt: 'desc' }],
  });
  res.json(sessions);
});

sessionsRouter.get('/:id', async (req, res) => {
  const session = await prisma.workoutSession.findUnique({
    where: { id: req.params.id },
    include: includeTree,
  });
  if (!session) return res.status(404).json({ error: 'session not found' });
  res.json(session);
});

sessionsRouter.post('/', async (req, res) => {
  const { name, date, routineId } = req.body ?? {};

  if (typeof name !== 'string' || !name.trim()) {
    return res.status(400).json({ error: 'name is required' });
  }
  if (typeof date !== 'string' || !date.trim()) {
    return res.status(400).json({ error: 'date is required' });
  }

  let exercisesData: {
    name: string;
    order: number;
    sets: { create: { order: number; reps: null; weight: number | null; completed: false }[] };
  }[] = [];

  if (typeof routineId === 'string' && routineId) {
    const routine = await prisma.routine.findUnique({
      where: { id: routineId },
      include: { exercises: { orderBy: { order: 'asc' }, include: { sets: { orderBy: { order: 'asc' } } } } },
    });
    if (routine) {
      exercisesData = routine.exercises.map((ex) => ({
        name: ex.name,
        order: ex.order,
        sets: {
          create: ex.sets.map((s) => ({
            order: s.order,
            reps: null,
            weight: s.targetWeight,
            completed: false,
          })),
        },
      }));
    }
  }

  const session = await prisma.workoutSession.create({
    data: {
      name: name.trim(),
      date: date.trim(),
      routineId: typeof routineId === 'string' && routineId ? routineId : null,
      exercises: { create: exercisesData },
    },
    include: includeTree,
  });

  res.status(201).json(session);
});

sessionsRouter.put('/:id', async (req, res) => {
  const { name, date, notes, exercises } = req.body ?? {};

  if (typeof name !== 'string' || !name.trim()) {
    return res.status(400).json({ error: 'name is required' });
  }
  if (!Array.isArray(exercises)) {
    return res.status(400).json({ error: 'exercises must be an array' });
  }

  try {
    await prisma.sessionExercise.deleteMany({ where: { sessionId: req.params.id } });
    const session = await prisma.workoutSession.update({
      where: { id: req.params.id },
      data: {
        name: name.trim(),
        date: typeof date === 'string' && date ? date : undefined,
        notes: typeof notes === 'string' ? notes.trim() : '',
        exercises: { create: buildExercisesData(exercises) },
      },
      include: includeTree,
    });
    res.json(session);
  } catch {
    res.status(404).json({ error: 'session not found' });
  }
});

sessionsRouter.post('/:id/finish', async (req, res) => {
  try {
    const session = await prisma.workoutSession.update({
      where: { id: req.params.id },
      data: { status: 'completed', completedAt: new Date() },
      include: includeTree,
    });
    res.json(session);
  } catch {
    res.status(404).json({ error: 'session not found' });
  }
});

sessionsRouter.delete('/:id', async (req, res) => {
  try {
    await prisma.workoutSession.delete({ where: { id: req.params.id } });
    res.status(204).end();
  } catch {
    res.status(404).json({ error: 'session not found' });
  }
});

interface ExerciseInput {
  name?: unknown;
  sets?: unknown;
}

interface SetInput {
  reps?: unknown;
  weight?: unknown;
  completed?: unknown;
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
          reps: toIntOrNull(s.reps),
          weight: toFloatOrNull(s.weight),
          completed: s.completed === true,
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
