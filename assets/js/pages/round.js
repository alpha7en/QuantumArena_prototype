import { html, raw, esc, on, dateLong, dateShort, timeHM, fmtInt, ruPlural, pad2 } from '../ui/dom.js';
import { icon } from '../ui/icons.js';
import { kicker, podiumHtml, statusHtml, tickCountdowns, countdownInline, diffHtml, avatar } from '../ui/parts.js';
import { taskRowHtml, standingsTable } from '../ui/rounds_ui.js';
import { data, isGuest, currentUser, mutate } from '../store.js';
import { schedule, roundStart, roundEnd, cohort, roundTasks, POINTS, participantsOf, ROUND_MS, PENALTY_MIN, scoreProgress } from '../data/rounds.js';
import { isRegistered, registeredCount, setRegistered, startRun, getRound, activeRun, finishRun, isExpired, liveTable } from '../data/roundstate.js';
import { uniById, initials } from '../data/people.js';
import { navigate } from '../router.js';
import { modal, confirmModal, toast } from '../ui/overlay.js';
import { startTimerFlow } from './contests.js';
import { acceptance } from '../data/rounds.js';

const uniShort = (id) => uniById(id).name.replace('Университет ', '').replace(' им. Ломоносова', '').replace(' им. Баумана', '');
const clock = (ms) => { const s = Math.max(0, Math.floor(ms / 1000)); return `${pad2(Math.floor(s / 60))}:${pad2(s % 60)}`; };

function icsFor(n) {
  const s = roundStart(n), e = roundEnd(n), f = (d) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d+/, '');
  const text = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//sparq arena//demo//RU', 'BEGIN:VEVENT', `UID:qw${n}@sparq-arena-demo`, `DTSTAMP:${f(new Date())}`, `DTSTART:${f(s)}`, `DTEND:${f(e)}`, `SUMMARY:quantum weekly ${n}`, 'DESCRIPTION:Еженедельный раунд sparq arena (демо)', 'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
  const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([text], { type: 'text/calendar' })); a.download = `quantum-weekly-${n}.ics`; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

function analysisModal(n) {
  const tasks = roundTasks(n);
  modal({ title: `разбор · quantum weekly ${n}`, width: 720, body: raw(tasks.map((t, i) => `<details ${i === 0 ? 'open' : ''} style="border-top:1px solid var(--line-subtle);padding:12px 0"><summary style="cursor:pointer;font-weight:600">Q${i + 1} · ${esc(t.title)}</summary><div style="margin-top:10px">${t.analysis.map((p) => `<p class="secondary" style="margin-bottom:8px">${esc(p)}</p>`).join('')}<pre class="mono" style="background:var(--bg-inset);border:1px solid var(--line-subtle);border-radius:10px;padding:12px;overflow:auto;font-size:13px;line-height:20px;margin:8px 0 0">${esc(t.reference)}</pre></div></details>`).join('')), actions: [{ label: 'закрыть', kind: 'primary', value: true }] });
}

const header = (n, title, meta, right = '') => `<div class="col" style="gap:10px"><a class="btn btn-ghost sm" href="#/contests" style="align-self:flex-start;margin-left:-14px;color:var(--text-secondary)">${icon('arrow-l', 'sm')}все контесты</a>
  ${kicker(title)}<div class="row wrap" style="justify-content:space-between;align-items:flex-end;gap:16px"><h1 class="t-display md">${meta.title}</h1><div class="row wrap res-head-actions" style="gap:12px">${right}</div></div><div class="t-mono muted">${meta.sub}</div></div>`;

export default async function round(ctx) {
  const n = +ctx.params.round, sc = schedule();
  if (!Number.isInteger(n) || n > sc.next || n < 1) return { title: 'Раунд', nav: 'contests', html: `<div class="page"><div class="empty"><div class="ring">?</div><h3>Такого раунда нет</h3><p>Раунды выходят по воскресеньям, ближайший — ${sc.next}.</p><a class="btn btn-secondary" href="#/contests">к контестам</a></div></div>` };
  const gr = getRound(n), run = gr && gr.run;
  if (run && !run.finished) return run.mode === 'live' ? liveView(n, run) : timerView(n, run);
  if (run && run.finished) return resultsView(n, run, ctx);
  if (ctx.query.upsolve) return upsolveView(n);
  if (n === sc.next) return upcomingView(n);
  return resultsView(n, null, ctx);
}

