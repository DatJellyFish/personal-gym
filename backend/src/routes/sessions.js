const { Router } = require('express');
const db = require('../db');

const router = Router();

router.get('/', (req, res) => {
  const { limit = 50, offset = 0, type } = req.query;
  let query = `
    SELECT s.*, p.name as plan_name
    FROM workout_sessions s
    LEFT JOIN workout_plans p ON p.id = s.plan_id
  `;
  const params = [];
  if (type) {
    query += ' WHERE s.type = ?';
    params.push(type);
  }
  query += ' ORDER BY s.started_at DESC LIMIT ? OFFSET ?';
  params.push(Number(limit), Number(offset));

  const sessions = db.prepare(query).all(...params);
  res.json(sessions);
});

router.get('/:id', (req, res) => {
  const session = db.prepare(`
    SELECT s.*, p.name as plan_name
    FROM workout_sessions s
    LEFT JOIN workout_plans p ON p.id = s.plan_id
    WHERE s.id = ?
  `).get(req.params.id);

  if (!session) return res.status(404).json({ error: 'Session not found' });

  if (session.type === 'cardio') {
    session.cardio = db.prepare(
      'SELECT * FROM cardio_logs WHERE session_id = ?'
    ).all(req.params.id);
  } else {
    const logs = db.prepare(
      'SELECT * FROM exercise_logs WHERE session_id = ? ORDER BY name, set_number'
    ).all(req.params.id);

    const grouped = {};
    for (const log of logs) {
      if (!grouped[log.name]) grouped[log.name] = { name: log.name, sets: [] };
      grouped[log.name].sets.push({ set: log.set_number, reps: log.reps, weight: log.weight, notes: log.notes });
    }
    session.exercises = Object.values(grouped);
  }

  res.json(session);
});

router.post('/', (req, res) => {
  const { plan_id, name, type = 'strength', notes, started_at, exercises = [], cardio } = req.body;
  if (!name) return res.status(400).json({ error: 'name is required' });

  const insert = db.transaction(() => {
    const result = db.prepare(`
      INSERT INTO workout_sessions (plan_id, name, type, notes, started_at)
      VALUES (?, ?, ?, ?, COALESCE(?, datetime('now')))
    `).run(plan_id, name, type, notes, started_at);
    const sessionId = result.lastInsertRowid;

    if (type === 'cardio' && cardio) {
      db.prepare(`
        INSERT INTO cardio_logs (session_id, activity, distance_km, duration_seconds, avg_heart_rate, notes)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(sessionId, cardio.activity || 'running', cardio.distance_km, cardio.duration_seconds, cardio.avg_heart_rate, cardio.notes);
    } else {
      for (const ex of exercises) {
        for (const set of (ex.sets || [])) {
          db.prepare(`
            INSERT INTO exercise_logs (session_id, name, set_number, reps, weight, notes)
            VALUES (?, ?, ?, ?, ?, ?)
          `).run(sessionId, ex.name, set.set, set.reps, set.weight, set.notes);
        }
      }
    }

    return sessionId;
  });

  const sessionId = insert();
  res.status(201).json({ id: sessionId });
});

router.put('/:id/complete', (req, res) => {
  const { duration_minutes, notes } = req.body;
  const result = db.prepare(`
    UPDATE workout_sessions SET
      completed_at = datetime('now'),
      duration_minutes = ?,
      notes = COALESCE(?, notes)
    WHERE id = ?
  `).run(duration_minutes, notes, req.params.id);

  if (result.changes === 0) return res.status(404).json({ error: 'Session not found' });
  res.json({ ok: true });
});

router.delete('/:id', (req, res) => {
  const result = db.prepare('DELETE FROM workout_sessions WHERE id = ?').run(req.params.id);
  if (result.changes === 0) return res.status(404).json({ error: 'Session not found' });
  res.status(204).send();
});

module.exports = router;
