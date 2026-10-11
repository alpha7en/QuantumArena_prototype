// Общие блоки страниц контестов.
import { esc, dateShort, dateLong, timeHM, fmtInt } from './dom.js';
import { icon } from './icons.js';
import { diffHtml, statusHtml } from './parts.js';
import { TITLE_STEPS, ratingTitle, nextTitle } from '../data/people.js';

export const roundMeta = (n, start, extra = '') => `${dateLong(start)}${extra}`;

export function titleBar(rating) {
  const cur = rating == null ? -1 : TITLE_STEPS.map((t) => t.min).filter((m) => rating >= m).length - 1;
  return `<div class="titlebar">${TITLE_STEPS.map((t, i) => `<div class="tb-seg ${i === cur ? 'cur' : i < cur ? 'past' : ''}"><i></i><span class="${i === cur ? 'on' : ''}">${t.name}</span><em>${t.label}</em></div>`).join('')}</div>`;
}

export function ratingCardHtml(d, place, of) {
  const r = d.rating, nt = r == null ? null : nextTitle(r);
  return `<div class="card col" style="gap:14px"><div class="row t-kicker">${icon('growth', 'sm')}<span>мой рейтинг</span></div>
    ${r == null ? `<div class="row" style="align-items:baseline;gap:14px"><span class="t-number">без рейтинга</span></div><div class="secondary t-small">Сыграйте первый раунд — рейтинг появится по его итогам. Раунды с таймером рейтинг не меняют.</div>`
      : `<div class="row" style="align-items:baseline;gap:14px"><span class="t-number" style="font-size:38px">${fmtInt(r)}</span><span class="t-h3" style="font-size:20px;color:var(--text-secondary)">${ratingTitle(r)}</span></div>
      <div class="secondary t-small">место ${fmtInt(place)} из ${fmtInt(of)}${nt ? ` · до титула «${nt.name}» — ${nt.min - r}` : ''}</div>`}
    ${titleBar(r)}<a class="btn btn-outline sm" href="#/rating" style="align-self:flex-start">весь рейтинг${icon('arrow-r', 'sm')}</a></div>`;
}

export function taskRowHtml({ q, title, sub, level, points, solved, kind, href, meta }) {
  const st = kind ? statusHtml(kind.k, kind.t) : `<span class="t-small muted">${esc(solved === false ? 'не решена' : '')}</span>`;
  return `<a class="rtask" href="${href}"><span class="rt-q mono">Q${q}</span><span class="rt-main"><span class="rt-title">${esc(title)}</span><span class="rt-sub">${sub}</span></span><span class="rt-diff">${diffHtml(level)}</span><span class="rt-st">${st}</span>${icon('chev-r', 'sm')}</a>`;
}

export const cellIcon = (c) => (c === 'ok' ? `<span class="qcell ok">${icon('check', 'sm')}</span>` : c === 'no' ? `<span class="qcell no">${icon('x', 'sm')}</span>` : '<span class="qcell">·</span>');

export function standingsTable(rows, meRow, { note = '', frozen = false } = {}) {
  const line = (r, me = false) => `<div class="srow ${me ? 'me' : ''}"><span class="mono muted">${r.rank}</span><span class="who">${r.avatar}<span class="col" style="gap:0;min-width:0"><b>${esc(r.name)}${me ? ' · вы' : ''}</b><em>${esc(r.uni)}</em></span></span>${r.cells.map(cellIcon).join('')}<span class="solved">${r.count}/4</span><span class="mono muted">${r.time}</span></div>`;
  return `<div class="srow shead"><span>#</span><span>участник</span><span>Q1</span><span>Q2</span><span>Q3</span><span>Q4</span><span>решено</span><span>время</span></div>
    ${rows.map((r) => line(r)).join('')}${meRow ? `<div class="srow gap"><span>…</span></div>${line(meRow, true)}` : ''}${note ? `<div class="infoline" style="padding:14px 16px">${icon('info')}${esc(note)}</div>` : ''}`;
}
