import { EXERCISE_DETAILS, EXERCISES_BY_DAY } from './data/exercises.js';
import { loadDay, saveDay, dateKey, dateStr } from './utils/storage.js';

function getId() {
  return new URLSearchParams(window.location.search).get('id');
}

function getDate() {
  const ds = new URLSearchParams(window.location.search).get('date');
  const d = ds ? new Date(ds + 'T00:00:00') : new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function getNeighbors(id) {
  for (const day in EXERCISES_BY_DAY) {
    const list = EXERCISES_BY_DAY[day];
    const idx = list.indexOf(id);
    if (idx !== -1) {
      return {
        prev: idx > 0 ? list[idx - 1] : null,
        next: idx < list.length - 1 ? list[idx + 1] : null,
      };
    }
  }
  return { prev: null, next: null };
}

/* ── Timer ── */
let timerInterval = null;
let timerSeconds = 0;
let timerRunning = false;
let timerDone = false;

function parseSegundos(str) {
  const m = str.match(/(\d+)/);
  return m ? parseInt(m[1]) : 60;
}

function buildTimerHTML(s) {
  return String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0');
}

function stopTimer() {
  if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }
  timerRunning = false;
}

function updateTimerDisplay() {
  const display = document.getElementById('timerDisplay');
  if (!display) return;
  display.textContent = buildTimerHTML(timerSeconds);
  display.classList.remove('running', 'done');
  if (timerSeconds === 0 && timerDone) display.classList.add('done');
  else if (timerRunning) display.classList.add('running');
}

function renderTimerControls(running) {
  const ctrls = document.getElementById('timerControls');
  if (!ctrls) return;
  const initial = parseSegundos(document.getElementById('timerData')?.dataset?.rest || '60');
  if (running) {
    ctrls.innerHTML =
      '<button onclick="window._pauseTimer()">Pausa</button>' +
      '<button class="primary" onclick="window._resetTimer(' + initial + ')">Reiniciar</button>';
  } else {
    ctrls.innerHTML =
      '<button class="primary" onclick="window._startTimer(' + timerSeconds + ')">' + (timerDone ? 'Repetir' : 'Iniciar') + '</button>' +
      '<button onclick="window._resetTimer(' + initial + ')">Repor</button>';
  }
}

window._startTimer = function(initialSeconds) {
  stopTimer();
  timerSeconds = initialSeconds;
  timerDone = false;
  timerRunning = true;
  updateTimerDisplay();
  renderTimerControls(true);
  timerInterval = setInterval(() => {
    if (timerSeconds <= 0) {
      stopTimer();
      timerDone = true;
      updateTimerDisplay();
      renderTimerControls(false);
      if (navigator.vibrate) navigator.vibrate([200, 100, 200, 100, 400]);
      return;
    }
    timerSeconds--;
    updateTimerDisplay();
  }, 1000);
};

window._resetTimer = function(initialSeconds) {
  stopTimer();
  timerSeconds = initialSeconds;
  timerDone = false;
  updateTimerDisplay();
  renderTimerControls(false);
};

window._pauseTimer = function() {
  stopTimer();
  updateTimerDisplay();
  renderTimerControls(false);
};

const CHECK_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>';

function render() {
  const id = getId();
  const ex = id ? EXERCISE_DETAILS[id] : null;
  const app = document.getElementById('app');
  const date = getDate();
  const dateParam = dateStr(date);

  if (!ex) {
    app.innerHTML =
      '<div class="topbar"><a class="back" href="/" aria-label="Voltar">&lsaquo;</a></div>' +
      '<div class="not-found">Exercício não encontrado.</div>';
    return;
  }

  const state = loadDay(date);
  const done = !!state[id];
  const neighbors = getNeighbors(id);
  const restSeconds = parseSegundos(ex.descanso);

  app.innerHTML =
    '<div class="topbar">' +
      '<a class="back" href="/" aria-label="Voltar">&lsaquo;</a>' +
      '<div class="eyebrow">Exercício</div>' +
      '<div class="ex-nav">' +
        '<button id="prevEx" title="Anterior" ' + (!neighbors.prev ? 'disabled' : '') + '>&lsaquo;</button>' +
        '<button id="nextEx" title="Seguinte" ' + (!neighbors.next ? 'disabled' : '') + '>&rsaquo;</button>' +
      '</div>' +
    '</div>' +
    '<h1>' + ex.n + '</h1>' +
    '<div class="day-tag">' + ex.day + '</div>' +

    '<div class="meta-row">' +
      '<div class="section"><div class="label">Séries</div><div class="value">' + ex.series + '</div></div>' +
      '<div class="section"><div class="label">Descanso</div><div class="value" id="timerData" data-rest="' + ex.descanso + '">' + ex.descanso + '</div></div>' +
    '</div>' +

    '<div class="timer-section">' +
      '<div class="label">⏱️ Timer de Descanso</div>' +
      '<div class="timer-display" id="timerDisplay">' + buildTimerHTML(restSeconds) + '</div>' +
      '<div class="timer-controls" id="timerControls">' +
        '<button class="primary" onclick="window._startTimer(' + restSeconds + ')">Iniciar</button>' +
        '<button onclick="window._resetTimer(' + restSeconds + ')">Repor</button>' +
      '</div>' +
    '</div>' +

    '<div class="section"><div class="label">O que é</div><p>' + ex.oQueE + '</p></div>' +
    '<div class="section"><div class="label">O que precisas</div><p>' + ex.precisas + '</p></div>' +
    '<div class="section"><div class="label">Como fazer</div><p>' + ex.comoFazer + '</p></div>' +

    '<button class="mark-check' + (done ? ' done' : '') + '" id="markBtn">' +
      (done ? CHECK_SVG : '') + (done ? 'Feito hoje' : 'Marcar como feito') +
    '</button>';

  timerSeconds = restSeconds;
  timerRunning = false;
  timerDone = false;

  document.getElementById('markBtn').addEventListener('click', () => {
    const s = loadDay(date);
    s[id] = !s[id];
    saveDay(date, s);
    render();
  });

  if (neighbors.prev) {
    document.getElementById('prevEx').addEventListener('click', () => {
      stopTimer();
      window.location.href = '/exercicio.html?id=' + neighbors.prev + '&date=' + dateParam;
    });
  }
  if (neighbors.next) {
    document.getElementById('nextEx').addEventListener('click', () => {
      stopTimer();
      window.location.href = '/exercicio.html?id=' + neighbors.next + '&date=' + dateParam;
    });
  }
}

render();
