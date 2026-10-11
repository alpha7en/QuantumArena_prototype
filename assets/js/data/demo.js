// Демо-профиль с историей, чтобы можно было посмотреть интерфейс без решения десятков задач.
import { getState, save, dayKey } from '../store.js';
import { TASKS } from './tasks.js';
import { rng } from '../quantum/sim.js';
import { placeInRound, ratingDelta, schedule } from './rounds.js';

export function seedDemoProfile() {
  const s = getState();
  let acc = s.accounts.find((a) => a.demo);
  if (!acc) {
    acc = { id: 'udemo', email: 'demo@sparq.local', first: 'Демо', last: 'Участник', name: 'Демо Участник', login: 'demo', uni: 'innopolis', salt: 'demo', pass: '', createdAt: Date.now() - 280 * 86400000, avatar: null, showInUniRating: true, uniChangedAt: Date.now() - 100 * 86400000, demo: true };
    s.accounts.push(acc);
    const rand = rng(77);
    const d = { solved: {}, attempts: {}, submissions: [], drafts: {}, rounds: {}, rating: null, history: [], notifications: [], activity: {}, streak: { last: dayKey(), count: 6, best: 18 }, hintUsed: {}, settings: { hints: true, notify: { round: true, results: true, digest: false } }, onboarding: { dismissed: true }, sandbox: { draft: null } };
    const solvedIds = TASKS.filter((t) => !t.codeOnly).slice(0, 22).map((t) => t.id).filter((_, i) => i !== 3 && i !== 5);
    const now = Date.now();
    solvedIds.forEach((id, i) => { const at = now - Math.round((solvedIds.length - i) * 3.2 * 86400000 * (0.6 + rand() * 0.8)); d.solved[id] = { at, attempts: 1 + Math.floor(rand() * 3), code: '' }; d.attempts[id] = d.solved[id].attempts; });
    // активность за год: ~160 отправок
    for (let i = 0; i < 163; i++) { const day = Math.floor(Math.pow(rand(), 0.8) * 260); const k = dayKey(now - day * 86400000); d.activity[k] = (d.activity[k] || 0) + 1; }
    // раунды: последние 6 завершённых
    const last = schedule().last;
    let rating = null;
    const plans = [[2, 90], [3, 55], [2, 40], [1, 30], [3, 62], [2, 48]];
    for (let k = 0; k < 6; k++) {
      const n = last - 5 + k, [count] = plans[k];
      const prog = [0, 1, 2, 3].map((j) => (j < count ? { at: 12 + j * 17 + Math.floor(rand() * 8), wrong: Math.floor(rand() * 2) } : { at: null, wrong: 0 }));
      const res = placeInRound(n, prog);
      const before = rating ?? 1200, delta = ratingDelta(rating, d.history.length, res.place, res.of), after = before + delta;
      rating = after;
      d.history.push({ round: n, before, after, delta, place: res.place, of: res.of, solved: res.count, ts: now - (last - n + 1) * 7 * 86400000 });
      d.rounds[n] = { registered: true, run: { mode: 'live', startedAt: 0, endsAt: 0, finished: true, finishedAt: 0, progress: prog.map((p) => (p.at != null ? p : null)), wrong: prog.map((p) => p.wrong), subs: [], result: { ...res, delta, before, after } } };
    }
    d.rating = rating;
    d.notifications = [
      { id: 'n1', ts: now - 3600e3, kind: 'results', title: `Итоги раунда ${last}`, text: `${d.history[5].place}-е место из ${d.history[5].of}`, href: `/contests/${last}`, unread: true },
      { id: 'n2', ts: now - 26 * 3600e3, kind: 'accept', title: `Принято: задача ${TASKS.find((t) => t.id === solvedIds[solvedIds.length - 1]).num}`, text: 'Серия продолжается', href: '/tasks', unread: false },
    ];
    s.data[acc.id] = d;
  }
  s.session = acc.id; save();
  return acc;
}
