import { html, raw, esc, on, fmtInt, timeHM, pad2 } from '../ui/dom.js';
import { icon } from '../ui/icons.js';
import { Board, PI_TEXT } from '../ui/board.js';
import { CodeEditor } from '../ui/codeeditor.js';
import { popover, closePopovers, toast, confirmModal } from '../ui/overlay.js';
import { Circuit, involved, decomposeCircuit, decomposeOp, plural } from '../quantum/circuit.js';
import { runOps, sample, rng, blochOf, hasNonUnitary } from '../quantum/sim.js';
import { formatState, ket, pct } from '../quantum/format.js';
import { circuitToCode, opToCode, buildFromCode } from '../lang/qiskitlite.js';
import { GATES, displayName, describeOp } from '../quantum/gates.js';
import { parseTile } from '../data/tasks.js';
import { evalAngle } from '../ui/taskeditor.js';
import { data, mutate } from '../store.js';
import { navigate } from '../router.js';

const GROUPS = [['базовые', ['H', 'X', 'Y', 'Z']], ['фаза', ['S', 'T', 'P', 'RZ']], ['вращения', ['RX', 'RY']], ['многокубитные', ['CX', 'CZ', 'SWAP', 'CCX']], ['прочее', ['M', '|0⟩']]];
const MORE = ['S†', 'T†', '√X', 'CY', 'CH', 'CP', 'CRX', 'CRY', 'CRZ', 'CCZ', 'CSWAP', 'MCX'];
const RU = { H: 'адамар суперпозиция', X: 'not инверсия', Y: 'паули', Z: 'знак фаза', S: 'фаза', T: 'фаза', P: 'фаза', RZ: 'вращение', RX: 'вращение', RY: 'вращение', CX: 'cnot контролируемый', CZ: 'контролируемый z', SWAP: 'обмен', CCX: 'тоффоли', CCZ: 'тоффоли ccz', CSWAP: 'фредкин', CH: 'контролируемый адамар', CP: 'контролируемая фаза', M: 'измерение', '|0⟩': 'сброс reset' };
const NAMES = { H: 'Адамар', X: 'NOT', Y: 'Паули Y', Z: 'Паули Z', S: 'Фаза S', T: 'Фаза T', P: 'Фаза P(θ)', RZ: 'Поворот Z', RX: 'Поворот X', RY: 'Поворот Y', CX: 'CNOT', CZ: 'Контролируемый Z', SWAP: 'Обмен', CCX: 'Тоффоли', CCZ: 'CCZ', CSWAP: 'Фредкин', CH: 'Контролируемый H', CP: 'Контролируемая фаза', M: 'Измерение', '|0⟩': 'Сброс в |0⟩' };

const EXAMPLES = {
  'состояние Белла': () => { const c = new Circuit(2); c.h(0); c.cx(0, 1); return c; },
  'GHZ на 4 кубитах': () => { const c = new Circuit(4); c.h(0); c.cx(0, 1); c.cx(1, 2); c.cx(2, 3); return c; },
  'GHZ и тоффоли': () => { const c = new Circuit(4); c.h(0); c.cx(0, 1); c.cx(1, 2); c.ccx(0, 1, 3); return c; },
  'телепортация': () => { const c = new Circuit(3); c.h(1); c.cx(1, 2); c.cx(0, 1); c.h(0); c.cx(1, 2); c.cz(0, 2); return c; },
  'Гровер, 2 кубита': () => { const c = new Circuit(2); c.h(0); c.h(1); c.cz(0, 1); c.h(0); c.h(1); c.x(0); c.x(1); c.cz(0, 1); c.x(0); c.x(1); c.h(0); c.h(1); return c; },
  'QFT, 3 кубита': () => { const c = new Circuit(3); const P = Math.PI; c.h(2); c.addGate('P', 2, [1], [P / 2]); c.addGate('P', 2, [0], [P / 4]); c.h(1); c.addGate('P', 1, [0], [P / 2]); c.h(0); c.addGate('SWAP', [0, 2]); return c; },
};

const tileOf = (name) => (name === '|0⟩' ? { name, g: 'RESET', nc: 0 } : name === 'M' ? { name, g: 'M', nc: 0 } : parseTile(name));

