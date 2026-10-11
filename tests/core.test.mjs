import test from 'node:test';
import assert from 'node:assert/strict';
import { State, runOps, fidelity, blochOf, rng } from '../assets/js/quantum/sim.js';
import { Circuit, checkLimits, decomposeOp } from '../assets/js/quantum/circuit.js';
import { formatState } from '../assets/js/quantum/format.js';
import { buildFromCode, circuitToCode } from '../assets/js/lang/qiskitlite.js';
import { runDM, rhoFidelity } from '../assets/js/quantum/dm.js';

const near = (a, b, e = 1e-9) => assert.ok(Math.abs(a - b) < e, `${a} ≠ ${b}`);

test('Bell state and formatting', () => {
  const c = new Circuit(2); c.h(0); c.cx(0, 1);
  const st = runOps(c.ops, 2);
  near(st.prob(0), 0.5); near(st.prob(3), 0.5);
  assert.equal(formatState(st).text, '(|00⟩ + |11⟩) / √2');
  const b = blochOf(st, 0); near(Math.hypot(b.x, b.y, b.z), 0);
});

test('state formatting variants', () => {
  const c = new Circuit(1); c.h(0); c.z(0);
  assert.equal(formatState(runOps(c.ops, 1)).text, '(|0⟩ − |1⟩) / √2');
  const w = State.fromAmps(3, [0, 1, 1, 0, 1, 0, 0, 0]);
  assert.equal(formatState(w).text, '(|001⟩ + |010⟩ + |100⟩) / √3');
  const c2 = new Circuit(1); c2.h(0); c2.addGate('S', 0);
  assert.equal(formatState(runOps(c2.ops, 1)).text, '(|0⟩ + i·|1⟩) / √2');
});

test('CCX decomposition equals CCX', () => {
  const op = { g: 'X', t: [2], c: [0, 1], p: [] };
  for (let k = 0; k < 8; k++) {
    const a = runOps([op], 3, State.basis(3, k));
    const b = runOps(decomposeOp(op), 3, State.basis(3, k));
    // сравнение с точностью до общей фазы
    near(fidelity(a, b), 1, 1e-9);
  }
});

test('python interp: loops and circuit', () => {
  const src = `from qiskit import QuantumCircuit
from math import pi
def solve(n):
    qc = QuantumCircuit(n)
    qc.h(0)
    for i in range(n - 1):
        qc.cx(i, i + 1)
    return qc
`;
  const r = buildFromCode(src, { fnArgs: [4] });
  assert.ok(!r.error, JSON.stringify(r.error));
  assert.equal(r.circuit.ops.length, 4);
  const st = runOps(r.circuit.ops, 4);
  assert.equal(formatState(st).text, '(|0000⟩ + |1111⟩) / √2');
});

test('python interp: errors with hints', () => {
  const r = buildFromCode('from qiskit import QuantumCircuit\nqc = QuantumCircuit(2)\nqc.h(0)\nqc.cnot(0, 1)\n');
  assert.equal(r.error.kind, 'AttributeError');
  assert.equal(r.error.line, 4);
  assert.match(r.error.msg, /qc\.cx\(0, 1\)/);
  const r2 = buildFromCode('from qiskit import QuantumCircuit\nqc = QuantumCircuit(2)\nqc.h(5)\n');
  assert.equal(r2.error.kind, 'IndexError');
  const r3 = buildFromCode('while True:\n    pass\n');
  assert.equal(r3.error.kind, 'LimitError');
});

test('code roundtrip', () => {
  const c = new Circuit(3); c.h(0); c.cx(0, 1); c.ccx(0, 1, 2); c.addGate('RZ', 2, [], [Math.PI / 4]); c.addGate('P', 1, [0], [Math.PI / 2]);
  const code = circuitToCode(c);
  const r = buildFromCode(code);
  assert.ok(!r.error, JSON.stringify(r.error) + code);
  assert.equal(r.circuit.ops.length, 5);
  near(fidelity(runOps(c.ops, 3), runOps(r.circuit.ops, 3)), 1);
});

test('limits: depth, basis, coupling', () => {
  const c = new Circuit(3); c.h(0); c.cx(0, 2);
  const res = checkLimits(c, { gates: 3, depth: 3, basis: ['H', 'CX'], coupling: { kind: 'line' } });
  assert.equal(res.ok, false);
  assert.equal(res.issues[0].kind, 'coupling');
  const c2 = new Circuit(2); c2.h(0); c2.x(1); c2.x(1); c2.cx(0, 1);
  const r2 = checkLimits(c2, { gates: 3, depth: 2 });
  assert.deepEqual(r2.issues.map((i) => i.kind).sort(), ['depth', 'gates'].sort());
});

test('noise reduces fidelity', () => {
  const c = new Circuit(2); c.h(0); c.cx(0, 1);
  const ideal = runOps(c.ops, 2);
  const f0 = rhoFidelity(runDM(c.ops, 2, null, { noise: 0 }), [0, 1], ideal);
  const f1 = rhoFidelity(runDM(c.ops, 2, null, { noise: 0.05 }), [0, 1], ideal);
  near(f0, 1, 1e-9); assert.ok(f1 < 0.99 && f1 > 0.8, String(f1));
});
