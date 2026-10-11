// Общие кусочки интерфейса, повторяющиеся на нескольких страницах.
import { esc, fmtInt, ruPlural, pad2 } from './dom.js';
import { icon } from './icons.js';
import { LEVELS } from '../data/tasks.js';
import { initials } from '../data/people.js';

export const TOPIC_ICON = { запутанность: 'entangle', арифметика: 'bars', измерения: 'measure', поиск: 'search', фаза: 'wave', QFT: 'wave', телепортация: 'cloud', шум: 'noise', 'коррекция ошибок': 'shield', разложение: 'gate', оракулы: 'key', состояния: 'ket', связность: 'cnot', алгоритмы: 'atom' };
export const topicIcon = (t, cls = 'sm') => icon(TOPIC_ICON[t] || 'qubit', cls);

export const kicker = (t) => `<div class="t-kicker">${esc(t)}</div>`;

export const diffHtml = (level) => `<span class="diff"><span class="bars"><i class="${level >= 1 ? 'on' : ''}"></i><i class="${level >= 2 ? 'on' : ''}"></i><i class="${level >= 3 ? 'on' : ''}"></i></span>${LEVELS[level]}</span>`;

export const STATUS = {
  ok: ['check', 'принято'], wrong: ['x', 'неверный ответ'], limit: ['alert', 'лимит'], error: ['code', 'ошибка в коде'], pending: ['clock', 'проверяется'],
};
export function statusHtml(kind, text) {
  if (kind === 'live') return `<span class="status live"><span class="dot"></span>${esc(text || 'идёт')}</span>`;
  if (kind === 'draft') return `<span class="status"><span class="dot"></span>${esc(text || 'черновик')}</span>`;
  const [ic, def] = STATUS[kind];
  return `<span class="status ${kind}">${icon(ic)}${esc(text || def)}</span>`;
}

export const avatar = (name, cls = '', img = null) => (img ? `<span class="avatar ${cls}"><img src="${esc(img)}" alt=""></span>` : `<span class="avatar ${cls}">${esc(initials(name))}</span>`);

// «6 дн 18 ч 39 мин»
export function splitDuration(ms) {
  const s = Math.max(0, Math.floor(ms / 1000));
  return { d: Math.floor(s / 86400), h: Math.floor((s % 86400) / 3600), m: Math.floor((s % 3600) / 60), s: s % 60 };
}
export function countdownText(ms) {
  const { d, h, m } = splitDuration(ms);
  return `${d} д ${h} ч ${m} мин`;
}
export function countdownBig(ts) {
  return `<div class="cd-big" data-cd="${ts}" data-fmt="big"></div>`;
}
export function countdownInline(ts) { return `<span class="cd-inline" data-cd="${ts}" data-fmt="inline"></span>`; }
export function tickCountdowns(root) {
  const upd = () => root.querySelectorAll('[data-cd]').forEach((el) => {
    const ms = +el.dataset.cd - Date.now();
    const p = splitDuration(ms);
    if (el.dataset.fmt === 'big') {
      el.innerHTML = [[p.d, 'дн'], [p.h, 'ч'], [p.m, 'мин']].map(([v, u]) => `<span class="cd-n"><b>${v}</b><i>${u}</i></span>`).join('');
    } else if (el.dataset.fmt === 'clock') {
      el.textContent = `${pad2(Math.floor(Math.max(0, ms) / 60000))}:${pad2(p.s)}`;
    } else el.textContent = countdownText(ms);
  });
  upd();
  const id = setInterval(() => { if (!root.isConnected) { clearInterval(id); return; } upd(); }, 1000);
  return () => clearInterval(id);
}

// Подиум: items — [первый, второй, третий] (в порядке мест). Отрисовка: 2 · 1 · 3.
export function podiumHtml(items, { kind = 'person' } = {}) {
  const order = [1, 0, 2];
  const col = (it, i) => {
    if (!it) return '<div></div>';
    const place = i + 1;
    const av = kind === 'uni' ? `<span class="avatar lg pod-av">${icon('university')}</span>` : `<span class="avatar ${place === 1 ? 'xl' : 'lg'} pod-av">${esc(initials(it.name))}</span>`;
    return `<div class="pod pod-${place}"><div class="pod-top">${av}<div class="pod-name">${esc(it.name)}</div>${it.sub ? `<div class="pod-sub">${esc(it.sub)}</div>` : ''}<div class="pod-score num">${esc(it.score)}</div></div><div class="pod-block"><span class="pod-num">${place}</span></div></div>`;
  };
  return `<div class="podium">${order.map((i) => col(items[i], i)).join('')}</div>`;
}

export function statTile({ label, value, sub, cls = '' }) {
  return `<div class="card stat ${cls}"><div class="t-mono-s muted">${esc(label)}</div><div class="t-number">${value}</div>${sub ? `<div class="t-mono-s">${sub}</div>` : ''}</div>`;
}

export const sectionHead = (title, right = '') => `<div class="sec-head"><h2 class="t-h2">${esc(title)}</h2>${right}</div>`;

export const plur = ruPlural;
export { fmtInt, esc, icon };
