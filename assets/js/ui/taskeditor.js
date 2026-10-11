// Редактор задачи: условие, схема/код, состояние, отправка на проверку. Используется в банке и в раундах.
import { esc, html, raw, on, fmtInt, timeHM, pad2 } from './dom.js';
import { icon } from './icons.js';
import { diffHtml, statusHtml } from './parts.js';
import { Board, PI_TEXT } from './board.js';
import { CodeEditor } from './codeeditor.js';
import { toast, modal, confirmModal } from './overlay.js';
import { Circuit, checkLimits, couplingLabel, plural, involved } from '../quantum/circuit.js';
import { runOps, sample, rng, marginal, State, fidelity, hasNonUnitary, blochOf } from '../quantum/sim.js';
import { formatState, ket, pct } from '../quantum/format.js';
import { circuitToCode, buildFromCode } from '../lang/qiskitlite.js';
import { Interp, parse as pyParse } from '../lang/pyinterp.js';
import { TASKS, taskByNum, parseTile, limitsFor, LEVELS } from '../data/tasks.js';
import { judge, liveState, suiteOf, verdictText, TOL } from '../judge/judge.js';
import { data, mutate, isGuest, notify, touchActivity, bumpStreak, streakNow, dayKey } from '../store.js';
import { navigate } from '../router.js';
import { ratingTitle } from '../data/people.js';

const KINDS = { ok: 'ok', wa: 'wrong', limit: 'limit', noise: 'wrong', error: 'error' };

export function evalAngle(text) {
  const src = String(text).trim().replace(/π/g, 'pi').replace(/,/g, '.').replace(/·/g, '*');
  if (!src) return null;
  try {
    const it = new Interp({ globals: { pi: Math.PI }, maxSteps: 2000 });
    it.run(pyParse('x = ' + src + '\n'));
    const v = it.globals.x;
    return typeof v === 'number' && isFinite(v) ? v : null;
  } catch { return null; }
}

const tileLabel = (name) => name;

