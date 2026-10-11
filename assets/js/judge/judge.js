// Тестирующая система sparq arena (демо-версия, работает в браузере).
// Каскад проверок: ограничения → входы (состояние/преобразование/анциллы) → шум относительно эталона.
// Теоретическая основа — research/06_quantum_autograder_research и docs/JUDGE.md.

import { runOps, fidelity, inner, subsystemFidelity, marginal, hasNonUnitary, State } from '../quantum/sim.js';
import { runDM, rhoFidelity, rhoMarginal } from '../quantum/dm.js';
import { checkLimits } from '../quantum/circuit.js';
import { formatState, ket, pct } from '../quantum/format.js';
import { buildFromCode } from '../lang/qiskitlite.js';

export const TOL = 1e-6;        // допуск по фиделити: F ≥ 1 − TOL
export const PHASE_TOL = 1e-4;  // допуск на общую глобальную фазу в группе случаев
const SKIP_SIM_FACTOR = 4;      // схемы, раздутые больше чем в 4 раза от лимита, не симулируются

export const limitsOf = (task, param) => (typeof task.limits === 'function' ? task.limits(param) : task.limits) || {};
export const suiteOf = (task, param) => task.suite(param);

function simulate(circuit, c, n) {
  const ctx = c.oracle ? { oracle: c.oracle } : {};
  if (hasNonUnitary(circuit.ops)) return { rho: runDM(circuit.ops, n, c.init, { ctx }) };
  return { st: runOps(circuit.ops, n, c.init, ctx) };
}

function describeOut(res, n) {
  if (res.st) return n <= 5 ? formatState(res.st).text : null;
  return 'смешанное состояние (после измерения или сброса)';
}

// Возвращает { ok, index, reason, got, expected, note } для набора случаев.
export function runCases(circuit, suite, task) {
  const { n, cases } = suite;
  const groupPhase = {};
  for (let i = 0; i < cases.length; i++) {
    const c = cases[i], e = c.expect;
    const res = simulate(circuit, c, n);
    const fail = (extra) => ({ ok: false, index: i, label: c.label, ...extra });
    if (e.kind === 'state') {
      const qubits = e.qubits || Array.from({ length: n }, (_, q) => q);
      const full = !e.qubits;
      let F, o = null;
      if (res.st) {
        if (full) { o = inner(e.state, res.st); F = o.re * o.re + o.im * o.im; }
        else F = subsystemFidelity(res.st, qubits, e.state);
      } else F = rhoFidelity(res.rho, qubits, e.state);
      if (F < 1 - 1e-6) {
        let note = null;
        const anc = suite.ancillas || task?.ancillaQubits;
        if (anc && anc.length && res.st) {
          const p0 = marginal(res.st, anc)[0];
          if (p0 < 0.999) note = `вспомогательные кубиты остались не в |0⟩ (вероятность |0…0⟩ = ${pct(p0)}) — их нужно вернуть`;
        }
        return fail({ reason: 'state', fidelity: F, got: describeOut(res, n), expected: qubits.length <= 5 ? formatState(e.state).text : null, note });
      }
      if (c.group && o) {
        const arg = Math.atan2(o.im, o.re);
        if (!(c.group in groupPhase)) groupPhase[c.group] = arg;
        else {
          let d = Math.abs(arg - groupPhase[c.group]) % (2 * Math.PI); if (d > Math.PI) d = 2 * Math.PI - d;
          if (d > PHASE_TOL) return fail({ reason: 'phase', note: 'Относительная фаза между входами не совпала: схема верна на отдельных входах, но не как преобразование. Проверьте знаки и фазовые гейты.' });
        }
      }
    } else if (e.kind === 'dist') {
      const p = res.st ? marginal(res.st, e.qubits) : rhoMarginal(res.rho, e.qubits);
      let tv = 0; for (let k = 0; k < p.length; k++) tv += Math.abs(p[k] - e.probs[k]); tv /= 2;
      if (tv > (e.tol ?? 0.01)) return fail({ reason: 'dist', got: `расстояние до нужного распределения ${(tv).toFixed(3).replace('.', ',')}`, expected: null });
    } else if (e.kind === 'prob') {
      const p = (res.st ? marginal(res.st, e.qubits) : rhoMarginal(res.rho, e.qubits))[e.outcome];
      const lo = e.min ?? 0, hi = e.max ?? 1;
      if (p < lo - 1e-9 || p > hi + 1e-9) {
        const want = e.min != null && e.max == null ? `≥ ${pct(e.min)}` : e.max != null && e.min == null ? `≤ ${pct(e.max)}` : `${pct(lo)}…${pct(hi)}`;
        return fail({ reason: 'prob', got: `P(${ket(e.outcome, e.qubits.length)}) = ${pct(p, 1)}`, expected: `P(${ket(e.outcome, e.qubits.length)}) ${want}`, note: e.note || null });
      }
    }
  }
  return { ok: true };
}

