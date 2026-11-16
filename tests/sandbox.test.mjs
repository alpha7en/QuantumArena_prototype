// Ядро новой песочницы (sandbox/js/core.js): разбор кода, генерация, симуляция, ресурсы, разложения.
import test from 'node:test';
import assert from 'node:assert/strict';
import * as C from '../sandbox/js/core.js';

const model = (code) => { const r = C.parseProgram(code, {}); Object.assign(C.REG.blocks, r.defs); let id = 1; r.ops.forEach(o => { o.id = id++; }); C.layout(r.ops); return r; };
const prog = (n, body, nc) => `from qiskit import QuantumCircuit\nfrom math import pi\n\nqc = QuantumCircuit(${n}${nc === undefined ? '' : ', ' + nc})\n${body}`;
const close = (a, b, eps = 1e-9) => Math.abs(a - b) < eps;
/** Совпадают ли две унитарные матрицы с точностью до глобальной фазы. */
function sameUpToPhase(U, V) {
  let k = 0; for (let i = 0; i < U.re.length; i++) if (Math.hypot(V.re[i], V.im[i]) > Math.hypot(V.re[k], V.im[k])) k = i;
  const d = V.re[k] ** 2 + V.im[k] ** 2; const pr = (U.re[k] * V.re[k] + U.im[k] * V.im[k]) / d, pi = (U.im[k] * V.re[k] - U.re[k] * V.im[k]) / d;
  for (let i = 0; i < U.re.length; i++) { if (!close(U.re[i], pr * V.re[i] - pi * V.im[i], 1e-7) || !close(U.im[i], pr * V.im[i] + pi * V.re[i], 1e-7)) return false; }
  return close(pr * pr + pi * pi, 1, 1e-7);
}

test('выражения: арифметика Python и отказ на посторонних именах', () => {
  assert.equal(C.evalExpr('7 // 2'), 3);
  assert.equal(C.evalExpr('2 ** 3 + 1'), 9);
  assert.equal(C.evalExpr('-7 % 3'), 2);
  assert.ok(close(C.evalExpr('pi / 4'), Math.PI / 4));
  assert.deepEqual(C.evalExpr('range(1, 7, 2)'), [1, 3, 5]);
  assert.equal(C.evalExpr('len([1, 2, 3]) + n', { n: 2 }), 5);
  assert.equal(C.evalExpr('not (1 > 2) and 3 >= 3'), true);
  for (const bad of ['alert(1)', 'window', 'constructor', 'document.cookie', 'a.b', '"x"', 'range(1e9)']) assert.throws(() => C.evalExpr(bad), Error, bad);
});

test('разбор: состояние Белла и порядок кубитов как в Qiskit', () => {
  const m = model(prog(2, 'qc.h(0)\nqc.cx(0, 1)'));
  const p = C.probsOf(C.simulate(m));
  assert.ok(close(p[0], .5) && close(p[3], .5) && close(p[1], 0) && close(p[2], 0));
  const x = C.probsOf(C.simulate(model(prog(2, 'qc.x(0)'))));
  assert.ok(close(x[1], 1), 'q0 — младший бит');
});

test('разбор: for, if, def с параметрами, вложенные блоки, номера строк', () => {
  const code = prog(4, 'qc.h(0)\nfor i in range(3):\n    if i % 2 == 0:\n        qc.cx(i, i + 1)\n    else:\n        qc.cz(i, i + 1)\nrot(qc, 3, pi / 2)')
    .replace('qc = ', 'def inner(qc, a, t=pi):\n    qc.rz(t, a)\n\ndef rot(qc, a, theta=pi / 4):\n    inner(qc, a, theta / 2)\n    qc.h(a)\n\nqc = ');
  const m = model(code);
  assert.deepEqual(m.ops.map(o => C.kind(o)), ['H', 'CX', 'CZ', 'CX', 'BLOCK']);
  assert.equal(m.loops.length, 1);
  assert.equal(m.loops[0].label, 'for i in range(3)');
  const lines = code.split('\n');
  assert.ok(lines[m.ops[1].ln].includes('qc.cx(i, i + 1)'), 'строка операции внутри цикла');
  const flat = C.flatOps(m);
  assert.deepEqual(flat.slice(-2).map(o => [o.g, o.q[0]]), [['RZ', 3], ['H', 3]]);
  assert.ok(close(flat[flat.length - 2].p, Math.PI / 4));
});

