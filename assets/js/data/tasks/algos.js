// Ядра алгоритмов (T4), коды коррекции ошибок и протоколы (T6), задачи с шумом и ограничениями железа (T5).
import { State, stateSuite, refSuite, subsystemSuite, bitOracle, markOracle } from '../../judge/builders.js';
import { ket } from '../../quantum/format.js';

const head = 'from qiskit import QuantumCircuit\n';
const headPi = 'from qiskit import QuantumCircuit\nfrom math import pi\n';
const R = Math.SQRT1_2;
const popcount = (x) => { let c = 0; while (x) { c += x & 1; x >>= 1; } return c; };

const initWith = (n, idx) => State.basis(n, idx);

// Оракульные наборы: у каждого случая свой чёрный ящик.
function groverSuite(n) {
  const cases = [];
  for (let w = 0; w < (1 << n); w++) {
    cases.push({ label: `загадано ${ket(w, n)}`, init: new State(n), oracle: markOracle(w),
      expect: { kind: 'prob', qubits: Array.from({ length: n }, (_, i) => i), outcome: w, min: n === 2 ? 0.99 : 0.9, note: 'Оракул помечает загаданное число — схема должна усилить именно его.' } });
  }
  return { n, cases };
}

function djSuite(n) {
  const fs = [
    ['f(x) = 0', () => 0, true], ['f(x) = 1', () => 1, true],
    ['f(x) = x₀', (x) => x & 1, false], ['f(x) = x₃', (x) => (x >> 3) & 1, false],
    ['f(x) = чётность x', (x) => popcount(x) & 1, false], ['f(x) = x₁ ⊕ x₂', (x) => ((x >> 1) ^ (x >> 2)) & 1, false],
  ];
  const q = Array.from({ length: n }, (_, i) => i);
  return { n: n + 1, cases: fs.map(([label, f, constant]) => ({
    label: `оракул ${label}`, init: initWith(n + 1, 1 << n), oracle: bitOracle(f),
    expect: constant ? { kind: 'prob', qubits: q, outcome: 0, min: 1 - 1e-9, note: 'Оракул константный — на входных кубитах должен быть исход 0…0.' }
      : { kind: 'prob', qubits: q, outcome: 0, max: 1e-9, note: 'Оракул сбалансированный — исход 0…0 невозможен.' },
  })) };
}

function bvSuite(n) {
  const secrets = [0b1011, 0b0110, 0b0001, 0b1111, 0b0000, 0b1000];
  const q = Array.from({ length: n }, (_, i) => i);
  return { n: n + 1, cases: secrets.map((s) => ({
    label: `скрытая строка ${s.toString(2).padStart(n, '0')}`, init: new State(n + 1), oracle: bitOracle((x) => popcount(x & s) & 1),
    expect: { kind: 'prob', qubits: q, outcome: s, min: 1 - 1e-9, note: 'На входных кубитах должна оказаться скрытая строка s.' },
  })) };
}

function swapTestSuite() {
  // Пары однокубитных состояний (a на q1, b на q2); q0 — вспомогательный. P(0) = (1 + |⟨a|b⟩|²) / 2.
  const sts = [[1, 0, 0, 0], [0, 0, 1, 0], [R, 0, R, 0], [R, 0, -R, 0], [R, 0, 0, R], [0.6, 0, 0.8, 0]];
  const pairs = [[0, 0], [0, 1], [2, 3], [2, 4], [0, 2], [5, 2], [5, 5], [4, 3]];
  const cases = pairs.map(([ia, ib]) => {
    const a = sts[ia], b = sts[ib];
    const init = new State(3); init.re[0] = 0;
    for (let x = 0; x < 2; x++) for (let y = 0; y < 2; y++) {
      const ar = a[2 * x], ai = a[2 * x + 1], br = b[2 * y], bi = b[2 * y + 1];
      const k = (x << 1) | (y << 2);
      init.re[k] = ar * br - ai * bi; init.im[k] = ar * bi + ai * br;
    }
    const ov = [(a[0] * b[0] + a[1] * b[1]) + (a[2] * b[2] + a[3] * b[3]), (a[0] * b[1] - a[1] * b[0]) + (a[2] * b[3] - a[3] * b[2])];
    const F = ov[0] ** 2 + ov[1] ** 2;
    return { label: `пара состояний ${ia + 1}–${ib + 1}`, init, expect: { kind: 'dist', qubits: [0], probs: Float64Array.of((1 + F) / 2, (1 - F) / 2), tol: 1e-6 } };
  });
  return { n: 3, cases };
}

