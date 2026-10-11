// Конструкторы тестовых наборов. Каждый набор — { n, cases: [...] }, случай описывает вход и ожидаемый результат.
//
// case = {
//   label,                       // подпись для вердикта: «вход |00⟩»
//   init: State,                 // полное входное состояние на n кубитах (анциллы уже в |0⟩)
//   expect: { kind: 'state', state, qubits? }            // совпадение с чистым состоянием (на подсистеме qubits)
//         | { kind: 'dist', qubits, probs, tol? }        // распределение измерения подсистемы
//         | { kind: 'prob', qubits, outcome, min?, max? }// вероятность одного исхода
//   group,                       // случаи одной группы обязаны иметь одну общую глобальную фазу (проверка унитарности)
//   oracle(op, state)            // реализация оракула для этого случая (если задача с оракулом)
// }

import { State, tensor, randomState, rng } from '../quantum/sim.js';
import { ket } from '../quantum/format.js';

export const bitsToIndex = (qubits, x) => qubits.reduce((acc, q, i) => acc | (((x >> i) & 1) << q), 0);

function basisOn(n, qubits, x) { return State.basis(n, bitsToIndex(qubits, x)); }

// Случайная суперпозиция на подмножестве кубитов (остальные — |0⟩). Возвращает пару [вход, амплитуды по x].
function superOn(n, qubits, rand) {
  const k = qubits.length, amps = randomState(k, rand);
  const s = new State(n); s.re[0] = 0;
  for (let x = 0; x < (1 << k); x++) { const idx = bitsToIndex(qubits, x); s.re[idx] = amps.re[x]; s.im[idx] = amps.im[x]; }
  return { state: s, amps };
}

// Одно целевое состояние из |0…0⟩ (задачи на подготовку состояния).
export function stateSuite({ n, target, init = null, label, qubits = null }) {
  return { n, cases: [{ label: label || `вход ${ket(0, n)}`, init: init || new State(n), expect: { kind: 'state', state: target, qubits }, main: true }] };
}

// Изометрия, заданная классической функцией: |x⟩ (на qubitsIn, остальные |0⟩) → |g(x)⟩ (полный индекс), с необязательным знаком.
// Проверяются все базисные входы (если их ≤ maxBasis) и несколько случайных суперпозиций с общей глобальной фазой.
export function mapSuite({ n, inQubits, g, sign = () => 1, maxBasis = 64, randoms = 3, seed = 7 }) {
  const rand = rng(seed), K = 1 << inQubits.length, cases = [];
  const expectOf = (amps) => {
    const out = new State(n); out.re[0] = 0;
    for (let x = 0; x < K; x++) {
      const a = amps ? [amps.re[x], amps.im[x]] : [x === amps_x ? 1 : 0, 0];
      const j = g(x), sg = sign(x);
      out.re[j] += sg * a[0]; out.im[j] += sg * a[1];
    }
    return out;
  };
  let amps_x = 0;
  const step = K > maxBasis ? Math.ceil(K / maxBasis) : 1;
  for (let x = 0; x < K; x += step) {
    amps_x = x;
    cases.push({ label: `вход ${ket(bitsToIndex(inQubits, x), n)}`, init: basisOn(n, inQubits, x), expect: { kind: 'state', state: expectOf(null) }, group: 'u' });
  }
  for (let r = 0; r < randoms; r++) {
    const { state, amps } = superOn(n, inQubits, rand);
    cases.push({ label: `произвольный вход ${r + 1}`, init: state, expect: { kind: 'state', state: expectOf(amps) }, group: 'u' });
  }
  return { n, cases };
}

// Булев оракул |x⟩|y⟩ → |x⟩|y ⊕ f(x)⟩. Регистры: вход [0..nIn), цель [nIn], далее анциллы (должны вернуться в |0⟩).
export function xorOracleSuite({ nIn, f, ancillas = 0, extra = {} }) {
  const n = nIn + 1 + ancillas, inQ = Array.from({ length: nIn + 1 }, (_, i) => i);
  const mask = (1 << nIn) - 1;
  return mapSuite({ n, inQubits: inQ, g: (v) => (v & mask) | (((v >> nIn) ^ (f(v & mask) ? 1 : 0)) << nIn), ...extra });
}