test('разбор: понятные ошибки с номером строки', () => {
  const err = (body, re, nc) => assert.throws(() => model(prog(2, body, nc)), re);
  err('qc.cx(0, 0)', /кубиты одного гейта должны различаться/);
  err('qc.h(5)', /стр\. 5: гейт на несуществующем кубите/);
  err('for i in range(2):\n    qc.foo(i)', /стр\. 6: неизвестный гейт qc\.foo/);
  err('qc.measure(0, 3)', /стр\. 5: классического бита нет/, 2);
  err('nope(qc, 0)', /блок nope не определён/);
  err('qc.rx(0)', /ждёт один кубит после угла/);
  assert.throws(() => model('qc.h(0)'), /не найдена строка qc = QuantumCircuit/);
  assert.throws(() => model(prog(9, '')), /от 1 до 8 кубитов/);
});

test('многоконтрольные гейты: ccz, mcx, mcp', () => {
  const m = model(prog(4, 'qc.ccz(0, 1, 2)\nqc.mcx([0, 1, 2], 3)\nqc.mcp(pi / 2, [0, 1], 3)'));
  assert.deepEqual(m.ops.map(C.kind), ['CCZ', 'MCX', 'MCP']);
  const code = C.genQiskit(m);
  assert.match(code, /qc\.ccz\(0, 1, 2\)/); assert.match(code, /qc\.mcx\(\[0, 1, 2\], 3\)/); assert.match(code, /qc\.mcp\(pi \/ 2, \[0, 1\], 3\)/);
});

test('код → схема → код → схема: унитарная матрица сохраняется', () => {
  const body = 'qc.h(0)\nqc.sdg(1)\nqc.sx(2)\nqc.rx(pi / 3, 0)\nqc.ry(0.37, 1)\nqc.rz(-pi / 8, 2)\nqc.p(pi / 6, 0)\nqc.cy(0, 1)\nqc.ch(1, 2)\nqc.cp(pi / 4, 0, 2)\nqc.swap(0, 2)\nqc.ccx(0, 1, 2)\nqc.tdg(1)\nqc.ccz(2, 1, 0)';
  const a = model(prog(3, body)); const b = model(C.genQiskit(a));
  assert.ok(sameUpToPhase(C.unitaryOf(a), C.unitaryOf(b)));
  assert.equal(C.genQiskit(b), C.genQiskit(a), 'генерация устойчива');
});

test('измерение: распределение по классическому регистру, а не по кубитам', () => {
  const m = model(prog(2, 'qc.h(0)\nqc.cx(0, 1)\nqc.measure(0, 1)', 2));
  const st = C.simulate(m); const d = C.clbitDist(st);
  assert.equal(st.measured, 0b10);
  assert.ok(close(d[0], .5) && close(d[2], .5) && close(d[1], 0));
  assert.match(C.genQiskit(m), /qc\.measure\(0, 1\)/);
  // после измерения кубит — смесь: вектор Блоха вдоль Z исчезает
  assert.ok(close(C.blochOf(st, 0).x, 0) && close(C.densityOf(st).purity, .5));
});

test('условие по измерению: телепортация переносит состояние', () => {
  const body = 'qc.ry(pi / 3, 0)\nqc.h(1)\nqc.cx(1, 2)\nqc.cx(0, 1)\nqc.h(0)\nqc.measure(0, 0)\nqc.measure(1, 1)\nwith qc.if_test((qc.clbits[1], 1)):\n    qc.x(2)\nwith qc.if_test((qc.clbits[0], 1)):\n    qc.z(2)';
  const m = model(prog(3, body, 2)); const st = C.simulate(m);
  assert.equal(st.branches.length, 4);
  const b = C.blochOf(st, 2); const ref = C.blochOf(C.simulate(model(prog(1, 'qc.ry(pi / 3, 0)'))), 0);
  assert.ok(close(b.x, ref.x, 1e-9) && close(b.y, ref.y, 1e-9) && close(b.z, ref.z, 1e-9));
  const again = model(C.genQiskit(m));
  assert.equal(again.ops.filter(o => o.cond).length, 2);
  assert.match(C.genQiskit(m), /with qc\.if_test\(\(qc\.clbits\[1\], 1\)\):\n    qc\.x\(2\)/);
  assert.match(C.genQasm(m), /if \(c\[1\] == 1\) \{ x q\[2\]; \}/);
});

