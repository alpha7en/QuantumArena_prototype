// Состояние раундов пользователя: регистрация, запуск (демо-раунд или с личным таймером), прогресс, итоги и рейтинг.
import { data, mutate, notify } from '../store.js';
import { roundTasks, cohort, placeInRound, scoreProgress, ratingDelta, participantsOf, ROUND_MS, POINTS, PENALTY_MIN, roundStart, roundEnd, schedule } from './rounds.js';
import { pool } from './people.js';

export const LIVE_NOISE = 0.01;

export function getRound(n) { return data().rounds[n] || null; }
export function isRegistered(n) { const r = getRound(n); return !!(r && r.registered); }
export const registeredCount = (n) => Math.round(participantsOf(n) * 1.9) + (isRegistered(n) ? 1 : 0);

export function setRegistered(n, on) {
  mutate((d) => { (d.rounds[n] ||= {}).registered = on; if (on) notify(d, { kind: 'round', title: `Вы записаны на раунд ${n}`, text: 'В демо раунд можно запустить вручную на странице контеста.', href: `/contests/${n}` }); });
}

// Раунд с личным таймером завершается сам; «живой» демо-раунд после 0:00 замораживается до кнопки «итоги».
export function activeRun(n) {
  const r = getRound(n);
  if (!r || !r.run || r.run.finished) return null;
  if (Date.now() >= r.run.endsAt && r.run.mode === 'timer') { finishRun(n); return null; }
  return r.run;
}
export const isExpired = (run) => Date.now() >= run.endsAt;
export const anyActiveRun = () => {
  const d = data();
  for (const k of Object.keys(d.rounds)) { const r = d.rounds[k]; if (r.run && !r.run.finished) { if (Date.now() >= r.run.endsAt && r.run.mode === 'timer') finishRun(+k); else return { n: +k, run: r.run }; } }
  return null;
};

export function startRun(n, mode) {
  const now = Date.now();
  mutate((d) => {
    const r = (d.rounds[n] ||= {});
    r.run = { mode, startedAt: now, endsAt: now + ROUND_MS, finished: false, progress: [null, null, null, null], wrong: [0, 0, 0, 0], subs: [] };
  });
}

export function finishRun(n, { early = false } = {}) {
  mutate((d) => {
    const r = d.rounds[n];
    if (!r || !r.run || r.run.finished) return;
    const run = r.run;
    run.finished = true; run.finishedAt = Date.now(); run.early = early;
    const prog = run.progress.map((p, j) => (p ? { at: p.at, wrong: p.wrong } : { at: null, wrong: run.wrong[j] }));
    const res = placeInRound(n, prog);
    run.result = { ...res };
    if (run.mode === 'live') {
      const before = d.rating, played = d.history.length;
      const delta = ratingDelta(before, played, res.place, res.of);
      const after = Math.max(600, (before ?? 1200) + delta);
      d.rating = after;
      d.history.push({ round: n, before: before ?? 1200, after, delta, place: res.place, of: res.of, solved: res.count, ts: Date.now() });
      run.result.delta = delta; run.result.before = before ?? 1200; run.result.after = after;
      notify(d, { kind: 'results', title: `Итоги раунда ${n}`, text: `${res.place}-е место из ${res.of} · ${res.count} из 4 · рейтинг ${delta >= 0 ? '+' : ''}${delta}`, href: `/contests/${n}` });
    } else {
      notify(d, { kind: 'results', title: `Раунд ${n} с таймером завершён`, text: `Вы были бы ${res.place}-м из ${res.of}. Рейтинг не меняется.`, href: `/contests/${n}` });
    }
  });
}

// Контекст для редактора задачи в раунде.
export function openRoundContext(n, q, taskId) {
  const run = activeRun(n);
  if (!run) return null;
  const tasks = roundTasks(n);
  if (q < 1 || q > 4 || (taskId && tasks[q - 1].id !== taskId)) return null;
  return {
    n, q, endsAt: run.endsAt, noise: run.mode === 'live' || run.mode === 'timer' ? LIVE_NOISE : 0,
    expired: () => Date.now() >= run.endsAt,
    onVerdict(res, task, sub) {
      let note = null;
      mutate((d) => {
        const r = d.rounds[n]; if (!r || !r.run) return;
        const ru = r.run, j = q - 1;
        ru.subs.unshift({ q, ts: Date.now(), kind: sub.kind, label: sub.label, num: sub.num });
        if (res.verdict === 'error') return;
        if (res.verdict === 'ok') {
          if (!ru.progress[j]) { ru.progress[j] = { at: Math.max(1, Math.ceil((Date.now() - ru.startedAt) / 60000)), wrong: ru.wrong[j] }; }
        } else if (!ru.progress[j]) { ru.wrong[j] += 1; note = `+${PENALTY_MIN} мин штрафа к времени.`; }
      });
      return note;
    },
  };
}

export const progressOf = (n) => { const r = getRound(n); return r && r.run ? r.run : null; };

// Таблица раунда «вживую»: срез результатов участников на минуте t от старта.
export function liveTable(n, elapsedMin, progress, { uni = null } = {}) {
  const { rows } = cohort(n);
  const snap = rows.map((r) => {
    let score = 0, time = 0, count = 0;
    const cells = r.solved.map((ok, j) => {
      if (ok && r.times[j] <= elapsedMin) { score += POINTS[j]; time += r.times[j] + PENALTY_MIN * r.wrong[j]; count++; return 'ok'; }
      return r.wrong[j] > 0 && r.times[j] != null && r.times[j] <= elapsedMin ? 'no' : (ok ? 'none' : (r.wrong[j] > 0 ? 'no' : 'none'));
    });
    return { person: r.person, score, time, count, cells };
  });
  snap.sort((a, b) => b.score - a.score || a.time - b.time);
  const me = scoreProgress(progress);
  let better = 0; for (const r of snap) { if (r.score > me.score || (r.score === me.score && r.time <= me.time)) better++; else break; }
  const list = uni ? snap.filter((r) => r.person.uni === uni) : snap;
  return { rows: list, place: better + 1, of: snap.length + 1, me };
}

export { roundTasks, roundStart, roundEnd, schedule, POINTS, PENALTY_MIN, cohort, placeInRound, participantsOf, ROUND_MS };
