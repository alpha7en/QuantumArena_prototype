// Интерфейс песочницы. Вся квантовая логика — в core.js.
import {
  MAXQ, REG, GATES, SETS, lab, kind, isService, evalExpr, blockFromCode, expandBlock, parseProgram, layout, sorted, spanOf,
  metrics, violations, decompose, fmtA, genQiskit, blockBodyCode, genQasm, genPenny, genCirq, genJson, genLatex,
  simulate, probsOf, clbitDist, blochOf, densityOf, unitaryOf, stabilizers, noisyDist, circuitFidelity, rng, sample, checkContract, clbitsOf,
} from './core.js';
import { EXAMPLES, TEMPLATES, DEMO_TASK } from './examples.js';

// ───────── мелочи ─────────
const IC = { play: 'M7 5l12 7-12 7z', undo: 'M9 14L4 9l5-5 M4 9h10a6 6 0 010 12h-3', redo: 'M15 14l5-5-5-5 M20 9H10a6 6 0 000 12h3', download: 'M12 3v12 M7 10l5 5 5-5 M5 21h14', share: 'M4 12v7a2 2 0 002 2h12a2 2 0 002-2v-7 M16 6l-4-4-4 4 M12 2v13', 'chev-d': 'M6 9l6 6 6-6', 'chev-l': 'M15 6l-6 6 6 6', plus: 'M12 5v14 M5 12h14', minus: 'M5 12h14', x: 'M6 6l12 12 M18 6L6 18', doc: 'M14 3H6a1 1 0 00-1 1v16a1 1 0 001 1h12a1 1 0 001-1V8z M14 3v5h5', folder: 'M3 6a1 1 0 011-1h5l2 2h9a1 1 0 011 1v10a1 1 0 01-1 1H4a1 1 0 01-1-1z', code: 'M8 7l-5 5 5 5 M16 7l5 5-5 5', gates: 'M4 4h6v6H4z M14 4h6v6h-6z M4 14h6v6H4z M14 14h6v6h-6z', blocks: 'M4 7h16v10H4z M8 3v4 M16 3v4 M8 17v4 M16 17v4', book: 'M4 5a2 2 0 012-2h13v16H6a2 2 0 00-2 2z M4 21V5', history: 'M3 12a9 9 0 109-9 M3 4v5h5 M12 7v5l3 2', sliders: 'M4 7h16 M4 17h16 M9 4v6 M15 14v6', copy: 'M9 9h11v11H9z M5 15H4V4h11v1', check: 'M5 12l5 5 9-10', sync: 'M4 10a8 8 0 0114-4l2 2 M20 4v4h-4 M20 14a8 8 0 01-14 4l-2-2 M4 20v-4h4', warn: 'M12 3l10 18H2z M12 10v4 M12 17.5v.5', info: 'M12 3a9 9 0 100 18 9 9 0 000-18z M12 11v6 M12 7.5v.5', measure: 'M4 17a8 8 0 0116 0 M12 17l5-7', keyboard: 'M3 6h18v12H3z M7 10h.01 M11 10h.01 M15 10h.01 M7 14h10', trash: 'M4 7h16 M9 7V4h6v3 M6 7l1 13h10l1-13', split: 'M4 6h6v12H4z M14 6h6v5h-6z M14 15h6v3h-6z', 'ctrl-add': 'M12 4v16 M12 8a2 2 0 100 .01 M17 15h5 M19.5 12.5v5', 'ctrl-del': 'M12 4v16 M12 8a2 2 0 100 .01 M17 15h5', panel: 'M3 5h18v14H3z M9 5v14', panelr: 'M3 5h18v14H3z M15 5v14', star: 'M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z', sun: 'M12 4V2 M12 22v-2 M4 12H2 M22 12h-2 M5.6 5.6L4.2 4.2 M19.8 19.8l-1.4-1.4 M5.6 18.4l-1.4 1.4 M19.8 4.2l-1.4 1.4 M12 7a5 5 0 100 10 5 5 0 000-10z', moon: 'M20 14A8 8 0 0110 4a8 8 0 1010 10z', wave: 'M2 12c2-4 4-4 6 0s4 4 6 0 4-4 6 0', grip: 'M9 6h.01 M15 6h.01 M9 12h.01 M15 12h.01 M9 18h.01 M15 18h.01', pen: 'M4 20h4L19 9l-4-4L4 16z M13 7l4 4', back: 'M19 12H5 M11 6l-6 6 6 6' };
const svgI = n => `<svg viewBox="0 0 24 24" fill="${n === 'play' ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${IC[n]}"/></svg>`;
function paintIcons(root) { (root || document).querySelectorAll('[data-i]').forEach(e => { if (!e.firstChild) { e.innerHTML = svgI(e.dataset.i); e.style.display = 'inline-flex'; if (e.classList.contains('chevw')) e.firstChild.classList.add('chev'); } }); }
const $ = s => document.querySelector(s);
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const isMac = /Mac|iPhone|iPad/.test(navigator.platform || '');
const MOD = isMac ? '⌘' : 'Ctrl+';
const plural = (n, a, b, c) => { const m10 = n % 10, m100 = n % 100; return m10 === 1 && m100 !== 11 ? a : m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14) ? b : c; };
const fmt = (v, d) => (v < -5e-7 ? '−' : '') + Math.abs(v).toFixed(d ?? 2).replace('.', ',');
const bitstr = (i, n) => i.toString(2).padStart(n, '0');
const basis = (i, n) => '|' + bitstr(i, n) + '⟩';
const hhmm = (d = new Date()) => d.toTimeString().slice(0, 5);
const NOISE_NAME = { none: 'без шума', depol: 'деполяризующий', heron: 'шум Heron' };

const PAL = [['базовые', ['H', 'X', 'Y', 'Z', 'S', 'T', 'Sdg', 'Tdg']], ['вращения', ['RX', 'RY', 'RZ', 'P', 'SX']], ['многокубитные', ['CX', 'CZ', 'SWAP', 'CCX', 'CY', 'CP', 'CH', 'CCZ']], ['служебные', ['M', 'R', 'BAR']]];
const TILE_TITLE = { M: 'измерение в классический бит', R: 'сброс кубита в |0⟩', BAR: 'барьер: разделитель, на результат не влияет', CCX: 'Тоффоли', SX: 'корень из X', P: 'фазовый сдвиг', CH: 'управляемый H', CCZ: 'CZ с двумя управляющими' };
const tileLabel = g => g === 'M' ? svgI('measure') : esc(lab(g));

// ───────── состояние ─────────
let uid = 1; const nid = () => uid++;
const S = {
  n: 3, nc: 0, ops: [], loops: [], sel: null, bsel: null, slice: null, mode: 'split', set: 'std', lang: 'qiskit', view: 'probs', blochQ: 0, branch: 0,
  leftOpen: true, rightOpen: true, drawer: null, editing: null, blockTab: 'code', armed: null, split: 0.56,
  run: { backend: 'browser', shots: 1024, noise: 'none', seed: '' }, noise: { p1: .05, p2: .8, ro: 1.5 }, runRes: null,
  history: [], future: [], codeText: '', goodText: '', codeState: 'ok', codeErr: '', probsMode: 'chart', matMode: 'rho', matPart: 'abs',
  saved: 'ok', savedAt: null, rev: 0, curLine: -1,
};
let STORE = { projects: [], cur: null };   // проекты пользователя (localStorage)
let TASK = null;                          // контракт задачи, если песочница открыта из задачи
const EMBED = new URLSearchParams(location.search).has('embed');
const allowNow = () => TASK && TASK.allow ? TASK.allow : SETS[S.set].allow;
const setName = () => TASK && TASK.allow ? 'набор задачи' : SETS[S.set].name;
const project = () => STORE.projects.find(p => p.id === STORE.cur);

// ───────── хранение ─────────
const LS_KEY = 'sparq.sandbox.v2';
const storage = (() => { try { const k = '__sparq_probe'; localStorage.setItem(k, '1'); localStorage.removeItem(k); return localStorage; } catch (e) { return null; } })();
const taskKey = () => 'sparq.sandbox.task.' + TASK.id;
function loadStore() {
  if (!storage) return;
  try { const raw = JSON.parse(storage.getItem(LS_KEY) || 'null'); if (raw && Array.isArray(raw.projects)) STORE = raw; } catch (e) { /* повреждённые данные игнорируем */ }
}
const blockCodes = () => Object.fromEntries(Object.keys(REG.blocks).map(k => [k, REG.blocks[k].code]));
let saveT = null;
function scheduleSave() { S.saved = 'pending'; clearTimeout(saveT); saveT = setTimeout(saveNow, 600); renderSaveStatus(); }
function saveNow() {
  clearTimeout(saveT);
  if (!S.loaded) return;
  if (S.codeState === 'err') { S.saved = 'err'; renderSaveStatus(); return; }
  if (!storage) { S.saved = 'off'; renderSaveStatus(); return; }
  try {
    if (TASK) storage.setItem(taskKey(), JSON.stringify({ code: S.goodText, blocks: blockCodes() }));
    else { const p = project(); if (p) { p.code = S.goodText; p.blocks = blockCodes(); p.updated = Date.now(); } storage.setItem(LS_KEY, JSON.stringify(STORE)); }
    S.saved = 'ok'; S.savedAt = hhmm();
  } catch (e) { S.saved = 'off'; }
  renderSaveStatus();
}
function renderSaveStatus() {
  const st = $('#saveSt'); if (!st) return;
  const text = { ok: 'сохранено' + (S.savedAt ? ' · ' + S.savedAt : ''), pending: 'сохраняю…', err: 'не сохранено: ошибка в коде', off: 'не сохраняется: хранилище браузера недоступно' }[S.saved];
  st.className = 'status' + (S.saved === 'ok' ? '' : ' warn'); st.lastChild.textContent = text;
}
const b64 = { enc: s => btoa(unescape(encodeURIComponent(s))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''), dec: s => decodeURIComponent(escape(atob(s.replace(/-/g, '+').replace(/_/g, '/')))) };
const shareLink = embed => location.origin + location.pathname + (embed ? '?embed=1' : '') + '#c=' + b64.enc(JSON.stringify({ n: project() ? project().name : 'схема', c: S.goodText, b: blockCodes() }));

// ───────── история ─────────
const snap = () => JSON.stringify({ code: S.goodText, blocks: blockCodes(), cols: S.ops.map(o => o.col) });
function restore(s) {
  const o = JSON.parse(s); REG.blocks = {}; Object.values(o.blocks).forEach(c => { const b = blockFromCode(c); REG.blocks[b.name] = b; });
  loadCode(o.code); if (o.cols.length === S.ops.length) S.ops.forEach((x, k) => { x.col = o.cols[k]; }); S.sel = null;
}
function pushHistory(before) { S.history.push(before); if (S.history.length > 200) S.history.shift(); S.future = []; }
/** Изменить схему. fn возвращает false, если менять нечего: тогда в историю ничего не попадает. */
function commit(fn) {
  const before = snap(); const copy = JSON.stringify(S.ops); const n0 = S.n, nc0 = S.nc;
  let res; try { res = fn(); } catch (e) { S.ops = JSON.parse(copy); S.n = n0; S.nc = nc0; toast(e.message); return false; }
  if (res === false) { S.ops = JSON.parse(copy); S.n = n0; S.nc = nc0; return false; }
  pushHistory(before); regenerate(); afterModelChange(); render(); return true;
}
/** Переписать код по схеме. Циклы for при этом разворачиваются. */
function regenerate() {
  if (S.loops.length) { S.loops = []; toast('цикл for развёрнут в отдельные гейты: схема хранит его развёрнутым'); }
  const map = {}; S.codeText = S.goodText = genQiskit(S, REG.blocks, map); S.ops.forEach(o => { o.ln = map[o.id]; });
  S.codeState = 'ok'; S.codeErr = '';
}
function afterModelChange() { S.rev++; if (S.runRes) S.runRes.stale = true; if (S.slice !== null && S.slice > maxCol()) S.slice = null; scheduleSave(); }
function undo() { if (!S.history.length) return; S.future.push(snap()); restore(S.history.pop()); afterModelChange(); render(); }
function redo() { if (!S.future.length) return; S.history.push(snap()); restore(S.future.pop()); afterModelChange(); render(); }

// ───────── код ↔ схема ─────────
function loadCode(text) {
  const r = parseProgram(text, REG.blocks);
  Object.assign(REG.blocks, r.defs);
  S.n = r.n; S.nc = r.nc; S.ops = layout(r.ops.map(o => Object.assign({ id: nid() }, o)));
  S.loops = r.loops.map(L => { const os = S.ops.slice(L.a, L.b); const ws = os.flatMap(o => o.q.concat(o.c)); return { c0: Math.min(...os.map(o => o.col)), c1: Math.max(...os.map(o => o.col + spanOf(o) - 1)), q0: Math.min(...ws), q1: Math.max(...ws), label: L.label }; });
  S.codeText = S.goodText = text; S.codeState = 'ok'; S.codeErr = ''; S.sel = null;
  if (S.slice !== null && S.slice > maxCol()) S.slice = null;
}
const maxCol = () => S.ops.reduce((m, o) => Math.max(m, o.col + spanOf(o) - 1), -1);
const overlaps = (a, b) => { const wa = a.q.concat(a.c), wb = b.q.concat(b.c); return Math.max(Math.min(...wa), Math.min(...wb)) <= Math.min(Math.max(...wa), Math.max(...wb)); };
/** Освободить место под операцию o: при пересечении сдвинуть всё, что правее, на её ширину. */
function placeOp(list, o) {
  const w = spanOf(o);
  const clash = list.some(x => x !== o && x.col < o.col + w && o.col < x.col + spanOf(x) && overlaps(x, o));
  if (clash) list.forEach(x => { if (x !== o && x.col + spanOf(x) - 1 >= o.col) x.col += w; });
}
function compact(list) {
  const used = new Set(); list.forEach(o => { for (let k = 0; k < spanOf(o); k++) used.add(o.col + k); });
  const cols = [...used].sort((a, b) => a - b); const map = {}; cols.forEach((c, i) => { map[c] = i; }); list.forEach(o => { o.col = map[o.col]; });
}
const nearest = (q, n, k, busy = []) => [...Array(n).keys()].filter(x => x !== q && !busy.includes(x)).sort((a, b) => Math.abs(a - q) - Math.abs(b - q) || a - b).slice(0, k);
/** Новая операция по плитке палитры; null — не хватает кубитов. */
function makeOp(tile, col, q, n, nc) {
  const o = { id: nid(), g: tile, col, q: [q], c: [], p: null };
  if (tile === 'CCX' || tile === 'CCZ') { if (n < 3) return null; o.g = tile === 'CCX' ? 'CX' : 'CZ'; o.c = nearest(q, n, 2).sort((a, b) => a - b); return o; }
  const G = GATES[tile];
  if (G.p || (G.base && GATES[G.base].p)) o.p = Math.PI / 2;
  if (tile === 'SWAP') { if (n < 2) return null; o.q = [q, nearest(q, n, 1)[0]].sort((a, b) => a - b); }
  else if (G.k === 2) { if (n < 2) return null; o.c = [q > 0 ? q - 1 : q + 1]; }
  if (tile === 'M') o.cb = Math.min(q, Math.max(nc, 1) - 1);
  return o;
}

// ───────── кэш симуляции ─────────
const simCache = new Map();
function sim(upto) {
  const key = S.rev + '|' + upto;
  if (!simCache.has(key)) { if (simCache.size > 24) simCache.clear(); let r; try { r = { st: simulate(S, upto) }; } catch (e) { r = { err: e.message }; } simCache.set(key, r); }
  return simCache.get(key);
}

