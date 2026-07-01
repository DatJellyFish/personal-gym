import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import type { Exercise } from "@/lib/types";

export async function GET() {
  const exercises = db
    .prepare("SELECT * FROM exercises ORDER BY muscle_group, name")
    .all() as Exercise[];
  return NextResponse.json(exercises);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const name = String(body.name || "").trim();
  const muscle_group = String(body.muscle_group || "").trim();
  const notes = body.notes ? String(body.notes).trim() : null;

  if (!name || !muscle_group) {
    return NextResponse.json(
      { error: "name e muscle_group são obrigatórios" },
      { status: 400 }
    );
  }

  try {
    const result = db
      .prepare(
        "INSERT INTO exercises (name, muscle_group, notes) VALUES (?, ?, ?)"
      )
      .run(name, muscle_group, notes);
    const exercise = db
      .prepare("SELECT * FROM exercises WHERE id = ?")
      .get(result.lastInsertRowid) as Exercise;
    return NextResponse.json(exercise, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Já existe um exercício com esse nome" },
      { status: 409 }
    );
  }
}
