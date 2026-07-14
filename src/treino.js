import { EXERCISE_DETAILS, EXERCISES_BY_DAY } from './data/exercises.js';
import { loadDay, saveDay, dateStr, dateKey } from './utils/storage.js';

const params = new URLSearchParams(window.location.search);
const dateStrParam = params.get('date');
const workoutDate = dateStrParam ? new Date(dateStrParam + 'T00:00:00') : new Date();
workoutDate.setHours(0, 0, 0, 0);

const dayIndex = workoutDate.getDay();
const exerciseIds = EXERCISES_BY_DAY[dayIndex] || [];
const exercises = exerciseIds.map(id => ({ ...EXERCISE_DETAILS[id], id }));

if (exercises.length === 0) {
  document.getElementById('app').innerHTML =
    '<div class="workout-wrap">' +
    '<div class="wo-topbar"><a class="wo-back" href="/">&lsaquo;</a></div>' +
    '<div class="finish-screen"><div class="big">😴</div><h2>Dia de descanso</h2><p>Sem treino hoje. Aproveita para recuperar.</p>' +
    '<a href="/">Voltar</a></div></div>';
} else {
  initWorkout();
}

function parseSegundos(str) {
  const m = str.match(/(\d+)/);
  return m ? parseInt(m[1]) : 60;
}

function buildTimerHTML(s) {
  return String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0');
}

/* ── State ── */
let currentIdx = 0;
let timerInterval = null;
let timerSeconds = 0;
let timerRunning = false;
let timerDone = false;
let metronomeActive = false;
let metronomeInterval = null;
let audioCtx = null;

/* ── Metronome ── */
function initAudio() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
}

function beep() {
  if (!audioCtx) return;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.type = 'sine';
  osc.frequency.value = 800;
  gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.1);
  osc.start(audioCtx.currentTime);
  osc.stop(audioCtx.currentTime + 0.1);
  // Pulse the dot
  const dot = document.getElementById('metroDot');
  if (dot) {
    dot.classList.add('beat');
    setTimeout(() => dot.classList.remove('beat'), 150);
  }
}

function startMetronome() {
  initAudio();
  metronomeActive = true;
  beep();
  // Beat every 1.5s (half of 3s cycle): descent beat + ascent beat
  let phase = 0;
  metronomeInterval = setInterval(() => {
    if (!metronomeActive) return;
    beep();
    if (navigator.vibrate) navigator.vibrate(30);
    phase++;
  }, 1500);
  updateMetronomeUI();
}

function stopMetronome() {
  metronomeActive = false;
  if (metronomeInterval) { clearInterval(metronomeInterval); metronomeInterval = null; }
  updateMetronomeUI();
}

function toggleMetronome() {
  if (metronomeActive) stopMetronome();
  else startMetronome();
}

function updateMetronomeUI() {
  const btn = document.getElementById('metroBtn');
  if (btn) {
    btn.textContent = metronomeActive ? '⏸️ Metrónomo' : '🔊 Metrónomo';
    btn.className = metronomeActive ? 'active' : '';
  }
}

/* ── Timer ── */
function stopTimer() {
  if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }
  timerRunning = false;
}

function updateTimerUI() {
  const display = document.getElementById('timerDisplay');
  if (!display) return;
  display.textContent = buildTimerHTML(timerSeconds);
  display.classList.remove('running', 'done');
  if (timerSeconds === 0 && timerDone) display.classList.add('done');
  else if (timerRunning) display.classList.add('running');
}

function renderTimerCtrls(running) {
  const ctrls = document.getElementById('timerCtrls');
  if (!ctrls) return;
  const rest = parseSegundos(exercises[currentIdx].descanso);
  if (running) {
    ctrls.innerHTML =
      '<button onclick="window.woPause()">Pausa</button>' +
      '<button class="primary" onclick="window.woSkip(' + rest + ')">Saltar</button>';
  } else {
    ctrls.innerHTML =
      '<button class="primary" onclick="window.woStart(' + timerSeconds + ')">' + (timerDone ? 'Repetir' : 'Iniciar') + '</button>' +
      '<button onclick="window.woReset(' + rest + ')">Repor</button>';
  }
}

window.woStart = function(s) {
  stopTimer();
  timerSeconds = s;
  timerDone = false;
  timerRunning = true;
  updateTimerUI();
  renderTimerCtrls(true);
  timerInterval = setInterval(() => {
    if (timerSeconds <= 0) {
      stopTimer();
      timerDone = true;
      updateTimerUI();
      renderTimerCtrls(false);
      if (navigator.vibrate) navigator.vibrate([200, 100, 200, 100, 400]);
      return;
    }
    timerSeconds--;
    updateTimerUI();
  }, 1000);
};

window.woPause = function() { stopTimer(); updateTimerUI(); renderTimerCtrls(false); };

