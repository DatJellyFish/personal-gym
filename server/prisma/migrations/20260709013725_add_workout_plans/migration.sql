-- CreateTable
CREATE TABLE "WorkoutPlan" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "notes" TEXT NOT NULL DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "PlanExercise" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "planId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "targetSets" INTEGER,
    "targetReps" INTEGER,
    "order" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "PlanExercise_planId_fkey" FOREIGN KEY ("planId") REFERENCES "WorkoutPlan" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Workout" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "notes" TEXT NOT NULL DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "planId" TEXT,
    CONSTRAINT "Workout_planId_fkey" FOREIGN KEY ("planId") REFERENCES "WorkoutPlan" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Workout" ("createdAt", "date", "id", "name", "notes") SELECT "createdAt", "date", "id", "name", "notes" FROM "Workout";
DROP TABLE "Workout";
ALTER TABLE "new_Workout" RENAME TO "Workout";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
