// Лёгкий редактор кода: textarea поверх подсвеченного <pre>, нумерация строк, маркер ошибки.
import { esc } from './dom.js';

const KW = new Set(['def', 'return', 'for', 'while', 'if', 'elif', 'else', 'pass', 'break', 'continue', 'import', 'from', 'as', 'and', 'or', 'not', 'in', 'is', 'True', 'False', 'None']);

export function highlight(src) {
  let out = '', i = 0;
  const n = src.length;
  while (i < n) {
    const ch = src[i];
    if (ch === '#') { let j = src.indexOf('\n', i); if (j < 0) j = n; out += `<span class="tok-c">${esc(src.slice(i, j))}</span>`; i = j; continue; }
    if (ch === '"' || ch === "'") {
      let j = i + 1; while (j < n && src[j] !== ch && src[j] !== '\n') { if (src[j] === '\\') j++; j++; }
      out += `<span class="tok-s">${esc(src.slice(i, j + 1))}</span>`; i = j + 1; continue;
    }
    if (/[0-9]/.test(ch)) { const m = /^\d[\d_]*\.?\d*(e[+-]?\d+)?/i.exec(src.slice(i)); out += `<span class="tok-n">${esc(m[0])}</span>`; i += m[0].length; continue; }
    if (/[A-Za-z_]/.test(ch)) {
      const m = /^[A-Za-z_]\w*/.exec(src.slice(i))[0];
      const next = src[i + m.length];
      if (KW.has(m)) out += `<span class="tok-k">${m}</span>`;
      else if (next === '(') out += `<span class="tok-f">${m}</span>`;
      else out += esc(m);
      i += m.length; continue;
    }
    out += esc(ch); i++;
  }
  return out;
}

export class CodeEditor {
  constructor(root, { value = '', onChange } = {}) {
    this.root = root; this.onChange = onChange; this.error = null;
    root.classList.add('code-editor');
    root.innerHTML = `<div class="code-gutter" aria-hidden="true"></div><div class="code-area"><div class="errline" hidden></div><pre aria-hidden="true"></pre><textarea spellcheck="false" autocapitalize="off" autocomplete="off" aria-label="код решения"></textarea></div>`;
    this.gutter = root.querySelector('.code-gutter'); this.pre = root.querySelector('pre'); this.ta = root.querySelector('textarea'); this.errLine = root.querySelector('.errline');
    this.ta.value = value;
    this.ta.addEventListener('input', () => { this.paint(); this.onChange && this.onChange(this.ta.value); });
    this.ta.addEventListener('keydown', (e) => this.onKey(e));
    this.ta.addEventListener('scroll', () => { /* прокрутка идёт у контейнера */ });
    this.paint();
  }
  get value() { return this.ta.value; }
  set value(v) { this.ta.value = v; this.paint(); }
  setError(err) { this.error = err; this.paint(); }
  focus() { this.ta.focus(); }

  paint() {
    const v = this.ta.value, lines = v.split('\n');
    const errLn = this.error && this.error.line;
    let body = highlight(v);
    // сообщение об ошибке — в конце строки
    if (errLn && errLn <= lines.length) {
      const parts = body.split('\n');
      parts[errLn - 1] += `<span class="errmsg">${esc(this.error.kind)}: ${esc(this.error.msg)}</span>`;
      body = parts.join('\n');
    }
    this.pre.innerHTML = body + '\n';
    this.gutter.innerHTML = lines.map((_, i) => `<div class="${errLn === i + 1 ? 'err' : ''}">${i + 1}</div>`).join('');
    this.ta.style.height = this.pre.offsetHeight + 'px';
    if (errLn) { this.errLine.hidden = false; this.errLine.style.top = (18 + (errLn - 1) * 24) + 'px'; } else this.errLine.hidden = true;
  }

  onKey(e) {
    const ta = this.ta;
    if (e.key === 'Tab') {
      e.preventDefault();
      const s = ta.selectionStart, en = ta.selectionEnd;
      ta.setRangeText('    ', s, en, 'end'); ta.dispatchEvent(new Event('input'));
    } else if (e.key === 'Enter') {
      const s = ta.selectionStart, before = ta.value.slice(0, s), line = before.slice(before.lastIndexOf('\n') + 1);
      let indent = /^ */.exec(line)[0];
      if (/:\s*$/.test(line)) indent += '    ';
      e.preventDefault(); ta.setRangeText('\n' + indent, s, ta.selectionEnd, 'end'); ta.dispatchEvent(new Event('input'));
    }
  }
}
