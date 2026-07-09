const API = '/api';

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

let allWorkouts = [];

// ---------- API ----------

async function fetchWorkouts() {
  const res = await fetch(`${API}/workouts`);
  if (!res.ok) throw new Error('Failed to load workouts');
  return res.json();
}

async function createWorkout(workout) {
  const res = await fetch(`${API}/workouts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(workout),
  });
  if (!res.ok) throw new Error('Failed to save workout');
  return res.json();
}

async function deleteWorkoutRequest(id) {
  const res = await fetch(`${API}/workouts/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete workout');
}

async function searchExercises(term) {
  const res = await fetch(`${API}/exercises/search?q=${encodeURIComponent(term)}`);
  if (!res.ok) return [];
  return res.json();
}

// ---------- Exercise rows & autocomplete ----------

function addExerciseRow() {
  const fragment = exerciseTemplate.content.cloneNode(true);
  const row = fragment.querySelector('.exercise-row');
  const nameField = row.querySelector('.ex-name');
  const suggestionsBox = row.querySelector('.ex-suggestions');

  row.querySelector('.ex-remove').addEventListener('click', () => row.remove());
  wireAutocomplete(nameField, suggestionsBox);

  exerciseList.appendChild(row);
}

function wireAutocomplete(input, box) {
  let debounceTimer;
  let activeIndex = -1;

  input.addEventListener('input', () => {
    const term = input.value.trim();
    clearTimeout(debounceTimer);
    if (term.length < 2) {
      hideSuggestions();
      return;
    }
    debounceTimer = setTimeout(async () => {
      const results = await searchExercises(term);
      renderSuggestions(results);
    }, 300);
  });

  input.addEventListener('keydown', (e) => {
    const items = Array.from(box.querySelectorAll('.ex-suggestion'));
    if (!items.length || !box.classList.contains('visible')) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      activeIndex = Math.min(activeIndex + 1, items.length - 1);
      highlight(items);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      activeIndex = Math.max(activeIndex - 1, 0);
      highlight(items);
    } else if (e.key === 'Enter' && activeIndex >= 0) {
      e.preventDefault();
      selectSuggestion(items[activeIndex].textContent);
    } else if (e.key === 'Escape') {
      hideSuggestions();
    }
  });

  input.addEventListener('blur', () => {
    setTimeout(hideSuggestions, 150);
  });

  function highlight(items) {
    items.forEach((item, i) => item.classList.toggle('active', i === activeIndex));
  }

  function selectSuggestion(name) {
    input.value = name;
    hideSuggestions();
  }

  function hideSuggestions() {
    box.classList.remove('visible');
    box.innerHTML = '';
    activeIndex = -1;
  }

  function renderSuggestions(results) {
    activeIndex = -1;
    if (!results.length) {
      hideSuggestions();
      return;
    }
    box.innerHTML = results
      .slice(0, 8)
      .map((r) => `<div class="ex-suggestion">${escapeHtml(r.name)}</div>`)
      .join('');
    box.classList.add('visible');
    box.querySelectorAll('.ex-suggestion').forEach((el) => {
      el.addEventListener('mousedown', (e) => {
        e.preventDefault();
        selectSuggestion(el.textContent);
      });
    });
  }
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

// ---------- Rendering ----------

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
  const workouts = [...allWorkouts].sort((a, b) => (a.date < b.date ? 1 : -1));
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
        return `<span class="ex-chip" data-exercise="${escapeHtml(ex.name)}"><strong>${escapeHtml(ex.name)}</strong>${detail ? ' — ' + escapeHtml(detail) : ''}</span>`;
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

    card.querySelector('.delete').addEventListener('click', async () => {
      await deleteWorkoutRequest(workout.id);
      allWorkouts = allWorkouts.filter((w) => w.id !== workout.id);
      render(searchInput.value);
    });

    card.querySelectorAll('.ex-chip').forEach((chip) => {
      chip.addEventListener('click', () => openProgressChart(chip.dataset.exercise));
    });

    historyList.appendChild(card);
  });
}

// ---------- Form submit ----------

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const submitBtn = form.querySelector('button[type="submit"]');
  submitBtn.disabled = true;

  try {
    const workout = {
      name: nameInput.value.trim(),
      date: dateInput.value,
      notes: notesInput.value.trim(),
      exercises: collectExercises(),
    };

    const created = await createWorkout(workout);
    allWorkouts.push(created);
    resetForm();
    render(searchInput.value);
  } catch (err) {
    alert('Não foi possível salvar o treino. Verifique se o servidor está rodando.');
    console.error(err);
  } finally {
    submitBtn.disabled = false;
  }
});

addExerciseBtn.addEventListener('click', () => addExerciseRow());
searchInput.addEventListener('input', () => render(searchInput.value));

