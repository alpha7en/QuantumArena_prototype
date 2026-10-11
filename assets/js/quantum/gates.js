// Каталог гейтов. Матрицы 2×2 хранятся как Float64Array(8): [re00, im00, re01, im01, re10, im10, re11, im11].
// Порядок кубитов — как в Qiskit: бит k индекса базисного состояния = кубит k (little-endian).

const S = Math.SQRT1_2;
const m = (...a) => Float64Array.from(a);

export const GATES = {
  H:   { targets: 1, params: 0, label: 'H',   q: 'h',   ru: 'Адамар: |0⟩ → (|0⟩+|1⟩)/√2, |1⟩ → (|0⟩−|1⟩)/√2. Создаёт суперпозицию.',
         mat: () => m(S, 0, S, 0, S, 0, -S, 0) },
  X:   { targets: 1, params: 0, label: 'X',   q: 'x',   ru: 'Переворачивает кубит: |0⟩ ↔ |1⟩.',
         mat: () => m(0, 0, 1, 0, 1, 0, 0, 0) },
  Y:   { targets: 1, params: 0, label: 'Y',   q: 'y',   ru: 'Переворот с фазой: |0⟩ → i|1⟩, |1⟩ → −i|0⟩.',
         mat: () => m(0, 0, 0, -1, 0, 1, 0, 0) },
  Z:   { targets: 1, params: 0, label: 'Z',   q: 'z',   ru: 'Меняет знак |1⟩: |1⟩ → −|1⟩.',
         mat: () => m(1, 0, 0, 0, 0, 0, -1, 0) },
  S:   { targets: 1, params: 0, label: 'S',   q: 's',   ru: 'Фаза π/2 на |1⟩: |1⟩ → i|1⟩.',
         mat: () => m(1, 0, 0, 0, 0, 0, 0, 1) },
  SDG: { targets: 1, params: 0, label: 'S†',  q: 'sdg', ru: 'Обратный к S: |1⟩ → −i|1⟩.',
         mat: () => m(1, 0, 0, 0, 0, 0, 0, -1) },
  T:   { targets: 1, params: 0, label: 'T',   q: 't',   ru: 'Фаза π/4 на |1⟩.',
         mat: () => m(1, 0, 0, 0, 0, 0, S, S) },
  TDG: { targets: 1, params: 0, label: 'T†',  q: 'tdg', ru: 'Обратный к T: фаза −π/4 на |1⟩.',
         mat: () => m(1, 0, 0, 0, 0, 0, S, -S) },
  SX:  { targets: 1, params: 0, label: '√X',  q: 'sx',  ru: 'Корень из X: половина переворота.',
         mat: () => m(0.5, 0.5, 0.5, -0.5, 0.5, -0.5, 0.5, 0.5) },
  P:   { targets: 1, params: 1, label: 'P',   q: 'p',   ru: 'Фаза θ на |1⟩: |1⟩ → e^{iθ}|1⟩.',
         mat: ([t]) => m(1, 0, 0, 0, 0, 0, Math.cos(t), Math.sin(t)) },
  RX:  { targets: 1, params: 1, label: 'RX',  q: 'rx',  ru: 'Поворот вокруг оси X на угол θ.',
         mat: ([t]) => m(Math.cos(t / 2), 0, 0, -Math.sin(t / 2), 0, -Math.sin(t / 2), Math.cos(t / 2), 0) },
  RY:  { targets: 1, params: 1, label: 'RY',  q: 'ry',  ru: 'Поворот вокруг оси Y на угол θ: меняет вероятности, фаз не добавляет.',
         mat: ([t]) => m(Math.cos(t / 2), 0, -Math.sin(t / 2), 0, Math.sin(t / 2), 0, Math.cos(t / 2), 0) },
  RZ:  { targets: 1, params: 1, label: 'RZ',  q: 'rz',  ru: 'Поворот вокруг оси Z на угол θ: фаза между |0⟩ и |1⟩.',
         mat: ([t]) => m(Math.cos(t / 2), -Math.sin(t / 2), 0, 0, 0, 0, Math.cos(t / 2), Math.sin(t / 2)) },
  SWAP: { targets: 2, params: 0, label: 'SWAP', q: 'swap', ru: 'Меняет местами состояния двух кубитов.', mat: null },
};

