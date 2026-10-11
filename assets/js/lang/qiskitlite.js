// «Qiskit-lite»: подмножество API QuantumCircuit поверх интерпретатора + генерация кода из схемы.
import { Interp, PyError, parse, makeMathModule, makeNumpyModule } from './pyinterp.js';
import { Circuit, involved } from '../quantum/circuit.js';
import { GATES } from '../quantum/gates.js';

export const MAX_QUBITS = 12;
export const MAX_OPS = 5000;

// Подсказки к частым ошибкам в названиях методов.
const ALIASES = {
  cnot: ['cx', 'qc.cx(0, 1)'], toffoli: ['ccx', 'qc.ccx(0, 1, 2)'], hadamard: ['h', 'qc.h(0)'], cphase: ['cp', 'qc.cp(pi/2, 0, 1)'],
  cu1: ['cp', 'qc.cp(pi/2, 0, 1)'], u1: ['p', 'qc.p(pi/2, 0)'], phase: ['p', 'qc.p(pi/2, 0)'], fredkin: ['cswap', 'qc.cswap(0, 1, 2)'],
  not_: ['x', 'qc.x(0)'], paulix: ['x', 'qc.x(0)'], pauli_x: ['x', 'qc.x(0)'], cnots: ['cx', 'qc.cx(0, 1)'], cy_: ['cy', 'qc.cy(0, 1)'],
};

class RegObj {
  constructor(size, name = 'q', kind = 'q') { this.size = size; this.offset = 0; this.name = name; this.kind = kind; this.pyType = kind === 'q' ? 'QuantumRegister' : 'ClassicalRegister'; }
  get length() { return this.size; }
  pyIter() { return Array.from({ length: this.size }, (_, i) => this.offset + i); }
  pyIndex(i, it) { if (i < 0) i += this.size; if (i < 0 || i >= this.size) throw it.err('IndexError', 'индекс регистра вне диапазона'); return this.offset + i; }
}

export class OracleRef {
  constructor(arity) { this.arity = arity; this.pyType = 'Oracle'; }
}

class QC {
  constructor(circuit, it) { this.c = circuit; this.it = it; this.pyType = 'QuantumCircuit'; }

  q(v, what = 'кубит') {
    const it = this.it;
    if (typeof v !== 'number' || !Number.isInteger(v)) throw it.err('TypeError', `${what} должен быть целым числом, получено: ${it.str(v)}`);
    if (v < 0 || v >= this.c.n) throw it.err('IndexError', `кубит ${v} вне диапазона 0…${this.c.n - 1}`);
    return v;
  }
  qs(v) { return Array.isArray(v) ? v.map((x) => this.q(x)) : [this.q(v)]; }

  push(op) {
    if (op.g === 'P' && Math.abs(Math.abs(op.p[0]) - Math.PI) < 1e-12) op = { ...op, g: 'Z', p: [] };
    if (this.c.ops.length >= MAX_OPS) throw this.it.err('LimitError', `слишком много операций (> ${MAX_OPS})`);
    const qs = involved(op);
    if (new Set(qs).size !== qs.length) throw this.it.err('CircuitError', `кубиты повторяются: ${qs.map((q) => 'q' + q).join(', ')}`);
    this.c.add(op);
    return null;
  }

