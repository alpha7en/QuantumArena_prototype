import { html, raw, esc, on, ruPlural } from '../ui/dom.js';
import { icon } from '../ui/icons.js';
import { kicker, diffHtml, topicIcon } from '../ui/parts.js';
import { TASKS, TOPICS, LEVELS } from '../data/tasks.js';
import { acceptance } from '../data/rounds.js';
import { data, isGuest, currentUser, mutate, streakNow } from '../store.js';
import { navigate } from '../router.js';

const lev = (a, b) => {
  const m = a.length, n = b.length; if (!m) return n; if (!n) return m;
  let prev = Array.from({ length: n + 1 }, (_, i) => i);
  for (let i = 1; i <= m; i++) { const cur = [i]; for (let j = 1; j <= n; j++) cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)); prev = cur; }
  return prev[n];
};
function suggest(q) {
  q = q.toLowerCase();
  let best = null;
  for (const t of TASKS) for (const w of t.title.toLowerCase().split(/[\s,()|⟩⟨+\-—]+/).filter((x) => x.length > 3)) {
    const d = lev(q, w.slice(0, Math.max(q.length, 4)));
    if (d <= 2 && (!best || d < best.d)) best = { d, t, w };
  }
  return best;
}

export default async function tasks(ctx) {
  const d = data(), user = currentUser();
  const solvedIds = new Set(Object.keys(d.solved));
  const f = { q: '', status: ctx.query.f || 'all', level: '0', topic: '' };
  const total = TASKS.length, solved = solvedIds.size;
  const streak = streakNow(d);
  const showWelcome = user && !d.onboarding.dismissed && solved === 0;

  const state = (t) => (solvedIds.has(t.id) ? 'done' : (d.drafts[t.id] && (d.drafts[t.id].code || (d.drafts[t.id].circuit && d.drafts[t.id].circuit.ops.length)) && (d.attempts[t.id] || (d.drafts[t.id].circuit && d.drafts[t.id].circuit.ops.length)) ? 'wip' : 'none'));
  const byLevel = [1, 2, 3].map((l) => ({ l, done: TASKS.filter((t) => t.level === l && solvedIds.has(t.id)).length, all: TASKS.filter((t) => t.level === l).length }));

  const view = html`
  <div class="page">
    <div class="page-head">${raw(kicker('банк задач'))}<h1 class="t-display">задачи</h1>
      <p class="t-lead" style="max-width:640px">${total} ${ruPlural(total, 'задача', 'задачи', 'задач')} на синтез схем, алгоритмы и подавление шума. Решение принимается, если схема даёт нужное состояние и укладывается в лимиты.</p></div>
    ${isGuest() ? html`<div class="notice">${raw(icon('lock'))}<div class="grow"><div style="font-weight:600">Смотреть задачи можно без входа</div><div class="muted t-small">Чтобы решать и сохранять прогресс, войдите или зарегистрируйтесь — в демо аккаунт хранится только в этом браузере.</div></div><a class="btn btn-primary sm" href="#/register">войти и решать${raw(icon('arrow-r'))}</a></div>` : ''}
    ${showWelcome ? html`<div class="notice accent" id="welcome"><div class="grow"><div style="font-weight:600">Добро пожаловать, ${user.first}. Начните с задачи 1 — 2 гейта, около 5 минут.</div><div class="muted t-small">Проведём по редактору шаг за шагом. Подсказки отключаются в настройках.</div></div><a class="btn btn-primary sm" href="#/tasks/1">решить задачу 1${raw(icon('arrow-r'))}</a><button class="icon-btn" data-act="dismiss" aria-label="закрыть">${raw(icon('x', 'sm'))}</button></div>` : ''}
    <div class="stat-pair">
      <div class="card row" style="gap:20px;padding:24px 28px"><span class="t-number-xl" style="font-size:44px;line-height:48px;min-width:56px">${solved}</span><div class="grow"><div style="font-size:16px">из ${total} решено</div>${solved ? html`<div class="lvl-bars">${byLevel.map((x) => html`<div><div class="t-mono-s muted">${LEVELS[x.l]} · ${x.done}/${x.all}</div><div class="progress" style="margin-top:4px"><i style="width:${x.all ? x.done / x.all * 100 : 0}%"></i></div></div>`)}</div>` : html`<div class="muted t-small">после первой задачи здесь появится разбивка по сложности</div>`}</div></div>
      <div class="card row" style="gap:20px;padding:24px 28px">${raw(icon('flame', 'lg'))}<div><div class="t-number-s">${streak} ${ruPlural(streak, 'день', 'дня', 'дней')} подряд</div><div class="muted t-small">решайте хотя бы одну задачу в день</div></div></div>
    </div>
    <div class="filters">
      <div class="control" style="flex:1;min-width:240px">${raw(icon('search'))}<input id="q" placeholder="Поиск по названию, номеру или теме" autocomplete="off"></div>
      <div class="segmented" id="seg">
        <button data-s="all" aria-pressed="true">все <span class="cnt" id="c-all"></span></button><button data-s="done" aria-pressed="false">решённые</button><button data-s="todo" aria-pressed="false">нерешённые</button></div>
      <div class="control select">${''}<select id="lvl" aria-label="сложность"><option value="0">любая сложность</option>${[1, 2, 3].map((l) => html`<option value="${l}">${LEVELS[l]}</option>`)}</select><span class="chev">${raw(icon('chev-d', 'sm'))}</span></div>
      <div class="control select"><select id="topic" aria-label="тема"><option value="">все темы</option>${TOPICS.map((t) => html`<option>${t}</option>`)}</select><span class="chev">${raw(icon('chev-d', 'sm'))}</span></div>
    </div>
    <div class="card flush table-card"><div class="trow thead"><span></span><span class="t-kicker">№ и название</span><span class="t-kicker tcol-topic">тема</span><span class="t-kicker tcol-diff">сложность</span><span class="t-kicker tcol-rate" title="Демо: смоделированная доля участников, решивших задачу">решаемость ${raw(icon('info', 'sm'))}</span></div><div id="rows"></div></div>
    <p class="muted t-small">Решаемость в демо — смоделированная доля участников, решивших задачу. Условия задач написаны командой для прототипа; ревью вторым экспертом ещё не проходили.</p>
  </div>`;

  return {
    title: 'Задачи', nav: 'tasks', html: view,
    mount(root) {
      const rows = root.querySelector('#rows');
      const apply = () => {
        const q = f.q.trim().toLowerCase();
        const list = TASKS.filter((t) => (f.status === 'all' || (f.status === 'done' ? solvedIds.has(t.id) : !solvedIds.has(t.id)))
          && (f.level === '0' || t.level === +f.level) && (!f.topic || t.topic === f.topic)
          && (!q || t.title.toLowerCase().includes(q) || t.topic.toLowerCase().includes(q) || String(t.num) === q));
        root.querySelector('#c-all').textContent = TASKS.length;
        if (!list.length) {
          const sg = q ? suggest(q) : null;
          rows.innerHTML = `<div class="empty"><div class="ring">${icon('search')}</div><h3>Ничего не нашли</h3><p>${q ? `По запросу «${esc(f.q)}» задач нет.` : 'Под эти фильтры ничего не подходит.'}${sg ? ` Возможно, вы имели в виду «${esc(sg.t.title.split(' ').find((w) => w.toLowerCase().startsWith(sg.w.slice(0, 3))) || sg.t.title)}» — задача ${sg.t.num}.` : ''}</p><button class="btn btn-outline sm" data-reset>${icon('refresh', 'sm')}сбросить фильтры</button></div>`;
          return;
        }
        rows.innerHTML = list.map((t) => {
          const st = state(t), acc = acceptance(t);
          const mark = st === 'done' ? `<span class="tmark done">${icon('check', 'sm')}</span>` : st === 'wip' ? '<span class="tmark wip"></span>' : '<span class="tmark"></span>';
          return `<a class="trow" href="#/tasks/${t.num}"><span class="tmark-wrap">${mark}</span><span class="ttitle"><span class="mono muted tnum">${t.num}.</span>${esc(t.title)}${t.codeOnly ? ' <span class="tag">код</span>' : ''}</span><span class="t-mono-s muted tcol-topic topic-cell">${topicIcon(t.topic)}${esc(t.topic)}</span><span class="tcol-diff">${diffHtml(t.level)}</span><span class="tcol-rate rate"><span class="mono" style="font-size:13px">${String(acc.toFixed(1)).replace('.', ',')} %</span><span class="progress"><i style="width:${acc}%"></i></span></span></a>`;
        }).join('');
      };
      root.querySelector('#q').addEventListener('input', (e) => { f.q = e.target.value; apply(); });
      root.querySelector('#lvl').addEventListener('change', (e) => { f.level = e.target.value; apply(); });
      root.querySelector('#topic').addEventListener('change', (e) => { f.topic = e.target.value; apply(); });
      on(root.querySelector('#seg'), 'click', '[data-s]', (e, b) => { f.status = b.dataset.s; root.querySelectorAll('#seg button').forEach((x) => x.setAttribute('aria-pressed', x === b)); apply(); });
      on(root, 'click', '[data-reset]', () => { f.q = ''; f.level = '0'; f.topic = ''; f.status = 'all'; root.querySelector('#q').value = ''; root.querySelector('#lvl').value = '0'; root.querySelector('#topic').value = ''; root.querySelectorAll('#seg button').forEach((x) => x.setAttribute('aria-pressed', x.dataset.s === 'all')); apply(); });
      on(root, 'click', '[data-act="dismiss"]', () => { mutate((dd) => { dd.onboarding.dismissed = true; }); root.querySelector('#welcome').remove(); });
      apply();
    },
  };
}
