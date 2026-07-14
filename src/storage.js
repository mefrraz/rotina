export function dateStr(d) {
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}
export function dateKey(d) { return 'log:' + dateStr(d); }
export function load(d) {
  try { const r = localStorage.getItem(dateKey(d)); return r ? JSON.parse(r) : {}; }
  catch { return {}; }
}
export function save(d, s) { localStorage.setItem(dateKey(d), JSON.stringify(s)); }