  pyAttr(name, it) {
    const self = this;
    const need = (args, k, sig) => { if (args.length < k) throw it.err('TypeError', `qc.${name}(${sig}): ожидается аргументов: ${k}, передано: ${args.length}`); };
    const single = (g) => (...a) => { need(a, 1, 'кубит'); for (const q of self.qs(a[0])) self.push({ g, t: [q], c: [], p: [] }); return null; };
    const rot = (g) => (...a) => { need(a, 2, 'угол, кубит'); const th = a[0]; if (typeof th !== 'number') throw it.err('TypeError', 'угол должен быть числом'); for (const q of self.qs(a[1])) self.push({ g, t: [q], c: [], p: [th] }); return null; };
    const ctrl = (g, nc, sig) => (...a) => { need(a, nc + 1, sig); const qs = a.slice(0, nc + 1).map((x) => self.q(x)); return self.push({ g, t: [qs[nc]], c: qs.slice(0, nc), p: [] }); };
    const ctrlRot = (g) => (...a) => { need(a, 3, 'угол, управляющий, целевой'); return self.push({ g, t: [self.q(a[2])], c: [self.q(a[1])], p: [a[0]] }); };
    const table = {
      h: single('H'), x: single('X'), y: single('Y'), z: single('Z'), s: single('S'), sdg: single('SDG'), t: single('T'), tdg: single('TDG'), sx: single('SX'),
      p: rot('P'), rx: rot('RX'), ry: rot('RY'), rz: rot('RZ'),
      id: () => null, i: () => null, barrier: () => null,
      cx: ctrl('X', 1, 'управляющий, целевой'), cy: ctrl('Y', 1, 'управляющий, целевой'), cz: ctrl('Z', 1, 'управляющий, целевой'), ch: ctrl('H', 1, 'управляющий, целевой'),
      ccx: ctrl('X', 2, 'управляющий1, управляющий2, целевой'), ccz: ctrl('Z', 2, 'управляющий1, управляющий2, целевой'),
      cp: ctrlRot('P'), crx: ctrlRot('RX'), cry: ctrlRot('RY'), crz: ctrlRot('RZ'),
      swap: (...a) => { need(a, 2, 'q1, q2'); return self.push({ g: 'SWAP', t: [self.q(a[0]), self.q(a[1])], c: [], p: [] }); },
      cswap: (...a) => { need(a, 3, 'управляющий, q1, q2'); return self.push({ g: 'SWAP', t: [self.q(a[1]), self.q(a[2])], c: [self.q(a[0])], p: [] }); },
      mcx: (...a) => { need(a, 2, '[управляющие], целевой'); const cs = self.qs(a[0]); return self.push({ g: 'X', t: [self.q(a[1])], c: cs, p: [] }); },
      mcp: (...a) => { need(a, 3, 'угол, [управляющие], целевой'); const cs = self.qs(a[1]); return self.push({ g: 'P', t: [self.q(a[2])], c: cs, p: [a[0]] }); },
      measure: (...a) => { need(a, 1, 'кубит, бит'); for (const q of self.qs(a[0])) self.push({ g: 'M', t: [q], c: [], p: [] }); return null; },
      measure_all: () => { for (let q = 0; q < self.c.n; q++) self.push({ g: 'M', t: [q], c: [], p: [] }); return null; },
      reset: (...a) => { need(a, 1, 'кубит'); for (const q of self.qs(a[0])) self.push({ g: 'RESET', t: [q], c: [], p: [] }); return null; },
      append: (...a) => {
        need(a, 1, 'оракул, [кубиты]');
        if (a[0] instanceof OracleRef) {
          const qs = self.qs(a[1] ?? []);
          if (qs.length !== a[0].arity) throw it.err('CircuitError', `оракулу нужно кубитов: ${a[0].arity}, передано: ${qs.length}`);
          return self.push({ g: 'ORACLE', t: qs, c: [], p: [] });
        }
        if (a[0] instanceof QC) return table.compose(a[0], a[1]);
        throw it.err('TypeError', 'append() принимает оракул задачи или другую схему');
      },
      compose: (...a) => {
        const o = a[0];
        if (!(o instanceof QC)) throw it.err('TypeError', 'compose() ждёт QuantumCircuit');
        const map = a[1] != null ? self.qs(a[1]) : Array.from({ length: o.c.n }, (_, i) => i);
        if (map.length !== o.c.n) throw it.err('CircuitError', 'число кубитов не совпадает');
        for (const op of o.c.ops) self.push({ g: op.g, t: op.t.map((q) => map[q]), c: op.c.map((q) => map[q]), p: [...op.p] });
        return null;
      },
      inverse: () => {
        const r = new Circuit(self.c.n);
        for (const op of [...self.c.ops].reverse()) {
          if (op.g === 'M' || op.g === 'RESET') throw it.err('CircuitError', 'схему с измерением нельзя обратить');
          const inv = { S: 'SDG', SDG: 'S', T: 'TDG', TDG: 'T' };
          if (inv[op.g]) r.add({ ...op, g: inv[op.g] });
          else if (['P', 'RX', 'RY', 'RZ'].includes(op.g)) r.add({ ...op, p: [-op.p[0]] });
          else if (op.g === 'SX') throw it.err('CircuitError', 'для √X обратная схема не поддерживается');
          else r.add(op);
        }
        return new QC(r, it);
      },
      copy: () => new QC(self.c.clone(), it),
      depth: () => self.c.layers().length,
      size: () => self.c.gateOps().length,
      num_qubits: self.c.n,
    };
    if (name in table) return table[name];
    const al = ALIASES[name];
    if (al) throw it.err('AttributeError', `у QuantumCircuit нет метода «${name}» — используйте ${al[1].replace('qc.', 'qc.')}`, `метод называется ${al[0]}`);
    throw it.err('AttributeError', `у QuantumCircuit нет метода «${name}»`);
  }
}

