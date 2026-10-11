// Матрица плотности: шум, сброс, промежуточные измерения. Только для малых n (≤ 7).
// ρ хранится как вектор состояния 2n кубитов: ρ[i][j] = vec[i + (j << n)].
import { State, applyMatrix1, applySwap } from './sim.js';
import { matrixOf } from './gates.js';

export class Rho {
  constructor(n, vec) { this.n = n; this.vec = vec || new State(2 * n); }
  static fromPure(st) {
    const n = st.n, v = new State(2 * n); v.re[0] = 0;
    for (let i = 0; i < st.dim; i++) for (let j = 0; j < st.dim; j++) {
      const k = i + (j << n);
      v.re[k] = st.re[i] * st.re[j] + st.im[i] * st.im[j];
      v.im[k] = st.im[i] * st.re[j] - st.re[i] * st.im[j];
    }
    return new Rho(n, v);
  }
  trace() { let t = 0; const d = 1 << this.n; for (let i = 0; i < d; i++) t += this.vec.re[i + (i << this.n)]; return t; }
}

const conjMat = (m) => Float64Array.from(m, (v, i) => (i & 1 ? -v : v));

function applyUnitary(rho, op) {
  const n = rho.n, v = rho.vec;
  const cm = (op.c || []).reduce((a, q) => a | (1 << q), 0);
  const cmCol = cm << n;
  if (op.g === 'SWAP') {
    applySwap(v, op.t[0], op.t[1], cm);
    applySwap(v, op.t[0] + n, op.t[1] + n, cmCol);
    return;
  }
  const m = matrixOf(op);
  applyMatrix1(v, m, op.t[0], cm);
  applyMatrix1(v, conjMat(m), op.t[0] + n, cmCol);
}

// Деполяризующий канал на кубите q: ρ → (1−p)ρ + p · (I/2 ⊗ Tr_q ρ)
export function depolarize(rho, q, p) {
  if (p <= 0) return;
  const n = rho.n, v = rho.vec, qb = 1 << q, cb = 1 << (q + n), N = v.dim;
  for (let k = 0; k < N; k++) {
    if ((k & qb) || (k & cb)) continue;       // k: строка и столбец с нулевым q-битом
    const k11 = k | qb | cb, k01 = k | cb, k10 = k | qb;
    const tr_re = v.re[k] + v.re[k11], tr_im = v.im[k] + v.im[k11];
    v.re[k] = (1 - p) * v.re[k] + p * 0.5 * tr_re;
    v.im[k] = (1 - p) * v.im[k] + p * 0.5 * tr_im;
    v.re[k11] = (1 - p) * v.re[k11] + p * 0.5 * tr_re;
    v.im[k11] = (1 - p) * v.im[k11] + p * 0.5 * tr_im;
    v.re[k01] *= (1 - p); v.im[k01] *= (1 - p);
    v.re[k10] *= (1 - p); v.im[k10] *= (1 - p);
  }
}

function dephase(rho, q) {
  const n = rho.n, v = rho.vec, qb = 1 << q, cb = 1 << (q + n);
  for (let k = 0; k < v.dim; k++) {
    if (((k & qb) !== 0) !== ((k & cb) !== 0)) { v.re[k] = 0; v.im[k] = 0; }
  }
}

function resetQubit(rho, q) {
  const n = rho.n, v = rho.vec, qb = 1 << q, cb = 1 << (q + n);
  for (let k = 0; k < v.dim; k++) {
    if ((k & qb) || (k & cb)) continue;
    const k11 = k | qb | cb;
    v.re[k] += v.re[k11]; v.im[k] += v.im[k11];
    v.re[k11] = 0; v.im[k11] = 0; v.re[k | qb] = 0; v.im[k | qb] = 0; v.re[k | cb] = 0; v.im[k | cb] = 0;
  }
}

// noise: ε — ошибка двухкубитного гейта; однокубитные ошибаются в 10 раз реже.
export function runDM(ops, n, init, { noise = 0, ctx = {} } = {}) {
  const rho = Rho.fromPure(init || new State(n));
  for (const op of ops) {
    if (op.g === 'ORACLE') throw new Error('Оракулы не поддерживаются в расчёте с шумом');
    if (op.g === 'M') { dephase(rho, op.t[0]); continue; }
    if (op.g === 'RESET') { resetQubit(rho, op.t[0]); continue; }
    applyUnitary(rho, op);
    if (noise > 0) {
      const qs = [...op.t, ...(op.c || [])];
      const p = qs.length > 1 ? noise : noise / 10;
      for (const q of qs) depolarize(rho, q, p);
    }
  }
  return rho;
}

// ⟨φ|ρ|φ⟩ на подсистеме qubits (остальные кубиты — след).
export function rhoFidelity(rho, qubits, phi) {
  const n = rho.n, v = rho.vec, rest = [];
  for (let q = 0; q < n; q++) if (!qubits.includes(q)) rest.push(q);
  const idxOf = (s, e) => {
    let idx = 0;
    for (let b = 0; b < qubits.length; b++) if (s & (1 << b)) idx |= 1 << qubits[b];
    for (let b = 0; b < rest.length; b++) if (e & (1 << b)) idx |= 1 << rest[b];
    return idx;
  };
  let total = 0;
  const S = 1 << qubits.length;
  for (let e = 0; e < (1 << rest.length); e++) {
    for (let s = 0; s < S; s++) for (let t = 0; t < S; t++) {
      const k = idxOf(s, e) + (idxOf(t, e) << n);
      // conj(φ_s) · ρ_{st} · φ_t
      const ar = phi.re[s], ai = -phi.im[s];
      const rr = v.re[k], ri = v.im[k];
      const br = ar * rr - ai * ri, bi = ar * ri + ai * rr;
      total += br * phi.re[t] - bi * phi.im[t];
    }
  }
  return total;
}

// Вероятности исходов подсистемы по диагонали ρ.
export function rhoMarginal(rho, qubits) {
  const n = rho.n, d = 1 << n, out = new Float64Array(1 << qubits.length);
  for (let i = 0; i < d; i++) {
    let k = 0;
    for (let b = 0; b < qubits.length; b++) if (i & (1 << qubits[b])) k |= 1 << b;
    out[k] += rho.vec.re[i + (i << n)];
  }
  return out;
}
