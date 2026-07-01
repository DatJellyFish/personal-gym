import Database from "better-sqlite3";
import fs from "fs";
import path from "path";

const dataDir = process.env.DB_PATH
  ? path.dirname(process.env.DB_PATH)
  : path.join(process.cwd(), "data");
fs.mkdirSync(dataDir, { recursive: true });

const dbPath = process.env.DB_PATH || path.join(dataDir, "gym.db");

const globalForDb = globalThis as unknown as { db?: Database.Database };

export const db = globalForDb.db ?? new Database(dbPath);
globalForDb.db = db;

db.pragma("busy_timeout = 5000");
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

db.exec(`
  CREATE TABLE IF NOT EXISTS exercises (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    muscle_group TEXT NOT NULL,
    notes TEXT
  );

  CREATE TABLE IF NOT EXISTS workouts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL,
    name TEXT,
    notes TEXT
  );

  CREATE TABLE IF NOT EXISTS workout_sets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    workout_id INTEGER NOT NULL REFERENCES workouts(id) ON DELETE CASCADE,
    exercise_id INTEGER NOT NULL REFERENCES exercises(id),
    set_number INTEGER NOT NULL,
    reps INTEGER NOT NULL,
    weight REAL NOT NULL
  );
`);

const seedCount = db.prepare("SELECT COUNT(*) as count FROM exercises").get() as { count: number };

if (seedCount.count === 0) {
  const insert = db.prepare(
    "INSERT INTO exercises (name, muscle_group, notes) VALUES (?, ?, NULL)"
  );
  const seed = db.transaction((rows: [string, string][]) => {
    for (const [name, group] of rows) insert.run(name, group);
  });
  seed([
    ["Supino reto", "Peito"],
    ["Supino inclinado", "Peito"],
    ["Crucifixo", "Peito"],
    ["Agachamento livre", "Pernas"],
    ["Leg press", "Pernas"],
    ["Cadeira extensora", "Pernas"],
    ["Mesa flexora", "Pernas"],
    ["Panturrilha em pé", "Pernas"],
    ["Levantamento terra", "Costas"],
    ["Puxada frente", "Costas"],
    ["Remada curvada", "Costas"],
    ["Remada baixa", "Costas"],
    ["Barra fixa", "Costas"],
    ["Desenvolvimento militar", "Ombro"],
    ["Elevação lateral", "Ombro"],
    ["Rosca direta", "Bíceps"],
    ["Rosca alternada", "Bíceps"],
    ["Tríceps corda", "Tríceps"],
    ["Tríceps testa", "Tríceps"],
    ["Abdominal", "Abdômen"],
  ]);
}