// Шум: сравнение фиделити схемы участника с эталоном при деполяризующем шуме ε на каждый многокубитный гейт.
function noiseCheck(task, circuit, suite, param, eps) {
  const c = suite.cases.find((x) => x.main) || suite.cases[0];
  if (!c || c.expect.kind !== 'state' || c.oracle || suite.n > 7 || !task.reference) return { applicable: false };
  const ref = buildFromCode(task.reference, { fnArgs: param !== undefined ? [param] : [], oracleArity: 0 });
  if (ref.error) return { applicable: false };
  const qubits = c.expect.qubits || Array.from({ length: suite.n }, (_, q) => q);
  const fSub = rhoFidelity(runDM(circuit.ops, suite.n, c.init, { noise: eps }), qubits, c.expect.state);
  const fRef = rhoFidelity(runDM(ref.circuit.ops, suite.n, c.init, { noise: eps }), qubits, c.expect.state);
  const slack = task.noise?.slack ?? 0.02;
  return { applicable: true, ok: fSub >= fRef - slack, fSub, fRef };
}

// Основная функция. build(param) → { circuit } | { error }.
export function judge(task, build, { noise = null, params = null } = {}) {
  const t0 = (typeof performance !== 'undefined' ? performance.now() : Date.now());
  const eps = noise ?? task.noise?.eps ?? 0;
  const values = task.params ? (params || task.params.values) : [undefined];
  const out = { verdict: 'ok', steps: [], eps };
  let inputStatus = 'ok', noiseStatus = eps === 0 ? 'ok' : 'ok', limitStatus = 'ok';
  let firstFail = null, limitInfo = null, noiseInfo = null, lastStats = null, noiseApplicable = eps > 0;

  for (const param of values) {
    const b = build(param);
    if (b.error) { return { ...out, verdict: 'error', error: b.error, param, steps: [], ms: Math.round(performance_now() - t0) }; }
    const circuit = b.circuit;
    const suite = suiteOf(task, param), lim = limitsOf(task, param);
    const nWant = suite.n;
    lastStats = circuit.stats();
    if (circuit.n !== nWant) {
      limitStatus = 'fail'; inputStatus = 'skip';
      limitInfo = { param, issues: [{ kind: 'qubits', text: `в задаче ${nWant} ${nWant === 1 ? 'кубит' : 'кубита/кубитов'}, в схеме — ${circuit.n}` }] };
      break;
    }
    const lc = checkLimits(circuit, lim, nWant);
    const huge = lim.gates != null && lastStats.gates > lim.gates * SKIP_SIM_FACTOR;
    let r = { ok: true };
    if (!huge) r = runCases(circuit, suite, task);
    if (!r.ok && !firstFail) { firstFail = { ...r, param }; inputStatus = 'fail'; }
    if (!lc.ok && !limitInfo) { limitInfo = { param, issues: lc.issues }; limitStatus = 'fail'; }
    if (r.ok && eps > 0 && !huge) {
      const nz = noiseCheck(task, circuit, suite, param, eps);
      if (!nz.applicable) noiseApplicable = false;
      else if (!nz.ok && !noiseInfo) { noiseInfo = { param, ...nz }; noiseStatus = 'fail'; }
    }
    if (firstFail) break;
  }

  const inputLabel = (() => {
    const s = suiteOf(task, values[0]);
    return s.cases.length === 1 ? s.cases[0].label : `${s.cases.length} ${pluralInputs(s.cases.length)}`;
  })();
  out.steps = [
    { id: 'input', label: inputLabel, status: inputStatus },
    { id: 'noise', label: `шум ${pct(eps)}`, status: firstFail ? 'skip' : noiseStatus, note: eps > 0 && !noiseApplicable ? 'не применяется' : null },
    { id: 'limits', label: 'лимиты', status: firstFail ? 'skip' : limitStatus },
  ];
  out.stats = lastStats;
  if (firstFail) { out.verdict = 'wa'; out.fail = firstFail; }
  else if (limitInfo) { out.verdict = 'limit'; out.limit = limitInfo; }
  else if (noiseInfo) { out.verdict = 'noise'; out.noise = noiseInfo; }
  out.ms = Math.round(performance_now() - t0);
  return out;
}

const pluralInputs = (n) => { const a = n % 10, b = n % 100; return a === 1 && b !== 11 ? 'вход' : a >= 2 && a <= 4 && (b < 10 || b >= 20) ? 'входа' : 'входов'; };
const performance_now = () => (typeof performance !== 'undefined' ? performance.now() : Date.now());

// Состояние схемы на «главном» входе — для панели «состояние» в редакторе задачи.
export function liveState(task, circuit, param) {
  const suite = suiteOf(task, param);
  const c = suite.cases.find((x) => x.main) || suite.cases[0];
  if (hasNonUnitary(circuit.ops)) return null;
  try { return runOps(circuit.ops, suite.n, c.init, c.oracle ? { oracle: c.oracle } : {}); } catch { return null; }
}

// Короткая человекочитаемая причина для вердикта.
export function verdictText(res) {
  switch (res.verdict) {
    case 'ok': return 'принято';
    case 'wa': return `неверный ответ · тест ${res.fail.index + 1}`;
    case 'limit': {
      const k = res.limit.issues[0].kind;
      return { gates: 'лимит гейтов', depth: 'превышена глубина', basis: 'гейт вне базиса', coupling: 'нарушена связность', qubits: 'число кубитов', oracle: 'вызовы оракула', twoQubit: 'двухкубитные гейты' }[k] || 'превышен лимит';
    }
    case 'noise': return 'не выдержал шум';
    case 'error': return `ошибка в коде${res.error.line ? ' · строка ' + res.error.line : ''}`;
  }
  return '';
}

export { State, ket };
