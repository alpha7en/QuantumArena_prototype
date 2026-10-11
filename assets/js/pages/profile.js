import { html, raw, esc, on, fmtInt, fmtDec, dateDay, ruPlural } from '../ui/dom.js';
import { icon } from '../ui/icons.js';
import { avatar } from '../ui/parts.js';
import { data, currentUser, streakNow, dayKey } from '../store.js';
import { TASKS } from '../data/tasks.js';
import { pool, placeFor, uniById, ratingTitle, POOL_SIZE } from '../data/people.js';
import { rng } from '../quantum/sim.js';
import { schedule } from '../data/rounds.js';
import { navigate } from '../router.js';
import { toast } from '../ui/overlay.js';

const MONTHS = ['янв', 'фев', 'мар', 'апр', 'мая', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];

function chartSvg(points) {
  const W = 760, H = 250, padL = 20, padR = 24, padT = 24, padB = 28;
  if (points.length < 2) return `<div class="empty" style="padding:40px 0"><div class="ring">${icon('growth')}</div><h3>График появится после двух раундов</h3><p>Рейтинг меняется только по итогам раундов. Раунды с таймером его не трогают.</p></div>`;
  const vals = points.map((p) => p.v), lo = Math.min(...vals) - 30, hi = Math.max(...vals) + 30;
  const x = (i) => padL + (W - padL - padR) * (i / (points.length - 1)), y = (v) => padT + (H - padT - padB) * (1 - (v - lo) / (hi - lo));
  const line = points.map((p, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(p.v).toFixed(1)}`).join(' ');
  const area = `${line} L${x(points.length - 1)},${H - padB} L${x(0)},${H - padB} Z`;
  const last = points[points.length - 1];
  return `<svg viewBox="0 0 ${W} ${H}" class="chart" role="img" aria-label="график рейтинга по раундам"><defs><linearGradient id="ga" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="var(--text-primary)" stop-opacity=".12"/><stop offset="1" stop-color="var(--text-primary)" stop-opacity="0"/></linearGradient></defs>
    ${[0, 1, 2, 3].map((k) => `<line x1="${padL}" x2="${W - padR}" y1="${padT + (H - padT - padB) * k / 3}" y2="${padT + (H - padT - padB) * k / 3}" stroke="var(--line-subtle)" stroke-dasharray="2 4"/>`).join('')}
    <path d="${area}" fill="url(#ga)"/><path d="${line}" fill="none" stroke="var(--accent)" stroke-width="2.2" stroke-linejoin="round"/>
    ${points.map((p, i) => `<circle cx="${x(i)}" cy="${y(p.v)}" r="${i === points.length - 1 ? 5 : 3}" fill="${i === points.length - 1 ? 'var(--bg-base)' : 'var(--accent)'}" stroke="var(--accent)" stroke-width="2"><title>${esc(p.label)}: ${fmtInt(p.v)}</title></circle>`).join('')}
    <text x="${padL}" y="${H - 8}" class="chart-t">${esc(points[0].label)}</text><text x="${W - padR}" y="${H - 8}" text-anchor="end" class="chart-t">${esc(last.label)}</text><text x="${x(points.length - 1) - 10}" y="${y(last.v) - 12}" text-anchor="end" class="chart-t" style="fill:var(--text-primary)">${fmtInt(last.v)}</text></svg>`;
}

function heatmap(activity, year) {
  const start = new Date(year, 0, 1), startDow = (start.getDay() + 6) % 7; // пн = 0
  const today = new Date(), cells = [];
  const days = (year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0)) ? 366 : 365;
  const pad = Array.from({ length: startDow }, () => null);
  for (let i = 0; i < days; i++) { const dt = new Date(year, 0, 1 + i); cells.push({ k: dayKey(dt.getTime()), dt, future: dt > today }); }
  const all = [...pad, ...cells];
  const weeks = []; for (let i = 0; i < all.length; i += 7) weeks.push(all.slice(i, i + 7));
  const lvl = (n) => (n >= 6 ? 4 : n >= 4 ? 3 : n >= 2 ? 2 : n >= 1 ? 1 : 0);
  let total = 0;
  const grid = weeks.map((w) => `<div class="hw">${w.map((c) => { if (!c) return '<i class="hc"></i>'; const n = activity[c.k] || 0; total += n; return `<i class="hc ${c.future ? 'fut' : 'l' + lvl(n)}" title="${c.dt.getDate()} ${MONTHS[c.dt.getMonth()]}: ${n}"></i>`; }).join('')}</div>`).join('');
  return { grid: `<div class="heat">${grid}</div>`, total };
}

export default async function profile(ctx) {
  const me = currentUser();
  const login = ctx.params.login;
  let P, own = false;
  if (!login) {
    if (!me) { navigate('/login', { replace: true }); return { title: 'Профиль', nav: null, html: '' }; }
    own = true;
  } else if (me && me.login === login) { own = true; }
  if (own) {
    const d = data(), hist = d.history;
    const solvedList = Object.entries(d.solved).map(([id, v]) => ({ t: TASKS.find((x) => x.id === id), at: v.at })).filter((x) => x.t).sort((a, b) => b.at - a.at);
    P = { name: me.name, login: me.login, uni: me.uni, avatar: me.avatar, since: new Date(me.createdAt), rating: d.rating, history: hist.map((h) => ({ v: h.after, label: `раунд ${h.round}` })), rounds: hist.slice(-3).reverse().map((h) => ({ n: h.round, place: h.place, solved: h.solved, delta: h.delta })), solved: solvedList, attempts: Object.values(d.attempts).reduce((a, b) => a + b, 0), accepted: solvedList.length, streak: streakNow(d), best: d.streak.best, activity: d.activity, last: hist.length ? hist[hist.length - 1].delta : null, demo: !!me.demo };
  } else {
    const p = pool().find((x) => x.login === login);
    if (!p) return { title: 'Профиль', nav: 'rating', html: '<div class="page"><div class="empty"><div class="ring">?</div><h3>Такого участника нет</h3><a class="btn btn-secondary" href="#/rating">к рейтингу</a></div></div>' };
    const r = rng(p.rank * 977 + 3), pts = []; let v = p.rating;
    for (let i = 0; i < 7; i++) { pts.unshift({ v: Math.round(v), label: `раунд ${schedule().last - i}` }); v -= (r() - 0.35) * 36; }
    const act = {}; const n = Math.min(240, Math.round(40 + p.rounds * 3)); for (let i = 0; i < n; i++) { const day = Math.floor(Math.pow(r(), 0.85) * 260); const k = dayKey(Date.now() - day * 86400000); act[k] = (act[k] || 0) + 1; }
    const solvedN = Math.min(TASKS.length, Math.max(1, Math.round((p.rating - 700) / 1900 * TASKS.length)));
    P = { name: p.name, login: p.login, uni: p.uni, since: new Date(Date.now() - (200 + p.rounds * 6) * 86400000), rating: p.rating, history: pts, rounds: pts.slice(-3).reverse().map((q, i, a) => ({ n: schedule().last - i, place: Math.max(1, Math.round(5 + r() * 400)), solved: 1 + Math.floor(r() * 4), delta: Math.round((r() - 0.4) * 50) })), solved: Array.from({ length: solvedN }), attempts: Math.round(solvedN * 1.7), accepted: solvedN, streak: Math.floor(r() * 9), best: 6 + Math.floor(r() * 20), activity: act, last: Math.round(p.month), demo: true, other: true };
  }
  const place = P.rating != null ? placeFor(P.rating) : null;
  const years = [new Date().getFullYear(), new Date().getFullYear() - 1];
  let year = years[0], range = 'year';
  const since = `${MONTHS[P.since.getMonth()]} ${P.since.getFullYear()}`.replace('мая', 'мая');
  const view = html`<div class="page">
    <div class="row wrap" style="gap:28px;align-items:center">
      ${raw(avatar(P.name, 'xxl', P.avatar))}
      <div class="col grow" style="gap:12px"><div class="row" style="gap:12px;align-items:center"><h1 class="t-display md">${P.name}</h1>${P.demo ? html`<span class="demo-chip">демо</span>` : ''}</div>
        <div class="row wrap" style="gap:14px"><a class="chip" href="#/rating/universities/${P.uni}">${uniById(P.uni).name}</a><span class="t-mono muted">@${P.login} · ${ratingTitle(P.rating)} · с ${since}</span></div></div>
      <div class="row" style="gap:10px"><button class="btn btn-outline sm" id="share">${raw(icon('ext', 'sm'))}поделиться</button>${own ? html`<a class="btn btn-secondary sm" href="#/settings">${raw(icon('sliders', 'sm'))}настройки</a>` : ''}</div>
    </div>
    ${P.other ? html`<div class="notice">${raw(icon('info'))}<div class="secondary t-small">Профиль смоделирован для демо: это не реальный человек.</div></div>` : ''}
    <div class="stat4">
      <div class="card col" style="gap:6px"><div class="t-mono-s muted">рейтинг</div><div class="t-number-xl">${P.rating == null ? '—' : fmtInt(P.rating)}</div><div class="t-mono-s ${P.last > 0 ? 'ok' : ''}">${P.rating == null ? 'появится после первого раунда' : `${ratingTitle(P.rating)}${P.last != null ? ` · ${P.last >= 0 ? '+' : '−'}${Math.abs(P.last)} за последний раунд` : ''}`}</div></div>
      <div class="card col" style="gap:6px"><div class="t-mono-s muted">место</div><div class="t-number-xl">${place == null ? '—' : fmtInt(place)}</div><div class="t-mono-s">${place == null ? 'нужен рейтинг' : `из ${fmtInt(POOL_SIZE + (own ? 1 : 0))} · топ ${fmtDec(place / POOL_SIZE * 100, 1)} %`}</div></div>
      <div class="card col" style="gap:6px"><div class="t-mono-s muted">решено задач</div><div class="t-number-xl">${P.accepted}</div><div class="t-mono-s">из ${TASKS.length}${P.attempts ? ` · ${fmtDec(P.accepted / Math.max(P.attempts, 1) * 100, 1)} % отправок приняты` : ''}</div></div>
      <div class="card col" style="gap:6px"><div class="t-mono-s muted">дней подряд</div><div class="t-number-xl">${P.streak}</div><div class="t-mono-s">рекорд — ${P.best}</div></div>
    </div>
    <div class="two-col" style="grid-template-columns:minmax(0,1.7fr) minmax(0,1fr)">
      <div class="card col" style="gap:12px"><div class="row" style="justify-content:space-between"><h3 class="t-h3">рейтинг по раундам</h3><div class="segmented sm" id="range"><button data-r="3m" aria-pressed="false">3 мес</button><button data-r="year" aria-pressed="true">год</button><button data-r="all" aria-pressed="false">всё</button></div></div><div id="chart"></div></div>
      <div class="card col" style="gap:8px"><h3 class="t-h3">последние раунды</h3>${P.rounds.length ? P.rounds.map((r) => html`<a class="row" href="#/contests/${r.n}" style="justify-content:space-between;padding:12px 0;border-bottom:1px solid var(--line-subtle)"><span class="grow">quantum weekly ${r.n}</span><span class="mono muted" style="font-size:12px">${r.place} место · ${r.solved}/4</span><span class="mono ${r.delta >= 0 ? 'ok' : ''}" style="min-width:42px;text-align:right">${r.delta >= 0 ? '+' : '−'}${Math.abs(r.delta)}</span></a>`) : html`<div class="muted t-small" style="padding:12px 0">Раундов пока нет. <a class="link" href="#/contests">К контестам</a></div>`}</div>
    </div>
    <div class="card col" style="gap:12px"><div class="row wrap" style="justify-content:space-between"><div class="row" style="gap:14px"><h3 class="t-h3">активность</h3><span class="muted t-mono-s" id="act-total"></span></div><div class="segmented sm" id="years">${years.map((y, i) => html`<button data-y="${y}" aria-pressed="${i === 0}">${y}</button>`)}</div></div><div id="heat" style="overflow-x:auto"></div>
      <div class="row muted t-mono-s" style="gap:6px;justify-content:flex-end">меньше ${[0, 1, 2, 3, 4].map((l) => html`<i class="hc l${l}"></i>`)} больше</div></div>
    ${P.solved.length && own ? html`<div class="card col" style="gap:8px"><h3 class="t-h3">решённые задачи</h3><div class="row wrap" style="gap:8px">${P.solved.map((x) => html`<a class="chip" href="#/tasks/${x.t.num}" title="${x.t.title}"><span class="mono muted">${x.t.num}.</span>${x.t.title.length > 34 ? x.t.title.slice(0, 32) + '…' : x.t.title}</a>`)}</div></div>` : ''}
  </div>`;
  return {
    title: P.name, nav: own ? null : 'rating', html: view,
    mount(root) {
      const drawChart = () => { let pts = P.history; if (range === '3m') pts = pts.slice(-13); root.querySelector('#chart').innerHTML = chartSvg(pts); };
      const drawHeat = () => { const h = heatmap(P.activity, year); root.querySelector('#heat').innerHTML = h.grid; root.querySelector('#act-total').textContent = `${h.total} ${ruPlural(h.total, 'отправка', 'отправки', 'отправок')} в ${year} году`; };
      drawChart(); drawHeat();
      on(root.querySelector('#range'), 'click', '[data-r]', (e, b) => { range = b.dataset.r; root.querySelectorAll('#range button').forEach((x) => x.setAttribute('aria-pressed', x === b)); drawChart(); });
      on(root.querySelector('#years'), 'click', '[data-y]', (e, b) => { year = +b.dataset.y; root.querySelectorAll('#years button').forEach((x) => x.setAttribute('aria-pressed', x === b)); drawHeat(); });
      root.querySelector('#share').addEventListener('click', () => { const url = `${location.origin}${location.pathname}#/u/${P.login}`; navigator.clipboard && navigator.clipboard.writeText(url).then(() => toast({ title: 'Ссылка скопирована', text: own ? 'Профиль виден только в вашем браузере: это демо.' : '' }), () => {}); });
    },
  };
}
