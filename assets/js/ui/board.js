// Доска схемы (SVG): отрисовка, перетаскивание гейтов, выбор столбца, диски вероятностей.
import { Circuit, involved, span, newId, edgeSet } from '../quantum/circuit.js';
import { GATES, displayName } from '../quantum/gates.js';
import { blochOf } from '../quantum/sim.js';
import { angleToStr } from '../lang/qiskitlite.js';
import { esc } from './dom.js';

const DENSITY = {
  task: { colW: 100, rowH: 96, tile: 44, top: 44, label: 112, disk: 190, cellShow: true },
  sandbox: { colW: 76, rowH: 72, tile: 44, top: 44, label: 112, disk: 150, cellShow: false },
  mini: { colW: 84, rowH: 80, tile: 40, top: 36, label: 76, disk: 150, cellShow: false },
  preview: { colW: 52, rowH: 44, tile: 32, top: 26, label: 62, disk: 128, cellShow: false },
};

export const PI_TEXT = (th) => angleToStr(th).replace(/\*/g, '·').replace(/pi/g, 'π');

const ANGLE_GATES = new Set(['P', 'RX', 'RY', 'RZ']);

export class Board {
  constructor(root, opts = {}) {
    this.root = root;
    this.o = Object.assign({ density: 'task', circuit: new Circuit(2), cols: 4, readOnly: false, coupling: null, wireInit: null, wireNames: null, onChange: null, onSelect: null, state: null, showDisks: true, allowAddQubit: false, maxQubits: 8, minQubits: 1, fixedQubits: true, highlightOps: null, errorOps: null, interactiveDisks: false }, opts);
    this.d = DENSITY[this.o.density];
    this.selected = null;        // id операции
    this.hoverCol = null;
    this.drag = null;
    this.circuit = this.o.circuit;
    this.state = this.o.state;   // State | null
    this.stepFilter = null;      // режим «по шагам»: показывать операции до индекса
    root.classList.add('board');
    root.addEventListener('pointerdown', (e) => this.onPointerDown(e));
    root.addEventListener('contextmenu', (e) => this.onContext(e));
    this.render();
  }

  setCircuit(c) { this.circuit = c; this.render(); }
  setState(s) { this.state = s; this.renderDisks(); }
  select(id) { this.selected = id; this.render(); this.o.onSelect && this.o.onSelect(id ? this.circuit.ops.find((o) => o.id === id) : null); }

  get n() { return this.circuit.n; }
  get cols() {
    const used = this.circuit.columnCount();
    return Math.max(this.o.cols, this.o.density === 'sandbox' ? Math.max(6, used + 1) : used + (this.o.fixedCols ? 0 : 1), 1);
  }

  geom() {
    const d = this.d, cols = this.cols, n = this.n;
    return {
      cols, n, W: d.label + cols * d.colW + (this.o.showDisks ? d.disk : 28), H: d.top + n * d.rowH + (this.o.allowAddQubit ? 56 : 12),
      x: (c) => d.label + d.colW * (c + 0.5), y: (r) => d.top + d.rowH * (r + 0.5), wireStart: d.label - 20, wireEnd: d.label + cols * d.colW + 8,
    };
  }

  qLabel(i) { return (this.o.wireNames && this.o.wireNames[i]) || 'q' + i; }

  // ---------- Рендер ----------

