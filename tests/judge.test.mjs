import test from 'node:test';
import assert from 'node:assert/strict';
import { taskById } from '../assets/js/data/tasks.js';
import { judge } from '../assets/js/judge/judge.js';
import { buildFromCode } from '../assets/js/lang/qiskitlite.js';

const H = 'from qiskit import QuantumCircuit\nfrom math import pi\n';
const run = (id, code, opts = {}) => {
  const t = taskById(id);
  return judge(t, (p) => buildFromCode(code, { oracleArity: t.oracleArity || 0, fnArgs: p !== undefined ? [p] : [] }), opts);
};

test('Белл с лишним Z — неверный ответ', () => {
  const r = run('bell', H + 'qc = QuantumCircuit(2)\nqc.h(0)\nqc.cx(0, 1)\nqc.z(0)\n');
  assert.equal(r.verdict, 'wa');
  assert.equal(r.fail.index, 0);
  assert.match(r.fail.got, /−/);
});

test('Белл: связность q0—q1 соблюдена, глубина 3 → лимит', () => {
  const r = run('bell', H + 'qc = QuantumCircuit(2)\nqc.h(0)\nqc.x(1)\nqc.x(1)\nqc.cx(0, 1)\n');
  assert.equal(r.verdict, 'limit');
  assert.ok(r.limit.issues.some((i) => i.kind === 'gates'));
});

test('Белл с неверным ответом приоритетнее лимита', () => {
  const r = run('bell', H + 'qc = QuantumCircuit(2)\nqc.x(0)\nqc.x(1)\nqc.x(1)\nqc.cx(0, 1)\n');
  assert.equal(r.verdict, 'wa');
});

test('CZ: одиночный CX не проходит (фаза), с H — проходит', () => {
  assert.equal(run('cz-kick', H + 'qc = QuantumCircuit(2)\nqc.cx(0, 1)\n').verdict, 'wa');
  assert.equal(run('cz-kick', H + 'qc = QuantumCircuit(2)\nqc.h(1)\nqc.cx(0, 1)\nqc.h(1)\n').verdict, 'ok');
});

test('Общая глобальная фаза допускается (S·S = Z)', () => {
  const r = run('cz-kick', H + 'qc = QuantumCircuit(2)\nqc.cp(pi, 0, 1)\n');
  assert.equal(r.verdict, 'limit'); // CZ вне базиса {H, CX}, но состояние верное
  assert.equal(r.steps[0].status, 'ok');
});

test('equal-regs: без развычисления — неверно', () => {
  const r = run('equal-regs', H + 'qc = QuantumCircuit(4)\nqc.cx(0, 2)\nqc.cx(1, 3)\nqc.x([2, 3])\nqc.cz(2, 3)\nqc.x([2, 3])\n');
  assert.equal(r.verdict, 'wa');
});

test('even-nonzero: мусор в анцилле ловится', () => {
  const code = H + 'def solve(n):\n    qc = QuantumCircuit(n + 2)\n    for i in range(n):\n        qc.cx(i, n + 1)\n    qc.x(n + 1)\n    qc.cx(n + 1, n)\n    for i in range(n):\n        qc.x(i)\n    qc.mcx(list(range(n)), n)\n    for i in range(n):\n        qc.x(i)\n    return qc\n';
  const r = run('even-nonzero', code);
  assert.equal(r.verdict, 'wa');
  assert.match(r.fail.note || '', /вспомогательные кубиты/);
});

test('QFT: только H — неверно', () => {
  assert.equal(run('qft-3', H + 'qc = QuantumCircuit(3)\nqc.h([0, 1, 2])\n').verdict, 'wa');
});

test('noisy-bell: лишние CX проигрывают по шуму', () => {
  const r = run('noisy-bell', H + 'qc = QuantumCircuit(2)\nqc.h(0)\nqc.cx(0, 1)\nqc.cx(0, 1)\nqc.cx(0, 1)\n');
  assert.equal(r.verdict, 'noise');
  assert.equal(r.steps[1].status, 'fail');
});

test('ghz-chain-n: наивная цепочка нарушает глубину', () => {
  const naive = H + 'def solve(n):\n    qc = QuantumCircuit(n)\n    qc.h(0)\n    for i in range(n - 1):\n        qc.cx(i, i + 1)\n    return qc\n';
  const r = run('ghz-chain-n', naive);
  assert.equal(r.verdict, 'limit');
  assert.equal(r.limit.issues[0].kind, 'depth');
});

test('Дойч — Йожа: 8 гейтов H вместо 9 — неверно', () => {
  const r = run('dj-4', H + 'qc = QuantumCircuit(5)\nqc.h([0, 1, 2, 3])\nqc.append(oracle, [0, 1, 2, 3, 4])\nqc.h([0, 1, 2, 3])\n');
  assert.equal(r.verdict, 'wa');
});

test('Ошибка кода возвращает verdict error со строкой', () => {
  const r = run('bell', H + 'qc = QuantumCircuit(2)\nqc.h(0)\nqc.cnot(0, 1)\n');
  assert.equal(r.verdict, 'error');
  assert.equal(r.error.line, 5);
});

test('Телепортация: без коррекции Z — неверно', () => {
  const r = run('teleport', H + 'qc = QuantumCircuit(3)\nqc.h(1)\nqc.cx(1, 2)\nqc.cx(0, 1)\nqc.h(0)\nqc.cx(1, 2)\n');
  assert.equal(r.verdict, 'wa');
});
