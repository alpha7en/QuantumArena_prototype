// Модель схемы: упорядоченный список операций + раскладка по столбцам (t1, t2, …) для редактора.
import { GATES, SPECIAL, displayName } from './gates.js';

let uid = 1;
export const newId = () => uid++;

export class Circuit {
  constructor(n = 2) { this.n = n; this.ops = []; }

  clone() { const c = new Circuit(this.n); c.ops = this.ops.map((o) => cloneOp(o)); return c; }

  // op: { g, t:[...], c:[...], p:[...], col? }
  add(op) {
    const o = cloneOp(op);
    o.id = o.id || newId();
    this.ops.push(o);
    return o;
  }

  addGate(g, t, c = [], p = []) { return this.add({ g, t: Array.isArray(t) ? t : [t], c, p }); }

  // Короткие конструкторы для эталонных решений и тестов.
  h(q) { return this.addGate('H', q); }
  x(q) { return this.addGate('X', q); }
  z(q) { return this.addGate('Z', q); }
  cx(c, t) { return this.addGate('X', t, [c]); }
  cz(c, t) { return this.addGate('Z', t, [c]); }
  ccx(a, b, t) { return this.addGate('X', t, [a, b]); }

  static fromJSON(j) { const c = new Circuit(j.n); c.ops = j.ops.map((o) => ({ ...cloneOp(o), id: newId() })); return c; }
  toJSON() { return { n: this.n, ops: this.ops.map((o) => { const { id, ...r } = cloneOp(o); return r; }) }; }

  // Операции, считающиеся гейтами (без измерений и сброса).
  gateOps() { return this.ops.filter((o) => o.g in GATES); }

  // Слои ASAP: зависимости только по реально задействованным кубитам.
  layers() {
    const last = new Array(this.n).fill(-1), layers = [];
    for (const op of this.ops) {
      if (op.g === 'M') continue;
      const qs = involved(op);
      const l = Math.max(...qs.map((q) => last[q])) + 1;
      (layers[l] = layers[l] || []).push(op);
      for (const q of qs) last[q] = l;
    }
    return layers;
  }

  stats() {
    const gateOps = this.gateOps();
    const byName = {};
    let two = 0;
    for (const o of gateOps) {
      const nm = displayName(o);
      byName[nm] = (byName[nm] || 0) + 1;
      if (involved(o).length >= 2) two++;
    }
    return {
      gates: gateOps.length,
      depth: this.layers().length,
      twoQubit: two,
      oracleCalls: this.ops.filter((o) => o.g === 'ORACLE').length,
      byName,
      measures: this.ops.filter((o) => o.g === 'M').length,
      resets: this.ops.filter((o) => o.g === 'RESET').length,
    };
  }

  // Раскладка по столбцам без перекрытий (блокируется весь диапазон между крайними кубитами).
  autoColumns() {
    const colEnd = new Array(this.n).fill(-1);
    for (const op of this.ops) {
      const qs = involved(op);
      const lo = Math.min(...qs), hi = Math.max(...qs);
      let col = 0;
      for (let q = lo; q <= hi; q++) col = Math.max(col, colEnd[q] + 1);
      op.col = col;
      for (let q = lo; q <= hi; q++) colEnd[q] = col;
    }
    this.ops.sort((a, b) => a.col - b.col);
    return this;
  }

  columnCount() { return this.ops.reduce((m, o) => Math.max(m, (o.col ?? 0) + 1), 0); }

  // Вставить qubit в конец / удалить последний
  setQubits(n) { this.n = n; this.ops = this.ops.filter((o) => involved(o).every((q) => q < n)); }
}

export const involved = (op) => [...op.t, ...(op.c || [])];
export const span = (op) => { const q = involved(op); return [Math.min(...q), Math.max(...q)]; };

export function cloneOp(o) {
  return { id: o.id, g: o.g, t: [...o.t], c: o.c ? [...o.c] : [], p: o.p ? [...o.p] : [], col: o.col };
}

// ---------- Проверка ограничений задачи ----------

export function edgeSet(coupling, n) {
  const set = new Set();
  const add = (a, b) => { set.add(a + '-' + b); set.add(b + '-' + a); };
  if (!coupling || coupling.kind === 'all') return null; // null = все со всеми
  if (coupling.kind === 'line') for (let i = 0; i + 1 < n; i++) add(i, i + 1);
  if (coupling.kind === 'ring') for (let i = 0; i < n; i++) add(i, (i + 1) % n);
  if (coupling.kind === 'edges') for (const [a, b] of coupling.edges) add(a, b);
  return set;
}

export function couplingLabel(coupling, n) {
  if (!coupling || coupling.kind === 'all') return 'все со всеми';
  if (coupling.kind === 'line') return Array.from({ length: n }, (_, i) => 'q' + i).join(' — ');
  if (coupling.kind === 'ring') return 'кольцо из ' + n;
  return coupling.edges.map(([a, b]) => `q${a} — q${b}`).join(', ');
}

