export function dateStr(d) {
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}

export function dateKey(d) {
  return 'log:' + dateStr(d);
}

export function loadDay(d) {
  const key = dateKey(d);
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : {};
  } catch (e) { return {}; }
}

export function saveDay(d, state) {
  localStorage.setItem(dateKey(d), JSON.stringify(state));
}
