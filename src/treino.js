import { EXERCISE_DETAILS, EXERCISES_BY_DAY } from './data.js';
import { load, save, dateStr } from './storage.js';

/* ── Init ── */
const Q = new URLSearchParams(location.search);
const d = Q.get('date') ? new Date(Q.get('date')+'T00:00:00') : new Date(); d.setHours(0,0,0,0);
const ids = EXERCISES_BY_DAY[d.getDay()] || [];
const exs = ids.map(id => ({...EXERCISE_DETAILS[id], id}));
const ds = dateStr(d);

if (!exs.length) {
  document.getElementById('app').innerHTML =
    '<div class="wo"><div class="wo-top"><a class="wo-back" href="/">&lsaquo;</a></div>' +
    '<div class="wo-end"><div class="big">😴</div><h2>Dia de descanso</h2><p>Sem treino hoje.</p><a href="/">Voltar</a></div></div>';
} else { init(); }

/* ── State ── */
let idx = 0, tIv = null, tSec = 0, tRun = false, tEnd = false;
let metroOn = false, metroIv = null, actx = null;

/* ── Helpers ── */
function sec(s) { const m = s.match(/(\d+)/); return m ? +m[1] : 60; }
function fmt(s) { return String(Math.floor(s/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0'); }

/* ── Metronome ── */
function beep() {
  if (!actx) return;
  const o = actx.createOscillator(), g = actx.createGain();
  o.connect(g); g.connect(actx.destination);
  o.type='sine'; o.frequency.value=800;
  g.gain.setValueAtTime(.3,actx.currentTime);
  g.gain.exponentialRampToValueAtTime(.001,actx.currentTime+.1);
  o.start(actx.currentTime); o.stop(actx.currentTime+.1);
  const dot = document.getElementById('metroDot'); if (dot) { dot.classList.add('beat'); setTimeout(()=>dot.classList.remove('beat'),150); }
}
function metroStart() { if(!actx)actx=new(window.AudioContext||window.webkitAudioContext)(); metroOn=true; beep(); metroIv=setInterval(()=>{if(!metroOn)return;beep();if(navigator.vibrate)navigator.vibrate(30)},1500); updateMetro(); }
function metroStop() { metroOn=false; if(metroIv){clearInterval(metroIv);metroIv=null;} updateMetro(); }
function metroToggle() { metroOn?metroStop():metroStart(); }
function updateMetro() { const b=document.getElementById('metroBtn'); if(b){b.textContent=metroOn?'⏸️ Metrónomo':'🔊 Metrónomo';b.className=metroOn?'on':'';} }
window._metro = metroToggle;

/* ── Timer ── */
function stopT() { if(tIv){clearInterval(tIv);tIv=null;} tRun=false; }
function uiT() { const e=document.getElementById('tDisplay'); if(!e)return; e.textContent=fmt(tSec); e.className='val'+(tEnd?' end':'')+(tRun?' run':''); }
function uiC(run) { const e=document.getElementById('tCtrls'); if(!e)return; const s=sec(exs[idx].descanso); e.innerHTML=run?'<button onclick="w._p()">Pausa</button><button class="prim" onclick="w._sk('+s+')">Saltar</button>':'<button class="prim" onclick="w._st('+tSec+')">'+(tEnd?'Repetir':'Iniciar')+'</button><button onclick="w._rs('+s+')">Repor</button>'; }
window.w={_st(s){stopT();tSec=s;tEnd=false;tRun=true;uiT();uiC(true);tIv=setInterval(()=>{if(tSec<=0){stopT();tEnd=true;uiT();uiC(false);if(navigator.vibrate)navigator.vibrate([200,100,200,100,400]);return}tSec--;uiT()},1000)},_p(){stopT();uiT();uiC(false)},_rs(s){stopT();tSec=s;tEnd=false;uiT();uiC(false)},_sk(s){stopT();tSec=0;tEnd=true;uiT();uiC(false)}};

/* ── Flow ── */
function markDone() { const s=load(d); s[exs[idx].id]=true; save(d,s); render(); }
function nextEx() {
  if (idx < exs.length-1) { idx++; stopT(); metroStop(); tSec=sec(exs[idx-1].descanso); tEnd=false; render(); window.w._st(tSec); }
  else finish();
}
function finish() { stopT(); metroStop(); if(actx){actx.close();actx=null;} const s=load(d); const total=exs.length; const done=exs.filter(e=>s[e.id]).length;
  document.getElementById('app').innerHTML='<div class="wo"><div class="wo-top"><a class="wo-back" href="/">&lsaquo;</a></div><div class="wo-end"><div class="big">'+(done===total?'🔥':'💪')+'</div><h2>Treino terminado</h2><p>'+done+' de '+total+' exercícios concluídos</p><a href="/">Voltar ao início</a></div></div>'; }

/* ── Render ── */
function render() {
  const ex = exs[idx], st = load(d), done = !!st[ex.id];
  const total = exs.length, completed = exs.filter(e=>st[e.id]).length, isLast = idx===total-1;
  const rest = sec(ex.descanso);

  document.getElementById('app').innerHTML =
    '<div class="wo"><div class="wo-top"><a class="wo-back" href="/">&lsaquo;</a><span style="font-size:12px;color:var(--muted);margin-left:auto">Treino</span></div>'+
    '<div class="wo-count">'+completed+' de '+total+' concluídos</div>'+
    '<div class="wo-bar"><div class="wo-bar-fill" style="width:'+(completed/total*100)+'%"></div></div>'+
    '<div class="wo-main">'+
      '<div class="wo-card"><h2>'+ex.n+'</h2><div class="ser">'+ex.series+'</div><div class="how">'+ex.comoFazer+'</div></div>'+
      '<div class="wo-side">'+
        '<div class="wo-timer"><div class="lbl">⏱️ Descanso</div><div class="val" id="tDisplay">'+fmt(tSec||rest)+'</div><div class="ctrls" id="tCtrls"><button class="prim" onclick="w._st('+rest+')">Iniciar</button><button onclick="w._rs('+rest+')">Repor</button></div></div>'+
        '<div class="wo-metro"><button id="metroBtn" onclick="_metro()">🔊 Metrónomo</button><div class="metro-dot" id="metroDot"></div></div>'+
        '<div class="wo-act">'+
          (done?'<div class="wo-check">✅ Feito</div>':'<button class="wo-done" id="btnDone">Marcar como feito</button>')+
          (done?(isLast?'<button class="wo-fin" id="btnFin">🏁 Terminar treino</button>':'<button class="wo-next" id="btnNext">Próximo exercício ›</button>'):'')+
        '</div>'+
      '</div>'+
    '</div></div>';

  if(!done) document.getElementById('btnDone').onclick = () => { stopT(); markDone(); };
  else if(isLast) document.getElementById('btnFin').onclick = finish;
  else document.getElementById('btnNext').onclick = nextEx;
}

function init() { tSec = sec(exs[0].descanso); render(); }