// ctx: { round: { n, q, endsAt, noise, onVerdict(res, task) }, hints: bool }
export function mountTaskEditor(root, task, ctx = {}) {
  const round = ctx.round || null;
  const suite0 = () => suiteOf(task, task.params ? task.params.default : undefined);
  const nQ = task.qubits ?? null;
  const codeOnly = task.codeOnly;
  const D = data();
  const saved = D.drafts[task.id] || {};

  const S = {
    mode: codeOnly ? 'code' : (saved.mode || 'schema'),
    circuit: nQ ? (saved.circuit ? Circuit.fromJSON(saved.circuit) : new Circuit(nQ)) : null,
    code: saved.code || null,
    param: task.params ? task.params.default : undefined,
    tab: 'state', armed: null, selected: null, verdict: null, running: null, undo: [], redo: [], hintLevel: D.hintUsed[task.id] || 0,
    measure: null, coachStep: 0, codeError: null, built: null, dismissedVerdict: false, solvedHere: false,
  };
  if (S.circuit) S.circuit.ops.forEach((o) => { if (o.col == null) S.circuit.autoColumns(); });
  if (!S.code) S.code = codeOnly ? starterCode(task) : (S.circuit ? circuitToCode(S.circuit, { hasOracle: !!task.oracleArity }) : '');
  let codeSyncedJson = S.circuit ? JSON.stringify(S.circuit.toJSON()) : null;
  const idx = TASKS.indexOf(task);

  // ---------- Разметка ----------
  const lim = () => limitsFor(task, S.param);
  const tiles = () => {
    const out = [];
    for (const name of (lim().basis || [])) { const t = parseTile(name); if (t) out.push(t); }
    if (task.oracleArity) out.push({ name: 'O', g: 'ORACLE', nc: 0 });
    return out;
  };
  const phi = task.limits && !codeOnly ? '' : '';
  const consRows = () => {
    const L = lim(), rows = [];
    if (L.gates != null) rows.push(['гейтов', `не больше ${L.gates}`]);
    if (L.depth != null) rows.push(['глубина', `не больше ${L.depth}`]);
    if (L.twoQubit != null) rows.push(['двухкубитных гейтов', `не больше ${L.twoQubit}`]);
    if (L.oracleCalls != null) rows.push(['вызовов оракула', `не больше ${L.oracleCalls}`]);
    if (L.basis) rows.push(['базис', L.basis.join(', ')]);
    if (L.coupling && L.coupling.kind !== 'all') rows.push(['связность', couplingLabel(L.coupling, suite0().n)]);
    return rows;
  };

  const inline = (t) => esc(t).replace(/`([^`]+)`/g, '<code class="inline">$1</code>');
  const roundCtx = round ? html`<a class="back" href="#/contests/${round.n}/${round.q}">${raw(icon('arrow-l'))}quantum weekly ${round.n}</a><span class="muted t-mono-s">· Q${round.q}</span>` : null;

  root.innerHTML = `
  <div class="editor-shell">
    <div class="editor-sub">
      ${round ? roundCtx.s : `<a class="back" href="#/tasks">${icon('arrow-l')}все задачи</a><span class="muted t-mono-s">· задача ${task.num} из ${TASKS.length}</span>`}
      <span class="spacer"></span>
      ${round ? `<span class="status live"><span class="dot"></span><span data-round-clock class="mono num"></span></span>` : ''}
      <button class="btn btn-outline xs" data-act="cond" id="cond-btn" hidden>${icon('doc', 'sm')}условие</button>
      ${round ? '' : `<a class="icon-btn outlined" ${idx > 0 ? `href="#/tasks/${TASKS[idx - 1].num}"` : 'aria-disabled="true"'} aria-label="предыдущая">${icon('chev-l')}</a><a class="icon-btn outlined" ${idx < TASKS.length - 1 ? `href="#/tasks/${TASKS[idx + 1].num}"` : 'aria-disabled="true"'} aria-label="следующая">${icon('chev-r')}</a>`}
    </div>
    <div class="editor-main">
      <aside class="editor-left" id="ed-left">
        <div>
          <div class="row" style="justify-content:space-between"><div class="row" style="gap:10px"><span class="mono muted" style="font-size:13px">№ ${task.num}</span>${diffHtml(task.level)}</div><span class="muted t-mono-s">${esc(task.topic)}</span></div>
          <h1 style="font:700 28px/34px var(--font-body);letter-spacing:-0.5px;margin-top:14px">${esc(task.title)}</h1>
        </div>
        <div class="io-box"><div class="io-row"><span class="k">вход</span><span>${esc(task.io.in)}</span></div><div class="io-row"><span class="k">цель</span><span>${esc(task.io.out)}</span></div></div>
        <div class="col" style="gap:10px;color:var(--text-secondary);font-size:15px;line-height:22px">${task.statement.map((p) => `<p>${inline(p)}</p>`).join('')}</div>
        <div id="hint-box"></div>
        <div class="col" style="gap:4px"><div class="t-kicker">ограничения</div><div class="cons">${consRows().map(([k, v]) => `<div class="row"><span class="secondary">${esc(k)}</span><span class="v">${esc(v)}</span></div>`).join('')}</div></div>
        <div style="margin-top:auto;padding-top:8px">${ctx.hints === false ? '<span class="muted t-small">В раунде подсказки отключены.</span>' : D.settings.hints === false ? '<span class="muted t-small">Подсказки отключены в настройках.</span>' : `<button class="btn btn-outline sm" data-act="hint" style="border-radius:999px">${icon('question', 'sm')}подсказка</button>`}</div>
      </aside>
      <section class="editor-center">
        <div class="toolbar" id="toolbar"></div>
        <div class="canvas" id="canvas"></div>
        <div class="bottom" id="bottom"></div>
      </section>
    </div>
  </div>`;

  const $ = (s) => root.querySelector(s);
  const $tb = $('#toolbar'), $canvas = $('#canvas'), $bottom = $('#bottom');
  let board = null, codeEd = null, saveT = null, destroyed = false;

  // ---------- Состояние и вычисления ----------

  function currentBuild() {
    if (S.mode === 'schema' && S.circuit) return (p) => ({ circuit: S.circuit.clone() });
    return (p) => buildFromCode(S.code, { oracleArity: task.oracleArity || 0, fnArgs: p !== undefined ? [p] : [] });
  }

  function refresh({ keepVerdict = false } = {}) {
    // Построить текущую схему (в режиме кода — выполнить код).
    let circuit = null; S.codeError = null;
    if (S.mode === 'schema') circuit = S.circuit;
    else {
      const r = buildFromCode(S.code, { oracleArity: task.oracleArity || 0, fnArgs: S.param !== undefined ? [S.param] : [] });
      if (r.error) S.codeError = r.error; else circuit = r.circuit;
    }
    S.built = circuit;
    if (!keepVerdict) { S.verdict = null; S.running = null; }
    S.live = null; S.limitRes = null; S.match = false;
    if (circuit) {
      const suite = suiteOf(task, S.param);
      if (circuit.n === suite.n) {
        S.live = liveState(task, circuit, S.param);
        S.limitRes = checkLimits(circuit, lim(), suite.n);
        const c = (suite.cases.find((x) => x.main) || suite.cases[0]);
        if (S.live && c && c.expect.kind === 'state' && !c.expect.qubits && circuit.ops.length) S.match = fidelity(c.expect.state, S.live) >= 1 - TOL;
      } else S.limitRes = { ok: false, issues: [{ kind: 'qubits', text: `в задаче ${suite.n} кубитов, в схеме — ${circuit.n}` }], stats: circuit.stats() };
    }
    renderToolbar(); renderCanvas(); renderBottom();
  }

  function pushUndo() {
    const snap = S.mode === 'schema' ? JSON.stringify(S.circuit.toJSON()) : S.code;
    if (S.undo[S.undo.length - 1] === snap) return;
    S.undo.push(snap); if (S.undo.length > 80) S.undo.shift(); S.redo = [];
  }
  function applySnap(snap) {
    if (S.mode === 'schema') { S.circuit = Circuit.fromJSON(JSON.parse(snap)); S.circuit.ops.forEach((o, i) => { if (o.col == null) S.circuit.autoColumns(); }); S.selected = null; }
    else { S.code = snap; if (codeEd) codeEd.value = snap; }
    if (board) board._undoSnap = JSON.stringify(S.circuit.toJSON());
    persist(); refresh();
  }
  function undo() { const cur = S.mode === 'schema' ? JSON.stringify(S.circuit.toJSON()) : S.code; const prev = S.undo.pop(); if (prev == null) return; S.redo.push(cur); applySnap(prev); }
  function redo() { const cur = S.mode === 'schema' ? JSON.stringify(S.circuit.toJSON()) : S.code; const nx = S.redo.pop(); if (nx == null) return; S.undo.push(cur); applySnap(nx); }

  function persist() {
    clearTimeout(saveT);
    saveT = setTimeout(() => mutate((d) => { d.drafts[task.id] = { mode: S.mode, circuit: S.circuit ? S.circuit.toJSON() : null, code: S.code }; }), 250);
  }

  // ---------- Панель инструментов ----------

  function counters() {
    const st = S.built ? S.built.stats() : null, L = lim();
    const cn = (label, val, max) => `<span class="counter ${max != null && val > max ? 'over' : ''}">${label}<b>${val == null ? '—' : max != null ? `${val}/${max}` : val}</b></span>`;
    return `${cn('гейтов', st && !S.codeError ? st.gates : null, L.gates)}${cn('глубина', st && !S.codeError ? st.depth : null, L.depth)}`;
  }

  function renderToolbar() {
    const ts = tiles(), disabledTiles = S.mode !== 'schema';
    const segs = codeOnly ? '' : `<div class="segmented"><button data-mode="schema" aria-pressed="${S.mode === 'schema'}">схема</button><button data-mode="code" aria-pressed="${S.mode === 'code'}">код</button></div><span class="sep"></span>`;
    const paramSel = task.params ? `<div class="segmented sm" title="Значение n для проверки схемы на вкладке «состояние»">${task.params.values.map((v) => `<button data-param="${v}" aria-pressed="${S.param === v}">${task.params.name} = ${v}</button>`).join('')}</div><span class="sep"></span>` : '';
    $tb.innerHTML = `${segs}${paramSel}${ts.map((t) => `<button class="tile-btn ${S.armed && S.armed.name === t.name ? 'armed' : ''} ${t.name.length > 3 ? 'wide' : ''}" data-tile="${esc(t.name)}" ${disabledTiles ? 'disabled' : ''} title="${esc(tileTitle(t))}">${esc(tileLabel(t.name))}</button>`).join('')}
      ${ts.length ? '<span class="sep"></span>' : ''}${counters()}<span class="spacer"></span>
      <button class="icon-btn" data-act="undo" aria-label="отменить" ${S.undo.length ? '' : 'disabled style="opacity:.4"'}>${icon('undo')}</button>
      <button class="icon-btn" data-act="clear" aria-label="очистить схему" ${S.mode === 'schema' ? '' : 'disabled style="opacity:.4"'}>${icon('trash')}</button>
      <button class="btn btn-secondary sm" data-act="measure">${icon('play', 'sm')}измерить ×1024</button>
      <button class="btn ${S.running ? 'btn-primary loading' : 'btn-outline'} sm" data-act="submit" ${(!round && S.limitRes && !S.limitRes.ok && !S.codeError) || S.running ? 'disabled' : ''}>${S.running ? '' : icon('upload', 'sm')}отправить</button>`;
  }
  const tileTitle = (t) => t.g === 'ORACLE' ? 'Оракул задачи (чёрный ящик)' : `${t.name}: перетащите на провод или нажмите и кликните по клетке`;

  // ---------- Холст ----------

  function renderCanvas() {
    const panel = feedbackHtml();
    if (S.mode === 'schema' && S.circuit) {
      if (S.canvasMode !== 'schema' || !board) {
        $canvas.style.justifyContent = '';
        $canvas.innerHTML = `<div id="board"></div><div class="inspector" id="insp" style="min-height:36px;margin-top:8px"></div><div id="fb" style="width:100%;display:flex;justify-content:center;margin-top:8px"></div>`;
        codeEd = null; S.canvasMode = 'schema';
        board = new Board($canvas.querySelector('#board'), { density: 'task', circuit: S.circuit, cols: Math.max(4, S.circuit.columnCount() + 1), fixedCols: false, coupling: lim().coupling, wireInit: task.wireInit, wireNames: task.wireNames,
          onChange: (c, why) => { pushUndoBefore(); S.circuit = c; persist(); S.dismissedVerdict = false; refresh(); },
          onSelect: (op) => { S.selected = op ? op.id : null; renderInspector(); },
          onContext: () => {} });
        board._undoSnap = JSON.stringify(S.circuit.toJSON());
      }
      board.circuit = S.circuit; board.state = S.live; board.o.coupling = lim().coupling; board.o.armed = S.armed;
      board.o.cols = Math.max(4, S.circuit.columnCount() + 1);
      board.o.errorOps = new Set((S.limitRes ? S.limitRes.issues : []).filter((i) => i.op).map((i) => i.op.id));
      board.render();
      $canvas.querySelector('#fb').innerHTML = panel;
      renderInspector();
    } else {
      if (S.canvasMode !== 'code' || !codeEd) {
        board = null; S.canvasMode = 'code';
        $canvas.style.justifyContent = 'flex-start';
        $canvas.innerHTML = `<div id="pv" style="max-width:100%"></div><div id="codewrap" style="width:100%;flex:1;display:flex;flex-direction:column;min-height:260px;border:1px solid var(--line-subtle);border-radius:12px;overflow:auto"></div><div id="fb" style="width:100%;display:flex;justify-content:center;margin-top:12px"></div>`;
        codeEd = new CodeEditor($canvas.querySelector('#codewrap'), { value: S.code, onChange: (v) => { pushUndoCode(); S.code = v; persist(); S.dismissedVerdict = false; debounceRefresh(); } });
      }
      codeEd.setError(S.codeError);
      $canvas.querySelector('#fb').innerHTML = panel;
      const pv = $canvas.querySelector('#pv');
      if (codeOnly && S.built && !S.codeError) {
        pv.style.marginBottom = '10px';
        new Board(pv, { density: 'mini', circuit: S.built.clone().autoColumns(), cols: Math.min(Math.max(3, S.built.columnCount()), 12), fixedCols: true, readOnly: true, state: S.live, showDisks: S.built.n <= 8, wireInit: null });
      } else { pv.innerHTML = ''; pv.style.marginBottom = ''; }
    }
  }

  let undoGuard = null;
  function pushUndoBefore() { /* снимок до изменения: board уже изменил схему, поэтому берём сохранённый */
    if (board && board._undoSnap && S.undo[S.undo.length - 1] !== board._undoSnap) { S.undo.push(board._undoSnap); if (S.undo.length > 80) S.undo.shift(); S.redo = []; }
    board._undoSnap = JSON.stringify(S.circuit.toJSON());
  }
  let codeUndoT = null, codeLast = S.code;
  function pushUndoCode() { clearTimeout(codeUndoT); if (codeLast !== null) { const snap = codeLast; codeUndoT = setTimeout(() => { if (S.undo[S.undo.length - 1] !== snap) { S.undo.push(snap); S.redo = []; } }, 0); } setTimeout(() => { codeLast = S.code; }, 400); }
  let refT = null; const debounceRefresh = () => { clearTimeout(refT); refT = setTimeout(() => { refresh(); }, 350); };

  function renderInspector() {
    const el = $canvas.querySelector('#insp'); if (!el) return;
    const op = S.selected ? S.circuit.ops.find((o) => o.id === S.selected) : null;
    if (!op) { el.innerHTML = ''; return; }
    const ang = ['P', 'RX', 'RY', 'RZ'].includes(op.g);
    el.innerHTML = `<span class="mono muted" style="font-size:13px">${esc(opName(op))}${op.t.length ? ` · q${op.t.join(', q')}` : ''}${op.c.length ? ` ← q${op.c.join(', q')}` : ''}</span>
      ${ang ? `<label class="row" style="gap:8px"><span class="muted t-small">угол θ</span><span class="control sm angle-input"><input id="ang" value="${esc(PI_TEXT(op.p[0]))}" aria-label="угол" spellcheck="false"></span></label>` : ''}
      <button class="btn btn-ghost xs" data-act="delop">${icon('trash', 'sm')}удалить гейт</button>`;
    const inp = el.querySelector('#ang');
    if (inp) inp.addEventListener('change', () => {
      const v = evalAngle(inp.value);
      if (v == null) { inp.closest('.control').style.borderColor = 'var(--accent-text)'; return; }
      op.p = [v]; board.o.onChange(S.circuit, 'angle');
    });
  }
  const opName = (op) => { const t = (lim().basis || []).find((n) => { const p = parseTile(n); return p && p.g === op.g && p.nc === (op.c || []).length; }); return t || op.g; };

  // ---------- Обратная связь под схемой ----------

  function feedbackHtml() {
    if (S.running) return runningHtml();
    if (S.verdict && !S.dismissedVerdict) return verdictHtml(S.verdict);
    if (S.codeError) return `<div class="hintbar"><span class="status error">${icon('code')}ошибка в коде · строка ${S.codeError.line ?? '?'}</span><div class="sub">${esc(S.codeError.msg)}${S.codeError.hint ? ' — ' + esc(S.codeError.hint) : ''}</div></div>`;
    const coach = task.coach && D.settings.hints !== false && !D.onboarding.dismissed && S.mode === 'schema' && S.circuit && S.circuit.ops.length < 2;
    if (coach && !S.limitRes?.issues.length) {
      const step = S.circuit.ops.length === 0 ? 0 : 1, c = task.coach[step];
      return `<div class="hintbar"><span class="badge">${step + 1}/${task.coach.length}</span><div class="grow"><div class="ttl">${esc(c.title)}</div><div class="sub">${esc(c.text)}</div></div><button class="icon-btn" data-act="dismiss-coach" aria-label="закрыть">${icon('x', 'sm')}</button></div>`;
    }
    if (S.limitRes && !S.limitRes.ok) {
      const iss = S.limitRes.issues, k = iss[0].kind;
      const pill = k === 'coupling' ? 'нарушена связность' : k === 'basis' ? 'гейт вне базиса' : k === 'oracle' ? 'вызовы оракула' : k === 'qubits' ? 'число кубитов' : 'лимит превышен';
      let text = iss.map((i) => i.text).join(' и ');
      if (k === 'coupling') text += `. Запутайте по цепочке: соседние кубиты ${couplingLabel(lim().coupling, S.built.n).replace(/ — /g, ' — ')}.`;
      else if (k === 'gates' || k === 'depth') { const dup = findCancelling(S.built); if (dup) text += ` — отправка ${round ? 'получит вердикт «лимит»' : 'заблокирована'}. ${dup}`; else text += round ? ' — отправка получит вердикт «лимит».' : ' — отправка заблокирована.'; }
      return `<div class="hintbar warn"><span class="pill-warn">${icon('alert', 'sm')} ${pill}</span><div class="sub">${esc(text)}</div></div>`;
    }
    if (S.match) return `<div class="hintbar ok">${icon('check', 'big')}<div class="grow"><div class="ttl" style="font-weight:500">Состояние совпало с целью</div><div class="sub">Отправьте — решение проверят на наборе входов и в лимитах. «Измерить» — 1024 измерения, как на железе.</div></div>${round && ctx.round.noSubmit ? '' : `<button class="btn btn-primary sm" data-act="submit">${icon('upload', 'sm')}отправить</button>`}</div>`;
    return '';
  }

  function findCancelling(c) {
    if (!c) return null;
    const ops = c.ops;
    for (let i = 0; i < ops.length; i++) for (let j = i + 1; j < ops.length; j++) {
      const a = ops[i], b = ops[j];
      if (a.g === b.g && a.g in { X: 1, H: 1, Z: 1, Y: 1 } && JSON.stringify(a.t) === JSON.stringify(b.t) && JSON.stringify(a.c) === JSON.stringify(b.c)) {
        const between = ops.slice(i + 1, j).some((o) => involved(o).some((q) => involved(a).includes(q)));
        if (!between) return `Два ${opName(a)} подряд на ${a.t.map((q) => 'q' + q).join(', ')} взаимно гасятся: уберите оба.`;
      }
    }
    return null;
  }

  function stepsHtml(steps, activeIdx = -1) {
    return `<div class="steps">${steps.map((s, i) => `${i ? `<span class="step-line ${steps[i - 1].status === 'ok' ? 'ok' : ''}"></span>` : ''}<div class="step ${s.status === 'ok' ? 'ok' : s.status === 'fail' ? 'fail' : i === activeIdx ? 'run' : ''}"><span class="c">${s.status === 'ok' ? icon('check', 'sm') : s.status === 'fail' ? icon('x', 'sm') : i === activeIdx ? '<span class="spinner"></span>' : `<span class="mono" style="font-size:12px">${i + 1}</span>`}</span><span>${esc(s.label)}</span></div>`).join('')}</div>`;
  }

  function runningHtml() {
    const r = S.running;
    return `<div class="verdict" style="flex-direction:column;gap:16px;text-align:center"><div class="muted t-small">проверяем · ${Math.min(r.k + 1, 3)} из 3</div>${stepsHtml(r.steps, r.k)}<div class="muted t-small">Проверка идёт в вашем браузере и занимает доли секунды.</div></div>`;
  }

  function verdictHtml(res) {
    const steps = res.steps || [];
    if (res.verdict === 'ok') {
      const next = TASKS[idx + 1];
      const first = S.firstSolve;
      const sub = first ? `<div class="ok t-mono" style="margin:6px 0 12px">${S.firstOverall ? 'первая задача решена' : 'решено'}${S.streakText ? ' · ' + esc(S.streakText) : ''}</div>` : '<div class="ok t-mono" style="margin:6px 0 12px">решено ещё раз</div>';
      return `<div class="verdict"><div class="seal">${esc(sealLabel())}</div>
        <div class="grow"><div style="font:600 44px/48px var(--font-display);letter-spacing:-1.5px">принято</div>${sub}${stepsHtml(steps)}
        ${S.ratingNote ? `<div class="muted t-small" style="margin-top:12px">${esc(S.ratingNote)}</div>` : ''}</div>
        <div class="col" style="gap:10px;align-items:stretch;min-width:230px">
          ${round ? `<a class="btn btn-primary" href="#/contests/${round.n}">к задачам раунда${icon('arrow-r')}</a>` : next ? `<a class="btn btn-primary" href="#/tasks/${next.num}">№ ${next.num} · ${esc(shortTitle(next.title))}${icon('arrow-r')}</a>` : ''}
          ${round && !ctx.round.analysisOpen ? '' : `<button class="btn btn-ghost sm" style="justify-content:flex-start" data-act="analysis">${icon('book', 'sm')}разбор задачи</button>`}
          <button class="btn btn-ghost sm" style="justify-content:flex-start" data-act="share">${icon('ext', 'sm')}поделиться</button>
        </div></div>`;
    }
    if (res.verdict === 'error') return `<div class="hintbar"><span class="status error">${icon('code')}ошибка в коде · строка ${res.error.line ?? '?'}</span><div class="sub">${esc(res.error.kind)}: ${esc(res.error.msg)} — попытка не засчитана.</div></div>`;
    const f = res.fail, kind = res.verdict;
    const head = `${statusHtml(KINDS[kind], verdictText(res))}`;
    let body = '';
    if (kind === 'wa') {
      body = f.got && f.expected ? `<div style="display:flex;align-items:center;gap:20px;flex-wrap:wrap;justify-content:center"><div><div class="muted t-mono-s">получено</div><div class="bad" style="font:400 26px/34px var(--font-mono)">${esc(shortKet(f.got))}</div></div><span style="font:400 28px var(--font-mono)">≠</span><div><div class="muted t-mono-s">ожидалось</div><div style="font:400 26px/34px var(--font-mono)">${esc(f.expected)}</div></div></div>` : (f.got || f.expected ? `<div class="mono" style="font-size:18px">${esc(f.got || '')}${f.expected ? ' · ' + esc(f.expected) : ''}</div>` : '');
      body += `<div class="secondary" style="font-size:14px;max-width:640px;text-align:center">${esc(f.note || wrongHint(res))}</div>`;
    } else if (kind === 'limit') {
      body = `<div class="secondary" style="max-width:640px;text-align:center">${esc(res.limit.issues.map((i) => i.text).join('; '))}. Состояние верное, но лимиты нарушены.</div>`;
    } else if (kind === 'noise') {
      body = `<div class="secondary" style="max-width:640px;text-align:center">При шуме ${pct(res.eps)} точность схемы ${pct(res.noise.fSub, 1)} против ${pct(res.noise.fRef, 1)} у эталона. Уберите лишние гейты: каждый двухкубитный вносит ошибку.</div>`;
    }
    return `<div class="verdict" style="flex-direction:column;gap:14px;text-align:center;align-items:center">${head}${stepsHtml(steps)}${body}${S.penaltyNote ? `<div class="muted t-small">${esc(S.penaltyNote)}</div>` : ''}</div>`;
  }
  const shortTitle = (t) => t.toLowerCase().replace(/\(.*\)/, '').trim().slice(0, 28);
  const shortKet = (s) => (s.length > 40 ? s.slice(0, 38) + '…' : s);
  const sealLabel = () => (task.io.out.startsWith('(|00⟩ + |11⟩)') ? '|Φ+⟩' : `№ ${task.num}`);
  function wrongHint(res) {
    const f = res.fail;
    if (f.reason === 'phase') return 'Фазы не согласованы.';
    return 'Схема даёт другое состояние. Сравните вероятности и формулу на вкладке «состояние».';
  }

  // ---------- Нижняя часть ----------

  function renderBottom() {
    const subs = D.submissions.filter((s) => s.taskId === task.id && (!round || s.round === round.n));
    const tabs = [['state', 'состояние'], ['tests', 'тесты', 3], ['subs', 'отправки', subs.length || null]];
    if (S.measure) tabs.push(['meas', 'измерения', 1]);
    $bottom.innerHTML = `<div class="tabs" role="tablist">${tabs.map(([k, t, c]) => `<button class="tab" role="tab" data-tab="${k}" aria-selected="${S.tab === k}">${t}${c ? `<span class="cnt">${c}</span>` : ''}</button>`).join('')}</div><div id="bbody"></div>`;
    const body = $bottom.querySelector('#bbody');
    if (S.tab === 'state') body.innerHTML = stateTab();
    else if (S.tab === 'tests') body.innerHTML = testsTab();
    else if (S.tab === 'subs') body.innerHTML = subsTab(subs);
    else body.innerHTML = measTab();
  }

  function stateTab() {
    const st = S.live;
    if (S.codeError) return `<div class="muted" style="padding:16px 0">Схема не построена: код упал до проверки. Исправьте ошибку в редакторе.</div>`;
    if (!st) return `<div class="muted" style="padding:16px 0">${S.limitRes && S.limitRes.issues.some((i) => i.kind === 'qubits') ? 'Число кубитов схемы не совпадает с условием.' : 'Состояние недоступно для схемы с измерением посередине.'}</div>`;
    const n = st.n, rows = [];
    for (let i = 0; i < st.dim; i++) rows.push({ i, p: st.prob(i) });
    const nz = rows.filter((r) => r.p > 1e-9);
    const show = st.dim <= 8 ? rows : nz.slice(0, 8);
    const hidden = st.dim - show.length;
    const f = formatState(st);
    let comment = '';
    const mixed = Array.from({ length: n }, (_, q) => blochOf(st, q)).some((b) => Math.hypot(b.x, b.y, b.z) < 0.995);
    if (S.match) comment = mixed ? 'Кубиты запутаны — пунктир на дисках.' : 'Состояние совпало с целью.';
    else if (S.built && !S.built.ops.length) comment = 'Схема пуста: состояние остаётся входным.';
    else if (S.limitRes && !S.limitRes.ok && S.limitRes.issues[0].kind === 'coupling') comment = 'Гейт на несвязанных кубитах: запутывайте соседей.';
    else if (mixed) comment = 'Кубиты запутаны — пунктир на дисках.';
    return `<div class="bottom-body">
      <div><div class="row" style="justify-content:space-between"><span class="t-kicker">вероятности исходов</span><span class="muted t-mono-s">порядок |${n > 1 ? `q${n - 1} … q0` : 'q0'}⟩</span></div>
        ${show.map((r) => `<div class="prob-row ${r.p < 1e-9 ? 'zero' : ''}"><span>${ket(r.i, n)}</span><div class="bar"><i style="width:${(r.p * 100).toFixed(1)}%"></i></div><span class="p">${pct(r.p)}</span></div>`).join('')}
        ${hidden > 0 ? `<div class="muted t-mono-s" style="margin-top:6px">ещё ${hidden} ${plural(hidden, 'исход', 'исхода', 'исходов')} с нулевой вероятностью скрыты</div>` : ''}</div>
      <div class="col" style="gap:6px"><span class="t-kicker">состояние сейчас</span><div class="state-big">${esc(f.text)}</div>
        <div class="mono muted" style="font-size:13px">цель&nbsp;&nbsp;${esc(task.io.out)}</div><div class="secondary" style="font-size:14px">${esc(comment)}</div></div></div>`;
  }

  function testsTab() {
    const suite = suiteOf(task, S.param), L = lim(), eps = round ? Math.max(round.noise || 0, task.noise?.eps || 0) : (task.noise?.eps || 0);
    const last = S.verdict && S.verdict.steps;
    const st = (i) => (last ? last[i].status : null);
    const item = (i, ttl, text) => `<div class="sub-row" style="align-items:flex-start;gap:16px"><span class="step ${st(i) === 'ok' ? 'ok' : st(i) === 'fail' ? 'fail' : ''}"><span class="c">${st(i) === 'ok' ? icon('check', 'sm') : st(i) === 'fail' ? icon('x', 'sm') : `<span class="mono" style="font-size:12px">${i + 1}</span>`}</span></span><div class="grow"><div style="font-weight:600;font-family:var(--font-body)">${ttl}</div><div class="secondary" style="font-family:var(--font-body);margin-top:2px">${text}</div></div></div>`;
    const nIn = suite.cases.length;
    return `<div style="max-width:760px;padding-top:6px">
      ${item(0, `Входы · ${nIn}`, `Схема запускается на ${nIn} ${plural(nIn, 'входе', 'входах', 'входах')}${task.params ? ` для n = ${task.params.values.join(', ')}` : ''}. Результат сравнивается с ожидаемым состоянием с точностью до глобальной фазы${task.archetype === 'T3' || task.archetype === 'T2' ? ', а фазы между входами должны совпасть' : ''}. Вспомогательные кубиты обязаны вернуться в |0⟩.`)}
      ${item(1, `Шум · ${pct(eps)}`, eps ? `Схема считается с деполяризующим шумом ${pct(eps)} на каждый двухкубитный гейт (на однокубитные — в 10 раз меньше). Точность не должна быть ниже эталона больше чем на ${Math.round((task.noise?.slack ?? 0.02) * 100)} п.п.` : 'В банке задач шум отключён. В раундах схема дополнительно проверяется с шумом.')}
      ${item(2, 'Лимиты', consRows().map(([k, v]) => `${esc(k)}: ${esc(v)}`).join(' · ') || 'без ограничений')}
      <div class="muted t-small" style="margin-top:12px">Демо-версия: проверка работает в браузере, тесты видны в исходном коде. В боевой версии набор тестов хранится на сервере.</div></div>`;
  }

  function subsTab(subs) {
    if (!subs.length) return `<div class="muted" style="padding:20px 0">Отправок пока нет.</div>`;
    return `<div style="padding-top:6px">${subs.slice(0, 20).map((s) => `<div class="sub-row"><span class="muted">#${s.num}</span>${statusHtml(s.kind, s.label)}${s.note ? `<span class="muted">${esc(s.note)}</span>` : ''}<span class="time">${timeHM(new Date(s.ts))}${s.penalty ? ` · +${s.penalty} мин` : round ? '' : ' · в банке без штрафа'}</span></div>`).join('')}${S.verdict && S.verdict.verdict === 'error' ? `<div class="secondary" style="margin-top:12px;font-size:14px">Схема не построена: код упал до проверки. Исправьте строку ${S.verdict.error.line ?? ''} — подсказка прямо в редакторе.</div>` : ''}</div>`;
  }

  function measTab() {
    const m = S.measure; if (!m) return '';
    const rows = [...m.counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8);
    const max = Math.max(...rows.map((r) => r[1]));
    return `<div class="bottom-body"><div><div class="row" style="justify-content:space-between"><span class="t-kicker">${m.shots} измерений</span><span class="muted t-mono-s">идеальный симулятор · ${m.ms} мс</span></div>
      ${rows.map(([i, c]) => `<div class="prob-row" style="grid-template-columns:70px 1fr 56px"><span>${ket(i, m.n)}</span><div class="bar"><i style="width:${(c / m.shots * 100).toFixed(1)}%"></i></div><span class="p">${c}</span></div>`).join('')}
      <div class="secondary" style="font-size:14px;margin-top:8px">Разброс счётчиков — случайность измерений. Живое «состояние» показывает точные вероятности.</div></div>
      <div class="col" style="gap:0"><span class="t-kicker" style="margin-bottom:8px">настройки измерения</span><div class="cons"><div class="row"><span class="secondary">запусков</span><span class="v">${m.shots}</span></div><div class="row"><span class="secondary">шум</span><span class="v">нет · идеальный</span></div><div class="row"><span class="secondary">seed</span><span class="v">случайный</span></div></div>
      <button class="btn btn-outline sm" data-act="measure" style="align-self:flex-start;margin-top:12px">${icon('refresh', 'sm')}измерить ещё раз</button></div></div>`;
  }

  // ---------- Действия ----------

  function doMeasure() {
    if (!S.live) { toast({ title: 'Нечего измерять', text: S.codeError ? 'Сначала исправьте ошибку в коде.' : 'Схема недоступна для измерения.', kind: 'warn' }); return; }
    const t0 = performance.now();
    const counts = sample(S.live.probs(), 1024, rng((Math.random() * 2 ** 31) >>> 0));
    S.measure = { counts, shots: 1024, n: S.live.n, ms: Math.max(0.01, (performance.now() - t0)).toFixed(2).replace('.', ',') };
    S.tab = 'meas'; renderBottom();
  }

  async function submit() {
    if (S.running) return;
    if (isGuest()) {
      const v = await modal({ title: 'Чтобы отправить решение, войдите', body: 'Смотреть задачи и пользоваться редактором можно без входа. Прогресс и отправки сохраняются в аккаунте — в демо он хранится только в этом браузере.', actions: [{ label: 'позже', value: null }, { label: 'зарегистрироваться', kind: 'primary', value: 'reg' }, { label: 'войти', value: 'in' }] });
      if (v === 'reg') navigate('/register'); else if (v === 'in') navigate('/login');
      return;
    }
    if (round && ctx.round.expired && ctx.round.expired()) { toast({ title: 'Время раунда вышло', text: 'Приём решений закрыт.', kind: 'warn' }); return; }
    const eps = round ? Math.max(round.noise || 0, task.noise?.eps || 0) : (task.noise?.eps || 0);
    const res = judge(task, currentBuild(), { noise: eps });
    // анимация шагов
    const labels = res.steps.length ? res.steps : [{ label: 'вход', status: 'skip' }, { label: `шум ${pct(eps)}`, status: 'skip' }, { label: 'лимиты', status: 'skip' }];
    S.running = { k: 0, steps: labels.map((s) => ({ label: s.label, status: null })) };
    S.dismissedVerdict = false; renderToolbar(); renderCanvas();
    for (let k = 0; k < 3; k++) {
      await new Promise((r) => setTimeout(r, 260));
      if (destroyed) return;
      S.running.steps[k].status = res.steps[k] ? (res.steps[k].status === 'skip' ? null : res.steps[k].status) : null; S.running.k = k + 1;
      if (res.steps[k] && res.steps[k].status === 'fail') break;
      renderCanvas();
    }
    S.running = null;
    finish(res);
  }

  function finish(res) {
    const ts = Date.now();
    S.verdict = res; S.penaltyNote = null; S.ratingNote = null; S.firstSolve = false; S.streakText = null;
    const kind = KINDS[res.verdict] || 'wrong';
    const counted = res.verdict !== 'error';
    let sub;
    mutate((d) => {
      d.subSeq = (d.subSeq || 98000) + 1;
      sub = { num: d.subSeq, taskId: task.id, ts, kind, label: verdictText(res), verdict: res.verdict, round: round ? round.n : null, penalty: 0, note: res.verdict === 'error' ? 'попытка не засчитана' : '' };
      if (counted) d.attempts[task.id] = (d.attempts[task.id] || 0) + 1;
      if (round) {
        if (counted && res.verdict !== 'ok') sub.penalty = 5;
      }
      d.submissions.unshift(sub); d.submissions = d.submissions.slice(0, 200);
      touchActivity(d, ts);
      if (res.verdict === 'ok') {
        const had = !!d.solved[task.id];
        if (!had) {
          S.firstSolve = true;
          S.firstOverall = Object.keys(d.solved).length === 0;
          d.solved[task.id] = { at: ts, attempts: d.attempts[task.id] || 1, code: S.mode === 'code' ? S.code : circuitToCode(S.circuit || S.built, {}) };
          bumpStreak(d, ts);
          const st = streakNow(d);
          S.streakText = `серия ${st} ${plural(st, 'день', 'дня', 'дней')}`;
          notify(d, { kind: 'accept', title: `Принято: задача ${task.num}`, text: task.title, href: `/tasks/${task.num}` });
        }
        if (!round) S.ratingNote = 'Рейтинг появится после первого раунда.';
      }
    });
    if (round && ctx.round.onVerdict) { const note = ctx.round.onVerdict(res, task, sub); if (note) S.penaltyNote = note; }
    if (round && res.verdict === 'ok') S.ratingNote = null;
    S.tab = res.verdict === 'ok' && false ? 'state' : (res.verdict === 'error' ? 'subs' : S.tab);
    renderToolbar(); renderCanvas(); renderBottom();
    if (res.verdict === 'ok') toast({ title: `Принято: задача ${task.num}`, text: task.title, kind: 'ok' });
  }

  function showAnalysis() {
    const code = task.reference;
    modal({ title: `разбор · ${task.title}`, width: 640, body: raw(`${task.analysis.map((p) => `<p class="secondary" style="margin-bottom:10px">${inline(p)}</p>`).join('')}<div class="t-kicker" style="margin:14px 0 8px">эталонное решение (составлено командой)</div><pre class="mono" style="background:var(--bg-inset);border:1px solid var(--line-subtle);border-radius:10px;padding:14px;overflow:auto;font-size:13px;line-height:20px;margin:0">${esc(code)}</pre>`), actions: [{ label: 'закрыть', kind: 'primary', value: true }] });
  }

  function showHint() {
    if (ctx.hints === false) return;
    if (S.hintLevel >= 2) { renderHint(); return; }
    S.hintLevel++; mutate((d) => { d.hintUsed[task.id] = S.hintLevel; }); renderHint();
  }
  function renderHint() {
    const box = $('#hint-box');
    if (!S.hintLevel) { box.innerHTML = ''; return; }
    box.innerHTML = `<div class="card" style="padding:14px 16px;font-size:14px;line-height:20px"><div class="t-kicker" style="margin-bottom:6px">подсказка ${S.hintLevel} из 2</div>${esc(S.hintLevel >= 1 ? task.hint : '')}${S.hintLevel >= 2 ? `<div style="margin-top:8px" class="secondary">${esc(task.hint2)}</div>` : '<div style="margin-top:10px"><button class="btn btn-ghost xs" data-act="hint">ещё подсказка</button></div>'}</div>`;
  }

  function switchMode(m) {
    if (m === S.mode || codeOnly) return;
    if (m === 'code') {
      const cur = JSON.stringify(S.circuit.toJSON());
      if (cur !== codeSyncedJson) { S.code = circuitToCode(S.circuit, { hasOracle: !!task.oracleArity }); codeSyncedJson = cur; }
      S.mode = 'code'; codeLast = S.code; S.canvasMode = null; codeEd = null;
    } else {
      const r = buildFromCode(S.code, { oracleArity: task.oracleArity || 0, fnArgs: [] });
      if (r.error) { toast({ title: 'Код нельзя показать как схему', text: `${r.error.kind}: ${r.error.msg}`, kind: 'warn' }); return; }
      if (r.circuit.n !== nQ) { toast({ title: 'Другое число кубитов', text: `В задаче ${nQ}, в коде — ${r.circuit.n}.`, kind: 'warn' }); return; }
      pushUndo();
      S.circuit = r.circuit.autoColumns(); codeSyncedJson = JSON.stringify(S.circuit.toJSON());
      S.mode = 'schema'; board = null; S.canvasMode = null; codeEd = null;
    }
    persist(); refresh();
  }

  // ---------- События ----------

  function clearBoardRefs() { board = null; }
  on(root, 'click', '[data-act],[data-mode],[data-tab],[data-param],[data-tile]', (e, t) => {
    if (t.dataset.mode) { switchMode(t.dataset.mode); return; }
    if (t.dataset.tab) { S.tab = t.dataset.tab; renderBottom(); return; }
    if (t.dataset.param) { S.param = +t.dataset.param; refresh(); return; }
    if (t.dataset.tile) {
      const tile = tiles().find((x) => x.name === t.dataset.tile);
      if (tile && !t._dragged) { S.armed = S.armed && S.armed.name === tile.name ? null : tile; if (board) board.o.armed = S.armed; renderToolbar(); }
      return;
    }
    switch (t.dataset.act) {
      case 'submit': submit(); break;
      case 'measure': doMeasure(); break;
      case 'undo': undo(); break;
      case 'clear': if (S.circuit && S.circuit.ops.length) { board ? board.clear() : null; } break;
      case 'hint': showHint(); break;
      case 'delop': if (S.selected) board.remove(S.selected); break;
      case 'dismiss-coach': mutate((d) => { d.onboarding.dismissed = true; }); renderCanvas(); break;
      case 'analysis': showAnalysis(); break;
      case 'share': navigator.clipboard && navigator.clipboard.writeText(location.href).then(() => toast({ title: 'Ссылка скопирована', kind: 'ok' })).catch(() => {}); break;
    }
  });

  // Перетаскивание гейтов из палитры на доску.
  $tb.addEventListener('pointerdown', (e) => {
    const btn = e.target.closest('[data-tile]');
    if (!btn || btn.disabled || !board) return;
    const tile = tiles().find((x) => x.name === btn.dataset.tile);
    const start = { x: e.clientX, y: e.clientY };
    let ghost = null, moved = false;
    const move = (ev) => {
      if (!moved && Math.hypot(ev.clientX - start.x, ev.clientY - start.y) < 6) return;
      moved = true;
      if (!ghost) { ghost = btn.cloneNode(true); ghost.style.cssText = 'position:fixed;z-index:200;pointer-events:none;opacity:.9'; document.body.append(ghost); }
      ghost.style.left = ev.clientX - 22 + 'px'; ghost.style.top = ev.clientY - 22 + 'px';
      const cell = cellUnder(ev); board.hoverCol !== (cell ? cell.c : null) && board.setColumnHover(cell ? cell.c : null);
    };
    const up = (ev) => {
      removeEventListener('pointermove', move); removeEventListener('pointerup', up);
      if (ghost) ghost.remove();
      if (moved) {
        btn._dragged = true; setTimeout(() => { btn._dragged = false; }, 0);
        const cell = cellUnder(ev); board.hoverCol = null;
        if (cell) { if (tile.g === 'ORACLE') placeOracle(cell.c); else board.place(tile, cell.c, cell.r); } else board.render();
      }
    };
    addEventListener('pointermove', move); addEventListener('pointerup', up);
  });
  function cellUnder(ev) {
    const svg = board && board.svg; if (!svg) return null;
    const r = svg.getBoundingClientRect();
    if (ev.clientX < r.left || ev.clientX > r.right || ev.clientY < r.top || ev.clientY > r.bottom) return null;
    return board.cellAt(board.point(ev));
  }
  function placeOracle(col) {
    const k = task.oracleArity, t = Array.from({ length: k }, (_, i) => i);
    if (!board.spanFree(col, 0, k - 1)) { const c = board.nextFreeCol(col, 0, k - 1); if (c == null) return; col = c; }
    board.circuit.ops.push({ g: 'ORACLE', t, c: [], p: [], col, id: Math.random() * 1e9 | 0 }); board.sortOps(); board.commit('oracle');
  }
  // клик по пустой клетке при выбранной «кисти» работает внутри Board (через o.armed), поэтому обновляем после установки
  const origPlace = null;

  const keyHandler = (e) => {
    if (e.target.matches('input, textarea')) return;
    if ((e.key === 'Delete' || e.key === 'Backspace') && S.selected && board) { e.preventDefault(); board.remove(S.selected); }
    else if (e.key === 'Escape') { if (S.armed) { S.armed = null; if (board) board.o.armed = null; renderToolbar(); } else if (S.selected && board) board.select(null); }
    else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z') { e.preventDefault(); e.shiftKey ? redo() : undo(); }
  };
  document.addEventListener('keydown', keyHandler);

  // Часы раунда
  let clockT = null;
  if (round) {
    const tick = () => { const el = root.querySelector('[data-round-clock]'); if (el) { const ms = round.endsAt - Date.now(); const s = Math.max(0, Math.floor(ms / 1000)); el.textContent = `${pad2(Math.floor(s / 60))}:${pad2(s % 60)}`; } };
    tick(); clockT = setInterval(tick, 1000);
  }

  renderHint();
  refresh();
  return function cleanup() {
    destroyed = true; clearTimeout(saveT); clearInterval(clockT); document.removeEventListener('keydown', keyHandler);
    mutate((d) => { d.drafts[task.id] = { mode: S.mode, circuit: S.circuit ? S.circuit.toJSON() : null, code: S.code }; });
  };
}

function starterCode(task) {
  const sig = task.params ? `def solve(${task.params.name}):\n    qc = QuantumCircuit(${task.limits && typeof task.limits === 'function' && task.id === 'even-nonzero' ? 'n + 2' : task.params.name})\n    # ваш код\n    return qc\n` : 'qc = QuantumCircuit(2)\n';
  return `from qiskit import QuantumCircuit\n\n${sig}`;
}