// ---------- До старта: регистрация ----------

function upcomingView(n) {
  const start = roundStart(n), d = data(), reg = isRegistered(n);
  const last = d.history.length ? d.history[d.history.length - 1] : null;
  const view = html`<div class="page">
    ${raw(header(n, `раунд ${n}`, { title: `quantum weekly ${n}`, sub: `${dateLong(start)} · ${timeHM(start)} мск · 90 минут · 4 задачи · записались ${fmtInt(registeredCount(n))}` }))}
    <div class="two-col">
      <div class="col" style="gap:16px">
        <div class="card col" style="gap:18px"><h3 class="t-h3">как проходит раунд</h3><ul class="check-list">
          ${['4 задачи открываются в 12:00, решать можно в любом порядке.', 'Отправлять можно сколько угодно раз до 13:30, проверка — сразу.', 'ИИ-подсказки в раунде отключены, разбор — после итогов.', 'Рейтинг меняется только по итогам раунда.'].map((t) => html`<li>${raw(icon('check', 'sm'))}<span>${t}</span></li>`)}</ul></div>
        <div class="card col sched" style="gap:6px"><h3 class="t-h3" style="margin-bottom:6px">расписание</h3>
          ${[['12:00', 'задачи открываются'], ['13:30', 'приём решений закрыт'], ['15:00', 'итоги, изменение рейтинга, разбор']].map(([t, x]) => html`<div class="r"><span class="mono">${t}</span><span class="secondary">${x}</span></div>`)}</div>
      </div>
      <div class="col" style="gap:16px">
        <div class="card col" style="gap:14px"><div class="row" style="justify-content:space-between"><span class="row muted t-small">${raw(icon('clock', 'sm'))}до старта</span>${raw(countdownInline(start.getTime()))}</div>
          <div class="row wrap" style="gap:10px">${reg ? html`<button class="btn btn-secondary sm" id="reg">${raw(icon('check', 'sm'))}вы записаны · отменить</button><button class="btn btn-outline sm" id="ics">${raw(icon('calendar', 'sm'))}в календарь</button>` : html`<button class="btn btn-primary" id="reg">зарегистрироваться${raw(icon('arrow-r'))}</button>`}</div></div>
        ${last ? html`<div class="card col" style="gap:8px"><div class="t-kicker">ваш прошлый раунд</div><div>quantum weekly ${last.round} · <b>${last.place}-й из ${last.of}</b> · ${last.solved}/4 · рейтинг ${last.delta >= 0 ? '+' : ''}${last.delta}</div><a class="btn btn-outline sm" href="#/contests/${last.round}" style="align-self:flex-start">итоги ${last.round}${raw(icon('arrow-r', 'sm'))}</a></div>` : ''}
        <div class="demo-launch"><div class="col grow" style="gap:4px;min-width:220px"><div class="t-kicker">демо-режим</div><div class="secondary t-small">В демо раунды не привязаны к воскресенью: запустите свой экземпляр раунда сейчас. Таблица участников смоделирована и «играет» вместе с вашим таймером.</div></div><button class="btn btn-primary sm" id="launch">${raw(icon('play', 'sm'))}начать раунд сейчас</button></div>
      </div>
    </div></div>`;
  let stop = null;
  return {
    title: `quantum weekly ${n}`, nav: 'contests', html: view,
    mount(root) {
      stop = tickCountdowns(root);
      const needAuth = async () => { const v = await modal({ title: 'Нужен аккаунт', body: 'Чтобы записаться на раунд, войдите или зарегистрируйтесь.', actions: [{ label: 'позже', value: null }, { label: 'зарегистрироваться', kind: 'primary', value: 'reg' }, { label: 'войти', value: 'in' }] }); if (v === 'reg') navigate('/register'); else if (v === 'in') navigate('/login'); };
      root.querySelector('#reg').addEventListener('click', async () => {
        if (isGuest()) return needAuth();
        const on_ = !isRegistered(n); setRegistered(n, on_);
        navigate(`/contests/${n}`, { replace: true });
        if (on_) toast({ title: `Вы записаны на раунд ${n}`, text: 'Отменить можно той же кнопкой. В демо раунд запускается вручную.', kind: 'ok' });
      });
      const ics = root.querySelector('#ics'); if (ics) ics.addEventListener('click', () => icsFor(n));
      root.querySelector('#launch').addEventListener('click', async () => {
        if (isGuest()) return needAuth();
        if (!isRegistered(n)) setRegistered(n, true);
        const ok = await confirmModal({ title: `начать quantum weekly ${n} сейчас?`, text: 'Запустится демо-раунд: 4 задачи и 90 минут. Итоги изменят ваш рейтинг. Остановить таймер нельзя, но можно завершить досрочно.', ok: 'начать', cancel: 'отмена', icon: 'play' });
        if (!ok) return;
        startRun(n, 'live'); navigate(`/contests/${n}`, { replace: true });
      });
    },
    unmount() { stop && stop(); },
  };
}

