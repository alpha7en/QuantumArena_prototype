import { html, raw, esc, dateShort, timeHM, fmtInt, ruPlural } from '../ui/dom.js';
import { icon } from '../ui/icons.js';
import { kicker, statusHtml, countdownBig, tickCountdowns, podiumHtml, sectionHead } from '../ui/parts.js';
import { Board } from '../ui/board.js';
import { Circuit } from '../quantum/circuit.js';
import { runOps } from '../quantum/sim.js';
import { formatState } from '../quantum/format.js';
import { TASKS } from '../data/tasks.js';
import { schedule, roundStart } from '../data/rounds.js';
import { uniStats } from '../data/people.js';
import { data, isGuest, mutate } from '../store.js';
import { navigate } from '../router.js';
import { toast } from '../ui/overlay.js';

export default async function home() {
  const sc = schedule(), start = roundStart(sc.next), d = data();
  const solved = Object.keys(d.solved).length;
  const registered = !!(d.rounds[sc.next] && d.rounds[sc.next].registered);
  const top = uniStats().slice(0, 3).map((u) => ({ name: uniLabel(u.id), sub: `${u.count} ${ruPlural(u.count, 'участник', 'участника', 'участников')}`, score: fmtInt(u.sum) }));
  const hero = TASKS.length;
  const bell = new Circuit(2); bell.h(0); bell.cx(0, 1); bell.autoColumns();
  const st = runOps(bell.ops, 2), formula = formatState(st).text;

  const view = html`
  <div class="page home">
    <section class="hero">
      <div class="hero-text">
        ${raw(kicker('квантовый задачник'))}
        <h1 class="t-display">собирай схемы.<br>проверяй<br>на симуляторе.</h1>
        <p class="t-lead" style="max-width:560px">${hero} ${ruPlural(hero, 'задача', 'задачи', 'задач')} — от состояния Белла до кода Шора, еженедельные раунды и рейтинг вузов. Решение принимается, только если схема даёт нужное состояние и укладывается в лимиты.</p>
        <div class="row wrap" style="gap:12px">
          <a class="btn btn-primary" href="#/tasks${solved ? '' : '/1'}">${solved ? 'продолжить решать' : 'начать решать'}${raw(icon('arrow-r'))}</a>
          <a class="btn btn-outline" href="#/contests">${raw(icon('clock'))}раунд ${sc.next} · ${dateShort(start).slice(0, 2)} ${timeHM(start)}</a>
        </div>
        ${isGuest() ? html`<p class="muted t-small">Смотреть задачи и рейтинг можно без входа.</p>` : ''}
      </div>
      <div class="hero-demo card xl">
        <div class="hero-arc"></div>
        <div class="row" style="gap:12px"><span class="t-small-strong">задача 1 · состояние Белла</span>${raw(statusHtml('ok'))}</div>
        <div id="hero-board"></div>
        <div class="state-strip"><span class="k">состояние</span><span class="mono">${formula}</span></div>
      </div>
    </section>

    <section class="col" style="gap:24px">
      <h2 class="t-h2">как устроено решение</h2>
      <div class="steps3">
        ${step('01', 'собери схему', 'Перетаскивайте гейты на провода или пишите на Qiskit — схема и код синхронны.', 'sliders')}
        ${step('02', 'смотри состояние', 'Вероятности, формула состояния и диски на проводах обновляются сразу, без запуска.', 'play')}
        ${step('03', 'отправь', 'Проверка на симуляторе: набор входов и лимиты, в раундах — ещё и шум. Задачи банка растят прогресс, раунды — рейтинг.', 'upload')}
      </div>
    </section>

    <section class="col" style="gap:24px">
      ${raw(sectionHead('сейчас на арене', '<a class="btn btn-outline sm" href="#/rating">весь рейтинг' + icon('arrow-r') + '</a>'))}
      <div class="now-grid">
        <div class="card next-round">
          <div class="row">${raw(kicker('ближайший раунд'))}<span class="spacer"></span>${raw(statusHtml('draft', 'регистрация открыта'))}</div>
          <h3 class="t-h2" style="margin-top:12px;font-size:28px;line-height:36px">quantum weekly ${sc.next}</h3>
          <div class="t-mono muted">${dateShort(start)} · ${timeHM(start)} мск · 90 минут · 4 задачи</div>
          ${raw(countdownBig(start.getTime()))}
          <button class="btn ${registered ? 'btn-secondary' : 'btn-primary'}" id="reg-btn" style="align-self:flex-start">${registered ? html`${raw(icon('check'))}вы записаны` : 'зарегистрироваться'}</button>
        </div>
        <div class="card">
          <div class="col" style="gap:4px"><h3 class="t-h2">вузы сезона</h3><div class="t-mono-s muted">осень 2026 · сумма рейтинга топ-10 студентов · демо-данные</div></div>
          ${raw(podiumHtml(top, { kind: 'uni' }))}
        </div>
      </div>
    </section>
  </div>`;

  let stop = null;
  return {
    title: 'Квантовые задачи', nav: null, html: view,
    mount(root) {
      const b = new Board(root.querySelector('#hero-board'), { density: 'mini', circuit: bell, cols: 3, fixedCols: true, readOnly: true, wireInit: ['0', '0'], state: st, showDisks: true });
      stop = tickCountdowns(root);
      root.querySelector('#reg-btn').addEventListener('click', () => {
        if (isGuest()) { navigate('/register'); return; }
        navigate(`/contests/${sc.next}`);
      });
    },
    unmount() { stop && stop(); },
  };
}

function step(n, title, text, ic) {
  return html`<div class="card step3-card"><div class="row"><span class="t-number muted step-n">${n}</span><span class="spacer"></span>${raw(icon(ic))}</div><h3 class="t-h2" style="margin-top:20px">${title}</h3><p class="secondary" style="margin-top:12px">${text}</p></div>`;
}
import { uniById } from '../data/people.js';
const uniLabel = (id) => uniById(id).name;
