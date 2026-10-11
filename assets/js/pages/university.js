import { html, raw, esc, fmtInt, ruPlural } from '../ui/dom.js';
import { icon } from '../ui/icons.js';
import { kicker, avatar } from '../ui/parts.js';
import { uniStats, uniById, ratingTitle } from '../data/people.js';
import { meEntry } from './rating.js';
import { currentUser } from '../store.js';

export default async function university(ctx) {
  const id = ctx.params.id, uni = uniById(id);
  if (!uni) return { title: 'Вуз', nav: 'rating', html: '<div class="page"><div class="empty"><div class="ring">?</div><h3>Такого вуза нет</h3><a class="btn btn-secondary" href="#/rating/universities">к рейтингу вузов</a></div></div>' };
  const me = meEntry();
  let stats = uniStats().map((r) => ({ ...r, students: [...r.students] }));
  if (me && me.show) { const r = stats.find((x) => x.id === me.uni); if (r) { r.students.push({ ...me }); r.students.sort((a, b) => b.rating - a.rating); r.count += 1; r.sum = r.students.slice(0, 10).reduce((s, x) => s + x.rating, 0); } }
  stats.sort((a, b) => b.sum - a.sum); stats.forEach((r, i) => { r.rank = i + 1; });
  const r = stats.find((x) => x.id === id);
  const above = stats[r.rank - 2];
  const gap = above ? above.sum - r.sum : 0;
  const u = currentUser();
  const view = html`<div class="page">
    <div class="col" style="gap:12px"><a class="btn btn-ghost sm" href="#/rating/universities" style="align-self:flex-start;margin-left:-14px;color:var(--text-secondary)">${raw(icon('arrow-l', 'sm'))}рейтинг вузов</a>
      <div class="row wrap" style="justify-content:space-between;align-items:flex-end;gap:24px"><div class="col" style="gap:10px">${raw(kicker('вуз'))}<h1 class="t-display md">${uni.name}</h1><div class="t-mono muted">${r.count} ${ruPlural(r.count, 'участник', 'участника', 'участников')} раундов · ${r.rank} место из ${stats.length} вузов</div></div>
        <div class="row" style="gap:36px"><div><div class="t-mono-s muted">место</div><div class="t-number">${r.rank}</div></div><div><div class="t-mono-s muted">сумма топ-10</div><div class="t-number">${fmtInt(r.sum)}</div></div><div><div class="t-mono-s muted">за сезон</div><div class="t-number ok">+${r.delta}</div></div></div></div></div>
    ${above ? html`<div class="notice">${raw(icon('growth'))}<div>До ${r.rank - 1} места (${above.id === id ? '' : uniById(above.id).name}) не хватает ${fmtInt(gap + 1)} очков — это один хороший раунд двух студентов.</div></div>` : html`<div class="notice">${raw(icon('trophy'))}<div>Это первое место в демо-рейтинге вузов.</div></div>`}
    <section class="col" style="gap:16px"><div class="sec-head"><h2 class="t-h2">студенты</h2><span class="muted t-small">${r.count} участников раундов</span></div>
      <div class="card flush"><div class="prow phead t-kicker"><span>#</span><span>участник</span><span style="text-align:right">рейтинг</span><span class="tcol-m" style="text-align:right">за месяц</span><span class="tcol-m" style="text-align:right">раундов</span></div>
        ${r.students.slice(0, 50).map((p, i) => html`<a class="prow ${p.me ? 'me' : ''}" href="${p.me ? '#/profile' : '#/u/' + p.login}"><span class="mono ${p.me ? 'bad' : 'muted'}">${i + 1}</span><span class="who">${raw(avatar(p.name, 'sm', p.avatarImg))}<span class="col" style="gap:0"><b>${p.name}</b><em>${uni.name} · ${ratingTitle(p.rating)}</em></span></span><span class="num" style="text-align:right;font-weight:600">${fmtInt(p.rating)}</span><span class="num tcol-m" style="text-align:right;color:${p.month > 0 ? 'var(--ok)' : 'var(--text-secondary)'}">${p.month > 0 ? '+' : p.month < 0 ? '−' : ''}${Math.abs(p.month || 0)}</span><span class="num tcol-m" style="text-align:right">${p.rounds}</span></a>`)}</div></section>
    <p class="muted t-small">Участники смоделированы для демо.</p></div>`;
  return { title: uni.name, nav: 'rating', html: view };
}
