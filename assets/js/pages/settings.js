import { html, raw, esc, on, dateDay } from '../ui/dom.js';
import { icon } from '../ui/icons.js';
import { avatar } from '../ui/parts.js';
import { currentUser, data, mutate, updateProfile, deleteAccount, getState, themeSetting, setTheme, checkPassword, setPassword, validatePassword, save } from '../store.js';
import { UNIVERSITIES, uniById, pool } from '../data/people.js';
import { navigate } from '../router.js';
import { toast, confirmModal } from '../ui/overlay.js';

const SECTIONS = [['profile', 'профиль'], ['uni', 'вуз'], ['security', 'вход и безопасность'], ['notifications', 'уведомления'], ['editor', 'редактор'], ['delete', 'удалить аккаунт']];
const SEMESTER_MS = 120 * 86400000;

function resizeImage(file) {
  return new Promise((res, rej) => {
    const img = new Image(), url = URL.createObjectURL(file);
    img.onload = () => { const s = Math.min(img.width, img.height), c = document.createElement('canvas'); c.width = c.height = 192; c.getContext('2d').drawImage(img, (img.width - s) / 2, (img.height - s) / 2, s, s, 0, 0, 192, 192); URL.revokeObjectURL(url); res(c.toDataURL('image/jpeg', 0.85)); };
    img.onerror = () => rej(new Error('bad image')); img.src = url;
  });
}

