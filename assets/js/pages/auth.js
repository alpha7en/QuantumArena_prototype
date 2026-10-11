import { html, raw, esc, on } from '../ui/dom.js';
import { icon, socialIcon } from '../ui/icons.js';
import { UNIVERSITIES } from '../data/people.js';
import { register, login, validateEmail, validatePassword, getState, setPassword, currentUser } from '../store.js';
import { navigate } from '../router.js';
import { toast } from '../ui/overlay.js';
import { seedDemoProfile } from '../data/demo.js';

const SOCIAL_NOTE = 'В демо вход через Яндекс ID и VK ID недоступен — зарегистрируйтесь по почте.';

const hero = (kind) => {
  const t = {
    register: ['регистрация', 'рейтинг вуза собирают его студенты', 'Решённые задачи и раунды идут в общий зачёт вуза. Сменить вуз можно раз в семестр.'],
    login: ['вход', 'с возвращением', 'Продолжайте с того места, где остановились: черновики и решения сохранены в этом браузере.'],
    recover: ['восстановление', 'забыли пароль?', 'В демо письма не отправляются, поэтому новый пароль можно задать прямо здесь.'],
  }[kind];
  return html`<div class="auth-hero card xl"><div class="auth-hero-text"><div class="t-kicker">${t[0]}</div><h2 class="t-display md" style="max-width:520px">${t[1]}</h2><p class="t-lead" style="max-width:480px">${t[2]}</p></div></div>`;
};

const field = (id, label, input, hint = '', cls = '') => html`<div class="field ${cls}" id="f-${id}"><label for="${id}">${label}</label>${raw(input)}<div class="hint" id="h-${id}">${hint}</div></div>`;