// ───────── отрисовка схемы ─────────
const GEO = { X0: 76, CW: 64, RH: 52, TOP: 52, GS: 40 };
function circuitSVG(model, opts) {
  const { X0, CW, RH, TOP, GS } = GEO; const n = model.n; const nc = opts.cbits ? (model.nc || 0) : 0;
  const cols = Math.max(opts.minCols ?? 8, model.ops.reduce((m, o) => Math.max(m, o.col + spanOf(o)), 0) + 2);
  const W = X0 + cols * CW + 56, cbY = TOP + (n - 1) * RH + RH * 0.9, H = (nc ? cbY + 28 : TOP + (n - 1) * RH + GS / 2 + 18);
  const cx = c => X0 + c * CW + CW / 2, cy = q => TOP + q * RH;
  let s = `<svg class="circ" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" data-cols="${cols}" role="img" aria-label="${esc(opts.aria || 'квантовая схема')}">`;
  if (opts.slice != null) s += `<rect class="slice" x="${cx(opts.slice) - CW / 2 + 3}" y="${TOP - 44}" width="${CW - 6}" height="${H - TOP + 36}" rx="10"/>`;
  if (opts.colLabels !== false) for (let c = 0; c < cols; c++) s += `<rect class="colhit" data-col="${c}" x="${cx(c) - CW / 2}" y="${TOP - 46}" width="${CW}" height="22"/><text class="col-l${opts.slice === c ? ' on' : ''}" data-col="${c}" x="${cx(c)}" y="${TOP - 30}" text-anchor="middle">t${c + 1}</text>`;
  (opts.loops || []).forEach(L => { const x1 = cx(L.c0) - CW / 2 + 4, x2 = cx(L.c1) + CW / 2 - 4, y1 = cy(L.q0) - GS / 2 - 7, y2 = cy(L.q1) + GS / 2 + 7; s += `<rect class="loop" x="${x1}" y="${y1}" width="${x2 - x1}" height="${y2 - y1}" rx="12"/><g transform="translate(${x1 + 8},${y2 - 10})"><rect width="${L.label.length * 6.6 + 16}" height="20" rx="10" fill="var(--bg-panel)" stroke="var(--line-strong)"/><text x="8" y="14" font-size="11" fill="var(--text-secondary)">${esc(L.label)}</text></g>`; });
  for (let q = 0; q < n; q++) { s += `<line class="wire" x1="${X0 - 8}" y1="${cy(q)}" x2="${W - 48}" y2="${cy(q)}"/><text class="qn" x="10" y="${cy(q) + 5}">${esc(opts.names ? opts.names[q] : 'q' + q)}</text>`; if (!opts.names) s += `<text class="ket" x="36" y="${cy(q) + 5}">|0⟩</text>`; }
  if (nc) s += `<line class="cwire" x1="${X0 - 8}" y1="${cbY - 2}" x2="${W - 48}" y2="${cbY - 2}"/><line class="cwire" x1="${X0 - 8}" y1="${cbY + 2}" x2="${W - 48}" y2="${cbY + 2}"/><text class="qn" x="10" y="${cbY + 5}">c</text><text class="ket" x="26" y="${cbY + 5}" font-size="11">${nc} ${plural(nc, 'бит', 'бита', 'бит')}</text>`;
  if (opts.disks) opts.disks.forEach((d, q) => { const x = W - 40, y = cy(q) - 13; const h = 26 * Math.min(1, Math.max(0, d.p1)); s += `<g><title>q${q}: P(1) = ${d.p1.toFixed(2)}, длина вектора Блоха ${d.r.toFixed(2)}</title><clipPath id="dk${q}"><rect x="${x}" y="${y + 26 - h}" width="26" height="${h}"/></clipPath><circle cx="${x + 13}" cy="${y + 13}" r="13" fill="var(--bg-panel)" stroke="var(--line-strong)"/><circle cx="${x + 13}" cy="${y + 13}" r="13" fill="var(--data-3)" fill-opacity=".6" clip-path="url(#dk${q})"/>${Math.hypot(d.x, d.y) > 0.2 ? `<line x1="${x + 13}" y1="${y + 13}" x2="${x + 13 + 11 * Math.cos(d.ph)}" y2="${y + 13 - 11 * Math.sin(d.ph)}" stroke="var(--accent-indicator)" stroke-width="1.8" stroke-linecap="round"/>` : d.r < 0.2 ? `<circle cx="${x + 13}" cy="${y + 13}" r="4" fill="none" stroke="var(--text-muted)" stroke-dasharray="2 2"/>` : ''}</g>`; });
  const bad = new Set(opts.bad || []);
  // связи с классическим проводом — под гейтами
  if (nc) model.ops.forEach(o => {
    const x = cx(o.col);
    if (o.g === 'M') s += `<path class="cwire" d="M${x - 2} ${cy(o.q[0])}V${cbY}M${x + 2} ${cy(o.q[0])}V${cbY}"/><text class="cbit" x="${x + 6}" y="${cy(o.q[0]) + GS / 2 + 10}">c${o.cb}</text>`;
    if (o.cond) { const yb = cy(Math.max(...o.q.concat(o.c))); s += `<path class="cwire" d="M${x - 2} ${yb}V${cbY}M${x + 2} ${yb}V${cbY}"/><circle cx="${x}" cy="${cbY}" r="4" fill="var(--data-3)"/><text class="cbit" x="${x + 6}" y="${yb + GS / 2 + 10}">c${o.cond.bit}=${o.cond.val}</text>`; }
    if (o.g === 'DYN') { const xm = x + CW / 2; s += `<path class="cwire" d="M${xm - 2} ${cy(Math.max(...o.q)) + GS / 2}V${cbY}M${xm + 2} ${cy(Math.max(...o.q)) + GS / 2}V${cbY}"/><circle cx="${xm}" cy="${cbY}" r="4" fill="var(--data-3)"/>`; }
  });
  model.ops.forEach(o => {
    const x = cx(o.col); const sel = opts.sel === o.id ? ' sel' : ''; const b = bad.has(o.id) ? ' bad' : ''; const ln = o.ln !== undefined ? ` data-ln="${o.ln}"` : '';
    const kd = kind(o); const title = `<title>${esc(opTitle(o))}</title>`;
    if (o.g === 'BLOCK' || o.g === 'DYN') {
      const lo = Math.min(...o.q), hi = Math.max(...o.q); const x1 = x - CW / 2 + 6, w = spanOf(o) * CW - 12, y1 = cy(lo) - GS / 2, h = cy(hi) - cy(lo) + GS;
      const B = REG.blocks[o.name]; const sub = o.g === 'DYN' ? o.label : (B && B.params.length ? B.params.map(p => fmtA(o.args[p.name] ?? 0, 'pi')).join(', ') : '');
      s += `<g class="gate ${o.g === 'DYN' ? 'dynb' : 'blk'}${sel}${b}" data-id="${o.id}"${ln}>${title}<rect x="${x1}" y="${y1}" width="${w}" height="${h}" rx="10"/>`;
      if (B && o.g === 'BLOCK') o.q.forEach((q, k) => { s += `<text class="sub" x="${x1 + 6}" y="${cy(q) + 3}">${esc(B.wires[k] || '')}</text>`; });
      s += `<text class="lbl" x="${x1 + w / 2}" y="${y1 + h / 2 - (sub ? 2 : -5)}" text-anchor="middle">${esc(o.g === 'DYN' ? 'while' : o.name)}</text>${sub ? `<text class="sub" x="${x1 + w / 2}" y="${y1 + h / 2 + 13}" text-anchor="middle">${esc(sub)}</text>` : ''}</g>`;
      return;
    }
    const ws = o.q.concat(o.c); const lo = Math.min(...ws), hi = Math.max(...ws); const lc = sel ? 'var(--accent-indicator)' : b ? 'var(--accent-text)' : 'var(--data-1)';
    s += `<g class="gate${sel}${b}" data-id="${o.id}"${ln}>${title}`;
    if (o.c.length || o.g === 'SWAP') {
      s += `<rect class="hit" x="${x - GS / 2}" y="${cy(lo) - GS / 2}" width="${GS}" height="${cy(hi) - cy(lo) + GS}"/>`;
      if (sel || b) s += `<rect class="halo" x="${x - GS / 2 - 4}" y="${cy(lo) - GS / 2}" width="${GS + 8}" height="${cy(hi) - cy(lo) + GS}" rx="12"/>`;
      s += `<line x1="${x}" y1="${cy(lo)}" x2="${x}" y2="${cy(hi)}" stroke="${lc}" stroke-width="1.5"/>`;
      o.c.forEach(c => { s += `<circle cx="${x}" cy="${cy(c)}" r="6" fill="${lc}"/>`; });
    }
    const t = o.q[0];
    if (o.g === 'CX') s += `<circle cx="${x}" cy="${cy(t)}" r="14" fill="var(--bg-panel)" stroke="${lc}" stroke-width="1.5"/><path d="M${x} ${cy(t) - 14}v28M${x - 14} ${cy(t)}h28" stroke="${lc}" stroke-width="1.5"/>`;
    else if (o.g === 'CZ') s += `<circle cx="${x}" cy="${cy(t)}" r="6" fill="${lc}"/>`;
    else if (o.g === 'SWAP') o.q.forEach(q => { s += `<path d="M${x - 7} ${cy(q) - 7}l14 14M${x + 7} ${cy(q) - 7}l-14 14" stroke="${lc}" stroke-width="1.8" stroke-linecap="round"/>`; });
    else if (o.g === 'M') s += `<rect x="${x - GS / 2}" y="${cy(t) - GS / 2}" width="${GS}" height="${GS}" rx="9"/><path d="M${x - 10} ${cy(t) + 6}a10 10 0 0120 0M${x} ${cy(t) + 6}l6-9" fill="none" stroke="var(--text-primary)" stroke-width="1.6" stroke-linecap="round"/>`;
    else if (o.g === 'BAR') s += `<rect class="hit" x="${x - GS / 2}" y="${cy(lo) - GS / 2}" width="${GS}" height="${cy(hi) - cy(lo) + GS}"/><line class="barline" x1="${x}" y1="${cy(lo) - GS / 2}" x2="${x}" y2="${cy(hi) + GS / 2}"/>` + o.q.map(q => `<rect x="${x - 5}" y="${cy(q) - GS / 2 + 4}" width="10" height="${GS - 8}" rx="3" style="fill:var(--data-4)"/>`).join('');
    else { const L = { CY: 'Y', CP: 'P', CH: 'H' }[o.g] || lab(o.g); const sub = o.p !== null && o.p !== undefined ? fmtA(o.p, 'pi') : ''; s += `<rect x="${x - GS / 2}" y="${cy(t) - GS / 2}" width="${GS}" height="${GS}" rx="9"/><text class="lbl" x="${x}" y="${cy(t) + (sub ? 1 : 5)}" text-anchor="middle">${esc(L)}</text>${sub ? `<text class="sub" x="${x}" y="${cy(t) + 13}" text-anchor="middle">${esc(sub.length > 7 ? sub.slice(0, 6) + '…' : sub)}</text>` : ''}`; }
    s += '</g>';
    void kd;
  });
  return s + '</svg>';
}
function opTitle(o) {
  if (o.g === 'BLOCK') return 'блок ' + o.name + ' на q' + o.q.join(', q');
  if (o.g === 'DYN') return 'цикл: ' + o.label + ' · тело меняется в коде';
  const kd = kind(o); let t = (kd === 'M' ? 'измерение' : kd === 'R' ? 'сброс' : kd === 'BAR' ? 'барьер' : lab(kd));
  if (o.c.length) t += ' · управляющие q' + o.c.join(', q') + ' · цель q' + o.q[0]; else t += ' · q' + o.q.join(', q');
  if (o.p !== null && o.p !== undefined) t += ' · угол ' + fmtA(o.p, 'pi');
  if (o.g === 'M') t += ' → c' + o.cb; if (o.cond) t += ' · если c' + o.cond.bit + ' = ' + o.cond.val;
  return t;
}

