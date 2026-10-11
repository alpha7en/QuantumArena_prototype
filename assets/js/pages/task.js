import { taskByNum, taskById } from '../data/tasks.js';
import { mountTaskEditor } from '../ui/taskeditor.js';
import { openRoundContext } from '../data/roundstate.js';

export default async function taskPage(ctx) {
  const task = taskByNum(ctx.params.id) || taskById(ctx.params.id);
  if (!task) return { title: 'Задача не найдена', nav: 'tasks', html: '<div class="page"><div class="empty"><div class="ring">?</div><h3>Такой задачи нет</h3><a class="btn btn-secondary" href="#/tasks">к списку задач</a></div></div>' };
  const rc = ctx.query.r ? openRoundContext(+ctx.query.r, +ctx.query.q, task.id) : null;
  if (ctx.query.r && !rc) return { title: 'Раунд', nav: 'contests', html: `<div class="page"><div class="empty"><div class="ring">!</div><h3>Раунд недоступен</h3><p>Запустите раунд на странице контестов.</p><a class="btn btn-secondary" href="#/contests/${ctx.query.r}">к раунду</a></div></div>` };
  let cleanup = null;
  return {
    title: task.title, nav: rc ? 'contests' : 'tasks', layout: 'editor', html: '<div id="ed" style="display:flex;flex:1;flex-direction:column"></div>',
    mount(root) { cleanup = mountTaskEditor(root.querySelector('#ed'), task, rc ? { round: rc, hints: false } : {}); },
    unmount() { cleanup && cleanup(); },
  };
}
