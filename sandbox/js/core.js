// Ядро песочницы: модель схемы, разбор Qiskit-кода, генерация кода, симуляция, ресурсы.
// Модуль не обращается к DOM: его же использует tests/sandbox.test.mjs.
//
// Операция схемы:
//   { id, g, q:[цели], c:[управляющие], p:угол|null, col, span?, ln?,
//     cb?:бит для измерения, cond?:{bit,val}, name?,args? (BLOCK), body?,cbit?,cval?,label? (DYN) }
// Порядок кубитов — как в Qiskit: кубит i — бит i числа, q0 младший.

export const MAXQ = 8;          // предел числа кубитов в браузере
export const MAX_OPS = 2000;    // предел числа операций после разворота циклов и блоков
export const MAX_BRANCHES = 1024;
export const MAX_WHILE = 64;    // предел итераций while при симуляции

/** Библиотека блоков текущего проекта: имя → { name, wires, params, code }. */
export const REG = { blocks: {} };

const R2 = Math.SQRT1_2;
const rot = (t, kind) => {
  const c = Math.cos(t / 2), s = Math.sin(t / 2);
  if (kind === 'x') return [[c, 0], [0, -s], [0, -s], [c, 0]];
  if (kind === 'y') return [[c, 0], [-s, 0], [s, 0], [c, 0]];
  return [[c, -s], [0, 0], [0, 0], [c, s]];
};
// m() возвращает матрицу 2×2 по строкам: [m00, m01, m10, m11], элемент — [re, im].
export const GATES = {
  H: { k: 1, m: () => [[R2, 0], [R2, 0], [R2, 0], [-R2, 0]] },
  X: { k: 1, m: () => [[0, 0], [1, 0], [1, 0], [0, 0]] },
  Y: { k: 1, m: () => [[0, 0], [0, -1], [0, 1], [0, 0]] },
  Z: { k: 1, m: () => [[1, 0], [0, 0], [0, 0], [-1, 0]] },
  S: { k: 1, m: () => [[1, 0], [0, 0], [0, 0], [0, 1]] },
  Sdg: { k: 1, lab: 'S†', m: () => [[1, 0], [0, 0], [0, 0], [0, -1]] },
  T: { k: 1, m: () => [[1, 0], [0, 0], [0, 0], [R2, R2]] },
  Tdg: { k: 1, lab: 'T†', m: () => [[1, 0], [0, 0], [0, 0], [R2, -R2]] },
  SX: { k: 1, lab: '√X', m: () => [[.5, .5], [.5, -.5], [.5, -.5], [.5, .5]] },
  RX: { k: 1, p: 1, m: t => rot(t, 'x') },
  RY: { k: 1, p: 1, m: t => rot(t, 'y') },
  RZ: { k: 1, p: 1, m: t => rot(t, 'z') },
  P: { k: 1, p: 1, m: t => [[1, 0], [0, 0], [0, 0], [Math.cos(t), Math.sin(t)]] },
  CX: { k: 2, base: 'X' }, CZ: { k: 2, base: 'Z' }, CY: { k: 2, base: 'Y' },
  CH: { k: 2, base: 'H' }, CP: { k: 2, base: 'P', p: 1 },
  SWAP: { k: 2 },
  M: { k: 1 }, R: { k: 1, lab: '|0⟩' }, BAR: { k: 1, lab: '▮▮' },
};
export const lab = g => (GATES[g] && GATES[g].lab) || g;
const SERVICE = ['M', 'R', 'BAR'];
export const isService = g => SERVICE.includes(g);

/** Вид операции для наборов гейтов и подписей: CX с двумя управляющими — CCX и т. д. */
export function kind(o) {
  const k = o.c ? o.c.length : 0;
  if (o.g === 'CX') return k <= 1 ? 'CX' : k === 2 ? 'CCX' : 'MCX';
  if (o.g === 'CZ') return k <= 1 ? 'CZ' : k === 2 ? 'CCZ' : 'MCZ';
  if (o.g === 'CP') return k <= 1 ? 'CP' : 'MCP';
  return o.g;
}
const isHalfPi = v => typeof v === 'number' && Math.abs(v / (Math.PI / 2) - Math.round(v / (Math.PI / 2))) < 1e-9;
/** Клиффордова ли операция (вращения — при углах, кратных π/2). */
export function isClifford(o) {
  const kd = kind(o);
  if (['H', 'X', 'Y', 'Z', 'S', 'Sdg', 'SX', 'CX', 'CZ', 'CY', 'SWAP', 'M', 'R', 'BAR'].includes(kd)) return true;
  if (['RX', 'RY', 'RZ', 'P'].includes(kd)) return isHalfPi(o.p);
  if (kd === 'CP') return typeof o.p === 'number' && Math.abs(o.p / Math.PI - Math.round(o.p / Math.PI)) < 1e-9;
  return false;
}

export const SETS = {
  std: { name: 'стандартный', d: 'все гейты · для обучения', allow: null },
  cliff: { name: 'Clifford', d: 'H, S, CX и их произведения', allow: ['H', 'X', 'Y', 'Z', 'S', 'Sdg', 'SX', 'CX', 'CZ', 'CY', 'SWAP', 'M', 'R', 'BAR'] },
  clifft: { name: 'Clifford + T', d: 'универсальный набор с ценой по T', allow: ['H', 'X', 'Y', 'Z', 'S', 'Sdg', 'T', 'Tdg', 'SX', 'CX', 'CZ', 'CY', 'SWAP', 'M', 'R', 'BAR'] },
  heron: { name: 'IBM Heron', d: 'CZ, RZ, √X, X · как на процессоре', allow: ['RZ', 'SX', 'X', 'CZ', 'M', 'R', 'BAR'] },
};

// ───────── безопасный вычислитель выражений (подмножество Python) ─────────
const FUNCS = {
  range: (a, b, st) => {
    if (b === undefined) { b = a; a = 0; } st = st === undefined ? 1 : st;
    if (![a, b, st].every(Number.isInteger) || st === 0) throw new Error('range ждёт целые числа');
    const r = []; for (let i = a; st > 0 ? i < b : i > b; i += st) { r.push(i); if (r.length > MAX_OPS) throw new Error('слишком длинный range'); }
    return r;
  },
  len: x => { if (!Array.isArray(x)) throw new Error('len ждёт список'); return x.length; },
  int: x => Math.trunc(x), abs: Math.abs, min: Math.min, max: Math.max, sqrt: Math.sqrt,
  sin: Math.sin, cos: Math.cos, tan: Math.tan, asin: Math.asin, acos: Math.acos, atan: Math.atan,
  reversed: x => x.slice().reverse(), list: x => x.slice(),
};
const CONSTS = { pi: Math.PI, True: true, False: false };
function tokenize(src) {
  const out = []; const re = /\s*(?:(\d+\.?\d*(?:[eE][+-]?\d+)?|\.\d+)|([A-Za-z_]\w*)|(\*\*|\/\/|<=|>=|==|!=|[-+*/%()<>\[\],]))/y;
  let i = 0;
  while (i < src.length) {
    if (/^\s*$/.test(src.slice(i))) break;
    re.lastIndex = i; const m = re.exec(src);
    if (!m) throw new Error('не понимаю выражение «' + src.trim() + '»');
    out.push(m[1] !== undefined ? { t: 'n', v: parseFloat(m[1]) } : m[2] !== undefined ? { t: 'id', v: m[2] } : { t: 'op', v: m[3] });
    i = re.lastIndex;
  }
  return out;
}
/** Вычислить выражение: числа, pi, имена из env, + − * / // % **, сравнения, and/or/not, списки, range() и др. */
export function evalExpr(src, env = {}) {
  if (typeof src !== 'string' || !src.trim()) throw new Error('пустое выражение');
  const tk = tokenize(src); let i = 0;
  const peek = v => tk[i] && tk[i].t !== 'n' && tk[i].v === v;
  const eat = v => { if (peek(v)) { i++; return true; } return false; };
  const need = v => { if (!eat(v)) throw new Error('в выражении «' + src.trim() + '» ожидается «' + v + '»'); };
  const num = x => { if (typeof x !== 'number') throw new Error('в выражении «' + src.trim() + '» нужно число'); return x; };
  function or() { let a = and(); while (eat('or')) { const b = and(); a = a || b; } return a; }
  function and() { let a = not(); while (eat('and')) { const b = not(); a = a && b; } return a; }
  function not() { return eat('not') ? !not() : cmp(); }
  function cmp() {
    const a = sum();
    for (const op of ['<=', '>=', '==', '!=', '<', '>']) if (eat(op)) { const b = sum(); return { '<=': a <= b, '>=': a >= b, '==': a === b, '!=': a !== b, '<': a < b, '>': a > b }[op]; }
    return a;
  }
  function sum() { let a = term(); for (;;) { if (eat('+')) a = num(a) + num(term()); else if (eat('-')) a = num(a) - num(term()); else return a; } }
  function term() {
    let a = unary();
    for (;;) {
      if (eat('*')) a = num(a) * num(unary());
      else if (eat('//')) a = Math.floor(num(a) / num(unary()));
      else if (eat('/')) a = num(a) / num(unary());
      else if (eat('%')) { const b = num(unary()); a = ((num(a) % b) + b) % b; }
      else return a;
    }
  }
  function unary() { if (eat('-')) return -num(unary()); if (eat('+')) return num(unary()); return pow(); }
  function pow() { const a = post(); return eat('**') ? Math.pow(num(a), num(unary())) : a; }
  function args(close) { const r = []; if (eat(close)) return r; do { r.push(or()); } while (eat(',') && !peek(close)); need(close); return r; }
  function post() {
    let a = atom();
    while (peek('[')) { i++; const k = or(); need(']'); if (!Array.isArray(a)) throw new Error('индекс можно брать только у списка'); a = a[k < 0 ? a.length + k : k]; if (a === undefined) throw new Error('индекс вне списка'); }
    return a;
  }
  function atom() {
    const t = tk[i++];
    if (!t) throw new Error('выражение «' + src.trim() + '» оборвано');
    if (t.t === 'n') return t.v;
    if (t.t === 'id') {
      if (peek('(')) { i++; const f = FUNCS[t.v]; if (!f) throw new Error('функция ' + t.v + '() не поддерживается'); return f(...args(')')); }
      if (Object.prototype.hasOwnProperty.call(env, t.v)) return env[t.v];
      if (Object.prototype.hasOwnProperty.call(CONSTS, t.v)) return CONSTS[t.v];
      throw new Error('неизвестное имя ' + t.v);
    }
    if (t.v === '(') { const v = or(); need(')'); return v; }
    if (t.v === '[') return args(']');
    throw new Error('не понимаю выражение «' + src.trim() + '»');
  }
  const v = or();
  if (i < tk.length) throw new Error('не понимаю выражение «' + src.trim() + '»');
  return v;
}