// Возвращает { ok, issues: [{ kind, text, op? }], stats }.
export function checkLimits(circuit, limits = {}, taskQubits = circuit.n) {
  const st = circuit.stats();
  const issues = [];
  if (limits.gates != null && st.gates > limits.gates)
    issues.push({ kind: 'gates', text: `${st.gates} ${plural(st.gates, 'гейт', 'гейта', 'гейтов')} из ${limits.gates}` });
  if (limits.depth != null && st.depth > limits.depth)
    issues.push({ kind: 'depth', text: `глубина ${st.depth} из ${limits.depth}` });
  if (limits.twoQubit != null && st.twoQubit > limits.twoQubit)
    issues.push({ kind: 'twoQubit', text: `двухкубитных гейтов ${st.twoQubit} из ${limits.twoQubit}` });
  if (limits.oracleCalls != null && st.oracleCalls > limits.oracleCalls)
    issues.push({ kind: 'oracle', text: `вызовов оракула ${st.oracleCalls} из ${limits.oracleCalls}` });
  if (limits.maxQubits != null && circuit.n > limits.maxQubits)
    issues.push({ kind: 'qubits', text: `кубитов ${circuit.n} из ${limits.maxQubits}` });

  if (limits.basis) {
    for (const op of circuit.ops) {
      if (op.g === 'ORACLE') continue;
      const nm = displayName(op);
      if (!limits.basis.includes(nm)) {
        issues.push({ kind: 'basis', op, text: `гейт ${nm} вне базиса: разрешены ${limits.basis.join(', ')}` });
        break;
      }
    }
  }

  const edges = edgeSet(limits.coupling, taskQubits);
  if (edges) {
    for (const op of circuit.ops) {
      const qs = involved(op);
      if (qs.length < 2 || op.g === 'ORACLE') continue;
      if (qs.length > 2) { issues.push({ kind: 'coupling', op, text: `${displayName(op)} на ${qs.length} кубитах: на этом чипе доступны только соседние пары` }); break; }
      const [a, b] = qs;
      if (!edges.has(a + '-' + b)) {
        const ctrl = op.c && op.c.length ? op.c[0] : a, tgt = op.t[0];
        issues.push({ kind: 'coupling', op, text: `${displayName(op)} q${ctrl} → q${tgt}: на чипе нет связи между q${Math.min(a, b)} и q${Math.max(a, b)}` });
        break;
      }
    }
  }
  return { ok: issues.length === 0, issues, stats: st };
}

export const plural = (n, one, few, many) => {
  const m10 = n % 10, m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return one;
  if (m10 >= 2 && m10 <= 4 && (m100 < 10 || m100 >= 20)) return few;
  return many;
};

// ---------- Разложение гейтов на базовые (кнопка «разложить» в песочнице) ----------

export function decomposeOp(op) {
  const g = (name, t, c = [], p = []) => ({ g: name, t: [t], c, p });
  const nc = (op.c || []).length;
  if (op.g === 'X' && nc === 2) {
    const [a, b] = op.c, t = op.t[0];
    return [g('H', t), g('X', t, [b]), g('TDG', t), g('X', t, [a]), g('T', t), g('X', t, [b]), g('TDG', t),
      g('X', t, [a]), g('T', b), g('T', t), g('H', t), g('X', b, [a]), g('T', a), g('TDG', b), g('X', b, [a])];
  }
  if (op.g === 'Z' && nc === 2) {
    const [a, b] = op.c, t = op.t[0];
    return [g('X', t, [b]), g('TDG', t), g('X', t, [a]), g('T', t), g('X', t, [b]), g('TDG', t),
      g('X', t, [a]), g('T', b), g('T', t), g('X', b, [a]), g('T', a), g('TDG', b), g('X', b, [a])];
  }
  if (op.g === 'Z' && nc === 1) { const t = op.t[0]; return [g('H', t), g('X', t, op.c), g('H', t)]; }
  if (op.g === 'SWAP' && nc === 0) { const [a, b] = op.t; return [g('X', b, [a]), g('X', a, [b]), g('X', b, [a])]; }
  if (op.g === 'SWAP' && nc === 1) {
    const [a, b] = op.t, c = op.c[0];
    return [g('X', a, [b]), g('X', b, [c, a]), g('X', a, [b])];
  }
  if (op.g === 'P' && nc === 1) {
    const th = op.p[0], c = op.c[0], t = op.t[0];
    return [g('P', c, [], [th / 2]), g('X', t, [c]), g('P', t, [], [-th / 2]), g('X', t, [c]), g('P', t, [], [th / 2])];
  }
  return null;
}

export function decomposeCircuit(circuit) {
  const out = new Circuit(circuit.n);
  let changed = false;
  for (const op of circuit.ops) {
    const d = decomposeOp(op);
    if (d) { changed = true; d.forEach((o) => out.add(o)); } else out.add(op);
  }
  return changed ? out.autoColumns() : null;
}

export { SPECIAL };
