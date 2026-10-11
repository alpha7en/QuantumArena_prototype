// Тосты, модальные окна и поповеры.
import { esc, html } from './dom.js';
import { icon } from './icons.js';

function toastHost() {
  let h = document.querySelector('.toasts');
  if (!h) { h = document.createElement('div'); h.className = 'toasts'; h.setAttribute('role', 'status'); h.setAttribute('aria-live', 'polite'); document.body.append(h); }
  return h;
}
export function toast({ title, text = '', kind = 'ok', ms = 5000 }) {
  const t = document.createElement('div');
  t.className = 'toast';
  t.innerHTML = `${icon(kind === 'warn' ? 'alert' : kind === 'info' ? 'info' : 'check', kind)}<div><div class="ttl">${esc(title)}</div>${text ? `<div class="sub">${esc(text)}</div>` : ''}</div><button class="icon-btn" style="width:18px;height:18px" aria-label="закрыть">${icon('x', 'sm')}</button>`;
  const close = () => t.remove();
  t.querySelector('button').onclick = close;
  toastHost().append(t);
  if (ms) setTimeout(close, ms);
  return close;
}

let openCount = 0;
export function modal({ title, body = '', actions = [], width, onMount, closable = true }) {
  return new Promise((resolve) => {
    const scrim = document.createElement('div');
    scrim.className = 'scrim';
    const box = document.createElement('div');
    box.className = 'modal'; box.setAttribute('role', 'dialog'); box.setAttribute('aria-modal', 'true');
    if (width) box.style.width = `min(${width}px, 100%)`;
    box.innerHTML = `<div class="modal-head"><h3>${esc(title)}</h3>${closable ? `<button class="icon-btn" data-close aria-label="закрыть">${icon('x')}</button>` : ''}</div>
      <div class="modal-body">${body instanceof Object && 's' in body ? body.s : esc(body)}</div>
      ${actions.length ? `<div class="modal-actions">${actions.map((a, i) => `<button class="btn ${a.kind === 'primary' ? 'btn-primary' : 'btn-outline'} ${a.sm ? 'sm' : ''}" data-i="${i}">${a.icon ? icon(a.icon) : ''}${esc(a.label)}</button>`).join('')}</div>` : ''}`;
    scrim.append(box); document.body.append(scrim);
    const prev = document.activeElement;
    const done = (v) => { scrim.remove(); document.removeEventListener('keydown', onKey); prev && prev.focus && prev.focus(); resolve(v); };
    const onKey = (e) => { if (e.key === 'Escape' && closable) done(null); };
    document.addEventListener('keydown', onKey);
    scrim.addEventListener('mousedown', (e) => { if (e.target === scrim && closable) done(null); });
    box.querySelectorAll('[data-close]').forEach((b) => b.addEventListener('click', () => done(null)));
    box.querySelectorAll('[data-i]').forEach((b) => b.addEventListener('click', () => { const a = actions[+b.dataset.i]; done(a.value !== undefined ? a.value : a.label); }));
    if (onMount) onMount(box, done);
    const first = box.querySelector('input,[data-i].btn-primary,[data-i]'); first && first.focus();
  });
}

export const confirmModal = ({ title, text, ok = 'да', cancel = 'отмена', icon: ic }) =>
  modal({ title, body: html`<p class="secondary">${text}</p>`, actions: [{ label: cancel, value: false }, { label: ok, kind: 'primary', value: true, icon: ic }] }).then((v) => v === true);

// Поповер, привязанный к якорю; закрывается кликом вне / Esc.
export function popover(anchor, contentHtml, { align = 'right', cls = '', onMount } = {}) {
  closePopovers();
  const p = document.createElement('div');
  p.className = `popover ${cls}`; p.dataset.pop = '1';
  p.innerHTML = contentHtml.s !== undefined ? contentHtml.s : contentHtml;
  document.body.append(p);
  const r = anchor.getBoundingClientRect();
  p.style.top = `${r.bottom + 8 + scrollY}px`;
  const w = p.offsetWidth;
  const left = align === 'right' ? r.right - w : r.left;
  p.style.left = `${Math.max(8, Math.min(left, innerWidth - w - 8)) + scrollX}px`;
  const off = (e) => { if (!p.contains(e.target) && !anchor.contains(e.target)) closePopovers(); };
  const key = (e) => { if (e.key === 'Escape') closePopovers(); };
  setTimeout(() => { document.addEventListener('mousedown', off); document.addEventListener('keydown', key); }, 0);
  p._cleanup = () => { document.removeEventListener('mousedown', off); document.removeEventListener('keydown', key); };
  if (onMount) onMount(p);
  return p;
}
export function closePopovers() { document.querySelectorAll('[data-pop]').forEach((p) => { p._cleanup && p._cleanup(); p.remove(); }); }
