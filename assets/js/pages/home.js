import { html, raw, esc, dateShort, timeHM, fmtInt, ruPlural } from '../ui/dom.js';
import { icon } from '../ui/icons.js';
import { kicker, statusHtml, countdownBig, tickCountdowns, podiumHtml, sectionHead } from '../ui/parts.js';
import { Board } from '../ui/board.js';
import { Circuit } from '../quantum/circuit.js';
import { runOps } from '../quantum/sim.js';
import { formatState } from '../quantum/format.js';
import { TASKS, taskById, ARCHETYPES } from '../data/tasks.js';
import { buildFromCode } from '../lang/qiskitlite.js';
import { diffHtml } from '../ui/parts.js';
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
  const counts = Object.keys(ARCHETYPES).map((k) => TASKS.filter((t) => t.archetype === k).length);
  const starters = ['bell', 'teleport', 'grover-2'].map(taskById);
  const bell = new Circuit(2); bell.h(0); bell.cx(0, 1); bell.autoColumns();
  const st = runOps(bell.ops, 2), formula = formatState(st).text;

  const view = html`
  <div class="page home">
    <section class="hero-wrap">
      <div class="hero-bg" aria-hidden="true"><i class="stripes"></i><i class="sphere"></i><i class="bg-node sphere-node"></i></div>
      <div class="hero">
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
        <div class="row" style="gap:12px"><span class="t-small-strong">задача 1 · состояние Белла</span>${raw(statusHtml('ok'))}</div>
        <div id="hero-board"></div>
        <div class="state-strip"><span class="k">состояние</span><span class="mono">${formula}</span></div>
      </div>
      </div>
    </section>

    <div class="sec-wires" aria-hidden="true"></div>

    <section class="stats-strip" aria-label="коротко о платформе">
      ${raw(statCell('в банке', `${TASKS.length}`, `${ruPlural(TASKS.length, 'задача', 'задачи', 'задач')}`, `${Object.keys(ARCHETYPES).length} типов · 3 уровня сложности`, vizBars(counts)))}
      ${raw(statCell('проверка', '3', 'шага', 'лимиты → входы → шум', vizSteps()))}
      ${raw(statCell('решение', '2', 'режима', 'схема и код на Qiskit, синхронно', vizModes()))}
      ${raw(statCell('раунд', '90', 'минут', '4 задачи, воскресенье 12:00 мск', vizRing()))}
    </section>

    <section class="col" style="gap:24px">
      <h2 class="t-h2">как устроено решение</h2>
      <div class="steps3">
        ${step('01', 'собери схему', 'Перетаскивайте гейты на провода или пишите на Qiskit — схема и код синхронны.', 'sliders', vizGates())}
        ${step('02', 'смотри состояние', 'Вероятности, формула состояния и диски на проводах обновляются сразу, без запуска.', 'play', vizProbs())}
        ${step('03', 'отправь', 'Проверка на симуляторе: набор входов и лимиты, в раундах — ещё и шум. Задачи банка растят прогресс, раунды — рейтинг.', 'upload', vizVerdict())}
      </div>
    </section>

    <section class="col" style="gap:24px">
      ${raw(sectionHead('с чего начать', '<a class="btn btn-outline sm" href="#/tasks">все задачи' + icon('arrow-r') + '</a>'))}
      <div class="starter">
        ${starters.map((t) => html`<a class="card starter-card" href="#/tasks/${t.num}"><div class="mini-board" data-mini="${t.id}"></div><div class="col" style="gap:8px"><div class="row" style="gap:10px"><span class="pill">${t.topic}</span><span class="spacer"></span>${raw(diffHtml(t.level))}</div><h3 class="t-h3" style="font-size:18px;line-height:26px">${t.title}</h3><div class="row muted t-mono-s" style="gap:10px"><span>№ ${t.num}</span><span>${t.limits && t.limits.gates ? 'гейтов ≤ ' + t.limits.gates : ''}</span><span class="spacer"></span><span class="starter-go">решить${raw(icon('arrow-r', 'sm'))}</span></div></div></a>`)}
      </div>
    </section>

    <section class="col" style="gap:24px">
      ${raw(sectionHead('сейчас на арене', '<a class="btn btn-outline sm" href="#/rating">весь рейтинг' + icon('arrow-r') + '</a>'))}
      <div class="now-grid">
        <div class="card next-round deco deco-trace" style="--ds:320px">
          <div class="row">${raw(kicker('ближайший раунд'))}<span class="spacer"></span>${raw(statusHtml('draft', 'регистрация открыта'))}</div>
          <h3 class="t-h2" style="margin-top:12px;font-size:28px;line-height:36px">quantum weekly ${sc.next}</h3>
          <div class="t-mono muted">${dateShort(start)} · ${timeHM(start)} мск · 90 минут · 4 задачи</div>
          ${raw(countdownBig(start.getTime()))}
          <ul class="mini-rules">
            <li>${raw(icon('doc', 'sm'))}<span>4 задачи, 800 баллов, решать можно в любом порядке</span></li>
            <li>${raw(icon('alert', 'sm'))}<span>неверная отправка — штраф +5 минут</span></li>
            <li>${raw(icon('growth', 'sm'))}<span>рейтинг меняется только по итогам раунда</span></li>
          </ul>
          <button class="btn ${registered ? 'btn-secondary' : 'btn-primary'}" id="reg-btn" style="align-self:flex-start;margin-top:auto">${registered ? html`${raw(icon('check'))}вы записаны` : 'зарегистрироваться'}</button>
        </div>
        <div class="card deco deco-interf no-node" style="--ds:520px;--dx:-120px;--dy:-90px;--do:.07;overflow:hidden">
          <div class="col" style="gap:4px"><h3 class="t-h2">вузы сезона</h3><div class="t-mono-s muted">осень 2026 · сумма рейтинга топ-10 студентов · демо-данные</div></div>
          ${raw(podiumHtml(top, { kind: 'uni' }))}
        </div>
      </div>
    </section>
  </div>`;

  let stop = null;
  return {
    title: 'Квантовые задачи', nav: null, bg: 'haze', html: view,
    mount(root) {
      const b = new Board(root.querySelector('#hero-board'), { density: 'mini', circuit: bell, cols: 3, fixedCols: true, readOnly: true, wireInit: ['0', '0'], state: st, showDisks: true });
      root.querySelectorAll('[data-mini]').forEach((el) => {
        const t = taskById(el.dataset.mini);
        const r = buildFromCode(t.reference, { oracleArity: t.oracleArity || 0 });
        if (r.error) return;
        new Board(el, { density: 'preview', circuit: r.circuit.clone().autoColumns(), cols: Math.min(Math.max(3, r.circuit.columnCount()), 12), fixedCols: true, readOnly: true, showDisks: false, wireInit: t.wireInit });
      });
      stop = tickCountdowns(root);
      root.querySelector('#reg-btn').addEventListener('click', () => {
        if (isGuest()) { navigate('/register'); return; }
        navigate(`/contests/${sc.next}`);
      });
    },
    unmount() { stop && stop(); },
  };
}