// ---------- Rest timer ----------

const restTimer = document.getElementById('rest-timer');
const timerToggle = document.getElementById('timer-toggle');
const timerDisplay = document.getElementById('timer-display');
const timerStart = document.getElementById('timer-start');
const timerReset = document.getElementById('timer-reset');
const timerPresets = document.querySelectorAll('.timer-preset');

let timerDefaultSeconds = 90;
let timerRemaining = timerDefaultSeconds;
let timerIntervalId = null;

function formatTime(totalSeconds) {
  const m = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
  const s = Math.floor(totalSeconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

function updateTimerDisplay() {
  timerDisplay.textContent = formatTime(timerRemaining);
}

function playBeep() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 880;
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    osc.start();
    osc.stop(ctx.currentTime + 0.4);
    osc.onended = () => ctx.close();
  } catch {
    // audio not available, ignore
  }
}

timerToggle.addEventListener('click', () => {
  restTimer.classList.toggle('collapsed');
});

timerPresets.forEach((btn) => {
  btn.addEventListener('click', () => {
    timerPresets.forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    timerDefaultSeconds = Number(btn.dataset.seconds);
    stopTimerInterval();
    timerRemaining = timerDefaultSeconds;
    updateTimerDisplay();
    timerStart.textContent = 'Iniciar';
  });
});

timerStart.addEventListener('click', () => {
  if (timerIntervalId) {
    stopTimerInterval();
    timerStart.textContent = 'Continuar';
    return;
  }
  timerDisplay.classList.remove('finished');
  timerIntervalId = setInterval(() => {
    timerRemaining -= 1;
    updateTimerDisplay();
    if (timerRemaining <= 0) {
      stopTimerInterval();
      timerDisplay.classList.add('finished');
      playBeep();
      timerStart.textContent = 'Iniciar';
    }
  }, 1000);
  timerStart.textContent = 'Pausar';
});

timerReset.addEventListener('click', () => {
  stopTimerInterval();
  timerRemaining = timerDefaultSeconds;
  timerDisplay.classList.remove('finished');
  updateTimerDisplay();
  timerStart.textContent = 'Iniciar';
});

function stopTimerInterval() {
  if (timerIntervalId) {
    clearInterval(timerIntervalId);
    timerIntervalId = null;
  }
}

updateTimerDisplay();

// ---------- Progress chart ----------

const chartModal = document.getElementById('chart-modal');
const chartModalTitle = document.getElementById('chart-modal-title');
const chartModalClose = document.getElementById('chart-modal-close');
const chartCanvas = document.getElementById('progress-chart');
let progressChartInstance = null;

function openProgressChart(exerciseName) {
  const points = allWorkouts
    .filter((w) => w.exercises.some((ex) => ex.name.toLowerCase() === exerciseName.toLowerCase() && ex.weight))
    .map((w) => {
      const ex = w.exercises.find((e) => e.name.toLowerCase() === exerciseName.toLowerCase() && e.weight);
      return { date: w.date, weight: ex.weight };
    })
    .sort((a, b) => (a.date > b.date ? 1 : -1));

  chartModalTitle.textContent = `Evolução — ${exerciseName}`;
  chartModal.classList.remove('hidden');

  if (progressChartInstance) {
    progressChartInstance.destroy();
  }

  if (typeof Chart === 'undefined' || points.length === 0) {
    return;
  }

  progressChartInstance = new Chart(chartCanvas, {
    type: 'line',
    data: {
      labels: points.map((p) => formatDate(p.date)),
      datasets: [
        {
          label: 'Carga (kg)',
          data: points.map((p) => p.weight),
          borderColor: '#7c5cff',
          backgroundColor: 'rgba(124, 92, 255, 0.15)',
          tension: 0.3,
          fill: true,
          pointBackgroundColor: '#22d3c9',
        },
      ],
    },
    options: {
      responsive: true,
      plugins: { legend: { labels: { color: '#eef1f7' } } },
      scales: {
        x: { ticks: { color: '#9aa4b8' }, grid: { color: 'rgba(255,255,255,0.05)' } },
        y: { ticks: { color: '#9aa4b8' }, grid: { color: 'rgba(255,255,255,0.05)' } },
      },
    },
  });
}

chartModalClose.addEventListener('click', () => chartModal.classList.add('hidden'));
chartModal.addEventListener('click', (e) => {
  if (e.target === chartModal) chartModal.classList.add('hidden');
});

// ---------- Init ----------

async function init() {
  resetForm();
  try {
    allWorkouts = await fetchWorkouts();
  } catch (err) {
    console.error(err);
    allWorkouts = [];
  }
  render();
}

init();