// ---------- Раунд идёт ----------

function taskRowsFor(n, run, { locked = false } = {}) {
  const tasks = roundTasks(n), { perTask, N } = cohort(n);
  return tasks.map((t, j) => {
    const prog = run.progress[j], wrong = run.wrong[j];
    const sub = `${POINTS[j]} баллов · решили ${fmtInt(perTask[j])} из ${fmtInt(N)}${prog ? ` · принято в ${timeHM(new Date(run.startedAt + prog.at * 60000))}` : wrong ? ` · неверные отправки: ${wrong}` : ''}`;
    let kind = null;
    if (prog) kind = { k: 'ok', t: 'принято' };
    else if (locked) kind = { k: 'draft', t: 'приём закрыт' };
    else if (wrong) { const last = run.subs.find((s) => s.q === j + 1 && s.kind !== 'error'); kind = last ? { k: last.kind, t: last.label } : null; }
    return taskRowHtml({ q: j + 1, title: t.title, sub: esc(sub), level: t.level, kind, solved: !!prog, href: locked ? `#/contests/${n}/${j + 1}` : `#/contests/${n}/${j + 1}` });
  }).join('');
}

function mySubsCard(run) {
  if (!run.subs.length) return '';
  const pen = run.wrong.reduce((a, b) => a + b, 0) * PENALTY_MIN;
  return `<div class="card col" style="gap:8px"><div class="row" style="justify-content:space-between"><h3 class="t-h3" style="font-size:16px">мои отправки</h3><span class="mono muted" style="font-size:12px">штраф ${pen} мин</span></div>${run.subs.slice(0, 8).map((s) => `<div class="sub-row"><span class="mono muted">${timeHM(new Date(s.ts))}</span><span class="mono">Q${s.q}</span>${statusHtml(s.kind, s.label)}<span class="time">${s.kind === 'ok' ? `+${POINTS[s.q - 1]}` : s.kind === 'error' ? '—' : `+${PENALTY_MIN} мин`}</span></div>`).join('')}</div>`;
}