// ───────── сборка экрана ─────────
function render() { renderPalette(); renderCenter(); renderResults(); renderStatus(); renderBars(); paintIcons(); }
function renderBars() {
  $('#projName').textContent = TASK ? 'черновик решения' : (project() ? project().name : '');
  renderSaveStatus();
  document.querySelectorAll('#modeSeg button').forEach(b => b.classList.toggle('on', b.dataset.v === S.mode));
  $('#runLbl').textContent = `${{ browser: 'браузер', server: 'сервер' }[S.run.backend]} · ×${S.run.shots} · ${NOISE_NAME[S.run.noise]}`;
  document.querySelectorAll('#rail button').forEach(b => { const r = b.dataset.r; b.classList.toggle('on', r === 'gates' ? (S.leftOpen && !S.drawer && !S.editing) : (S.drawer === r || (r === 'blocks' && !!S.editing && !S.drawer))); b.hidden = !!TASK && ['projects', 'examples'].includes(r); });
  $('#palette').hidden = !S.leftOpen; $('#palOpen').hidden = S.leftOpen;
  $('#results').hidden = !S.rightOpen; $('#resOpen').hidden = S.rightOpen;
  $('#undoBtn').disabled = !S.history.length; $('#redoBtn').disabled = !S.future.length;
  $('#shareBtn').hidden = !!TASK; $('#submitBtn').hidden = !TASK; $('#projBtn').hidden = !!TASK;
  renderTaskLine();
}
function renderTaskLine() {
  const el = $('#taskLine'); el.hidden = !TASK; if (!TASK) return;
  const chips = checkContract(S, TASK).map(c => `<span class="lim${c.ok ? '' : ' over'}" title="${c.ok ? 'в пределах задачи' : 'ограничение задачи нарушено'}">${esc(c.label)} <b>${c.value}</b>${c.key === 'basis' ? '' : (c.exact ? ' из ' : ' / ') + c.limit}</span>`).join('');
  el.innerHTML = `<span class="rule"></span>${TASK.url ? `<a class="btn ghost sm" href="${esc(TASK.url)}" target="_top">${svgI('back')}к условию</a>` : ''}<b class="tname" title="${esc(TASK.title)}">${esc(TASK.code ? TASK.code + ' · ' : '')}${esc(TASK.title)}</b>${chips}`;
}
function renderPalette() {
  const allow = allowNow();
  let h = `<button class="setsel" id="setBtn" ${TASK && TASK.allow ? 'disabled title="набор задаёт задача"' : ''}><span><small>набор гейтов</small>${esc(setName())}</span><span data-i="chev-d" class="chevw"></span></button>`;
  PAL.forEach(([g, list]) => {
    h += `<div class="grp"><h3>${g}</h3><div class="tiles">` + list.map(x => {
      const off = allow && !allow.includes(x);
      return `<div class="tile${off ? ' off' : ''}${S.armed && S.armed.g === x ? ' armed' : ''}" data-g="${x}" title="${esc(off ? 'не входит в набор «' + setName() + '»' : (TILE_TITLE[x] || lab(x)))}" tabindex="0" role="button" aria-disabled="${off ? 'true' : 'false'}" aria-pressed="${S.armed && S.armed.g === x ? 'true' : 'false'}">${tileLabel(x)}</div>`;
    }).join('') + '</div></div>';
  });
  const bl = Object.keys(REG.blocks);
  h += `<div class="grp"><h3>мои блоки</h3><div class="tiles">` + (bl.length ? bl.map(b => `<div class="tile wide${S.armed && S.armed.b === b ? ' armed' : ''}" data-b="${esc(b)}" tabindex="0" role="button" title="перетащите на схему">${esc(b)}<small>${esc(REG.blocks[b].params.map(p => p.name).join(', ') || 'без параметров')}</small></div>`).join('') : '') + `</div>${bl.length ? '' : '<p class="hint">блоков пока нет: создайте в панели «блоки» или объявите def в коде</p>'}</div>`;
  h += `<p class="hint">перетащите гейт на провод или нажмите на плитку, а потом на клетку схемы. Esc снимает выбор</p>`;
  $('#palBody').innerHTML = h;
}
function codeEditorHTML(id, text, selLine, readonly, errLine) {
  const lines = text.split('\n');
  const hl = lines.map((l, i) => `<div class="${i === selLine ? 'ln-sel' : ''}${i === errLine ? ' ln-err' : ''}">${hiPy(l) || ' '}</div>`).join('');
  return `<div class="editor"><div class="gutter">${lines.map((_, i) => `<div class="${i === selLine ? 'cur' : ''}">${i + 1}</div>`).join('')}</div><div class="ed"><pre id="${id}Pre" aria-hidden="true">${hl}</pre>${readonly ? '' : `<textarea id="${id}" spellcheck="false" autocapitalize="off" autocomplete="off" autocorrect="off" aria-label="код">${esc(text)}</textarea>`}</div></div>`;
}
const KW = ['from', 'import', 'def', 'for', 'in', 'while', 'with', 'if', 'else', 'return', 'as', 'not', 'and', 'or', 'True', 'False', 'None', 'pass', 'OPENQASM', 'include', 'qubit', 'bit', 'gate', 'measure', 'reset', 'qreg', 'creg', 'ctrl'];
function hiPy(l) {
  const ci = l.search(/#|\/\//); const code = ci >= 0 ? l.slice(0, ci) : l; const com = ci >= 0 ? l.slice(ci) : '';
  const out = esc(code).replace(/(&quot;.*?&quot;|'[^']*')|\b(\d+(?:\.\d+)?)\b|\b([A-Za-z_]\w*)(\s*\()?/g, (m, str, num, id, par) => str ? `<span class="tk-s">${str}</span>` : num ? `<span class="tk-n">${num}</span>` : KW.includes(id) ? `<span class="tk-k">${id}</span>${par || ''}` : par ? `<span class="tk-f">${id}</span>${par}` : id);
  return out + (com ? `<span class="tk-c">${esc(com)}</span>` : '');
}
const selLine = () => { if (S.sel == null || S.codeState === 'err') return -1; const o = S.ops.find(x => x.id === S.sel); return o && o.ln !== undefined ? o.ln : -1; };
const errLine = () => { const m = S.codeState === 'err' && S.codeErr.match(/стр\. (\d+)/); return m ? +m[1] - 1 : -1; };
const syncChip = () => S.codeState === 'err' ? `<span class="pill err" title="${esc(S.codeErr)}">${svgI('warn')}ошибка в коде</span>` : `<span class="pill ok">${svgI('sync')}синхронизировано</span>`;
const codeHint = () => S.codeState === 'err' ? S.codeErr + ' · схема показывает последний верный код' : 'правки применяются к схеме через 0,4 с · for, if, def, измерения, if_test и while_loop поддерживаются';
const langCode = () => S.lang === 'qiskit' ? S.codeText : S.lang === 'qasm' ? genQasm(S) : S.lang === 'penny' ? genPenny(S) : genCirq(S);
function canvasOpts() { return { slice: S.slice, sel: S.sel, loops: S.loops, cbits: true, disks: disks(), bad: violations(S, allowNow()) }; }
function renderCenter() {
  const c = $('#center'); const keep = { cb: scrollOf('#cbody'), code: scrollOf('#codeBody'), bb: scrollOf('#bbody') };
  if (S.editing) { renderBlockEditor(c); setScroll('#bbody', keep.bb); return; }
  const showC = S.mode !== 'code', showK = S.mode !== 'circ';
  const lockN = TASK && TASK.qubits;
  c.innerHTML = `${showC ? `<section class="panel canvas" id="canvasP" style="${showK ? `flex:${S.split} 1 0px` : 'flex:1'}" aria-label="схема">
    <div class="ph"><h2>схема</h2>
      <span class="stepper" title="${lockN ? 'число кубитов задаёт задача' : 'от 1 до ' + MAXQ}">кубиты<button class="ibtn sm" id="qMinus" aria-label="убрать кубит" ${lockN ? 'disabled' : ''}>${svgI('minus')}</button><b>${S.n}</b><button class="ibtn sm" id="qPlus" aria-label="добавить кубит" ${lockN ? 'disabled' : ''}>${svgI('plus')}</button></span>
      <span class="stepper" title="классические биты для измерений">биты<button class="ibtn sm" id="cMinus" aria-label="убрать бит">${svgI('minus')}</button><b>${S.nc}</b><button class="ibtn sm" id="cPlus" aria-label="добавить бит">${svgI('plus')}</button></span>
      <div class="grow"></div>
      ${S.slice != null ? `<button class="btn sm outline" id="sliceOff">срез t${S.slice + 1}${svgI('x')}</button>` : ''}
      <button class="btn sm ghost" id="clearBtn" ${S.ops.length ? '' : 'disabled'}>${svgI('trash')}очистить</button>
    </div>
    <div class="cbody" id="cbody" data-n="${S.n}">${circuitSVG(S, canvasOpts())}</div>
    <div class="cfoot"><span class="hint">клик по t1, t2… — состояние в этой точке · ← → — соседний срез · Delete — удалить выбранный гейт</span></div>
  </section>` : ''}
  ${showC && showK ? `<div class="splitter" id="splitter" title="потяните, чтобы поменять высоту" role="separator" aria-orientation="horizontal"><i></i></div>` : ''}
  ${showK ? `<section class="panel code" id="codeP" style="${showC ? `flex:${1 - S.split} 1 0px` : 'flex:1'}" aria-label="код">
    <div class="ph"><div class="seg sm" id="langSeg">${[['qiskit', 'Qiskit'], ['qasm', 'OpenQASM 3'], ['penny', 'PennyLane'], ['cirq', 'Cirq']].map(([k, v]) => `<button data-v="${k}" class="${S.lang === k ? 'on' : ''}">${v}</button>`).join('')}</div>
      <div class="grow"></div><span id="syncChip">${S.lang === 'qiskit' ? syncChip() : '<span class="pill">только чтение · правьте в Qiskit</span>'}</span>
      <button class="ibtn sm" id="copyCode" title="копировать" aria-label="копировать код">${svgI('copy')}</button></div>
    <div class="cbody" id="codeBody">${codeEditorHTML('codeTa', langCode(), S.lang === 'qiskit' ? selLine() : -1, S.lang !== 'qiskit', S.lang === 'qiskit' ? errLine() : -1)}</div>
    <div class="cfoot"><span class="hint${S.codeState === 'err' ? ' errtext' : ''}" id="codeHint">${esc(S.lang === 'qiskit' ? codeHint() : 'этот вид строится по схеме; из него в схему пока переводится только Qiskit')}</span></div>
  </section>` : ''}`;
  setScroll('#cbody', keep.cb); setScroll('#codeBody', keep.code);
  if (showC) { const sel = S.ops.find(o => o.id === S.sel); if (sel) showCtx(sel, $('#cbody'), S); }
  bindEditor($('#codeTa'), onCodeInput);
  markCodeLine();
}
const scrollOf = sel => { const e = $(sel); return e ? [e.scrollLeft, e.scrollTop] : null; };
const setScroll = (sel, v) => { const e = $(sel); if (e && v) { e.scrollLeft = v[0]; e.scrollTop = v[1]; } };
function fitTA(ta) { const pre = ta.previousElementSibling; ta.style.height = pre.scrollHeight + 'px'; ta.style.width = Math.max(pre.scrollWidth, ta.parentElement.clientWidth) + 'px'; }
function bindEditor(ta, onInput) {
  if (!ta) return; fitTA(ta);
  ta.addEventListener('input', onInput);
  ta.addEventListener('keydown', e => {
    if (e.key === 'Tab' && !e.shiftKey && !e.metaKey && !e.ctrlKey && !e.altKey) { e.preventDefault(); ta.setRangeText('    ', ta.selectionStart, ta.selectionEnd, 'end'); onInput(); }
    if (e.key === 'Enter' && !e.metaKey && !e.ctrlKey) { e.preventDefault(); const before = ta.value.slice(0, ta.selectionStart); const line = before.slice(before.lastIndexOf('\n') + 1); const ind = line.match(/^ */)[0] + (/:\s*$/.test(line) ? '    ' : ''); ta.setRangeText('\n' + ind, ta.selectionStart, ta.selectionEnd, 'end'); onInput(); }
    if (e.key === 'Backspace' && ta.selectionStart === ta.selectionEnd) { const before = ta.value.slice(0, ta.selectionStart); const line = before.slice(before.lastIndexOf('\n') + 1); if (line.length && /^ +$/.test(line) && line.length % 4 === 0) { e.preventDefault(); ta.setRangeText('', ta.selectionStart - 4, ta.selectionStart, 'end'); onInput(); } }
  });
  if (ta.id === 'codeTa') ['click', 'keyup'].forEach(ev => ta.addEventListener(ev, () => { const ln = ta.value.slice(0, ta.selectionStart).split('\n').length - 1; if (ln !== S.curLine) { S.curLine = ln; markCodeLine(); } }));
}
/** Подсветить на схеме гейты, которые создаёт строка под курсором в коде. */
function markCodeLine() { document.querySelectorAll('#cbody .gate').forEach(g => g.classList.toggle('hl', S.codeState !== 'err' && document.activeElement && document.activeElement.id === 'codeTa' && +g.dataset.ln === S.curLine)); }
let codeTimer = null;
function paintEditor(ta, sel, err) { const pre = ta.previousElementSibling; const lines = ta.value.split('\n'); pre.innerHTML = lines.map((l, i) => `<div class="${i === sel ? 'ln-sel' : ''}${i === err ? ' ln-err' : ''}">${hiPy(l) || ' '}</div>`).join(''); ta.closest('.editor').querySelector('.gutter').innerHTML = lines.map((_, i) => `<div>${i + 1}</div>`).join(''); fitTA(ta); }
function onCodeInput() {
  const ta = $('#codeTa'); S.codeText = ta.value; paintEditor(ta, -1, -1);
  clearTimeout(codeTimer); codeTimer = setTimeout(applyCode, 400);
}
function applyCode() {
  const ta = $('#codeTa'); const before = snap(); const prevGood = S.goodText; const text = S.codeText;
  try { loadCode(text); if (text !== prevGood) { pushHistory(before); afterModelChange(); } }
  catch (e) { S.codeText = text; S.codeState = 'err'; S.codeErr = e.message; S.saved = 'err'; }
  // перерисовать всё, кроме поля ввода: курсор и выделение остаются на месте
  const cb = $('#cbody'); if (cb) { const sc = scrollOf('#cbody'); cb.dataset.n = S.n; cb.innerHTML = circuitSVG(S, canvasOpts()); setScroll('#cbody', sc); const st = cb.parentElement.querySelectorAll('.stepper b'); if (st[0]) st[0].textContent = S.n; if (st[1]) st[1].textContent = S.nc; }
  const chip = $('#syncChip'); if (chip) chip.innerHTML = syncChip();
  const h = $('#codeHint'); if (h) { h.textContent = codeHint(); h.classList.toggle('errtext', S.codeState === 'err'); }
  if (ta) paintEditor(ta, -1, errLine());
  renderResults(); renderStatus(); renderPalette(); renderBars(); paintIcons(); markCodeLine();
}
function disks() { const r = sim(S.slice); if (r.err) return null; return [...Array(S.n).keys()].map(q => { const b = blochOf(r.st, q); return { p1: (1 - b.z) / 2, r: Math.hypot(b.x, b.y, b.z), x: b.x, y: b.y, ph: Math.atan2(b.y, b.x) }; }); }

// ───────── панель выбранного гейта ─────────
const CTRL_UP = { X: 'CX', Z: 'CZ', Y: 'CY', P: 'CP', H: 'CH' }, CTRL_DOWN = { CX: 'X', CZ: 'Z', CY: 'Y', CP: 'P', CH: 'H' };
function showCtx(o, host, model, opts) {
  opts = opts || {}; const { X0, CW, RH, TOP, GS } = GEO; const x = X0 + o.col * CW + (spanOf(o) * CW) / 2;
  const isBlk = o.g === 'BLOCK', isDyn = o.g === 'DYN'; const nm = q => opts.names ? opts.names[q] : 'q' + q;
  const div = document.createElement('div'); div.className = 'ctx'; div.id = 'ctx'; div.setAttribute('role', 'toolbar'); div.setAttribute('aria-label', 'выбранный гейт');
  const qsel = (role, cur) => `<select data-role="${role}" aria-label="кубит">${[...Array(model.n).keys()].map(q => `<option value="${q}" ${q === cur ? 'selected' : ''}>${esc(nm(q))}</option>`).join('')}</select>`;
  let h = `<b>${esc(isBlk ? o.name : isDyn ? 'while' : lab(kind(o)))} · t${o.col + 1}</b><span class="sep"></span>`;
  if (isBlk || isDyn) h += `<span class="muted">кубиты</span> ${o.q.map(nm).join(', ')}`;
  else if (o.c.length) h += `<span class="muted">упр.</span>${o.c.map((q, k) => qsel('c' + k, q)).join('')}<span class="muted">цель</span>${qsel('q0', o.q[0])}`;
  else h += `<span class="muted">кубит${o.q.length > 1 ? 'ы' : ''}</span>${o.q.map((q, k) => qsel('q' + k, q)).join('')}`;
  if (o.p !== null && o.p !== undefined && !isBlk) h += `<span class="sep"></span><label class="muted" for="angIn">угол</label><input id="angIn" value="${esc(fmtA(o.p, 'pi'))}" title="число или выражение: pi/4, 2*acos(1/sqrt(3))${opts.block ? ', имя параметра блока' : ''}">`;
  if (isBlk) { const B = REG.blocks[o.name]; if (B) B.params.forEach(p => { h += `<span class="sep"></span><label class="muted">${esc(p.name)}</label><input data-arg="${esc(p.name)}" value="${esc(fmtA(o.args[p.name] ?? 0, 'pi'))}">`; }); }
  if (!opts.block && model.nc > 0 && !isDyn) {
    const bits = [...Array(model.nc).keys()];
    if (o.g === 'M') h += `<span class="sep"></span><span class="muted">в бит</span><select id="cbSel" aria-label="классический бит">${bits.map(b => `<option value="${b}" ${b === o.cb ? 'selected' : ''}>c${b}</option>`).join('')}</select>`;
    else if (!isBlk && o.g !== 'BAR') h += `<span class="sep"></span><span class="muted">если</span><select id="condSel" aria-label="условие по измерению"><option value="">всегда</option>${bits.flatMap(b => [1, 0].map(v => `<option value="${b}:${v}" ${o.cond && o.cond.bit === b && o.cond.val === v ? 'selected' : ''}>c${b} = ${v}</option>`)).join('')}</select>`;
  }
  h += '<span class="sep"></span>';
  if (!isBlk && !isDyn && (CTRL_UP[o.g] || ['CX', 'CZ', 'CP'].includes(o.g))) h += `<button class="ibtn sm" id="ctxCtrl" title="добавить управляющий кубит" aria-label="добавить управляющий кубит">${svgI('ctrl-add')}</button>`;
  if (!isBlk && !isDyn && o.c.length) h += `<button class="ibtn sm" id="ctxUnctrl" title="убрать управляющий кубит" aria-label="убрать управляющий кубит">${svgI('ctrl-del')}</button>`;
  if (!isBlk && !isDyn && !opts.block && decompose(o, allowNow())) h += `<button class="ibtn sm" id="ctxDec" title="разложить на гейты набора «${esc(setName())}»" aria-label="разложить">${svgI('split')}</button>`;
  if (isBlk) h += `<button class="ibtn sm" id="ctxOpen" title="открыть блок" aria-label="открыть блок">${svgI('code')}</button><button class="ibtn sm" id="ctxInline" title="развернуть блок в гейты" aria-label="развернуть блок">${svgI('split')}</button>`;
  h += `<button class="ibtn sm" id="ctxDup" title="копировать" aria-label="копировать">${svgI('copy')}</button><button class="ibtn sm danger" id="ctxDel" title="удалить · Delete" aria-label="удалить">${svgI('trash')}</button>`;
  div.innerHTML = h; host.appendChild(div);
  const ws = o.q.concat(o.c); const svg = host.querySelector('svg.circ'); const maxLeft = Math.max(4, (svg ? svg.width.baseVal.value : host.scrollWidth) - div.offsetWidth - 4);
  const above = TOP + Math.min(...ws) * RH - GS / 2 - div.offsetHeight - 8;
  div.style.left = Math.min(maxLeft, Math.max(4, x - div.offsetWidth / 2)) + 'px';
  div.style.top = (above >= 26 ? above : TOP + Math.max(...ws) * RH + GS / 2 + 8) + 'px';
}

// ───────── редактор блока ─────────
function renderBlockEditor(c) {
  const B = S.editing; let parsed = null, err = '';
  try { parsed = blockFromCode(B.code); } catch (e) { err = e.message; }
  const blk = parsed || B.last; if (parsed) B.last = parsed;
  const args = B.args || (B.args = {}); if (blk) blk.params.forEach(p => { if (args[p.name] === undefined) { try { args[p.name] = evalExpr(p.def, {}); } catch (e) { args[p.name] = 0; } } });
  let ops = [];
  if (blk && !err) { try { expandBlock(blk, args, withDraft(blk)); ops = layout(expandBlock(blk, args, withDraft(blk), { sym: true }).map(o => Object.assign({ id: nid() }, o))); } catch (e) { err = e.message; } }
  if (!err) B.ops = ops;
  if (S.bselIdx != null) { S.bsel = !err && ops[S.bselIdx] ? ops[S.bselIdx].id : null; S.bselIdx = null; }
  const model = { n: blk ? blk.wires.length : 1, nc: 0, ops: err ? [] : ops };
  c.innerHTML = `<section class="panel" style="flex:1" aria-label="редактор блока">
   <div class="blk-head"><button class="btn sm ghost" id="blkBack" title="сохранить и вернуться к схеме">${svgI('chev-l')}к схеме</button>
     <span class="muted">блоки /</span><b class="mono">${esc(blk ? blk.name : B.name)}(${blk ? esc(blk.params.map(p => p.name).join(', ')) : ''})</b>${blockDirty() ? '<span class="pill warn">не сохранён</span>' : ''}
     <div class="grow"></div><div class="seg sm" id="blkTab"><button data-v="code" class="${S.blockTab === 'code' ? 'on' : ''}">код</button><button data-v="circ" class="${S.blockTab === 'circ' ? 'on' : ''}">схема</button></div></div>
   <div class="blk-head"><span class="muted small">кубиты</span>${blk ? blk.wires.map(w => `<span class="chip">${esc(w)}</span>`).join('') : ''}
     <span class="muted small" style="margin-left:12px">параметры</span>${blk && blk.params.length ? blk.params.map(p => `<span class="chip">${esc(p.name)} = ${esc(p.def)}</span>`).join('') : '<span class="muted small">нет</span>'}
     ${S.blockTab === 'circ' ? `<button class="btn sm ghost" id="addParam">${svgI('plus')}параметр</button><span class="stepper" style="margin-left:auto">кубиты<button class="ibtn sm" id="bqMinus" aria-label="убрать провод">${svgI('minus')}</button><b>${blk ? blk.wires.length : 0}</b><button class="ibtn sm" id="bqPlus" aria-label="добавить провод">${svgI('plus')}</button></span>` : ''}</div>
   ${S.blockTab === 'code' ? `<div class="cbody" style="flex:1 1 50%">${codeEditorHTML('blkTa', B.code, -1, false, -1)}</div>` : ''}
   <div class="ph" style="border-top:1px solid var(--line-subtle)"><h2>${S.blockTab === 'code' ? 'предпросмотр' : 'схема блока'}</h2>${blk && blk.params.length ? '<span class="muted small">при значениях</span>' : ''}
     ${blk ? blk.params.map(p => `<label class="chip" style="gap:6px">${esc(p.name)} <input data-barg="${esc(p.name)}" value="${esc(fmtA(args[p.name], 'pi'))}" class="chipin"></label>`).join('') : ''}
     <div class="grow"></div>${err ? `<span class="pill err" title="${esc(err)}">${svgI('warn')}ошибка</span>` : `<span class="pill ok">${svgI('check')}компилируется</span>`}</div>
   <div class="cbody" id="bbody" data-n="${model.n}" style="flex:1 1 40%">${err ? `<div class="note warn" style="margin:12px">${svgI('warn')}<span>${esc(err)}</span></div>` : circuitSVG(model, { names: blk ? blk.wires : null, sel: S.bsel, colLabels: false, minCols: 6, aria: 'схема блока' })}</div>
   <div class="cfoot"><span class="hint">${S.blockTab === 'circ' ? 'перетащите гейт из палитры на провод · в поле «угол» можно вписать имя параметра · правка на схеме разворачивает for, if и вложенные блоки' : 'функция def с параметрами: for, if и вложенные блоки работают · предпросмотр обновляется через 0,5 с'}</span></div>
  </section>`;
  const ta = $('#blkTa');
  bindEditor(ta, () => { B.code = ta.value; paintEditor(ta, -1, -1); clearTimeout(codeTimer); codeTimer = setTimeout(() => { const pos = [ta.selectionStart, ta.selectionEnd]; renderCenter(); const t2 = $('#blkTa'); if (t2) { t2.focus(); t2.setSelectionRange(pos[0], pos[1]); } renderResults(); paintIcons(); }, 500); });
  const so = !err && B.ops.find(o => o.id === S.bsel); if (so && S.blockTab === 'circ') showCtx(so, $('#bbody'), model, { block: true, names: blk.wires });
}
/** Библиотека блоков, в которой редактируемый блок заменён черновиком (чтобы ловить рекурсию). */
const withDraft = blk => Object.assign({}, REG.blocks, { [blk.name]: blk });
const blockDirty = () => { const B = S.editing; const saved = REG.blocks[B.name]; return !saved || saved.code !== B.code; };
function blockOpsToCode(B, ops) {
  // тело блока пересобирается, id гейтов меняются: выбор запоминаем по порядку
  const cur = ops.find(o => o.id === S.bsel); S.bselIdx = cur ? sorted(ops).indexOf(cur) : null;
  const head = B.code.split('\n')[0]; const complex = /\n\s+(for|if|with)\s|\n\s+[A-Za-z_]\w*\(qc\b/.test(B.code);
  B.code = [head, ...blockBodyCode(B.last.wires, ops)].join('\n');
  if (complex) toast('for, if и вложенные блоки в теле развёрнуты: правка на схеме хранит только гейты');
}
function setBlockHead(B, wires, params) { B.code = B.code.replace(/^def\s+(\w+)\s*\((.*)\)\s*:/, (m, n) => `def ${n}(qc, ${wires.concat(params.map(p => p.name + '=' + p.def)).join(', ')}):`); }
/** Сохранить редактируемый блок в библиотеку. Возвращает false и показывает причину, если нельзя. */
function saveBlock() {
  const B = S.editing; let blk;
  try { blk = blockFromCode(B.code); expandBlock(blk, null, withDraft(blk)); } catch (err) { toast('блок не сохранён: ' + err.message); return false; }
  if (blk.name !== B.name && REG.blocks[blk.name]) { toast('блок с именем ' + blk.name + ' уже есть: выберите другое имя'); return false; }
  const uses = S.ops.filter(o => o.g === 'BLOCK' && o.name === B.name);
  if (uses.some(o => o.q.length !== blk.wires.length)) { toast('блок стоит на схеме с другим числом кубитов: сначала уберите его со схемы'); return false; }
  const before = snap();
  if (blk.name !== B.name) { delete REG.blocks[B.name]; uses.forEach(o => { o.name = blk.name; }); }
  uses.forEach(o => { const a = {}; blk.params.forEach(p => { a[p.name] = o.args[p.name] !== undefined ? o.args[p.name] : evalExpr(p.def, {}); }); o.args = a; });
  REG.blocks[blk.name] = blk; B.name = blk.name;
  pushHistory(before); regenerate(); afterModelChange(); return true;
}
function leaveBlock() {
  if (blockDirty()) { if (!saveBlock()) { if (S.editing.leaveAsked) { toast('изменения блока отброшены'); } else { S.editing.leaveAsked = true; toast('блок не компилируется. Исправьте ошибку или нажмите «к схеме» ещё раз, чтобы выйти без сохранения'); return; } } else toast('блок «' + S.editing.name + '» сохранён'); }
  S.editing = null; S.bsel = null; render();
}

// ───────── результаты ─────────
const VIEWS = [['probs', 'вероятности'], ['amps', 'амплитуды'], ['bloch', 'Блох'], ['matrix', 'матрица'], ['stab', 'стабилиз.'], ['noise', 'шум']];
function renderResults() {
  const w = $('#resWrap'); const keep = w.querySelector('.rbody') && w.dataset.view === S.view ? w.querySelector('.rbody').scrollTop : 0;
  if (S.editing) { $('#resTitle').textContent = 'свойства блока'; $('#runChip').hidden = true; renderBlockProps(w); return; }
  $('#resTitle').textContent = 'результат'; const chip = $('#runChip'); chip.hidden = false;
  chip.textContent = S.runRes ? (S.runRes.stale ? 'схема изменилась' : S.runRes.time + ' · ' + S.runRes.ms + ' мс') : 'не запускалось'; chip.className = 'pill' + (S.runRes && S.runRes.stale ? ' warn' : '');
  const r = sim(S.slice);
  let h = `<div class="tabs" role="tablist">${VIEWS.map(([k, v]) => `<button role="tab" aria-selected="${S.view === k}" title="${k === 'stab' ? 'стабилизаторы' : v}" data-v="${k}" class="${S.view === k ? 'on' : ''}">${v}</button>`).join('')}</div><div class="rbody">`;
  if (S.view !== 'noise') h += `<div class="row"><div class="seg sm" id="sliceSeg"><button data-v="all" class="${S.slice == null ? 'on' : ''}">вся схема</button><button data-v="sl" class="${S.slice != null ? 'on' : ''}" ${maxCol() < 0 ? 'disabled' : ''}>${S.slice != null ? 'срез t' + (S.slice + 1) : 'срез…'}</button></div><span class="hint">${S.slice != null ? '← → соседний срез' : 'клик по t1, t2… на схеме'}</span></div>`;
  if (r.err) h += `<div class="note warn">${svgI('warn')}<span>${esc(r.err)}</span></div>`;
  else {
    if (r.st.lost > 1e-9) h += `<div class="note warn">${svgI('warn')}<span>цикл while не закончился за 64 итерации с вероятностью ${fmt(r.st.lost * 100, 2)}%: эта доля в результат не входит</span></div>`;
    h += VIEW_FN[S.view](r.st);
  }
  w.innerHTML = h + '</div>'; w.dataset.view = S.view; w.querySelector('.rbody').scrollTop = keep;
}
function histSVG(series, bits, w) {
  const N = 1 << bits, H = 140, gap = N > 16 ? 1 : 3, bw = (w - gap * (N - 1)) / N; let s = `<svg width="100%" viewBox="0 0 ${w} ${H + 34}" role="img" aria-label="гистограмма">`;
  [.25, .5, .75, 1].forEach(v => { s += `<line x1="0" x2="${w}" y1="${H - H * v}" y2="${H - H * v}" stroke="var(--line-subtle)"/><text x="${w}" y="${H - H * v - 3}" text-anchor="end" font-size="9" fill="var(--text-muted)" font-family="var(--font-mono)">${v * 100}%</text>`; });
  s += `<line x1="0" x2="${w}" y1="${H}" y2="${H}" stroke="var(--line-strong)"/>`;
  for (let i = 0; i < N; i++) {
    const x = i * (bw + gap);
    series.forEach((ser, k) => { const p = Math.min(1, ser.p[i]), sw = bw / series.length; if (p > 1e-9) s += `<rect x="${x + k * sw}" y="${H - H * p}" width="${Math.max(sw - (series.length > 1 ? 1 : 0), 1)}" height="${H * p}" rx="${Math.min(2, sw / 2)}" fill="${ser.c}"><title>${bitstr(i, bits)}: ${(p * 100).toFixed(1)}%</title></rect>`; else s += `<rect x="${x + k * sw}" y="${H - 2}" width="${Math.max(sw - 1, 1)}" height="2" fill="var(--data-4)"/>`; });
    const top = Math.max(...series.map(x2 => x2.p[i])); if (top > 0.04 && (N <= 16 || top > 0.1)) s += `<text x="${x + bw / 2}" y="${H + 14}" text-anchor="middle" font-size="${N > 16 ? 8 : 10}" fill="var(--text-secondary)" font-family="var(--font-mono)">${bitstr(i, bits)}</text>`;
  }
  return s + '</svg>';
}
const topRows = (p, bits, extra) => [...p].map((v, i) => [v, i]).filter(x => x[0] > 1e-9).sort((a, b) => b[0] - a[0]).slice(0, 64).map(([v, i]) => `<tr><td>${bits === S.n && !extra ? basis(i, bits) : bitstr(i, bits)}</td><td>${fmt(v * 100, 1)}%</td>${extra ? `<td>${extra(i)}</td>` : ''}</tr>`).join('');
const dynNote = st => st.dynamic && st.branches.length > 1 ? `<div class="note">${svgI('info')}<span>после измерений состояние — смесь ${st.branches.length} ${plural(st.branches.length, 'исхода', 'исходов', 'исходов')}: здесь вероятности, усреднённые по исходам</span></div>` : '';
const VIEW_FN = {
  probs(st) {
    const p = probsOf(st); const nz = [...p].filter(v => v > 1e-9).length; const big = st.n > 6;
    let h = `<div class="row"><span class="hint mono">${1 << st.n} состояний · ненулевых ${nz}</span><div class="grow"></div>${big ? '' : `<div class="seg sm" id="pmSeg"><button data-v="chart" class="${S.probsMode === 'chart' ? 'on' : ''}">график</button><button data-v="table" class="${S.probsMode === 'table' ? 'on' : ''}">таблица</button></div>`}</div>`;
    if (S.probsMode === 'chart' && !big) h += histSVG([{ p, c: 'var(--data-1)' }], st.n, 330);
    else h += `<table class="amps"><tr><th>состояние</th><th>P</th></tr>${topRows(p, st.n)}</table>${nz > 64 ? '<div class="hint">показаны 64 самых вероятных</div>' : ''}`;
    h += dynNote(st) + runHTML();
    h += `<div class="kicker">P(1) по кубитам</div>`;
    for (let q = 0; q < st.n; q++) { let v = 0; p.forEach((x, i) => { if (i >> q & 1) v += x; }); h += `<div class="row nowrap"><span class="mono" style="width:24px">q${q}</span><span class="bar"><span style="width:${v * 100}%"></span></span><span class="mono" style="width:40px;text-align:right">${fmt(v)}</span></div>`; }
    return h + metricsHTML();
  },
  amps(st) {
    const bs = st.branches.slice().sort((a, b) => b.p - a.p); const many = bs.length > 1; const k = Math.min(S.branch, bs.length - 1); const b = bs[k];
    let h = many ? `<div class="note">${svgI('info')}<span>после измерений у схемы несколько исходов. Амплитуды показаны для одного исхода, вероятности исходов — в скобках</span></div><div class="row">${bs.slice(0, 8).map((x, i) => `<button class="chip${i === k ? ' on' : ''}" data-br="${i}">${st.nc ? 'c=' + bitstr(x.cb, st.nc) : 'исход ' + (i + 1)} (${fmt(x.p * 100, 1)}%)</button>`).join('')}${bs.length > 8 ? `<span class="hint">и ещё ${bs.length - 8}</span>` : ''}</div>` : '';
    const N = 1 << st.n; let rows = '', z = 0, shown = 0;
    for (let i = 0; i < N; i++) { const re = b.re[i], im = b.im[i], a = Math.hypot(re, im); if (a < 1e-9) { z++; continue; } if (++shown > 64) continue; rows += `<tr><td>${basis(i, st.n)}</td><td>${fmt(re, 3)}${Math.abs(im) > 5e-10 ? (im < 0 ? ' − ' : ' + ') + Math.abs(im).toFixed(3).replace('.', ',') + 'i' : ''}</td><td>${fmt(a * a * 100, 1)}%</td><td>${diskSVG(Math.atan2(im, re), a)}</td></tr>`; }
    return h + `<table class="amps"><tr><th>состояние</th><th>амплитуда</th><th>P</th><th>фаза</th></tr>${rows}</table><div class="hint">${shown > 64 ? 'показаны первые 64 · ' : ''}нулевых состояний: ${z}</div><div class="note">${svgI('info')}<span>диск: стрелка — фаза амплитуды, заливка — её модуль. Общая фаза состояния физического смысла не имеет</span></div>`;
  },
  bloch(st) {
    const vs = [...Array(st.n).keys()].map(q => blochOf(st, q)); const q = Math.min(S.blochQ, st.n - 1); const v = vs[q]; const r = Math.hypot(v.x, v.y, v.z);
    let h = `<div class="seg sm" id="bqSeg">${vs.map((_, k) => `<button data-v="${k}" class="${k === q ? 'on' : ''}">q${k}</button>`).join('')}</div>`;
    h += `<div style="display:grid;place-items:center">${blochSVG(v, 200, true)}</div>`;
    h += [['⟨X⟩', v.x], ['⟨Y⟩', v.y], ['⟨Z⟩', v.z], ['длина вектора r', r]].map(([k, x]) => `<div class="kv"><span>${k}</span><span>${fmt(x)}</span></div>`).join('');
    h += `<div class="note">${svgI('info')}<span>${r > 0.98 ? 'кубит в чистом состоянии: вектор на поверхности сферы' : r < 0.02 ? (st.dynamic ? 'кубит запутан с остальными или измерен: вектор стянулся в центр' : 'кубит полностью запутан с остальными: вектор стянулся в центр') : 'состояние кубита смешанное (запутанность или измерение): вектор внутри сферы'}</span></div>`;
    if (st.n > 1) h += `<div class="row" style="justify-content:space-between">${vs.map((x, k) => `<button data-bq="${k}" class="minib" aria-label="кубит q${k}">${blochSVG(x, st.n > 6 ? 36 : 48, false)}<span class="mono" style="font-size:11px;color:${k === q ? 'var(--accent-indicator)' : 'var(--text-secondary)'}">q${k}</span></button>`).join('')}</div>`;
    return h;
  },
  matrix(st) {
    const seg = `<div class="row"><div class="seg sm" id="mmSeg">${[['rho', 'плотности ρ'], ['u', 'унитарная U']].map(([k, v]) => `<button data-v="${k}" class="${S.matMode === k ? 'on' : ''}">${v}</button>`).join('')}</div><div class="seg sm" id="mpSeg">${[['abs', 'модуль'], ['re', 'Re'], ['im', 'Im']].map(([k, v]) => `<button data-v="${k}" class="${S.matPart === k ? 'on' : ''}">${v}</button>`).join('')}</div></div>`;
    if (st.n > 4) return seg + `<div class="note">${svgI('info')}<span>матрица показывается до 4 кубитов: дальше клетки неразличимы</span></div>`;
    let M, name, foot = '';
    if (S.matMode === 'u') {
      let U = null; try { U = unitaryOf(S); } catch (e) { /* ошибка блока уже показана */ }
      if (!U) return seg + `<div class="note">${svgI('info')}<span>в схеме есть измерения, сброс или условия: она не описывается одной унитарной матрицей. Смотрите матрицу плотности</span></div>`;
      M = U; name = 'U'; foot = `<div class="hint">матрица всей схемы (срез не учитывается) · столбец — входное состояние, строка — выходное</div>`;
    } else { M = densityOf(st); name = 'ρ'; foot = `<div class="kv"><span>чистота Tr ρ²</span><span>${fmt(M.purity)}</span></div>`; }
    const N = M.N, cs = Math.floor(300 / N); let s = `<svg width="100%" viewBox="0 0 ${N * cs + 2} ${N * cs + 2}" role="img" aria-label="матрица ${name}">`;
    for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) {
      const re = M.re[i * N + j], im = M.im[i * N + j]; const v = S.matPart === 'abs' ? Math.hypot(re, im) : S.matPart === 're' ? re : im; const a = Math.min(1, Math.abs(v) * (S.matMode === 'u' ? 1 : 2));
      s += `<rect x="${j * cs + 1}" y="${i * cs + 1}" width="${cs - 1}" height="${cs - 1}" rx="2" fill="${v < -1e-9 ? 'var(--accent)' : 'var(--data-1)'}" fill-opacity="${a < 0.01 ? 0.06 : a}"><title>${name}[${bitstr(i, st.n)}, ${bitstr(j, st.n)}] = ${fmt(re, 3)}${Math.abs(im) > 5e-10 ? (im < 0 ? ' − ' : ' + ') + Math.abs(im).toFixed(3) + 'i' : ''}</title></rect>`;
    }
    return seg + s + '</svg>' + `<div class="hint">наведите на клетку, чтобы увидеть значение · красным — отрицательные</div>` + foot;
  },
  stab(st) {
    if (st.n > 6) return `<div class="note">${svgI('info')}<span>стабилизаторы показываются до 6 кубитов</span></div>`;
    if (st.branches.length > 1) return `<div class="note">${svgI('info')}<span>после измерений состояние смешанное: у него нет одного набора стабилизаторов. Выберите срез до измерения</span></div>`;
    const g = stabilizers(st);
    if (!g) return `<div class="note warn">${svgI('warn')}<span>состояние не стабилизаторное: в схеме до этой точки есть неклиффордов гейт (T, поворот на угол не кратный π/2, Тоффоли). Выберите срез раньше или набор Clifford</span></div>`;
    return `<div class="hint">генераторы стабилизатора: состояние не меняется при действии каждого из них</div>` + g.map(x => `<div class="row nowrap" style="gap:6px"><span class="mono" style="width:14px">${x.s}</span>${x.a.map((c, q) => `<span class="chip pauli ${c}" title="q${q}">${c}</span>`).join('')}</div>`).join('') + `<div class="hint mono">столбцы: q0 … q${st.n - 1}</div>`;
  },
  noise() {
    const r = sim(null); if (r.err) return ''; const out = outcomeDist(r.st); const m = metrics(S);
    const F = circuitFidelity(m, S.noise); const noisy = noisyDist(out.dist, out.bits, F, S.noise.ro / 100);
    let fid = 0; for (let i = 0; i < noisy.length; i++) fid += Math.sqrt(out.dist[i] * noisy[i]); fid *= fid;
    return `<div class="note">${svgI('info')}<span>упрощённая модель для оценки порядка величины: деполяризация всей схемы и ошибка считывания. Она не заменяет моделирование шума по гейтам</span></div>
     <label class="slider" for="nzModel"><div><span>модель шума</span></div><select id="nzModel" class="field">${[['depol', 'деполяризующий'], ['heron', 'IBM Heron · типичные значения']].map(([k, v]) => `<option value="${k}" ${S.run.noise === k ? 'selected' : ''}>${v}</option>`).join('')}</select></label>` +
      [['p1', 'ошибка 1-кубитного гейта', 0, 1, .01], ['p2', 'ошибка многокубитного гейта', 0, 5, .05], ['ro', 'ошибка считывания', 0, 10, .1]].map(([k, l, a, b, st_]) => `<label class="slider"><div><span>${l}</span><span>${String(S.noise[k]).replace('.', ',')}%</span></div><input type="range" min="${a}" max="${b}" step="${st_}" value="${S.noise[k]}" data-nz="${k}"></label>`).join('') +
      `<div class="row"><span class="legend" style="background:var(--data-2)"></span><span class="hint">идеально</span><span class="legend" style="background:var(--accent)"></span><span class="hint">с шумом</span><div class="grow"></div><span class="hint">${out.kind === 'c' ? 'по классическим битам' : 'по кубитам'}</span></div>` +
      (out.bits <= 6 ? histSVG([{ p: out.dist, c: 'var(--data-2)' }, { p: noisy, c: 'var(--accent)' }], out.bits, 330) : `<table class="amps"><tr><th>исход</th><th>идеально</th><th>с шумом</th></tr>${topRows(out.dist, out.bits, i => fmt(noisy[i] * 100, 1) + '%')}</table>`) +
      `<div class="kv"><span>близость распределений (fidelity)</span><span>${fmt(fid)}</span></div><div class="kv"><span>гейтов: 1-кубитных / многокубитных</span><span>${m.oneQubit} / ${m.twoQubit}</span></div>
     <button class="btn sm outline" id="useNoise">${svgI('wave')}${S.run.noise === 'none' ? 'запускать с этой моделью' : 'запускать без шума'}</button>
     <div class="kicker">коррекция ошибок · в планах</div><div class="row"><span class="chip">повторительный, 3</span><span class="chip">код Шора, 9</span><span class="chip">поверхностный d=3</span></div>`;
  },
};
/** Что выдаёт запуск: значения классических битов, а если измерений нет — все кубиты. */
function outcomeDist(st) { return st.measured ? { dist: clbitDist(st), bits: st.nc, kind: 'c' } : { dist: probsOf(st), bits: st.n, kind: 'q' }; }
function runHTML() {
  const R = S.runRes; if (!R || S.slice != null) return '';
  let h = `<div class="kicker">запуск ×${R.shots}</div>`;
  if (R.stale) h += `<div class="note warn">${svgI('warn')}<span>схема изменилась после запуска: отсчёты ниже относятся к прежней схеме. Запустите снова (${MOD}↵)</span></div>`;
  h += `<div class="hint">${R.kind === 'c' ? 'значения классических битов c' + (R.bits - 1) + '…c0' : 'в схеме нет измерений: измерены все кубиты q' + (R.bits - 1) + '…q0'} · ${NOISE_NAME[R.noise]}${R.seed ? ' · seed ' + esc(R.seed) : ''}</div>`;
  h += R.bits <= 6 ? histSVG([{ p: R.counts.map(v => v / R.shots), c: 'var(--accent)' }], R.bits, 330) : '';
  h += `<table class="amps"><tr><th>исход</th><th>доля</th><th>отсчёты</th></tr>${topRows(R.counts.map(v => v / R.shots), R.bits, i => R.counts[i])}</table>`;
  return h;
}
function metricsHTML() { const m = metrics(S); return `<div class="metrics">${[['кубитов', m.qubits], ['гейтов', m.gates], ['глубина', m.depth], ['многокубитных', m.twoQubit]].map(([k, v]) => `<div class="metric"><small>${k}</small><b>${v}</b></div>`).join('')}</div><div class="hint">гейты считаются без измерений, сброса и барьеров; блоки раскрываются; глубина — при самой ранней расстановке. Так же считает проверка задач</div>`; }
function diskSVG(ph, a) { const r = 11; return `<svg width="26" height="26" viewBox="0 0 26 26" aria-hidden="true"><circle cx="13" cy="13" r="12" fill="var(--bg-raised)" stroke="var(--line-strong)"/><circle cx="13" cy="13" r="${Math.max(2, 12 * a)}" fill="var(--data-2)" fill-opacity=".5"/><line x1="13" y1="13" x2="${13 + r * Math.cos(ph)}" y2="${13 - r * Math.sin(ph)}" stroke="var(--accent-indicator)" stroke-width="1.8" stroke-linecap="round"/></svg>`; }
function blochSVG(v, size, labels) {
  const pad = labels ? 18 : 3, R = size / 2 - pad, c = size / 2; const len = Math.hypot(v.x, v.y, v.z); const px = c + R * (v.y * .92 - v.x * .42), py = c - R * v.z * .92 + R * v.x * .28;
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" aria-hidden="true"><circle cx="${c}" cy="${c}" r="${R}" fill="var(--bg-raised)" fill-opacity=".35" stroke="var(--line-strong)" stroke-width="1.2"/><ellipse cx="${c}" cy="${c}" rx="${R}" ry="${R * .3}" fill="none" stroke="var(--data-3)" stroke-dasharray="3 3"/><line x1="${c}" y1="${c - R}" x2="${c}" y2="${c + R}" stroke="var(--data-3)" stroke-dasharray="3 3"/><line x1="${c + R * .42}" y1="${c - R * .28}" x2="${c - R * .42}" y2="${c + R * .28}" stroke="var(--data-3)" stroke-dasharray="3 3"/>
  ${len > 0.05 ? `<line x1="${c}" y1="${c}" x2="${px}" y2="${py}" stroke="var(--accent-indicator)" stroke-width="2.2" stroke-linecap="round"/><circle cx="${px}" cy="${py}" r="${labels ? 5 : 3}" fill="var(--accent-indicator)"/>` : `<circle cx="${c}" cy="${c}" r="2.5" fill="var(--accent-indicator)"/>`}
  ${labels ? `<text x="${c}" y="11" text-anchor="middle" font-size="11" fill="var(--text-muted)" font-family="var(--font-mono)">|0⟩</text><text x="${c}" y="${size - 2}" text-anchor="middle" font-size="11" fill="var(--text-muted)" font-family="var(--font-mono)">|1⟩</text><text x="${c - R * .5 - 8}" y="${c + R * .42}" font-size="11" fill="var(--text-muted)">x</text><text x="${size - 12}" y="${c - 4}" font-size="11" fill="var(--text-muted)">y</text>` : ''}</svg>`;
}
function renderBlockProps(w) {
  const B = S.editing; const blk = B.last;
  const used = S.ops.filter(o => o.g === 'BLOCK' && o.name === B.name).map(o => 't' + (o.col + 1) + '–t' + (o.col + 2));
  w.innerHTML = `<div class="rbody"><label class="slider"><div><span>имя</span></div><input class="field mono" id="bName" value="${esc(blk ? blk.name : '')}"></label>
   <div class="kicker">интерфейс</div><div class="kv"><span>кубиты</span><span>${blk ? esc(blk.wires.join(', ')) : '—'}</span></div><div class="kv"><span>параметры</span><span>${blk && blk.params.length ? esc(blk.params.map(p => p.name).join(', ')) : '—'}</span></div>
   <div class="kicker">так блок выглядит на схеме</div>
   <div class="preview">${blk ? circuitSVG({ n: blk.wires.length, ops: [{ id: -1, g: 'BLOCK', name: blk.name, q: blk.wires.map((_, k) => k), c: [], col: 0, span: 2, args: B.args || {} }] }, { names: blk.wires, colLabels: false, minCols: 0, aria: 'вид блока' }).replace('<svg', '<svg style="max-width:100%;height:auto"') : ''}</div>
   <div class="kicker">используется</div><div class="kv"><span>${esc(project() ? project().name : 'эта схема')}</span><span>${used.join(', ') || 'пока нигде'}</span></div>
   <div class="grow"></div>
   <button class="btn outline jc" id="blkInsert">${svgI('plus')}сохранить и вставить в схему</button>
   <button class="btn primary jc" id="blkSave">${svgI('check')}сохранить блок<kbd>${MOD}S</kbd></button>
   <button class="btn ghost jc danger" id="blkDelete" ${used.length ? 'disabled title="блок стоит на схеме: сначала уберите его оттуда"' : ''}>${svgI('trash')}удалить блок</button></div>`;
}
function renderStatus() {
  const m = metrics(S); const v = violations(S, allowNow()).length;
  $('#sbar').innerHTML = `<span>${S.n} ${plural(S.n, 'кубит', 'кубита', 'кубитов')} · ${m.gates} ${plural(m.gates, 'гейт', 'гейта', 'гейтов')} · глубина ${m.depth}</span><span>набор: ${esc(setName())}${v ? ` · <b class="errtext">вне набора: ${v}</b>` : ''}</span><span>симулятор: вектор состояния, ${S.run.backend === 'browser' ? 'в браузере' : 'сервер (в прототипе — браузер)'}</span><span><i class="${S.codeState === 'ok' ? '' : 'err'}"></i>${S.codeState === 'ok' ? 'код синхронизирован' : 'ошибка в коде'}</span><span class="grow"></span><button id="keysHint">? — клавиши</button>`;
}

// ───────── оверлеи ─────────
let toastT = null;
function toast(m) { let t = $('#toast'); if (!t) { t = document.createElement('div'); t.id = 'toast'; t.className = 'toast'; t.setAttribute('role', 'status'); t.setAttribute('aria-live', 'polite'); document.body.appendChild(t); } t.textContent = m; t.hidden = false; clearTimeout(toastT); toastT = setTimeout(() => { t.hidden = true; }, Math.min(8000, 2600 + m.length * 35)); }
let lastFocus = null;
function closeLayer() { if (!$('#layer').firstChild) return; $('#layer').innerHTML = ''; document.querySelectorAll('.btn.open').forEach(b => b.classList.remove('open')); if (lastFocus && document.contains(lastFocus)) lastFocus.focus(); lastFocus = null; }
function menu(anchor, items, onPick) {
  closeLayer(); lastFocus = anchor; const r = anchor.getBoundingClientRect(); const m = document.createElement('div'); m.className = 'menu'; m.setAttribute('role', 'menu');
  m.innerHTML = items.map((it, i) => it === '-' ? '<hr>' : `<button role="menuitem" data-k="${i}" class="${it.on ? 'on' : ''}"><span>${esc(it.t)}${it.d ? `<span class="d">${esc(it.d)}</span>` : ''}</span>${it.k ? `<small>${esc(it.k)}</small>` : it.on ? svgI('check').replace('<svg', '<svg width="16" height="16"') : ''}</button>`).join('');
  $('#layer').appendChild(m); m.style.left = Math.max(12, Math.min(r.left, innerWidth - m.offsetWidth - 12)) + 'px'; m.style.top = Math.min(r.bottom + 6, innerHeight - m.offsetHeight - 12) + 'px'; anchor.classList.add('open');
  m.addEventListener('click', e => { const b = e.target.closest('button[data-k]'); if (!b) return; closeLayer(); onPick(items[+b.dataset.k], +b.dataset.k); });
  const first = m.querySelector('button'); if (first) first.focus();
  m.addEventListener('keydown', e => { if (!['ArrowDown', 'ArrowUp'].includes(e.key)) return; e.preventDefault(); const bs = [...m.querySelectorAll('button')]; const k = bs.indexOf(document.activeElement); bs[(k + (e.key === 'ArrowDown' ? 1 : bs.length - 1)) % bs.length].focus(); });
}
function win(title, body, o) {
  o = o || {}; closeLayer(); lastFocus = o.anchor || document.activeElement; const w = document.createElement('div'); w.className = 'win' + (o.modal ? ' modal' : ''); w.style.width = (o.w || 360) + 'px'; w.setAttribute('role', 'dialog'); w.setAttribute('aria-label', title); if (o.modal) w.setAttribute('aria-modal', 'true');
  w.innerHTML = `<div class="wh"><span data-i="grip" class="muted"></span><h3>${esc(title)}</h3><button class="ibtn sm" data-close aria-label="закрыть">${svgI('x')}</button></div><div class="wb">${body}</div>`;
  if (o.modal) { const sc = document.createElement('div'); sc.className = 'modal-scrim'; sc.addEventListener('click', closeLayer); $('#layer').appendChild(sc); }
  $('#layer').appendChild(w); paintIcons(w);
  if (o.anchor) { const r = o.anchor.getBoundingClientRect(); w.style.left = Math.max(12, Math.min(r.right - w.offsetWidth, innerWidth - w.offsetWidth - 12)) + 'px'; w.style.top = Math.min(r.bottom + 6, Math.max(12, innerHeight - w.offsetHeight - 12)) + 'px'; o.anchor.classList.add('open'); }
  else { w.style.left = Math.max(12, (innerWidth - w.offsetWidth) / 2) + 'px'; w.style.top = Math.max(12, (innerHeight - w.offsetHeight) / 2) + 'px'; }
  w.querySelector('[data-close]').onclick = closeLayer;
  const hd = w.querySelector('.wh');
  hd.addEventListener('pointerdown', e => {
    if (e.target.closest('button')) return; const sx = e.clientX - w.offsetLeft, sy = e.clientY - w.offsetTop; hd.setPointerCapture(e.pointerId);
    const mv = ev => { w.style.left = Math.min(innerWidth - 60, Math.max(-w.offsetWidth + 80, ev.clientX - sx)) + 'px'; w.style.top = Math.min(innerHeight - 40, Math.max(0, ev.clientY - sy)) + 'px'; };
    const up = () => { hd.removeEventListener('pointermove', mv); hd.removeEventListener('pointerup', up); hd.removeEventListener('pointercancel', up); }; hd.addEventListener('pointermove', mv); hd.addEventListener('pointerup', up); hd.addEventListener('pointercancel', up);
  });
  const f = w.querySelector('.wb button, .wb input, .wb select'); (f || w.querySelector('[data-close]')).focus();
  return w;
}
const EXPORTS = { qasm3: ['OpenQASM 3.0', 'qasm', () => genQasm(S)], qasm2: ['OpenQASM 2.0', 'qasm', () => genQasm(S, true)], qiskit: ['Qiskit · Python', 'py', () => S.goodText], penny: ['PennyLane', 'py', () => genPenny(S)], cirq: ['Cirq', 'py', () => genCirq(S)], json: ['JSON SPARQ', 'json', () => genJson(S)], svg: ['SVG', 'svg', () => exportSVG()], latex: ['LaTeX · quantikz', 'tex', () => genLatex(S)] };
/** Самодостаточный SVG схемы: переменные темы заменены значениями, служебные области убраны. */
function exportSVG() {
  const raw = circuitSVG(S, { cbits: true, loops: S.loops, colLabels: false, minCols: 0 }); const cs = getComputedStyle(document.documentElement);
  const vars = ['--bg-panel', '--bg-raised', '--line-strong', '--line-control', '--text-primary', '--text-secondary', '--text-muted', '--data-1', '--data-3', '--data-4', '--accent-line', '--warn', '--accent-indicator', '--accent-text', '--accent'];
  const style = `<style>text{font-family:'JetBrains Mono',ui-monospace,monospace}.gate rect{fill:var(--bg-raised);stroke:var(--line-strong);stroke-width:1.5}.hit{fill:none!important;stroke:none!important}.lbl{fill:var(--text-primary);font-size:14px;font-weight:500}.sub,.cbit{fill:var(--text-muted);font-size:10px}.wire{stroke:var(--line-strong);stroke-width:1.5}.cwire{stroke:var(--data-3);fill:none}.qn{fill:var(--text-primary);font-size:14px}.ket{fill:var(--text-muted);font-size:13px}.loop{fill:none;stroke:var(--line-control);stroke-dasharray:5 4}.blk rect{stroke:var(--accent-line);stroke-dasharray:5 3}.dynb rect{stroke:var(--warn);stroke-dasharray:5 4}</style>`;
  let out = raw.replace('<svg class="circ"', '<svg xmlns="http://www.w3.org/2000/svg" class="circ"').replace(/(<svg[^>]*>)/, `$1${style}<rect width="100%" height="100%" fill="var(--bg-panel)"/>`).replace(/<title>[\s\S]*?<\/title>/g, '');
  vars.forEach(v => { out = out.split(`var(${v})`).join(cs.getPropertyValue(v).trim() || '#888'); });
  return out;
}
function download(name, text, type) { const a = document.createElement('a'); const url = URL.createObjectURL(new Blob([text], { type: type || 'text/plain;charset=utf-8' })); a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000); }
const fileBase = () => ((TASK ? TASK.code || 'solution' : project() ? project().name : 'circuit').replace(/[^\wа-яё-]+/gi, '_').replace(/^_+|_+$/g, '') || 'circuit');
function exportWin() {
  if (S.codeState === 'err') { toast('сначала исправьте ошибку в коде: экспортируется последняя верная схема'); }
  const fm = [['код', ['qasm3', 'qasm2', 'qiskit', 'penny', 'cirq']], ['данные', ['json']], ['картинка', ['svg', 'latex']]]; let cur = 'qasm3';
  const w = win('экспорт схемы', `<div class="expgrid"><div class="fmt">${fm.map(([g, l]) => `<h4>${g}</h4>` + l.map(k => `<button data-f="${k}">${EXPORTS[k][0]}</button>`).join('')).join('')}</div>
    <div class="expmain"><pre class="prev" id="expPrev" tabindex="0"></pre><div class="row"><span class="hint" id="expInfo"></span><div class="grow"></div><button class="btn sm outline" id="expCopy">${svgI('copy')}копировать</button><button class="btn sm primary" id="expDl">${svgI('download')}скачать</button></div></div></div>`, { w: 720, modal: true });
  const text = () => { try { return EXPORTS[cur][2](); } catch (e) { return '// ' + e.message; } };
  const upd = () => { const t = text(); $('#expPrev').textContent = t; const notes = (t.match(/^(\/\/|#) .*(нет|запишите|разложите)/gm) || []).length; $('#expInfo').textContent = t.split('\n').length + ' ' + plural(t.split('\n').length, 'строка', 'строки', 'строк') + ' · ' + fileBase() + '.' + EXPORTS[cur][1] + (notes ? ' · есть конструкции без точного перевода: см. комментарии' : ''); w.querySelectorAll('[data-f]').forEach(b => b.classList.toggle('on', b.dataset.f === cur)); };
  upd();
  w.addEventListener('click', e => { const b = e.target.closest('[data-f]'); if (b) { cur = b.dataset.f; upd(); } if (e.target.closest('#expCopy')) copy(text()); if (e.target.closest('#expDl')) { download(fileBase() + '.' + EXPORTS[cur][1], text(), cur === 'svg' ? 'image/svg+xml' : undefined); toast('файл ' + fileBase() + '.' + EXPORTS[cur][1] + ' сохранён'); } });
}
function copy(t) {
  const done = () => toast('скопировано');
  const fallback = () => { const ta = document.createElement('textarea'); ta.value = t; ta.style.position = 'fixed'; ta.style.opacity = '0'; document.body.appendChild(ta); ta.select(); try { document.execCommand('copy') ? done() : toast('не удалось скопировать: выделите текст вручную'); } catch (e) { toast('не удалось скопировать: выделите текст вручную'); } ta.remove(); };
  try { navigator.clipboard.writeText(t).then(done, fallback); } catch (e) { fallback(); }
}
function runWin(anchor) {
  const R = S.run; const w = win('настройки запуска', `<div class="kicker">где считать</div>
   ${[['browser', 'в браузере', 'вектор состояния · до ' + MAXQ + ' кубитов · сразу'], ['server', 'на сервере', 'до 30 кубитов · появится вместе с платформой, пока считает браузер'], ['ibm', 'квантовый процессор', 'в планах']].map(([k, t, d]) => `<button class="opt${R.backend === k ? ' on' : ''}" data-be="${k}" role="radio" aria-checked="${R.backend === k}" ${k === 'ibm' ? 'disabled' : ''}><i></i><span><b>${t}</b><small>${d}</small></span></button>`).join('')}
   <div class="kicker">шум</div><select class="field" id="rsNoise" aria-label="шум">${Object.entries({ none: 'без шума', depol: 'деполяризующий', heron: 'IBM Heron · типичные значения' }).map(([k, v]) => `<option value="${k}" ${R.noise === k ? 'selected' : ''}>${v}</option>`).join('')}</select>
   <span class="hint">параметры модели и сравнение с идеалом — во вкладке «шум» результата</span>
   <div class="kicker">число запусков</div><div class="seg" id="rsShots">${[256, 1024, 4096, 8192].map(v => `<button data-v="${v}" class="${R.shots === v ? 'on' : ''}">${v}</button>`).join('')}</div>
   <label class="row nowrap" for="rsSeed"><span style="width:44px">seed</span><input id="rsSeed" class="field mono" style="flex:1" placeholder="случайный" value="${esc(R.seed)}"></label>
   <span class="hint">с одним и тем же seed запуск даёт одни и те же отсчёты · настройки применяются к следующему запуску</span>`, { anchor, w: 380 });
  w.addEventListener('click', e => {
    const b = e.target.closest('[data-be]'); if (b && !b.disabled) { R.backend = b.dataset.be; w.querySelectorAll('[data-be]').forEach(x => { x.classList.toggle('on', x === b); x.setAttribute('aria-checked', x === b); }); renderBars(); renderStatus(); }
    const s = e.target.closest('#rsShots button'); if (s) { R.shots = +s.dataset.v; w.querySelectorAll('#rsShots button').forEach(x => x.classList.toggle('on', x === s)); renderBars(); }
  });
  w.querySelector('#rsNoise').onchange = e => { setNoise(e.target.value); renderBars(); if (S.view === 'noise') renderResults(); };
  w.querySelector('#rsSeed').oninput = e => { R.seed = e.target.value.trim(); };
}
function setNoise(k) { S.run.noise = k; if (k === 'heron') Object.assign(S.noise, { p1: .03, p2: .3, ro: 1.2 }); else if (k === 'depol') Object.assign(S.noise, { p1: .1, p2: 1, ro: 1 }); }
function shareWin(anchor) {
  if (S.codeState === 'err') toast('в ссылку попадёт последняя верная версия кода');
  const link = shareLink(false); const long = link.length > 6000;
  win('поделиться', `<label class="row nowrap" for="shLink"><input id="shLink" class="field mono" readonly value="${esc(link)}"></label>
  <button class="btn primary jc" id="shCopy">${svgI('copy')}копировать ссылку</button>
  <span class="hint">схема и блоки записаны в самой ссылке: сервер не нужен. У того, кто её откроет, появится своя копия проекта — ваша схема не изменится${long ? '. Ссылка получилась длинной: мессенджеры могут её обрезать, надёжнее передать файл из «экспорта»' : ''}</span>
  <div class="kicker">встроить на страницу</div><pre class="prev" id="shEmbed" tabindex="0">&lt;iframe src="${esc(shareLink(true))}" width="100%" height="560" style="border:0"&gt;&lt;/iframe&gt;</pre>
  <button class="btn sm outline jc" id="shCopyE">${svgI('copy')}копировать код вставки</button>`, { anchor, w: 380 });
  $('#shCopy').onclick = () => copy(link);
  $('#shCopyE').onclick = () => copy($('#shEmbed').textContent);
  $('#shLink').onfocus = e => e.target.select();
}
function keysWin() { win('горячие клавиши', [[MOD + '↵', 'запустить'], ['Delete', 'удалить выбранный гейт'], [MOD + 'Z / ' + MOD + (isMac ? '⇧Z' : 'Y'), 'отменить / повторить'], ['← →', 'соседний срез'], ['Esc', 'снять выбор, закрыть окно'], [MOD + 'S', 'сохранить версию или блок'], [MOD + 'E', 'экспорт'], [MOD + 'B', 'палитра'], [MOD + 'J', 'панель кода'], [MOD + '\\', 'панель результата'], ['Enter на плитке', 'выбрать гейт для установки кликом'], ['?', 'это окно']].map(([k, v]) => `<div class="kv"><span>${v}</span><span>${k}</span></div>`).join(''), { w: 360 }); }
function confirmWin(title, text, yes, onYes) { const w = win(title, `<p class="p">${esc(text)}</p><div class="row" style="justify-content:flex-end"><button class="btn sm outline" data-no>отмена</button><button class="btn sm primary" data-yes>${esc(yes)}</button></div>`, { w: 380, modal: true }); w.querySelector('[data-no]').onclick = closeLayer; w.querySelector('[data-yes]').onclick = () => { closeLayer(); onYes(); }; w.querySelector('[data-no]').focus(); }

// ───────── проекты, блоки, версии ─────────
function openDrawer(k) { S.drawer = k; renderDrawer(); renderBars(); const f = $('#drawerHost .drawer button, #drawerHost .drawer input'); if (f) f.focus(); }
function closeDrawer() { if (!S.drawer) return; S.drawer = null; $('#drawerHost').innerHTML = ''; renderBars(); }
let blkTab = 'project';
const uniqueName = base => { const names = STORE.projects.map(p => p.name); if (!names.includes(base)) return base; let k = 2; while (names.includes(base + ' ' + k)) k++; return base + ' ' + k; };
function renderDrawer() {
  const host = $('#drawerHost'); const k = S.drawer; if (!k) { host.innerHTML = ''; return; }
  let title = '', head = '', list = '';
  if (k === 'blocks') {
    title = 'блоки'; head = `<button class="btn sm raised" id="newBlock">${svgI('plus')}новый</button>`;
    const src = blkTab === 'project' ? Object.keys(REG.blocks).map(n => ({ n, code: REG.blocks[n].code })) : blkTab === 'templates' ? Object.keys(TEMPLATES).map(n => ({ n, code: TEMPLATES[n], tpl: 1 })) : [];
    list = `<div class="dpad"><div class="seg sm" id="blkTabs">${[['project', 'проект'], ['templates', 'шаблоны'], ['shared', 'общие']].map(([a, b]) => `<button data-v="${a}" class="${blkTab === a ? 'on' : ''}">${b}</button>`).join('')}</div></div><div class="list">` +
      (src.length ? src.map(b => { const B = blockFromCode(b.code); return `<button class="item${S.editing && S.editing.name === b.n ? ' on' : ''}" data-blk="${esc(b.n)}" data-tpl="${b.tpl || ''}"><span class="ic">${svgI('code')}</span><span><b>${esc(b.n)}(${esc(B.params.map(p => p.name).join(', '))})</b><small>${B.wires.length} ${plural(B.wires.length, 'кубит', 'кубита', 'кубитов')} · ${B.params.length} ${plural(B.params.length, 'параметр', 'параметра', 'параметров')}${b.tpl ? (REG.blocks[b.n] ? ' · уже в проекте' : ' · шаблон') : ''}</small></span></button>`; }).join('') : `<div class="empty">${blkTab === 'shared' ? 'общих блоков пока нет: здесь появятся блоки курса и команды' : 'в проекте пока нет блоков: нажмите «новый» или возьмите шаблон'}</div>`) + `</div><p class="hint dfoot">${blkTab === 'templates' ? 'клик добавляет копию шаблона в проект и открывает её' : 'клик открывает редактор блока'}</p>`;
  }
  if (k === 'projects') {
    title = 'проекты'; head = `<button class="btn sm raised" id="newProj">${svgI('plus')}новый</button>`;
    list = `<div class="list">` + STORE.projects.slice().sort((a, b) => b.updated - a.updated).map(p => `<div class="item${STORE.cur === p.id ? ' on' : ''}"><button class="itmain" data-proj="${p.id}"><span class="ic">${svgI('doc')}</span><span><b>${esc(p.name)}</b><small>${esc(projMeta(p))}</small></span></button><button class="ibtn sm" data-pren="${p.id}" title="переименовать" aria-label="переименовать ${esc(p.name)}">${svgI('pen')}</button><button class="ibtn sm danger" data-pdel="${p.id}" title="удалить" aria-label="удалить ${esc(p.name)}">${svgI('trash')}</button></div>`).join('') + `</div><p class="hint dfoot">${storage ? 'проекты хранятся в этом браузере. Чтобы перенести схему, используйте «поделиться» или «экспорт»' : 'хранилище браузера недоступно: проекты пропадут при закрытии вкладки'}</p>`;
  }
  if (k === 'examples') {
    title = 'примеры';
    list = `<div class="list">` + EXAMPLES.map((p, i) => `<button class="item" data-ex="${i}"><span class="ic">${svgI('book')}</span><span><b>${esc(p.name)}</b><small>${esc(p.meta)}</small></span></button>`).join('') + `</div><p class="hint dfoot">пример открывается как новый проект: его можно менять, оригинал останется здесь</p>`;
  }
  if (k === 'versions') {
    const vs = TASK ? [] : (project().versions || []);
    title = 'версии'; head = TASK ? '' : `<button class="btn sm raised" id="saveVer">${svgI('star')}сохранить</button>`;
    list = `<div class="list">` + (vs.length ? vs.slice().reverse().map((v, i) => `<button class="item" data-ver="${vs.length - 1 - i}"><span class="ic">${svgI('history')}</span><span><b>${esc(v.label)}</b><small>${esc(v.time)} · ${v.n} ${plural(v.n, 'кубит', 'кубита', 'кубитов')} · ${v.g} ${plural(v.g, 'гейт', 'гейта', 'гейтов')}</small></span></button>`).join('') : `<div class="empty">${TASK ? 'в режиме задачи версий нет: черновик решения сохраняется сам' : 'версий пока нет: нажмите «сохранить» или ' + MOD + 'S'}</div>`) + `</div><p class="hint dfoot">клик восстанавливает версию; ${MOD}Z вернёт как было</p>`;
  }
  host.innerHTML = `<div class="dscrim" id="dscrim"></div><aside class="drawer" role="dialog" aria-label="${title}"><div class="ph"><h2>${title}</h2><div class="grow"></div>${head}<button class="ibtn sm" id="drawerX" aria-label="закрыть">${svgI('x')}</button></div>${list}</aside>`;
}
function projMeta(p) { try { const r = parseProgram(p.code, Object.fromEntries(Object.values(p.blocks || {}).map(c => { const b = blockFromCode(c); return [b.name, b]; }))); return r.n + ' ' + plural(r.n, 'кубит', 'кубита', 'кубитов') + ' · ' + r.ops.length + ' ' + plural(r.ops.length, 'операция', 'операции', 'операций') + ' · ' + new Date(p.updated).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' }); } catch (e) { return 'ошибка в коде'; } }
function openBlock(name, code) { if (S.editing && blockDirty() && !saveBlock()) return; S.editing = { name, code: code || REG.blocks[name].code, args: null }; S.bsel = null; S.sel = null; S.blockTab = 'code'; closeDrawer(); S.leftOpen = true; render(); }
/** Открыть проект из хранилища. Текущий перед этим сохраняется. */
function openProject(id, quiet) {
  if (project()) saveNow();
  const p = STORE.projects.find(x => x.id === id); if (!p) return;
  STORE.cur = id; REG.blocks = {};
  try { Object.values(p.blocks || {}).forEach(c => { const b = blockFromCode(c); REG.blocks[b.name] = b; }); loadCode(p.code); }
  catch (e) { S.n = 1; S.nc = 0; S.ops = []; S.loops = []; S.codeText = p.code; S.goodText = 'from qiskit import QuantumCircuit\n\nqc = QuantumCircuit(1)\n'; S.codeState = 'err'; S.codeErr = e.message; }
  S.history = []; S.future = []; S.slice = null; S.runRes = null; S.editing = null; S.sel = null; S.rev++; S.loaded = true;
  closeDrawer(); saveNow(); render(); if (!quiet) toast('открыт проект «' + p.name + '»');
}
function newProject(name, code, blocks, quiet) {
  const p = { id: 'p' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6), name: uniqueName(name), code, blocks: blocks || {}, versions: [], updated: Date.now() };
  STORE.projects.push(p); openProject(p.id, quiet); return p;
}
function saveVersion() {
  if (TASK) { saveNow(); toast('черновик решения сохранён'); return; }
  if (S.codeState === 'err') { toast('версия не сохранена: в коде ошибка'); return; }
  const p = project(); p.versions = p.versions || []; const m = metrics(S);
  p.versions.push({ label: 'версия ' + (p.versions.length + 1), time: new Date().toLocaleString('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }), code: S.goodText, blocks: blockCodes(), n: S.n, g: m.gates });
  if (p.versions.length > 30) p.versions.shift();
  saveNow(); toast('версия сохранена'); if (S.drawer === 'versions') renderDrawer();
}

// ───────── запуск ─────────
function runNow() {
  if (S.editing) { toast('запуск относится к основной схеме: вернитесь к ней из редактора блока'); return; }
  if (S.codeState === 'err') toast('в коде ошибка: запускается последняя верная схема');
  const t0 = performance.now(); let st; try { st = simulate(S, null); } catch (e) { toast(e.message); return; }
  const out = outcomeDist(st); let dist = out.dist;
  if (S.run.noise !== 'none') dist = noisyDist(dist, out.bits, circuitFidelity(metrics(S), S.noise), S.noise.ro / 100);
  const seedNum = S.run.seed ? [...S.run.seed].reduce((a, c) => (Math.imul(a, 31) + c.charCodeAt(0)) | 0, 7) : (Math.random() * 2 ** 32) >>> 0;
  const counts = sample(dist, S.run.shots, rng(seedNum));
  S.runRes = { counts, bits: out.bits, kind: out.kind, shots: S.run.shots, noise: S.run.noise, seed: S.run.seed, stale: false, time: hhmm(), ms: Math.max(1, Math.round(performance.now() - t0)) };
  S.slice = null; S.view = 'probs'; S.rightOpen = true; render();
  const rb = $('#resWrap .rbody'); const k = rb && rb.querySelector('.kicker'); if (k) rb.scrollTop = Math.max(0, k.offsetTop - rb.offsetTop - 8);
}

// ───────── задача ─────────
function submitTask() {
  if (S.codeState === 'err') { toast('отправка невозможна: в коде ошибка'); return; }
  const fails = checkContract(S, TASK).filter(c => !c.ok);
  const send = () => {
    const msg = { type: 'sparq:submit', taskId: TASK.id, format: 'sparq-circuit', circuit: JSON.parse(genJson(S)), qiskit: S.goodText, metrics: metrics(S) };
    if (window.parent !== window) { window.parent.postMessage(msg, TASK.origin || '*'); toast('решение передано на проверку'); }
    else toast('песочница открыта отдельно от страницы задачи: отправка работает, когда она встроена в задачу. Решение сохранено как черновик');
    saveNow();
  };
  if (fails.length) confirmWin('ограничения задачи нарушены', 'Не выполнено: ' + fails.map(f => f.label + ' ' + f.value + (f.key === 'basis' ? '' : ' при пределе ' + f.limit)).join('; ') + '. Проверка вернёт вердикт о превышении ограничений.', 'всё равно отправить', send);
  else send();
}

// ───────── перетаскивание ─────────
let drag = null;
function startDrag(e, payload, label) {
  drag = { payload, sx: e.clientX, sy: e.clientY, moved: false };
  const mv = ev => {
    if (!drag) return; if (!drag.moved && Math.hypot(ev.clientX - drag.sx, ev.clientY - drag.sy) < 5) return;
    if (!drag.moved) { drag.moved = true; const g = document.createElement('div'); g.className = 'ghost-tile'; g.innerHTML = label; document.body.appendChild(g); drag.ghost = g; document.body.classList.add('dragging'); }
    drag.ghost.style.left = (ev.clientX - 21) + 'px'; drag.ghost.style.top = (ev.clientY - 21) + 'px'; drawDrop(dropTarget(ev.clientX, ev.clientY));
  };
  const end = ev => {
    document.removeEventListener('pointermove', mv); document.removeEventListener('pointerup', end); document.removeEventListener('pointercancel', cancel);
    const d = drag; drag = null; if (!d) return; if (d.ghost) d.ghost.remove(); document.body.classList.remove('dragging'); drawDrop(null);
    if (!d.moved) { if (d.payload.click) d.payload.click(); return; }
    const tgt = dropTarget(ev.clientX, ev.clientY); if (tgt) doDrop(d.payload, tgt);
  };
  const cancel = () => { document.removeEventListener('pointermove', mv); document.removeEventListener('pointerup', end); document.removeEventListener('pointercancel', cancel); if (drag && drag.ghost) drag.ghost.remove(); drag = null; document.body.classList.remove('dragging'); drawDrop(null); };
  document.addEventListener('pointermove', mv); document.addEventListener('pointerup', end); document.addEventListener('pointercancel', cancel);
}
function dropTarget(x, y) {
  for (const id of ['#cbody', '#bbody']) {
    const el = $(id); if (!el) continue; const r = el.getBoundingClientRect(); if (x < r.left || x > r.right || y < r.top || y > r.bottom) continue;
    const svg = el.querySelector('svg.circ'); if (!svg) continue; const sr = svg.getBoundingClientRect(); const { X0, CW, RH, TOP } = GEO;
    const col = Math.floor((x - sr.left - X0) / CW); const q = Math.round((y - sr.top - TOP) / RH); const n = +el.dataset.n;
    if (col < 0 || q < 0 || q >= n) return null; return { el: id, col, q };
  }
  return null;
}
function drawDrop(t) {
  document.querySelectorAll('.circ .drop').forEach(x => x.remove()); if (!t) return; const svg = $(t.el + ' svg.circ'); const { X0, CW, RH, TOP, GS } = GEO;
  const r = document.createElementNS('http://www.w3.org/2000/svg', 'rect'); r.setAttribute('class', 'drop'); r.setAttribute('x', X0 + t.col * CW + CW / 2 - GS / 2 - 2); r.setAttribute('y', TOP + t.q * RH - GS / 2 - 2); r.setAttribute('width', GS + 4); r.setAttribute('height', GS + 4); r.setAttribute('rx', 10); svg.appendChild(r);
}
/** Сдвинуть операцию так, чтобы её первая цель встала на кубит q; false — не помещается. */
function shiftTo(o, q, n) { const anchor = o.g === 'BLOCK' || o.g === 'DYN' ? Math.min(...o.q) : o.q[0]; const dq = q - anchor; if (o.q.concat(o.c).some(w => w + dq < 0 || w + dq >= n)) return false; o.q = o.q.map(w => w + dq); o.c = o.c.map(w => w + dq); if (o.body) o.body.forEach(b => { b.q = b.q.map(w => w + dq); b.c = (b.c || []).map(w => w + dq); }); return true; }
function doDrop(p, t) {
  if (t.el === '#bbody') {
    const B = S.editing; if (!B.last || !B.ops) return; const ops = B.ops.map(o => Object.assign({}, o)); const n = B.last.wires.length;
    if (p.kind === 'new') {
      if (p.b) { toast('вложенный блок добавляйте в коде: строкой ' + p.b + '(qc, …)'); return; }
      const o = makeOp(p.g, t.col, t.q, n, 1); if (!o) { toast('для ' + lab(p.g) + ' блоку нужно больше кубитов'); return; }
      placeOp(ops, o); ops.push(o); S.bsel = o.id;
    } else if (p.kind === 'bmove') { const o = ops.find(x => x.id === p.id); if (!o || !shiftTo(o, t.q, n)) { toast('гейт не помещается на эти провода'); return; } o.col = t.col; placeOp(ops, o); }
    else return;
    compact(ops); blockOpsToCode(B, ops); render(); return;
  }
  if (S.editing) return;
  if (p.kind === 'new') {
    if (p.b) { const B = REG.blocks[p.b]; if (!B) return; if (B.wires.length > S.n) { toast('блоку нужно ' + B.wires.length + ' ' + plural(B.wires.length, 'кубит', 'кубита', 'кубитов') + ', в схеме ' + S.n); return; } }
    else if (!makeOp(p.g, 0, t.q, S.n, S.nc)) { toast('для ' + lab(p.g) + ' нужно больше кубитов'); return; }
    const allow = allowNow();
    commit(() => {
      let o;
      if (p.b) { const B = REG.blocks[p.b]; const k = B.wires.length; const q0 = Math.min(t.q, S.n - k); const args = {}; B.params.forEach(x => { args[x.name] = evalExpr(x.def, {}); }); o = { id: nid(), g: 'BLOCK', name: p.b, q: [...Array(k).keys()].map(i => q0 + i), c: [], p: null, args, col: t.col, span: 2 }; }
      else { o = makeOp(p.g, t.col, t.q, S.n, S.nc); if (o.g === 'M' && S.nc === 0) { S.nc = S.n; o.cb = t.q; } }
      placeOp(S.ops, o); S.ops.push(o); compact(S.ops); S.sel = o.id;
      if (allow && p.g && !allow.includes(p.g)) toast(lab(p.g) + ' не входит в набор «' + setName() + '»');
    });
  } else if (p.kind === 'move') {
    const o0 = S.ops.find(x => x.id === p.id); if (!o0) return;
    const probe = JSON.parse(JSON.stringify(o0)); if (!shiftTo(probe, t.q, S.n)) { toast('гейт не помещается на эти провода'); return; }
    if (probe.col === t.col && probe.q[0] === o0.q[0] && t.col === o0.col) return;
    commit(() => { const o = S.ops.find(x => x.id === p.id); shiftTo(o, t.q, S.n); o.col = t.col; placeOp(S.ops, o); compact(S.ops); S.sel = o.id; });
  }
}

// ───────── события ─────────
function armTile(tile) { const g = tile.dataset.g, b = tile.dataset.b; S.armed = S.armed && S.armed.g === g && S.armed.b === b ? null : { g, b }; renderPalette(); paintIcons(); if (S.armed) toast('нажмите на клетку схемы, чтобы поставить ' + (b || lab(g)) + ' · Esc — отмена'); }
document.addEventListener('pointerdown', e => {
  const tile = e.target.closest('.tile');
  if (tile && !tile.classList.contains('off') && e.button === 0) { e.preventDefault(); const g = tile.dataset.g, b = tile.dataset.b; startDrag(e, { kind: 'new', g, b, click: () => armTile(tile) }, b ? esc(b).slice(0, 6) : tileLabel(g)); return; }
  const gt = e.target.closest('.circ .gate');
  if (gt && e.button === 0) {
    const id = +gt.dataset.id; const inBlock = !!gt.closest('#bbody'); if (id < 0 || (!inBlock && !gt.closest('#cbody'))) return; e.preventDefault();
    const o = (inBlock ? S.editing.ops : S.ops).find(x => x.id === id);
    startDrag(e, { kind: inBlock ? 'bmove' : 'move', id, click: () => { if (inBlock) S.bsel = S.bsel === id ? null : id; else S.sel = S.sel === id ? null : id; renderCenter(); paintIcons(); } }, o ? (o.g === 'BLOCK' ? esc(o.name).slice(0, 6) : o.g === 'DYN' ? 'while' : tileLabel(o.g)) : '');
  }
});
document.addEventListener('click', e => {
  const t = e.target; if (t.closest('.menu,.win,.ctx')) return;
  const col = t.closest('.col-l,.colhit'); if (col && t.closest('#cbody')) { const c = +col.dataset.col; if (c > maxCol()) { toast('в столбце t' + (c + 1) + ' пока нет гейтов'); return; } S.slice = S.slice === c ? null : c; render(); return; }
  if (S.armed && t.closest('#cbody,#bbody') && !t.closest('.gate')) { const tgt = dropTarget(e.clientX, e.clientY); if (tgt) { doDrop({ kind: 'new', g: S.armed.g, b: S.armed.b }, tgt); return; } }
  if (t.closest('svg.circ') && !t.closest('.gate') && (S.sel != null || S.bsel != null)) { S.sel = null; S.bsel = null; renderCenter(); paintIcons(); }
});
const ACTIONS = {
  newBlock() { let k = 1; while (REG.blocks['my_block' + k]) k++; openBlock('my_block' + k, `def my_block${k}(qc, a, b, theta=pi / 2):\n    qc.h(a)\n    qc.cx(a, b)\n    qc.ry(theta, b)`); },
  newProj() { newProject('новый проект', 'from qiskit import QuantumCircuit\nfrom math import pi\n\nqc = QuantumCircuit(3)\n'); },
  saveVer() { saveVersion(); },
  palClose() { S.leftOpen = false; renderBars(); }, palOpen() { S.leftOpen = true; renderBars(); },
  resClose() { S.rightOpen = false; renderBars(); }, resOpen() { S.rightOpen = true; renderBars(); },
  undoBtn: undo, redoBtn: redo,
  qPlus() { if (S.n >= MAXQ) { toast('в браузере до ' + MAXQ + ' кубитов'); return; } setSize(S.n + 1, S.nc); },
  qMinus() { if (S.n <= 1) return; if (S.ops.some(o => o.q.concat(o.c).includes(S.n - 1))) { toast('на q' + (S.n - 1) + ' есть гейты: сначала удалите их'); return; } setSize(S.n - 1, S.nc); },
  cPlus() { if (S.nc >= 2 * MAXQ) return; setSize(S.n, S.nc + 1); },
  cMinus() { if (S.nc <= 0) return; if (S.ops.some(o => clbitsOf(o).includes(S.nc - 1))) { toast('бит c' + (S.nc - 1) + ' используется измерением или условием'); return; } setSize(S.n, S.nc - 1); },
  clearBtn() { if (commit(() => { S.ops = []; S.slice = null; S.sel = null; })) toast('схема очищена · ' + MOD + 'Z вернёт'); },
  sliceOff() { S.slice = null; render(); },
  copyCode() { copy(langCode()); },
  ctxDel() {
    if (S.editing) { const B = S.editing; blockOpsToCode(B, B.ops.filter(o => o.id !== S.bsel)); S.bsel = null; render(); return; }
    commit(() => { if (!S.ops.some(o => o.id === S.sel)) return false; S.ops = S.ops.filter(o => o.id !== S.sel); S.sel = null; compact(S.ops); });
  },
  ctxDup() {
    if (S.editing) { const B = S.editing; const o = B.ops.find(x => x.id === S.bsel); if (!o) return; const c = Object.assign({}, o, { id: nid(), col: o.col + 1 }); const ops = B.ops.map(x => Object.assign({}, x)); placeOp(ops, c); ops.push(c); S.bsel = c.id; blockOpsToCode(B, ops); render(); return; }
    commit(() => { const o = S.ops.find(x => x.id === S.sel); if (!o) return false; const c = JSON.parse(JSON.stringify(o)); c.id = nid(); c.col = o.col + spanOf(o); placeOp(S.ops, c); S.ops.push(c); S.sel = c.id; });
  },
  ctxCtrl() { editSel((o, n) => { const free = nearest(o.q[0], n, 1, o.q.concat(o.c))[0]; if (free === undefined) throw new Error('нет свободного кубита для управления'); if (CTRL_UP[o.g]) o.g = CTRL_UP[o.g]; else if (!['CX', 'CZ', 'CP'].includes(o.g)) throw new Error('у ' + lab(o.g) + ' может быть только один управляющий кубит'); o.c = o.c.concat([free]).sort((a, b) => a - b); }); },
  ctxUnctrl() { editSel(o => { o.c = o.c.slice(0, -1); if (!o.c.length) o.g = CTRL_DOWN[o.g]; }); },
  ctxDec() {
    const o = S.ops.find(x => x.id === S.sel); if (!o) return; const d = decompose(o, allowNow()); if (!d) return;
    commit(() => { const cur = S.ops.find(x => x.id === S.sel); const i = S.ops.indexOf(cur); const c0 = cur.col; S.ops.forEach(x => { if (x !== cur && x.col > c0) x.col += d.ops.length - 1; }); S.ops.splice(i, 1, ...d.ops.map((r, k) => Object.assign({ id: nid(), col: c0 + k }, r))); S.sel = null; });
    toast(d.complete ? 'разложено на ' + d.ops.length + ' ' + plural(d.ops.length, 'гейт', 'гейта', 'гейтов') + (o.c.length ? '' : ' · общая фаза может отличаться') : 'разложено частично: часть гейтов в этот набор не раскладывается');
  },
  ctxInline() { commit(() => { const cur = S.ops.find(x => x.id === S.sel); const B = cur && REG.blocks[cur.name]; if (!B) return false; const inner = layout(expandBlock(B, cur.args).map(x => Object.assign({}, x, { id: nid(), q: x.q.map(k => cur.q[k]), c: x.c.map(k => cur.q[k]) }))); const w = Math.max(1, ...inner.map(x => x.col + 1)); const c0 = cur.col; S.ops.forEach(x => { if (x !== cur && x.col > c0) x.col += w - spanOf(cur); }); inner.forEach(x => { x.col += c0; delete x.ln; if (cur.cond) x.cond = cur.cond; }); S.ops.splice(S.ops.indexOf(cur), 1, ...inner); S.sel = null; compact(S.ops); }); },
  ctxOpen() { const o = S.ops.find(x => x.id === S.sel); if (o && REG.blocks[o.name]) openBlock(o.name); },
  blkBack() { leaveBlock(); },
  blkSave() { if (saveBlock()) { toast('блок «' + S.editing.name + '» сохранён'); render(); } },
  blkInsert() {
    if (!saveBlock()) return; const blk = REG.blocks[S.editing.name]; const k = blk.wires.length;
    if (k > S.n) { toast('блоку нужно ' + k + ' ' + plural(k, 'кубит', 'кубита', 'кубитов') + ', в схеме ' + S.n + ': блок сохранён, но не вставлен'); render(); return; }
    S.editing = null; commit(() => { const args = {}; blk.params.forEach(p => { args[p.name] = evalExpr(p.def, {}); }); const o = { id: nid(), g: 'BLOCK', name: blk.name, q: [...Array(k).keys()], c: [], p: null, args, col: maxCol() + 1, span: 2 }; S.ops.push(o); S.sel = o.id; }); toast('блок вставлен в конец схемы');
  },
  blkDelete() { const name = S.editing.name; confirmWin('удалить блок', 'Блок «' + name + '» будет удалён из проекта. ' + MOD + 'Z вернёт его.', 'удалить', () => { const before = snap(); delete REG.blocks[name]; S.editing = null; pushHistory(before); regenerate(); afterModelChange(); render(); toast('блок удалён'); }); },
  addParam() { const B = S.editing; const blk = B.last; const names = blk.params.map(p => p.name).concat(blk.wires); let nm = 'phi', k = 2; while (names.includes(nm)) nm = 'phi' + (k++); setBlockHead(B, blk.wires, blk.params.concat([{ name: nm, def: '0' }])); render(); toast('параметр ' + nm + ' добавлен: впишите его имя в поле «угол» гейта'); },
  bqPlus() { const B = S.editing; const blk = B.last; if (blk.wires.length >= MAXQ) return; const w = 'abcdefghjkmn'.split('').find(x => !blk.wires.includes(x) && !blk.params.some(p => p.name === x)); setBlockHead(B, blk.wires.concat([w]), blk.params); render(); },
  bqMinus() { const B = S.editing; const blk = B.last; if (blk.wires.length <= 1) return; const last = blk.wires.length - 1; if ((B.ops || []).some(o => o.q.concat(o.c).includes(last))) { toast('на проводе ' + blk.wires[last] + ' есть гейты'); return; } setBlockHead(B, blk.wires.slice(0, -1), blk.params); render(); },
  projBtn() { S.drawer === 'projects' ? closeDrawer() : openDrawer('projects'); },
  expBtn(t) { menu(t.closest('#expBtn'), [{ t: 'копировать как Qiskit' }, { t: 'копировать как OpenQASM 3' }, { t: 'скачать SVG схемы' }, '-', { t: 'все форматы…', k: MOD + 'E' }], (it, i) => { if (i === 0) copy(S.goodText); if (i === 1) copy(genQasm(S)); if (i === 2) download(fileBase() + '.svg', exportSVG(), 'image/svg+xml'); if (i === 4) exportWin(); }); },
  runSetBtn(t) { runWin(t.closest('#runSetBtn')); }, shareBtn(t) { shareWin(t.closest('#shareBtn')); }, runBtn: runNow, submitBtn: submitTask, keysBtn: keysWin, keysHint: keysWin,
  themeBtn() { const next = curTheme() === 'dark' ? 'light' : 'dark'; document.documentElement.dataset.theme = next; try { storage && storage.setItem('sparq.sandbox.theme', next); } catch (e) { /* не критично */ } paintTheme(); },
  setBtn(t) { const keys = Object.keys(SETS); menu(t.closest('#setBtn'), keys.map(k => ({ t: SETS[k].name, d: SETS[k].d, on: S.set === k })), (it, i) => { S.set = keys[i]; render(); const bad = violations(S, allowNow()).length; if (bad) toast(bad + ' ' + plural(bad, 'гейт не входит', 'гейта не входят', 'гейтов не входят') + ' в набор: они подсвечены, их можно разложить из панели гейта'); }); },
  useNoise() { setNoise(S.run.noise === 'none' ? 'depol' : 'none'); renderBars(); renderResults(); paintIcons(); toast('следующий запуск: ' + NOISE_NAME[S.run.noise]); },
};
/** Изменить выбранный гейт (на основной схеме или в редакторе блока). */
function editSel(fn) {
  if (S.editing) { const B = S.editing; const ops = B.ops.map(o => Object.assign({}, o, { q: o.q.slice(), c: o.c.slice() })); const o = ops.find(x => x.id === S.bsel); if (!o) return; try { fn(o, B.last.wires.length); } catch (e) { toast(e.message); return; } placeOp(ops, o); compact(ops); blockOpsToCode(B, ops); render(); return; }
  commit(() => { const o = S.ops.find(x => x.id === S.sel); if (!o) return false; fn(o, S.n); placeOp(S.ops, o); compact(S.ops); });
}
/** Сменить число кубитов и битов. Если код не трогали руками, цикл for в нём сохраняется. */
function setSize(n, nc) {
  const before = snap(); const re = /^(\s*qc\s*=\s*QuantumCircuit\()[^)]*(\).*)$/m;
  if (S.codeState === 'ok' && re.test(S.goodText)) { try { loadCode(S.goodText.replace(re, `$1${n}${nc ? ', ' + nc : ''}$2`)); pushHistory(before); afterModelChange(); render(); return; } catch (e) { /* ниже — общий путь */ } }
  commit(() => { S.n = n; S.nc = nc; });
}
document.addEventListener('click', e => {
  const t = e.target;
  const R = t.closest('#rail button'); if (R) { const r = R.dataset.r; if (r === 'gates') { S.leftOpen = S.drawer || S.editing ? true : !S.leftOpen; closeDrawer(); renderBars(); } else S.drawer === r ? closeDrawer() : openDrawer(r); return; }
  if (t.closest('#dscrim') || t.closest('#drawerX')) { closeDrawer(); return; }
  const blkTabB = t.closest('#blkTabs button'); if (blkTabB) { blkTab = blkTabB.dataset.v; renderDrawer(); return; }
  const bi = t.closest('[data-blk]'); if (bi) { const n = bi.dataset.blk; if (bi.dataset.tpl && !REG.blocks[n]) openBlock(n, TEMPLATES[n]); else openBlock(n); return; }
  const pr = t.closest('[data-pren]'); if (pr) { renameProject(pr.dataset.pren, pr); return; }
  const pd = t.closest('[data-pdel]'); if (pd) { const p = STORE.projects.find(x => x.id === pd.dataset.pdel); confirmWin('удалить проект', 'Проект «' + p.name + '» и его версии будут удалены из этого браузера. Отменить это нельзя.', 'удалить', () => { STORE.projects = STORE.projects.filter(x => x.id !== p.id); if (STORE.cur === p.id) { STORE.cur = null; if (STORE.projects.length) openProject(STORE.projects[0].id, true); else newProject(EXAMPLES[0].name, EXAMPLES[0].code, {}, true); } else saveNow(); openDrawer('projects'); toast('проект удалён'); }); return; }
  const pi = t.closest('[data-proj]'); if (pi) { openProject(pi.dataset.proj); return; }
  const ex = t.closest('[data-ex]'); if (ex) { const x = EXAMPLES[+ex.dataset.ex]; newProject(x.name, x.code, {}, true); toast('пример «' + x.name + '» открыт как новый проект'); return; }
  const vi = t.closest('[data-ver]'); if (vi) { const v = project().versions[+vi.dataset.ver]; const before = snap(); try { REG.blocks = {}; Object.values(v.blocks || {}).forEach(c => { const b = blockFromCode(c); REG.blocks[b.name] = b; }); loadCode(v.code); pushHistory(before); afterModelChange(); } catch (err) { restore(before); toast('версию не удалось открыть: ' + err.message); } closeDrawer(); render(); toast('версия восстановлена · ' + MOD + 'Z вернёт как было'); return; }
  const br = t.closest('[data-br]'); if (br) { S.branch = +br.dataset.br; renderResults(); paintIcons(); return; }
  const btn = t.closest('button[id]'); if (btn && !btn.disabled && ACTIONS[btn.id]) { ACTIONS[btn.id](t); return; }
  const seg = t.closest('#modeSeg button'); if (seg) { S.mode = seg.dataset.v; render(); return; }
  const lg = t.closest('#langSeg button'); if (lg) { S.lang = lg.dataset.v; renderCenter(); paintIcons(); return; }
  const tb = t.closest('.tabs button'); if (tb) { S.view = tb.dataset.v; renderResults(); paintIcons(); return; }
  const ss = t.closest('#sliceSeg button'); if (ss && !ss.disabled) { if (ss.dataset.v === 'all') S.slice = null; else if (S.slice == null) S.slice = Math.max(0, maxCol()); render(); return; }
  const pm = t.closest('#pmSeg button'); if (pm) { S.probsMode = pm.dataset.v; renderResults(); paintIcons(); return; }
  const mm = t.closest('#mmSeg button'); if (mm) { S.matMode = mm.dataset.v; renderResults(); paintIcons(); return; }
  const mp = t.closest('#mpSeg button'); if (mp) { S.matPart = mp.dataset.v; renderResults(); paintIcons(); return; }
  const bq = t.closest('#bqSeg button,[data-bq]'); if (bq) { S.blochQ = +(bq.dataset.v ?? bq.dataset.bq); renderResults(); paintIcons(); return; }
  const bt = t.closest('#blkTab button'); if (bt) { S.blockTab = bt.dataset.v; S.bsel = null; renderCenter(); paintIcons(); }
});
function renameProject(id, anchor) {
  const p = STORE.projects.find(x => x.id === id);
  const w = win('переименовать проект', `<input class="field" id="renIn" value="${esc(p.name)}" maxlength="60" aria-label="имя проекта"><div class="row" style="justify-content:flex-end"><button class="btn sm primary" id="renOk">сохранить</button></div>`, { anchor, w: 320 });
  const ok = () => { const v = $('#renIn').value.trim(); if (!v) { toast('имя не может быть пустым'); return; } if (STORE.projects.some(x => x !== p && x.name === v)) { toast('проект с таким именем уже есть'); return; } p.name = v; closeLayer(); saveNow(); renderDrawer(); renderBars(); paintIcons(); };
  w.querySelector('#renOk').onclick = ok; const inp = w.querySelector('#renIn'); inp.focus(); inp.select(); inp.addEventListener('keydown', e => { if (e.key === 'Enter') ok(); });
}
document.addEventListener('input', e => {
  const t = e.target;
  if (t.dataset.nz) { S.noise[t.dataset.nz] = +t.value; t.previousElementSibling.lastElementChild.textContent = String(t.value).replace('.', ',') + '%'; clearTimeout(t._t); t._t = setTimeout(() => { const k = t.dataset.nz; renderResults(); paintIcons(); const again = document.querySelector(`[data-nz="${k}"]`); if (again) again.focus(); }, 150); }
});
const parseAngle = (v, allowName) => { v = v.replace(/π/g, 'pi').replace(/(\d)\s*pi/g, '$1*pi'); try { const x = evalExpr(v, {}); if (typeof x !== 'number' || !isFinite(x)) throw new Error(); return x; } catch (e) { if (allowName && /^[A-Za-z_]\w*$/.test(v.trim())) return v.trim(); throw new Error(allowName ? 'угол: число, выражение с pi или имя параметра блока' : 'угол: число или выражение, например pi/4 или 2*acos(1/sqrt(3))'); } };
document.addEventListener('change', e => {
  const t = e.target;
  if (t.id === 'nzModel') { setNoise(t.value); renderBars(); renderResults(); paintIcons(); return; }
  if (t.id === 'angIn') {
    const inB = !!t.closest('#bbody'); let val; try { val = parseAngle(t.value, inB); } catch (err) { toast(err.message); return; }
    if (inB) { const B = S.editing; const ops = B.ops.map(o => Object.assign({}, o)); const o = ops.find(x => x.id === S.bsel); if (!o) return; o.p = val; if (typeof val === 'string' && !B.last.params.some(p => p.name === val)) { if (B.last.wires.includes(val)) { toast(val + ' — имя провода, а не параметра'); return; } setBlockHead(B, B.last.wires, B.last.params.concat([{ name: val, def: '0' }])); B.last = blockFromCode(B.code); } blockOpsToCode(B, ops); render(); return; }
    commit(() => { const o = S.ops.find(x => x.id === S.sel); if (!o || o.p === val) return false; o.p = val; o.px = t.value.trim().replace(/π/g, 'pi'); }); return;
  }
  if (t.dataset.arg) { let v; try { v = parseAngle(t.value, false); } catch (err) { toast(err.message); return; } commit(() => { const o = S.ops.find(x => x.id === S.sel); if (!o) return false; o.args[t.dataset.arg] = v; }); return; }
  if (t.dataset.barg) { let v; try { v = parseAngle(t.value, false); } catch (err) { toast(err.message); return; } S.editing.args[t.dataset.barg] = v; render(); return; }
  if (t.dataset.role) {
    const role = t.dataset.role; const v = +t.value;
    editSel(o => { const key = role[0] === 'c' ? 'c' : 'q'; const k = +role.slice(1); const old = o[key][k]; ['q', 'c'].forEach(kk => { o[kk] = o[kk].map(w => w === v ? old : w); }); o[key][k] = v; if (o.g !== 'SWAP') o.c.sort((a, b) => a - b); else o.q.sort((a, b) => a - b); });
    return;
  }
  if (t.id === 'cbSel') { commit(() => { const o = S.ops.find(x => x.id === S.sel); if (!o) return false; o.cb = +t.value; }); return; }
  if (t.id === 'condSel') { commit(() => { const o = S.ops.find(x => x.id === S.sel); if (!o) return false; if (t.value) { const [b, v] = t.value.split(':').map(Number); o.cond = { bit: b, val: v }; } else delete o.cond; S.ops = layoutKeep(S.ops); }); return; }
  if (t.id === 'bName') { const B = S.editing; const nm = t.value.trim(); if (!/^[A-Za-z_]\w*$/.test(nm)) { toast('имя блока: латиница, цифры и _, не с цифры'); t.value = B.last ? B.last.name : B.name; return; } if (nm !== B.name && REG.blocks[nm]) { toast('блок с именем ' + nm + ' уже есть'); t.value = B.last ? B.last.name : B.name; return; } B.code = B.code.replace(/^def\s+\w+/, 'def ' + nm); render(); }
});
/** Если условный гейт оказался раньше измерения своего бита, сдвинуть его правее. */
function layoutKeep(ops) {
  sorted(ops).forEach(o => { if (!o.cond) return; const w = ops.filter(x => x.g === 'M' && x.cb === o.cond.bit).map(x => x.col); if (w.length && o.col <= Math.min(...w)) { o.col = Math.min(...w) + 1; placeOp(ops, o); } });
  return ops;
}
document.addEventListener('keydown', e => {
  const ae = document.activeElement; const typing = /INPUT|TEXTAREA|SELECT/.test(ae.tagName); const mod = e.metaKey || e.ctrlKey; const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
  if (key === 'Escape') { if ($('#layer').firstChild) { closeLayer(); return; } if (S.drawer) { closeDrawer(); return; } if (S.armed) { S.armed = null; renderPalette(); paintIcons(); return; } if (typing) { ae.blur(); return; } if (S.sel != null || S.bsel != null) { S.sel = null; S.bsel = null; renderCenter(); paintIcons(); } return; }
  if ((key === 'Enter' || key === ' ') && ae.classList && ae.classList.contains('tile') && !ae.classList.contains('off')) { e.preventDefault(); armTile(ae); const again = document.querySelector(`.tile[data-${ae.dataset.b ? 'b' : 'g'}="${ae.dataset.b || ae.dataset.g}"]`); if (again) again.focus(); return; }
  if (mod && key === 'Enter') { e.preventDefault(); if (codeTimer && ae.id === 'codeTa') { clearTimeout(codeTimer); applyCode(); } runNow(); return; }
  if (mod && key === 's') { e.preventDefault(); if (S.editing) ACTIONS.blkSave(); else saveVersion(); return; }
  if (mod && key === 'e') { e.preventDefault(); exportWin(); return; }
  if (mod && key === 'b') { e.preventDefault(); S.leftOpen = !S.leftOpen; renderBars(); return; }
  if (mod && key === 'j') { e.preventDefault(); S.mode = S.mode === 'circ' ? 'split' : 'circ'; render(); return; }
  if (mod && key === '\\') { e.preventDefault(); S.rightOpen = !S.rightOpen; renderBars(); return; }
  if (typing || $('#layer').firstChild) return;
  if (mod && key === 'z') { e.preventDefault(); e.shiftKey ? redo() : undo(); return; }
  if (mod && key === 'y') { e.preventDefault(); redo(); return; }
  if (mod || e.altKey) return;
  if ((key === 'Delete' || key === 'Backspace') && (S.sel != null || S.bsel != null)) { e.preventDefault(); ACTIONS.ctxDel(); return; }
  if ((key === 'ArrowRight' || key === 'ArrowLeft') && !S.editing && !ae.closest('.seg,.tabs,.rail')) { const mc = maxCol(); if (mc < 0) return; e.preventDefault(); const s = S.slice == null ? (key === 'ArrowLeft' ? mc : 0) : S.slice + (key === 'ArrowRight' ? 1 : -1); S.slice = Math.max(0, Math.min(mc, s)); render(); return; }
  if (e.key === '?') keysWin();
});
// разделитель схемы и кода: доля высоты хранится в состоянии и переживает перерисовку
document.addEventListener('pointerdown', e => {
  const sp = e.target.closest('#splitter'); if (!sp) return; const cv = $('#canvasP'), cd = $('#codeP'); const sy = e.clientY, h1 = cv.offsetHeight, tot = h1 + cd.offsetHeight; sp.setPointerCapture(e.pointerId); e.preventDefault();
  const mv = ev => { const a = Math.min(tot - 64, Math.max(160, h1 + ev.clientY - sy)); S.split = a / tot; cv.style.flex = `${S.split} 1 0px`; cd.style.flex = `${1 - S.split} 1 0px`; };
  const up = () => { sp.removeEventListener('pointermove', mv); sp.removeEventListener('pointerup', up); sp.removeEventListener('pointercancel', up); }; sp.addEventListener('pointermove', mv); sp.addEventListener('pointerup', up); sp.addEventListener('pointercancel', up);
});
// клик мимо меню или немодального окна закрывает его
document.addEventListener('pointerdown', e => { if (!$('#layer').firstChild || document.querySelector('.modal-scrim')) return; if (!e.target.closest('.menu,.win,.btn.open,#expBtn,#runSetBtn,#shareBtn,#setBtn,[data-pren]')) closeLayer(); }, true);
window.addEventListener('beforeunload', () => { if (S.saved === 'pending') saveNow(); });
window.addEventListener('message', e => {
  const d = e.data; if (!d || typeof d !== 'object') return;
  if (d.type === 'sparq:task' && d.task) { startTask(d.task, e.origin); render(); }
  if (d.type === 'sparq:verdict' && TASK) toast('вердикт: ' + String(d.verdict || '').slice(0, 120));
});
const curTheme = () => document.documentElement.dataset.theme || (matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
function paintTheme() { $('#themeBtn').innerHTML = svgI(curTheme() === 'dark' ? 'sun' : 'moon'); $('#themeBtn').title = curTheme() === 'dark' ? 'светлая тема' : 'тёмная тема'; }

// ───────── старт ─────────
/** Включить режим задачи: число кубитов, набор гейтов и лимиты задаёт контракт. */
function startTask(task, origin) {
  TASK = Object.assign({}, task, { origin: origin && origin !== 'null' ? origin : null });
  const blank = `from qiskit import QuantumCircuit\nfrom math import pi\n\nqc = QuantumCircuit(${TASK.qubits || 2}${TASK.clbits ? ', ' + TASK.clbits : ''})\n`;
  let draft = null; try { draft = storage && JSON.parse(storage.getItem(taskKey()) || 'null'); } catch (e) { draft = null; }
  REG.blocks = {}; S.history = []; S.future = []; S.runRes = null; S.slice = null;
  try { if (draft) { Object.values(draft.blocks || {}).forEach(c => { const b = blockFromCode(c); REG.blocks[b.name] = b; }); loadCode(draft.code); } else loadCode(TASK.initial || blank); }
  catch (e) { REG.blocks = {}; loadCode(blank); }
  if (TASK.qubits && S.n !== TASK.qubits) loadCode(blank);
  S.rev++; S.saved = 'ok'; S.loaded = true;
}
function boot() {
  ['undoBtn', 'redoBtn', 'shareBtn', 'keysBtn', 'palClose', 'resClose'].forEach(i => { $('#' + i).innerHTML = svgI({ undoBtn: 'undo', redoBtn: 'redo', shareBtn: 'share', keysBtn: 'keyboard', palClose: 'panel', resClose: 'panelr' }[i]); });
  $('#undoBtn').title = 'отменить · ' + MOD + 'Z'; $('#redoBtn').title = 'повторить · ' + MOD + (isMac ? '⇧Z' : 'Y'); $('#runKbd').textContent = MOD + '↵';
  try { const th = storage && storage.getItem('sparq.sandbox.theme'); if (th) document.documentElement.dataset.theme = th; } catch (e) { /* тема по системе */ }
  if (EMBED) document.body.classList.add('embed');
  paintTheme(); loadStore();
  const qs = new URLSearchParams(location.search); const hash = location.hash.match(/^#c=(.+)$/);
  if (qs.get('task')) {
    let task = null; try { task = qs.get('task') === 'demo' ? DEMO_TASK : JSON.parse(b64.dec(qs.get('task'))); } catch (e) { task = null; }
    if (task && task.id) startTask(task, null); else toast('не удалось прочитать задачу из адреса: открыта обычная песочница');
  }
  if (!TASK) {
    let shared = null; if (hash) { try { shared = JSON.parse(b64.dec(hash[1])); parseProgram(shared.c, Object.fromEntries(Object.values(shared.b || {}).map(c => { const b = blockFromCode(c); return [b.name, b]; }))); } catch (e) { shared = null; toast('ссылка повреждена: схему из неё открыть не удалось'); } }
    if (shared) { newProject(String(shared.n || 'схема по ссылке').slice(0, 60), shared.c, shared.b || {}, true); history.replaceState(null, '', location.pathname + location.search); toast('схема из ссылки открыта как новый проект'); }
    else if (STORE.projects.length && STORE.projects.some(p => p.id === STORE.cur)) openProject(STORE.cur, true);
    else if (STORE.projects.length) openProject(STORE.projects[0].id, true);
    else newProject(EXAMPLES[0].name, EXAMPLES[0].code, {}, true);
  }
  render();
}
boot();
