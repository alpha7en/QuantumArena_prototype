// Симулятор вектора состояния. Работает целиком в браузере (и в Node для тестов).
import { GATES, matrixOf } from './gates.js';

export class State {
  constructor(n, re, im) {
    this.n = n;
    this.dim = 1 << n;
    this.re = re || new Float64Array(this.dim);
    this.im = im || new Float64Array(this.dim);
    if (!re) this.re[0] = 1;
  }
  clone() { return new State(this.n, this.re.slice(), this.im.slice()); }
  static basis(n, idx) { const s = new State(n); s.re[0] = 0; s.re[idx] = 1; return s; }
  static fromAmps(n, amps) { // amps: массив [re, im] или чисел
    const s = new State(n); s.re[0] = 0;
    amps.forEach((a, i) => { if (Array.isArray(a)) { s.re[i] = a[0]; s.im[i] = a[1]; } else s.re[i] = a; });
    return s.normalize();
  }
  norm() { let t = 0; for (let i = 0; i < this.dim; i++) t += this.re[i] ** 2 + this.im[i] ** 2; return Math.sqrt(t); }
  normalize() { const k = 1 / this.norm(); for (let i = 0; i < this.dim; i++) { this.re[i] *= k; this.im[i] *= k; } return this; }
  prob(i) { return this.re[i] ** 2 + this.im[i] ** 2; }
  probs() { const p = new Float64Array(this.dim); for (let i = 0; i < this.dim; i++) p[i] = this.prob(i); return p; }
}

// Тензорное произведение: low — младшие кубиты (индексы 0..low.n-1), high — старшие.
export function tensor(high, low) {
  const n = high.n + low.n, s = new State(n); s.re[0] = 0;
  for (let h = 0; h < high.dim; h++) for (let l = 0; l < low.dim; l++) {
    const k = (h << low.n) | l;
    s.re[k] = high.re[h] * low.re[l] - high.im[h] * low.im[l];
    s.im[k] = high.re[h] * low.im[l] + high.im[h] * low.re[l];
  }
  return s;
}

export function applyMatrix1(st, mat, t, cmask = 0) {
  const tb = 1 << t, N = st.dim, re = st.re, im = st.im;
  const [ar, ai, br, bi, cr, ci, dr, di] = mat;
  for (let i = 0; i < N; i++) {
    if ((i & tb) || (i & cmask) !== cmask) continue;
    const j = i | tb;
    const xr = re[i], xi = im[i], yr = re[j], yi = im[j];
    re[i] = ar * xr - ai * xi + br * yr - bi * yi;
    im[i] = ar * xi + ai * xr + br * yi + bi * yr;
    re[j] = cr * xr - ci * xi + dr * yr - di * yi;
    im[j] = cr * xi + ci * xr + dr * yi + di * yr;
  }
}

export function applySwap(st, a, b, cmask = 0) {
  const ab = 1 << a, bb = 1 << b, N = st.dim;
  for (let i = 0; i < N; i++) {
    if ((i & ab) && !(i & bb) && (i & cmask) === cmask) {
      const j = (i ^ ab) | bb;
      let t = st.re[i]; st.re[i] = st.re[j]; st.re[j] = t;
      t = st.im[i]; st.im[i] = st.im[j]; st.im[j] = t;
    }
  }
}

const cmaskOf = (op) => (op.c || []).reduce((m, q) => m | (1 << q), 0);

// ctx.oracle(op, state) — реализация оракула задачи. Измерения и сброс в этом симуляторе не поддерживаются (см. dm.js).
export function applyOp(st, op, ctx = {}) {
  if (op.g === 'M') return;               // измерение в конце схемы не меняет распределение
  if (op.g === 'RESET') throw new Error('RESET требует матрицу плотности');
  if (op.g === 'ORACLE') {
    if (!ctx.oracle) throw new Error('Оракул не задан');
    ctx.oracle(op, st); return;
  }
  const cm = cmaskOf(op);
  if (op.g === 'SWAP') return applySwap(st, op.t[0], op.t[1], cm);
  applyMatrix1(st, matrixOf(op), op.t[0], cm);
}

export function runOps(ops, n, init, ctx) {
  const st = init ? init.clone() : new State(n);
  for (const op of ops) applyOp(st, op, ctx);
  return st;
}

