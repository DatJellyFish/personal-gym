const { Router } = require('express');
const db = require('../db');

const router = Router();

router.get('/', (req, res) => {
  const plans = db.prepare(`
    SELECT p.*, COUNT(pe.id) as exercise_count
    FROM workout_plans p
    LEFT JOIN plan_exercises pe ON pe.plan_id = p.id
    GROUP BY p.id
    ORDER BY p.updated_at DESC
  `).all();
  res.json(plans);
});

router.get('/:id', (req, res) => {
  const plan = db.prepare('SELECT * FROM workout_plans WHERE id = ?').get(req.params.id);
  if (!plan) return res.status(404).json({ error: 'Plan not found' });

  plan.exercises = db.prepare(
    'SELECT * FROM plan_exercises WHERE plan_id = ? ORDER BY order_index'
  ).all(req.params.id);

  res.json(plan);
});

router.post('/', (req, res) => {
  const { name, description, type = 'strength', exercises = [] } = req.body;
  if (!name) return res.status(400).json({ error: 'name is required' });

  const insert = db.transaction(() => {
    const result = db.prepare(
      'INSERT INTO workout_plans (name, description, type) VALUES (?, ?, ?)'
    ).run(name, description, type);
    const planId = result.lastInsertRowid;

    for (let i = 0; i < exercises.length; i++) {
      const ex = exercises[i];
      db.prepare(`
        INSERT INTO plan_exercises (plan_id, name, sets, reps, weight, rest_seconds, notes, order_index)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(planId, ex.name, ex.sets, ex.reps, ex.weight, ex.rest_seconds, ex.notes, i);
    }

    return planId;
  });

  const planId = insert();
  const plan = db.prepare('SELECT * FROM workout_plans WHERE id = ?').get(planId);
  plan.exercises = db.prepare(
    'SELECT * FROM plan_exercises WHERE plan_id = ? ORDER BY order_index'
  ).all(planId);

  res.status(201).json(plan);
});

router.put('/:id', (req, res) => {
  const { name, description, type, exercises } = req.body;
  const plan = db.prepare('SELECT * FROM workout_plans WHERE id = ?').get(req.params.id);
  if (!plan) return res.status(404).json({ error: 'Plan not found' });

  const update = db.transaction(() => {
    db.prepare(`
      UPDATE workout_plans SET
        name = COALESCE(?, name),
        description = COALESCE(?, description),
        type = COALESCE(?, type),
        updated_at = datetime('now')
      WHERE id = ?
    `).run(name, description, type, req.params.id);

    if (exercises !== undefined) {
      db.prepare('DELETE FROM plan_exercises WHERE plan_id = ?').run(req.params.id);
      for (let i = 0; i < exercises.length; i++) {
        const ex = exercises[i];
        db.prepare(`
          INSERT INTO plan_exercises (plan_id, name, sets, reps, weight, rest_seconds, notes, order_index)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `).run(req.params.id, ex.name, ex.sets, ex.reps, ex.weight, ex.rest_seconds, ex.notes, i);
      }
    }
  });

  update();
  const updated = db.prepare('SELECT * FROM workout_plans WHERE id = ?').get(req.params.id);
  updated.exercises = db.prepare(
    'SELECT * FROM plan_exercises WHERE plan_id = ? ORDER BY order_index'
  ).all(req.params.id);

  res.json(updated);
});

router.delete('/:id', (req, res) => {
  const result = db.prepare('DELETE FROM workout_plans WHERE id = ?').run(req.params.id);
  if (result.changes === 0) return res.status(404).json({ error: 'Plan not found' });
  res.status(204).send();
});

module.exports = router;