// ───────── разбор Qiskit-кода ─────────
export function splitArgs(s) {
  const out = []; let d = 0, cur = '';
  for (const ch of s) { if (ch === '(' || ch === '[') d++; if (ch === ')' || ch === ']') d--; if (ch === ',' && d === 0) { out.push(cur); cur = ''; } else cur += ch; }
  if (cur.trim()) out.push(cur);
  return out.map(x => x.trim());
}
// имя метода Qiskit → [гейт, число управляющих | 'list' — управляющие списком]
const QMAP = {
  h: ['H'], x: ['X'], y: ['Y'], z: ['Z'], s: ['S'], sdg: ['Sdg'], t: ['T'], tdg: ['Tdg'], sx: ['SX'],
  rx: ['RX'], ry: ['RY'], rz: ['RZ'], p: ['P'],
  cx: ['CX', 1], cnot: ['CX', 1], cz: ['CZ', 1], cy: ['CY', 1], ch: ['CH', 1], cp: ['CP', 1],
  ccx: ['CX', 2], toffoli: ['CX', 2], ccz: ['CZ', 2], mcx: ['CX', 'list'], mcp: ['CP', 'list'], swap: ['SWAP'],
};
const indentOf = l => l.match(/^\s*/)[0].replace(/\t/g, '    ').length;
const stripComment = l => l.replace(/#.*$/, '').trimEnd();
const COND_RE = /^with\s+qc\.(if_test|while_loop)\(\s*\(\s*[\w.]+\[(.+)\]\s*,\s*(.+?)\s*\)\s*\)\s*:$/;

export function blockFromCode(code) {
  const lines = code.split('\n'); const m = lines[0].match(/^def\s+([A-Za-z_]\w*)\s*\((.*)\)\s*:/);
  if (!m) throw new Error('первая строка блока должна быть def имя(qc, …):');
  const args = splitArgs(m[2]); if (args[0] !== 'qc') throw new Error('первый аргумент функции должен быть qc');
  const wires = [], params = [];
  args.slice(1).forEach(a => {
    const p = a.split('=');
    if (p.length > 1) params.push({ name: p[0].trim(), def: p.slice(1).join('=').trim() });
    else { if (params.length) throw new Error('кубиты блока идут раньше параметров со значением по умолчанию'); wires.push(a.trim()); }
  });
  const names = wires.concat(params.map(p => p.name));
  if (names.some(n => !/^[A-Za-z_]\w*$/.test(n))) throw new Error('имена кубитов и параметров блока: латиница, цифры и _');
  if (new Set(names).size !== names.length) throw new Error('имена кубитов и параметров блока должны различаться');
  if (!wires.length) throw new Error('у блока должен быть хотя бы один кубит');
  return { name: m[1], wires, params, code };
}
function parseDefs(lines) {
  const defs = {};
  for (let i = 0; i < lines.length; i++) {
    if (!/^def\s/.test(lines[i])) continue;
    let j = i + 1; while (j < lines.length && (lines[j].trim() === '' || indentOf(lines[j]) > 0)) j++;
    const code = lines.slice(i, j).join('\n').replace(/\s+$/, '');
    let b; try { b = blockFromCode(code); } catch (e) { throw new Error('стр. ' + (i + 1) + ': ' + e.message); }
    defs[b.name] = b; i = j - 1;
  }
  return defs;
}

/**
 * Интерпретатор тела программы или блока. Вызывает emit(op) для каждой операции.
 * ctx: { top, blocks, n(), setN?, loop?(a,b,label), count(), base, sym?:Set имён параметров, cond? }
 * off — номер первой строки lines в исходном тексте (для сообщений и подсветки).
 */
function interp(lines, env, emit, ctx, off = 0) {
  let i = 0;
  const fail = msg => { throw new Error('стр. ' + (ctx.base + off + i + 1) + ': ' + msg); };
  const ev = x => { try { return evalExpr(x, env); } catch (e) { fail(e.message); } };
  const qubit = x => { const v = ev(x); if (!Number.isInteger(v)) fail('номер кубита должен быть целым числом: ' + x); return v; };
  const qlist = x => { const v = ev(x); const a = Array.isArray(v) ? v : [v]; if (!a.every(Number.isInteger)) fail('номера кубитов должны быть целыми: ' + x); return a; };
  const angle = x => {
    if (ctx.sym && [...ctx.sym].some(nm => new RegExp('\\b' + nm + '\\b').test(x))) return x.trim();
    const v = ev(x); if (typeof v !== 'number' || !isFinite(v)) fail('угол должен быть числом: ' + x); return v;
  };
  const put = o => { const op = Object.assign({ c: [], p: null }, o, { ln: ctx.base + off + i }); if (ctx.cond) op.cond = ctx.cond; emit(op); if (ctx.count() > MAX_OPS) fail('слишком много операций (больше ' + MAX_OPS + ')'); };
  while (i < lines.length) {
    const raw = lines[i]; const t = stripComment(raw).trim();
    if (!t || /^("""|''')/.test(t) || /^(from|import)\b/.test(t) || /^(print\b|return\b|pass$)/.test(t)) {
      if (/^("""|''')/.test(t) && !/("""|''').*("""|''')/.test(t)) { i++; while (i < lines.length && !/("""|''')/.test(lines[i])) i++; }
      i++; continue;
    }
    const ind = indentOf(raw);
    const block = from => { let j = from + 1; while (j < lines.length && (lines[j].trim() === '' || indentOf(lines[j]) > ind)) j++; return [lines.slice(from + 1, j), j]; };
    let m;
    if ((m = t.match(/^for\s+([A-Za-z_]\w*)\s+in\s+(.+):$/))) {
      const [b, j] = block(i); const it = ev(m[2]); if (!Array.isArray(it)) fail('for ждёт range(...) или список');
      const start = ctx.count();
      for (const v of it) interp(b, Object.assign({}, env, { [m[1]]: v }), emit, ctx, off + i + 1);
      if (ctx.top && !ctx.cond && ctx.loop && ctx.count() > start) ctx.loop(start, ctx.count(), 'for ' + m[1] + ' in ' + m[2].replace(/\s+/g, ' '));
      i = j; continue;
    }
    if ((m = t.match(/^if\s+(.+):$/))) {
      const [b, j] = block(i); let k = j, elseB = null, elseAt = 0;
      if (k < lines.length && stripComment(lines[k]).trim() === 'else:' && indentOf(lines[k]) === ind) { elseAt = k; [elseB, k] = block(k); }
      if (ev(m[1])) interp(b, env, emit, ctx, off + i + 1); else if (elseB) interp(elseB, env, emit, ctx, off + elseAt + 1);
      i = k; continue;
    }
    if (/^else\s*:$/.test(t)) fail('else без if');
    if (/^while\b/.test(t)) fail('обычный while не поддерживается: для цикла по измерению используйте with qc.while_loop((qc.clbits[k], 1)):');
    if ((m = t.match(COND_RE))) {
      const [b, j] = block(i); if (ctx.cond) fail('вложенные условия по измерению не поддерживаются');
      const bit = ev(m[2]), val = ev(m[3]) ? 1 : 0; if (!Number.isInteger(bit) || bit < 0) fail('номер классического бита должен быть целым');
      if (m[1] === 'if_test') { ctx.cond = { bit, val }; try { interp(b, env, emit, ctx, off + i + 1); } finally { ctx.cond = null; } }
      else {
        const body = []; const sub = Object.assign({}, ctx, { top: false, count: () => ctx.count() + body.length, loop: null, cond: null });
        interp(b, env, o => body.push(o), sub, off + i + 1);
        expandCalls(body, ctx.blocks);
        const qs = [...new Set(body.flatMap(o => o.q.concat(o.c)))].sort((a, b2) => a - b2);
        if (!qs.length) fail('пустое тело while_loop');
        put({ g: 'DYN', q: qs, cbit: bit, cval: val, body, label: 'пока c' + bit + ' = ' + val, lnEnd: ctx.base + off + j });
      }
      i = j; continue;
    }
    if (/^with\b/.test(t)) fail('из конструкций with поддерживаются qc.if_test((qc.clbits[k], v)) и qc.while_loop((qc.clbits[k], v))');
    if ((m = t.match(/^([A-Za-z_]\w*)\s*=\s*QuantumCircuit\((.*)\)$/))) {
      if (!ctx.setN) fail('QuantumCircuit создаётся один раз на верхнем уровне');
      const a = splitArgs(m[2]); if (!a.length) fail('укажите число кубитов: QuantumCircuit(n)');
      ctx.setN(qubit(a[0]), a[1] !== undefined ? qubit(a[1]) : null); i++; continue;
    }
    if ((m = t.match(/^qc\.(\w+)\((.*?)\)\.c_if\((.+)\)$/) || t.match(/^qc\.(\w+)\((.*)\)$/))) {
      const name = m[1].toLowerCase(); const a = splitArgs(m[2]);
      const saved = ctx.cond;
      if (m[3]) { if (ctx.cond) fail('вложенные условия по измерению не поддерживаются'); const ca = splitArgs(m[3]); const bm = ca[0].match(/\[(.+)\]$/); ctx.cond = { bit: qubit(bm ? bm[1] : ca[0]), val: ev(ca[1]) ? 1 : 0 }; }
      try {
        if (name === 'measure_all') { for (let q = 0; q < ctx.n(); q++) put({ g: 'M', q: [q], cb: q }); }
        else if (name === 'measure') {
          if (a.length !== 2) fail('qc.measure ждёт кубит и классический бит');
          const qs = qlist(a[0]), cs = qlist(a[1]); if (qs.length !== cs.length) fail('в qc.measure разное число кубитов и битов');
          qs.forEach((q, k) => put({ g: 'M', q: [q], cb: cs[k] }));
        }
        else if (name === 'reset') { if (a.length !== 1) fail('qc.reset ждёт один аргумент'); qlist(a[0]).forEach(q => put({ g: 'R', q: [q] })); }
        else if (name === 'barrier') { const qs = [...new Set(a.length ? a.flatMap(qlist) : [...Array(ctx.n()).keys()])].sort((x, y) => x - y); if (qs.length) put({ g: 'BAR', q: qs }); }
        else if (name === 'id' || name === 'i') { /* тождественный гейт на схему не ставим */ }
        else {
          const def = QMAP[name]; if (!def) fail('неизвестный гейт qc.' + m[1]);
          const [g, nc] = def; const G = GATES[g]; let k = 0; let p = null;
          const hasP = G.p || (G.base && GATES[G.base].p);
          let px;
          if (hasP) { if (!a.length) fail('qc.' + m[1] + ' ждёт угол'); p = angle(a[k]); if (typeof p === 'number' && fmtA(p) !== a[k].replace(/\s+/g, ' ').trim() && !/^[-\d.]+$/.test(fmtA(p, 'pi').replace('π', ''))) px = a[k].trim(); k++; }
          if (g === 'SWAP') { if (a.length !== 2) fail('qc.swap ждёт два кубита'); put({ g, q: [qubit(a[0]), qubit(a[1])] }); }
          else if (nc === 'list') { if (a.length - k !== 2) fail('qc.' + m[1] + ' ждёт список управляющих кубитов и цель'); const cs = qlist(a[k]); if (!cs.length) fail('пустой список управляющих кубитов'); put({ g, c: cs, q: [qubit(a[k + 1])], p, px }); }
          else if (nc) { if (a.length - k !== nc + 1) fail('qc.' + m[1] + ' ждёт ' + (nc + 1) + ' кубит(а)'); const qs = a.slice(k).map(qubit); put({ g, c: qs.slice(0, nc), q: [qs[nc]], p, px }); }
          else { if (a.length - k !== 1) fail('qc.' + m[1] + ' ждёт один кубит' + (hasP ? ' после угла' : '')); qlist(a[k]).forEach(q => put({ g, q: [q], p, px })); }
        }
      } finally { ctx.cond = saved; }
      i++; continue;
    }
    if ((m = t.match(/^([A-Za-z_]\w*)\((qc\b.*)\)$/))) {
      const B = ctx.blocks[m[1]]; if (!B) fail('блок ' + m[1] + ' не определён: объявите его через def ' + m[1] + '(qc, …):');
      const a = splitArgs(m[2]).slice(1);
      if (a.length < B.wires.length || a.length > B.wires.length + B.params.length) fail('блок ' + m[1] + ' ждёт ' + B.wires.length + ' кубит(а)' + (B.params.length ? ' и до ' + B.params.length + ' параметров' : ''));
      const wires = a.slice(0, B.wires.length).map(qubit);
      if (new Set(wires).size !== wires.length) fail('кубиты блока ' + m[1] + ' должны различаться');
      const args = {};
      B.params.forEach((p, k) => { const src = a[B.wires.length + k]; args[p.name] = src !== undefined ? angle(src) : evalExpr(p.def, {}); });
      put({ g: 'BLOCK', name: m[1], q: wires, args });
      i++; continue;
    }
    if ((m = t.match(/^([A-Za-z_]\w*)\s*=\s*(.+)$/))) {
      if (m[1] === 'qc') fail('имя qc занято схемой');
      try { env[m[1]] = evalExpr(m[2], env); } catch (e) { fail(e.message); }
      i++; continue;
    }
    fail('не понимаю «' + t.slice(0, 40) + '»');
  }
}
/** Заменить вызовы блоков в списке операций их содержимым (на месте). */
function expandCalls(ops, blocks) {
  for (let k = 0; k < ops.length; k++) {
    const o = ops[k]; if (o.g !== 'BLOCK') continue;
    const B = blocks[o.name]; const inner = B ? expandBlock(B, o.args, blocks) : [];
    ops.splice(k, 1, ...inner.map(x => remap(x, o.q, o))); k += inner.length - 1;
  }
}
const remap = (x, wires, parent) => {
  const r = Object.assign({}, x, { q: x.q.map(k => wires[k]), c: (x.c || []).map(k => wires[k]) });
  if (x.body) r.body = x.body.map(b => remap(b, wires, null));
  if (parent && parent.cond && !r.cond) r.cond = parent.cond;
  if (parent && parent.ln !== undefined) r.ln = parent.ln;
  return r;
};
/**
 * Развернуть блок в список операций в локальных номерах проводов.
 * opts.sym — оставить имена параметров в углах как текст (для редактора блока).
 */
export function expandBlock(B, args, blocks = REG.blocks, opts = {}, depth = 0) {
  if (depth > 8) throw new Error('блоки вложены слишком глубоко или вызывают сами себя');
  const env = {}; B.wires.forEach((w, k) => { env[w] = k; });
  B.params.forEach(p => { const v = args && args[p.name] !== undefined ? args[p.name] : evalExpr(p.def, {}); env[p.name] = typeof v === 'number' ? v : evalExpr(String(v), {}); });
  const out = []; const lines = B.code.split('\n').slice(1);
  const ctx = { top: false, blocks, n: () => B.wires.length, count: () => out.length, base: 1, cond: null, sym: opts.sym ? new Set(B.params.map(p => p.name)) : null };
  interp(lines, env, o => out.push(o), ctx, 0);
  out.forEach(o => { if (o.q.concat(o.c).some(q => q < 0 || q >= B.wires.length)) throw new Error('блок ' + B.name + ': гейт на несуществующем проводе'); checkDistinct(o, 'блок ' + B.name + ': '); });
  for (let k = 0; k < out.length; k++) {
    const o = out[k]; if (o.g !== 'BLOCK') continue;
    const inner = blocks[o.name]; if (!inner) throw new Error('блок ' + o.name + ' не определён');
    const sub = expandBlock(inner, o.args, blocks, {}, depth + 1).map(x => remap(x, o.q, o));
    out.splice(k, 1, ...sub); k += sub.length - 1;
  }
  return out;
}
function checkDistinct(o, prefix = '') {
  const ws = o.q.concat(o.c || []);
  if (new Set(ws).size !== ws.length) throw new Error(prefix + (o.ln !== undefined ? 'стр. ' + (o.ln + 1) + ': ' : '') + 'кубиты одного гейта должны различаться');
}
/** Разобрать программу целиком: { n, nc, ops, loops, defs }. Бросает Error с номером строки. */
export function parseProgram(text, libBlocks = REG.blocks) {
  const lines = text.split('\n'); const defs = parseDefs(lines);
  const blocks = Object.assign({}, libBlocks, defs);
  const top = []; let skip = false;
  for (const l of lines) { if (/^def\s/.test(l)) { skip = true; top.push(''); continue; } if (skip && (l.trim() === '' || indentOf(l) > 0)) { top.push(''); continue; } skip = false; top.push(l); }
  let n = null, nc = null; const ops = [], loops = [];
  interp(top, {}, o => ops.push(o), {
    top: true, blocks, base: 0, cond: null, count: () => ops.length, n: () => n === null ? 0 : n,
    loop: (a, b, label) => loops.push({ a, b, label }),
    setN: (v, c) => { if (n !== null) throw new Error('QuantumCircuit создаётся один раз'); n = v; nc = c; },
  });
  if (n === null) throw new Error('не найдена строка qc = QuantumCircuit(n)');
  if (n < 1 || n > MAXQ) throw new Error('в песочнице от 1 до ' + MAXQ + ' кубитов');
  if (nc === null) nc = ops.some(o => o.g === 'M' || o.cond || o.g === 'DYN') ? n : 0;
  if (nc < 0 || nc > 2 * MAXQ) throw new Error('классических битов — от 0 до ' + 2 * MAXQ);
  const check = (o, where) => {
    if (o.q.concat(o.c).some(q => q < 0 || q >= n)) throw new Error('стр. ' + (o.ln + 1) + ': ' + where + ' на несуществующем кубите (всего ' + n + ')');
    checkDistinct(o);
    const bits = [o.cb, o.cond && o.cond.bit, o.cbit].filter(b => b !== undefined && b !== null);
    if (bits.some(b => b < 0 || b >= nc)) throw new Error('стр. ' + (o.ln + 1) + ': классического бита нет: объявлено ' + nc + ' (второй аргумент QuantumCircuit)');
    (o.body || []).forEach(b => check(b, where));
  };
  ops.forEach(o => { check(o, o.g === 'BLOCK' ? 'блок ' + o.name : 'гейт'); if (o.g === 'BLOCK') expandBlock(blocks[o.name], o.args, blocks); });
  return { n, nc, ops, loops, defs };
}

// ───────── раскладка и ресурсы ─────────
const wiresOf = o => o.q.concat(o.c || []);
/** Классические биты, которые операция читает или пишет. */
export const clbitsOf = o => {
  const r = []; if (o.g === 'M') r.push(o.cb); if (o.cond) r.push(o.cond.bit);
  if (o.g === 'DYN') { r.push(o.cbit); o.body.forEach(b => r.push(...clbitsOf(b))); }
  return [...new Set(r)];
};
export const spanOf = o => o.span || 1;
/** Расставить операции по столбцам как можно раньше (с учётом проводов между крайними кубитами гейта). */
export function layout(ops) {
  const last = {}, lastC = {};
  ops.forEach(o => {
    const ws = wiresOf(o); const lo = Math.min(...ws), hi = Math.max(...ws);
    if (o.g === 'BLOCK' || o.g === 'DYN') o.span = 2; else delete o.span;
    let col = 0; for (let w = lo; w <= hi; w++) col = Math.max(col, (last[w] ?? -1) + 1);
    // условие читает бит, измерение его пишет: порядок по столбцам обязан совпасть с порядком программы
    const bits = clbitsOf(o); bits.forEach(b => { col = Math.max(col, (lastC[b] ?? -1) + 1); });
    o.col = col; for (let w = lo; w <= hi; w++) last[w] = col + spanOf(o) - 1;
    bits.forEach(b => { lastC[b] = col + spanOf(o) - 1; });
  });
  return ops;
}
export const sorted = ops => ops.slice().sort((a, b) => a.col - b.col || Math.min(...wiresOf(a)) - Math.min(...wiresOf(b)));
/** Схема без блоков: вызовы заменены содержимым. Тела while остаются внутри операции DYN. */
export function flatOps(model, blocks = REG.blocks) {
  const out = [];
  sorted(model.ops).forEach(o => {
    if (o.g !== 'BLOCK') { out.push(o); return; }
    const B = blocks[o.name]; if (!B) return;
    expandBlock(B, o.args, blocks).forEach(x => out.push(Object.assign(remap(x, o.q, o), { from: o.id })));
  });
  return out;
}
/**
 * Ресурсы схемы по тем же определениям, что у серверной проверки (bank/tools/sakit.py, metrics):
 * гейты — без измерений, сброса и барьеров; глубина — самая ранняя расстановка, барьеры не считаются,
 * измерение и условие занимают ещё и свой классический бит; блоки и тела while раскрываются.
 */
export function metrics(model, blocks = REG.blocks) {
  const all = []; const walk = list => list.forEach(o => { if (o.g === 'DYN') walk(o.body); else all.push(o); });
  walk(flatOps(model, blocks));
  const last = {}; let depth = 0;
  all.forEach(o => {
    if (o.g === 'BAR') return;
    const ws = wiresOf(o).map(q => 'q' + q); if (o.g === 'M') ws.push('c' + o.cb); if (o.cond) ws.push('c' + o.cond.bit);
    const d = Math.max(0, ...ws.map(w => last[w] || 0)) + 1; ws.forEach(w => { last[w] = d; }); depth = Math.max(depth, d);
  });
  const gates = all.filter(o => !isService(o.g));
  const multi = gates.filter(o => wiresOf(o).length >= 2);
  return {
    qubits: model.n, gates: gates.length, depth, twoQubit: multi.length,
    cx: gates.filter(o => kind(o) === 'CX').length, t: gates.filter(o => o.g === 'T' || o.g === 'Tdg').length,
    oneQubit: gates.length - multi.length, measurements: all.filter(o => o.g === 'M').length,
    kinds: [...new Set(all.map(kind))],
  };
}
/** Операции, которых нет в наборе (блоки проверяются по содержимому). Возвращает id операций верхнего уровня. */
export function violations(model, allow, blocks = REG.blocks) {
  if (!allow) return [];
  const bad = new Set(); const test = (o, top) => { if (o.g === 'DYN') { o.body.forEach(b => test(b, top)); return; } if (!allow.includes(kind(o))) bad.add(top); };
  model.ops.forEach(o => {
    if (o.g === 'BLOCK') { const B = blocks[o.name]; if (B) expandBlock(B, o.args, blocks).forEach(x => test(x, o.id)); }
    else test(o, o.id);
  });
  return [...bad];
}

// ───────── разложение гейтов ─────────
const PI = Math.PI;
const g1 = (g, q, p = null) => ({ g, q: [q], c: [], p });
const cg = (g, c, t, p = null) => ({ g, q: [t], c: [c], p });
/** Один шаг разложения операции; null — правила нет. allow — текущий набор (null — стандартный). */
export function decomposeStep(o, allow) {
  const kd = kind(o); const t = o.q[0]; const ok = k => !allow || allow.includes(k);
  if (kd === 'SWAP') { const [a, b] = o.q; return [cg('CX', a, b), cg('CX', b, a), cg('CX', a, b)]; }
  if (kd === 'CCX') {
    const [a, b] = o.c;
    return [g1('H', t), cg('CX', b, t), g1('Tdg', t), cg('CX', a, t), g1('T', t), cg('CX', b, t), g1('Tdg', t), cg('CX', a, t),
      g1('T', b), g1('T', t), g1('H', t), cg('CX', a, b), g1('T', a), g1('Tdg', b), cg('CX', a, b)];
  }
  if (kd === 'CCZ') return [g1('H', t), { g: 'CX', q: [t], c: o.c.slice(), p: null }, g1('H', t)];
  if (kd === 'CX') return [g1('H', t), cg('CZ', o.c[0], t), g1('H', t)];
  if (kd === 'CZ') return [g1('H', t), cg('CX', o.c[0], t), g1('H', t)];
  if (kd === 'CY') return [g1('Sdg', t), cg('CX', o.c[0], t), g1('S', t)];
  if (kd === 'CH') return [g1('RY', t, -PI / 4), cg('CZ', o.c[0], t), g1('RY', t, PI / 4)];
  if (kd === 'CP' && typeof o.p === 'number') { const a = o.c[0]; return [g1('P', a, o.p / 2), cg('CX', a, t), g1('P', t, -o.p / 2), cg('CX', a, t), g1('P', t, o.p / 2)]; }
  if (o.c.length) return null;
  // однокубитные: в базис RZ + √X (с точностью до глобальной фазы)
  if (ok('RZ') && !ok(kd)) {
    const rz = { Z: PI, S: PI / 2, Sdg: -PI / 2, T: PI / 4, Tdg: -PI / 4 }[kd];
    if (rz !== undefined) return [g1('RZ', t, rz)];
    if (kd === 'P' && typeof o.p === 'number') return [g1('RZ', t, o.p)];
    if (kd === 'H') return [g1('RZ', t, PI / 2), g1('SX', t), g1('RZ', t, PI / 2)];
    if (kd === 'Y') return [g1('RZ', t, PI), g1('X', t)];
    if (kd === 'X') return [g1('SX', t), g1('SX', t)];
    if (kd === 'RX' && typeof o.p === 'number') return [g1('RZ', t, PI / 2), g1('SX', t), g1('RZ', t, o.p + PI), g1('SX', t), g1('RZ', t, PI / 2)];
    if (kd === 'RY' && typeof o.p === 'number') return [g1('SX', t), g1('RZ', t, o.p + PI), g1('SX', t), g1('RZ', t, PI)];
  }
  if (allow && !ok(kd)) {
    if (kd === 'S' && ok('T')) return [g1('T', t), g1('T', t)];
    if (kd === 'Sdg' && ok('Tdg')) return [g1('Tdg', t), g1('Tdg', t)];
    if (kd === 'Z' && ok('S')) return [g1('S', t), g1('S', t)];
    if (kd === 'Y' && ok('X') && ok('Z')) return [g1('Z', t), g1('X', t)];
    if (kd === 'SX' && ok('H') && ok('S')) return [g1('H', t), g1('S', t), g1('H', t)];
  }
  return null;
}
/** Разложить операцию до гейтов набора. { ops, complete } или null, если первого шага нет. */
export function decompose(o, allow) {
  let list = decomposeStep(o, allow); if (!list) return null;
  if (allow) {
    for (let round = 0; round < 6; round++) {
      let changed = false; const next = [];
      list.forEach(x => { if (allow.includes(kind(x))) { next.push(x); return; } const d = decomposeStep(x, allow); if (d) { next.push(...d); changed = true; } else next.push(x); });
      list = next; if (!changed) break;
    }
  }
  if (o.cond) list.forEach(x => { x.cond = o.cond; });
  return { ops: list, complete: !allow || list.every(x => allow.includes(kind(x))) };
}

// ───────── генерация кода ─────────
/** Угол текстом: кратные π/8, π/6 — дробью. style 'pi' — для подписей (π), иначе для кода (pi). */
export function fmtA(v, style) {
  if (typeof v === 'string') return v;
  if (v === null || v === undefined) return '0';
  const PIs = style === 'pi' ? 'π' : 'pi';
  if (Math.abs(v) < 1e-12) return '0';
  for (const d of [1, 2, 3, 4, 6, 8, 16]) {
    const k = v * d / Math.PI;
    if (Math.abs(k - Math.round(k)) < 1e-9 && Math.round(k) !== 0) {
      const kk = Math.round(k); const num = (kk === 1 ? '' : kk === -1 ? '-' : kk + (style === 'pi' ? '' : ' * ')) + PIs;
      return d === 1 ? num : num + (style === 'pi' ? '/' : ' / ') + d;
    }
  }
  return style === 'pi' ? String(+v.toFixed(4)) : String(+v.toPrecision(15));
}
/** Угол для кода: исходное выражение пользователя, если оно даёт то же число, иначе число. */
const angCode = o => {
  if (typeof o.p === 'number' && o.px) { try { if (Math.abs(evalExpr(o.px, {}) - o.p) < 1e-12) return o.px; } catch (e) { /* выражение зависит от переменных цикла */ } }
  return fmtA(o.p);
};
const QNAME = { H: 'h', X: 'x', Y: 'y', Z: 'z', S: 's', Sdg: 'sdg', T: 't', Tdg: 'tdg', SX: 'sx', RX: 'rx', RY: 'ry', RZ: 'rz', P: 'p', CY: 'cy', CH: 'ch', SWAP: 'swap' };
/** Строка Qiskit для одной операции (без отступа). w — отображение номера провода в текст. */
function qiskitCall(o, w = x => String(x)) {
  const kd = kind(o); const a = o.c.concat(o.q).map(w).join(', '); const ang = () => angCode(o);
  if (kd === 'M') return `qc.measure(${w(o.q[0])}, ${o.cb ?? o.q[0]})`;
  if (kd === 'R') return `qc.reset(${w(o.q[0])})`;
  if (kd === 'BAR') return `qc.barrier(${o.q.map(w).join(', ')})`;
  if (kd === 'CX') return `qc.cx(${a})`;
  if (kd === 'CCX') return `qc.ccx(${a})`;
  if (kd === 'MCX') return `qc.mcx([${o.c.map(w).join(', ')}], ${w(o.q[0])})`;
  if (kd === 'CZ') return `qc.cz(${a})`;
  if (kd === 'CCZ') return `qc.ccz(${a})`;
  if (kd === 'MCZ') return `qc.mcp(pi, [${o.c.map(w).join(', ')}], ${w(o.q[0])})`;
  if (kd === 'CP') return `qc.cp(${ang()}, ${a})`;
  if (kd === 'MCP') return `qc.mcp(${ang()}, [${o.c.map(w).join(', ')}], ${w(o.q[0])})`;
  return `qc.${QNAME[kd]}(${GATES[kd].p ? ang() + ', ' : ''}${a})`;
}
const usedBlocks = (ops, blocks) => {
  const seen = []; const visit = name => { const B = blocks[name]; if (!B || seen.includes(name)) return; (B.code.match(/^\s+([A-Za-z_]\w*)\(qc\b/gm) || []).forEach(s => visit(s.trim().replace(/\(qc$/, ''))); seen.push(name); };
  ops.forEach(o => { if (o.g === 'BLOCK') visit(o.name); (o.body || []).forEach(b => { if (b.g === 'BLOCK') visit(b.name); }); });
  return seen;
};
/**
 * Код Qiskit по схеме. Циклы for не восстанавливаются: схема хранит их развёрнутыми.
 * map (необязательно) заполняется соответствием id операции → номер строки.
 */
export function genQiskit(model, blocks = REG.blocks, map = null) {
  const L = ['from qiskit import QuantumCircuit', 'from math import pi', ''];
  usedBlocks(model.ops, blocks).forEach(b => { L.push(...blocks[b].code.split('\n'), ''); });
  const nc = model.nc || 0;
  L.push(nc ? `qc = QuantumCircuit(${model.n}, ${nc})` : `qc = QuantumCircuit(${model.n})`);
  const list = sorted(model.ops); const done = new Set();
  const line = (o, ind) => {
    if (o.g === 'BLOCK') { const B = blocks[o.name]; const pa = B ? B.params.map(p => fmtA(o.args[p.name] ?? 0)) : []; return ind + `${o.name}(qc, ${o.q.join(', ')}${pa.length ? ', ' + pa.join(', ') : ''})`; }
    return ind + qiskitCall(o);
  };
  list.forEach((o, i) => {
    if (done.has(o)) return;
    if (o.g === 'DYN') {
      if (map) map[o.id] = L.length;
      L.push(`with qc.while_loop((qc.clbits[${o.cbit}], ${o.cval})):`); o.body.forEach(b => L.push(line(b, '    '))); return;
    }
    if (o.cond) {
      L.push(`with qc.if_test((qc.clbits[${o.cond.bit}], ${o.cond.val})):`);
      for (let j = i; j < list.length; j++) { const x = list[j]; if (!x.cond || x.cond.bit !== o.cond.bit || x.cond.val !== o.cond.val || x.g === 'DYN') break; if (map) map[x.id] = L.length; L.push(line(x, '    ')); done.add(x); }
      return;
    }
    // подряд идущие измерения всех кубитов в свои биты — одной строкой
    if (o.g === 'M' && nc >= model.n && o.q[0] === 0 && (o.cb ?? 0) === 0) {
      const run = list.slice(i, i + model.n);
      if (run.length === model.n && run.every((x, k) => x.g === 'M' && !x.cond && x.q[0] === k && (x.cb ?? k) === k) && model.n > 1) {
        run.forEach(x => { done.add(x); if (map) map[x.id] = L.length; }); L.push(`qc.measure(range(${model.n}), range(${model.n}))`); return;
      }
    }
    if (map) map[o.id] = L.length; L.push(line(o, ''));
  });
  return L.join('\n');
}
/** Тело блока по операциям редактора блока (имена проводов и параметров сохраняются). */
export function blockBodyCode(wires, ops) {
  const w = k => wires[k];
  const body = sorted(ops).map(o => '    ' + qiskitCall(o, w));
  return body.length ? body : ['    pass'];
}
const fullyFlat = (model, blocks) => flatOps(model, blocks);
export function genQasm(model, v2 = false, blocks = REG.blocks) {
  const nc = model.nc || 0;
  const L = [v2 ? 'OPENQASM 2.0;' : 'OPENQASM 3.0;', v2 ? 'include "qelib1.inc";' : 'include "stdgates.inc";', v2 ? `qreg q[${model.n}];` : `qubit[${model.n}] q;`];
  if (nc) L.push(v2 ? `creg c[${nc}];` : `bit[${nc}] c;`);
  const qm = { H: 'h', X: 'x', Y: 'y', Z: 'z', S: 's', Sdg: 'sdg', T: 't', Tdg: 'tdg', SX: 'sx', RX: 'rx', RY: 'ry', RZ: 'rz', P: v2 ? 'u1' : 'p', CX: 'cx', CCX: 'ccx', CZ: 'cz', CY: 'cy', CH: 'ch', CP: v2 ? 'cu1' : 'cp', SWAP: 'swap' };
  const stmt = o => {
    const kd = kind(o); const qs = o.c.concat(o.q).map(x => `q[${x}]`).join(', ');
    if (kd === 'M') return v2 ? `measure q[${o.q[0]}] -> c[${o.cb}];` : `c[${o.cb}] = measure q[${o.q[0]}];`;
    if (kd === 'R') return `reset q[${o.q[0]}];`;
    if (kd === 'BAR') return `barrier ${o.q.map(x => `q[${x}]`).join(', ')};`;
    if (!v2 && ['MCX', 'CCZ', 'MCZ', 'MCP'].includes(kd)) { const base = kd === 'MCX' ? 'x' : kd === 'MCP' ? `p(${fmtA(o.p)})` : 'z'; return `ctrl(${o.c.length}) @ ${base} ${qs};`; }
    if (!qm[kd]) return `// ${kd} на ${qs}: в OpenQASM 2.0 нет такого гейта, разложите его на схеме`;
    const hasP = o.p !== null && o.p !== undefined && (GATES[o.g].p || (GATES[o.g].base && GATES[GATES[o.g].base].p));
    return `${qm[kd]}${hasP ? '(' + fmtA(o.p) + ')' : ''} ${qs};`;
  };
  let lastBlock = null;
  fullyFlat(model, blocks).forEach(o => {
    if (o.from !== undefined && o.from !== lastBlock) { const src = model.ops.find(x => x.id === o.from); L.push('// блок ' + (src ? src.name : '')); }
    lastBlock = o.from;
    if (o.g === 'DYN') {
      if (v2) { L.push(`// цикл «${o.label}»: в OpenQASM 2.0 нет циклов по измерению`); return; }
      L.push(`while (c[${o.cbit}] == ${o.cval}) {`); o.body.forEach(b => L.push('  ' + stmt(b))); L.push('}'); return;
    }
    if (o.cond) { L.push(v2 ? `// условие c[${o.cond.bit}] == ${o.cond.val}: в OpenQASM 2.0 условие ставится только на весь регистр\n${stmt(o)}` : `if (c[${o.cond.bit}] == ${o.cond.val}) { ${stmt(o)} }`); return; }
    L.push(stmt(o));
  });
  return L.join('\n');
}
export function genPenny(model, blocks = REG.blocks) {
  const L = ['import pennylane as qml', 'from math import pi', '', `dev = qml.device("default.qubit", wires=${model.n})`, '', '@qml.qnode(dev)', 'def circuit():'];
  const pm = { H: 'Hadamard', X: 'PauliX', Y: 'PauliY', Z: 'PauliZ', S: 'S', T: 'T', SX: 'SX', RX: 'RX', RY: 'RY', RZ: 'RZ', P: 'PhaseShift', CX: 'CNOT', CCX: 'Toffoli', CZ: 'CZ', CCZ: 'CCZ', CY: 'CY', CH: 'CH', CP: 'ControlledPhaseShift', SWAP: 'SWAP' };
  const meas = {};
  fullyFlat(model, blocks).forEach(o => {
    const kd = kind(o); const w = o.c.concat(o.q); const ws = w.length > 1 ? '[' + w.join(', ') + ']' : String(w[0]);
    if (kd === 'BAR') return;
    if (kd === 'DYN') { L.push(`    # цикл «${o.label}»: в PennyLane нет цикла по измерению, запишите его вручную`); return; }
    if (kd === 'M') { meas[o.cb] = true; L.push(`    m${o.cb} = qml.measure(${o.q[0]})`); return; }
    if (kd === 'R') { L.push(`    qml.measure(${o.q[0]}, reset=True)`); return; }
    let call;
    const ang = o.p !== null && o.p !== undefined ? fmtA(o.p) + ', ' : '';
    if (kd === 'Sdg' || kd === 'Tdg') call = [`qml.adjoint(qml.${kd[0]})`, `wires=${ws}`];
    else if (kd === 'MCX') call = ['qml.MultiControlledX', `wires=${ws}`];
    else if (kd === 'MCZ' || kd === 'MCP') call = [`qml.ctrl(qml.PhaseShift, control=[${o.c.join(', ')}])`, `${kd === 'MCZ' ? 'pi' : fmtA(o.p)}, wires=${o.q[0]}`];
    else call = [`qml.${pm[kd]}`, `${GATES[o.g].p || kd === 'CP' ? ang : ''}wires=${ws}`];
    if (o.cond) L.push(meas[o.cond.bit] ? `    qml.cond(m${o.cond.bit} == ${o.cond.val}, ${call[0]})(${call[1]})` : `    # условие по биту c${o.cond.bit}, который не измерялся\n    ${call[0]}(${call[1]})`);
    else L.push(`    ${call[0]}(${call[1]})`);
  });
  L.push(`    return qml.probs(wires=range(${model.n}))`);
  return L.join('\n');
}
export function genCirq(model, blocks = REG.blocks) {
  const L = ['import cirq', 'from math import pi', '', `q = cirq.LineQubit.range(${model.n})`, 'c = cirq.Circuit()'];
  const cm = { H: 'H', X: 'X', Y: 'Y', Z: 'Z', S: 'S', T: 'T', CX: 'CNOT', CCX: 'CCX', CZ: 'CZ', CCZ: 'CCZ', SWAP: 'SWAP' };
  fullyFlat(model, blocks).forEach(o => {
    const kd = kind(o); const w = o.c.concat(o.q).map(x => `q[${x}]`).join(', '); const tq = `q[${o.q[0]}]`;
    if (kd === 'BAR') return;
    if (kd === 'DYN') { L.push(`# цикл «${o.label}»: в Cirq запишите его через cirq.CircuitOperation(..., repeat_until=...)`); return; }
    let s;
    if (kd === 'M') s = `cirq.measure(${tq}, key="c${o.cb}")`;
    else if (kd === 'R') s = `cirq.ResetChannel()(${tq})`;
    else if (kd === 'Sdg') s = `(cirq.S**-1)(${w})`; else if (kd === 'Tdg') s = `(cirq.T**-1)(${w})`; else if (kd === 'SX') s = `(cirq.X**0.5)(${w})`;
    else if (['RX', 'RY', 'RZ'].includes(kd)) s = `cirq.${kd.toLowerCase()}(${fmtA(o.p)})(${w})`;
    else if (kd === 'P') s = `cirq.ZPowGate(exponent=${fmtA(o.p)} / pi)(${w})`;
    else if (kd === 'CP') s = `cirq.CZPowGate(exponent=${fmtA(o.p)} / pi)(${w})`;
    else if (kd === 'CY') s = `cirq.ControlledGate(cirq.Y)(${w})`; else if (kd === 'CH') s = `cirq.ControlledGate(cirq.H)(${w})`;
    else if (kd === 'MCX') s = `cirq.ControlledGate(cirq.X, num_controls=${o.c.length})(${w})`;
    else if (kd === 'MCZ') s = `cirq.ControlledGate(cirq.Z, num_controls=${o.c.length})(${w})`;
    else if (kd === 'MCP') s = `cirq.ControlledGate(cirq.ZPowGate(exponent=${fmtA(o.p)} / pi), num_controls=${o.c.length})(${w})`;
    else s = `cirq.${cm[kd]}(${w})`;
    if (o.cond) s += o.cond.val ? `.with_classical_controls("c${o.cond.bit}")` : `.with_classical_controls(cirq.SympyCondition(sympy.Eq(sympy.Symbol("c${o.cond.bit}"), 0)))`;
    L.push(`c.append(${s})`);
  });
  if (L.some(l => l.includes('sympy.'))) L.splice(1, 0, 'import sympy');
  return L.join('\n');
}
/** Схема в формате SPARQ: источник правды для хранения и передачи в задачу. */
export function genJson(model) {
  const pack = o => { const r = { g: o.g, q: o.q, col: o.col }; if (o.c && o.c.length) r.c = o.c; if (o.p !== null && o.p !== undefined) r.p = o.p; if (o.g === 'M') r.cb = o.cb; if (o.cond) r.cond = o.cond; if (o.name) { r.name = o.name; r.args = o.args; } if (o.g === 'DYN') { r.cbit = o.cbit; r.cval = o.cval; r.body = o.body.map(pack); } return r; };
  return JSON.stringify({ format: 'sparq-circuit', version: 1, qubits: model.n, clbits: model.nc || 0, ops: sorted(model.ops).map(pack) }, null, 2);
}
export function genLatex(model) {
  const rows = []; for (let q = 0; q < model.n; q++) rows.push([`\\lstick{$q_${q}$}`]);
  const cols = Math.max(0, ...model.ops.map(o => o.col + spanOf(o)));
  for (let c = 0; c < cols; c++) {
    for (let q = 0; q < model.n; q++) rows[q].push('\\qw');
    model.ops.filter(o => o.col === c).forEach(o => {
      const t = o.q[0]; const set = (q, s) => { rows[q][c + 1] = s; };
      if (o.g === 'M') set(t, '\\meter{}');
      else if (o.g === 'R') set(t, '\\gate{\\ket{0}}');
      else if (o.g === 'BAR') o.q.forEach(q => set(q, '\\qw\\slice{}'));
      else if (o.g === 'BLOCK' || o.g === 'DYN') set(Math.min(...o.q), `\\gate[${Math.max(...o.q) - Math.min(...o.q) + 1}]{\\mathrm{${(o.name || 'while').replace(/_/g, '\\_')}}}`);
      else if (o.g === 'SWAP') { set(o.q[0], `\\swap{${o.q[1] - o.q[0]}}`); set(o.q[1], '\\targX{}'); }
      else {
        const body = o.g === 'CX' ? '\\targ{}' : o.g === 'CZ' ? '\\control{}' : `\\gate{${({ Sdg: 'S^\\dagger', Tdg: 'T^\\dagger', SX: '\\sqrt{X}', CY: 'Y', CH: 'H', CP: 'P' })[o.g] || o.g}}`;
        set(t, body); o.c.forEach(k => set(k, `\\ctrl{${t - k}}`));
      }
    });
  }
  return '\\begin{quantikz}\n' + rows.map(r => r.join(' & ') + ' & \\qw').join(' \\\\\n') + '\n\\end{quantikz}';
}

// ───────── симуляция ─────────
function applyGate(re, im, n, o) {
  const N = 1 << n;
  if (o.g === 'SWAP') {
    const a = 1 << o.q[0], b = 1 << o.q[1];
    for (let i = 0; i < N; i++) if ((i & a) && !(i & b)) { const j = i ^ a ^ b; let t = re[i]; re[i] = re[j]; re[j] = t; t = im[i]; im[i] = im[j]; im[j] = t; }
    return;
  }
  const G = GATES[o.g]; const base = G.base ? GATES[G.base] : G; const m = base.m(typeof o.p === 'number' ? o.p : 0);
  const t = 1 << o.q[0]; let cm = 0; (o.c || []).forEach(c => { cm |= 1 << c; });
  for (let i = 0; i < N; i++) {
    if (i & t) continue; if ((i & cm) !== cm) continue; const j = i | t;
    const ar = re[i], ai = im[i], br = re[j], bi = im[j];
    re[i] = m[0][0] * ar - m[0][1] * ai + m[1][0] * br - m[1][1] * bi; im[i] = m[0][0] * ai + m[0][1] * ar + m[1][0] * bi + m[1][1] * br;
    re[j] = m[2][0] * ar - m[2][1] * ai + m[3][0] * br - m[3][1] * bi; im[j] = m[2][0] * ai + m[2][1] * ar + m[3][0] * bi + m[3][1] * br;
  }
}
/** Разделить ветвь измерением кубита q: массив из одной или двух ветвей { p, re, im, cb, out }. */
function splitBranch(b, n, q) {
  const N = 1 << n, bit = 1 << q; let p1 = 0;
  for (let i = 0; i < N; i++) if (i & bit) p1 += b.re[i] ** 2 + b.im[i] ** 2;
  const res = [];
  [[0, 1 - p1], [1, p1]].forEach(([v, pv]) => {
    if (pv < 1e-12) return;
    const re = new Float64Array(N), im = new Float64Array(N), s = 1 / Math.sqrt(pv);
    for (let i = 0; i < N; i++) if (!!(i & bit) === !!v) { re[i] = b.re[i] * s; im[i] = b.im[i] * s; }
    res.push({ p: b.p * pv, re, im, cb: b.cb, out: v });
  });
  return res;
}
function runOps(st, branches, ops, blocks) {
  for (const o of ops) {
    if (o.g === 'BAR') continue;
    if (o.g === 'BLOCK') { const B = blocks[o.name]; if (B) branches = runOps(st, branches, expandBlock(B, o.args, blocks).map(x => remap(x, o.q, o)), blocks); continue; }
    if (o.g === 'DYN') {
      st.dynamic = true; let done = [], active = branches;
      for (let it = 0; it <= MAX_WHILE; it++) {
        const go = []; active.forEach(b => (((b.cb >> o.cbit) & 1) === o.cval ? go : done).push(b));
        if (!go.length) { active = []; break; }
        if (it === MAX_WHILE) { st.lost += go.reduce((s, b) => s + b.p, 0); active = []; break; }
        active = runOps(st, go, o.body, blocks);
      }
      branches = done.concat(active); continue;
    }
    const on = b => !o.cond || ((b.cb >> o.cond.bit) & 1) === o.cond.val;
    if (o.cond) st.dynamic = true;
    if (o.g === 'M' || o.g === 'R') {
      st.dynamic = true; if (o.g === 'M') st.measured |= 1 << o.cb;
      const next = [];
      branches.forEach(b => {
        if (!on(b)) { next.push(b); return; }
        splitBranch(b, st.n, o.q[0]).forEach(s => {
          if (o.g === 'M') s.cb = s.out ? s.cb | (1 << o.cb) : s.cb & ~(1 << o.cb);
          else if (s.out) applyGate(s.re, s.im, st.n, { g: 'X', q: [o.q[0]], c: [] });
          next.push(s);
        });
      });
      branches = next.filter(b => { if (b.p > 1e-12) return true; st.lost += b.p; return false; });
      if (branches.length > MAX_BRANCHES) throw new Error('слишком много ветвей измерений (больше ' + MAX_BRANCHES + '): уменьшите число промежуточных измерений');
      continue;
    }
    branches.forEach(b => { if (on(b)) applyGate(b.re, b.im, st.n, o); });
  }
  return branches;
}
/**
 * Точная симуляция с ветвлением по исходам измерений.
 * upto — последний учитываемый столбец (null — вся схема); init — номер начального базисного состояния.
 * Результат: { n, nc, branches:[{p,re,im,cb}], measured: маска записанных битов, dynamic, lost }.
 */
export function simulate(model, upto = null, blocks = REG.blocks, init = 0) {
  const N = 1 << model.n; const re = new Float64Array(N), im = new Float64Array(N); re[init] = 1;
  const st = { n: model.n, nc: model.nc || 0, measured: 0, dynamic: false, lost: 0, branches: [] };
  const ops = sorted(model.ops).filter(o => upto === null || o.col <= upto);
  st.branches = runOps(st, [{ p: 1, re, im, cb: 0 }], ops, blocks);
  return st;
}
/** Вероятности базисных состояний кубитов (смесь по ветвям). */
export function probsOf(st) {
  const N = 1 << st.n, p = new Float64Array(N);
  st.branches.forEach(b => { for (let i = 0; i < N; i++) p[i] += b.p * (b.re[i] ** 2 + b.im[i] ** 2); });
  return p;
}
/** Распределение значений классического регистра: Float64Array длины 2^nc. */
export function clbitDist(st) {
  const d = new Float64Array(1 << st.nc); st.branches.forEach(b => { d[b.cb] += b.p; }); return d;
}
function pauliBranch(b, n, str) {
  const N = 1 << n; let xm = 0, zm = 0, ny = 0;
  for (let q = 0; q < n; q++) { const c = str[q]; if (c === 'X' || c === 'Y') xm |= 1 << q; if (c === 'Z' || c === 'Y') zm |= 1 << q; if (c === 'Y') ny++; }
  let sr = 0;
  for (let i = 0; i < N; i++) {
    const j = i ^ xm; let par = 0, v = i & zm; while (v) { par ^= 1; v &= v - 1; }
    let pr = par ? -1 : 1, pi_ = 0; const yk = ny % 4;
    if (yk === 1) { pi_ = pr; pr = 0; } else if (yk === 2) { pr = -pr; } else if (yk === 3) { pi_ = -pr; pr = 0; }
    const tr = pr * b.re[i] - pi_ * b.im[i], ti = pr * b.im[i] + pi_ * b.re[i];
    sr += b.re[j] * tr + b.im[j] * ti;
  }
  return sr;
}
/** Среднее значение строки Паули (str[q] из I, X, Y, Z; q0 первый). */
export function pauliExp(st, str) { return st.branches.reduce((s, b) => s + b.p * pauliBranch(b, st.n, str), 0) / (1 - st.lost || 1); }
export function blochOf(st, q) {
  const s = k => { const a = Array(st.n).fill('I'); a[q] = k; return a; };
  return { x: pauliExp(st, s('X')), y: pauliExp(st, s('Y')), z: pauliExp(st, s('Z')) };
}
/** Матрица плотности: { re, im } — массивы N×N по строкам. */
export function densityOf(st) {
  const N = 1 << st.n; const re = new Float64Array(N * N), im = new Float64Array(N * N);
  st.branches.forEach(b => { for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) { re[i * N + j] += b.p * (b.re[i] * b.re[j] + b.im[i] * b.im[j]); im[i * N + j] += b.p * (b.im[i] * b.re[j] - b.re[i] * b.im[j]); } });
  let pur = 0; for (let k = 0; k < N * N; k++) pur += re[k] ** 2 + im[k] ** 2;
  return { re, im, N, purity: pur };
}
/** Есть ли в схеме (с учётом блоков) измерения, сброс, условия или циклы. */
export function isDynamic(model, blocks = REG.blocks) { return flatOps(model, blocks).some(o => o.g === 'M' || o.g === 'R' || o.g === 'DYN' || o.cond); }
/** Унитарная матрица схемы ({ re, im, N }, столбец j — образ |j⟩) или null, если схема не унитарна. */
export function unitaryOf(model, blocks = REG.blocks) {
  if (isDynamic(model, blocks)) return null;
  const N = 1 << model.n; const re = new Float64Array(N * N), im = new Float64Array(N * N);
  for (let j = 0; j < N; j++) { const b = simulate(model, null, blocks, j).branches[0]; for (let i = 0; i < N; i++) { re[i * N + j] = b.re[i]; im[i * N + j] = b.im[i]; } }
  return { re, im, N };
}
/** Генераторы стабилизатора чистого состояния или null, если состояние не стабилизаторное либо смешанное. */
export function stabilizers(st) {
  if (st.branches.length !== 1 || st.n > 6) return null;
  const n = st.n, found = [], L = 'IXYZ', total = Math.pow(4, n);
  for (let k = 1; k < total; k++) {
    const a = []; let v = k; for (let q = 0; q < n; q++) { a.push(L[v % 4]); v = Math.floor(v / 4); }
    const e = pauliExp(st, a); if (Math.abs(Math.abs(e) - 1) < 1e-6) found.push({ a, s: e > 0 ? '+' : '−' });
  }
  const vec = p => { let x = 0, z = 0; p.a.forEach((c, q) => { if (c === 'X' || c === 'Y') x |= 1 << q; if (c === 'Z' || c === 'Y') z |= 1 << q; }); return x + z * (1 << n); };
  const weight = p => p.a.filter(c => c !== 'I').length;
  found.sort((p, q) => weight(p) - weight(q));
  const basis = [], gens = [];
  for (const p of found) {
    let v = vec(p); for (const b of basis) { const x = xor(v, b); if (x < v) v = x; }
    if (v) { basis.push(v); basis.sort((a, b) => b - a); gens.push(p); }
    if (gens.length === n) break;
  }
  return gens.length === n ? gens : null;
}
// XOR для чисел до 2^(2n), n ≤ 6 — помещается в 32 бита при n ≤ 15
const xor = (a, b) => (a ^ b) >>> 0;

/** Модель шума прототипа: деполяризация всей схемы с точностью F и ошибка считывания e на каждый бит. */
export function noisyDist(p, bits, F, e) {
  const N = 1 << bits; let r = new Float64Array(N);
  for (let i = 0; i < N; i++) r[i] = F * p[i] + (1 - F) / N;
  for (let b = 0; b < bits; b++) { const t = new Float64Array(N); for (let i = 0; i < N; i++) { t[i] += r[i] * (1 - e); t[i ^ (1 << b)] += r[i] * e; } r = t; }
  return r;
}
export function circuitFidelity(m, noise) { return Math.pow(1 - noise.p1 / 100, m.oneQubit) * Math.pow(1 - noise.p2 / 100, m.twoQubit); }
/** Генератор случайных чисел с зерном (mulberry32). */
export function rng(seed) {
  let a = seed >>> 0;
  return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
export function sample(dist, shots, rnd) {
  const cdf = []; let acc = 0; dist.forEach(v => { acc += v; cdf.push(acc); });
  const counts = new Array(dist.length).fill(0);
  for (let s = 0; s < shots; s++) { const r = rnd() * acc; let lo = 0, hi = cdf.length - 1; while (lo < hi) { const mid = (lo + hi) >> 1; if (cdf[mid] >= r) hi = mid; else lo = mid + 1; } counts[lo]++; }
  return counts;
}

// ───────── контракт задачи ─────────
/**
 * Проверить схему на открытые ограничения задачи (то, что видно участнику до отправки).
 * task: { qubits, clbits?, allow?:[виды], limits?:{gates,depth,twoQubit,cx,t,measurements} }
 * Возвращает список { key, label, value, limit, ok }.
 */
export function checkContract(model, task, blocks = REG.blocks) {
  const m = metrics(model, blocks); const out = [];
  const names = { gates: 'гейтов', depth: 'глубина', twoQubit: 'многокубитных', cx: 'CX', t: 'T', measurements: 'измерений' };
  Object.entries(task.limits || {}).forEach(([k, lim]) => { if (names[k]) out.push({ key: k, label: names[k], value: m[k], limit: lim, ok: m[k] <= lim }); });
  if (task.qubits) out.push({ key: 'qubits', label: 'кубитов', value: model.n, limit: task.qubits, ok: model.n === task.qubits, exact: true });
  if (task.allow) { const v = violations(model, task.allow, blocks).length; out.push({ key: 'basis', label: 'вне набора', value: v, limit: 0, ok: v === 0 }); }
  return out;
}
