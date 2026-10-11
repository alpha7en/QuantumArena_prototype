// Расписание раундов и смоделированные результаты участников. Раунды — по воскресеньям, 12:00 мск, 90 минут.
// Участники и их результаты — демо-данные со стабильным seed (см. people.js).
import { rng } from '../quantum/sim.js';
import { TASKS, taskById } from './tasks.js';
import { pool } from './people.js';

export const BASE_ROUND = 522;
export const BASE_START = Date.UTC(2026, 9, 11, 9, 0, 0); // 11.10.2026 12:00 мск
export const ROUND_MS = 90 * 60 * 1000;
export const WEEK_MS = 7 * 24 * 3600 * 1000;
export const POINTS = [100, 200, 200, 300];
export const PENALTY_MIN = 5;

export const roundStart = (n) => new Date(BASE_START + (n - BASE_ROUND) * WEEK_MS);
export const roundEnd = (n) => new Date(roundStart(n).getTime() + ROUND_MS);

// next — ближайший раунд, который ещё не закончился; last — последний завершённый.
export function schedule(now = Date.now()) {
  let n = BASE_ROUND + Math.floor((now - BASE_START) / WEEK_MS);
  while (roundEnd(n).getTime() <= now) n++;
  while (roundEnd(n - 1).getTime() > now) n--;
  return { next: n, last: n - 1, running: now >= roundStart(n).getTime() };
}

const OVERRIDES = {
  517: ['cz-kick', 'compare-bits', 'rep-encode', 'qft-4'],
  520: ['teleport', 'add-mod4', 'qpe-t', 'shor-encode'],
  521: ['bell', 'dj-4', 'qft-3', 'grover-3'],
};

export function roundTasks(n) {
  if (OVERRIDES[n]) return OVERRIDES[n].map(taskById);
  const rand = rng(n * 104729 + 13);
  const pick = (pred, used) => {
    const c = TASKS.filter((t) => pred(t) && !used.has(t.id));
    return c[Math.floor(rand() * c.length)];
  };
  const used = new Set(), out = [];
  const rules = [(t) => t.level === 1 && !t.codeOnly, (t) => t.level === 2 && !t.codeOnly, (t) => (t.level === 2 || t.level === 3) && !t.codeOnly, (t) => t.level === 3];
  for (const r of rules) { const t = pick(r, used); used.add(t.id); out.push(t); }
  return out;
}

export const participantsOf = (n) => Math.round(440 + ((n * 37) % 80) + (n - 513) * 5);

const sigma = (x) => 1 / (1 + Math.exp(-x));
const A = [1.3, -0.35, -1.1, -3.2];
const BASE_T = [14, 30, 44, 60];
const cache = new Map();

// Итоговая таблица раунда n: массив участников, отсортированный по месту.
export function cohort(n) {
  if (cache.has(n)) return cache.get(n);
  const rand = rng(n * 7919 + 5);
  const N = participantsOf(n), P = pool();
  const idx = Array.from({ length: P.length }, (_, i) => i);
  for (let i = idx.length - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [idx[i], idx[j]] = [idx[j], idx[i]]; }
  const rows = idx.slice(0, N).map((pi) => {
    const p = P[pi];
    const z = (p.rating - 1330) / 335 + (rand() - 0.5) * 0.9;
    const solved = [], times = [], wrong = [];
    let score = 0, time = 0;
    for (let j = 0; j < 4; j++) {
      const ok = rand() < sigma(1.3 * z + A[j]);
      const w = Math.floor(-Math.log(Math.max(rand(), 1e-9)) * 0.45);
      solved.push(ok); wrong.push(w);
      if (ok) {
        const t = Math.min(88, Math.max(3, Math.round(BASE_T[j] * Math.exp(-0.22 * z) * (0.55 + 0.9 * rand()))));
        times.push(t); score += POINTS[j]; time += t + PENALTY_MIN * w;
      } else times.push(null);
    }
    return { person: p, solved, times, wrong, score, time, count: solved.filter(Boolean).length };
  });
  rows.sort((a, b) => b.score - a.score || a.time - b.time);
  rows.forEach((r, i) => { r.rank = i + 1; });
  const res = { rows, N, perTask: [0, 1, 2, 3].map((j) => rows.filter((r) => r.solved[j]).length) };
  cache.set(n, res);
  return res;
}

// Место пользователя среди участников раунда n. progress[j] = { at: минуты от старта | null, wrong: число }
export function scoreProgress(progress) {
  let score = 0, time = 0, count = 0;
  progress.forEach((p, j) => { if (p && p.at != null) { score += POINTS[j]; time += p.at + PENALTY_MIN * (p.wrong || 0); count++; } });
  return { score, time, count };
}
export function placeInRound(n, progress) {
  const { rows, N } = cohort(n), me = scoreProgress(progress);
  let better = 0;
  for (const r of rows) { if (r.score > me.score || (r.score === me.score && r.time < me.time)) better++; else break; }
  return { place: better + 1, of: N + 1, ...me };
}

export function ratingDelta(rating, played, place, N) {
  const R = rating ?? 1200;
  const p = 1 - (place - 1) / Math.max(1, N - 1);
  const E = 1 / (1 + Math.pow(10, (1330 - R) / 400));
  const K = played < 3 ? 90 : played < 8 ? 56 : 36;
  return Math.round(K * (p - E));
}

// «Решаемость» задачи в банке — смоделированная доля решивших (для столбца таблицы).
export function acceptance(task) {
  const r = rng(task.num * 2654435761 >>> 0);
  const base = { 1: 0.66, 2: 0.46, 3: 0.27 }[task.level];
  return Math.round((base + (r() - 0.5) * 0.2) * 1000) / 10;
}

export const isRoundLocked = (n, now = Date.now()) => now < roundStart(n).getTime();