// Логические состояния кода Шора: блоки (q0,q1,q2), (q3,q4,q5), (q6,q7,q8).
function shorLogical(bitVal) {
  const s = new State(9); s.re[0] = 0;
  for (let y = 0; y < 512; y++) {
    let ok = true, sign = 1;
    for (let b = 0; b < 3; b++) {
      const blk = (y >> (3 * b)) & 7;
      if (blk === 0) continue;
      if (blk === 7) { if (bitVal) sign = -sign; continue; }
      ok = false; break;
    }
    if (ok) s.re[y] = sign / (2 * Math.SQRT2);
  }
  return s;
}

export const algoTasks = [
  {
    id: 'grover-3', title: 'Поиск в неструктурированной базе (Гровер, 3 кубита)', topic: 'поиск', level: 3, archetype: 'T4',
    statement: ['Оракул помечает одно из 8 чисел (меняет знак его амплитуды), но какое именно — неизвестно. Найдите его с вероятностью не менее 90 %, вызвав оракул не более двух раз.',
      'Оракул подключается гейтом «Оракул» на кубитах q0–q2. Проверка проходит на всех 8 возможных загаданных числах.'],
    io: { in: '|000⟩', out: 'P(w) ≥ 90 %' },
    qubits: 3, oracleArity: 3, limits: { gates: 29, depth: 30, oracleCalls: 2, basis: ['H', 'X', 'Z', 'CZ', 'CCZ'] },
    suite: () => groverSuite(3),
    reference: head + 'qc = QuantumCircuit(3)\nqc.h([0, 1, 2])\nfor _ in range(2):\n    qc.append(oracle, [0, 1, 2])\n    qc.h([0, 1, 2])\n    qc.x([0, 1, 2])\n    qc.ccz(0, 1, 2)\n    qc.x([0, 1, 2])\n    qc.h([0, 1, 2])\n',
    hint: 'Алгоритм Гровера: суперпозиция, затем повторяйте «оракул + диффузия». Для 8 элементов оптимально 2 повторения.',
    hint2: 'Диффузия: H на все, X на все, CCZ, X на все, H на все.',
    analysis: ['Каждое повторение поворачивает вектор состояния к загаданному числу на угол 2·arcsin(1/√8) ≈ 41°. После двух повторений вероятность ≈ 94,5 %. Третье повторение «перекрутит» и вероятность упадёт.'],
  },
  {
    id: 'grover-2', title: 'Гровер на двух кубитах', topic: 'поиск', level: 2, archetype: 'T4',
    statement: ['Оракул помечает одно из 4 чисел. Для N = 4 достаточно одного вызова: найдите загаданное число с вероятностью не менее 99 %.'],
    io: { in: '|00⟩', out: 'P(w) ≥ 99 %' },
    qubits: 2, oracleArity: 2, limits: { gates: 11, depth: 11, oracleCalls: 1, basis: ['H', 'X', 'Z', 'CZ'] },
    suite: () => groverSuite(2),
    reference: head + 'qc = QuantumCircuit(2)\nqc.h([0, 1])\nqc.append(oracle, [0, 1])\nqc.h([0, 1])\nqc.x([0, 1])\nqc.cz(0, 1)\nqc.x([0, 1])\nqc.h([0, 1])\n',
    hint: 'Суперпозиция → оракул → диффузия. Для четырёх элементов одной итерации хватает ровно.',
    hint2: 'H, оракул, H, X, CZ, X, H на обоих кубитах.',
    analysis: ['При N = 4 угол поворота после одной итерации ровно 90°: вероятность найти загаданное число равна 100 %.'],
  },
  {
    id: 'dj-4', title: 'Дойч — Йожа на 4 кубитах', topic: 'алгоритмы', level: 2, archetype: 'T4',
    statement: ['Оракул задаёт функцию от четырёх битов: она либо константна, либо сбалансирована. Соберите схему, которая отличает одно от другого за один вызов оракула.',
      'Кубит q4 начинает в |1⟩. Если f константна, на q0–q3 должен получиться исход 0000; иначе — любой другой.'],
    io: { in: '|0000⟩|1⟩', out: '|0000⟩, если f константна' },
    qubits: 5, oracleArity: 5, wires: ['x0', 'x1', 'x2', 'x3', 'y'], initBits: [0, 0, 0, 0, 1],
    limits: { gates: 9, depth: 3, oracleCalls: 1, basis: ['H', 'X', 'Z'] },
    suite: () => djSuite(4),
    reference: head + 'qc = QuantumCircuit(5)\nqc.h(range(5))\nqc.append(oracle, [0, 1, 2, 3, 4])\nqc.h(range(4))\n',
    hint: 'Нужна суперпозиция по всем входам и «фазовая» цель |−⟩. Тогда оракул превращается в фазу (−1)^{f(x)}.',
    hint2: 'H на все пять кубитов, оракул, H на q0–q3.',
    analysis: ['Цель в |−⟩ превращает XOR-оракул в фазовый (фазовый откат). Для константной f фаза общая, и второй слой H возвращает всё в 0000; для сбалансированной амплитуда |0000⟩ ровно сокращается.'],
  },
  {
    id: 'bv-4', title: 'Бернштейн — Вазирани на 4 кубитах', topic: 'алгоритмы', level: 2, archetype: 'T4',
    statement: ['Оракул вычисляет f(x) = s·x mod 2 для скрытой строки s из четырёх битов. За один вызов оракула получите s на кубитах q0–q3.', 'В отличие от задачи про Дойча — Йожа, здесь все кубиты, включая q4, начинают в |0⟩.'],
    io: { in: '|00000⟩', out: '|s⟩ на q0–q3' },
    qubits: 5, oracleArity: 5, wires: ['x0', 'x1', 'x2', 'x3', 'y'],
    limits: { gates: 10, depth: 4, oracleCalls: 1, basis: ['H', 'X', 'Z'] },
    suite: () => bvSuite(4),
    reference: head + 'qc = QuantumCircuit(5)\nqc.x(4)\nqc.h(range(5))\nqc.append(oracle, [0, 1, 2, 3, 4])\nqc.h(range(4))\n',
    hint: 'Тот же приём, что в Дойче — Йожа, но |−⟩ на цели придётся приготовить самим.',
    hint2: 'X на q4, H на все, оракул, H на q0–q3.',
    analysis: ['Фазовый откат даёт (−1)^{s·x} на каждом x. Преобразование Адамара превращает такую фазу в базисное состояние |s⟩: все 16 слагаемых складываются конструктивно только при совпадении с s.'],
  },
  {
    id: 'teleport', title: 'Протокол телепортации неизвестного состояния', topic: 'телепортация', level: 2, archetype: 'T6',
    statement: ['Кубит q0 хранит неизвестное состояние |ψ⟩, кубиты q1 и q2 в |0⟩. Передайте |ψ⟩ на q2.',
      'Измерений в этой версии нет: классическая коррекция заменена управляемыми гейтами (принцип отложенного измерения). Состояние q0 и q1 после протокола не проверяется.'],
    io: { in: '|ψ⟩|0⟩|0⟩', out: 'q2 в состоянии |ψ⟩' },
    qubits: 3, inputLabel: 'ψ', limits: { gates: 6, depth: 6, basis: ['H', 'X', 'Z', 'CX', 'CZ'] },
    suite: () => subsystemSuite({ n: 3, inQubits: [0], outQubits: [2], ref: (a) => a }),
    reference: head + 'qc = QuantumCircuit(3)\nqc.h(1)\nqc.cx(1, 2)\nqc.cx(0, 1)\nqc.h(0)\nqc.cx(1, 2)\nqc.cz(0, 2)\n',
    hint: 'Сначала создайте запутанную пару q1–q2. Затем «измерьте» q0 вместе с q1 в базисе Белла и исправьте q2.',
    hint2: 'H q1, CX q1→q2 — пара Белла. CX q0→q1, H q0 — измерение в базисе Белла. CX q1→q2 и CZ q0→q2 — коррекция.',
    analysis: ['Пара Белла связывает q1 и q2. Базис Белла на q0, q1 «переносит» информацию о ψ на классические биты, а коррекция X (по q1) и Z (по q0) на q2 восстанавливает ψ. Без классической связи телепортация невозможна — здесь она заменена управляемыми гейтами.'],
  },
  {
    id: 'noisy-bell', title: 'Состояние Белла в шумном канале', topic: 'шум', level: 2, archetype: 'T5',
    statement: ['Снова состояние Белла, но каждый двухкубитный гейт вносит ошибку 5 %. Лимит по гейтам щедрый, но лишние гейты стоят точности: итоговая точность не должна быть ниже эталонной больше чем на 2 п.п.',
      'Разные схемы дают одно и то же идеальное состояние — шум показывает, какая экономнее.'],
    io: { in: '|00⟩', out: '(|00⟩ + |11⟩) / √2' },
    qubits: 2, noise: { eps: 0.05, slack: 0.02 }, limits: { gates: 7, depth: 6, basis: ['H', 'X', 'Z', 'CX'], coupling: { kind: 'line' } },
    suite: () => stateSuite({ n: 2, target: State.fromAmps(2, [1, 0, 0, 1]) }),
    reference: head + 'qc = QuantumCircuit(2)\nqc.h(0)\nqc.cx(0, 1)\n',
    hint: 'Пара CX подряд — тождество, но каждый из них добавляет ошибку.',
    hint2: 'Минимальная схема — H и один CX.',
    analysis: ['Деполяризующий шум на двухкубитном гейте сильнее, чем на однокубитном. Любые «взаимно сокращающиеся» гейты в реальном железе не бесплатны.'],
  },
  {
    id: 'swap-test', title: 'Swap-тест', topic: 'алгоритмы', level: 3, archetype: 'T4',
    statement: ['Даны два однокубитных состояния |a⟩ (q1) и |b⟩ (q2) и вспомогательный кубит q0 в |0⟩. Соберите схему, в которой вероятность исхода 0 на q0 равна (1 + |⟨a|b⟩|²) / 2.', 'Проверяется распределение на q0 для восьми пар состояний, включая одинаковые и ортогональные.'],
    io: { in: '|0⟩|a⟩|b⟩', out: 'P(0) = (1 + |⟨a|b⟩|²) / 2' },
    qubits: 3, inputLabel: 'ψ', wires: ['anc', 'a', 'b'], limits: { gates: 3, depth: 3, basis: ['H', 'CSWAP', 'X', 'Z'] },
    suite: () => swapTestSuite(),
    reference: head + 'qc = QuantumCircuit(3)\nqc.h(0)\nqc.cswap(0, 1, 2)\nqc.h(0)\n',
    hint: 'Нужно обменять |a⟩ и |b⟩ «в суперпозиции» по q0, а затем «прочитать» интерференцию.',
    hint2: 'H на q0, управляемый SWAP (CSWAP) от q0 на q1 и q2, снова H на q0.',
    analysis: ['Если состояния равны, обмен ничего не меняет и q0 вернётся в |0⟩. Если ортогональны — интерференция даёт 50/50. Отсюда P(0) = (1 + |⟨a|b⟩|²)/2.'],
  },
  {
    id: 'qpe-t', title: 'Оценка фазы для T-гейта, 3 кубита', topic: 'алгоритмы', level: 3, archetype: 'T4',
    statement: ['Кубит q3 начинает в |1⟩ — это собственное состояние гейта T с собственным значением e^{2πi·φ}, φ = 1/8. Три кубита q0–q2 — счётный регистр.',
      'Постройте оценку фазы: после схемы на q0–q2 должно с вероятностью 1 получиться число 1 (в двоичном виде 001, q0 — младший бит), то есть φ·8. Управляемые степени T — это CP(π/4), CP(π/2), CP(π).'],
    io: { in: '|000⟩|1⟩', out: '|001⟩ на счётных кубитах' },
    qubits: 4, wires: ['c0', 'c1', 'c2', 'ψ'], initBits: [0, 0, 0, 1], limits: { gates: 13, depth: 13, basis: ['H', 'CP', 'CZ', 'SWAP'] },
    suite: () => ({ n: 4, cases: [{ label: 'вход |0001⟩ → |1⟩ на q3', init: State.basis(4, 8), main: true, expect: { kind: 'prob', qubits: [0, 1, 2], outcome: 1, min: 1 - 1e-9, note: 'Счётный регистр должен дать 001 (φ = 1/8).' } }] }),
    reference: headPi + 'qc = QuantumCircuit(4)\nqc.h([0, 1, 2])\nqc.cp(pi / 4, 0, 3)\nqc.cp(pi / 2, 1, 3)\nqc.cp(pi, 2, 3)\nqc.swap(0, 2)\nqc.h(0)\nqc.cp(-pi / 2, 0, 1)\nqc.h(1)\nqc.cp(-pi / 4, 0, 2)\nqc.cp(-pi / 2, 1, 2)\nqc.h(2)\n',
    hint: 'Три шага: суперпозиция на счётных кубитах, управляемые степени T, обратное QFT.',
    hint2: 'H на q0–q2; CP(π/4) q0→q3, CP(π/2) q1→q3, CP(π) q2→q3; затем обратное QFT на q0–q2.',
    analysis: ['Счётный регистр накапливает фазу e^{2πi·φ·x} на каждом базисном x. Обратное QFT превращает её в число 8φ = 1. Если фаза не кратна 1/8, результат размазывается: тогда нужны ещё кубиты.'],
  },
  {
    id: 'shor-encode', title: 'Код Шора на 9 кубитах', topic: 'коррекция ошибок', level: 3, archetype: 'T6',
    statement: ['Закодируйте один кубит в код Шора. Данные на q0, остальные восемь кубитов в |0⟩. Нужное отображение:', '|0⟩ → (|000⟩ + |111⟩)^{⊗3} / (2√2),  |1⟩ → (|000⟩ − |111⟩)^{⊗3} / (2√2); блоки: (q0,q1,q2), (q3,q4,q5), (q6,q7,q8).', 'Проверяется на базисных и случайных входных состояниях.'],
    io: { in: '(α|0⟩ + β|1⟩)|0…0⟩', out: 'α|0_L⟩ + β|1_L⟩' },
    qubits: 9, inputLabel: 'ψ', limits: { gates: 11, depth: 6, basis: ['H', 'CX'] },
    suite: () => refSuite({ n: 9, inQubits: [0], randoms: 3, ref: (s) => {
      const a = shorLogical(0), b = shorLogical(1), o = new State(9); o.re[0] = 0;
      const al = [s.re[0], s.im[0]], be = [s.re[1], s.im[1]];
      for (let y = 0; y < 512; y++) {
        o.re[y] = al[0] * a.re[y] + be[0] * b.re[y]; o.im[y] = al[1] * a.re[y] + be[1] * b.re[y];
      }
      return o;
    } }),
    reference: head + 'qc = QuantumCircuit(9)\nqc.cx(0, 3)\nqc.cx(0, 6)\nqc.h([0, 3, 6])\nfor b in [0, 3, 6]:\n    qc.cx(b, b + 1)\n    qc.cx(b, b + 2)\n',
    hint: 'Код Шора — это конкатенация двух кодов: повторения по знаку (3 блока) и повторения по фазе (внутри блока).',
    hint2: 'CX q0→q3, CX q0→q6; H на q0, q3, q6; затем в каждом блоке CX от первого кубита ко второму и третьему.',
    analysis: ['Внешний код (CX + H) защищает от ошибок фазы, внутренний (CX внутри блока) — от переворотов бита. Вместе они исправляют любую однокубитную ошибку.'],
  },
  {
    id: 'ghz-chain-n', title: 'GHZ на цепочке из n кубитов', topic: 'связность', level: 3, archetype: 'T5',
    statement: ['Даны n кубитов (2 ≤ n ≤ 12) в |0…0⟩, соединённые в цепочку q₀ – q₁ – … – q_{n−1}. Двухкубитные гейты разрешены только между соседями. Получите (|0…0⟩ + |1…1⟩)/√2 при глубине не более ⌈n/2⌉ + 1.',
      'Наивная цепочка CX слева направо даёт глубину n и не пройдёт. Нужно начать из середины и распространять запутанность в обе стороны.',
      'Схема строится кодом: `def solve(n) -> QuantumCircuit`. Проверяется для нескольких n.'],
    io: { in: '|0…0⟩', out: '(|0…0⟩ + |1…1⟩) / √2' },
    params: { name: 'n', values: [2, 3, 4, 5, 8, 12], default: 5 },
    qubits: null, limits: (n) => ({ gates: n, depth: Math.ceil(n / 2) + 1, basis: ['H', 'CX'], coupling: { kind: 'line' }, maxQubits: n }),
    suite: (n) => stateSuite({ n, target: (() => { const t = new State(n); t.re[0] = R; t.re[(1 << n) - 1] += R; return t; })() }),
    reference: head + 'def solve(n):\n    qc = QuantumCircuit(n)\n    m = n // 2\n    qc.h(m)\n    for i in range(m, 0, -1):\n        qc.cx(i, i - 1)\n    for i in range(m, n - 1):\n        qc.cx(i, i + 1)\n    return qc\n',
    hint: 'Запутанность можно распространять от любого кубита, не только от q0. Откуда выгоднее начать?',
    hint2: 'H на кубите n // 2, затем CX в обе стороны от него: влево до q0 и вправо до q_{n−1}.',
    analysis: ['Из середины цепочки запутанность идёт в обе стороны одновременно: глубина ≈ n/2 вместо n. Поэтому лимит глубины ⌈n/2⌉ + 1 достижим, а наивная схема — нет.'],
  },
];