function step(n, title, text, ic, viz = '') {
  return html`<div class="card step3-card"><div class="row"><span class="t-number muted step-n">${n}</span><span class="spacer"></span><span class="icon-tile">${raw(icon(ic))}</span></div><div class="step-viz">${raw(viz)}</div><h3 class="t-h2" style="margin-top:20px">${title}</h3><p class="secondary" style="margin-top:12px">${text}</p></div>`;
}
function statCell(kicker, value, unit, sub, viz) {
  return `<div class="stat-cell"><div class="t-kicker">|${kicker}⟩</div><div class="row" style="align-items:flex-end;justify-content:space-between;gap:12px"><div class="row" style="align-items:baseline;gap:10px"><span class="stat-n">${value}</span><span class="stat-u">${unit}</span></div><div class="stat-viz">${viz}</div></div><div class="stat-sub">${sub}</div></div>`;
}
const vizBars = (c) => { const m = Math.max(...c); return `<svg width="64" height="32" viewBox="0 0 64 32" aria-hidden="true">${c.map((v, i) => `<rect x="${i * 11}" y="${32 - 4 - (v / m) * 26}" width="8" height="${4 + (v / m) * 26}" rx="2" fill="${i === c.indexOf(m) ? 'var(--text-primary)' : 'var(--data-3)'}"/>`).join('')}</svg>`; };
const vizSteps = () => '<svg width="72" height="32" viewBox="0 0 72 32" aria-hidden="true"><path d="M8 16H36M44 16H64" stroke="var(--line-strong)" stroke-width="2"/><circle cx="8" cy="16" r="6" fill="var(--text-primary)"/><circle cx="40" cy="16" r="6" fill="var(--data-2)"/><circle cx="66" cy="16" r="5" fill="none" stroke="var(--data-3)" stroke-width="2"/></svg>';
const vizModes = () => '<svg width="72" height="32" viewBox="0 0 72 32" aria-hidden="true"><rect x="1" y="4" width="32" height="24" rx="6" fill="none" stroke="var(--text-primary)" stroke-width="1.6"/><path d="M7 16H27M17 10V22" stroke="var(--text-primary)" stroke-width="1.6" stroke-linecap="round"/><rect x="39" y="4" width="32" height="24" rx="6" fill="none" stroke="var(--data-3)" stroke-width="1.6"/><path d="M48 12L44 16L48 20M62 12L66 16L62 20" fill="none" stroke="var(--data-3)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const vizRing = () => '<svg width="34" height="34" viewBox="0 0 34 34" aria-hidden="true"><circle cx="17" cy="17" r="14" fill="none" stroke="var(--data-4)" stroke-width="3"/><circle cx="17" cy="17" r="14" fill="none" stroke="var(--text-primary)" stroke-width="3" stroke-dasharray="66 88" transform="rotate(-90 17 17)"/><circle cx="17" cy="3" r="3" fill="var(--accent-indicator)"/></svg>';
const vizGates = () => `<div class="viz-gates">${['H', 'X', 'Z', 'CX'].map((g, i) => `<span class="${i === 0 ? 'on' : ''}">${g}</span>`).join('')}</div>`;
const vizProbs = () => `<div class="viz-probs">${[['|00⟩', 50], ['|01⟩', 0], ['|10⟩', 0], ['|11⟩', 50]].map(([k, p]) => `<div><span>${k}</span><i><b style="width:${p}%"></b></i><em>${p} %</em></div>`).join('')}</div>`;
const vizVerdict = () => `<div class="viz-verdict">${['вход', 'шум', 'лимиты'].map((k, i) => `${i ? '<u></u>' : ''}<span><i>${icon('check', 'sm')}</i>${k}</span>`).join('')}</div>`;
import { uniById } from '../data/people.js';
const uniLabel = (id) => uniById(id).name;
