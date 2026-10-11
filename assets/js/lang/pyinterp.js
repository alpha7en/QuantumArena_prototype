// Интерпретатор подмножества Python для режима «код». Без eval и без доступа к DOM.
// Поддержано: числа, строки, списки, кортежи, for/while/if, def/return, генераторы списков,
// арифметика и битовые операции, срезы. Не поддержано: классы, импорт сторонних модулей, lambda, f-строки.

export class PyError extends Error {
  constructor(kind, message, line = null, hint = null) {
    super(`${kind}: ${message}`);
    this.kind = kind; this.msg = message; this.line = line; this.hint = hint;
  }
}

// ---------- Токенизатор ----------

const KEYWORDS = new Set(['def', 'return', 'for', 'while', 'if', 'elif', 'else', 'pass', 'break', 'continue', 'import',
  'from', 'as', 'and', 'or', 'not', 'in', 'is', 'True', 'False', 'None', 'lambda', 'class', 'try', 'except', 'with', 'global', 'del', 'assert', 'raise']);
const OPS3 = ['**=', '//=', '>>=', '<<='];
const OPS2 = ['**', '//', '==', '!=', '<=', '>=', '+=', '-=', '*=', '/=', '%=', '<<', '>>', '->', '&=', '|=', '^='];
const OPS1 = '+-*/%<>=()[],:.&|^~@';

