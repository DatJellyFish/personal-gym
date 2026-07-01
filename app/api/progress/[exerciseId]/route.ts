import { NextResponse } from "next/server";
import { db } from "@/lib/db";

interface ProgressRow {
  date: string;
  max_weight: number;
  volume: number;
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ exerciseId: string }> }
) {
  const { exerciseId } = await params;

  const rows = db
    .prepare(
      `SELECT w.date as date,
              MAX(ws.weight) as max_weight,
              SUM(ws.reps * ws.weight) as volume
       FROM workout_sets ws
       JOIN workouts w ON w.id = ws.workout_id
       WHERE ws.exercise_id = ?
       GROUP BY w.date
       ORDER BY w.date ASC`
    )
    .all(exerciseId) as ProgressRow[];

  return NextResponse.json(rows);
}