export default async function settings(ctx) {
  const u = currentUser();
  if (!u) { navigate('/login', { replace: true }); return { title: 'Настройки', nav: null, html: '' }; }
  const sec = ctx.params.section || 'profile', d = data();
  const canChangeUni = Date.now() - (u.uniChangedAt || 0) > SEMESTER_MS;
  const nextChange = new Date((u.uniChangedAt || Date.now()) + SEMESTER_MS);
  const unis = UNIVERSITIES.map((x) => `<option value="${x.id}" ${x.id === u.uni ? 'selected' : ''}>${esc(x.name)}</option>`).join('');
  const profileLink = `${location.host}${location.pathname}#/u/`;

  const body = {
    profile: () => html`<h1 class="t-display sm">профиль</h1>
      <div class="row wrap" style="gap:20px;align-items:center">${raw(avatar(u.name, 'xxl', u.avatar))}<div class="col" style="gap:10px"><b>Фото профиля</b><span class="muted t-small">JPG или PNG до 5 МБ. Видно в рейтинге и таблицах раундов — в демо только вам.</span><div class="row" style="gap:12px"><label class="btn btn-secondary sm" style="cursor:pointer">${raw(icon('upload', 'sm'))}загрузить новое<input type="file" id="photo" accept="image/png,image/jpeg" hidden></label><button class="btn btn-ghost sm" id="rmphoto" ${u.avatar ? '' : 'disabled'}>удалить</button></div></div></div>
      <form id="pform" class="col" style="gap:20px;max-width:560px" novalidate>
        <div class="field"><label for="name">Имя и фамилия</label><div class="control"><input id="name" value="${u.name}" autocomplete="name"></div><div class="hint">Видно всем участникам</div></div>
        <div class="field" id="f-login"><label for="login">Логин</label><div class="control"><input id="login" value="${u.login}" autocomplete="username"></div><div class="hint" id="h-login">Ссылка на профиль: ${profileLink}${u.login}</div></div>
        <div class="field"><label for="uni">Вуз</label><div class="control select ${canChangeUni ? '' : 'disabled'}"><select id="uni" ${canChangeUni ? '' : 'disabled'}>${raw(unis)}</select><span class="chev">${raw(icon('chev-d', 'sm'))}</span></div><div class="hint">${canChangeUni ? 'Сменить вуз можно раз в семестр.' : `Сменить вуз можно раз в семестр — следующая смена с ${dateDay(nextChange)}.`}</div></div>
        <label class="checkbox"><input type="checkbox" id="show" ${u.showInUniRating !== false ? 'checked' : ''}><span class="box"></span><span>Показывать меня в рейтинге вуза</span></label>
        <div class="row" style="gap:12px;justify-content:flex-end"><button type="button" class="btn btn-outline sm" id="cancel">отменить</button><button class="btn btn-primary sm" id="save" disabled>сохранить</button></div>
        <div class="muted t-mono-s">«Сохранить» станет активной, когда что-то изменится.</div></form>`,
    uni: () => html`<h1 class="t-display sm">вуз</h1><div class="card col" style="gap:10px;max-width:560px"><div class="t-kicker">ваш вуз</div><div class="t-h3">${uniById(u.uni).name}</div><p class="secondary t-small">Решённые задачи и раунды идут в общий зачёт вуза: рейтинг вуза — сумма рейтингов десяти лучших студентов. ${canChangeUni ? 'Сменить вуз можно в разделе «профиль».' : `Сменить вуз можно с ${dateDay(nextChange)}.`}</p><a class="btn btn-outline sm" href="#/rating/universities/${u.uni}" style="align-self:flex-start">рейтинг вуза${raw(icon('arrow-r', 'sm'))}</a></div>`,
    security: () => html`<h1 class="t-display sm">вход и безопасность</h1><form id="sform" class="col" style="gap:18px;max-width:480px" novalidate>
      <div class="field"><label>Почта</label><div class="control disabled">${raw(icon('mail'))}<input value="${u.email}" disabled></div><div class="hint">Почта используется только как логин в этом браузере.</div></div>
      ${u.demo ? html`<div class="notice">${raw(icon('info'))}<div class="secondary t-small">У демо-профиля нет пароля. Создайте обычный аккаунт, чтобы управлять паролем.</div></div>` : html`
      <div class="field" id="f-old"><label for="old">Текущий пароль</label><div class="control">${raw(icon('lock'))}<input id="old" type="password" autocomplete="current-password"></div><div class="hint" id="h-old"></div></div>
      <div class="field" id="f-new"><label for="new">Новый пароль</label><div class="control">${raw(icon('lock'))}<input id="new" type="password" autocomplete="new-password"></div><div class="hint" id="h-new">Не короче 8 символов, хотя бы одна цифра</div></div>
      <button class="btn btn-primary sm" style="align-self:flex-start">сменить пароль</button>`}</form>
      <div class="notice" style="max-width:560px">${raw(icon('shield'))}<div class="secondary t-small">В демо пароль хранится хэшем в localStorage этого браузера, на сервер ничего не отправляется. Это не защита аккаунта, а имитация входа.</div></div>`,
    notifications: () => { const n = d.settings.notify; return html`<h1 class="t-display sm">уведомления</h1><div class="col" style="gap:16px;max-width:560px">
      ${[['round', 'Напоминание о раунде', 'За час до старта раунда, на который вы записаны.'], ['results', 'Итоги раундов', 'Когда итоги раунда подведены и рейтинг пересчитан.'], ['digest', 'Недельный дайджест', 'Что нового в банке задач и рейтинге.']].map(([k, t, x]) => html`<label class="checkbox"><input type="checkbox" data-n="${k}" ${n[k] ? 'checked' : ''}><span class="box"></span><span><b style="color:var(--text-primary)">${t}</b><br><span class="muted">${x}</span></span></label>`)}
      <div class="notice">${raw(icon('info'))}<div class="secondary t-small">В демо письма и пуши не отправляются: уведомления видны только в колокольчике справа вверху.</div></div></div>`; },
    editor: () => html`<h1 class="t-display sm">редактор</h1><div class="col" style="gap:20px;max-width:560px">
      <label class="checkbox"><input type="checkbox" id="hints" ${d.settings.hints !== false ? 'checked' : ''}><span class="box"></span><span><b style="color:var(--text-primary)">Подсказки в задачах и обучающие вставки</b><br><span class="muted">Кнопка «подсказка» и пошаговая подсказка в первой задаче. В раундах подсказки отключены всегда.</span></span></label>
      <div class="field"><span class="label">Тема</span><div class="segmented" id="theme">${[['dark', 'тёмная'], ['light', 'светлая'], ['system', 'как в системе']].map(([k, t]) => html`<button data-t="${k}" aria-pressed="${themeSetting() === k}">${t}</button>`)}</div></div>
      <hr class="hr"><div class="col" style="gap:12px;align-items:flex-start"><button class="btn btn-outline sm" id="resetonb">показать обучающие вставки снова</button><button class="btn btn-outline sm" id="drafts">очистить черновики схем и кода</button><button class="btn btn-outline sm" id="export">${raw(icon('download', 'sm'))}скачать мои данные (JSON)</button></div></div>`,
    delete: () => html`<h1 class="t-display sm" style="color:var(--accent-text)">удалить аккаунт</h1><div class="card col" style="gap:14px;max-width:560px"><p class="secondary">Аккаунт, решения, черновики и рейтинг будут удалены из этого браузера. Отменить нельзя. На сервере в демо ничего не хранится.</p><button class="btn btn-primary sm" id="del" style="align-self:flex-start;background:var(--accent-pressed)">${raw(icon('trash', 'sm'))}удалить аккаунт</button></div>`,
  }[sec] || (() => html`<div class="empty"><h3>Такого раздела нет</h3></div>`);

  const view = html`<div class="page" style="flex-direction:row;gap:56px;align-items:flex-start"><nav class="snav" aria-label="разделы настроек"><div class="t-h2" style="margin-bottom:14px">настройки</div>${SECTIONS.map(([k, t]) => html`<a class="snav-i ${k === sec ? 'on' : ''} ${k === 'delete' ? 'danger' : ''}" href="#/settings/${k}">${t}</a>`)}</nav><div class="col grow" style="gap:28px;min-width:0">${body()}</div></div>`;
  return {
    title: 'Настройки', nav: null, html: view,
    mount(root) {
      const $ = (s) => root.querySelector(s);
      if (sec === 'profile') {
        const form = $('#pform'), save_ = $('#save');
        const dirty = () => $('#name').value.trim() !== u.name || $('#login').value.trim() !== u.login || $('#uni').value !== u.uni || $('#show').checked !== (u.showInUniRating !== false);
        const setLoginErr = (m) => { $('#f-login').classList.toggle('error', !!m); $('#h-login').textContent = m || `Ссылка на профиль: ${profileLink}${$('#login').value.trim()}`; };
        form.addEventListener('input', () => { save_.disabled = !dirty(); setLoginErr(''); });
        form.addEventListener('change', () => { save_.disabled = !dirty(); });
        $('#cancel').addEventListener('click', () => { $('#name').value = u.name; $('#login').value = u.login; $('#uni').value = u.uni; $('#show').checked = u.showInUniRating !== false; save_.disabled = true; setLoginErr(''); });
        form.addEventListener('submit', (e) => {
          e.preventDefault();
          const name = $('#name').value.trim(), login = $('#login').value.trim().toLowerCase();
          if (!name.includes(' ')) { toast({ title: 'Укажите имя и фамилию', kind: 'warn' }); return; }
          if (!/^[a-z0-9_.\-]{3,24}$/.test(login)) { setLoginErr('Логин: 3–24 символа, латиница, цифры, точка, дефис'); return; }
          if (login !== u.login && (getState().accounts.some((a) => a.login === login) || pool().some((p) => p.login === login))) { setLoginErr('Такой логин уже занят'); return; }
          const patch = { name, login, showInUniRating: $('#show').checked };
          const [first, ...rest] = name.split(/\s+/); patch.first = first; patch.last = rest.join(' ');
          if ($('#uni').value !== u.uni && canChangeUni) { patch.uni = $('#uni').value; patch.uniChangedAt = Date.now(); }
          updateProfile(patch); toast({ title: 'Профиль сохранён' }); navigate('/settings/profile', { replace: true });
        });
        $('#photo').addEventListener('change', async (e) => { const f = e.target.files[0]; if (!f) return; if (f.size > 5 * 1024 * 1024) { toast({ title: 'Файл больше 5 МБ', kind: 'warn' }); return; } try { updateProfile({ avatar: await resizeImage(f) }); navigate('/settings/profile', { replace: true }); } catch { toast({ title: 'Не удалось открыть изображение', kind: 'warn' }); } });
        $('#rmphoto').addEventListener('click', () => { updateProfile({ avatar: null }); navigate('/settings/profile', { replace: true }); });
      } else if (sec === 'security' && !u.demo) {
        $('#sform').addEventListener('submit', async (e) => {
          e.preventDefault();
          const setE = (id, m) => { $('#f-' + id).classList.toggle('error', !!m); if (m) $('#h-' + id).textContent = m; };
          setE('old', ''); setE('new', '');
          if (!(await checkPassword(u, $('#old').value))) { setE('old', 'Неверный пароль'); return; }
          if (!validatePassword($('#new').value)) { setE('new', 'Не короче 8 символов, хотя бы одна цифра'); return; }
          await setPassword(u, $('#new').value); $('#old').value = ''; $('#new').value = ''; toast({ title: 'Пароль изменён' });
        });
      } else if (sec === 'notifications') {
        on(root, 'change', '[data-n]', (e, t) => mutate((dd) => { dd.settings.notify[t.dataset.n] = t.checked; }));
      } else if (sec === 'editor') {
        $('#hints').addEventListener('change', (e) => mutate((dd) => { dd.settings.hints = e.target.checked; }));
        on($('#theme'), 'click', '[data-t]', (e, b) => { setTheme(b.dataset.t); root.querySelectorAll('#theme button').forEach((x) => x.setAttribute('aria-pressed', x === b)); });
        $('#resetonb').addEventListener('click', () => { mutate((dd) => { dd.onboarding.dismissed = false; dd.hintUsed = {}; }); toast({ title: 'Вставки включены снова' }); });
        $('#drafts').addEventListener('click', async () => { if (await confirmModal({ title: 'очистить черновики?', text: 'Недописанные схемы и код во всех задачах и песочнице будут удалены. Решённые задачи останутся.', ok: 'очистить', cancel: 'отмена' })) { mutate((dd) => { dd.drafts = {}; dd.sandbox.draft = null; }); toast({ title: 'Черновики очищены' }); } });
        $('#export').addEventListener('click', () => { const blob = new Blob([JSON.stringify({ account: { ...u, pass: undefined, salt: undefined }, data: data() }, null, 2)], { type: 'application/json' }); const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'sparq-arena-demo-data.json'; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 1000); });
      } else if (sec === 'delete') {
        $('#del').addEventListener('click', async () => { if (await confirmModal({ title: 'удалить аккаунт?', text: 'Это необратимо: все данные демо-аккаунта удалятся из браузера.', ok: 'удалить', cancel: 'отмена', icon: 'trash' })) { deleteAccount(); toast({ title: 'Аккаунт удалён', kind: 'info' }); navigate('/'); } });
      }
    },
  };
}