test('старый синтаксис c_if и сброс reset', () => {
  const m = model(prog(1, 'qc.h(0)\nqc.measure(0, 0)\nqc.x(0).c_if(0, 1)\nqc.h(0)\nqc.reset(0)', 1));
  assert.deepEqual(m.ops[2].cond, { bit: 0, val: 1 });
  const p = C.probsOf(C.simulate(m));
  assert.ok(close(p[0], 1), 'после reset кубит в нуле');
  assert.ok(close(C.probsOf(C.simulate(m, 2))[0], 1), 'активный сброс: измерение и условный X');
});

test('while по измерению: повторять до успеха', () => {
  const body = 'qc.h(0)\nqc.measure(0, 0)\nwith qc.while_loop((qc.clbits[0], 1)):\n    qc.reset(0)\n    qc.h(0)\n    qc.measure(0, 0)';
  const m = model(prog(1, body, 1)); const st = C.simulate(m);
  assert.equal(m.ops[2].g, 'DYN'); assert.equal(m.ops[2].body.length, 3);
  assert.ok(st.lost < 1e-11, 'потерянная вероятность пренебрежима');
  assert.ok(close(C.clbitDist(st)[0], 1 - st.lost, 1e-12));
  const again = model(C.genQiskit(m));
  assert.equal(again.ops[2].body.length, 3, 'тело цикла переживает перегенерацию кода');
  // цикл, который не заканчивается: вероятность уходит в lost, симуляция не зависает
  const inf = C.simulate(model(prog(1, 'qc.x(0)\nqc.measure(0, 0)\nwith qc.while_loop((qc.clbits[0], 1)):\n    qc.measure(0, 0)', 1)));
  assert.ok(close(inf.lost, 1));
});

test('ресурсы: глубина по ранней расстановке, блоки раскрываются, служебные операции не гейты', () => {
  const code = prog(3, 'qc.h(0)\nqc.h(1)\nqc.h(2)\nqc.cx(0, 1)\nqc.barrier()\npair(qc, 1, 2)\nqc.t(0)\nqc.measure(range(3), range(3))', 3)
    .replace('qc = ', 'def pair(qc, a, b):\n    qc.cx(a, b)\n    qc.cz(a, b)\n\nqc = ');
  const m = model(code); const r = C.metrics(m);
  assert.equal(r.gates, 7); assert.equal(r.twoQubit, 3); assert.equal(r.cx, 2); assert.equal(r.t, 1);
  assert.equal(r.measurements, 3); assert.equal(r.depth, 5);
  // гейты в разных столбцах на разных проводах глубину не увеличивают
  const m2 = model(prog(2, 'qc.h(0)\nqc.h(1)')); m2.ops[1].col = 5;
  assert.equal(C.metrics(m2).depth, 1);
});

test('набор гейтов: нарушения ищутся и внутри блоков', () => {
  const code = prog(2, 'qc.h(0)\nmagic(qc, 0)\nqc.ccx(0, 1, 1) if False else None'.split('\n').slice(0, 2).join('\n')).replace('qc = ', 'def magic(qc, a):\n    qc.t(a)\n\nqc = ');
  const m = model(code);
  assert.deepEqual(C.violations(m, C.SETS.cliff.allow), [m.ops[1].id]);
  assert.deepEqual(C.violations(m, C.SETS.clifft.allow), []);
  assert.deepEqual(C.violations(m, null), []);
});

