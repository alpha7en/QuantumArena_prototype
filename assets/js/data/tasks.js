// Банк задач: единый список, порядок и вспомогательные функции.
import { statesTasks } from './tasks/states.js';
import { oracleTasks } from './tasks/oracles.js';
import { algoTasks } from './tasks/algos.js';

const byId = Object.fromEntries([...statesTasks, ...oracleTasks, ...algoTasks].map((t) => [t.id, t]));

// Порядок в банке: начинается с того, что показано в дизайне, дальше — по нарастанию сложности.
const ORDER = [
  'bell', 'half-adder', 'measure-x', 'grover-3', 'cz-kick', 'qft-4', 'teleport', 'noisy-bell', 'parity', 'syndrome',
  'swap-cx', 'toffoli-ct', 'w3', 'ghz3-line', 'plus-i', 'minus', 'uniform-3', 'copy-bit', 'and-oracle', 'singlet',
  'rot-prep', 'compare-bits', 'maj-oracle', 'full-adder', 'add-mod4', 'measure-y', 'rep-encode', 'qft-3', 'grover-2',
  'dj-4', 'bv-4', 'swap-test', 'equal-regs', 'qpe-t', 'shor-encode', 'ghz-chain-n', 'even-nonzero',
  'parity-phase', 'increment', 'flip-cx', 'cry-from-cx', 'chsh', 'bitflip-fix',
];

export const TASKS = ORDER.map((id, i) => {
  const t = byId[id];
  if (!t) throw new Error('Нет задачи ' + id);
  const n = typeof t.qubits === 'number' ? t.qubits : null;
  let wireInit = t.wireInit;
  if (!wireInit && t.initBits) wireInit = t.initBits.map(String);
  if (!wireInit && n) { wireInit = Array(n).fill('0'); if (t.inputLabel) wireInit[0] = t.inputLabel; }
  return Object.assign(t, { num: i + 1, wireInit, wireNames: t.wires || null, codeOnly: n === null });
});

if (TASKS.length !== Object.keys(byId).length) throw new Error('В банке есть задачи вне ORDER');

export const taskById = (id) => TASKS.find((t) => t.id === id) || null;
export const taskByNum = (n) => TASKS.find((t) => t.num === Number(n)) || null;

export const LEVELS = { 1: 'лёгкая', 2: 'средняя', 3: 'сложная' };
export const TOPICS = [...new Set(TASKS.map((t) => t.topic))].sort((a, b) => a.localeCompare(b, 'ru'));
export const ARCHETYPES = {
  T1: 'Подготовка состояния', T2: 'Синтез преобразования', T3: 'Оракул с очисткой',
  T4: 'Ядро алгоритма', T5: 'Ограничения железа', T6: 'Измерения и коррекция',
};

export const limitsFor = (task, param) => (typeof task.limits === 'function' ? task.limits(param) : task.limits) || {};

// Разбор имени тайла палитры: «CCX» → { g: 'X', nc: 2 }.
export function parseTile(name) {
  const m = /^(MC|C{1,2})?(H|X|Y|Z|S†|S|T†|T|√X|P|RX|RY|RZ|SWAP)$/.exec(name);
  if (!m) return null;
  const pre = m[1] || '';
  const nc = pre === 'MC' ? 3 : pre.length;
  const g = { 'S†': 'SDG', 'T†': 'TDG', '√X': 'SX' }[m[2]] || m[2];
  return { name, g, nc };
}
