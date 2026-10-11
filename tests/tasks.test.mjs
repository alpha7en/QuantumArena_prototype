import test from 'node:test';
import assert from 'node:assert/strict';
import { TASKS, limitsFor } from '../assets/js/data/tasks.js';
import { judge, verdictText } from '../assets/js/judge/judge.js';
import { buildFromCode } from '../assets/js/lang/qiskitlite.js';
import { Circuit } from '../assets/js/quantum/circuit.js';

const buildRef = (task) => (param) => buildFromCode(task.reference, { oracleArity: task.oracleArity || 0, fnArgs: param !== undefined ? [param] : [] });

for (const task of TASKS) {
  test(`#${task.num} ${task.id}: эталон проходит`, () => {
    const res = judge(task, buildRef(task));
    assert.equal(res.verdict, 'ok', `${task.id}: ${verdictText(res)} ${JSON.stringify(res.fail || res.limit || res.error || res.noise || {}, (k, v) => (k === 'op' ? undefined : v))}`);
  });

  test(`#${task.num} ${task.id}: пустая схема не проходит`, () => {
    const empty = (param) => { const n = task.suite(param).n; return { circuit: new Circuit(n) }; };
    const res = judge(task, empty);
    assert.notEqual(res.verdict, 'ok', `${task.id}: пустая схема принята`);
  });

  test(`#${task.num} ${task.id}: эталон без последнего гейта не проходит`, () => {
    const cut = (param) => {
      const b = buildRef(task)(param);
      const c = b.circuit.clone();
      c.ops.pop();
      return { circuit: c };
    };
    const res = judge(task, cut);
    assert.notEqual(res.verdict, 'ok', `${task.id}: усечённый эталон принят`);
  });
}
