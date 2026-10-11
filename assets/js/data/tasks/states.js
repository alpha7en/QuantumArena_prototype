// Задачи на подготовку состояний (T1), синтез и разложение (T2), измерения (T6).
import { State, rng, randomState, stateSuite, refSuite, subsystemSuite, mapSuite } from '../../judge/builders.js';
import { Circuit } from '../../quantum/circuit.js';
import { runOps } from '../../quantum/sim.js';

const R = Math.SQRT1_2;
const amps = (n, list) => State.fromAmps(n, list);
const head = 'from qiskit import QuantumCircuit\n';
const headPi = 'from qiskit import QuantumCircuit\nfrom math import pi\n';

// Распределение исходов измерения одного кубита в заданном базисе: basis = [(+), (−)] как функции (a, b) → амплитуда.
function basisMeasureSuite(kind) {
  const f0 = { X: (a, b) => [(a[0] + b[0]) * R, (a[1] + b[1]) * R], Y: (a, b) => [(a[0] + b[1]) * R, (a[1] - b[0]) * R] }[kind];
  const f1 = { X: (a, b) => [(a[0] - b[0]) * R, (a[1] - b[1]) * R], Y: (a, b) => [(a[0] - b[1]) * R, (a[1] + b[0]) * R] }[kind];
  const inputs = [['|0⟩', [1, 0], [0, 0]], ['|1⟩', [0, 0], [1, 0]], ['|+⟩', [R, 0], [R, 0]], ['|−⟩', [R, 0], [-R, 0]], ['|+i⟩', [R, 0], [0, R]], ['|−i⟩', [R, 0], [0, -R]]];
  const rand = rng(21);
  for (let i = 0; i < 3; i++) { const s = randomState(1, rand); inputs.push([`случайное состояние ${i + 1}`, [s.re[0], s.im[0]], [s.re[1], s.im[1]]]); }
  const cases = inputs.map(([label, a, b]) => {
    const p0 = f0(a, b)[0] ** 2 + f0(a, b)[1] ** 2, p1 = f1(a, b)[0] ** 2 + f1(a, b)[1] ** 2;
    const init = new State(1); init.re[0] = a[0]; init.im[0] = a[1]; init.re[1] = b[0]; init.im[1] = b[1];
    return { label: `вход ${label}`, init, expect: { kind: 'dist', qubits: [0], probs: Float64Array.of(p0, p1), tol: 1e-6 } };
  });
  return { n: 1, cases };
}

