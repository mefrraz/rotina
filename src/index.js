import { MEALS, EXERCISE_DETAILS, EXERCISES_BY_DAY, DAY_NAMES, DAY_NAMES_SHORT } from './data/exercises.js';
import { loadDay, saveDay, dateStr, dateKey } from './utils/storage.js';

const CHECK_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="#18181b" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>';

let current = new Date();
current.setHours(0, 0, 0, 0);

/* ── State helpers ── */
function loadState() { return loadDay(current); }
function saveState(state) { saveDay(current, state); }

function toggle(id) {
  const state = loadState();
  state[id] = !state[id];
  saveState(state);
  render();
}

/* ── Streak ── */
function calcStreak() {
  let streak = 0;
  const today = new Date(); today.setHours(0, 0, 0, 0);
  for (let i = 0; i < 60; i++) {
    const d = new Date(today); d.setDate(d.getDate() - i);
    const state = loadDay(d);
    const mealsDone = MEALS.filter(m => state[m.id]).length;
    if (i === 0 && mealsDone < 5) continue;
    if (mealsDone >= 5) streak++;
    else break;
  }
  return streak;
}

/* ── Weekly View ── */
function isDayDone(d) {
  const state = loadDay(d);
  return MEALS.filter(m => state[m.id]).length >= 5;
}

function renderWeekly() {
  const container = document.getElementById('weeklyView');
  container.innerHTML = '';
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const todayStr = dateStr(today);

  for (let i = 6; i >= 0; i--) {
    const d = new Date(today); d.setDate(d.getDate() - i);
    const done = isDayDone(d);
    const isToday = dateStr(d) === todayStr;
    const dot = document.createElement('div');
    dot.className = 'dot' + (done ? ' done' : '') + (isToday ? ' today' : '');
    dot.textContent = DAY_NAMES_SHORT[d.getDay()].charAt(0);
    dot.title = DAY_NAMES_SHORT[d.getDay()] + ' — ' + d.toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit' });
    dot.addEventListener('click', () => { current = new Date(d); render(); });
    container.appendChild(dot);
  }
}

/* ── Progress Chart (30 days) ── */
function renderChart() {
  const panel = document.getElementById('progressPanel');
  panel.innerHTML = '';

  const today = new Date(); today.setHours(0, 0, 0, 0);
  const days = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today); d.setDate(d.getDate() - i);
    const state = loadDay(d);
    const mealsDone = MEALS.filter(m => state[m.id]).length;
    const exIds = EXERCISES_BY_DAY[d.getDay()] || [];
    const exDone = exIds.filter(id => state[id]).length;
    days.push({
      label: String(d.getDate()).padStart(2, '0') + '/' + String(d.getMonth() + 1).padStart(2, '0'),
      meals: mealsDone,
      ex: exDone,
      exTotal: exIds.length,
      fullDate: dateStr(d),
      dayObj: new Date(d),
    });
  }

  const wrapper = document.createElement('div');
  wrapper.className = 'chart-wrapper';

  const legend = document.createElement('div');
  legend.className = 'chart-legend';
  legend.innerHTML =
    '<span><span class="swatch" style="background:var(--accent)"></span> Refeições (0–6)</span>' +
    '<span><span class="swatch" style="background:var(--gold)"></span> Exercícios (0–4)</span>';
  panel.appendChild(legend);

  const canvas = document.createElement('canvas');
  canvas.width = 580;
  canvas.height = 160;
  wrapper.appendChild(canvas);
  panel.appendChild(wrapper);

  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  canvas.width = 580 * dpr;
  canvas.height = 160 * dpr;
  canvas.style.width = '580px';
  canvas.style.height = '160px';
  ctx.scale(dpr, dpr);

  const padding = { top: 10, right: 8, bottom: 28, left: 24 };
  const chartW = 580 - padding.left - padding.right;
  const chartH = 160 - padding.top - padding.bottom;
  const barGroupW = chartW / days.length;
  const barW = Math.max(2, barGroupW * 0.35);
  const gap = barGroupW * 0.05;

  // Grid lines
  ctx.strokeStyle = '#2e2e33';
  ctx.lineWidth = 0.5;
  for (let v = 0; v <= 6; v++) {
    const y = padding.top + chartH - (v / 6 * chartH);
    ctx.beginPath();
    ctx.moveTo(padding.left, y);
    ctx.lineTo(580 - padding.right, y);
    ctx.stroke();
  }

  // Bars
  days.forEach((day, i) => {
    const x = padding.left + i * barGroupW + barGroupW * 0.1;

    // Meals bar
    const mealH = (day.meals / 6) * chartH;
    const mealY = padding.top + chartH - mealH;
    ctx.fillStyle = '#d9703e';
    ctx.fillRect(x, mealY, barW, mealH);

    // Exercise bar (only if there were exercises planned)
    if (day.exTotal > 0) {
      const exH = (day.ex / day.exTotal) * chartH;
      const exY = padding.top + chartH - exH;
      const exX = x + barW + gap;
      ctx.fillStyle = '#c99d5b';
      ctx.fillRect(exX, exY, barW, exH);
    }

    // Label (every 3rd day)
    if (i % 3 === 0 || i === days.length - 1) {
      ctx.fillStyle = '#6b6b68';
      ctx.font = '9px -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(day.label, x + barGroupW / 2, 160 - 4);
    }

    // Today highlight
    if (dateStr(day.dayObj) === dateStr(today)) {
      ctx.strokeStyle = '#d9703e';
      ctx.lineWidth = 1;
      ctx.setLineDash([2, 2]);
      ctx.beginPath();
      ctx.moveTo(x + barGroupW / 2, padding.top);
      ctx.lineTo(x + barGroupW / 2, padding.top + chartH);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  });

  // Axis labels
  ctx.fillStyle = '#6b6b68';
  ctx.font = '9px -apple-system, sans-serif';
  ctx.textAlign = 'right';
  for (let v = 0; v <= 6; v++) {
    const y = padding.top + chartH - (v / 6 * chartH);
    ctx.fillText(v, padding.left - 6, y + 3);
  }
}