  render() {
    const g = this.geom(), d = this.d;
    const parts = [];
    // столбцы
    for (let c = 0; c < g.cols; c++) {
      const sel = this.hoverCol === c || (this.selectedOp() && this.selectedOp().col === c);
      if (sel) parts.push(`<rect class="colhl" x="${g.x(c) - d.colW / 2 + 8}" y="${d.top - 8}" width="${d.colW - 16}" height="${g.n * d.rowH + 8}" rx="12"/>`);
      parts.push(`<text class="clabel ${sel ? 'on' : ''}" x="${g.x(c)}" y="${d.top - 20}" text-anchor="middle">t${c + 1}</text>`);
    }
    // провода
    for (let r = 0; r < g.n; r++) {
      parts.push(`<line class="wire" x1="${g.wireStart + 30}" x2="${g.wireEnd}" y1="${g.y(r)}" y2="${g.y(r)}"/>`);
      const init = this.o.wireInit ? this.o.wireInit[r] : '0';
      const ket = init === '0' || init === '1' ? `|${init}⟩` : `|${init}⟩`;
      const nx = Math.round(d.label * 0.5);
      parts.push(`<text class="qlabel" x="${nx}" y="${g.y(r) + 5}" text-anchor="end">${esc(this.qLabel(r))}</text><text class="qket" x="${nx + 8}" y="${g.y(r) + 5}">${esc(ket)}</text>`);
    }
    // пустые клетки
    if (d.cellShow || this.drag) {
      for (let c = 0; c < g.cols; c++) for (let r = 0; r < g.n; r++) {
        if (this.cellFree(c, r)) parts.push(`<rect class="cell ${this.drag && this.drag.target && this.drag.target.c === c && this.drag.target.r === r ? 'over' : ''}" x="${g.x(c) - 20}" y="${g.y(r) - 20}" width="40" height="40" rx="8"/>`);
      }
    }
    // зоны попадания
    for (let c = 0; c < g.cols; c++) for (let r = 0; r < g.n; r++) parts.push(`<rect class="hit" data-c="${c}" data-r="${r}" x="${g.x(c) - d.colW / 2}" y="${g.y(r) - d.rowH / 2}" width="${d.colW}" height="${d.rowH}"/>`);
    // операции
    const ops = this.visibleOps();
    for (const op of ops) parts.push(this.opSvg(op, g));
    // диски
    parts.push('<g class="disks"></g>');
    if (this.o.allowAddQubit && !this.o.readOnly) {
      const y = d.top + g.n * d.rowH + 20;
      parts.push(`<g class="addq ${g.n >= this.o.maxQubits ? 'off' : ''}" data-addq transform="translate(${g.x(Math.floor(g.cols / 2) - 0.5)},${y})"><rect x="-56" y="-18" width="112" height="36" rx="10" fill="transparent"/><text x="0" y="5" text-anchor="middle">+ кубит</text></g>`);
    }
    this.root.innerHTML = `<svg class="boardsvg" viewBox="0 0 ${g.W} ${g.H}" width="${g.W}" height="${g.H}" role="img" aria-label="схема из ${g.n} кубитов">${parts.join('')}</svg>`;
    this.svg = this.root.firstElementChild;
    this.renderDisks();
    this.root.style.setProperty('--bw', g.W + 'px');
  }

  visibleOps() { return this.circuit.ops; }
  selectedOp() { return this.selected ? this.circuit.ops.find((o) => o.id === this.selected) : null; }

  cellFree(c, r) {
    return !this.circuit.ops.some((o) => { if (o.col !== c) return false; const [a, b] = span(o); return r >= a && r <= b; });
  }

  opSvg(op, g) {
    const d = this.d, x = g.x(op.col), t = d.tile;
    const sel = this.selected === op.id, err = this.o.errorOps && this.o.errorOps.has(op.id);
    const future = this.stepFilter != null && op.col > this.stepFilter;
    const cls = `op ${sel ? 'sel' : ''} ${err ? 'err' : ''} ${future ? 'future' : ''} ${this.o.highlightOps && this.o.highlightOps.has(op.id) ? 'hl' : ''}`;
    const out = [];
    const ctrls = op.c || [];
    const qs = involved(op);
    const lo = Math.min(...qs), hi = Math.max(...qs);
    const attrs = `class="${cls}" data-op="${op.id}"`;
    if (op.g === 'ORACLE') {
      const [a, b] = span(op);
      return `<g ${attrs}><rect class="oracle" x="${x - t / 2}" y="${g.y(a) - t / 2}" width="${t}" height="${g.y(b) - g.y(a) + t}" rx="9"/><text class="glabel" x="${x}" y="${(g.y(a) + g.y(b)) / 2 + 5}" text-anchor="middle">O</text></g>`;
    }
    if (hi > lo) out.push(`<line class="conn" x1="${x}" x2="${x}" y1="${g.y(lo)}" y2="${g.y(hi)}"/>`);
    for (const c of ctrls) out.push(`<circle class="ctrl" data-ctrl="${c}" cx="${x}" cy="${g.y(c)}" r="5.5"/>`);
    const T = op.t;
    if (op.g === 'X') {
      for (const q of T) {
        if (ctrls.length === 0) out.push(this.tile(x, g.y(q), 'X'));
        else out.push(`<circle class="tgt" cx="${x}" cy="${g.y(q)}" r="13"/><line class="tgtx" x1="${x - 13}" x2="${x + 13}" y1="${g.y(q)}" y2="${g.y(q)}"/><line class="tgtx" x1="${x}" x2="${x}" y1="${g.y(q) - 13}" y2="${g.y(q) + 13}"/>`);
      }
    } else if (op.g === 'Z' && ctrls.length > 0) {
      for (const q of T) out.push(`<circle class="ctrl" cx="${x}" cy="${g.y(q)}" r="5.5"/>`);
    } else if (op.g === 'SWAP') {
      for (const q of T) out.push(`<g class="swapx"><line x1="${x - 8}" x2="${x + 8}" y1="${g.y(q) - 8}" y2="${g.y(q) + 8}"/><line x1="${x - 8}" x2="${x + 8}" y1="${g.y(q) + 8}" y2="${g.y(q) - 8}"/></g>`);
      if (T.length === 2) out.push(`<line class="conn" x1="${x}" x2="${x}" y1="${g.y(Math.min(...T))}" y2="${g.y(Math.max(...T))}"/>`);
    } else if (op.g === 'M') {
      out.push(this.tile(x, g.y(T[0]), 'M'));
    } else if (op.g === 'RESET') {
      out.push(this.tile(x, g.y(T[0]), '|0⟩'));
    } else {
      const lab = GATES[op.g].label;
      out.push(this.tile(x, g.y(T[0]), lab, ANGLE_GATES.has(op.g) && op.p.length ? PI_TEXT(op.p[0]) : null));
    }
    // невидимая зона для клика по линии соединения
    const hitY = g.y(lo) - 16, hitH = g.y(hi) - g.y(lo) + 32;
    return `<g ${attrs}><rect class="ophit" x="${x - t / 2}" y="${hitY}" width="${t}" height="${hitH}" fill="transparent"/>${out.join('')}</g>`;
  }

