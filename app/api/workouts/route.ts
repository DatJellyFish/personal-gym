import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import type { SetInput, WorkoutSummary } from "@/lib/types";

export async function GET() {
  const workouts = db
    .prepare(
      `SELECT w.*,
        COUNT(DISTINCT ws.exercise_id) as exercise_count,
        COUNT(ws.id) as set_count,
        COALESCE(SUM(ws.reps * ws.weight), 0) as total_volume
       FROM workouts w
       LEFT JOIN workout_sets ws ON ws.workout_id = w.id
       GROUP BY w.id
       ORDER BY w.date DESC, w.id DESC`
    )
    .all() as WorkoutSummary[];
  return NextResponse.json(workouts);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const date = String(body.date || "").trim();
  const name = body.name ? String(body.name).trim() : null;
  const notes = body.notes ? String(body.notes).trim() : null;
  const sets = (body.sets || []) as SetInput[];

  if (!date) {
    return NextResponse.json({ error: "date é obrigatório" }, { status: 400 });
  }
  if (!Array.isArray(sets) || sets.length === 0) {
    return NextResponse.json(
      { error: "informe ao menos uma série" },
      { status: 400 }
    );
  }

  const createWorkout = db.transaction(() => {
    const result = db
      .prepare("INSERT INTO workouts (date, name, notes) VALUES (?, ?, ?)")
      .run(date, name, notes);
    const workoutId = result.lastInsertRowid;

    const insertSet = db.prepare(
      `INSERT INTO workout_sets (workout_id, exercise_id, set_number, reps, weight)
       VALUES (?, ?, ?, ?, ?)`
    );

    const counters = new Map<number, number>();
    for (const s of sets) {
      const exerciseId = Number(s.exercise_id);
      const reps = Number(s.reps);
      const weight = Number(s.weight);
      if (!exerciseId || !reps || Number.isNaN(weight)) continue;
      const next = (counters.get(exerciseId) || 0) + 1;
      counters.set(exerciseId, next);
      insertSet.run(workoutId, exerciseId, next, reps, weight);
    }

    return workoutId;
  });

  const workoutId = createWorkout();
  return NextResponse.json({ id: workoutId }, { status: 201 });
}