function liveView(n, run) {
  const d = data(), user = currentUser(), start = new Date(run.startedAt), end = new Date(run.endsAt);
  const expired = isExpired(run);
  const view = html`<div>
    <div class="rbar"><div class="rbar-in">
      <div class="row" style="gap:20px"><a class="btn btn-ghost sm" href="#/contests">${raw(icon('arrow-l', 'sm'))}все контесты</a><div class="col" style="gap:2px"><div class="row" style="gap:12px"><b class="t-h3">quantum weekly ${n}</b>${raw(statusHtml(expired ? 'draft' : 'live', expired ? 'завершён' : 'идёт'))}</div><span class="muted t-mono-s">${dateShort(start)} · ${timeHM(start)}–${timeHM(end)} · демо-раунд</span></div></div>
      <div class="tl"><div class="row" style="justify-content:space-between"><span class="row muted t-small">${raw(icon(expired ? 'lock' : 'clock', 'sm'))}${expired ? 'время вышло' : 'осталось'}</span><span class="big-clock" data-clock></span></div><div class="bar"><i data-bar></i></div><div class="ends"><span>${timeHM(start)}</span><span>${timeHM(end)}</span></div></div>
      <div class="myres"><div class="muted t-mono-s">мой результат${expired ? ' · предварительно' : ''}</div><div class="t-number-s" data-me-place>—</div><div class="t-small" data-me-sub></div></div>
    </div></div>
    <div class="page" style="padding-top:32px">
      ${expired ? html`<div class="card row" style="gap:16px;padding:18px 22px">${raw(icon('lock'))}<div class="grow"><b>Приём решений закрыт</b><div class="secondary t-small">Итоги, изменение рейтинга и разбор — по кнопке. Задачи можно открыть и посмотреть свои отправки.</div></div><button class="btn btn-outline sm" id="finish">итоги${raw(icon('arrow-r', 'sm'))}</button></div>` : ''}
      <div class="two-col" style="grid-template-columns:minmax(0,1fr) minmax(0,1.1fr)">
        <div class="col" style="gap:16px"><div class="sec-head"><h2 class="t-h2">задачи</h2><span class="muted t-mono-s">4 задачи · 800 баллов</span></div>
          <div class="col" style="gap:12px">${raw(taskRowsFor(n, run, { locked: expired }))}</div>${raw(mySubsCard(run))}
          ${expired ? '' : html`<button class="btn btn-ghost sm" id="early" style="align-self:flex-start">${raw(icon('x', 'sm'))}завершить досрочно</button>`}</div>
        <div class="card flush" id="live"><div class="row" style="padding:18px 20px;justify-content:space-between"><h3 class="t-h2" style="font-size:20px">таблица · ${expired ? 'заморожена' : 'вживую'}</h3><div class="segmented sm" id="seg"><button data-u="" aria-pressed="true">все</button><button data-u="${user ? user.uni : ''}" aria-pressed="false">${user ? uniShort(user.uni) : 'вуз'}</button></div></div><div id="tbl"></div></div>
      </div>
    </div></div>`;
  let timer = null, stop = null, uni = '';
  return {
    title: `quantum weekly ${n}`, nav: 'contests', html: view,
    mount(root) {
      const update = () => {
        const now = Date.now(), el = Math.min(now, run.endsAt) - run.startedAt, left = run.endsAt - now;
        root.querySelector('[data-clock]').textContent = expired ? '0:00' : clock(left);
        root.querySelector('[data-bar]').style.width = Math.min(100, el / ROUND_MS * 100) + '%';
        const tb = liveTable(n, Math.floor(el / 60000), run.progress, { uni: uni || null });
        const me = scoreProgress(run.progress);
        root.querySelector('[data-me-place]').textContent = `${tb.place}-е`;
        root.querySelector('[data-me-sub]').textContent = `${me.count} из 4 · ${me.score} баллов`;
        const rows = tb.rows.slice(0, 5).map((r, i) => ({ rank: i + 1, name: r.person.name, uni: uniShort(r.person.uni), avatar: avatar(r.person.name, 'sm'), cells: r.cells, count: r.count, time: r.time ? `${pad2(Math.floor(r.time / 60))}:${pad2(r.time % 60)}` : '—' }));
        const wrongOf = (j) => run.wrong[j] > 0 && !run.progress[j];
        const meRow = { rank: tb.place, name: user.name, uni: uniShort(user.uni), avatar: avatar(user.name, 'sm me', user.avatar), cells: run.progress.map((p, j) => (p ? 'ok' : wrongOf(j) ? 'no' : 'none')), count: me.count, time: me.time ? `${pad2(Math.floor(me.time / 60))}:${pad2(me.time % 60)}` : '—' };
        root.querySelector('#tbl').innerHTML = standingsTable(rows, meRow, { note: expired ? 'Места станут окончательными после проверки итогов.' : 'Строка «вы» закреплена. Время — с начала раунда плюс штраф за неверные отправки. Участники смоделированы.' });
        if (expired && root.querySelector('[data-clock]')) root.querySelector('[data-clock]').classList.add('muted');
        if (!expired && left <= 0) navigate(`/contests/${n}`, { replace: true });
      };
      update(); timer = setInterval(update, 1000);
      on(root.querySelector('#seg'), 'click', '[data-u]', (e, b) => { uni = b.dataset.u; root.querySelectorAll('#seg button').forEach((x) => x.setAttribute('aria-pressed', x === b)); update(); });
      const early = root.querySelector('#early');
      if (early) early.addEventListener('click', async () => { if (await confirmModal({ title: 'завершить раунд досрочно?', text: 'Результат зафиксируется сейчас, изменение рейтинга будет посчитано по текущему результату. Вернуться и продолжить нельзя.', ok: 'завершить', cancel: 'отмена', icon: 'check' })) { finishRun(n, { early: true }); navigate(`/contests/${n}`, { replace: true }); } });
      const fin = root.querySelector('#finish'); if (fin) fin.addEventListener('click', () => { finishRun(n); navigate(`/contests/${n}`, { replace: true }); });
    },
    unmount() { clearInterval(timer); stop && stop(); },
  };
}