/* ── Build items ── */
function buildItem(id, name, time, done, linkable) {
  const el = document.createElement('div');
  el.className = 'item' + (done ? ' done' : '');
  el.innerHTML =
    '<div class="checkbox">' + CHECK_SVG + '</div>' +
    '<div class="item-text">' +
      (time ? '<div class="time">' + time + '</div>' : '') +
      '<div class="name">' + name + '</div>' +
    '</div>' +
    (linkable ? '<div class="chevron">›</div>' : '');

  if (linkable) {
    el.querySelector('.checkbox').addEventListener('click', (e) => { e.stopPropagation(); toggle(id); });
    el.addEventListener('click', () => {
      window.location.href = '/exercicio.html?id=' + id + '&date=' + dateStr(current);
    });
  } else {
    el.addEventListener('click', () => toggle(id));
  }
  return el;
}

/* ── Main render ── */
function render() {
  const state = loadState();

  document.getElementById('dayLabel').textContent = DAY_NAMES[current.getDay()];
  document.getElementById('dateLabel').textContent = current.toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit', year: 'numeric' });

  // Meals
  const mealsPanel = document.getElementById('mealsPanel');
  mealsPanel.innerHTML = '';
  let mealsDone = 0;
  MEALS.forEach(m => {
    if (state[m.id]) mealsDone++;
    mealsPanel.appendChild(buildItem(m.id, m.n, m.t, !!state[m.id]));
  });
  document.getElementById('mealScore').innerHTML = mealsDone + ' <span class="of">/' + MEALS.length + '</span>';
  document.getElementById('mealBar').style.width = (mealsDone / MEALS.length * 100) + '%';

  // Exercises
  const exList = EXERCISES_BY_DAY[current.getDay()] || [];
  const exPanel = document.getElementById('exPanel');
  exPanel.innerHTML = '';
  let exDone = 0;

  if (exList.length > 0) {
    // Workout button
    const isToday = dateStr(current) === dateStr(new Date());
    const workoutBtn = document.createElement('a');
    workoutBtn.className = 'workout-btn';
    workoutBtn.href = '/treino.html?date=' + dateStr(current);
    workoutBtn.textContent = isToday ? '▶️ Iniciar Treino' : '▶️ Ver Treino';
    exPanel.appendChild(workoutBtn);

    exList.forEach(exId => {
      if (state[exId]) exDone++;
      exPanel.appendChild(buildItem(exId, EXERCISE_DETAILS[exId].n, null, !!state[exId], true));
    });
  } else {
    exPanel.innerHTML = '<div class="rest-day">Dia de descanso.<br>Sem treino de força hoje.</div>';
  }

  document.getElementById('exScore').innerHTML = exDone + ' <span class="of">/' + (exList.length || 0) + '</span>';
  document.getElementById('exBar').style.width = (exList.length ? (exDone / exList.length * 100) : 0) + '%';

  // Streak
  const streak = calcStreak();
  const streakBadge = document.getElementById('streakBadge');
  document.getElementById('streakCount').textContent = streak;
  streakBadge.style.display = streak > 0 ? 'flex' : 'none';

  renderWeekly();
}

/* ── Tabs ── */
let activeTab = 'meals';
function setTab(tab) {
  activeTab = tab;
  document.getElementById('tabMeals').classList.toggle('active', tab === 'meals');
  document.getElementById('tabEx').classList.toggle('active', tab === 'ex');
  document.getElementById('tabProgress').classList.toggle('active', tab === 'progress');
  document.getElementById('mealsPanel').classList.toggle('active', tab === 'meals');
  document.getElementById('exPanel').classList.toggle('active', tab === 'ex');
  document.getElementById('progressPanel').classList.toggle('active', tab === 'progress');
  if (tab === 'progress') renderChart();
}

document.getElementById('tabMeals').addEventListener('click', () => setTab('meals'));
document.getElementById('tabEx').addEventListener('click', () => setTab('ex'));
document.getElementById('tabProgress').addEventListener('click', () => setTab('progress'));

/* ── Day nav ── */
document.getElementById('prevDay').addEventListener('click', () => { current.setDate(current.getDate() - 1); render(); });
document.getElementById('nextDay').addEventListener('click', () => { current.setDate(current.getDate() + 1); render(); });

/* ── Install ── */
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  document.getElementById('installBanner').style.display = 'flex';
});
document.getElementById('installBtn').addEventListener('click', async () => {
  if (!deferredPrompt) return;
  deferredPrompt.prompt();
  await deferredPrompt.userChoice;
  deferredPrompt = null;
  document.getElementById('installBanner').style.display = 'none';
});
window.addEventListener('appinstalled', () => { document.getElementById('installBanner').style.display = 'none'; });

/* ── Init ── */
render();