export function tokenize(src) {
  const toks = [];
  const lines = src.replace(/\r\n?/g, '\n').split('\n');
  const indents = [0];
  let depth = 0, i = 0, ln = 0;
  const push = (t, v, line) => toks.push({ t, v, line });
  while (ln < lines.length) {
    let line = lines[ln], lineNo = ln + 1;
    if (depth === 0) {
      const m = /^[ \t]*/.exec(line)[0];
      const rest = line.slice(m.length);
      if (rest === '' || rest[0] === '#') { ln++; continue; }
      const ind = m.replace(/\t/g, '    ').length;
      if (ind > indents[indents.length - 1]) { indents.push(ind); push('INDENT', ind, lineNo); }
      else {
        while (ind < indents[indents.length - 1]) { indents.pop(); push('DEDENT', ind, lineNo); }
        if (ind !== indents[indents.length - 1]) throw new PyError('IndentationError', 'неверный отступ', lineNo);
      }
      i = m.length;
    } else i = 0;
    while (i < line.length) {
      const ch = line[i];
      if (ch === ' ' || ch === '\t') { i++; continue; }
      if (ch === '#') break;
      if (ch === '\\' && i === line.length - 1) { ln++; line = lines[ln] || ''; i = 0; lineNo = ln + 1; continue; }
      if (/[0-9]/.test(ch) || (ch === '.' && /[0-9]/.test(line[i + 1] || ''))) {
        const m = /^(0[xX][0-9a-fA-F]+|0[bB][01]+|(\d[\d_]*\.?\d*|\.\d+)([eE][+-]?\d+)?)/.exec(line.slice(i));
        push('NUM', Number(m[0].replace(/_/g, '')), lineNo); i += m[0].length; continue;
      }
      if (/[A-Za-z_Ѐ-ӿ]/.test(ch)) {
        const m = /^[A-Za-z_Ѐ-ӿ][\wЀ-ӿ]*/.exec(line.slice(i))[0];
        if ((m === 'f' || m === 'r' || m === 'b') && /['"]/.test(line[i + m.length] || '')) { i += m.length; continue; }
        push(KEYWORDS.has(m) ? 'KW' : 'NAME', m, lineNo); i += m.length; continue;
      }
      if (ch === '"' || ch === "'") {
        const triple = line.startsWith(ch.repeat(3), i);
        if (triple) {
          let j = i + 3, buf = '';
          for (;;) {
            const k = line.indexOf(ch.repeat(3), j);
            if (k >= 0) { buf += line.slice(j, k); i = k + 3; break; }
            buf += line.slice(j) + '\n'; ln++; if (ln >= lines.length) throw new PyError('SyntaxError', 'не закрыта тройная строка', lineNo);
            line = lines[ln]; j = 0;
          }
          push('STR', buf, lineNo); continue;
        }
        let j = i + 1, buf = '';
        while (j < line.length && line[j] !== ch) { if (line[j] === '\\') { buf += line[j + 1] === 'n' ? '\n' : line[j + 1]; j += 2; } else buf += line[j++]; }
        if (j >= line.length) throw new PyError('SyntaxError', 'не закрыта строка', lineNo);
        push('STR', buf, lineNo); i = j + 1; continue;
      }
      const o3 = OPS3.find((o) => line.startsWith(o, i));
      const o2 = OPS2.find((o) => line.startsWith(o, i));
      const o = o3 || o2 || (OPS1.includes(ch) ? ch : null);
      if (!o) throw new PyError('SyntaxError', `недопустимый символ «${ch}»`, lineNo);
      if ('([{'.includes(o)) depth++;
      if (')]}'.includes(o)) depth = Math.max(0, depth - 1);
      push('OP', o, lineNo); i += o.length;
    }
    if (depth === 0) push('NEWLINE', '\n', lineNo);
    ln++;
  }
  while (indents.length > 1) { indents.pop(); push('DEDENT', 0, lines.length); }
  push('EOF', null, lines.length);
  return toks;
}

// ---------- Парсер ----------

export function parse(src) {
  const toks = tokenize(src);
  let p = 0;
  const peek = () => toks[p];
  const next = () => toks[p++];
  const isOp = (v) => toks[p].t === 'OP' && toks[p].v === v;
  const isKw = (v) => toks[p].t === 'KW' && toks[p].v === v;
  const err = (msg, tk = toks[p]) => { throw new PyError('SyntaxError', msg, tk ? tk.line : null); };
  const expectOp = (v) => { if (!isOp(v)) err(`ожидалось «${v}»`); return next(); };
  const expectKw = (v) => { if (!isKw(v)) err(`ожидалось «${v}»`); return next(); };
  const eatOp = (v) => (isOp(v) ? (next(), true) : false);

  function block() {
    expectOp(':');
    if (peek().t === 'NEWLINE') {
      next();
      if (peek().t !== 'INDENT') err('ожидался отступ');
      next();
      const body = [];
      while (peek().t !== 'DEDENT' && peek().t !== 'EOF') body.push(statement());
      if (peek().t === 'DEDENT') next();
      return body;
    }
    return [simpleStatement()];
  }

  function statement() {
    const tk = peek();
    if (tk.t === 'KW') {
      switch (tk.v) {
        case 'def': return funcDef();
        case 'if': return ifStmt();
        case 'for': return forStmt();
        case 'while': { next(); const test = expr(); return { k: 'While', test, body: block(), line: tk.line }; }
        case 'class': case 'try': case 'with': err(`«${tk.v}» не поддерживается в режиме кода`);
      }
    }
    return simpleStatement();
  }

  function funcDef() {
    const tk = next();
    const name = next();
    if (name.t !== 'NAME') err('ожидалось имя функции', name);
    expectOp('(');
    const params = [];
    while (!isOp(')')) {
      const pn = next();
      if (pn.t !== 'NAME') err('ожидалось имя параметра', pn);
      let def = null;
      if (eatOp(':')) ternary();           // аннотация типа игнорируется
      if (eatOp('=')) def = ternary();
      params.push({ name: pn.v, def });
      if (!eatOp(',')) break;
    }
    expectOp(')');
    if (eatOp('->')) ternary();
    return { k: 'Def', name: name.v, params, body: block(), line: tk.line };
  }

  function ifStmt() {
    const tk = next();
    const test = expr();
    const body = block();
    let orelse = [];
    if (isKw('elif')) { orelse = [ifStmt()]; }
    else if (isKw('else')) { next(); orelse = block(); }
    return { k: 'If', test, body, orelse, line: tk.line };
  }

  function forStmt() {
    const tk = next();
    const target = targetList();
    expectKw('in');
    const iter = exprList();
    return { k: 'For', target, iter, body: block(), line: tk.line };
  }

  function targetList() {
    const items = [target1()];
    while (eatOp(',')) { if (isKw('in')) break; items.push(target1()); }
    return items.length === 1 ? items[0] : { k: 'Tuple', items };
  }
  function target1() {
    if (eatOp('(')) { const t = targetList(); expectOp(')'); return t; }
    const tk = next();
    if (tk.t !== 'NAME') err('ожидалось имя переменной', tk);
    let node = { k: 'Name', id: tk.v, line: tk.line };
    return trailers(node);
  }

  function simpleStatement() {
    const tk = peek();
    let st;
    if (tk.t === 'KW') {
      switch (tk.v) {
        case 'pass': next(); st = { k: 'Pass', line: tk.line }; break;
        case 'break': next(); st = { k: 'Break', line: tk.line }; break;
        case 'continue': next(); st = { k: 'Continue', line: tk.line }; break;
        case 'return': { next(); const v = (peek().t === 'NEWLINE') ? null : exprList(); st = { k: 'Return', value: v, line: tk.line }; break; }
        case 'import': {
          next(); const names = [];
          do { const n = dotted(); let as = null; if (isKw('as')) { next(); as = next().v; } names.push({ name: n, as }); } while (eatOp(','));
          st = { k: 'Import', names, line: tk.line }; break;
        }
        case 'from': {
          next(); const mod = dotted(); expectKw('import');
          const names = [];
          if (eatOp('(')) { /* скобки */ }
          if (isOp('*')) { next(); names.push({ name: '*', as: null }); }
          else do { const n = next().v; let as = null; if (isKw('as')) { next(); as = next().v; } names.push({ name: n, as }); } while (eatOp(','));
          eatOp(')');
          st = { k: 'ImportFrom', mod, names, line: tk.line }; break;
        }
        case 'global': { next(); do next(); while (eatOp(',')); st = { k: 'Pass', line: tk.line }; break; }
        case 'assert': { next(); expr(); if (eatOp(',')) expr(); st = { k: 'Pass', line: tk.line }; break; }
        case 'raise': err('raise не поддерживается');
        default: st = exprOrAssign();
      }
    } else st = exprOrAssign();
    if (peek().t === 'NEWLINE') next();
    else if (peek().t !== 'EOF' && peek().t !== 'DEDENT') err('ожидался конец строки');
    return st;
  }

  function dotted() { let s = next().v; while (eatOp('.')) s += '.' + next().v; return s; }

  function exprOrAssign() {
    const tk = peek();
    const first = exprList();
    if (isOp(':') && first.k === 'Name') { next(); ternary(); if (eatOp('=')) { const v = exprList(); return { k: 'Assign', targets: [first], value: v, line: tk.line }; } return { k: 'Pass', line: tk.line }; }
    if (isOp('=')) {
      const targets = [first]; let value;
      while (eatOp('=')) { value = exprList(); if (isOp('=')) targets.push(value); }
      targets.forEach(checkTarget);
      return { k: 'Assign', targets, value, line: tk.line };
    }
    const aug = ['+=', '-=', '*=', '/=', '//=', '%=', '**=', '<<=', '>>=', '&=', '|=', '^='].find((o) => isOp(o));
    if (aug) { next(); checkTarget(first); return { k: 'AugAssign', op: aug.slice(0, -1), target: first, value: exprList(), line: tk.line }; }
    return { k: 'Expr', value: first, line: tk.line };
  }
  function checkTarget(t) {
    if (t.k === 'Tuple') return t.items.forEach(checkTarget);
    if (t.k !== 'Name' && t.k !== 'Subscript' && t.k !== 'Attr') err('нельзя присвоить значение этому выражению');
  }

  function exprList() {
    const first = expr();
    if (!isOp(',')) return first;
    const items = [first];
    while (eatOp(',')) { if (['NEWLINE', 'EOF'].includes(peek().t) || isOp('=') || isOp(')')) break; items.push(expr()); }
    return { k: 'Tuple', items };
  }

  const expr = () => ternary();
  function ternary() {
    const body = orTest();
    if (isKw('if')) { next(); const test = orTest(); expectKw('else'); const orelse = ternary(); return { k: 'IfExp', test, body, orelse }; }
    return body;
  }
  function orTest() { let l = andTest(); while (isKw('or')) { next(); l = { k: 'Bool', op: 'or', l, r: andTest() }; } return l; }
  function andTest() { let l = notTest(); while (isKw('and')) { next(); l = { k: 'Bool', op: 'and', l, r: notTest() }; } return l; }
  function notTest() { if (isKw('not')) { next(); return { k: 'Not', v: notTest() }; } return comparison(); }
  function comparison() {
    const left = bitOr(); const ops = [], rights = [];
    for (;;) {
      let op = null;
      if (peek().t === 'OP' && ['<', '>', '==', '!=', '<=', '>='].includes(peek().v)) op = next().v;
      else if (isKw('in')) { next(); op = 'in'; }
      else if (isKw('not') && toks[p + 1].t === 'KW' && toks[p + 1].v === 'in') { next(); next(); op = 'not in'; }
      else if (isKw('is')) { next(); op = 'is'; if (isKw('not')) { next(); op = 'is not'; } }
      if (!op) break;
      ops.push(op); rights.push(bitOr());
    }
    return ops.length ? { k: 'Cmp', left, ops, rights, line: peek().line } : left;
  }
  const binLevel = (sub, set) => () => {
    let l = sub();
    while (peek().t === 'OP' && set.includes(peek().v)) { const op = next().v; l = { k: 'Bin', op, l, r: sub(), line: peek().line }; }
    return l;
  };
  function unary() {
    if (peek().t === 'OP' && ['-', '+', '~'].includes(peek().v)) { const op = next().v; return { k: 'Un', op, v: unary() }; }
    return power();
  }
  function power() {
    const base = trailers(atom());
    if (isOp('**')) { next(); return { k: 'Bin', op: '**', l: base, r: unary(), line: peek().line }; }
    return base;
  }
  const mul = binLevel(unary, ['*', '/', '//', '%']);
  const add = binLevel(mul, ['+', '-']);
  const shift = binLevel(add, ['<<', '>>']);
  const bitAnd = binLevel(shift, ['&']);
  const bitXor = binLevel(bitAnd, ['^']);
  const bitOr = binLevel(bitXor, ['|']);

  function trailers(node) {
    for (;;) {
      if (isOp('(')) {
        const tk = next(); const args = [], kwargs = [];
        while (!isOp(')')) {
          if (peek().t === 'NAME' && toks[p + 1].t === 'OP' && toks[p + 1].v === '=') { const k = next().v; next(); kwargs.push([k, expr()]); }
          else if (isOp('*')) { next(); args.push({ k: 'Star', v: expr() }); }
          else {
            const e = expr();
            if (isKw('for')) { args.push(compTail(e, null)); } else args.push(e);
          }
          if (!eatOp(',')) break;
        }
        expectOp(')');
        node = { k: 'Call', fn: node, args, kwargs, line: tk.line };
      } else if (isOp('.')) {
        next(); const n = next();
        if (n.t !== 'NAME' && n.t !== 'KW') err('ожидалось имя после «.»', n);
        node = { k: 'Attr', obj: node, name: n.v, line: n.line };
      } else if (isOp('[')) {
        const tk = next();
        let idx = sliceOrExpr();
        expectOp(']');
        node = { k: 'Subscript', obj: node, idx, line: tk.line };
      } else return node;
    }
  }
  function sliceOrExpr() {
    let lo = null, hi = null, st = null, sawColon = false;
    if (!isOp(':')) lo = expr();
    if (isOp(':')) {
      sawColon = true; next();
      if (!isOp(']') && !isOp(':')) hi = expr();
      if (eatOp(':')) { if (!isOp(']')) st = expr(); }
    }
    return sawColon ? { k: 'Slice', lo, hi, st } : lo;
  }

  function compTail(elt, closer) {
    const clauses = [];
    while (isKw('for')) {
      next(); const target = targetList(); expectKw('in');
      const iter = orTest();
      const conds = [];
      while (isKw('if')) { next(); conds.push(orTest()); }
      clauses.push({ target, iter, conds });
    }
    return { k: 'Comp', elt, clauses };
  }

  function atom() {
    const tk = next();
    switch (tk.t) {
      case 'NUM': return { k: 'Num', v: tk.v };
      case 'STR': { let s = tk.v; while (peek().t === 'STR') s += next().v; return { k: 'Str', v: s }; }
      case 'NAME': return { k: 'Name', id: tk.v, line: tk.line };
      case 'KW':
        if (tk.v === 'True') return { k: 'Num', v: true };
        if (tk.v === 'False') return { k: 'Num', v: false };
        if (tk.v === 'None') return { k: 'Num', v: null };
        err(`неожиданное слово «${tk.v}»`, tk); break;
      case 'OP':
        if (tk.v === '(') {
          if (eatOp(')')) return { k: 'Tuple', items: [] };
          const e = expr();
          if (isKw('for')) { const c = compTail(e); expectOp(')'); return c; }
          if (isOp(',')) { const items = [e]; while (eatOp(',')) { if (isOp(')')) break; items.push(expr()); } expectOp(')'); return { k: 'Tuple', items }; }
          expectOp(')'); return e;
        }
        if (tk.v === '[') {
          if (eatOp(']')) return { k: 'List', items: [] };
          const e = expr();
          if (isKw('for')) { const c = compTail(e); expectOp(']'); return { k: 'ListComp', comp: c }; }
          const items = [e];
          while (eatOp(',')) { if (isOp(']')) break; items.push(expr()); }
          expectOp(']'); return { k: 'List', items };
        }
        break;
    }
    err(tk.t === 'NEWLINE' || tk.t === 'EOF' ? 'неожиданный конец строки' : `неожиданный символ «${tk.v}»`, tk);
  }

  const body = [];
  while (peek().t !== 'EOF') {
    if (peek().t === 'NEWLINE') { next(); continue; }
    if (peek().t === 'INDENT') err('неожиданный отступ');
    body.push(statement());
  }
  return { k: 'Module', body };
}

// ---------- Вычисление ----------

class Return { constructor(v) { this.v = v; } }
class Break {}
class Continue {}

const pyMod = (a, b) => { if (b === 0) throw new PyError('ZeroDivisionError', 'деление на ноль'); const r = a % b; return r !== 0 && (r < 0) !== (b < 0) ? r + b : r; };

export const typeName = (v) => v === null ? 'NoneType' : Array.isArray(v) ? 'list' : typeof v === 'number' ? 'number' : typeof v === 'string' ? 'str' : typeof v === 'boolean' ? 'bool' : (v && v.pyType) || 'object';

export class Interp {
  constructor({ globals = {}, maxSteps = 3_000_000, maxRange = 200_000 } = {}) {
    this.globals = Object.assign(Object.create(null), globals);
    this.maxSteps = maxSteps; this.maxRange = maxRange; this.steps = 0; this.line = null; this.stdout = [];
    this.modules = Object.create(null);
    this.builtins = this.makeBuiltins();
  }

  err(kind, msg, hint) { return new PyError(kind, msg, this.line, hint); }

  makeBuiltins() {
    const it = this;
    const toList = (v) => it.iter(v);
    return {
      range: (...a) => {
        let s = 0, e, st = 1;
        if (a.length === 1) e = a[0]; else if (a.length === 2) [s, e] = a; else[s, e, st] = a;
        if (st === 0) throw it.err('ValueError', 'шаг range() не может быть 0');
        const n = Math.max(0, Math.ceil((e - s) / st));
        if (n > it.maxRange) throw it.err('LimitError', 'слишком длинный range()');
        return Array.from({ length: n }, (_, i) => s + i * st);
      },
      len: (v) => { if (v == null || v.length === undefined) throw it.err('TypeError', 'у объекта нет длины'); return v.length; },
      int: (v) => (typeof v === 'string' ? parseInt(v, 10) : Math.trunc(Number(v))),
      float: (v) => Number(v), bool: (v) => it.truthy(v), str: (v) => String(v),
      abs: Math.abs, pow: Math.pow,
      min: (...a) => Math.min(...(a.length === 1 ? toList(a[0]) : a)),
      max: (...a) => Math.max(...(a.length === 1 ? toList(a[0]) : a)),
      sum: (v, s = 0) => toList(v).reduce((x, y) => x + y, s),
      round: (v, d = 0) => { const f = 10 ** d; const x = v * f, r = Math.round(x); return (Math.abs(x % 1) === 0.5 && r % 2 !== 0 ? r - 1 : r) / f; },
      list: (v = []) => toList(v).slice(), tuple: (v = []) => toList(v).slice(),
      reversed: (v) => toList(v).slice().reverse(),
      sorted: (v, kw) => toList(v).slice().sort((a, b) => a - b),
      enumerate: (v, s = 0) => toList(v).map((x, i) => [i + s, x]),
      zip: (...ls) => { const L = ls.map(toList); const n = Math.min(...L.map((l) => l.length)); return Array.from({ length: n }, (_, i) => L.map((l) => l[i])); },
      divmod: (a, b) => [Math.floor(a / b), pyMod(a, b)],
      print: (...a) => { it.stdout.push(a.map((x) => it.str(x)).join(' ')); return null; },
      isinstance: () => true,
    };
  }

  str(v) {
    if (v === null) return 'None'; if (v === true) return 'True'; if (v === false) return 'False';
    if (Array.isArray(v)) return '[' + v.map((x) => this.str(x)).join(', ') + ']';
    return String(v);
  }
  truthy(v) { if (Array.isArray(v) || typeof v === 'string') return v.length > 0; return !!v; }
  iter(v) {
    if (Array.isArray(v)) return v;
    if (typeof v === 'string') return v.split('');
    if (v && typeof v.pyIter === 'function') return v.pyIter();
    throw this.err('TypeError', `объект типа ${typeName(v)} нельзя перебирать`);
  }

  tick() { if (++this.steps > this.maxSteps) throw this.err('LimitError', 'превышен лимит шагов выполнения (бесконечный цикл?)'); }

  run(ast) { this.depth = 0; this.execBlock(ast.body, this.globals, null); return this; }

  call(name, args = [], kwargs = {}) {
    this.depth = 0;
    const f = this.globals[name];
    if (typeof f !== 'function' && !(f && f.pyFunc)) throw new PyError('NameError', `функция ${name}() не определена`, null);
    return this.callValue(f, args, kwargs);
  }

  execBlock(body, scope, fn) { for (const st of body) { const r = this.exec(st, scope, fn); if (r !== undefined) return r; } return undefined; }

  lookup(name, scope) {
    for (let s = scope; s; s = s.__parent) if (name in s) return s[name];
    if (name in this.globals) return this.globals[name];
    if (name in this.builtins) return this.builtins[name];
    throw this.err('NameError', `имя «${name}» не определено`);
  }
  assignName(name, v, scope) { scope[name] = v; }

  exec(st, scope, fn) {
    this.tick(); this.line = st.line ?? this.line;
    switch (st.k) {
      case 'Expr': this.eval(st.value, scope); return undefined;
      case 'Assign': { const v = this.eval(st.value, scope); for (const t of st.targets) this.assign(t, v, scope); return undefined; }
      case 'AugAssign': { const cur = this.eval(st.target, scope); this.assign(st.target, this.binop(st.op, cur, this.eval(st.value, scope)), scope); return undefined; }
      case 'If': return this.execBlock(this.truthy(this.eval(st.test, scope)) ? st.body : st.orelse, scope, fn);
      case 'While': {
        while (this.truthy(this.eval(st.test, scope))) {
          this.tick();
          const r = this.execBlock(st.body, scope, fn);
          if (r instanceof Break) break;
          if (r instanceof Return) return r;
        }
        return undefined;
      }
      case 'For': {
        const items = this.iter(this.eval(st.iter, scope));
        for (const x of items.slice()) {
          this.tick();
          this.assign(st.target, x, scope);
          const r = this.execBlock(st.body, scope, fn);
          if (r instanceof Break) break;
          if (r instanceof Return) return r;
        }
        return undefined;
      }
      case 'Def': { const f = { pyFunc: true, name: st.name, params: st.params, body: st.body, closure: scope === this.globals ? null : scope, defaults: st.params.map((p) => (p.def ? this.eval(p.def, scope) : undefined)) }; scope[st.name] = f; return undefined; }
      case 'Return': return new Return(st.value ? this.eval(st.value, scope) : null);
      case 'Pass': return undefined;
      case 'Break': return new Break();
      case 'Continue': return new Continue();
      case 'Import': for (const n of st.names) { scope[n.as || n.name.split('.')[0]] = this.importModule(n.name); } return undefined;
      case 'ImportFrom': {
        const mod = this.importModule(st.mod);
        for (const n of st.names) {
          if (n.name === '*') { Object.assign(scope, mod); continue; }
          if (!(n.name in mod)) throw this.err('ImportError', `не удаётся импортировать «${n.name}» из «${st.mod}»`);
          scope[n.as || n.name] = mod[n.name];
        }
        return undefined;
      }
    }
    throw this.err('SyntaxError', 'неизвестная конструкция');
  }

  importModule(name) {
    const root = name.split('.')[0];
    if (this.modules[name]) return this.modules[name];
    if (this.modules[root]) return this.modules[root];
    throw this.err('ImportError', `модуль «${name}» недоступен в режиме кода`, 'доступны: qiskit, math, numpy');
  }

  assign(t, v, scope) {
    if (t.k === 'Name') { scope[t.id] = v; return; }
    if (t.k === 'Tuple') {
      const vals = this.iter(v);
      if (vals.length !== t.items.length) throw this.err('ValueError', `нужно значений: ${t.items.length}, получено: ${vals.length}`);
      t.items.forEach((it, i) => this.assign(it, vals[i], scope)); return;
    }
    if (t.k === 'Subscript') {
      const o = this.eval(t.obj, scope); let i = this.eval(t.idx, scope);
      if (!Array.isArray(o)) throw this.err('TypeError', 'присваивание по индексу только для списков');
      if (i < 0) i += o.length;
      if (i < 0 || i >= o.length) throw this.err('IndexError', 'индекс вне диапазона');
      o[i] = v; return;
    }
    throw this.err('TypeError', 'нельзя присвоить');
  }

  callValue(f, args, kwargs = {}) {
    if (typeof f === 'function') return f.call(this, ...args, ...(Object.keys(kwargs).length ? [kwargs] : []));
    if (f && f.pyFunc) {
      if (++this.depth > 200) { this.depth = 0; throw this.err('RecursionError', 'слишком глубокая рекурсия'); }
      const local = Object.create(null); local.__parent = f.closure;
      f.params.forEach((p, i) => {
        if (i < args.length) local[p.name] = args[i];
        else if (p.name in kwargs) local[p.name] = kwargs[p.name];
        else if (f.defaults[i] !== undefined) local[p.name] = f.defaults[i];
        else throw this.err('TypeError', `${f.name}() не хватает аргумента «${p.name}»`);
      });
      if (args.length > f.params.length) throw this.err('TypeError', `${f.name}() принимает аргументов: ${f.params.length}, передано: ${args.length}`);
      const line = this.line;
      const r = this.execBlock(f.body, local, f);
      this.depth--; this.line = line;
      return r instanceof Return ? r.v : null;
    }
    throw this.err('TypeError', `объект типа ${typeName(f)} нельзя вызвать`);
  }
  get depth() { return this._d || 0; } set depth(v) { this._d = v; }

  evalArgs(node, scope) {
    const args = [];
    for (const a of node.args) {
      if (a.k === 'Star') args.push(...this.iter(this.eval(a.v, scope)));
      else args.push(this.eval(a, scope));
    }
    const kwargs = {}; for (const [k, v] of node.kwargs) kwargs[k] = this.eval(v, scope);
    return [args, kwargs];
  }

  eval(n, scope) {
    this.tick();
    switch (n.k) {
      case 'Num': return n.v;
      case 'Str': return n.v;
      case 'Name': this.line = n.line ?? this.line; return this.lookup(n.id, scope);
      case 'List': return n.items.map((x) => this.eval(x, scope));
      case 'Tuple': return n.items.map((x) => this.eval(x, scope));
      case 'ListComp': return this.comp(n.comp, scope);
      case 'Comp': return this.comp(n, scope);
      case 'Un': { const v = this.eval(n.v, scope); return n.op === '-' ? -v : n.op === '+' ? +v : ~v; }
      case 'Not': return !this.truthy(this.eval(n.v, scope));
      case 'Bool': { const l = this.eval(n.l, scope); return n.op === 'and' ? (this.truthy(l) ? this.eval(n.r, scope) : l) : (this.truthy(l) ? l : this.eval(n.r, scope)); }
      case 'IfExp': return this.truthy(this.eval(n.test, scope)) ? this.eval(n.body, scope) : this.eval(n.orelse, scope);
      case 'Bin': this.line = n.line ?? this.line; return this.binop(n.op, this.eval(n.l, scope), this.eval(n.r, scope));
      case 'Cmp': {
        let l = this.eval(n.left, scope);
        for (let i = 0; i < n.ops.length; i++) {
          const r = this.eval(n.rights[i], scope);
          if (!this.compare(n.ops[i], l, r)) return false;
          l = r;
        }
        return true;
      }
      case 'Attr': { const o = this.eval(n.obj, scope); this.line = n.line ?? this.line; return this.getAttr(o, n.name); }
      case 'Subscript': return this.subscript(this.eval(n.obj, scope), n.idx, scope, n.line);
      case 'Call': {
        this.line = n.line ?? this.line;
        const f = this.eval(n.fn, scope);
        const [args, kwargs] = this.evalArgs(n, scope);
        this.line = n.line ?? this.line;
        return this.callValue(f, args, kwargs);
      }
    }
    throw this.err('SyntaxError', `выражение «${n.k}» не поддерживается`);
  }

  comp(c, scope) {
    const out = [];
    const local = Object.create(null); local.__parent = scope;
    const walk = (i) => {
      if (i === c.clauses.length) { out.push(this.eval(c.elt, local)); return; }
      const cl = c.clauses[i];
      for (const x of this.iter(this.eval(cl.iter, local)).slice()) {
        this.tick(); this.assign(cl.target, x, local);
        if (cl.conds.every((cd) => this.truthy(this.eval(cd, local)))) walk(i + 1);
      }
    };
    walk(0); return out;
  }

  subscript(o, idxNode, scope, line) {
    this.line = line ?? this.line;
    if (idxNode && idxNode.k === 'Slice') {
      const len = o.length, ev = (x) => (x ? this.eval(x, scope) : null);
      let st = ev(idxNode.st) ?? 1, lo = ev(idxNode.lo), hi = ev(idxNode.hi);
      const norm = (v, d) => (v === null ? d : v < 0 ? Math.max(0, len + v) : Math.min(len, v));
      const res = [];
      if (st > 0) for (let i = norm(lo, 0); i < norm(hi, len); i += st) res.push(o[i]);
      else for (let i = lo === null ? len - 1 : (lo < 0 ? len + lo : Math.min(lo, len - 1)); i > (hi === null ? -1 : (hi < 0 ? len + hi : hi)); i += st) res.push(o[i]);
      return typeof o === 'string' ? res.join('') : res;
    }
    let i = this.eval(idxNode, scope);
    if (o && o.pyIndex) return o.pyIndex(i, this);
    if (!Array.isArray(o) && typeof o !== 'string') throw this.err('TypeError', `объект типа ${typeName(o)} не поддерживает индексацию`);
    if (i < 0) i += o.length;
    if (i < 0 || i >= o.length) throw this.err('IndexError', 'индекс вне диапазона');
    return o[i];
  }

  getAttr(o, name) {
    if (o === null || o === undefined) throw this.err('AttributeError', `у None нет атрибута «${name}»`);
    if (o && o.pyAttr) return o.pyAttr(name, this);
    if (Array.isArray(o)) {
      const L = {
        append: (v) => { o.push(v); return null; }, extend: (v) => { o.push(...this.iter(v)); return null; },
        pop: (i = -1) => { if (!o.length) throw this.err('IndexError', 'pop из пустого списка'); return o.splice(i < 0 ? o.length + i : i, 1)[0]; },
        insert: (i, v) => { o.splice(i, 0, v); return null; }, reverse: () => { o.reverse(); return null; },
        index: (v) => { const k = o.indexOf(v); if (k < 0) throw this.err('ValueError', 'элемента нет в списке'); return k; },
        count: (v) => o.filter((x) => x === v).length, copy: () => o.slice(),
      };
      if (name in L) return L[name];
    }
    if (typeof o === 'object' && name in o && name !== 'constructor') return o[name];
    throw this.err('AttributeError', `у объекта типа ${typeName(o)} нет атрибута «${name}»`);
  }

  binop(op, a, b) {
    switch (op) {
      case '+': if (Array.isArray(a) && Array.isArray(b)) return a.concat(b); if (typeof a === 'string' || typeof b === 'string') { if (typeof a !== typeof b) throw this.err('TypeError', 'нельзя складывать строку и число'); } return a + b;
      case '-': return a - b;
      case '*': if (Array.isArray(a) && typeof b === 'number') { if (a.length * b > this.maxRange) throw this.err('LimitError', 'слишком длинный список'); return Array.from({ length: Math.max(0, b) }, () => a).flat(); } if (Array.isArray(b) && typeof a === 'number') return this.binop('*', b, a); if (typeof a === 'string') return a.repeat(Math.max(0, b)); return a * b;
      case '/': if (b === 0) throw this.err('ZeroDivisionError', 'деление на ноль'); return a / b;
      case '//': if (b === 0) throw this.err('ZeroDivisionError', 'деление на ноль'); return Math.floor(a / b);
      case '%': return pyMod(a, b);
      case '**': return Math.pow(a, b);
      case '<<': return a * 2 ** b; case '>>': return Math.floor(a / 2 ** b);
      case '&': return Number(BigInt(a) & BigInt(b)); case '|': return Number(BigInt(a) | BigInt(b)); case '^': return Number(BigInt(a) ^ BigInt(b));
    }
    throw this.err('SyntaxError', `оператор ${op} не поддерживается`);
  }

  compare(op, a, b) {
    switch (op) {
      case '<': return a < b; case '>': return a > b; case '<=': return a <= b; case '>=': return a >= b;
      case '==': return Array.isArray(a) && Array.isArray(b) ? a.length === b.length && a.every((x, i) => x === b[i]) : a === b;
      case '!=': return !this.compare('==', a, b);
      case 'in': return typeof b === 'string' ? b.includes(a) : this.iter(b).includes(a);
      case 'not in': return !this.compare('in', a, b);
      case 'is': return a === b; case 'is not': return a !== b;
    }
    return false;
  }
}

export function makeMathModule() {
  const M = Math;
  return {
    pi: M.PI, e: M.E, tau: 2 * M.PI, inf: Infinity,
    sqrt: M.sqrt, ceil: M.ceil, floor: M.floor, log: (x, b) => (b ? M.log(x) / M.log(b) : M.log(x)), log2: M.log2, log10: M.log10, exp: M.exp,
    cos: M.cos, sin: M.sin, tan: M.tan, acos: M.acos, asin: M.asin, atan: M.atan, atan2: M.atan2, fabs: M.abs, radians: (d) => d * M.PI / 180, degrees: (r) => r * 180 / M.PI,
    gcd: (a, b) => { while (b) [a, b] = [b, a % b]; return Math.abs(a); }, factorial: (n) => { let r = 1; for (let i = 2; i <= n; i++) r *= i; return r; },
    isqrt: (n) => Math.floor(Math.sqrt(n)), prod: (v) => v.reduce((a, b) => a * b, 1), trunc: M.trunc,
  };
}
export function makeNumpyModule() {
  const m = makeMathModule();
  return { ...m, arccos: m.acos, arcsin: m.asin, arctan: m.atan, arctan2: m.atan2, abs: Math.abs, power: Math.pow };
}
