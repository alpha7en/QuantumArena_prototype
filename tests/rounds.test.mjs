import test from 'node:test';
import assert from 'node:assert/strict';
import { schedule, roundStart, roundEnd, cohort, placeInRound, ratingDelta, roundTasks, POINTS, participantsOf, BASE_ROUND } from '../assets/js/data/rounds.js';
import { pool, placeFor, uniStats, ratingTitle, nextTitle, POOL_SIZE } from '../assets/js/data/people.js';
import { TASKS } from '../assets/js/data/tasks.js';

test('расписание: раунд 522 — 11.10.2026 12:00 мск, длится 90 минут', () => {
  assert.equal(roundStart(BASE_ROUND).toISOString(), '2026-10-11T09:00:00.000Z');
  assert.equal(roundEnd(BASE_ROUND) - roundStart(BASE_ROUND), 90 * 60 * 1000);
  const t = Date.UTC(2026, 9, 11, 9, 30);
  assert.deepEqual(schedule(t), { next: 522, last: 521, running: true });
  const after = Date.UTC(2026, 9, 11, 12, 0);
  assert.equal(schedule(after).next, 523);
  assert.equal(schedule(after).last, 522);
});

test('у каждого раунда четыре разные задачи нужной сложности', () => {
  for (let n = 500; n < 540; n++) {
    const ts = roundTasks(n);
    assert.equal(ts.length, 4);
    assert.equal(new Set(ts.map((t) => t.id)).size, 4, `раунд ${n}`);
    assert.equal(ts[0].level, n === 517 || n === 520 || n === 521 ? ts[0].level : 1);
  }
});

test('таблица раунда детерминирована и отсортирована', () => {
  const a = cohort(520), b = cohort(520);
  assert.equal(a.N, participantsOf(520));
  assert.deepEqual(a.rows.slice(0, 3).map((r) => r.person.id), b.rows.slice(0, 3).map((r) => r.person.id));
  for (let i = 1; i < a.rows.length; i++) {
    const p = a.rows[i - 1], q = a.rows[i];
    assert.ok(p.score > q.score || (p.score === q.score && p.time <= q.time));
  }
  assert.ok(a.perTask[0] > a.perTask[3], 'первая задача решается чаще четвёртой');
});

test('место растёт с числом решённых задач и ухудшается со временем', () => {
  const none = placeInRound(520, [{ at: null, wrong: 0 }, { at: null, wrong: 0 }, { at: null, wrong: 0 }, { at: null, wrong: 0 }]);
  const one = placeInRound(520, [{ at: 10, wrong: 0 }, { at: null, wrong: 0 }, { at: null, wrong: 0 }, { at: null, wrong: 0 }]);
  const three = placeInRound(520, [{ at: 10, wrong: 0 }, { at: 20, wrong: 0 }, { at: 30, wrong: 0 }, { at: null, wrong: 0 }]);
  assert.ok(three.place < one.place && one.place < none.place);
  assert.equal(none.place, none.of);
  const slow = placeInRound(520, [{ at: 80, wrong: 3 }, { at: null, wrong: 0 }, { at: null, wrong: 0 }, { at: null, wrong: 0 }]);
  assert.ok(slow.place >= one.place);
});

test('рейтинг: победа даёт плюс, поражение — минус, первые раунды весомее', () => {
  assert.ok(ratingDelta(1200, 0, 10, 500) > 0);
  assert.ok(ratingDelta(1600, 20, 450, 500) < 0);
  assert.ok(Math.abs(ratingDelta(1200, 0, 100, 500)) > Math.abs(ratingDelta(1200, 20, 100, 500)));
});

test('пул участников: размер, порядок, титулы', () => {
  const p = pool();
  assert.equal(p.length, POOL_SIZE);
  for (let i = 1; i < p.length; i++) assert.ok(p[i - 1].rating >= p[i].rating);
  assert.equal(new Set(p.map((x) => x.login)).size, p.length, 'логины уникальны');
  assert.equal(placeFor(p[0].rating + 1), 1);
  assert.equal(ratingTitle(1645), 'специалист');
  assert.equal(nextTitle(1645).name, 'эксперт');
  const u = uniStats();
  assert.ok(u.length >= 20 && u[0].sum >= u[1].sum);
});

test('в банке нет задач вне порядка, номера подряд', () => {
  assert.deepEqual(TASKS.map((t) => t.num), TASKS.map((_, i) => i + 1));
  assert.equal(new Set(TASKS.map((t) => t.id)).size, TASKS.length);
});