test('разложения сохраняют оператор с точностью до фазы', () => {
  const cases = [['qc.swap(0, 1)', null], ['qc.ccx(0, 1, 2)', null], ['qc.ccz(0, 1, 2)', null], ['qc.cx(0, 1)', null], ['qc.cz(0, 1)', null], ['qc.cy(0, 1)', null], ['qc.ch(0, 1)', null], ['qc.cp(pi / 3, 0, 1)', null],
    ['qc.h(0)', 'heron'], ['qc.y(0)', 'heron'], ['qc.t(0)', 'heron'], ['qc.sdg(0)', 'heron'], ['qc.rx(0.7, 0)', 'heron'], ['qc.ry(1.1, 0)', 'heron'], ['qc.p(0.4, 0)', 'heron'],
    ['qc.cx(0, 1)', 'heron'], ['qc.swap(0, 1)', 'heron'], ['qc.ccx(0, 1, 2)', 'heron'], ['qc.s(0)', ['H', 'T', 'CX']], ['qc.sx(0)', ['H', 'S', 'CX']], ['qc.z(0)', ['H', 'S', 'CX']]];
  for (const [line, set] of cases) {
    const m = model(prog(3, line)); const allow = Array.isArray(set) ? set : set ? C.SETS[set].allow : null;
    const d = C.decompose(m.ops[0], allow); assert.ok(d, 'есть разложение: ' + line);
    if (set) assert.ok(d.complete, 'разложение до набора ' + set + ': ' + line);
    const ops = d.ops.map((o, k) => Object.assign({ id: 100 + k, col: k }, o));
    assert.ok(sameUpToPhase(C.unitaryOf({ n: 3, nc: 0, ops }), C.unitaryOf(m)), line + (set ? ' в ' + set : ''));
  }
  assert.equal(C.decompose(model(prog(1, 'qc.t(0)')).ops[0], C.SETS.cliff.allow), null, 'T в клиффордов набор не раскладывается');
});

test('стабилизаторы: GHZ и нестабилизаторное состояние', () => {
  const g = C.stabilizers(C.simulate(model(prog(3, 'qc.h(0)\nqc.cx(0, 1)\nqc.cx(1, 2)'))));
  assert.equal(g.length, 3);
  assert.ok(g.every(x => x.s === '+'));
  assert.equal(C.stabilizers(C.simulate(model(prog(1, 'qc.h(0)\nqc.t(0)')))), null);
  assert.ok(C.stabilizers(C.simulate(model(prog(1, 'qc.rz(pi / 2, 0)')))), 'RZ(π/2) клиффордов');
});

test('экспорт: форматы строятся и содержат ключевые конструкции', () => {
  const m = model(prog(3, 'qc.h(0)\nqc.cx(0, 1)\nqc.mcx([0, 1], 2)\nqc.sdg(2)\nqc.measure(2, 0)\nwith qc.if_test((qc.clbits[0], 1)):\n    qc.x(0)', 1));
  assert.match(C.genQasm(m), /OPENQASM 3\.0;[\s\S]*bit\[1\] c;[\s\S]*ccx q\[0\], q\[1\], q\[2\];[\s\S]*c\[0\] = measure q\[2\];/);
  assert.match(C.genQasm(m, true), /creg c\[1\];[\s\S]*measure q\[2\] -> c\[0\];/);
  assert.match(C.genPenny(m), /qml\.Toffoli\(wires=\[0, 1, 2\]\)[\s\S]*m0 = qml\.measure\(2\)[\s\S]*qml\.cond\(m0 == 1, qml\.PauliX\)\(wires=0\)/);
  assert.match(C.genCirq(m), /cirq\.measure\(q\[2\], key="c0"\)[\s\S]*with_classical_controls\("c0"\)/);
  const j = JSON.parse(C.genJson(m)); assert.equal(j.format, 'sparq-circuit'); assert.equal(j.qubits, 3); assert.equal(j.ops.length, 6);
  assert.match(C.genLatex(m), /\\begin\{quantikz\}[\s\S]*\\meter\{\}/);
});

test('контракт задачи: лимиты и набор', () => {
  const m = model(prog(2, 'qc.h(0)\nqc.cx(0, 1)\nqc.z(1)\nqc.t(0)'));
  const r = C.checkContract(m, { qubits: 2, allow: ['H', 'X', 'Z', 'CX'], limits: { gates: 3, depth: 3 } });
  const by = Object.fromEntries(r.map(x => [x.key, x]));
  assert.equal(by.gates.ok, false); assert.equal(by.depth.ok, true); assert.equal(by.qubits.ok, true); assert.equal(by.basis.value, 1);
});

test('выборка: зерно воспроизводимо, частоты сходятся', () => {
  const a = C.sample([.25, .75], 4000, C.rng(42)), b = C.sample([.25, .75], 4000, C.rng(42));
  assert.deepEqual(a, b); assert.ok(Math.abs(a[1] / 4000 - .75) < .03);
  const n = C.noisyDist(new Float64Array([1, 0, 0, 0]), 2, 1, 0.1);
  assert.ok(close(n[0], .81) && close(n[3], .01));
});