// Окружение пользовательского кода.
export function makeInterp({ oracleArity = 0, maxSteps } = {}) {
  const it = new Interp({ maxSteps });
  const QuantumCircuit = (...a) => {
    let n = 0;
    const regs = [];
    for (const x of a) {
      if (x instanceof RegObj) { if (x.kind === 'q') { x.offset = n; n += x.size; regs.push(x); } }
      else if (typeof x === 'number' && regs.length === 0 && n === 0) n = x;
    }
    if (a.length === 0) throw it.err('TypeError', 'QuantumCircuit() ждёт число кубитов, например QuantumCircuit(2)');
    if (!Number.isInteger(n) || n < 1) throw it.err('ValueError', 'число кубитов должно быть целым и положительным');
    if (n > MAX_QUBITS) throw it.err('LimitError', `в демо не больше ${MAX_QUBITS} кубитов`);
    return new QC(new Circuit(n), it);
  };
  QuantumCircuit.pyType = 'class';
  const QuantumRegister = (n, name) => new RegObj(n, name, 'q');
  const ClassicalRegister = (n, name) => new RegObj(n, name, 'c');
  const qiskit = { QuantumCircuit, QuantumRegister, ClassicalRegister };
  it.modules.qiskit = qiskit;
  it.modules['qiskit.circuit'] = qiskit;
  it.modules.math = makeMathModule();
  it.modules.numpy = makeNumpyModule();
  if (oracleArity) it.globals.oracle = new OracleRef(oracleArity);
  return it;
}

// Выполнить код и получить схему. fnArgs — аргументы solve(...), если функция объявлена.
export function buildFromCode(src, { oracleArity = 0, fnArgs = [], maxSteps = 1_500_000, interp = null } = {}) {
  let it = interp;
  try {
    if (!it) {
      const ast = parse(src);
      it = makeInterp({ oracleArity, maxSteps });
      it.run(ast);
      it.ast = ast;
    }
    let result;
    if (typeof it.globals.solve === 'object' && it.globals.solve && it.globals.solve.pyFunc) {
      result = it.call('solve', fnArgs);
      if (!(result instanceof QC)) throw new PyError('TypeError', 'solve() должна вернуть QuantumCircuit', it.line);
    } else if (it.globals.qc instanceof QC) result = it.globals.qc;
    else {
      const any = Object.values(it.globals).find((v) => v instanceof QC);
      if (!any) throw new PyError('NameError', 'схема не найдена: создайте qc = QuantumCircuit(n)', it.line);
      result = any;
    }
    return { circuit: result.c, interp: it, output: it.stdout };
  } catch (e) {
    if (e instanceof PyError) return { error: { kind: e.kind, msg: e.msg, line: e.line, hint: e.hint }, interp: it };
    throw e;
  }
}