window.woReset = function(s) { stopTimer(); timerSeconds = s; timerDone = false; updateTimerUI(); renderTimerCtrls(false); };

window.woSkip = function(s) { stopTimer(); timerSeconds = 0; timerDone = true; updateTimerUI(); renderTimerCtrls(false); };

/* ── Workout flow ── */
function markDone() {
  const state = loadDay(workoutDate);
  state[exercises[currentIdx].id] = true;
  saveDay(workoutDate, state);
  render();
}

function nextExercise() {
  if (currentIdx < exercises.length - 1) {
    currentIdx++;
    stopTimer();
    stopMetronome();
    const rest = parseSegundos(exercises[currentIdx - 1].descanso);
    timerSeconds = rest;
    timerDone = false;
    render();
    // Auto-start rest timer for the PREVIOUS exercise's rest
    window.woStart(rest);
  } else {
    // All done
    finishWorkout();
  }
}

function finishWorkout() {
  stopTimer();
  stopMetronome();
  if (audioCtx) { audioCtx.close(); audioCtx = null; }
  const state = loadDay(workoutDate);
  const total = exercises.length;
  const done = exercises.filter(ex => state[ex.id]).length;

  document.getElementById('app').innerHTML =
    '<div class="workout-wrap">' +
    '<div class="wo-topbar"><a class="wo-back" href="/">&lsaquo;</a></div>' +
    '<div class="finish-screen">' +
      '<div class="big">' + (done === total ? '🔥' : '💪') + '</div>' +
      '<h2>Treino terminado</h2>' +
      '<p>' + done + ' de ' + total + ' exercícios concluídos</p>' +
      '<a href="/">Voltar ao início</a>' +
    '</div></div>';
}

function render() {
  const ex = exercises[currentIdx];
  const state = loadDay(workoutDate);
  const done = !!state[ex.id];
  const total = exercises.length;
  const completed = exercises.filter(e => state[e.id]).length;
  const isLast = currentIdx === total - 1;
  const rest = parseSegundos(ex.descanso);

  const app = document.getElementById('app');
  app.innerHTML =
    '<div class="workout-wrap">' +
      /* topbar */
      '<div class="wo-topbar">' +
        '<a class="wo-back" href="/" aria-label="Sair do treino">&lsaquo;</a>' +
        '<span style="font-size:12px;color:var(--text-muted);margin-left:auto;">Treino</span>' +
      '</div>' +

      /* progress */
      '<div class="wo-counter">' + completed + ' de ' + total + ' concluídos</div>' +
      '<div class="wo-progress"><div class="wo-progress-fill" style="width:' + (completed / total * 100) + '%"></div></div>' +

      /* exercise card */
      '<div class="wo-card">' +
        '<h2>' + ex.n + '</h2>' +
        '<div class="wo-series">' + ex.series + '</div>' +
        '<div class="wo-how">' + ex.comoFazer + '</div>' +

        /* timer */
        '<div class="wo-timer">' +
          '<div class="wo-timer-label">⏱️ Descanso</div>' +
          '<div class="wo-timer-display" id="timerDisplay">' + buildTimerHTML(timerSeconds || rest) + '</div>' +
          '<div class="wo-timer-ctrls" id="timerCtrls">' +
            '<button class="primary" onclick="window.woStart(' + rest + ')">Iniciar</button>' +
            '<button onclick="window.woReset(' + rest + ')">Repor</button>' +
          '</div>' +
        '</div>' +

        /* metronome */
        '<div class="wo-metronome">' +
          '<button id="metroBtn" onclick="toggleMetronome()">🔊 Metrónomo</button>' +
          '<div class="metronome-dot" id="metroDot"></div>' +
        '</div>' +
      '</div>' +

      /* actions */
      '<div class="wo-actions">' +
        (done
          ? '<div class="wo-done-check">✅ Feito</div>'
          : '<button class="wo-btn wo-btn-done" id="btnDone">Marcar como feito</button>') +
        (!done
          ? ''
          : (isLast
            ? '<button class="wo-btn wo-btn-finish" id="btnFinish">🏁 Terminar treino</button>'
            : '<button class="wo-btn wo-btn-next" id="btnNext">Próximo exercício ›</button>')) +
      '</div>' +
    '</div>';

  // Attach events
  if (!done) {
    document.getElementById('btnDone').addEventListener('click', () => {
      stopTimer();
      markDone();
    });
  } else if (isLast) {
    document.getElementById('btnFinish').addEventListener('click', finishWorkout);
  } else {
    document.getElementById('btnNext').addEventListener('click', nextExercise);
  }

  // Expose toggleMetronome globally for inline onclick
  window.toggleMetronome = toggleMetronome;
}

function initWorkout() {
  if (timerSeconds === 0) {
    timerSeconds = parseSegundos(exercises[0].descanso);
  }
  render();
}