// Фазовый оракул |x⟩ → (−1)^{f(x)}|x⟩ на nIn кубитах (+ анциллы).
export function phaseOracleSuite({ nIn, f, ancillas = 0, extra = {} }) {
  const n = nIn + ancillas, inQ = Array.from({ length: nIn }, (_, i) => i);
  return mapSuite({ n, inQubits: inQ, g: (x) => x, sign: (x) => (f(x) ? -1 : 1), ...extra });
}

// Унитарная/изометрическая задача, заданная эталонным действием на состоянии: ref(State) → State.
export function refSuite({ n, inQubits, ref, maxBasis = 32, randoms = 3, seed = 11 }) {
  const rand = rng(seed), K = 1 << inQubits.length, cases = [];
  const step = K > maxBasis ? Math.ceil(K / maxBasis) : 1;
  for (let x = 0; x < K; x += step) {
    const init = basisOn(n, inQubits, x);
    cases.push({ label: `вход ${ket(bitsToIndex(inQubits, x), n)}`, init, expect: { kind: 'state', state: ref(init) }, group: 'u' });
  }
  for (let r = 0; r < randoms; r++) {
    const { state } = superOn(n, inQubits, rand);
    cases.push({ label: `произвольный вход ${r + 1}`, init: state, expect: { kind: 'state', state: ref(state) }, group: 'u' });
  }
  return { n, cases };
}

// Входные состояния на inQubits (базисные + случайные), проверка только подсистемы outQubits (остальные кубиты — «не важно»).
// ref(amps) получает входные амплитуды (State на inQubits.length кубитах) и возвращает ожидаемое State на outQubits.
export function subsystemSuite({ n, inQubits, outQubits, ref, basisMax = 4, randoms = 4, seed = 5 }) {
  const rand = rng(seed), k = inQubits.length, cases = [];
  for (let x = 0; x < (1 << k) && x < basisMax; x++) {
    cases.push({ label: `вход ${ket(bitsToIndex(inQubits, x), n)}`, init: basisOn(n, inQubits, x),
      expect: { kind: 'state', state: ref(State.basis(k, x)), qubits: outQubits } });
  }
  for (let r = 0; r < randoms; r++) {
    const s = superOn(n, inQubits, rand);
    cases.push({ label: `произвольный вход ${r + 1}`, init: s.state, expect: { kind: 'state', state: ref(s.amps), qubits: outQubits } });
  }
  return { n, cases };
}

// Оракулы для задач-«чёрных ящиков».
export function bitOracle(f) { // |x⟩|y⟩ → |x⟩|y ⊕ f(x)⟩; op.t = [x0..x_{k-1}, y]
  return (op, st) => {
    const k = op.t.length - 1, tb = 1 << op.t[k];
    for (let i = 0; i < st.dim; i++) {
      if (i & tb) continue;
      let x = 0;
      for (let b = 0; b < k; b++) if (i & (1 << op.t[b])) x |= 1 << b;
      if (f(x)) {
        const j = i | tb;
        let t = st.re[i]; st.re[i] = st.re[j]; st.re[j] = t;
        t = st.im[i]; st.im[i] = st.im[j]; st.im[j] = t;
      }
    }
  };
}
export function markOracle(w) { // |x⟩ → −|x⟩ при x = w; op.t = [x0..x_{k-1}]
  return (op, st) => {
    for (let i = 0; i < st.dim; i++) {
      let x = 0;
      for (let b = 0; b < op.t.length; b++) if (i & (1 << op.t[b])) x |= 1 << b;
      if (x === w) { st.re[i] = -st.re[i]; st.im[i] = -st.im[i]; }
    }
  };
}

export const zeros = (n) => new State(n);
export { State, tensor, randomState, rng, ket };
