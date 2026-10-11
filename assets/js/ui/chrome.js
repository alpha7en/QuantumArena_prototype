// Шапка, подвал, поиск, меню профиля и панель уведомлений.
import { html, raw, esc, fmtInt, on, ruPlural, dateShort, timeHM } from './dom.js';
import { icon, logoMark } from './icons.js';
import { currentUser, data, mutate, logout, setTheme, themeSetting } from '../store.js';
import { ratingTitle, initials } from '../data/people.js';
import { schedule, roundStart } from '../data/rounds.js';
import { popover, closePopovers, modal, toast } from './overlay.js';
import { TASKS } from '../data/tasks.js';
import { navigate } from '../router.js';

const NAV = [['tasks', 'задачи', '/tasks'], ['contests', 'контесты', '/contests'], ['rating', 'рейтинг', '/rating'], ['sandbox', 'песочница', '/sandbox'], ['learn', 'обучение', '/learn']];

export const avatarHtml = (u, cls = '') => {
  if (!u) return '';
  if (u.avatar) return `<span class="avatar ${cls}"><img src="${esc(u.avatar)}" alt=""></span>`;
  return `<span class="avatar ${cls}">${esc(initials(u.name))}</span>`;
};

export function ratingLabel(d) {
  if (d.rating == null) return 'без рейтинга · новичок';
  return `${fmtInt(d.rating)} · ${ratingTitle(d.rating)}`;
}

export function headerHtml(nav) {
  const u = currentUser(), d = data();
  const unread = d.notifications.some((n) => n.unread);
  const right = u
    ? `<button class="icon-btn" data-act="search" aria-label="поиск">${icon('search')}</button>
       <button class="icon-btn" data-act="bell" aria-label="уведомления">${icon('bell')}${unread ? '<span class="bell-dot"></span>' : ''}</button>
       <a class="rating-pill" href="#/rating">${icon('growth')}<span>${esc(ratingLabel(d))}</span></a>
       <button data-act="usermenu" aria-label="профиль" style="border-radius:50%">${avatarHtml(u, 'me')}</button>`
    : `<button class="icon-btn" data-act="search" aria-label="поиск">${icon('search')}</button>
       <a class="btn btn-ghost sm" href="#/login">войти</a><a class="btn btn-secondary sm" href="#/register">регистрация</a>`;
  return `<div class="appnav-in">
    <a class="logo" href="#/" aria-label="sparq arena — на главную">${logoMark()}<span class="word">sparq</span><span class="arena">|arena⟩</span></a>
    <nav class="navmenu" id="navmenu" aria-label="разделы">${NAV.map(([k, t, href]) => `<a class="navlink ${nav === k ? 'active' : ''}" href="#${href}" ${nav === k ? 'aria-current="page"' : ''}>${t}</a>`).join('')}</nav>
    <div class="nav-right">${right}<button class="icon-btn burger" data-act="burger" aria-label="меню">${icon('menu')}</button></div>
  </div>`;
}

export function footerHtml() {
  return `<div class="in">
    <span>sparq |arena⟩ · демо-версия платформы</span>
    <span>Участники, рейтинг и результаты раундов смоделированы. Ваши данные хранятся только в этом браузере.</span>
    <span class="spacer"></span>
    <a href="https://github.com/alpha7en/QuantumArena_prototype/tree/main/docs" target="_blank" rel="noopener">документация</a>
    <a href="#/learn">обучение</a>
  </div>`;
}

// ---------- Действия шапки ----------

const REL = (ts) => {
  const m = Math.round((Date.now() - ts) / 60000);
  if (m < 1) return 'сейчас'; if (m < 60) return `${m} мин`;
  const h = Math.round(m / 60); if (h < 24) return `${h} ч`;
  const dd = Math.round(h / 24); return dd === 1 ? 'вчера' : `${dd} дн`;
};
const KIND_ICON = { round: 'clock', accept: 'check', results: 'book', system: 'info' };

function notifPanel() {
  const d = data(), sc = schedule();
  const registered = d.rounds[sc.next] && d.rounds[sc.next].registered;
  const virtual = registered ? [] : [{ virtual: true, kind: 'round', title: `Регистрация на раунд ${sc.next} открыта`, text: `${dateShort(roundStart(sc.next)).replace(/^./, (c) => c)}, ${timeHM(roundStart(sc.next))}`, ts: Date.now(), unread: true, href: `/contests/${sc.next}` }];
  const items = [...virtual, ...d.notifications].slice(0, 6);
  const rows = items.length ? items.map((n) => `<a class="notif-item ${n.unread ? 'unread' : ''}" ${n.href ? `href="#${n.href}"` : ''}>${icon(KIND_ICON[n.kind] || 'info', 'sm')}<div><div class="ttl">${esc(n.title)}</div><div class="sub">${esc(n.text || '')}</div></div><time>${n.virtual ? '' : REL(n.ts)}</time></a>`).join('')
    : `<div class="muted" style="padding:12px;font-size:14px">Пока ничего нового.</div>`;
  return `<div class="row"><h3 class="t-h3 grow">уведомления</h3><button class="btn btn-ghost xs" data-act="readall">прочитать всё</button></div>${rows}
    <a class="btn btn-ghost sm" href="#/settings/notifications" style="justify-content:flex-start">${icon('sliders', 'sm')}настройки уведомлений</a>`;
}