  tile(x, y, label, sub = null) {
    const t = this.d.tile;
    return `<rect class="tile" x="${x - t / 2}" y="${y - t / 2}" width="${t}" height="${t}" rx="9"/><text class="glabel" x="${x}" y="${y + (sub ? 1 : 5)}" text-anchor="middle">${esc(label)}</text>${sub ? `<text class="gsub" x="${x}" y="${y + 13}" text-anchor="middle">${esc(sub)}</text>` : ''}`;
  }

  // ---------- Диски вероятностей ----------

  renderDisks() {
    if (!this.svg || !this.o.showDisks) return;
    const host = this.svg.querySelector('.disks');
    if (!host) return;
    const g = this.geom(), d = this.d;
    const st = this.state;
    const parts = [];
    const cx = g.wireEnd + 36;
    for (let r = 0; r < g.n; r++) {
      let p1 = 0, phase = 0, mixed = false, known = !!st;
      if (st && st.n === g.n) {
        const b = blochOf(st, r);
        p1 = b.p1; mixed = Math.hypot(b.x, b.y, b.z) < 0.995;
        phase = Math.atan2(b.y, b.x); if (Math.hypot(b.x, b.y) < 1e-6) phase = 0;
      }
      const y = g.y(r), R = 15;
      const C = 2 * Math.PI * R, arc = Math.max(0, Math.min(1, p1)) * C;
      parts.push(`<g class="disk" transform="translate(${cx},${y})"><circle r="${R}" class="dtrack"/>`);
      if (known && p1 > 1e-4) parts.push(`<circle r="${R}" class="darc" stroke-dasharray="${arc} ${C}" transform="rotate(-90)"/>`);
      if (mixed) parts.push(`<circle r="8.5" class="dmixed"/>`);
      else if (known) parts.push(`<circle class="dphase" r="3" cx="${(R * Math.sin(phase)).toFixed(2)}" cy="${(-R * Math.cos(phase)).toFixed(2)}"/>`);
      parts.push('</g>');
      parts.push(`<text class="dtext" x="${cx + 28}" y="${y + 4}">P(1) ${known ? Math.round(p1 * 100) : 0} %</text>`);
    }
    host.innerHTML = parts.join('');
  }

  // ---------- Взаимодействие ----------

  point(e) {
    const r = this.svg.getBoundingClientRect(), vb = this.svg.viewBox.baseVal;
    return { x: (e.clientX - r.left) * vb.width / r.width, y: (e.clientY - r.top) * vb.height / r.height };
  }
  cellAt(p) {
    const g = this.geom(), d = this.d;
    const c = Math.floor((p.x - d.label) / d.colW), r = Math.floor((p.y - d.top) / d.rowH);
    if (c < 0 || c >= g.cols || r < 0 || r >= g.n) return null;
    return { c, r };
  }

