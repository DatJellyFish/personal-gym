const STORAGE_KEY = 'forgefit.workouts';

const form = document.getElementById('workout-form');
const nameInput = document.getElementById('w-name');
const dateInput = document.getElementById('w-date');
const notesInput = document.getElementById('w-notes');
const exerciseList = document.getElementById('exercise-list');
const addExerciseBtn = document.getElementById('add-exercise');
const exerciseTemplate = document.getElementById('exercise-row-template');
const historyList = document.getElementById('history-list');
const emptyState = document.getElementById('empty-state');
const searchInput = document.getElementById('search');

const statTotal = document.getElementById('stat-total');
const statWeek = document.getElementById('stat-week');
const statStreak = document.getElementById('stat-streak');

function loadWorkouts() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function saveWorkouts(workouts) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(workouts));
}

function addExerciseRow(prefill) {
  const fragment = exerciseTemplate.content.cloneNode(true);
  const row = fragment.querySelector('.exercise-row');
  if (prefill) {
    row.querySelector('.ex-name').value = prefill.name || '';
    row.querySelector('.ex-sets').value = prefill.sets ?? '';
    row.querySelector('.ex-reps').value = prefill.reps ?? '';
    row.querySelector('.ex-weight').value = prefill.weight ?? '';
  }
  row.querySelector('.ex-remove').addEventListener('click', () => row.remove());
  exerciseList.appendChild(row);
}

function resetForm() {
  form.reset();
  exerciseList.innerHTML = '';
  addExerciseRow();
  dateInput.value = new Date().toISOString().slice(0, 10);
}

function collectExercises() {
  return Array.from(exerciseList.querySelectorAll('.exercise-row'))
    .map((row) => ({
      name: row.querySelector('.ex-name').value.trim(),
      sets: row.querySelector('.ex-sets').value,
      reps: row.querySelector('.ex-reps').value,
      weight: row.querySelector('.ex-weight').value,
    }))
    .filter((ex) => ex.name);
}

function formatDate(dateStr) {
  const [year, month, day] = dateStr.split('-');
  return `${day}/${month}/${year}`;
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function calcStreak(workouts) {
  const days = new Set(workouts.map((w) => w.date));
  let streak = 0;
  const cursor = new Date();
  while (true) {
    const key = cursor.toISOString().slice(0, 10);
    if (days.has(key)) {
      streak += 1;
      cursor.setDate(cursor.getDate() - 1);
    } else {
      break;
    }
  }
  return streak;
}

function updateStats(workouts) {
  statTotal.textContent = workouts.length;

  const now = new Date();
  const weekAgo = new Date(now);
  weekAgo.setDate(now.getDate() - 6);
  const weekCount = workouts.filter((w) => {
    const d = new Date(w.date + 'T00:00:00');
    return d >= new Date(weekAgo.toISOString().slice(0, 10) + 'T00:00:00') && d <= now;
  }).length;
  statWeek.textContent = weekCount;

  statStreak.textContent = calcStreak(workouts);
}

function render(filterText = '') {
  const workouts = loadWorkouts().sort((a, b) => (a.date < b.date ? 1 : -1));
  updateStats(workouts);

  const query = filterText.trim().toLowerCase();
  const filtered = query
    ? workouts.filter((w) => {
        const inName = w.name.toLowerCase().includes(query);
        const inExercises = w.exercises.some((ex) => ex.name.toLowerCase().includes(query));
        return inName || inExercises;
      })
    : workouts;

  historyList.innerHTML = '';

  if (workouts.length === 0) {
    emptyState.classList.add('visible');
    emptyState.querySelector('p').textContent = 'Nenhum treino registrado ainda. Adicione o primeiro acima!';
  } else if (filtered.length === 0) {
    emptyState.classList.add('visible');
    emptyState.querySelector('p').textContent = 'Nenhum treino encontrado para essa busca.';
  } else {
    emptyState.classList.remove('visible');
  }

  filtered.forEach((workout) => {
    const card = document.createElement('article');
    card.className = 'workout-card';

    const chips = workout.exercises
      .map((ex) => {
        const parts = [];
        if (ex.sets) parts.push(`${ex.sets}x`);
        if (ex.reps) parts.push(`${ex.reps}`);
        let detail = parts.join('');
        if (ex.weight) detail += (detail ? ' · ' : '') + `${ex.weight}kg`;
        return `<span class="ex-chip"><strong>${escapeHtml(ex.name)}</strong>${detail ? ' — ' + escapeHtml(detail) : ''}</span>`;
      })
      .join('');

    card.innerHTML = `
      <div class="workout-top">
        <div class="workout-title">
          <h3>${escapeHtml(workout.name)}</h3>
          <span class="workout-date">${formatDate(workout.date)}</span>
        </div>
        <div class="workout-actions">
          <button class="icon-btn delete" title="Excluir treino" data-id="${workout.id}">🗑</button>
        </div>
      </div>
      ${chips ? `<div class="workout-exercises">${chips}</div>` : ''}
      ${workout.notes ? `<div class="workout-notes">${escapeHtml(workout.notes)}</div>` : ''}
    `;

    card.querySelector('.delete').addEventListener('click', () => {
      const remaining = loadWorkouts().filter((w) => w.id !== workout.id);
      saveWorkouts(remaining);
      render(searchInput.value);
    });

    historyList.appendChild(card);
  });
}

form.addEventListener('submit', (e) => {
  e.preventDefault();

  const exercises = collectExercises();
  const workout = {
    id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
    name: nameInput.value.trim(),
    date: dateInput.value,
    notes: notesInput.value.trim(),
    exercises,
  };

  const workouts = loadWorkouts();
  workouts.push(workout);
  saveWorkouts(workouts);

  resetForm();
  render(searchInput.value);
});

addExerciseBtn.addEventListener('click', () => addExerciseRow());

searchInput.addEventListener('input', () => render(searchInput.value));

resetForm();
render();