export default async function sandbox(ctx) {
  const d = data();
  let circuit, name = 'без названия';
  const enc = ctx.query.c;
  if (enc) { try { const j = JSON.parse(decodeURIComponent(escape(atob(enc.replace(/-/g, '+').replace(/_/g, '/'))))); circuit = Circuit.fromJSON(j.c); name = j.n || name; } catch { /* битая ссылка */ } }
  if (!circuit && d.sandbox.draft) { try { circuit = Circuit.fromJSON(d.sandbox.draft.circuit); name = d.sandbox.draft.name || name; } catch { /* нет */ } }
  if (!circuit) circuit = new Circuit(3);
  circuit.autoColumns();

  const S = { circuit, name, tab: 'state', selected: null, armed: null, steps: null, step: 0, measure: null, undo: [], redo: [], saved: true, more: false, q: '' };
  let board = null, codeEd = null, root = null, saveT = null, cleanup = [];
  const view = html`<div class="editor-shell" id="sb">
    <div class="editor-sub" id="sbsub"></div>
    <div class="sb-main"><aside class="sb-left" id="sbleft"></aside>
      <section class="editor-center"><div class="canvas" id="canvas" style="padding-top:8px"></div><div class="bottom" id="bottom"></div></section></div></div>`;

  const curCol = () => (S.steps == null ? null : [...new Set(S.circuit.ops.map((o) => o.col))].sort((a, b) => a - b)[S.step]);
  const st = () => (hasNonUnitary(S.circuit.ops) ? null : runOps(S.circuit.ops.filter((o) => S.steps == null || o.col <= curCol()), S.circuit.n));
  const stats = () => S.circuit.stats();

  function persist() {
    S.saved = false; renderSub();
    clearTimeout(saveT);
    saveT = setTimeout(() => { mutate((dd) => { dd.sandbox.draft = { name: S.name, circuit: S.circuit.toJSON() }; }); S.saved = true; const el = root && root.querySelector('#savedmark'); if (el) el.textContent = 'сохранено'; }, 400);
  }
  function snap() { return JSON.stringify(S.circuit.toJSON()); }
  function pushUndo(prev) { if (S.undo[S.undo.length - 1] !== prev) { S.undo.push(prev); if (S.undo.length > 100) S.undo.shift(); S.redo = []; } }
  function load(json) { S.circuit = Circuit.fromJSON(JSON.parse(json)); S.circuit.autoColumns(); S.selected = null; rebuildBoard(); refreshAll(); persist(); }
  function undo() { const p = S.undo.pop(); if (p == null) return; S.redo.push(snap()); load(p); }
  function redo() { const p = S.redo.pop(); if (p == null) return; S.undo.push(snap()); load(p); }

  // ---------- Верхняя панель ----------
  function renderSub() {
    const s = stats(), sub = root.querySelector('#sbsub');
    const stepping = S.steps != null;
    sub.innerHTML = `<input class="sb-name" id="sbname" value="${esc(S.name)}" aria-label="название схемы" maxlength="40"><span class="muted t-mono-s" id="savedmark">${S.saved ? 'сохранено' : 'черновик · автосохранение'}</span><span class="sep" style="width:1px;height:24px;background:var(--line-subtle)"></span>
      <button class="icon-btn" data-a="undo" aria-label="отменить" ${S.undo.length ? '' : 'disabled style="opacity:.4"'}>${icon('undo')}</button><button class="icon-btn" data-a="redo" aria-label="повторить" ${S.redo.length ? '' : 'disabled style="opacity:.4"'}>${icon('redo')}</button>
      ${stepping ? `<div class="stepper"><button class="icon-btn" data-a="prev" aria-label="шаг назад" style="width:28px;height:28px">${icon('chev-l', 'sm')}</button><span>шаг ${S.step + 1} из ${S.total}</span><button class="icon-btn" data-a="next" aria-label="шаг вперёд" style="width:28px;height:28px">${icon('chev-r', 'sm')}</button></div><button class="btn btn-ghost sm" data-a="exit-steps">${icon('x', 'sm')}выйти из шагов</button>`
        : `<button class="btn btn-outline sm" data-a="steps" ${S.circuit.ops.length ? '' : 'disabled'}>${icon('play', 'sm')}по шагам</button>`}
      <span class="spacer"></span>
      <span class="muted t-mono-s" style="white-space:nowrap">${S.circuit.n} ${plural(S.circuit.n, 'кубит', 'кубита', 'кубитов')} · ${s.gates} ${plural(s.gates, 'гейт', 'гейта', 'гейтов')} · глубина ${s.depth}</span>
      <button class="btn btn-outline sm" data-a="examples">${icon('book', 'sm')}примеры</button>
      <button class="btn btn-outline sm" data-a="share">${icon('ext', 'sm')}поделиться</button>
      <button class="btn ${S.circuit.ops.length ? 'btn-primary' : 'btn-secondary'} sm" data-a="measure">${icon('play', 'sm')}измерить ×1024</button>`;
    const nm = sub.querySelector('#sbname'); nm.addEventListener('input', () => { S.name = nm.value; persist(); });
  }

  // ---------- Левая панель ----------
  function renderLeft() {
    const left = root.querySelector('#sbleft');
    if (S.steps != null) return renderStepsPanel(left);
    const op = S.selected ? S.circuit.ops.find((o) => o.id === S.selected) : null;
    if (op) return renderGatePanel(left, op);
    const q = S.q.trim().toLowerCase();
    const match = (n) => !q || n.toLowerCase().includes(q) || (RU[n] || '').includes(q) || (NAMES[n] || '').toLowerCase().includes(q);
    const tileHtml = (n) => `<button class="tile-btn ${S.armed && S.armed.name === n ? 'armed' : ''} ${n.length > 3 ? 'wide' : ''}" data-tile="${esc(n)}" title="${esc(NAMES[n] || n)}">${esc(n)}</button>`;
    let groups;
    if (q) { const all = [...new Set([...GROUPS.flatMap(([, t]) => t), ...MORE])].filter(match); groups = all.length ? `<div class="palette-group"><div class="gt">найдено</div><div class="palette-tiles">${all.map(tileHtml).join('')}</div></div>` : '<div class="muted t-small">Ничего не найдено. Попробуйте «cx», «тоффоли» или «фаза».</div>'; }
    else groups = GROUPS.map(([g, ts]) => `<div class="palette-group"><div class="gt">${g}</div><div class="palette-tiles">${ts.map(tileHtml).join('')}</div></div>`).join('') + (S.more ? `<div class="palette-group"><div class="gt">ещё</div><div class="palette-tiles">${MORE.map(tileHtml).join('')}</div></div>` : '<button class="btn btn-ghost xs" data-a="more" style="align-self:flex-start">показать ещё гейты</button>');
    left.innerHTML = `<h2 class="t-h2" style="font-size:20px">операции</h2><div class="control sm">${icon('search', 'sm')}<input id="pq" placeholder="найти: «cx», «тоффоли»" value="${esc(S.q)}" autocomplete="off"></div>${groups}
      <div class="muted t-mono-s" style="margin-top:auto;line-height:16px">Перетащите гейт на провод или нажмите на него и кликните по клетке. ПКМ по гейту — добавить управление.</div>`;
    const pq = left.querySelector('#pq'); pq.addEventListener('input', () => { S.q = pq.value; const pos = pq.selectionStart; renderLeft(); const n = root.querySelector('#pq'); n.focus(); n.setSelectionRange(pos, pos); });
  }

  function renderGatePanel(left, op) {
    const nm = displayName(op), pretty = { CCX: 'Тоффоли', CX: 'CNOT', CZ: 'Контролируемый Z', H: 'Адамар', SWAP: 'Обмен', CCZ: 'CCZ' }[nm] || NAMES[nm] || nm;
    const info = describeOp(op);
    const n = S.circuit.n, opts = (sel, ex = []) => Array.from({ length: n }, (_, i) => `<option value="${i}" ${i === sel ? 'selected' : ''} ${ex.includes(i) ? 'disabled' : ''}>q${i}</option>`).join('');
    const ang = ['P', 'RX', 'RY', 'RZ'].includes(op.g);
    left.innerHTML = `<div class="row" style="align-items:flex-start;gap:12px"><button class="icon-btn" data-a="back" aria-label="назад">${icon('arrow-l')}</button><div><h2 class="t-h2" style="font-size:20px">${esc(nm)} · ${esc(pretty)}</h2><div class="muted t-mono-s">столбец t${op.col + 1}</div></div></div>
      <p class="secondary" style="font-size:14px;line-height:20px">${esc(GATES[op.g].ru)}${op.c.length ? ' Выполняется, только если все управляющие кубиты в |1⟩.' : ''}</p>
      <div class="t-kicker">${op.t.length > 1 ? 'цели' : 'цель'}</div>
      ${op.t.map((t, i) => `<div class="row" style="justify-content:space-between"><span class="secondary">кубит</span><div class="control select sm" style="width:116px"><select data-tgt="${i}">${opts(t, [...op.t.filter((_, k) => k !== i), ...op.c])}</select><span class="chev">${icon('chev-d', 'sm')}</span></div></div>`).join('')}
      ${ang ? `<div class="row" style="justify-content:space-between"><span class="secondary">угол θ</span><div class="control sm" style="width:116px"><input id="ang" value="${esc(PI_TEXT(op.p[0]))}" spellcheck="false"></div></div>` : ''}
      ${op.g !== 'M' && op.g !== 'RESET' && !(op.g === 'SWAP' && false) ? `<div class="t-kicker" style="margin-top:6px">управление</div>
      ${op.c.map((c, i) => `<div class="row" style="justify-content:space-between"><span class="secondary">при |1⟩</span><div class="row" style="gap:6px"><div class="control select sm" style="width:84px"><select data-ctl="${i}">${opts(c, [...op.t, ...op.c.filter((_, k) => k !== i)])}</select><span class="chev">${icon('chev-d', 'sm')}</span></div><button class="icon-btn" data-rmctl="${i}" aria-label="убрать управление" style="width:28px;height:28px">${icon('x', 'sm')}</button></div></div>`).join('')}
      <button class="btn btn-outline sm" data-a="addctl" ${n - op.t.length - op.c.length <= 0 || !['X', 'Z', 'Y', 'H', 'P', 'RX', 'RY', 'RZ', 'SWAP'].includes(op.g) ? 'disabled' : ''}>${icon('plus', 'sm')}добавить управление</button>` : ''}
      <div class="muted t-mono-s" style="line-height:16px">Или ПКМ по гейту → «добавить управление». Точку управления можно перетащить по проводам.</div>
      <div class="mono" style="font-size:13px;background:var(--bg-inset);border:1px solid var(--line-subtle);border-radius:10px;padding:12px 14px">${esc(opToCode(op))}</div>
      <div class="row" style="margin-top:auto;justify-content:space-between"><button class="btn btn-outline sm" data-a="decomp" ${decomposeOp(op) ? '' : 'disabled'}>${icon('sliders', 'sm')}разложить</button><button class="icon-btn" data-a="delete" aria-label="удалить гейт">${icon('trash')}</button></div>`;
    left.querySelectorAll('[data-tgt]').forEach((s) => s.addEventListener('change', () => { mutateOp(op, (o) => { o.t[+s.dataset.tgt] = +s.value; }); }));
    left.querySelectorAll('[data-ctl]').forEach((s) => s.addEventListener('change', () => { mutateOp(op, (o) => { o.c[+s.dataset.ctl] = +s.value; }); }));
    left.querySelectorAll('[data-rmctl]').forEach((b) => b.addEventListener('click', () => mutateOp(op, (o) => { o.c.splice(+b.dataset.rmctl, 1); })));
    const a = left.querySelector('#ang'); if (a) a.addEventListener('change', () => { const v = evalAngle(a.value); if (v == null) { a.parentNode.style.borderColor = 'var(--accent-text)'; return; } mutateOp(op, (o) => { o.p = [v]; }); });
  }

  function mutateOp(op, fn) {
    const prev = snap(); const cp = JSON.parse(JSON.stringify(op)); fn(cp);
    // проверка пересечений колонки
    const qs = [...cp.t, ...cp.c];
    if (new Set(qs).size !== qs.length) { toast({ title: 'Кубиты повторяются', kind: 'warn' }); renderLeft(); return; }
    const lo = Math.min(...qs), hi = Math.max(...qs);
    if (!board.spanFree(op.col, lo, hi, op.id)) { toast({ title: 'Клетка занята', text: 'В этом столбце на пути гейта уже что-то стоит.', kind: 'warn' }); renderLeft(); return; }
    pushUndo(prev); op.t = cp.t; op.c = cp.c; op.p = cp.p;
    board.render(); refreshAll(); persist();
  }

  function renderStepsPanel(left) {
    const ops = S.circuit.ops, cols = [...new Set(ops.map((o) => o.col))].sort((a, b) => a - b);
    left.innerHTML = `<h2 class="t-h2" style="font-size:20px">по шагам</h2><span class="status" style="align-self:flex-start"><span class="dot"></span>редактирование на паузе</span>
      ${cols.map((c, i) => { const group = ops.filter((o) => o.col === c); const d = describeOp(group[0]); const now = i === S.step; return `<div class="step-item ${now ? 'now' : ''}" style="${i > S.step ? 'opacity:.65' : ''}"><div class="tt"><span class="t">t${c + 1}</span>${esc(d.title)}</div><div class="muted" style="font-size:13px;line-height:18px">${esc(d.text)}</div></div>`; }).join('')}
      <div class="muted t-mono-s" style="margin-top:auto">стрелки влево и вправо — шаг · Esc — выйти</div>`;
  }

  // ---------- Холст и нижняя панель ----------
  function rebuildBoard() {
    const host = root.querySelector('#canvas');
    host.innerHTML = '<div id="board"></div><div id="empty"></div>';
    board = new Board(host.querySelector('#board'), { density: 'sandbox', circuit: S.circuit, cols: 6, wireInit: null, allowAddQubit: true, maxQubits: 8, minQubits: 1, fixedCols: false, showDisks: true, coupling: null,
      onChange: (c, why) => { pushUndo(board._undoSnap); board._undoSnap = snap(); S.circuit = c; persist(); refreshAll(); },
      onSelect: (op) => { S.selected = op ? op.id : null; renderLeft(); },
      onContext: (op, e) => ctxMenu(op, e) });
    board._undoSnap = snap(); board.o.armed = S.armed;
  }

  function ctxMenu(op, e) {
    const anchor = document.createElement('span'); anchor.style.cssText = `position:fixed;left:${e.clientX}px;top:${e.clientY}px;width:1px;height:1px`; document.body.append(anchor);
    const p = popover(anchor, raw(`<button class="menu-item" data-a="addctl">${icon('plus', 'sm')}добавить управление</button><button class="menu-item" data-a="decomp">${icon('sliders', 'sm')}разложить</button><div class="menu-sep"></div><button class="menu-item danger" data-a="delete">${icon('trash', 'sm')}удалить</button>`), { align: 'left' });
    p.addEventListener('click', (ev) => { const b = ev.target.closest('[data-a]'); if (!b) return; closePopovers(); doAct(b.dataset.a); });
    setTimeout(() => anchor.remove(), 0);
  }

  function refreshAll() {
    S.total = [...new Set(S.circuit.ops.map((o) => o.col))].length;
    if (S.steps != null && S.step >= S.total) S.step = Math.max(0, S.total - 1);
    const cur = curCol();
    board.circuit = S.circuit;
    board.stepFilter = cur;
    board.o.readOnly = S.steps != null;
    board.o.armed = S.armed;
    board.state = st();
    board.o.cols = Math.max(6, S.circuit.columnCount() + 1);
    board.hoverCol = cur;
    board.render();
    const empty = root.querySelector('#empty');
    empty.innerHTML = S.circuit.ops.length ? '' : `<div class="card col" style="gap:8px;max-width:520px;margin:16px auto 0;padding:20px 24px"><h3 class="t-h3">начните с примера</h3><div class="examples">${Object.keys(EXAMPLES).filter((k) => k !== 'GHZ и тоффоли').map((k) => `<button class="chip" data-ex="${esc(k)}">${esc(k)}</button>`).join('')}</div><div class="secondary t-small">или перетащите гейт из каталога на провод. Вероятности, формула состояния и код появятся после первого гейта.</div></div>`;
    renderSub(); renderLeft(); renderBottom();
  }

  function renderBottom() {
    const b = root.querySelector('#bottom');
    const tabs = [['state', 'состояние'], ['code', 'код'], ['meas', 'измерения', S.measure ? 1 : null]];
    b.innerHTML = `<div class="tabs">${tabs.map(([k, t, c]) => `<button class="tab" data-tab="${k}" aria-selected="${S.tab === k}">${t}${c ? `<span class="cnt">${c}</span>` : ''}</button>`).join('')}</div><div id="bb"></div>`;
    const body = b.querySelector('#bb');
    if (S.tab === 'state') {
      const s = st();
      if (!s) { body.innerHTML = '<div class="muted" style="padding:16px 0">Для схемы с измерением посередине точное состояние не определено — используйте «измерить ×1024».</div>'; return; }
      const n = s.n, rows = []; for (let i = 0; i < s.dim; i++) rows.push({ i, p: s.prob(i) });
      const nz = rows.filter((r) => r.p > 1e-9), show = s.dim <= 8 ? rows : nz.slice(0, 8), hidden = s.dim - show.length;
      const f = formatState(s);
      const ent = Array.from({ length: n }, (_, q) => blochOf(s, q)).filter((x) => Math.hypot(x.x, x.y, x.z) < 0.995).length;
      const note = !S.circuit.ops.length ? 'Схема пуста. Все кубиты в |0⟩.' : ent === n && n > 1 ? `Все ${n === 4 ? 'четыре' : n} кубита запутаны.${hidden ? ` ${hidden} исходов с нулевой вероятностью скрыты.` : ''}` : ent ? `Запутаны кубиты: ${ent} из ${n}.${hidden ? ` ${hidden} исходов скрыты.` : ''}` : (hidden ? `${hidden} исходов с нулевой вероятностью скрыты.` : '');
      body.innerHTML = `<div class="bottom-body"><div><div class="row" style="justify-content:space-between"><span class="t-kicker">вероятности</span><span class="muted t-mono-s">порядок |${n > 1 ? `q${n - 1} … q0` : 'q0'}⟩</span></div>${show.map((r) => `<div class="prob-row ${r.p < 1e-9 ? 'zero' : ''}"><span>${ket(r.i, n)}</span><div class="bar"><i style="width:${(r.p * 100).toFixed(1)}%"></i></div><span class="p">${pct(r.p)}</span></div>`).join('')}</div>
        <div class="col" style="gap:6px"><span class="t-kicker">состояние</span><div class="state-big">${esc(f.text)}</div><div class="secondary" style="font-size:14px">${esc(S.steps != null ? `После t${(board.stepFilter ?? 0) + 1}: ${note}` : note)}</div></div></div>`;
    } else if (S.tab === 'code') {
      body.innerHTML = '<div id="codehost" style="margin-top:8px;border:1px solid var(--line-subtle);border-radius:12px;overflow:auto;max-height:260px"></div><div class="row" style="margin-top:10px;gap:10px"><button class="btn btn-outline xs" data-a="copycode">' + icon('doc', 'sm') + 'копировать</button><span class="muted t-mono-s" id="codeerr"></span></div>';
      codeEd = new CodeEditor(body.querySelector('#codehost'), { value: circuitToCode(S.circuit), onChange: (v) => onCode(v) });
    } else {
      const m = S.measure;
      if (!m) { body.innerHTML = '<div class="muted" style="padding:16px 0">Нажмите «измерить ×1024», чтобы получить распределение исходов.</div>'; return; }
      const rows = [...m.counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8);
      body.innerHTML = `<div class="bottom-body"><div><div class="row" style="justify-content:space-between"><span class="t-kicker">${m.shots} измерений</span><span class="muted t-mono-s">идеальный симулятор · ${m.ms} мс</span></div>${rows.map(([i, c]) => `<div class="prob-row"><span>${ket(i, m.n)}</span><div class="bar"><i style="width:${(c / m.shots * 100).toFixed(1)}%"></i></div><span class="p">${c}</span></div>`).join('')}<div class="secondary" style="font-size:14px;margin-top:8px">Разброс счётчиков — случайность измерений. Живое «состояние» показывает точные вероятности.</div></div>
        <div class="col" style="gap:0"><span class="t-kicker" style="margin-bottom:8px">настройки измерения</span><div class="cons"><div class="row"><span class="secondary">запусков</span><span class="v">${m.shots}</span></div><div class="row"><span class="secondary">шум</span><span class="v">нет · идеальный</span></div><div class="row"><span class="secondary">seed</span><span class="v">случайный</span></div></div><button class="btn btn-outline sm" data-a="measure" style="align-self:flex-start;margin-top:12px">${icon('refresh', 'sm')}измерить ещё раз</button></div></div>`;
    }
  }

  let codeT = null;
  function onCode(v) {
    clearTimeout(codeT);
    codeT = setTimeout(() => {
      const r = buildFromCode(v, { fnArgs: [] });
      const err = root.querySelector('#codeerr');
      if (r.error) { codeEd && codeEd.setError(r.error); if (err) err.textContent = `${r.error.kind}: ${r.error.msg}`; return; }
      codeEd && codeEd.setError(null); if (err) err.textContent = '';
      if (r.circuit.n > 8) { if (err) err.textContent = 'В песочнице до 8 кубитов'; return; }
      const prev = snap(); const c = r.circuit.autoColumns();
      if (JSON.stringify(c.toJSON()) === prev) return;
      pushUndo(prev); S.circuit = c; S.selected = null; board.circuit = c; board._undoSnap = snap(); persist();
      // не пересобираем вкладку кода: пользователь печатает
      board.state = st(); board.o.cols = Math.max(6, c.columnCount() + 1); board.render(); renderSub(); renderLeft();
    }, 350);
  }

  // ---------- Действия ----------
  function doAct(a) {
    const op = S.selected ? S.circuit.ops.find((o) => o.id === S.selected) : null;
    switch (a) {
      case 'undo': undo(); break; case 'redo': redo(); break;
      case 'measure': measure(); break;
      case 'share': share(); break;
      case 'examples': showExamples(); break;
      case 'more': S.more = true; renderLeft(); break;
      case 'steps': if (S.circuit.ops.length) { S.steps = 0; S.step = 0; S.selected = null; refreshAll(); } break;
      case 'exit-steps': S.steps = null; refreshAll(); break;
      case 'prev': S.step = Math.max(0, S.step - 1); refreshAll(); break;
      case 'next': S.step = Math.min(S.total - 1, S.step + 1); refreshAll(); break;
      case 'back': S.selected = null; board.select(null); break;
      case 'delete': if (op) { pushUndo(snap()); board.remove(op.id); } break;
      case 'addctl': if (op) addControl(op); break;
      case 'decomp': if (op) decompose(op); break;
      case 'copycode': navigator.clipboard && navigator.clipboard.writeText(circuitToCode(S.circuit)).then(() => toast({ title: 'Код скопирован' })); break;
    }
  }
  function addControl(op) {
    const used = new Set([...op.t, ...op.c]);
    const free = Array.from({ length: S.circuit.n }, (_, i) => i).filter((i) => !used.has(i));
    if (!free.length) { toast({ title: 'Нет свободных кубитов', kind: 'warn' }); return; }
    const anchor = op.t[0]; free.sort((a, b) => Math.abs(a - anchor) - Math.abs(b - anchor));
    for (const q of free) { const lo = Math.min(q, ...op.t, ...op.c), hi = Math.max(q, ...op.t, ...op.c); if (board.spanFree(op.col, lo, hi, op.id)) { mutateOp(op, (o) => { o.c.push(q); }); return; } }
    toast({ title: 'Клетка занята', text: 'Освободите путь в этом столбце.', kind: 'warn' });
  }
  function decompose(op) {
    const parts = decomposeOp(op); if (!parts) { toast({ title: 'Уже базовый гейт', kind: 'info' }); return; }
    pushUndo(snap());
    const i = S.circuit.ops.findIndex((o) => o.id === op.id);
    const c = new Circuit(S.circuit.n); S.circuit.ops.forEach((o, k) => { if (k === i) parts.forEach((p) => c.add(p)); else c.add(o); });
    S.circuit = c.autoColumns(); S.selected = null; rebuildBoard(); refreshAll(); persist();
    toast({ title: `Гейт ${displayName(op)} разложен`, text: `${parts.length} базовых гейтов. Можно отменить.`, kind: 'ok' });
  }
  function measure() {
    const s = st();
    if (!s) { toast({ title: 'Измерение в середине схемы', text: 'Для таких схем в демо доступен только расчёт по состоянию.', kind: 'info' }); return; }
    const t0 = performance.now();
    const counts = sample(s.probs(), 1024, rng((Math.random() * 2 ** 31) >>> 0));
    S.measure = { counts, shots: 1024, n: s.n, ms: Math.max(0.01, performance.now() - t0).toFixed(2).replace('.', ',') }; S.tab = 'meas'; renderBottom();
  }
  function share() {
    const j = JSON.stringify({ n: S.name, c: S.circuit.toJSON() });
    const b64 = btoa(unescape(encodeURIComponent(j))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    const url = `${location.origin}${location.pathname}#/sandbox?c=${b64}`;
    (navigator.clipboard ? navigator.clipboard.writeText(url) : Promise.reject()).then(() => toast({ title: 'Ссылка скопирована', text: 'Схема закодирована прямо в адресе — сервер не нужен.' }), () => toast({ title: 'Не удалось скопировать', text: url, kind: 'warn', ms: 12000 }));
  }
  function showExamples() {
    const a = root.querySelector('[data-a="examples"]');
    const p = popover(a, raw(Object.keys(EXAMPLES).map((k) => `<button class="menu-item" data-ex="${esc(k)}">${esc(k)}</button>`).join('')));
    p.addEventListener('click', (e) => { const b = e.target.closest('[data-ex]'); if (b) { closePopovers(); loadExample(b.dataset.ex); } });
  }
  function loadExample(k) {
    pushUndo(snap());
    S.circuit = EXAMPLES[k]().autoColumns(); S.name = k; S.selected = null; S.steps = null; S.armed = null;
    rebuildBoard(); refreshAll(); persist();
  }

  // ---------- Перетаскивание из палитры ----------
  function bindPalette() {
    const left = root.querySelector('#sbleft');
    left.addEventListener('click', (e) => {
      const t = e.target.closest('[data-tile]');
      if (t && !t._dragged) { const tile = tileOf(t.dataset.tile); S.armed = S.armed && S.armed.name === tile.name ? null : tile; board.o.armed = S.armed; renderLeft(); return; }
      const a = e.target.closest('[data-a]'); if (a) doAct(a.dataset.a);
    });
    left.addEventListener('pointerdown', (e) => {
      const btn = e.target.closest('[data-tile]'); if (!btn) return;
      const tile = tileOf(btn.dataset.tile), start = { x: e.clientX, y: e.clientY };
      let ghost = null, moved = false;
      const cellUnder = (ev) => { const svg = board.svg, r = svg.getBoundingClientRect(); if (ev.clientX < r.left || ev.clientX > r.right || ev.clientY < r.top || ev.clientY > r.bottom) return null; return board.cellAt(board.point(ev)); };
      const move = (ev) => {
        if (!moved && Math.hypot(ev.clientX - start.x, ev.clientY - start.y) < 6) return; moved = true;
        if (!ghost) { ghost = btn.cloneNode(true); ghost.style.cssText = 'position:fixed;z-index:200;pointer-events:none;opacity:.9'; document.body.append(ghost); }
        ghost.style.left = ev.clientX - 22 + 'px'; ghost.style.top = ev.clientY - 22 + 'px';
        const c = cellUnder(ev); board.setColumnHover(c ? c.c : null);
      };
      const up = (ev) => {
        removeEventListener('pointermove', move); removeEventListener('pointerup', up); if (ghost) ghost.remove();
        if (moved) { btn._dragged = true; setTimeout(() => { btn._dragged = false; }, 0); const c = cellUnder(ev); board.hoverCol = null; if (c) board.place(tile, c.c, c.r); else board.render(); }
      };
      addEventListener('pointermove', move); addEventListener('pointerup', up);
    });
  }

  return {
    title: 'Песочница', nav: 'sandbox', layout: 'editor', html: view,
    mount(r) {
      root = r;
      rebuildBoard(); refreshAll(); bindPalette();
      const click = (e) => {
        const a = e.target.closest('[data-a]'); if (a && !root.querySelector('#sbleft').contains(a)) { doAct(a.dataset.a); return; }
        const tab = e.target.closest('[data-tab]'); if (tab) { S.tab = tab.dataset.tab; renderBottom(); return; }
        const ex = e.target.closest('[data-ex]'); if (ex) loadExample(ex.dataset.ex);
      };
      root.addEventListener('click', click);
      const key = (e) => {
        if (e.target.matches('input,textarea,select')) return;
        if (S.steps != null) { if (e.key === 'ArrowRight') doAct('next'); else if (e.key === 'ArrowLeft') doAct('prev'); else if (e.key === 'Escape') doAct('exit-steps'); return; }
        if ((e.key === 'Delete' || e.key === 'Backspace') && S.selected) { e.preventDefault(); doAct('delete'); }
        else if (e.key === 'Escape') { if (S.armed) { S.armed = null; board.o.armed = null; renderLeft(); } else if (S.selected) board.select(null); }
        else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z') { e.preventDefault(); e.shiftKey ? redo() : undo(); }
      };
      document.addEventListener('keydown', key); cleanup.push(() => document.removeEventListener('keydown', key));
    },
    unmount() { clearTimeout(saveT); cleanup.forEach((f) => f()); mutate((dd) => { dd.sandbox.draft = { name: S.name, circuit: S.circuit.toJSON() }; }); },
  };
}
