import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import type { Workout, WorkoutSet } from "@/lib/types";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const workout = db.prepare("SELECT * FROM workouts WHERE id = ?").get(id) as
    | Workout
    | undefined;

  if (!workout) {
    return NextResponse.json({ error: "não encontrado" }, { status: 404 });
  }

  const sets = db
    .prepare(
      `SELECT ws.*, e.name as exercise_name
       FROM workout_sets ws
       JOIN exercises e ON e.id = ws.exercise_id
       WHERE ws.workout_id = ?
       ORDER BY ws.exercise_id, ws.set_number`
    )
    .all(id) as WorkoutSet[];

  return NextResponse.json({ ...workout, sets });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  db.prepare("DELETE FROM workouts WHERE id = ?").run(id);
  return NextResponse.json({ ok: true });
}
