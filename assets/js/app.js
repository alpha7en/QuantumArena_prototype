// Точка входа: маршруты, шапка, подвал.
import { load, applyTheme, onChange, getState, save } from './store.js';
import { route, setRenderer, start } from './router.js';
import { headerHtml, footerHtml, bindChrome } from './ui/chrome.js';
import { closePopovers } from './ui/overlay.js';
import { icon } from './ui/icons.js';

load();
applyTheme();
matchMedia('(prefers-color-scheme: light)').addEventListener('change', () => applyTheme());

const $hdr = document.getElementById('hdr');
const $app = document.getElementById('app');
const $ftr = document.getElementById('ftr');
const $banner = document.getElementById('demo-banner');
let navKey = null;

const page = (name) => () => import(`./pages/${name}.js`);
route('/', page('home'));
route('/tasks', page('tasks'));
route('/tasks/:id', page('task'));
route('/contests', page('contests'));
route('/contests/:round', page('round'));
route('/contests/:round/:q', page('roundtask'));
route('/rating', page('rating'));
route('/rating/:tab', page('rating'));
route('/rating/universities/:id', page('university'));
route('/sandbox', page('sandbox'));
route('/learn', page('learn'));
route('/profile', page('profile'));
route('/u/:login', page('profile'));
route('/settings', page('settings'));
route('/settings/:section', page('settings'));
route('/login', page('auth'));
route('/register', page('auth'));
route('/recover', page('auth'));

function renderBanner() {
  const upd = () => document.documentElement.style.setProperty('--banner-h', $banner.offsetHeight + 'px');
  const s = getState();
  if (s.ui.bannerOff) { $banner.innerHTML = ''; upd(); return; }
  $banner.innerHTML = `<div class="demo-banner">демо-версия: участники и результаты раундов смоделированы<span class="hide-sm"> · ваши данные хранятся только в этом браузере</span> <button data-close aria-label="скрыть" style="margin-left:8px;vertical-align:middle">${icon('x', 'sm')}</button></div>`;
  $banner.querySelector('[data-close]').onclick = () => { getState().ui.bannerOff = true; save(); $banner.innerHTML = ''; upd(); };
  upd();
}

function renderHeader() { $hdr.innerHTML = headerHtml(navKey); }
bindChrome($hdr, renderHeader);
onChange(renderHeader);

setRenderer((view, ctx) => {
  closePopovers();
  navKey = view.nav ?? null;
  document.title = view.title ? `${view.title} · sparq |arena⟩` : 'sparq |arena⟩ — квантовые задачи';
  document.body.dataset.layout = view.layout || 'page';
  $app.innerHTML = '';
  if (typeof view.html === 'string') $app.innerHTML = view.html; else if (view.html && view.html.s !== undefined) $app.innerHTML = view.html.s; else if (view.node) $app.append(view.node);
  $ftr.hidden = view.layout === 'editor';
  $ftr.innerHTML = footerHtml();
  renderHeader();
  scrollTo(0, 0);
  if (view.mount) view.mount($app, ctx);
});

renderBanner();
start();