  onPointerDown(e) {
    if (this.o.readOnly) return;
    const addq = e.target.closest('[data-addq]');
    if (addq) { if (this.n < this.o.maxQubits) this.addQubit(); return; }
    const opEl = e.target.closest('[data-op]');
    if (!opEl) {
      // клик по пустой клетке — установка выбранного гейта палитры
      const cell = this.cellAt(this.point(e));
      if (cell && this.o.armed) { this.place(this.o.armed, cell.c, cell.r); }
      else if (cell) { this.select(null); }
      return;
    }
    const op = this.circuit.ops.find((o) => o.id === +opEl.dataset.op);
    if (!op) return;
    const ctrlEl = e.target.closest('[data-ctrl]');
    const startP = this.point(e);
    this.drag = { kind: ctrlEl ? 'ctrl' : 'op', op, ctrl: ctrlEl ? +ctrlEl.dataset.ctrl : null, startP, moved: false, target: null, pointer: e.pointerId };
    this.root.setPointerCapture(e.pointerId);
    const move = (ev) => this.onDragMove(ev), up = (ev) => { this.root.removeEventListener('pointermove', move); this.root.removeEventListener('pointerup', up); this.root.removeEventListener('pointercancel', up); this.onDragEnd(ev); };
    this.root.addEventListener('pointermove', move); this.root.addEventListener('pointerup', up); this.root.addEventListener('pointercancel', up);
    e.preventDefault();
  }

  onDragMove(e) {
    if (!this.drag) return;
    const p = this.point(e);
    if (!this.drag.moved && Math.hypot(p.x - this.drag.startP.x, p.y - this.drag.startP.y) < 5) return;
    if (!this.drag.moved) { this.drag.moved = true; this.root.classList.add('dragging'); }
    const cell = this.cellAt(p);
    const inside = !!cell && p.x > 0;
    this.drag.target = inside ? cell : null;
    this.drag.outside = !inside;
    this.drag.p = p;
    this.paintDrag();
  }

  paintDrag() {
    const g = this.geom();
    this.svg.querySelectorAll('.cell').forEach((c) => c.classList.remove('over'));
    let ghost = this.svg.querySelector('.ghost');
    if (!ghost) { ghost = document.createElementNS('http://www.w3.org/2000/svg', 'rect'); ghost.setAttribute('class', 'ghost'); ghost.setAttribute('width', 44); ghost.setAttribute('height', 44); ghost.setAttribute('rx', 9); this.svg.append(ghost); }
    if (this.drag.p) { ghost.setAttribute('x', this.drag.p.x - 22); ghost.setAttribute('y', this.drag.p.y - 22); ghost.classList.toggle('del', !!this.drag.outside); }
    const t = this.drag.target;
    if (t) { const hl = this.svg.querySelector(`.hit[data-c="${t.c}"][data-r="${t.r}"]`); this.hoverCol = t.c; }
  }

  onDragEnd() {
    const dr = this.drag; this.drag = null; this.root.classList.remove('dragging');
    const ghost = this.svg && this.svg.querySelector('.ghost'); if (ghost) ghost.remove();
    if (!dr) return;
    if (!dr.moved) { this.select(this.selected === dr.op.id ? null : dr.op.id); return; }
    this.hoverCol = null;
    if (dr.outside) { this.remove(dr.op.id); return; }
    if (!dr.target) { this.render(); return; }
    if (dr.kind === 'ctrl') this.moveControl(dr.op, dr.ctrl, dr.target.r);
    else this.moveOp(dr.op, dr.target.c, dr.target.r);
  }

  onContext(e) {
    const opEl = e.target.closest('[data-op]');
    if (!opEl || this.o.readOnly) return;
    e.preventDefault();
    const op = this.circuit.ops.find((o) => o.id === +opEl.dataset.op);
    this.select(op.id);
    this.o.onContext && this.o.onContext(op, e);
  }

  // ---------- Изменения схемы ----------

  commit(label) { this.o.onChange && this.o.onChange(this.circuit, label); this.render(); }

  // Выбор соседних кубитов для управления (учитывает связность, если она задана).
  pickControls(target, count, col, exclude = []) {
    const edges = this.o.coupling ? edgeSet(this.o.coupling, this.n) : null;
    const cand = [];
    for (let q = 0; q < this.n; q++) if (q !== target && !exclude.includes(q)) cand.push(q);
    cand.sort((a, b) => Math.abs(a - target) - Math.abs(b - target) || a - b);
    const ok = (q) => !edges || edges.has(q + '-' + target);
    const good = cand.filter(ok), rest = cand.filter((q) => !ok(q));
    return [...good, ...rest].slice(0, count);
  }

