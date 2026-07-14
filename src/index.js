import { MEALS, EXERCISE_DETAILS, EXERCISES_BY_DAY, DAY_NAMES, DAY_SHORT, CHECK_SVG } from './data.js';
import { load, save, dateStr } from './storage.js';

/* ── State ── */
let current = new Date(); current.setHours(0,0,0,0);

/* ── Helpers ── */
function loadState() { return load(current); }
function saveState(s) { save(current, s); }
function toggle(id) { const s = loadState(); s[id] = !s[id]; saveState(s); render(); }

/* ── Streak ── */
function calcStreak() {
  let n = 0; const today = new Date(); today.setHours(0,0,0,0);
  for (let i = 0; i < 60; i++) {
    const d = new Date(today); d.setDate(d.getDate() - i);
    const st = load(d);
    const done = MEALS.filter(m => st[m.id]).length;
    if (i === 0 && done < 5) continue;
    if (done >= 5) n++; else break;
  }
  return n;
}

/* ── Weekly ── */
function dayDone(d) { return MEALS.filter(m => (load(d) || {})[m.id]).length >= 5; }

function renderWeekly() {
  const el = document.getElementById('weekly'); el.innerHTML = '';
  const today = new Date(); today.setHours(0,0,0,0);
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today); d.setDate(d.getDate() - i);
    const dot = document.createElement('div');
    dot.className = 'dot' + (dayDone(d) ? ' done' : '') + (dateStr(d) === dateStr(today) ? ' today' : '');
    dot.textContent = DAY_SHORT[d.getDay()].charAt(0);
    dot.title = DAY_SHORT[d.getDay()];
    dot.onclick = () => { current = new Date(d); render(); };
    el.appendChild(dot);
  }
}

/* ── Build list item ── */
function buildItem(id, name, time, done, link) {
  const el = document.createElement('div');
  el.className = 'item' + (done ? ' done' : '');
  el.innerHTML = '<div class="check">' + CHECK_SVG + '</div>' +
    '<div class="body">' + (time ? '<div class="time">' + time + '</div>' : '') + '<div class="name">' + name + '</div></div>' +
    (link ? '<div class="arrow">›</div>' : '');
  if (link) {
    el.querySelector('.check').onclick = e => { e.stopPropagation(); toggle(id); };
    el.onclick = () => { window.location.href = '/exercicio.html?id=' + id + '&date=' + dateStr(current); };
  } else {
    el.onclick = () => toggle(id);
  }
  return el;
}

/* ── Chart ── */
function renderChart() {
  const canvas = document.getElementById('chart');
  if (!canvas) return;
  const today = new Date(); today.setHours(0,0,0,0);
  const days = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today); d.setDate(d.getDate() - i);
    const st = load(d);
    const exIds = EXERCISES_BY_DAY[d.getDay()] || [];
    days.push({
      label: String(d.getDate()).padStart(2,'0') + '/' + String(d.getMonth()+1).padStart(2,'0'),
      meals: MEALS.filter(m => st[m.id]).length,
      ex: exIds.filter(id => st[id]).length,
      exTotal: exIds.length,
      today: dateStr(d) === dateStr(today),
    });
  }
  const W = 600, H = 160, dpr = window.devicePixelRatio || 1;
  canvas.width = W * dpr; canvas.height = H * dpr;
  canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
  const ctx = canvas.getContext('2d'); ctx.scale(dpr, dpr);
  const pad = {t:10,r:8,b:28,l:24}, cw = W - pad.l - pad.r, ch = H - pad.t - pad.b;

  // Grid
  ctx.strokeStyle = '#2e2e33'; ctx.lineWidth = 0.5;
  for (let v = 0; v <= 6; v++) {
    const y = pad.t + ch - (v/6*ch);
    ctx.beginPath(); ctx.moveTo(pad.l, y); ctx.lineTo(W-pad.r, y); ctx.stroke();
  }
  // Bars
  days.forEach((day, i) => {
    const gx = pad.l + i*(cw/days.length), gw = cw/days.length, bw = Math.max(2, gw*.28), gap = gw*.04;
    // Meals
    if (day.meals > 0) { ctx.fillStyle = '#d9703e'; ctx.fillRect(gx + gw*.1, pad.t + ch - (day.meals/6*ch), bw, (day.meals/6*ch)); }
    // Ex
    if (day.exTotal > 0 && day.ex > 0) { ctx.fillStyle = '#c99d5b'; ctx.fillRect(gx + gw*.1 + bw + gap, pad.t + ch - (day.ex/day.exTotal*ch), bw, (day.ex/day.exTotal*ch)); }
    // Label
    if (i % 3 === 0 || i === 29) { ctx.fillStyle = '#6b6b68'; ctx.font = '9px sans-serif'; ctx.textAlign = 'center'; ctx.fillText(day.label, gx + gw/2, H-4); }
    // Today line
    if (day.today) { ctx.strokeStyle = '#d9703e'; ctx.lineWidth = 1; ctx.setLineDash([2,2]); ctx.beginPath(); ctx.moveTo(gx+gw/2, pad.t); ctx.lineTo(gx+gw/2, pad.t+ch); ctx.stroke(); ctx.setLineDash([]); }
  });
  // Y labels
  ctx.fillStyle = '#6b6b68'; ctx.font = '9px sans-serif'; ctx.textAlign = 'right';
  for (let v = 0; v <= 6; v++) { ctx.fillText(v, pad.l-6, pad.t + ch - (v/6*ch) + 3); }
}

