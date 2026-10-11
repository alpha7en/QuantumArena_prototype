// Движение страницы: проявление блоков при прокрутке и счётчики чисел.
// Блоки первого экрана не прячем, чтобы страница не мигала; после выхода из экрана ничего не повторяется.
const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
const STAGGER = '.steps3, .starter, .stats-strip, .gates-grid, .now-grid, .two-cards, .res-grid, .events, .stat-pair, .leaders';
const COUNT = '.stat-n, .t-number-xl, .stat .t-number';
const NUM = /^[\d  ]+$/;
const fmt = (n) => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

function countUp(el) {
  const text = el.textContent.trim();
  if (!NUM.test(text) || el.dataset.counted) return;
  const to = +text.replace(/\D/g, '');
  if (!to || to > 1e7) return;
  el.dataset.counted = '1';
  const w = el.getBoundingClientRect().width;
  if (w) { el.style.display = 'inline-block'; el.style.minWidth = w + 'px'; }
  const dur = Math.min(1100, 450 + Math.log10(to + 1) * 160), t0 = performance.now();
  const step = (t) => {
    const k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 4);
    el.textContent = fmt(to * e);
    if (k < 1) requestAnimationFrame(step); else el.textContent = text;
  };
  el.textContent = fmt(0);
  requestAnimationFrame(step);
}

export function enhance(root) {
  if (reduced()) return;
  const page = root.querySelector('.page');
  if (!page) return;
  const vh = innerHeight;
  const pending = new Set();
  // Показываем всё, что вошло в экран или осталось выше него (быстрая прокрутка, клавиша End, якорь).
  const check = () => {
    if (!root.isConnected) { removeEventListener('scroll', onScroll); return; }
    for (const el of [...pending]) {
      if (el.getBoundingClientRect().top >= innerHeight * 0.92) continue;
      pending.delete(el);
      el.classList.add('in');
      el.querySelectorAll(COUNT).forEach(countUp);
      if (el.matches(COUNT)) countUp(el);
    }
    if (!pending.size) removeEventListener('scroll', onScroll);
  };
  let raf = 0;
  const onScroll = () => { if (!raf) raf = requestAnimationFrame(() => { raf = 0; check(); }); };

  const hide = (el, delay = 0) => {
    if (el.getBoundingClientRect().top < vh * 0.92) { el.querySelectorAll(COUNT).forEach(countUp); if (el.matches(COUNT)) countUp(el); return; }
    el.classList.add('rv'); if (delay) el.style.setProperty('--rv-d', delay + 'ms');
    pending.add(el);
  };
  [...page.children].forEach((el) => {
    if (el.matches('.corner, .page-head, .hero-wrap, .empty')) return;
    if (el.matches(STAGGER)) [...el.children].forEach((c, i) => hide(c, Math.min(i, 5) * 70));
    else if (el.querySelector(':scope > ' + STAGGER.split(', ').join(', :scope > '))) [...el.children].forEach((c) => (c.matches(STAGGER) ? [...c.children].forEach((g, i) => hide(g, Math.min(i, 5) * 70)) : hide(c)));
    else hide(el);
  });
  if (pending.size) { addEventListener('scroll', onScroll, { passive: true }); check(); }
}
