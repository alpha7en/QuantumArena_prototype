// Мелкие помощники для работы с DOM и шаблонами-строками.
export const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

// Тег-функция: html`<b>${x}</b>` экранирует вставки, если они не помечены как raw().
export class Raw { constructor(s) { this.s = s; } toString() { return this.s; } }
export const raw = (s) => new Raw(s);
export function html(strings, ...vals) {
  let out = '';
  strings.forEach((s, i) => {
    out += s;
    if (i < vals.length) {
      const v = vals[i];
      out += Array.isArray(v) ? v.map((x) => (x instanceof Raw ? x.s : esc(x))).join('') : v instanceof Raw ? v.s : esc(v);
    }
  });
  return new Raw(out);
}

export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

export function el(tag, attrs = {}, ...kids) {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v == null || v === false) continue;
    if (k === 'class') e.className = v;
    else if (k === 'html') e.innerHTML = v;
    else if (k.startsWith('on')) e.addEventListener(k.slice(2), v);
    else e.setAttribute(k, v === true ? '' : v);
  }
  for (const c of kids.flat()) if (c != null) e.append(c.nodeType ? c : document.createTextNode(c));
  return e;
}

// Делегирование событий: on(root, 'click', '[data-act]', (e, target) => ...)
export function on(root, type, selector, handler) {
  root.addEventListener(type, (e) => {
    const t = e.target.closest(selector);
    if (t && root.contains(t)) handler(e, t);
  });
}

export const clamp = (x, a, b) => Math.min(b, Math.max(a, x));
export const fmtInt = (n) => new Intl.NumberFormat('ru-RU').format(Math.round(n)).replace(/ /g, ' ');
export const fmtDec = (n, d = 1) => n.toFixed(d).replace('.', ',');
export const pad2 = (n) => String(n).padStart(2, '0');

const MONTHS_G = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
const MONTHS_S = ['янв', 'фев', 'мар', 'апр', 'мая', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];
const DOW_S = ['вс', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб'];
export const dateLong = (d) => `${DOW_S[d.getDay()]}, ${d.getDate()} ${MONTHS_G[d.getMonth()]}`;
export const dateShort = (d) => `${DOW_S[d.getDay()]} ${d.getDate()} ${MONTHS_S[d.getMonth()]}`;
export const dateDay = (d) => `${d.getDate()} ${MONTHS_G[d.getMonth()]}`;
export const timeHM = (d) => `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
export const ruPlural = (n, one, few, many) => { const a = n % 10, b = n % 100; return a === 1 && b !== 11 ? one : a >= 2 && a <= 4 && (b < 10 || b >= 20) ? few : many; };

export function mmss(ms) {
  const s = Math.max(0, Math.floor(ms / 1000));
  return `${pad2(Math.floor(s / 60))}:${pad2(s % 60)}`;
}