  place(tile, col, row) {
    if (tile.g === 'ORACLE') return this.placeOracle(tile, col);
    if (!this.cellFreeFor(col, row, tile)) return false;
    const op = { g: tile.g, t: [row], c: [], p: tile.g in { P: 1, RX: 1, RY: 1, RZ: 1 } ? [tile.defaultAngle ?? Math.PI / 2] : [], col };
    if (tile.g === 'M' || tile.g === 'RESET') { /* одиночный */ }
    else if (tile.g === 'SWAP') {
      const other = this.pickControls(row, 1 + tile.nc, col);
      if (other.length < 1 + tile.nc) return false;
      op.t = [row, other[0]].sort((a, b) => a - b); op.c = other.slice(1);
    } else if (tile.nc > 0) {
      const cs = this.pickControls(row, tile.nc, col);
      if (cs.length < tile.nc) return false;
      op.c = cs;
    }
    // освобождаем занятые клетки колонки: если конфликт со span — ищем сдвиг вправо
    let c = col;
    const [a, b] = span(op);
    if (!this.spanFree(c, a, b)) { c = this.nextFreeCol(col, a, b); if (c == null) return false; }
    op.col = c; op.id = newId();
    this.circuit.ops.push(op);
    this.sortOps();
    this.selected = op.id;
    this.o.onSelect && this.o.onSelect(op);
    this.commit('place');
    return true;
  }
  placeOracle(tile, col) {
    const k = tile.arity, t = Array.from({ length: k }, (_, i) => i);
    if (k > this.n) return false;
    let c = col;
    if (!this.spanFree(c, 0, k - 1)) { c = this.nextFreeCol(col, 0, k - 1); if (c == null) return false; }
    const op = { g: 'ORACLE', t, c: [], p: [], col: c, id: newId() };
    this.circuit.ops.push(op); this.sortOps(); this.selected = op.id;
    this.o.onSelect && this.o.onSelect(op); this.commit('oracle');
    return true;
  }
  cellFreeFor(col, row) { return true; }
  spanFree(col, a, b, ignoreId = null) {
    return !this.circuit.ops.some((o) => { if (o.col !== col || o.id === ignoreId) return false; const [x, y] = span(o); return !(y < a || x > b); });
  }
  nextFreeCol(col, a, b, ignoreId = null) {
    for (let c = col; c < col + 12; c++) if (this.spanFree(c, a, b, ignoreId)) return c;
    return null;
  }
  sortOps() { this.circuit.ops.sort((x, y) => (x.col - y.col)); }

  moveOp(op, col, row) {
    const q = involved(op), anchor = op.t[0], dr = row - anchor;
    const newT = op.t.map((x) => x + dr), newC = (op.c || []).map((x) => x + dr);
    const all = [...newT, ...newC];
    if (all.some((x) => x < 0 || x >= this.n)) { this.render(); return; }
    const a = Math.min(...all), b = Math.max(...all);
    if (!this.spanFree(col, a, b, op.id)) { this.render(); return; }
    op.t = newT; op.c = newC; op.col = col;
    this.sortOps(); this.commit('move');
  }
  moveControl(op, from, row) {
    if (row === from) { this.render(); return; }
    if (op.t.includes(row) || (op.c || []).includes(row)) { this.render(); return; }
    const nc = op.c.map((x) => (x === from ? row : x));
    const all = [...op.t, ...nc], a = Math.min(...all), b = Math.max(...all);
    if (!this.spanFree(op.col, a, b, op.id)) { this.render(); return; }
    op.c = nc; this.commit('ctrl');
  }
  remove(id) {
    const i = this.circuit.ops.findIndex((o) => o.id === id);
    if (i < 0) return;
    this.circuit.ops.splice(i, 1);
    if (this.selected === id) { this.selected = null; this.o.onSelect && this.o.onSelect(null); }
    this.commit('remove');
  }
  clear() { this.circuit.ops = []; this.selected = null; this.o.onSelect && this.o.onSelect(null); this.commit('clear'); }
  addQubit() { this.circuit.n += 1; this.commit('qubit+'); }
  removeQubit() {
    if (this.n <= this.o.minQubits) return;
    this.circuit.setQubits(this.n - 1); this.commit('qubit-');
  }
  setColumnHover(c) { if (this.hoverCol !== c) { this.hoverCol = c; this.render(); } }
}