/* ── Render ── */
function render() {
  const st = loadState();
  document.getElementById('dayLabel').textContent = DAY_NAMES[current.getDay()];
  document.getElementById('dateLabel').textContent = current.toLocaleDateString('pt-PT', {day:'2-digit',month:'2-digit',year:'numeric'});

  // Meals
  const mp = document.getElementById('mealsPanel'); mp.innerHTML = '';
  let md = 0;
  MEALS.forEach(m => { if (st[m.id]) md++; mp.appendChild(buildItem(m.id, m.n, m.t, !!st[m.id])); });
  document.getElementById('mealN').innerHTML = md + ' <span class="of">/6</span>';
  document.getElementById('mealBar').style.width = (md/6*100)+'%';

  // Exercises
  const exIds = EXERCISES_BY_DAY[current.getDay()] || [];
  const ep = document.getElementById('exPanel'); ep.innerHTML = '';
  let ed = 0;
  if (exIds.length) {
    const btn = document.createElement('a');
    btn.className = 'btn-workout';
    btn.href = '/treino.html?date=' + dateStr(current);
    btn.textContent = '▶️ Iniciar Treino';
    ep.appendChild(btn);
    exIds.forEach(id => { if (st[id]) ed++; ep.appendChild(buildItem(id, EXERCISE_DETAILS[id].n, null, !!st[id], true)); });
  } else {
    ep.innerHTML = '<div class="rest-day">Dia de descanso.<br>Sem treino de força hoje.</div>';
  }
  document.getElementById('exN').innerHTML = ed + ' <span class="of">/' + (exIds.length||0) + '</span>';
  document.getElementById('exBar').style.width = (exIds.length ? (ed/exIds.length*100) : 0) + '%';

  // Streak
  const s = calcStreak();
  document.getElementById('streakN').textContent = s;
  document.getElementById('streak').style.display = s > 0 ? 'flex' : 'none';

  renderWeekly();
}

/* ── Tabs ── */
document.querySelectorAll('.tab').forEach(t => {
  t.onclick = () => {
    const tab = t.dataset.tab;
    document.querySelectorAll('.tab').forEach(x => x.classList.toggle('active', x === t));
    document.querySelectorAll('.panel').forEach(p => p.classList.toggle('active', p.id === tab + 'Panel'));
    if (tab === 'progress') renderChart();
  };
});

/* ── Day nav ── */
document.getElementById('prev').onclick = () => { current.setDate(current.getDate()-1); render(); };
document.getElementById('next').onclick = () => { current.setDate(current.getDate()+1); render(); };

/* ── Install ── */
let dp;
window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); dp = e; document.getElementById('banner').style.display = 'flex'; });
document.getElementById('btnInstall').onclick = async () => { if (!dp) return; dp.prompt(); await dp.userChoice; dp = null; document.getElementById('banner').style.display = 'none'; };
window.addEventListener('appinstalled', () => { document.getElementById('banner').style.display = 'none'; });

/* ── Start ── */
render();