export const statesTasks = [
  {
    id: 'bell', title: 'Состояние Белла |Φ+⟩', topic: 'запутанность', level: 1, archetype: 'T1',
    statement: ['Кубиты должны всегда измеряться одинаково — 00 или 11, с равной вероятностью. Сравнение — с точностью до глобальной фазы.'],
    io: { in: '|00⟩', out: '(|00⟩ + |11⟩) / √2' },
    qubits: 2, limits: { gates: 3, depth: 2, basis: ['H', 'X', 'Z', 'CX'], coupling: { kind: 'line' } },
    suite: () => stateSuite({ n: 2, target: amps(2, [1, 0, 0, 1]) }),
    reference: head + 'qc = QuantumCircuit(2)\nqc.h(0)\nqc.cx(0, 1)\n',
    coach: [
      { title: 'Создайте суперпозицию', text: 'Перетащите H на провод q0 в первый столбец: кубит станет «и 0, и 1» сразу.' },
      { title: 'Запутайте кубиты', text: 'Тащите CX на q1: ⊕ встанет на q1, точка управления — на соседний q0 в том же столбце. Точку потом можно перетащить.' },
    ],
    hint: 'Нужен гейт, создающий суперпозицию на q0, и гейт, который «копирует» её на q1.',
    hint2: 'H на q0, затем CX с управлением q0 и целью q1.',
    analysis: ['H переводит q0 в (|0⟩ + |1⟩)/√2. CX меняет q1 только когда q0 = 1, поэтому исходы 00 и 11 остаются, а 01 и 10 исчезают.',
      'Кубиты запутаны: по одному из них результат второго известен точно, хотя сам результат случаен.'],
  },
  {
    id: 'measure-x', title: 'Измерение в базисе X', topic: 'измерения', level: 2, archetype: 'T6',
    statement: ['Измерение кубита всегда идёт в базисе Z. Нужно «повернуть» кубит так, чтобы исход 0 означал состояние |+⟩, а исход 1 — состояние |−⟩ исходного кубита.',
      'Проверяется распределение исходов на нескольких входных состояниях, включая случайные.'],
    io: { in: '|ψ⟩', out: 'P(0) = |⟨+|ψ⟩|²' },
    qubits: 1, inputLabel: 'ψ', limits: { gates: 2, depth: 2, basis: ['H', 'S', 'S†', 'X', 'Z'] },
    suite: () => basisMeasureSuite('X'),
    reference: head + 'qc = QuantumCircuit(1)\nqc.h(0)\n',
    hint: 'Какой гейт переводит |+⟩ в |0⟩, а |−⟩ в |1⟩?',
    hint2: 'Это Адамар: H|+⟩ = |0⟩, H|−⟩ = |1⟩.',
    analysis: ['H переставляет базисы Z и X. После H вероятность исхода 0 равна |⟨+|ψ⟩|², то есть измерение в базисе Z превращается в измерение в базисе X.'],
  },
  {
    id: 'measure-y', title: 'Измерение в базисе Y', topic: 'измерения', level: 2, archetype: 'T6',
    statement: ['Аналогично измерению в базисе X, но для состояний |+i⟩ и |−i⟩: исход 0 должен означать |+i⟩ = (|0⟩ + i|1⟩)/√2, исход 1 — |−i⟩.'],
    io: { in: '|ψ⟩', out: 'P(0) = |⟨+i|ψ⟩|²' },
    qubits: 1, inputLabel: 'ψ', limits: { gates: 2, depth: 2, basis: ['H', 'S', 'S†', 'X', 'Z'] },
    suite: () => basisMeasureSuite('Y'),
    reference: head + 'qc = QuantumCircuit(1)\nqc.sdg(0)\nqc.h(0)\n',
    hint: 'Сначала сделайте так, чтобы |±i⟩ превратились в |±⟩, затем примените то, что вы делали для базиса X.',
    hint2: 'S† переводит |+i⟩ в |+⟩. Потом H.',
    analysis: ['S† убирает фазу i у |1⟩: |+i⟩ → |+⟩, |−i⟩ → |−⟩. Затем H, как в базисе X.'],
  },
  {
    id: 'cz-kick', title: 'Фазовый откат: CZ из CX', topic: 'фаза', level: 2, archetype: 'T2',
    statement: ['Соберите контролируемый Z (меняет знак только у |11⟩), используя из двухкубитных гейтов только CX.', 'Проверяется преобразование целиком, а не отдельные входы: относительные фазы между входами должны совпасть.'],
    io: { in: '|ab⟩', out: '(−1)^{ab} |ab⟩' },
    qubits: 2, limits: { gates: 3, depth: 3, basis: ['H', 'CX'], coupling: { kind: 'line' } },
    suite: () => mapSuite({ n: 2, inQubits: [0, 1], g: (x) => x, sign: (x) => (x === 3 ? -1 : 1) }),
    reference: head + 'qc = QuantumCircuit(2)\nqc.h(1)\nqc.cx(0, 1)\nqc.h(1)\n',
    hint: 'Z на цели — это X, «повёрнутый» Адамаром. Как получить Z из X?',
    hint2: 'H на цели, CX, снова H на цели: H·X·H = Z.',
    analysis: ['H X H = Z, поэтому CX, обёрнутый Адамарами на цели, превращается в CZ. Это приём фазового отката: фаза «уходит» на управляющий кубит.'],
  },
  {
    id: 'plus-i', title: 'Состояние |+i⟩', topic: 'состояния', level: 1, archetype: 'T1',
    statement: ['Получите состояние (|0⟩ + i|1⟩)/√2: амплитуды равны по модулю, а у |1⟩ есть фаза i.'],
    io: { in: '|0⟩', out: '(|0⟩ + i·|1⟩) / √2' },
    qubits: 1, limits: { gates: 2, depth: 2, basis: ['H', 'X', 'Y', 'Z', 'S', 'S†'] },
    suite: () => stateSuite({ n: 1, target: amps(1, [[R, 0], [0, R]]) }),
    reference: head + 'qc = QuantumCircuit(1)\nqc.h(0)\nqc.s(0)\n',
    hint: 'Суперпозиция с равными вероятностями — это H. Фазу i на |1⟩ даёт один из фазовых гейтов.',
    hint2: 'H, затем S.',
    analysis: ['H даёт (|0⟩ + |1⟩)/√2, S умножает |1⟩ на i.'],
  },
  {
    id: 'minus', title: 'Состояние |−⟩', topic: 'состояния', level: 1, archetype: 'T1',
    statement: ['Получите (|0⟩ − |1⟩)/√2. Вероятности те же, что у |+⟩, но знак у |1⟩ — минус.'],
    io: { in: '|0⟩', out: '(|0⟩ − |1⟩) / √2' },
    qubits: 1, limits: { gates: 2, depth: 2, basis: ['H', 'X', 'Z'] },
    suite: () => stateSuite({ n: 1, target: amps(1, [R, -R]) }),
    reference: head + 'qc = QuantumCircuit(1)\nqc.h(0)\nqc.z(0)\n',
    hint: 'Два пути: сначала перевернуть, потом суперпозиция; или наоборот.',
    hint2: 'H, затем Z (или X, затем H).',
    analysis: ['Z меняет знак у |1⟩, поэтому H затем Z даёт |−⟩. Альтернатива: X, затем H.'],
  },
  {
    id: 'uniform-3', title: 'Равная суперпозиция на трёх кубитах', topic: 'состояния', level: 1, archetype: 'T1',
    statement: ['Получите состояние, в котором все 8 исходов равновероятны и имеют одинаковую фазу. Уложитесь в один слой гейтов.'],
    io: { in: '|000⟩', out: '(|000⟩ + … + |111⟩) / √8' },
    qubits: 3, limits: { gates: 3, depth: 1, basis: ['H', 'X', 'Z'] },
    suite: () => stateSuite({ n: 3, target: amps(3, [1, 1, 1, 1, 1, 1, 1, 1]) }),
    reference: head + 'qc = QuantumCircuit(3)\nqc.h([0, 1, 2])\n',
    hint: 'Гейты на разных кубитах выполняются одновременно — это один слой.',
    hint2: 'H на каждый кубит.',
    analysis: ['H⊗3 даёт все 2³ базисных состояний с амплитудой 1/√8. Три гейта на разных проводах — глубина 1.'],
  },
  {
    id: 'singlet', title: 'Синглет |Ψ−⟩', topic: 'запутанность', level: 2, archetype: 'T1',
    statement: ['Получите состояние (|01⟩ − |10⟩)/√2. В нём кубиты всегда измеряются по-разному, а знак между слагаемыми — минус.'],
    io: { in: '|00⟩', out: '(|01⟩ − |10⟩) / √2' },
    qubits: 2, limits: { gates: 4, depth: 4, basis: ['H', 'X', 'Z', 'CX'], coupling: { kind: 'line' } },
    suite: () => stateSuite({ n: 2, target: amps(2, [0, 1, -1, 0]) }),
    reference: head + 'qc = QuantumCircuit(2)\nqc.h(0)\nqc.cx(0, 1)\nqc.z(0)\nqc.x(1)\n',
    hint: 'Начните с состояния Белла. Затем исправьте знак и сделайте кубиты «противоположными».',
    hint2: 'H, CX, потом Z на q0 и X на q1.',
    analysis: ['H и CX дают (|00⟩ + |11⟩)/√2. Z на q0 меняет знак у |11⟩, X на q1 меняет значение второго кубита: остаётся (|01⟩ − |10⟩)/√2 с точностью до глобальной фазы.'],
  },
  {
    id: 'rot-prep', title: 'Поворот на заданный угол', topic: 'состояния', level: 2, archetype: 'T1',
    statement: ['Получите состояние cos(π/12)·|0⟩ + i·sin(π/12)·|1⟩. Используйте гейты поворотов — угол задаётся в свойствах гейта.'],
    io: { in: '|0⟩', out: '0,966·|0⟩ + i·0,259·|1⟩' },
    qubits: 1, limits: { gates: 2, depth: 2, basis: ['RX', 'RY', 'RZ', 'H', 'X'] },
    suite: () => stateSuite({ n: 1, target: amps(1, [[Math.cos(Math.PI / 12), 0], [0, Math.sin(Math.PI / 12)]]) }),
    reference: headPi + 'qc = QuantumCircuit(1)\nqc.rx(-pi/6, 0)\n',
    hint: 'RX(θ) даёт cos(θ/2)|0⟩ − i·sin(θ/2)|1⟩. Подберите θ.',
    hint2: 'θ = −π/6: знак минус превращает −i в +i.',
    analysis: ['RX(θ)|0⟩ = cos(θ/2)|0⟩ − i·sin(θ/2)|1⟩. Нужна фаза +i, поэтому θ отрицательный: θ = −π/6. Знак i в проверке важен: состояния с +i и −i различаются.'],
  },
  {
    id: 'w3', title: 'W-состояние на трёх кубитах', topic: 'запутанность', level: 2, archetype: 'T1',
    statement: ['Получите (|001⟩ + |010⟩ + |100⟩)/√3: ровно один из трёх кубитов в |1⟩, каждый вариант равновероятен.', 'Здесь пригодятся повороты и управляемые гейты.'],
    io: { in: '|000⟩', out: '(|001⟩ + |010⟩ + |100⟩) / √3' },
    qubits: 3, limits: { gates: 5, depth: 5, basis: ['RY', 'CH', 'CX', 'X'] },
    suite: () => stateSuite({ n: 3, target: amps(3, [0, 1, 1, 0, 1, 0, 0, 0]) }),
    reference: 'from qiskit import QuantumCircuit\nfrom math import acos, sqrt\nqc = QuantumCircuit(3)\nqc.ry(2 * acos(1 / sqrt(3)), 0)\nqc.ch(0, 1)\nqc.cx(1, 2)\nqc.cx(0, 1)\nqc.x(0)\n',
    hint: 'Разделите задачу: сначала «разложите» единицу по трём кубитам с нужными весами, потом сдвиньте результат.',
    hint2: 'RY на q0 так, чтобы амплитуда |0⟩ была 1/√3; затем CH q0→q1, CX q1→q2, CX q0→q1 и X на q0.',
    analysis: ['RY задаёт веса 1/3 и 2/3. Управляемый H делит «двойной» вес пополам. Две цепочки CX и X «разносят» единицу по трём разным кубитам.'],
  },
  {
    id: 'qft-3', title: 'Квантовое преобразование Фурье, 3 кубита', topic: 'QFT', level: 2, archetype: 'T4',
    statement: ['Реализуйте QFT на трёх кубитах: |x⟩ → (1/√8)·Σ_y e^{2πi·xy/8} |y⟩. Нумерация — как в Qiskit: q0 — младший бит числа x.',
      'Проверяется вся унитарная матрица, а не один вход.'],
    io: { in: '|x⟩', out: '(1/√8) Σ e^{2πi·xy/8} |y⟩' },
    qubits: 3, limits: { gates: 7, depth: 7, basis: ['H', 'CP', 'SWAP'] },
    suite: () => refSuite({ n: 3, inQubits: [0, 1, 2], ref: (s) => dft(s) }),
    reference: headPi + 'qc = QuantumCircuit(3)\nqc.h(2)\nqc.cp(pi/2, 1, 2)\nqc.cp(pi/4, 0, 2)\nqc.h(1)\nqc.cp(pi/2, 0, 1)\nqc.h(0)\nqc.swap(0, 2)\n',
    hint: 'QFT строится по одному кубиту: Адамар, затем фазовые повороты, управляемые менее старшими кубитами.',
    hint2: 'Начните со старшего кубита q2: H, CP(π/2) от q1, CP(π/4) от q0. Потом q1, потом q0. В конце SWAP q0↔q2.',
    analysis: ['Каждый кубит получает Адамар и набор управляемых фаз π/2, π/4, … от младших кубитов. SWAP в конце возвращает порядок битов.'],
  },
  {
    id: 'qft-4', title: 'Квантовое преобразование Фурье, 4 кубита', topic: 'QFT', level: 3, archetype: 'T4',
    statement: ['То же преобразование, но на четырёх кубитах: |x⟩ → (1/4)·Σ_y e^{2πi·xy/16} |y⟩. Нужно уложиться в 12 гейтов.'],
    io: { in: '|x⟩', out: '(1/4) Σ e^{2πi·xy/16} |y⟩' },
    qubits: 4, limits: { gates: 12, depth: 12, basis: ['H', 'CP', 'SWAP'] },
    suite: () => refSuite({ n: 4, inQubits: [0, 1, 2, 3], ref: (s) => dft(s) }),
    reference: headPi + 'qc = QuantumCircuit(4)\nfor j in reversed(range(4)):\n    qc.h(j)\n    for k in reversed(range(j)):\n        qc.cp(pi / 2 ** (j - k), k, j)\nqc.swap(0, 3)\nqc.swap(1, 2)\n',
    hint: 'Тот же алгоритм, что для трёх кубитов, плюс один уровень вложенности.',
    hint2: '4 H, 6 CP (π/2, π/4, π/8) и 2 SWAP в конце.',
    analysis: ['Число гейтов растёт как n²/2: n Адамаров, n(n−1)/2 фазовых гейтов и ⌊n/2⌋ обменов.'],
  },
  {
    id: 'swap-cx', title: 'SWAP из трёх CX', topic: 'разложение', level: 1, archetype: 'T2',
    statement: ['Поменяйте местами состояния двух кубитов, используя только CX. Проверяется всё преобразование.'],
    io: { in: '|ab⟩', out: '|ba⟩' },
    qubits: 2, limits: { gates: 3, depth: 3, basis: ['CX'], coupling: { kind: 'line' } },
    suite: () => mapSuite({ n: 2, inQubits: [0, 1], g: (x) => ((x & 1) << 1) | (x >> 1) }),
    reference: head + 'qc = QuantumCircuit(2)\nqc.cx(0, 1)\nqc.cx(1, 0)\nqc.cx(0, 1)\n',
    hint: 'Три CX подряд, направления чередуются.',
    hint2: 'CX 0→1, CX 1→0, CX 0→1.',
    analysis: ['Каждый CX — это XOR на целевой кубит. Три XOR в чередующихся направлениях меняют значения местами: a⊕b, затем b' + "'" + ' = a, затем a' + "'" + ' = b.'],
  },
  {
    id: 'toffoli-ct', title: 'Тоффоли из CNOT и T', topic: 'разложение', level: 2, archetype: 'T2',
    statement: ['Реализуйте гейт Тоффоли (CCX) на трёх кубитах, используя только H, T, T† и CX. Не более 15 гейтов, из них не более 6 двухкубитных.', 'Проверяется вся унитарная матрица с точностью до глобальной фазы.'],
    io: { in: '|abc⟩', out: '|a, b, c ⊕ ab⟩' },
    qubits: 3, limits: { gates: 15, depth: 15, twoQubit: 6, basis: ['H', 'T', 'T†', 'CX'] },
    suite: () => mapSuite({ n: 3, inQubits: [0, 1, 2], g: (x) => ((x & 3) === 3 ? x ^ 4 : x) }),
    reference: head + 'qc = QuantumCircuit(3)\nqc.h(2)\nqc.cx(1, 2)\nqc.tdg(2)\nqc.cx(0, 2)\nqc.t(2)\nqc.cx(1, 2)\nqc.tdg(2)\nqc.cx(0, 2)\nqc.t(1)\nqc.t(2)\nqc.h(2)\nqc.cx(0, 1)\nqc.t(0)\nqc.tdg(1)\nqc.cx(0, 1)\n',
    hint: 'Нужны 6 CX и повороты T. Общая идея: «разложить» фазу e^{iπ/4}-го порядка на цели через управляющие.',
    hint2: 'Стандартное разложение: H на цель; CX, T†, CX, T, CX, T†, CX на цель с чередованием управляющих; затем T на q1 и цель, H и «хвост» CX–T–T†–CX между управляющими.',
    analysis: ['CCX = H·CCZ·H на цели. CCZ раскладывается через T-гейты и 6 CX: фаза e^{iπ/4}^{(a⊕b⊕c)} сочетается так, что остаётся ровно (−1)^{abc}. T-глубина этого решения — 3 слоя.'],
  },
  {
    id: 'ghz3-line', title: 'GHZ на линейной цепочке', topic: 'связность', level: 1, archetype: 'T1',
    statement: ['Три кубита соединены цепочкой: q0 — q1 — q2. Двухкубитный гейт можно ставить только на соседей. Получите (|000⟩ + |111⟩)/√2.'],
    io: { in: '|000⟩', out: '(|000⟩ + |111⟩) / √2' },
    qubits: 3, limits: { gates: 3, depth: 3, basis: ['H', 'X', 'Z', 'CX'], coupling: { kind: 'line' } },
    suite: () => stateSuite({ n: 3, target: amps(3, [1, 0, 0, 0, 0, 0, 0, 1]) }),
    reference: head + 'qc = QuantumCircuit(3)\nqc.h(0)\nqc.cx(0, 1)\nqc.cx(1, 2)\n',
    hint: 'q0 и q2 напрямую не связаны. Запутывайте по цепочке.',
    hint2: 'H на q0, CX q0→q1, затем CX q1→q2.',
    analysis: ['Каждый CX «перекладывает» значение на следующий кубит цепочки. Связность запрещает CX между q0 и q2, но q1 играет роль посредника.'],
  },
  {
    id: 'flip-cx', title: 'Разверни CNOT', topic: 'разложение', level: 2, archetype: 'T2',
    statement: ['В редакторе уже собрана схема из пяти гейтов. Замените её равносильной — не длиннее одного гейта.', 'Схемы равносильны, если совпадают как преобразования (фазы между входами тоже).'],
    io: { in: '|ab⟩', out: 'как у исходной схемы' },
    qubits: 2, starter: 'from qiskit import QuantumCircuit\nqc = QuantumCircuit(2)\nqc.h(0)\nqc.h(1)\nqc.cx(0, 1)\nqc.h(0)\nqc.h(1)\n',
    limits: { gates: 1, depth: 1, basis: ['H', 'CX'] },
    suite: () => mapSuite({ n: 2, inQubits: [0, 1], g: (x) => x ^ (((x >> 1) & 1)) }),
    reference: head + 'qc = QuantumCircuit(2)\nqc.cx(1, 0)\n',
    hint: 'Адамар на обоих кубитах меняет роли управляющего и целевого.',
    hint2: 'H⊗H · CX(0→1) · H⊗H = CX(1→0).',
    analysis: ['Адамар переводит базис Z в базис X, а в нём CX «смотрит» в обратную сторону: управление и цель меняются местами. Поэтому пять гейтов сводятся к одному CX в обратном направлении.'],
  },
  {
    id: 'cry-from-cx', title: 'Управляемый поворот из CX', topic: 'разложение', level: 2, archetype: 'T2',
    statement: ['Реализуйте управляемый поворот RY(π/3) на цели q1 с управлением q0, используя только RY и CX. Нужны не больше двух CX.'],
    io: { in: '|c⟩|t⟩', out: 'RY(π/3) на t, если c = 1' },
    qubits: 2, limits: { gates: 4, depth: 4, twoQubit: 2, basis: ['RY', 'CX'], coupling: { kind: 'line' } },
    suite: () => refSuite({ n: 2, inQubits: [0, 1], ref: (s) => runOps([{ g: 'RY', t: [1], c: [0], p: [Math.PI / 3] }], 2, s) }),
    reference: headPi + 'qc = QuantumCircuit(2)\nqc.ry(pi/6, 1)\nqc.cx(0, 1)\nqc.ry(-pi/6, 1)\nqc.cx(0, 1)\n',
    hint: 'X·RY(θ)·X = RY(−θ). Подберите два поворота так, чтобы без управления они сокращались.',
    hint2: 'RY(π/6), CX, RY(−π/6), CX.',
    analysis: ['Если управление 0, два поворота сокращаются (π/6 − π/6 = 0). Если 1, каждый CX = X на цели, а X·RY(−θ)·X = RY(θ): повороты складываются в RY(π/3).'],
  },
];

// Дискретное преобразование Фурье состояния (независимая от схем проверка QFT).
export function dft(s) {
  const N = s.dim, out = new State(s.n); out.re[0] = 0;
  const k = 1 / Math.sqrt(N);
  for (let y = 0; y < N; y++) {
    let re = 0, im = 0;
    for (let x = 0; x < N; x++) {
      const a = 2 * Math.PI * ((x * y) % N) / N, c = Math.cos(a), sn = Math.sin(a);
      re += c * s.re[x] - sn * s.im[x]; im += c * s.im[x] + sn * s.re[x];
    }
    out.re[y] = re * k; out.im[y] = im * k;
  }
  return out;
}

export { Circuit, subsystemSuite };