export const hasNonUnitary = (ops) => {
  let seenMeasure = false;
  for (const op of ops) {
    if (op.g === 'RESET') return true;
    if (op.g === 'M') { seenMeasure = true; continue; }
    if (seenMeasure && op.g !== 'M') return true; // операция после измерения: нужен канал, а не унитарная эволюция
  }
  return false;
};

// ⟨a|b⟩
export function inner(a, b) {
  let r = 0, i = 0;
  for (let k = 0; k < a.dim; k++) {
    r += a.re[k] * b.re[k] + a.im[k] * b.im[k];
    i += a.re[k] * b.im[k] - a.im[k] * b.re[k];
  }
  return { re: r, im: i };
}
export function fidelity(a, b) { const o = inner(a, b); return o.re * o.re + o.im * o.im; }

// Вероятности исходов на подмножестве кубитов (qubits[0] — младший бит результата).
export function marginal(st, qubits) {
  const out = new Float64Array(1 << qubits.length);
  for (let i = 0; i < st.dim; i++) {
    let k = 0;
    for (let b = 0; b < qubits.length; b++) if (i & (1 << qubits[b])) k |= 1 << b;
    out[k] += st.prob(i);
  }
  return out;
}

// Фиделити редуцированного состояния подсистемы Q с чистым состоянием phi на Q (остальные кубиты — «не важно»).
export function subsystemFidelity(st, qubits, phi) {
  const n = st.n, rest = [];
  for (let q = 0; q < n; q++) if (!qubits.includes(q)) rest.push(q);
  let total = 0;
  for (let e = 0; e < (1 << rest.length); e++) {
    let base = 0;
    for (let b = 0; b < rest.length; b++) if (e & (1 << b)) base |= 1 << rest[b];
    let or = 0, oi = 0;
    for (let s = 0; s < (1 << qubits.length); s++) {
      let idx = base;
      for (let b = 0; b < qubits.length; b++) if (s & (1 << b)) idx |= 1 << qubits[b];
      or += phi.re[s] * st.re[idx] + phi.im[s] * st.im[idx];
      oi += phi.re[s] * st.im[idx] - phi.im[s] * st.re[idx];
    }
    total += or * or + oi * oi;
  }
  return total;
}

// Вектор Блоха отдельного кубита: {x,y,z}; длина < 1 означает запутанность с остальными.
export function blochOf(st, q) {
  const b = 1 << q;
  let p00 = 0, p11 = 0, r01 = 0, i01 = 0;
  for (let i = 0; i < st.dim; i++) {
    if (i & b) { p11 += st.prob(i); continue; }
    const j = i | b;
    p00 += st.prob(i);
    r01 += st.re[i] * st.re[j] + st.im[i] * st.im[j];
    i01 += st.im[i] * st.re[j] - st.re[i] * st.im[j];
  }
  return { x: 2 * r01, y: -2 * i01, z: p00 - p11, p1: p11 };
}

// Детерминированный ГПСЧ (mulberry32).
export function rng(seed = 1) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function randomState(n, rand) {
  const s = new State(n);
  for (let i = 0; i < s.dim; i++) {
    const u = Math.max(rand(), 1e-12), v = rand();
    const r = Math.sqrt(-2 * Math.log(u));
    s.re[i] = r * Math.cos(2 * Math.PI * v);
    const u2 = Math.max(rand(), 1e-12), v2 = rand();
    s.im[i] = Math.sqrt(-2 * Math.log(u2)) * Math.cos(2 * Math.PI * v2);
  }
  return s.normalize();
}

// Измерения: counts по базисным исходам.
export function sample(probs, shots, rand) {
  const cum = new Float64Array(probs.length);
  let acc = 0;
  for (let i = 0; i < probs.length; i++) { acc += probs[i]; cum[i] = acc; }
  const counts = new Map();
  for (let s = 0; s < shots; s++) {
    const r = rand() * acc;
    let lo = 0, hi = probs.length - 1;
    while (lo < hi) { const mid = (lo + hi) >> 1; if (cum[mid] < r) lo = mid + 1; else hi = mid; }
    counts.set(lo, (counts.get(lo) || 0) + 1);
  }
  return counts;
}

// Полная унитарная матрица схемы (столбцы — образы базисных состояний). Только для малых n.
export function unitaryColumns(ops, n, ctx) {
  const cols = [];
  for (let k = 0; k < (1 << n); k++) cols.push(runOps(ops, n, State.basis(n, k), ctx));
  return cols;
}

export { GATES };