function userMenu() {
  const u = currentUser();
  const th = themeSetting();
  return `<div style="padding:10px 12px"><div style="font-weight:600">${esc(u.name)}</div><div class="muted t-mono-s">@${esc(u.login)}</div></div><div class="menu-sep"></div>
    <a class="menu-item" href="#/profile">${icon('user', 'sm')}профиль</a>
    <a class="menu-item" href="#/settings">${icon('sliders', 'sm')}настройки</a>
    <div class="menu-sep"></div>
    <div style="padding:6px 12px"><div class="t-kicker" style="margin-bottom:8px">тема</div>
      <div class="segmented sm" data-theme-seg>${[['dark', 'тёмная'], ['light', 'светлая'], ['system', 'как в системе']].map(([k, t]) => `<button data-theme="${k}" aria-pressed="${th === k}">${t}</button>`).join('')}</div></div>
    <div class="menu-sep"></div>
    <button class="menu-item danger" data-act="logout">${icon('logout', 'sm')}выйти</button>`;
}

export function openSearch() {
  const body = `<div class="control" style="margin-bottom:12px">${icon('search')}<input id="sq" placeholder="Задача, номер или тема" autocomplete="off"></div><div id="sres" class="col" style="gap:2px;max-height:50vh;overflow:auto"></div>`;
  modal({ title: 'поиск', body: raw(body), width: 560, onMount(box, done) {
    const input = box.querySelector('#sq'), res = box.querySelector('#sres');
    const pages = [['/tasks', 'Банк задач'], ['/contests', 'Контесты'], ['/rating', 'Рейтинг'], ['/sandbox', 'Песочница'], ['/learn', 'Обучение'], ['/profile', 'Профиль'], ['/settings', 'Настройки']];
    const draw = () => {
      const q = input.value.trim().toLowerCase();
      const ts = TASKS.filter((t) => !q || String(t.num) === q || t.title.toLowerCase().includes(q) || t.topic.toLowerCase().includes(q)).slice(0, 8);
      const ps = q ? pages.filter(([, n]) => n.toLowerCase().includes(q)) : [];
      res.innerHTML = [...ps.map(([h, n]) => `<a class="menu-item" href="#${h}" data-go>${icon('arrow-r', 'sm')}${esc(n)}</a>`),
        ...ts.map((t) => `<a class="menu-item" href="#/tasks/${t.num}" data-go><span class="mono muted" style="width:28px">${t.num}.</span><span class="grow">${esc(t.title)}</span><span class="muted t-mono-s">${esc(t.topic)}</span></a>`)].join('') || '<div class="muted" style="padding:12px">Ничего не найдено.</div>';
    };
    input.addEventListener('input', draw); draw();
    input.addEventListener('keydown', (e) => { if (e.key === 'Enter') { const a = res.querySelector('a'); if (a) { location.hash = a.getAttribute('href').slice(1); done(null); } } });
    res.addEventListener('click', (e) => { if (e.target.closest('[data-go]')) done(null); });
  } });
}

export function bindChrome(headerEl, rerender) {
  on(headerEl, 'click', '[data-act]', (e, t) => {
    const a = t.dataset.act;
    if (a === 'search') openSearch();
    else if (a === 'burger') document.getElementById('navmenu').classList.toggle('open');
    else if (a === 'bell') {
      popover(t, raw(notifPanel()), { cls: 'notif-panel', onMount(p) {
        p.addEventListener('click', (ev) => {
          if (ev.target.closest('[data-act="readall"]')) { mutate((d) => d.notifications.forEach((n) => { n.unread = false; })); closePopovers(); rerender(); }
          else if (ev.target.closest('a')) closePopovers();
        });
        if (data().notifications.some((n) => n.unread)) setTimeout(() => { mutate((d) => d.notifications.forEach((n) => { n.unread = false; })); }, 1500);
      } });
    } else if (a === 'usermenu') {
      popover(t, raw(userMenu()), { cls: '', onMount(p) {
        p.addEventListener('click', (ev) => {
          const th = ev.target.closest('[data-theme]');
          if (th) { setTheme(th.dataset.theme); p.querySelectorAll('[data-theme]').forEach((b) => b.setAttribute('aria-pressed', b === th)); return; }
          if (ev.target.closest('[data-act="logout"]')) { logout(); closePopovers(); navigate('/'); toast({ title: 'Вы вышли из аккаунта', kind: 'info' }); }
          else if (ev.target.closest('a')) closePopovers();
        });
      } });
    }
  });
  headerEl.addEventListener('click', (e) => { if (e.target.closest('.navlink')) document.getElementById('navmenu')?.classList.remove('open'); });
}

export { NAV };