function timerView(n, run) {
  const start = new Date(run.startedAt);
  const me = scoreProgress(run.progress);
  const view = html`<div>
    <div class="rbar"><div class="rbar-in">
      <div class="row" style="gap:20px"><a class="btn btn-ghost sm" href="#/contests">${raw(icon('arrow-l', 'sm'))}все контесты</a><div class="col" style="gap:2px"><b class="t-h3">quantum weekly ${n}</b><span class="muted t-small row" style="gap:10px">${dateShort(roundStart(n))} · ${fmtInt(participantsOf(n))} участников · проходите для себя <span class="status" style="height:20px">не в рейтинге</span></span></div></div>
      <div class="tl"><div class="row" style="justify-content:space-between"><span class="row muted t-small">${raw(icon('clock', 'sm'))}личный таймер</span><span class="big-clock" data-clock></span></div><div class="bar"><i data-bar></i></div><div class="ends"><span>0 мин</span><span>90 мин</span></div></div>
      <div class="myres"><div class="muted t-mono-s">мой результат</div><div class="t-number-s" style="font-size:16px">решено ${me.count} из 4</div></div>
    </div></div>
    <div class="page" style="padding-top:32px"><div class="two-col" style="grid-template-columns:minmax(0,1.1fr) minmax(0,1fr)">
      <div class="col" style="gap:16px"><div class="sec-head"><h2 class="t-h2">задачи</h2><span class="muted t-mono-s">4 задачи · с таймером</span></div><div class="col" style="gap:12px">${raw(taskRowsFor(n, run))}</div>${raw(mySubsCard(run))}</div>
      <div class="card col" style="gap:16px"><h3 class="t-h3">правила раунда с таймером</h3><ul class="check-list">
        ${[['clock', 'Таймер личный: 90 минут с момента старта, остановить нельзя.'], ['bars', `В конце сравним с участниками раунда ${n} и покажем, каким местом вы были бы.`], ['growth', 'Рейтинг не меняется, результат появится в профиле.'], ['book', 'Разбор задач открыт после завершения.'], ['doc', 'Баллы и штраф за неверные отправки — как в раунде.'], ['ext', 'Можно уйти со страницы — таймер продолжит идти.']].map(([ic, t]) => html`<li>${raw(icon(ic, 'sm'))}<span>${t}</span></li>`)}</ul>
        <hr class="hr"><button class="btn btn-outline sm" id="early" style="align-self:flex-start">${raw(icon('x', 'sm'))}завершить досрочно</button></div>
    </div></div></div>`;
  let timer = null;
  return {
    title: `quantum weekly ${n}`, nav: 'contests', html: view,
    mount(root) {
      const upd = () => { const left = run.endsAt - Date.now(); root.querySelector('[data-clock]').textContent = clock(left); root.querySelector('[data-bar]').style.width = Math.min(100, (ROUND_MS - left) / ROUND_MS * 100) + '%'; if (left <= 0) { finishRun(n); navigate(`/contests/${n}`, { replace: true }); } };
      upd(); timer = setInterval(upd, 1000);
      root.querySelector('#early').addEventListener('click', async () => { if (await confirmModal({ title: 'завершить досрочно?', text: 'Результат зафиксируется сейчас. Вернуться и продолжить нельзя.', ok: 'завершить', cancel: 'отмена', icon: 'check' })) { finishRun(n, { early: true }); navigate(`/contests/${n}`, { replace: true }); } });
    },
    unmount() { clearInterval(timer); },
  };
}

// ---------- Итоги ----------

