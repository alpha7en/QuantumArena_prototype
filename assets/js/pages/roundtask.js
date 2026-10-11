import { html, raw, esc, on, timeHM, fmtInt, pad2 } from '../ui/dom.js';
import { icon } from '../ui/icons.js';
import { statusHtml, diffHtml } from '../ui/parts.js';
import { taskRowHtml } from '../ui/rounds_ui.js';
import { currentUser } from '../store.js';
import { cohort, roundTasks, POINTS, PENALTY_MIN, ROUND_MS, scoreProgress, roundStart, participantsOf } from '../data/rounds.js';
import { getRound, isExpired } from '../data/roundstate.js';
import { navigate } from '../router.js';
import { modal } from '../ui/overlay.js';

const clock = (ms) => { const s = Math.max(0, Math.floor(ms / 1000)); return `${pad2(Math.floor(s / 60))}:${pad2(s % 60)}`; };

export default async function roundTask(ctx) {
  const n = +ctx.params.round, q = +ctx.params.q;
  const gr = getRound(n), run = gr && gr.run;
  if (!run || run.finished || !(q >= 1 && q <= 4)) { navigate(`/contests/${n}`, { replace: true }); return { title: 'Раунд', nav: 'contests', html: '' }; }
  const tasks = roundTasks(n), t = tasks[q - 1], j = q - 1, { perTask, N } = cohort(n);
  const expired = isExpired(run);
  const subs = run.subs.filter((s) => s.q === q), last = subs[0];
  const me = scoreProgress(run.progress);
  const prog = run.progress[j];
  const feedback = last ? (last.kind === 'ok' ? 'Решение принято. Баллы засчитаны.' : last.kind === 'limit' ? 'Ответ верный, но схема нарушает ограничения задачи. Сократите число гейтов или глубину, не меняя результат.' : last.kind === 'error' ? 'Код не удалось выполнить. Попытка не засчитана, штрафа нет.' : 'Ответ не совпал с ожидаемым. Проверьте состояние на вкладке «состояние» и фазы.') : '';
  const view = html`<div>
    <div class="rbar"><div class="rbar-in">
      <div class="row" style="gap:20px"><a class="btn btn-ghost sm" href="#/contests/${n}">${raw(icon('arrow-l', 'sm'))}quantum weekly ${n}</a>
        <div class="tl" style="min-width:230px"><div class="row" style="justify-content:space-between"><span class="row muted t-small">${raw(icon('clock', 'sm'))}${expired ? 'время вышло' : 'осталось'}</span><span class="t-number-s" data-clock></span></div><div class="bar"><i data-bar></i></div></div></div>
      <div class="segmented" style="justify-self:center"><a class="btn btn-ghost icon-btn" href="#/contests/${n}/${Math.max(1, q - 1)}" aria-label="назад">${raw(icon('chev-l', 'sm'))}</a>${[1, 2, 3, 4].map((i) => `<button onclick="location.hash='#/contests/${n}/${i}'" aria-pressed="${i === q}">Q${i}</button>`).join('')}<a class="btn btn-ghost icon-btn" href="#/contests/${n}/${Math.min(4, q + 1)}" aria-label="вперёд">${raw(icon('chev-r', 'sm'))}</a></div>
      <div class="myres"><div class="muted t-mono-s">мой результат</div><div class="t-number-s" style="font-size:16px">${me.count} из 4 · ${me.score} баллов</div></div>
    </div></div>
    <div class="page" style="padding-top:32px"><div class="two-col" style="grid-template-columns:minmax(0,.9fr) minmax(0,1.1fr)">
      <div class="card col" style="gap:14px"><div class="row mono muted" style="gap:10px;font-size:13px">Q${q} · ${POINTS[j]} баллов ${raw(diffHtml(t.level))}</div><h1 class="t-h2" style="font-size:28px;line-height:34px">${t.title}</h1>
        ${t.statement.map((p) => html`<p class="secondary">${p.replace(/`/g, '')}</p>`)}
        <div class="io-box"><div class="io-row"><span class="k">вход</span><span>${t.io.in}</span></div><div class="io-row"><span class="k">цель</span><span>${t.io.out}</span></div></div>
        <div class="muted t-small">решили ${fmtInt(perTask[j])} из ${fmtInt(N)}</div></div>
      <div class="col" style="gap:16px">
        ${last ? html`<div class="card col" style="gap:12px"><div class="row" style="gap:12px"><h3 class="t-h3">отправка ${subs.length}</h3>${raw(statusHtml(last.kind, last.label))}<span class="spacer"></span><span class="mono muted" style="font-size:13px">${last.kind === 'ok' ? `+${POINTS[j]}` : last.kind === 'error' ? '' : `+${PENALTY_MIN} мин`}</span></div><p class="secondary">${feedback}</p>
          <div class="row" style="gap:10px"><a class="btn btn-primary sm" href="#/tasks/${t.num}?r=${n}&q=${q}">открыть в редакторе${raw(icon('arrow-r', 'sm'))}</a></div></div>
          <div class="card col" style="gap:6px"><h3 class="t-h3" style="font-size:16px">отправки по Q${q}</h3>${subs.map((s, i) => html`<div class="sub-row"><span class="mono muted">#${subs.length - i}</span>${raw(statusHtml(s.kind, s.label))}<span class="time">${timeHM(new Date(s.ts))}${s.kind === 'ok' || s.kind === 'error' ? '' : ` · +${PENALTY_MIN} мин`}</span></div>`)}<div class="muted t-small">штраф по раунду: +${run.wrong.reduce((a, b) => a + b, 0) * PENALTY_MIN} мин · без подсказок ИИ</div></div>`
          : html`<div class="card col" style="gap:12px"><h3 class="t-h3">решение</h3><p class="secondary">Отправок по этой задаче пока нет. Откройте редактор, соберите схему и отправьте — проверка сработает сразу.</p><a class="btn btn-primary sm" href="#/tasks/${t.num}?r=${n}&q=${q}" style="align-self:flex-start">открыть в редакторе${raw(icon('arrow-r', 'sm'))}</a></div>`}
        <h3 class="t-h2" style="font-size:20px;margin-top:8px">другие задачи раунда</h3>
        <div class="col" style="gap:12px">${raw(tasks.map((x, k) => (k === j ? '' : taskRowHtml({ q: k + 1, title: x.title, sub: esc(`${POINTS[k]} баллов · решили ${fmtInt(perTask[k])}`), level: x.level, kind: run.progress[k] ? { k: 'ok', t: 'принято' } : null, solved: !!run.progress[k], href: `#/contests/${n}/${k + 1}` }))).join(''))}</div>
      </div></div></div></div>`;
  let timer = null;
  return {
    title: `Q${q} · quantum weekly ${n}`, nav: 'contests', html: view,
    mount(root) {
      const upd = () => { const left = run.endsAt - Date.now(); root.querySelector('[data-clock]').textContent = expired ? '0:00' : clock(left); root.querySelector('[data-bar]').style.width = Math.min(100, (ROUND_MS - Math.max(0, left)) / ROUND_MS * 100) + '%'; };
      upd(); timer = setInterval(upd, 1000);
    },
    unmount() { clearInterval(timer); },
  };
}
