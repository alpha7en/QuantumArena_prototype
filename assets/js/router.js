// Маршрутизатор на хэше: #/tasks/5?x=1. Сайт статический, GitHub Pages не нужно настраивать на SPA.
const routes = [];
let current = null, token = 0, onRender = null;

export function route(pattern, loader) {
  const keys = [];
  const re = new RegExp('^' + pattern.replace(/\/:(\w+)(\?)?/g, (_, k, opt) => { keys.push(k); return opt ? '(?:/([^/]+))?' : '/([^/]+)'; }) + '/?$');
  routes.push({ pattern, re, keys, loader });
}

export function parseHash() {
  const raw = location.hash.replace(/^#/, '') || '/';
  const [path, qs = ''] = raw.split('?');
  const query = Object.fromEntries(new URLSearchParams(qs));
  return { path: decodeURI(path) || '/', query };
}

export const navigate = (to, { replace = false } = {}) => {
  const url = '#' + to;
  if (replace) history.replaceState(null, '', url); else location.hash = to;
  if (replace) resolve();
};
export const currentPath = () => parseHash().path;

export function setRenderer(fn) { onRender = fn; }

export async function resolve() {
  const { path, query } = parseHash();
  const my = ++token;
  for (const r of routes) {
    const m = r.re.exec(path);
    if (!m) continue;
    const params = {};
    r.keys.forEach((k, i) => { params[k] = m[i + 1] ? decodeURIComponent(m[i + 1]) : undefined; });
    const ctx = { path, query, params };
    if (current && current.unmount) { try { current.unmount(); } catch (e) { console.error(e); } }
    current = null;
    try {
      const mod = await r.loader();
      if (my !== token) return;
      const view = await mod.default(ctx);
      if (my !== token) return;
      current = view;
      onRender(view, ctx);
    } catch (e) {
      console.error(e);
      if (my === token) onRender({ title: 'Ошибка', nav: null, html: `<div class="page"><div class="card"><h3 class="t-h3">Страница не открылась</h3><p class="muted" style="margin-top:8px">${String(e.message || e)}</p></div></div>` }, ctx);
    }
    return;
  }
  const ctx = { path, query, params: {} };
  onRender({ title: 'Не найдено', nav: null, html: `<div class="page"><div class="empty"><div class="ring">?</div><h3>Такой страницы нет</h3><p>Проверьте адрес или вернитесь на главную.</p><a class="btn btn-secondary" href="#/">на главную</a></div></div>` }, ctx);
}

export function start() {
  addEventListener('hashchange', resolve);
  resolve();
}
