const { Router } = require('express');
const db = require('../db');

const router = Router();

router.get('/overview', (req, res) => {
  const totalSessions = db.prepare('SELECT COUNT(*) as count FROM workout_sessions WHERE completed_at IS NOT NULL').get();
  const thisWeek = db.prepare(`
    SELECT COUNT(*) as count FROM workout_sessions
    WHERE completed_at IS NOT NULL AND started_at >= date('now', '-7 days')
  `).get();
  const thisMonth = db.prepare(`
    SELECT COUNT(*) as count FROM workout_sessions
    WHERE completed_at IS NOT NULL AND started_at >= date('now', 'start of month')
  `).get();
  const totalVolume = db.prepare(`
    SELECT COALESCE(SUM(el.reps * el.weight), 0) as kg
    FROM exercise_logs el
    JOIN workout_sessions s ON s.id = el.session_id
    WHERE s.completed_at IS NOT NULL AND el.weight IS NOT NULL
  `).get();
  const totalDistance = db.prepare(`
    SELECT COALESCE(SUM(cl.distance_km), 0) as km
    FROM cardio_logs cl
    JOIN workout_sessions s ON s.id = cl.session_id
    WHERE s.completed_at IS NOT NULL
  `).get();

  res.json({
    total_sessions: totalSessions.count,
    sessions_this_week: thisWeek.count,
    sessions_this_month: thisMonth.count,
    total_volume_kg: Math.round(totalVolume.kg),
    total_distance_km: Math.round(totalDistance.km * 10) / 10,
  });
});

router.get('/prs', (req, res) => {
  const prs = db.prepare(`
    SELECT
      el.name,
      MAX(el.weight) as max_weight,
      (SELECT reps FROM exercise_logs WHERE name = el.name AND weight = MAX(el.weight) LIMIT 1) as reps_at_max,
      MAX(el.reps) as max_reps,
      COUNT(DISTINCT el.session_id) as sessions_count
    FROM exercise_logs el
    JOIN workout_sessions s ON s.id = el.session_id
    WHERE s.completed_at IS NOT NULL AND el.weight IS NOT NULL
    GROUP BY el.name
    ORDER BY el.name
  `).all();
  res.json(prs);
});

router.get('/exercise/:name', (req, res) => {
  const history = db.prepare(`
    SELECT
      s.started_at,
      el.set_number,
      el.reps,
      el.weight
    FROM exercise_logs el
    JOIN workout_sessions s ON s.id = el.session_id
    WHERE s.completed_at IS NOT NULL AND LOWER(el.name) = LOWER(?)
    ORDER BY s.started_at DESC
    LIMIT 100
  `).all(req.params.name);

  const bySession = {};
  for (const row of history) {
    if (!bySession[row.started_at]) {
      bySession[row.started_at] = { date: row.started_at, sets: [], max_weight: 0 };
    }
    bySession[row.started_at].sets.push({ set: row.set_number, reps: row.reps, weight: row.weight });
    if (row.weight > bySession[row.started_at].max_weight) {
      bySession[row.started_at].max_weight = row.weight;
    }
  }

  res.json(Object.values(bySession));
});

router.get('/cardio', (req, res) => {
  const runs = db.prepare(`
    SELECT
      s.started_at,
      s.name,
      cl.activity,
      cl.distance_km,
      cl.duration_seconds,
      cl.avg_heart_rate,
      CASE WHEN cl.distance_km > 0 AND cl.duration_seconds > 0
        THEN ROUND((cl.duration_seconds / 60.0) / cl.distance_km, 2)
        ELSE NULL
      END as pace_min_per_km
    FROM cardio_logs cl
    JOIN workout_sessions s ON s.id = cl.session_id
    WHERE s.completed_at IS NOT NULL
    ORDER BY s.started_at DESC
    LIMIT 50
  `).all();
  res.json(runs);
});

module.exports = router;
