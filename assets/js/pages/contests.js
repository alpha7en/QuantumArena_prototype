import { html, raw, esc, on, dateShort, dateLong, timeHM, fmtInt, ruPlural, pad2 } from '../ui/dom.js';
import { icon } from '../ui/icons.js';
import { kicker, podiumHtml, statusHtml, tickCountdowns, countdownInline, sectionHead } from '../ui/parts.js';
import { ratingCardHtml } from '../ui/rounds_ui.js';
import { data, isGuest, currentUser } from '../store.js';
import { schedule, roundStart, roundEnd, participantsOf, roundTasks } from '../data/rounds.js';
import { anyActiveRun, isRegistered, registeredCount, setRegistered, startRun, getRound, isExpired } from '../data/roundstate.js';
import { pool, placeFor, POOL_SIZE } from '../data/people.js';
import { navigate } from '../router.js';
import { confirmModal, modal, toast } from '../ui/overlay.js';
import { uniById } from '../data/people.js';

export const roundResultOf = (n) => { const r = getRound(n); return r && r.run && r.run.finished ? r.run : null; };

export default async function contests() {
  const d = data(), sc = schedule();
  const start = roundStart(sc.next), act = anyActiveRun();
  const rating = d.rating, place = rating == null ? null : placeFor(rating);
  const season = pool().slice(0, 3).map((p) => ({ name: p.name, sub: uniById(p.uni).name, score: fmtInt(p.rating) }));
  const rounds = Array.from({ length: 8 }, (_, i) => sc.last - i);
  let filter = 'all';

  const actBanner = act ? (() => {
    const t = roundTasks(act.n);
    const expired = isExpired(act.run);
    return html`<div class="card row live-banner" style="padding:16px 20px;gap:16px">${raw(statusHtml('live', expired ? 'время вышло' : 'идёт'))}<span class="t-small-strong">quantum weekly ${act.n}${act.run.mode === 'timer' ? ' · с таймером' : ''}</span><span class="muted t-small">${act.run.mode === 'live' ? `${timeHM(new Date(act.run.startedAt))}–${timeHM(new Date(act.run.endsAt))} · вы участвуете` : 'личный таймер · не в рейтинге'}</span><span class="spacer"></span>${expired ? '' : html`<span class="row muted t-mono-s" style="gap:6px">${raw(icon('clock', 'sm'))}осталось <span class="mono num" data-cd="${act.run.endsAt}" data-fmt="clock" style="color:var(--text-primary)"></span></span>`}<a class="btn btn-primary sm" href="#/contests/${act.n}">${expired ? 'к итогам' : 'к задачам'}${raw(icon('arrow-r', 'sm'))}</a></div>`;
  })() : '';

  const view = html`
  <div class="page">
    <div class="page-head">${raw(kicker('контесты'))}<h1 class="t-display">контесты</h1><div class="t-mono muted">каждое воскресенье · 12:00 мск · 90 минут · 4 задачи</div></div>
    ${raw(actBanner)}
    <div class="two-cards">
      <div class="card col" style="gap:12px">
        <div class="row t-kicker">${raw(icon('contest', 'sm'))}<span>следующий раунд</span></div>
        <h2 class="t-h2" style="font-size:26px">quantum weekly ${sc.next}</h2>
        <div class="t-mono secondary">${dateShort(start)} · ${timeHM(start)} · 90 мин · 4 задачи</div>
        <div class="row muted t-small">${raw(icon('people', 'sm'))}записались ${fmtInt(registeredCount(sc.next))}</div>
        <div class="row wrap" style="justify-content:space-between;margin-top:6px"><span class="row muted t-small" style="gap:8px">${raw(icon('clock', 'sm'))}до старта</span>${raw(countdownInline(start.getTime()))}</div>
        <div class="row wrap" style="gap:10px;margin-top:4px"><a class="btn ${isRegistered(sc.next) ? 'btn-secondary' : 'btn-secondary'} sm" href="#/contests/${sc.next}">${isRegistered(sc.next) ? html`${raw(icon('check', 'sm'))}вы записаны` : html`зарегистрироваться${raw(icon('arrow-r', 'sm'))}`}</a><a class="btn btn-outline sm" href="#/contests/${sc.next}">${raw(icon('doc', 'sm'))}правила</a></div>
      </div>
      ${raw(ratingCardHtml(d, place, POOL_SIZE + 1))}
    </div>
    <section class="col" style="gap:16px">
      ${raw(sectionHead('лидеры сезона', '<a class="btn btn-outline sm" href="#/rating/season">рейтинг сезона' + icon('arrow-r', 'sm') + '</a>'))}
      <div class="card leaders">
        ${raw(podiumHtml(season))}
        <div class="col" style="gap:10px;justify-content:center"><div class="t-kicker">ваше место в сезоне</div>
          ${currentUser() && rating != null ? html`<div class="row" style="justify-content:space-between;padding:12px 0;border-top:1px solid var(--line-subtle);border-bottom:1px solid var(--line-subtle)"><span class="mono muted">${fmtInt(place)}</span><span class="grow" style="margin-left:16px"><b>${currentUser().name} · вы</b><div class="muted t-small">${uniById(currentUser().uni).name} · ${d.rating >= 1400 ? 'специалист' : 'ученик'}</div></span><span class="t-number-s">${fmtInt(rating)}</span></div>` : html`<div class="secondary t-small">${isGuest() ? 'Войдите, чтобы увидеть своё место.' : 'Сыграйте раунд, и здесь появится ваше место.'}</div>`}
          <div class="muted t-small">Рейтинг меняется после каждого раунда. Раунды с таймером его не трогают.</div></div>
      </div>
    </section>
    <section class="col" style="gap:16px">
      <div class="sec-head"><h2 class="t-h2">прошедшие раунды</h2><div class="segmented sm" id="seg"><button data-f="all" aria-pressed="true">все</button><button data-f="mine" aria-pressed="false">мои</button></div></div>
      <div class="card flush" id="rlist"></div>
    </section>
    <section class="col" style="gap:16px">
      ${raw(sectionHead('мероприятия', '<span class="muted t-small">кроме еженедельных раундов · идеи форматов, в демо недоступны</span>'))}
      <div class="events">
        ${[['кубок sparq arena', 'турнир', 'Идея формата: отборочные раунды и финал, личный зачёт и зачёт по вузам. Условия пока не определены.', 'trophy'],
          ['спринт: меньше CNOT', 'спринт', 'Задача с открытым оптимумом: чем меньше гейтов и глубина, тем выше результат. Отдельная таблица рекордов.', 'energy'],
          ['раунды по темам', 'архив', 'Прошедшие раунды, собранные по темам: запутанность, оракулы, коррекция ошибок.', 'book']].map(([t, k, text, ic]) => html`<div class="card col" style="gap:10px"><div class="row t-kicker">${raw(icon(ic, 'sm'))}<span>${k}</span></div><h3 class="t-h3">${t}</h3><p class="secondary t-small">${text}</p><div class="row muted t-small">${raw(icon('calendar', 'sm'))}в планах · без дат</div><button class="btn btn-outline sm" data-soon style="align-self:flex-start">подробнее${raw(icon('arrow-r', 'sm'))}</button></div>`)}
      </div>
    </section>
  </div>`;

  let stop = null;
  return {
    title: 'Контесты', nav: 'contests', html: view,
    mount(root) {
      stop = tickCountdowns(root);
      const list = root.querySelector('#rlist');
      const draw = () => {
        list.innerHTML = `<div class="rrow rhead t-kicker"><span>#</span><span>раунд</span><span>результат</span><span></span></div>` + rounds.filter((n) => filter === 'all' || roundResultOf(n)).map((n) => {
          const run = roundResultOf(n), s = roundStart(n);
          const res = run && run.result;
          const left = `<span class="mono">${n}</span><span class="col" style="gap:0"><b>${dateShort(s)}</b><span class="muted t-small">${run ? (run.mode === 'timer' ? 'вы прошли с таймером' : 'вы участвовали') : 'вы пропустили'}</span></span>`;
          const mid = res ? `<span class="mono row" style="gap:8px;font-size:13px">${icon('trophy', 'sm')}${res.place}-й из ${res.of} · ${res.count}/4${run.mode === 'timer' ? ' · не в рейтинге' : ` · ${res.score} баллов`}</span>` : `<span class="muted mono" style="font-size:13px">${fmtInt(participantsOf(n))} участников</span>`;
          const acts = run && run.mode === 'live' ? `<a class="btn btn-secondary xs" href="#/contests/${n}">итоги</a><a class="btn btn-outline xs" href="#/contests/${n}?upsolve=1">${icon('refresh', 'sm')}дорешать</a>` : `<a class="btn btn-secondary xs" href="#/contests/${n}">итоги</a>${run ? `<a class="btn btn-outline xs" href="#/contests/${n}?upsolve=1">${icon('refresh', 'sm')}дорешать</a>` : `<button class="btn btn-secondary xs" data-timer="${n}">${icon('clock', 'sm')}с таймером</button>`}`;
          return `<div class="rrow">${left}${mid}<span class="row" style="justify-content:flex-end;gap:8px">${acts}</span></div>`;
        }).join('') || '<div class="empty"><h3>Здесь пусто</h3><p>Вы ещё не участвовали ни в одном раунде.</p></div>';
      };
      draw();
      on(root.querySelector('#seg'), 'click', '[data-f]', (e, b) => { filter = b.dataset.f; root.querySelectorAll('#seg button').forEach((x) => x.setAttribute('aria-pressed', x === b)); draw(); });
      on(root, 'click', '[data-timer]', async (e, b) => { startTimerFlow(+b.dataset.timer); });
      on(root, 'click', '[data-soon]', () => modal({ title: 'Пока нет в демо', body: 'Это идеи форматов: в прототипе их нет. Еженедельные раунды и раунды с таймером работают полностью.', actions: [{ label: 'понятно', kind: 'primary', value: true }] }));
    },
    unmount() { stop && stop(); },
  };
}

export async function startTimerFlow(n) {
  if (isGuest()) { const v = await modal({ title: 'Нужен аккаунт', body: 'Чтобы пройти раунд с таймером и сохранить результат, войдите или зарегистрируйтесь.', actions: [{ label: 'позже', value: null }, { label: 'войти', kind: 'primary', value: 'in' }] }); if (v === 'in') navigate('/login'); return; }
  const act = anyActiveRun();
  if (act) { toast({ title: 'Уже идёт другой раунд', text: `Сначала завершите раунд ${act.n}.`, kind: 'warn' }); navigate(`/contests/${act.n}`); return; }
  const ok = await confirmModal({ title: `пройти quantum weekly ${n} с таймером?`, text: 'Те же 4 задачи и 90 минут только для вас. Результат появится в профиле, рейтинг не изменится. Остановить таймер нельзя.', ok: 'начать', cancel: 'отмена', icon: 'play' });
  if (!ok) return;
  startRun(n, 'timer'); navigate(`/contests/${n}`);
}
