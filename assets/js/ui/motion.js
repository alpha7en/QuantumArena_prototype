// Движение страницы. Правила:
//  · анимация никогда не блокирует действие: ничего не отключаем и не перехватываем, всё остаётся кликабельным;
//  · соседние элементы появляются по очереди (ступень 80 мс, не больше пяти ступеней);
//  · разнесённые по странице блоки спят, пока их не долистали: в проходе по странице у каждой партии своя очередь;
//  · работает один раз на открытие страницы; при prefers-reduced-motion ничего не прячется.
const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
const STEP = 80, MAX_STEPS = 5, WAKE_AT = 0.9;
const STAGGER = '.steps3, .starter, .stats-strip, .gates-grid, .now-grid, .two-cards, .res-grid, .events, .stat-pair, .leaders';
const COUNT = '.stat-n, .t-number-xl, .stat .t-number';
const NUM = /^[\d  ]+$/;
const fmt = (n) => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
const rowKey = (el) => { const r = el.getBoundingClientRect(); return [Math.round(r.top / 48), r.left]; };

// Число считается от нуля после паузы delay (когда его блок уже проявился).
function arm(el) {
  const text = el.textContent.trim();
  if (!NUM.test(text) || el.dataset.counted) return null;
  const to = +text.replace(/\D/g, '');
  if (!to || to > 1e7) return null;
  el.dataset.counted = '1';
  const w = el.getBoundingClientRect().width;
  if (w) { el.style.display = 'inline-block'; el.style.minWidth = w + 'px'; }
  el.textContent = fmt(0);
  return (delay) => setTimeout(() => {
    const dur = Math.min(900, 400 + Math.log10(to + 1) * 120), t0 = performance.now();
    const step = (t) => {
      const k = Math.min(1, (t - t0) / dur);
      el.textContent = fmt(to * (1 - Math.pow(1 - k, 4)));
      if (k < 1) requestAnimationFrame(step); else el.textContent = text;
    };
    requestAnimationFrame(step);
  }, delay);
}

export function enhance(root) {
  if (reduced()) return;
  const page = root.querySelector('.page');
  if (!page) return;
  const home = page.classList.contains('home');
  const items = new Map();                      // элемент → { wake(delay) }
  const visible = (el) => el.getBoundingClientRect().top < innerHeight * WAKE_AT;

  const register = (el, kind) => {
    if (kind === 'block') {
      const starters = [...el.querySelectorAll(COUNT)].map(arm).filter(Boolean);
      el.classList.add('rv');
      items.set(el, { wake: (d) => { el.style.setProperty('--rv-d', d + 'ms'); el.classList.add('in'); starters.forEach((s) => s(d + 220)); } });
    } else if (kind === 'podium') {
      el.classList.add('arm');
      items.set(el, { wake: (d) => { el.style.setProperty('--pod-d', d + 240 + 'ms'); el.classList.add('go'); } });
    }
  };

  // Что именно оживляем: блоки страницы и элементы их сеток; подиумы отдельно.
  const blocks = [];
  [...page.children].forEach((el) => {
    if (el.matches('.corner, .page-head, .hero-wrap, .empty')) return;
    if (el.matches(STAGGER)) blocks.push(...el.children);
    else if (el.querySelector(':scope > ' + STAGGER.split(', ').join(', :scope > '))) [...el.children].forEach((c) => (c.matches(STAGGER) ? blocks.push(...c.children) : blocks.push(c)));
    else blocks.push(el);
  });
  const sticky = (el) => ['sticky', 'fixed'].includes(getComputedStyle(el).position);
  const firstScreen = [];
  blocks.filter((el) => !sticky(el)).forEach((el) => {
    // На обычных страницах всё первого экрана уже проявляется вместе со страницей; здесь только числа.
    if (visible(el) && !home) { const s = [...el.querySelectorAll(COUNT)].map(arm).filter(Boolean); if (s.length) firstScreen.push(...s); return; }
    register(el, 'block');
  });
  page.querySelectorAll('.podium').forEach((p) => register(p, 'podium'));
  let t0 = 0;
  firstScreen.forEach((s) => s(260 + 80 * Math.min(t0++, MAX_STEPS)));

  // Партия: всё, что вошло в экран или осталось выше него, показывается по очереди сверху вниз и слева направо.
  let base = home ? 300 : 0;
  const check = () => {
    if (!root.isConnected) { off(); return; }
    const batch = [...items.keys()].filter(visible).sort((a, b) => { const x = rowKey(a), y = rowKey(b); return x[0] - y[0] || x[1] - y[1]; });
    batch.forEach((el, i) => { items.get(el).wake(base + STEP * Math.min(i, MAX_STEPS)); items.delete(el); });
    base = 0;
    if (!items.size) off();
  };
  let raf = 0;
  const onScroll = () => { if (!raf) raf = requestAnimationFrame(() => { raf = 0; try { check(); } catch { items.forEach((_, el) => el.classList.add('in', 'go')); items.clear(); off(); } }); };
  const off = () => removeEventListener('scroll', onScroll);
  if (items.size) { addEventListener('scroll', onScroll, { passive: true }); check(); }
}