export default async function auth(ctx) {
  const kind = ctx.path.replace('/', '') || 'login';
  if (currentUser() && kind !== 'recover') { navigate('/profile', { replace: true }); return { title: 'Вход', nav: null, html: '' }; }
  const unis = UNIVERSITIES.map((u) => `<option value="${u.id}">${esc(u.name)}</option>`).join('');
  let form = '';
  if (kind === 'register') {
    form = html`<h1 class="t-h1" style="font-size:34px;line-height:40px">создать аккаунт</h1>
      <div class="row" style="gap:12px"><button type="button" class="btn btn-secondary grow" data-social>${raw(socialIcon('yandex'))}Яндекс ID</button><button type="button" class="btn btn-secondary grow" data-social>${raw(socialIcon('vk'))}VK ID</button></div>
      <div class="or"><span>или по почте</span></div>
      <form id="form" class="col" style="gap:14px" novalidate>
        <div class="row" style="gap:12px;align-items:flex-start">${field('first', 'Имя', '<div class="control"><input id="first" autocomplete="given-name" required></div>')}${field('last', 'Фамилия', '<div class="control"><input id="last" autocomplete="family-name" required></div>')}</div>
        ${field('uni', 'Вуз', `<div class="control select"><select id="uni">${unis}</select><span class="chev">${icon('chev-d', 'sm')}</span></div>`)}
        ${field('email', 'Почта', `<div class="control">${icon('mail')}<input id="email" type="email" autocomplete="email" placeholder="name@university.ru" required></div>`)}
        ${field('pass', 'Пароль', `<div class="control">${icon('lock')}<input id="pass" type="password" autocomplete="new-password" required></div>`, 'Не короче 8 символов, хотя бы одна цифра')}
        <label class="checkbox"><input type="checkbox" id="agree"><span class="box"></span><span>Принимаю <a class="link" href="https://github.com/alpha7en/QuantumArena_prototype/blob/main/docs/DEMO_DATA.md" target="_blank" rel="noopener">правила демо</a> и понимаю, что данные хранятся только в этом браузере</span></label>
        <button class="btn btn-primary block" id="submit" disabled>создать аккаунт</button>
      </form>
      <div class="muted t-small" style="text-align:center">Уже есть аккаунт? <a class="link" href="#/login">войти</a></div>`;
  } else if (kind === 'login') {
    form = html`<h1 class="t-h1" style="font-size:34px;line-height:40px">войти</h1>
      <div class="row" style="gap:12px"><button type="button" class="btn btn-secondary grow" data-social>${raw(socialIcon('yandex'))}Яндекс ID</button><button type="button" class="btn btn-secondary grow" data-social>${raw(socialIcon('vk'))}VK ID</button></div>
      <div class="or"><span>или по почте</span></div>
      <form id="form" class="col" style="gap:14px" novalidate>
        ${field('email', 'Почта', `<div class="control">${icon('mail')}<input id="email" type="email" autocomplete="email" required></div>`)}
        ${field('pass', 'Пароль', `<div class="control">${icon('lock')}<input id="pass" type="password" autocomplete="current-password" required></div>`)}
        <div class="row" style="justify-content:flex-end"><a class="link" href="#/recover" style="font-weight:500;font-size:14px">забыли пароль?</a></div>
        <button class="btn btn-primary block" id="submit">войти</button>
      </form>
      <button class="btn btn-outline block" id="demo">${icon('user', 'sm')}посмотреть демо-профиль с историей</button>
      <div class="muted t-small" style="text-align:center">Нет аккаунта? <a class="link" href="#/register">зарегистрироваться</a></div>`;
  } else {
    form = html`<h1 class="t-h1" style="font-size:30px;line-height:38px">восстановление пароля</h1>
      <form id="form" class="col" style="gap:14px" novalidate>
        <p class="secondary t-small">Укажите почту аккаунта. В демо письма не отправляются: если аккаунт найден в этом браузере, вы сможете сразу задать новый пароль.</p>
        ${field('email', 'Почта', `<div class="control">${icon('mail')}<input id="email" type="email" autocomplete="email" required></div>`)}
        <div id="newpass" hidden>${field('pass', 'Новый пароль', `<div class="control">${icon('lock')}<input id="pass" type="password" autocomplete="new-password"></div>`, 'Не короче 8 символов, хотя бы одна цифра')}</div>
        <button class="btn btn-primary block" id="submit">найти аккаунт</button>
      </form>
      <div class="muted t-small" style="text-align:center"><a class="link" href="#/login">вернуться ко входу</a></div>`;
  }
  const view = html`<div class="auth">${hero(kind)}<div class="auth-form card xl">${form}</div></div>`;

  return {
    title: kind === 'register' ? 'Регистрация' : kind === 'login' ? 'Вход' : 'Восстановление пароля', nav: null, html: view,
    mount(root) {
      const $ = (s) => root.querySelector(s);
      const setErr = (id, msg) => { const f = $('#f-' + id); if (!f) return; f.classList.toggle('error', !!msg); const h = $('#h-' + id); if (h) { if (msg) { h.dataset.orig ??= h.innerHTML; h.innerHTML = msg; } else if (h.dataset.orig !== undefined) h.innerHTML = h.dataset.orig; } };
      root.querySelectorAll('[data-social]').forEach((b) => b.addEventListener('click', () => toast({ title: 'Недоступно в демо', text: SOCIAL_NOTE, kind: 'info' })));
      const form = $('#form');
      if (kind === 'register') {
        const check = () => { const ok = $('#first').value.trim() && $('#last').value.trim() && validateEmail($('#email').value) && validatePassword($('#pass').value) && $('#agree').checked; $('#submit').disabled = !ok; };
        form.addEventListener('input', () => { setErr('email', ''); check(); });
        form.addEventListener('change', check);
        $('#email').addEventListener('blur', (e) => { if (e.target.value && !validateEmail(e.target.value)) setErr('email', 'Проверьте адрес почты'); });
        $('#pass').addEventListener('blur', (e) => { if (e.target.value && !validatePassword(e.target.value)) setErr('pass', 'Не короче 8 символов, хотя бы одна цифра'); else setErr('pass', ''); });
        form.addEventListener('submit', async (e) => {
          e.preventDefault(); const btn = $('#submit'); btn.classList.add('loading');
          const r = await register({ first: $('#first').value, last: $('#last').value, email: $('#email').value, pass: $('#pass').value, uni: $('#uni').value });
          btn.classList.remove('loading');
          if (r.error === 'email') { setErr('email', 'Эта почта уже зарегистрирована. <a class="link" href="#/login">Войти</a> или <a class="link" href="#/recover">восстановить пароль</a>'); return; }
          toast({ title: `Добро пожаловать, ${r.user.first}`, text: 'Аккаунт создан в этом браузере.', kind: 'ok' });
          navigate('/tasks');
        });
      } else if (kind === 'login') {
        form.addEventListener('input', () => { setErr('email', ''); setErr('pass', ''); });
        form.addEventListener('submit', async (e) => {
          e.preventDefault(); const btn = $('#submit'); btn.classList.add('loading');
          const r = await login($('#email').value, $('#pass').value);
          btn.classList.remove('loading');
          if (r.error === 'nouser') { setErr('email', 'Аккаунт с такой почтой не найден в этом браузере. <a class="link" href="#/register">Зарегистрироваться</a>'); return; }
          if (r.error === 'pass') { setErr('pass', 'Неверный пароль'); return; }
          navigate('/tasks');
        });
        $('#demo').addEventListener('click', () => { seedDemoProfile(); toast({ title: 'Демо-профиль открыт', text: 'Это заполненный примером профиль: рейтинг, история раундов и решённые задачи смоделированы.', kind: 'info' }); navigate('/profile'); });
      } else {
        let found = null;
        form.addEventListener('submit', async (e) => {
          e.preventDefault();
          const email = $('#email').value.trim().toLowerCase();
          if (!found) {
            if (!validateEmail(email)) { setErr('email', 'Проверьте адрес почты'); return; }
            found = getState().accounts.find((a) => a.email === email && !a.demo);
            if (!found) { setErr('email', 'Аккаунт с такой почтой не найден в этом браузере. В демо письма не отправляются.'); return; }
            setErr('email', ''); $('#newpass').hidden = false; $('#submit').textContent = 'сохранить пароль'; $('#pass').focus();
            return;
          }
          const p = $('#pass').value;
          if (!validatePassword(p)) { setErr('pass', 'Не короче 8 символов, хотя бы одна цифра'); return; }
          await setPassword(found, p);
          toast({ title: 'Пароль обновлён', text: 'Теперь можно войти с новым паролем.', kind: 'ok' }); navigate('/login');
        });
      }
    },
  };
}
