import { html, raw, esc, on, fmtInt, ruPlural } from '../ui/dom.js';
import { icon } from '../ui/icons.js';
import { kicker, avatar } from '../ui/parts.js';
import { pool, uniStats, UNIVERSITIES, uniById, ratingTitle, POOL_SIZE } from '../data/people.js';
import { currentUser, data } from '../store.js';
import { navigate } from '../router.js';

export function meEntry() {
  const u = currentUser(), d = data();
  if (!u || d.rating == null) return null;
  const last = d.history[d.history.length - 1];
  return { id: 'me', me: true, name: u.name, login: u.login, uni: u.uni, rating: d.rating, rounds: d.history.length, month: last ? last.delta : 0, avatarImg: u.avatar, show: u.showInUniRating !== false };
}

export function insertMe(list, key = 'rating') {
  const me = meEntry();
  if (!me) return { list, myIndex: -1 };
  const arr = list.slice();
  let i = 0; while (i < arr.length && arr[i][key] >= me[key]) i++;
  arr.splice(i, 0, me);
  return { list: arr, myIndex: i };
}

const seasonPts = (p) => Math.round((p.rating - 900) * 0.62 + Math.max(0, p.month || 0));

export default async function rating(ctx) {
  const tab = ctx.params.tab === 'universities' ? 'uni' : ctx.params.tab === 'season' ? 'season' : 'all';
  const me = meEntry(), u = currentUser();
  const total = POOL_SIZE + (me ? 1 : 0);
  const unis = uniStats().map((r) => ({ ...r }));
  // вклад пользователя в свой вуз
  if (me && me.show) {
    const r = unis.find((x) => x.id === me.uni);
    if (r) { r.students = [...r.students, { ...me }].sort((a, b) => b.rating - a.rating); r.count += 1; r.sum = r.students.slice(0, 10).reduce((s, x) => s + x.rating, 0); r.best = r.students[0]; }
  }
  unis.sort((a, b) => b.sum - a.sum); unis.forEach((r, i) => { r.rank = i + 1; });

  const heads = { all: ['рейтинг участников', `${fmtInt(total)} ${ruPlural(total, 'участник', 'участника', 'участников')} (смоделированы). Рейтинг считается по раундам: победа над сильными даёт больше. Титул — по рейтингу.`],
    season: ['рейтинг сезона', 'Очки за раунды осени 2026. Сезон начинается заново, общий рейтинг не обнуляется.'],
    uni: ['рейтинг вузов', 'Сумма рейтинга десяти лучших студентов вуза. Ваш вуз считается, если у него 3 и больше участников раундов.'] }[tab];
  const view = html`<div class="page">
    <div class="page-head">${raw(kicker('рейтинг'))}<h1 class="t-display">${heads[0]}</h1><p class="t-lead" style="max-width:720px">${heads[1]}</p></div>
    <div class="tabs" role="tablist"><a class="tab" role="tab" href="#/rating" aria-selected="${tab === 'all'}">общий<span class="cnt">${fmtInt(total)}</span></a><a class="tab" role="tab" href="#/rating/season" aria-selected="${tab === 'season'}">сезон · осень 2026</a><a class="tab" role="tab" href="#/rating/universities" aria-selected="${tab === 'uni'}">по вузам<span class="cnt">${unis.length}</span></a></div>
    <div class="filters"><div class="control" style="flex:1;min-width:240px">${raw(icon('search'))}<input id="q" placeholder="${tab === 'uni' ? 'Найти вуз' : 'Имя, логин или вуз'}" autocomplete="off"></div>
      ${tab === 'uni' ? '' : html`<div class="control select" style="min-width:200px"><select id="uni" aria-label="вуз"><option value="">все вузы</option>${UNIVERSITIES.filter((x) => x.id !== 'other').map((x) => html`<option value="${x.id}">${x.name}</option>`)}</select><span class="chev">${raw(icon('chev-d', 'sm'))}</span></div>`}
      ${tab === 'uni' ? html`<button class="btn btn-outline sm" id="mine">${raw(icon('university', 'sm'))}мой вуз</button>` : html`<button class="btn btn-outline sm" id="mine">${raw(icon('user', 'sm'))}найти себя</button>`}</div>
    <div class="card flush" id="tbl"></div>
    <div id="more-wrap" style="text-align:center"></div>
    <p class="muted t-small">Все участники, рейтинги и вузовские суммы в демо смоделированы. Строка с вашим именем появляется после первого раунда.</p>
  </div>`;

  let limit = 50, query = '', uni = '';
  return {
    title: heads[0], nav: 'rating', html: view,
    mount(root) {
      const tbl = root.querySelector('#tbl'), more = root.querySelector('#more-wrap');
      const title = (r) => ratingTitle(r);
      const draw = (scrollToMe = false) => {
        const q = query.trim().toLowerCase();
        if (tab === 'uni') {
          const rows = unis.filter((r) => !q || uniById(r.id).name.toLowerCase().includes(q));
          tbl.innerHTML = `<div class="prow uhead t-kicker"><span>#</span><span>вуз</span><span style="text-align:right">сумма топ-10</span><span style="text-align:right">лучший студент</span></div>` + (rows.map((r) => {
            const mine = u && r.id === u.uni;
            return `<a class="prow urow ${mine ? 'me' : ''}" href="#/rating/universities/${r.id}" ${mine ? 'data-me' : ''}><span class="mono ${mine ? 'bad' : 'muted'}">${r.rank}</span><span class="who"><span class="avatar sm">${icon('university', 'sm')}</span><span class="col" style="gap:0"><b>${esc(uniById(r.id).name)}</b><em>${r.count} ${ruPlural(r.count, 'участник', 'участника', 'участников')}${mine ? ' · ваш вуз' : ''}</em></span></span><span class="num" style="text-align:right;font-weight:600">${fmtInt(r.sum)}</span><span style="text-align:right" class="secondary">${esc(r.best.name)}</span></a>`;
          }).join('') || '<div class="empty"><h3>Вуз не найден</h3></div>');
          more.innerHTML = '';
        } else {
          let base = tab === 'season' ? pool().map((p) => ({ ...p, pts: seasonPts(p) })).sort((a, b) => b.pts - a.pts) : pool();
          const key = tab === 'season' ? 'pts' : 'rating';
          const mm = me ? { ...me, pts: seasonPts(me) } : null;
          let list = base;
          if (mm) { list = base.slice(); let i = 0; while (i < list.length && list[i][key] >= mm[key]) i++; list.splice(i, 0, mm); }
          list = list.map((p, i) => ({ ...p, pos: i + 1 }));
          let f = list.filter((p) => (!uni || p.uni === uni) && (!q || p.name.toLowerCase().includes(q) || p.login.toLowerCase().includes(q) || uniById(p.uni).name.toLowerCase().includes(q)));
          const myPos = f.findIndex((p) => p.me);
          const shown = f.slice(0, limit);
          const pinned = myPos >= limit ? f[myPos] : null;
          const line = (p) => `<a class="prow ${p.me ? 'me' : ''}" ${p.me ? 'href="#/profile" data-me' : `href="#/u/${p.login}"`}><span class="mono ${p.me ? 'bad' : 'muted'}">${p.pos}</span><span class="who">${avatar(p.name, 'sm', p.avatarImg)}<span class="col" style="gap:0"><b>${esc(p.name)}</b><em>${esc(uniById(p.uni).name)} · ${title(p.rating)}</em></span></span><span class="num" style="text-align:right;font-weight:600">${fmtInt(tab === 'season' ? p.pts : p.rating)}</span><span class="num tcol-m" style="text-align:right;color:${p.month > 0 ? 'var(--ok)' : 'var(--text-secondary)'}">${p.month > 0 ? '+' : p.month < 0 ? '−' : ''}${Math.abs(p.month || 0)}</span><span class="num tcol-m" style="text-align:right" class="secondary">${p.rounds}</span></a>`;
          tbl.innerHTML = `<div class="prow phead t-kicker"><span>#</span><span>участник</span><span style="text-align:right">${tab === 'season' ? 'очки' : 'рейтинг'}</span><span class="tcol-m" style="text-align:right">за месяц</span><span class="tcol-m" style="text-align:right">раундов</span></div>` + (shown.map(line).join('') || '<div class="empty"><h3>Никого не нашли</h3><p>Попробуйте другое имя или вуз.</p></div>') + (pinned ? `<div class="prow gap"><span>…</span></div>${line(pinned)}` : '');
          more.innerHTML = f.length > limit ? `<button class="btn btn-outline sm" id="more">показать ещё</button>` : '';
          if (scrollToMe) { const el = tbl.querySelector('[data-me]'); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
        }
      };
      draw();
      root.querySelector('#q').addEventListener('input', (e) => { query = e.target.value; limit = 50; draw(); });
      const us = root.querySelector('#uni'); if (us) us.addEventListener('change', (e) => { uni = e.target.value; limit = 50; draw(); });
      on(root, 'click', '#more', () => { limit += 50; draw(); });
      root.querySelector('#mine').addEventListener('click', () => {
        if (!u) { navigate('/login'); return; }
        if (tab === 'uni') { const el = tbl.querySelector('[data-me]'); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' }); return; }
        if (!me) { navigate('/contests'); return; }
        limit = Math.max(limit, 5000); draw(true);
      });
    },
  };
}