// Служебные операции (не гейты).
export const SPECIAL = {
  M:      { label: 'M',   ru: 'Измерение кубита.' },
  RESET:  { label: '|0⟩', ru: 'Сброс кубита в |0⟩.' },
  ORACLE: { label: 'O',   ru: 'Оракул задачи: чёрный ящик, заданный условием.' },
};

export const isGate = (name) => name in GATES;

// Короткое имя операции с учётом управляющих кубитов: X + 1 управление = CX, + 2 = CCX, ...
export function displayName(op) {
  if (op.g in SPECIAL) return SPECIAL[op.g].label;
  const base = GATES[op.g].label;
  const nc = op.c ? op.c.length : 0;
  if (nc === 0) return base;
  if (op.g === 'X' && nc === 2) return 'CCX';
  if (op.g === 'Z' && nc === 2) return 'CCZ';
  if (nc >= 3) return 'MC' + base;
  return 'C'.repeat(nc) + base;
}

// Имя для проверки базиса задачи: базис задаётся строками вида "H", "CX", "CCX", "CZ", "CP", "SWAP", "RY".
export const basisName = (op) => displayName(op);

export function matrixOf(op) {
  const def = GATES[op.g];
  return def.mat ? def.mat(op.p || []) : null;
}

export function inverseOp(op) {
  const inv = { S: 'SDG', SDG: 'S', T: 'TDG', TDG: 'T', SX: null };
  if (op.g in inv && inv[op.g]) return { ...op, g: inv[op.g] };
  if (['P', 'RX', 'RY', 'RZ'].includes(op.g)) return { ...op, p: [-op.p[0]] };
  if (op.g === 'SX') return { ...op, g: 'RX', p: [-Math.PI / 2] }; // с точностью до глобальной фазы
  return { ...op };
}

// Пояснение к операции на русском, для режима «по шагам».
export function describeOp(op, qn = (i) => 'q' + i) {
  const name = displayName(op);
  const t = op.t.map(qn).join(', ');
  const c = (op.c || []).map(qn);
  if (op.g === 'M') return { title: `M на ${t}`, text: 'Измерение: кубит схлопывается в 0 или 1.' };
  if (op.g === 'RESET') return { title: `|0⟩ на ${t}`, text: 'Сброс кубита в |0⟩.' };
  if (op.g === 'ORACLE') return { title: `Оракул на ${op.t.map(qn).join(', ')}`, text: 'Чёрный ящик задачи.' };
  if (c.length === 0) {
    const extra = {
      H: `${t} в суперпозиции: 50 % |0⟩ и 50 % |1⟩`,
      X: `${t} переворачивается: |0⟩ ↔ |1⟩`,
      Z: `${t}: знак |1⟩ меняется на противоположный`,
      Y: `${t}: переворот с фазой`,
      S: `${t}: фаза π/2 на |1⟩`, T: `${t}: фаза π/4 на |1⟩`,
    }[op.g] || GATES[op.g].ru;
    return { title: `${name} на ${t}`, text: extra };
  }
  if (op.g === 'X' && c.length === 1) return { title: `CX ${c[0]} → ${t}`, text: `${t} повторяет ${c[0]}: исходы 00 и 11 — запутанность, если ${c[0]} в суперпозиции` };
  if (op.g === 'X' && c.length === 2) return { title: `CCX ${c.join(', ')} → ${t}`, text: `${t} переворачивается, только если ${c[0]} = ${c[1]} = 1` };
  if (op.g === 'Z' && c.length === 1) return { title: `CZ ${c[0]} — ${t}`, text: `Фаза −1, только если оба кубита в |1⟩` };
  return { title: `${name} ${c.join(', ')} → ${t}`, text: `${GATES[op.g].ru} Выполняется, только если управляющие кубиты (${c.join(', ')}) в |1⟩.` };
}