// ---------- Схема → код ----------

export function angleToStr(th) {
  if (Math.abs(th) < 1e-12) return '0';
  for (const d of [1, 2, 3, 4, 6, 8, 12, 16, 32]) {
    const k = th / Math.PI * d;
    if (Math.abs(k - Math.round(k)) < 1e-9) {
      const n = Math.round(k), sign = n < 0 ? '-' : '', a = Math.abs(n);
      if (d === 1) return a === 1 ? `${sign}pi` : `${sign}${a}*pi`;
      return a === 1 ? `${sign}pi/${d}` : `${sign}${a}*pi/${d}`;
    }
  }
  return String(Math.round(th * 1e6) / 1e6);
}

export function opToCode(op) {
  const nc = (op.c || []).length;
  const t = op.t[0];
  const ang = op.p && op.p.length ? angleToStr(op.p[0]) : null;
  const meth = { H: 'h', X: 'x', Y: 'y', Z: 'z', S: 's', SDG: 'sdg', T: 't', TDG: 'tdg', SX: 'sx', P: 'p', RX: 'rx', RY: 'ry', RZ: 'rz' };
  if (op.g === 'M') return `qc.measure(${t}, ${t})`;
  if (op.g === 'RESET') return `qc.reset(${t})`;
  if (op.g === 'ORACLE') return `qc.append(oracle, [${op.t.join(', ')}])`;
  if (op.g === 'SWAP') return nc === 0 ? `qc.swap(${op.t[0]}, ${op.t[1]})` : `qc.cswap(${op.c[0]}, ${op.t[0]}, ${op.t[1]})`;
  if (nc === 0) return ang !== null ? `qc.${meth[op.g]}(${ang}, ${t})` : `qc.${meth[op.g]}(${t})`;
  if (op.g === 'X') return nc === 1 ? `qc.cx(${op.c[0]}, ${t})` : nc === 2 ? `qc.ccx(${op.c[0]}, ${op.c[1]}, ${t})` : `qc.mcx([${op.c.join(', ')}], ${t})`;
  if (op.g === 'Z') return nc === 1 ? `qc.cz(${op.c[0]}, ${t})` : nc === 2 ? `qc.ccz(${op.c[0]}, ${op.c[1]}, ${t})` : `qc.mcp(pi, [${op.c.join(', ')}], ${t})`;
  if (op.g === 'P') return nc === 1 ? `qc.cp(${ang}, ${op.c[0]}, ${t})` : `qc.mcp(${ang}, [${op.c.join(', ')}], ${t})`;
  if (nc === 1) {
    if (op.g === 'Y') return `qc.cy(${op.c[0]}, ${t})`;
    if (op.g === 'H') return `qc.ch(${op.c[0]}, ${t})`;
    if (['RX', 'RY', 'RZ'].includes(op.g)) return `qc.c${meth[op.g]}(${ang}, ${op.c[0]}, ${t})`;
  }
  return `# ${op.g} с управлением не выражается в Qiskit-lite`;
}

export function circuitToCode(circuit, { withImport = true, hasOracle = false } = {}) {
  const lines = [];
  const body = circuit.ops.map(opToCode);
  const usesPi = body.some((l) => /\bpi\b/.test(l));
  const measures = circuit.ops.some((o) => o.g === 'M');
  if (withImport) {
    lines.push('from qiskit import QuantumCircuit');
    if (usesPi) lines.push('from math import pi');
    lines.push('');
  }
  lines.push(measures ? `qc = QuantumCircuit(${circuit.n}, ${circuit.n})` : `qc = QuantumCircuit(${circuit.n})`);
  lines.push(...body);
  return lines.join('\n') + '\n';
}

export { QC, RegObj, PyError, GATES };