function resultsView(n, run, ctx) {
  const start = roundStart(n), d = data(), { rows, N, perTask } = cohort(n), tasks = roundTasks(n);
  const res = run && run.result, timer = run && run.mode === 'timer';
  const top3b = rows.slice(0, 3).map((r) => ({ name: r.person.name, sub: uniShort(r.person.uni), score: `${r.count}/4 · ${r.score} · ${r.time} мин` }));
  const userSolved = run ? run.progress.map((p) => !!p) : [];
  const rightBtns = `${res ? `<button class="btn btn-outline sm" id="tbl-btn">${icon('bars', 'sm')}таблица раунда</button>` : `<button class="btn btn-outline sm" id="tbl-btn">${icon('bars', 'sm')}таблица раунда</button>`}${res ? `<a class="btn btn-secondary sm" href="#/contests/${n}?upsolve=1">${icon('refresh', 'sm')}дорешать</a>` : `<button class="btn btn-secondary sm" id="timer">${icon('clock', 'sm')}с таймером</button>`}<button class="btn btn-primary sm" id="analysis">${icon('book', 'sm')}разбор задач</button>`;
  const head = header(n, timer ? `раунд ${n} · с таймером` : `раунд ${n}`, { title: `quantum weekly ${n}`, sub: `${dateLong(start)} · ${fmtInt(participantsOf(n))} участников · ${tasks.length} задачи · 90 минут${!res ? ' · итоги подведены' : ''}` }, rightBtns);
  const personal = res ? (timer
    ? html`<div class="res-grid" style="grid-template-columns:2fr 1fr 1fr"><div class="card col" style="gap:8px"><div class="t-kicker">вы были бы</div><div class="row" style="align-items:baseline;gap:16px"><span class="t-number-xl nowrap">${res.place}-й</span><span class="secondary">из ${fmtInt(res.of)} участников раунда</span></div></div><div class="card col" style="gap:6px"><div class="t-mono-s muted">рейтинг</div><div class="t-number">${d.rating == null ? '—' : fmtInt(d.rating)}</div><div class="t-mono-s">не меняется</div></div><div class="card col" style="gap:6px"><div class="t-mono-s muted">таймер</div><div class="t-number">${run.early ? Math.max(1, Math.round((run.finishedAt - run.startedAt) / 60000)) : 90} мин</div><div class="t-mono-s">личный, без пауз</div></div></div>`
    : html`<div class="res-grid"><div class="card col" style="gap:8px"><div class="t-kicker">ваше место</div><div class="row" style="align-items:baseline;gap:16px"><span class="t-number-xl nowrap">${res.place}-й</span><span class="secondary">из ${fmtInt(res.of)} · ${Math.max(1, Math.round(res.time))} мин${res.time !== undefined && run.wrong.some((w) => w) ? ' со штрафом' : ''}</span></div></div>
      <div class="card col" style="gap:6px"><div class="t-mono-s muted">решено</div><div class="t-number">${res.count} из 4</div><div class="t-mono-s">${[0, 1, 2, 3].filter((j) => !userSolved[j]).map((j) => 'Q' + (j + 1)).join(', ') || 'всё'}${userSolved.every(Boolean) ? '' : ' не решено'}</div></div>
      <div class="card col" style="gap:6px"><div class="t-mono-s muted">баллы</div><div class="t-number">${res.score}</div><div class="t-mono-s">у топ-3 — ${rows[2] ? rows[2].score : 0}</div></div>
      <div class="card col" style="gap:6px"><div class="t-mono-s muted">рейтинг</div><div class="t-number ${res.delta >= 0 ? 'ok' : ''}">${res.delta >= 0 ? '+' : '−'}${Math.abs(res.delta)}</div><div class="t-mono-s">${fmtInt(res.before)} → ${fmtInt(res.after)}</div></div></div>`)
    : html`<div class="card row" style="gap:16px;padding:20px 24px">${raw(icon('clock'))}<div class="grow"><b>Вы не участвовали в этом раунде</b><div class="secondary t-small">Пройдите его с личным таймером: те же 4 задачи, 90 минут, место сравнится с участниками раунда. Рейтинг не изменится.</div></div></div>`;
  const view = html`<div class="page">${raw(head)}${personal}
    <div class="two-col" style="grid-template-columns:minmax(0,1.3fr) minmax(0,1fr)">
      <div class="card col" style="gap:8px"><div class="t-kicker">топ-3 раунда</div>${raw(podiumHtml(top3b))}</div>
      <div class="card col" style="gap:4px"><div class="t-kicker">задачи и решаемость</div>
        ${tasks.map((t, j) => html`<div class="row res-task" style="gap:12px;padding:12px 0;border-bottom:1px solid var(--line-subtle)"><span class="mono muted" style="width:28px">Q${j + 1}</span><div class="grow"><b>${t.title}</b><div class="rate" style="margin-top:6px"><span class="progress" style="width:110px"><i style="width:${perTask[j] / N * 100}%"></i></span><span class="mono muted" style="font-size:12px">${Math.round(perTask[j] / N * 100)} % · решили ${fmtInt(perTask[j])} из ${fmtInt(N)}</span></div></div>${res ? html`<span class="qcell ${userSolved[j] ? 'ok' : ''}">${raw(userSolved[j] ? icon('check', 'sm') : '·')}</span>` : ''}<button class="btn btn-outline xs" data-an="${j}">разбор</button></div>`)}
        ${res ? html`<div class="muted t-small" style="margin-top:6px">вы: ${res.count} из 4 · ${res.count < 4 ? 'нерешённые можно дорешать' : 'все решены'}</div>` : ''}</div>
    </div>
    <div class="card flush" id="tbl-card" hidden><div class="row" style="padding:16px 20px"><h3 class="t-h3 grow">таблица раунда</h3><span class="muted t-mono-s">первые 25 участников · смоделированы</span></div><div id="tbl"></div></div>
  </div>`;
  return {
    title: `итоги ${n}`, nav: 'contests', html: view,
    mount(root) {
      root.querySelector('#analysis').addEventListener('click', () => analysisModal(n));
      on(root, 'click', '[data-an]', (e, b) => { const t = tasks[+b.dataset.an]; modal({ title: `разбор · ${t.title}`, width: 640, body: raw(`${t.analysis.map((p) => `<p class="secondary" style="margin-bottom:10px">${esc(p)}</p>`).join('')}<pre class="mono" style="background:var(--bg-inset);border:1px solid var(--line-subtle);border-radius:10px;padding:14px;overflow:auto;font-size:13px;line-height:20px;margin:8px 0 0">${esc(t.reference)}</pre>`), actions: [{ label: 'закрыть', kind: 'primary', value: true }] }); });
      const tb = root.querySelector('#tbl-btn'), card = root.querySelector('#tbl-card');
      tb.addEventListener('click', () => {
        card.hidden = !card.hidden;
        if (!card.hidden) {
          const list = rows.slice(0, 25).map((r) => ({ rank: r.rank, name: r.person.name, uni: uniShort(r.person.uni), avatar: avatar(r.person.name, 'sm'), cells: r.solved.map((ok, j) => (ok ? 'ok' : r.wrong[j] ? 'no' : 'none')), count: r.count, time: `${pad2(Math.floor(r.time / 60))}:${pad2(r.time % 60)}` }));
          root.querySelector('#tbl').innerHTML = standingsTable(list, null);
          card.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
      const t = root.querySelector('#timer'); if (t) t.addEventListener('click', () => startTimerFlow(n));
    },
  };
}

function upsolveView(n) {
  const tasks = roundTasks(n), d = data();
  const view = html`<div class="page narrow">${raw(header(n, `раунд ${n} · дорешивание`, { title: `quantum weekly ${n}`, sub: 'Задачи раунда открыты как обычные задачи банка: на рейтинг они не влияют.' }))}
    <div class="col" style="gap:12px">${tasks.map((t, j) => html`<a class="rtask" href="#/tasks/${t.num}"><span class="rt-q mono">Q${j + 1}</span><span class="rt-main"><span class="rt-title">${t.title}</span><span class="rt-sub">№ ${t.num} · ${t.topic}</span></span><span class="rt-diff">${raw(diffHtml(t.level))}</span><span class="rt-st">${d.solved[t.id] ? raw(statusHtml('ok')) : ''}</span>${raw(icon('chev-r', 'sm'))}</a>`)}</div>
    <a class="btn btn-outline sm" href="#/contests/${n}" style="align-self:flex-start">${raw(icon('arrow-l', 'sm'))}к итогам</a></div>`;
  return { title: `дорешивание ${n}`, nav: 'contests', html: view };
}
