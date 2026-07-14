import { EXERCISE_DETAILS, EXERCISES_BY_DAY } from './data.js';
import { load, save, dateStr } from './storage.js';

const Q = new URLSearchParams(window.location.search);
const id = Q.get('id');
const date = Q.get('date') ? new Date(Q.get('date') + 'T00:00:00') : new Date(); date.setHours(0,0,0,0);
const ex = EXERCISE_DETAILS[id];
const app = document.getElementById('app');

if (!ex) { app.innerHTML = '<a class="back" href="/" style="position:absolute;top:1rem;left:1rem">&lsaquo;</a><div class="not-found">Exercício não encontrado.</div>'; } else { render(); }

/* ── Neighbors ── */
function neighbors() {
  for (const list of Object.values(EXERCISES_BY_DAY)) {
    const i = list.indexOf(id);
    if (i >= 0) return { prev: i > 0 ? list[i-1] : null, next: i < list.length-1 ? list[i+1] : null };
  }
  return { prev: null, next: null };
}

/* ── Parse seconds ── */
function sec(s) { const m = s.match(/(\d+)/); return m ? +m[1] : 60; }
function fmt(s) { return String(Math.floor(s/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0'); }

/* ── Timer state ── */
let tSec = sec(ex.descanso), tIv = null, tRun = false, tEnd = false;

function stopT() { if (tIv) { clearInterval(tIv); tIv = null; } tRun = false; }

function uiT() {
  const el = document.getElementById('timerDisplay'); if (!el) return;
  el.textContent = fmt(tSec); el.className = 'timer-display' + (tEnd ? ' end' : '') + (tRun ? ' run' : '');
}

function uiCtrls(run) {
  const el = document.getElementById('timerCtrls'); if (!el) return;
  const ini = sec(ex.descanso);
  el.innerHTML = run
    ? '<button onclick="w._pause()">Pausa</button><button class="prim" onclick="w._skip('+ini+')">Saltar</button>'
    : '<button class="prim" onclick="w._start('+tSec+')">'+(tEnd?'Repetir':'Iniciar')+'</button><button onclick="w._reset('+ini+')">Repor</button>';
}

window.w = {
  _start(s) { stopT(); tSec=s; tEnd=false; tRun=true; uiT(); uiCtrls(true);
    tIv = setInterval(() => { if (tSec<=0) { stopT(); tEnd=true; uiT(); uiCtrls(false); if (navigator.vibrate) navigator.vibrate([200,100,200,100,400]); return; } tSec--; uiT(); }, 1000); },
  _pause() { stopT(); uiT(); uiCtrls(false); },
  _reset(s) { stopT(); tSec=s; tEnd=false; uiT(); uiCtrls(false); },
  _skip(s) { stopT(); tSec=0; tEnd=true; uiT(); uiCtrls(false); },
};

const CHK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>';

function render() {
  const st = load(date); const done = !!st[id]; const nb = neighbors(); const ds = dateStr(date);
  app.innerHTML =
    '<div class="topbar"><a class="back" href="/">&lsaquo;</a>' +
    '<div class="ex-nav">' +
      '<button id="prevEx" '+(nb.prev?'':'disabled')+'>&lsaquo;</button>' +
      '<button id="nextEx" '+(nb.next?'':'disabled')+'>&rsaquo;</button>' +
    '</div></div>' +
    '<h1>'+ex.n+'</h1><div class="tag">'+ex.day+'</div>' +
    '<div class="row2">' +
      '<div class="card"><div class="label">Séries</div><div class="val">'+ex.series+'</div></div>' +
      '<div class="card"><div class="label">Descanso</div><div class="val">'+ex.descanso+'</div></div>' +
    '</div>' +
    '<div class="timer-box">' +
      '<div class="timer-label">⏱️ Timer de Descanso</div>' +
      '<div class="timer-display" id="timerDisplay">'+fmt(tSec)+'</div>' +
      '<div class="timer-ctrls" id="timerCtrls">' +
        '<button class="prim" onclick="w._start('+tSec+')">Iniciar</button>' +
        '<button onclick="w._reset('+sec(ex.descanso)+')">Repor</button>' +
      '</div>' +
    '</div>' +
    '<div class="card"><div class="label">O que é</div><p>'+ex.oQueE+'</p></div>' +
    '<div class="card"><div class="label">O que precisas</div><p>'+ex.precisas+'</p></div>' +
    '<div class="card"><div class="label">Como fazer</div><p>'+ex.comoFazer+'</p></div>' +
    '<button class="btn-mark'+(done?' done':'')+'" id="markBtn">'+(done?CHK:'')+(done?'Feito hoje':'Marcar como feito')+'</button>';

  tSec = sec(ex.descanso); tRun = false; tEnd = false;

  document.getElementById('markBtn').onclick = () => { const s = load(date); s[id] = !s[id]; save(date, s); render(); };
  if (nb.prev) document.getElementById('prevEx').onclick = () => { stopT(); location.href = '/exercicio.html?id='+nb.prev+'&date='+ds; };
  if (nb.next) document.getElementById('nextEx').onclick = () => { stopT(); location.href = '/exercicio.html?id='+nb.next+'&date='+ds; };
}
