// Локальное хранилище демо. Всё — в localStorage этого браузера; на сервер ничего не уходит.
import { uniById } from './data/people.js';

const KEY = 'sparq-arena:v2';
const bus = new EventTarget();
let mem = null;          // запасной вариант, если localStorage недоступен
let state = null;

const emptyData = () => ({
  solved: {}, attempts: {}, submissions: [], drafts: {}, rounds: {}, rating: null, history: [],
  notifications: [], activity: {}, streak: { last: null, count: 0, best: 0 }, hintUsed: {},
  settings: { hints: true, notify: { round: true, results: true, digest: false } },
  onboarding: { dismissed: false }, sandbox: { draft: null },
});

function fresh() { return { v: 2, accounts: [], session: null, data: { guest: emptyData() }, ui: { theme: 'dark' } }; }

function read() {
  try { const raw = localStorage.getItem(KEY); if (raw) { const s = JSON.parse(raw); if (s && s.v === 2) return s; } } catch { /* недоступно */ }
  return mem || fresh();
}
export function load() { state = read(); return state; }
export function save() {
  mem = state;
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* квота или приватный режим */ }
  bus.dispatchEvent(new Event('change'));
}
export const onChange = (fn) => { bus.addEventListener('change', fn); return () => bus.removeEventListener('change', fn); };
export const getState = () => state || load();

export const currentUser = () => { const s = getState(); return s.session ? s.accounts.find((a) => a.id === s.session) || null : null; };
export const isGuest = () => !currentUser();

// Данные текущего пользователя (или гостя).
export function data() {
  const s = getState(), id = s.session || 'guest';
  if (!s.data[id]) s.data[id] = emptyData();
  const d = s.data[id];
  for (const [k, v] of Object.entries(emptyData())) if (!(k in d)) d[k] = v;
  return d;
}
export function mutate(fn) { const r = fn(data(), getState()); save(); return r; }

// ---------- Аккаунты (демо: пароль хранится хэшем только в этом браузере) ----------

async function hash(pass, salt) {
  const text = salt + ':' + pass;
  try {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
    return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
  } catch {
    let h = 5381; for (let i = 0; i < text.length; i++) h = ((h << 5) + h + text.charCodeAt(i)) | 0;
    return 'x' + (h >>> 0).toString(16);
  }
}

export function validateEmail(e) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e); }
export function validatePassword(p) { return p.length >= 8 && /\d/.test(p); }

export async function register({ first, last, email, pass, uni }) {
  const s = getState();
  const mail = email.trim().toLowerCase();
  if (s.accounts.some((a) => a.email === mail)) return { error: 'email' };
  const id = 'u' + Date.now().toString(36);
  const salt = Math.random().toString(36).slice(2);
  const base = (first[0] + '.' + last).toLowerCase().replace(/[^a-zа-яё0-9.]/gi, '');
  const acc = { id, email: mail, first: first.trim(), last: last.trim(), name: `${first.trim()} ${last.trim()}`, login: base, uni, salt, pass: await hash(pass, salt), createdAt: Date.now(), avatar: null, showInUniRating: true, uniChangedAt: 0 };
  // уникальный логин
  let k = 1; const orig = acc.login; while (s.accounts.some((a) => a.login === acc.login)) acc.login = orig + k++;
  s.accounts.push(acc);
  s.session = id;
  s.data[id] = emptyData();
  // то, что гость успел решить до регистрации, переезжает в аккаунт
  const g = s.data.guest;
  if (g && (Object.keys(g.solved).length || Object.keys(g.drafts).length)) { s.data[id].solved = g.solved; s.data[id].drafts = g.drafts; s.data[id].attempts = g.attempts; s.data.guest = emptyData(); }
  notify(s.data[id], { kind: 'system', title: 'Добро пожаловать в демо', text: 'Данные хранятся только в этом браузере. Решайте задачи и записывайтесь на раунды.' });
  save();
  return { user: acc };
}

export async function login(email, pass) {
  const s = getState(), mail = email.trim().toLowerCase();
  const acc = s.accounts.find((a) => a.email === mail);
  if (!acc) return { error: 'nouser' };
  if (acc.pass !== await hash(pass, acc.salt)) return { error: 'pass' };
  s.session = acc.id; save();
  return { user: acc };
}
export async function checkPassword(acc, pass) { return !!acc.pass && acc.pass === await hash(pass, acc.salt); }
export async function setPassword(acc, pass) { acc.salt = Math.random().toString(36).slice(2); acc.pass = await hash(pass, acc.salt); save(); }
export function logout() { const s = getState(); s.session = null; save(); }

export function updateProfile(patch) {
  const s = getState(), acc = currentUser();
  if (!acc) return;
  Object.assign(acc, patch);
  save();
}
export function deleteAccount() {
  const s = getState(), id = s.session;
  s.accounts = s.accounts.filter((a) => a.id !== id);
  delete s.data[id]; s.session = null; save();
}

// ---------- Уведомления, серия, активность ----------

export function notify(d, { kind = 'system', title, text, href = null }) {
  d.notifications.unshift({ id: Math.random().toString(36).slice(2), ts: Date.now(), kind, title, text, href, unread: true });
  d.notifications = d.notifications.slice(0, 30);
}
export const dayKey = (ts = Date.now()) => { const d = new Date(ts); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };

export function touchActivity(d, ts = Date.now()) {
  const k = dayKey(ts);
  d.activity[k] = (d.activity[k] || 0) + 1;
}
export function bumpStreak(d, ts = Date.now()) {
  const k = dayKey(ts), prev = d.streak.last;
  if (prev === k) return;
  const y = dayKey(ts - 86400000);
  d.streak.count = prev === y ? d.streak.count + 1 : 1;
  d.streak.best = Math.max(d.streak.best, d.streak.count);
  d.streak.last = k;
}
export function streakNow(d) {
  const k = dayKey(), y = dayKey(Date.now() - 86400000);
  return d.streak.last === k || d.streak.last === y ? d.streak.count : 0;
}

// ---------- Тема ----------

export function themeSetting() { return getState().ui.theme || 'dark'; }
export function applyTheme(t = themeSetting()) {
  const eff = t === 'system' ? (matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark') : t;
  document.documentElement.dataset.theme = eff;
}
export function setTheme(t) {
  const root = document.documentElement;
  root.classList.add('theming'); // плавная смена цветов на время переключения
  getState().ui.theme = t; save(); applyTheme(t);
  setTimeout(() => root.classList.remove('theming'), 380);
}

export const uniName = (id) => (uniById(id) || { name: 'Другой вуз' }).name;
