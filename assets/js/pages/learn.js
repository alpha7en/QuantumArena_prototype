import { html, raw, esc } from '../ui/dom.js';
import { icon } from '../ui/icons.js';
import { kicker } from '../ui/parts.js';
import { Board } from '../ui/board.js';
import { Circuit } from '../quantum/circuit.js';
import { State, runOps } from '../quantum/sim.js';
import { formatState } from '../quantum/format.js';
import { GATES, displayName } from '../quantum/gates.js';
import { opToCode } from '../lang/qiskitlite.js';
import { TASKS, ARCHETYPES, taskById } from '../data/tasks.js';

const GATE_LIST = [
  ['H', [], 'H', 'Создаёт суперпозицию. Базис X ↔ базис Z.'], ['X', [], 'X', 'Переворачивает кубит, как NOT.'], ['Z', [], 'Z', 'Меняет знак у |1⟩. Вероятности не меняет, но влияет на интерференцию.'],
  ['S', [], 'S', 'Фаза π/2 на |1⟩; два S дают Z.'], ['T', [], 'T', 'Фаза π/4 на |1⟩; два T дают S.'], ['RY', [Math.PI / 3], 'RY(π/3)', 'Поворот вокруг Y: меняет вероятности без фаз.'],
  ['CX', [], 'CX', 'Переворачивает цель, когда управляющий кубит в |1⟩. Источник запутанности.'], ['CZ', [], 'CZ', 'Меняет знак только у |11⟩; симметричен по кубитам.'], ['SWAP', [], 'SWAP', 'Меняет кубиты местами.'], ['CCX', [], 'CCX', 'Тоффоли: цель переворачивается, когда оба управляющих в |1⟩.'],
];

export default async function learn() {
  const bell = new Circuit(2); bell.h(0); bell.cx(0, 1); bell.autoColumns();
  const counts = Object.fromEntries(Object.keys(ARCHETYPES).map((k) => [k, TASKS.filter((t) => t.archetype === k)]));
  const path = ['plus-i', 'minus', 'uniform-3', 'bell', 'singlet', 'copy-bit', 'and-oracle', 'ghz3-line', 'parity', 'teleport', 'grover-2', 'qft-3'].map(taskById);
  const demoRows = GATE_LIST.map(([g, p, label, text]) => {
    const nc = { CX: 1, CZ: 1, CCX: 2 }[label] || 0;
    const base = g === 'CX' ? 'X' : g === 'CZ' ? 'Z' : g === 'CCX' ? 'X' : g;
    const n = label === 'CCX' ? 3 : label === 'SWAP' || nc === 1 ? 2 : 1;
    const op = base === 'SWAP' ? { g: 'SWAP', t: [0, 1], c: [], p: [] } : { g: base, t: [n - 1], c: Array.from({ length: nc }, (_, i) => i), p };
    // Вход: управляющие в |1⟩; для фазовых гейтов цель в |+⟩, иначе фаза не видна.
    const init = new State(n); init.re[0] = 0;
    const phaseGate = ['Z', 'S', 'T'].includes(base);
    const ctrlIdx = nc ? (1 << nc) - 1 : 0;
    if (phaseGate) { const tb = 1 << (n - 1); init.re[ctrlIdx] = Math.SQRT1_2; init.re[ctrlIdx | tb] = Math.SQRT1_2; }
    else init.re[base === 'SWAP' ? 1 : ctrlIdx] = 1;
    const out = runOps([op], n, init);
    return { label, text, from: formatState(init).text, to: formatState(out).text, code: opToCode(op) };
  });
  const view = html`<div class="page">
    <div class="page-head">${raw(kicker('обучение'))}<h1 class="t-display">обучение</h1><p class="t-lead" style="max-width:720px">Короткая справка: как читать редактор, что делают гейты и с чего начать. Подробной теории здесь нет — только то, что нужно для первых задач.</p></div>
    <section class="col" style="gap:20px"><h2 class="t-h2">как читать редактор</h2>
      <div class="learn3">
        <div class="card col" style="gap:12px"><div id="lb-demo"></div><h3 class="t-h3">диск на проводе</h3><p class="secondary t-small">Белое кольцо — вероятность увидеть 1 при измерении. Красная точка — фаза кубита. Пунктирный круг внутри означает, что кубит запутан с другими: у него нет собственного состояния.</p></div>
        <div class="card col" style="gap:12px"><div class="mono" style="font-size:20px;background:var(--bg-inset);border-radius:12px;padding:16px">(|00⟩ + |11⟩) / √2</div><h3 class="t-h3">формула состояния</h3><p class="secondary t-small">Слева направо — исходы в порядке |q1 q0⟩, как в Qiskit. Каждый исход входит со своей амплитудой, квадрат модуля амплитуды — вероятность. Общая фаза не наблюдаема и не показывается.</p></div>
        <div class="card col" style="gap:12px"><div class="cons"><div class="row"><span class="secondary">гейтов</span><span class="v">не больше 3</span></div><div class="row"><span class="secondary">глубина</span><span class="v">не больше 2</span></div><div class="row"><span class="secondary">базис</span><span class="v">H, X, Z, CX</span></div></div><h3 class="t-h3">лимиты задачи</h3><p class="secondary t-small">В условии только то, что разрешено: гейты, их число, глубина, соседи на чипе. Нарушение сообщается коротко: «4 гейта из 3».</p></div>
      </div></section>
    <section class="col" style="gap:20px"><h2 class="t-h2">гейты</h2>
      <div class="gates-grid">${demoRows.map((r) => html`<div class="card col" style="gap:10px"><div class="row" style="gap:12px"><span class="tile-btn ${r.label.length > 3 ? 'wide' : ''}" style="cursor:default">${r.label}</span><span class="mono muted" style="font-size:12px">${r.code}</span></div><p class="secondary t-small">${r.text}</p><div class="mono" style="font-size:13px;line-height:20px"><span class="muted">${r.from}</span><br>→ ${r.to}</div></div>`)}</div>
      <a class="btn btn-outline sm" href="#/sandbox" style="align-self:flex-start">попробовать в песочнице${raw(icon('arrow-r', 'sm'))}</a></section>
    <section class="col" style="gap:20px"><h2 class="t-h2">типы задач</h2><p class="secondary" style="max-width:720px">Каждая задача описана пятью осями: входное состояние, формат ответа, набор гейтов, связность кубитов и способ проверки. По типу «что нужно построить» задачи делятся на шесть архетипов.</p>
      <div class="gates-grid">${Object.entries(ARCHETYPES).map(([k, name]) => html`<a class="card col" style="gap:8px" href="#/tasks/${counts[k][0] ? counts[k][0].num : 1}"><div class="row"><span class="mono muted">${k}</span><span class="spacer"></span><span class="tag">${counts[k].length} в банке</span></div><h3 class="t-h3">${name}</h3><p class="secondary t-small">${{ T1: 'Получить заданное состояние из |0…0⟩.', T2: 'Собрать заданное преобразование в рамках бюджета гейтов или глубины.', T3: 'Вычислить функцию и вернуть вспомогательные кубиты в |0⟩.', T4: 'Гровер, Дойч — Йожа, Бернштейн — Вазирани, QFT, оценка фазы.', T5: 'Ограниченный базис, неполная связность, шум.', T6: 'Измерения, телепортация, коды коррекции ошибок.' }[k]}</p></a>`)}</div></section>
    <section class="col" style="gap:20px"><h2 class="t-h2">с чего начать</h2><p class="secondary">Один из возможных маршрутов по банку — от одного кубита до первых алгоритмов:</p>
      <ol class="path">${path.map((t, i) => html`<li><a href="#/tasks/${t.num}"><span class="mono muted">${i + 1}</span><span class="grow">${t.title}</span><span class="muted t-mono-s">№ ${t.num}</span></a></li>`)}</ol></section>
    <section class="card col" style="gap:10px"><h2 class="t-h3">как проверяются решения</h2><p class="secondary t-small" style="max-width:760px">Схема запускается на симуляторе прямо в браузере. Проверка идёт каскадом: лимиты (гейты, глубина, базис, связность), затем набор входов — состояние сравнивается с ожидаемым с точностью до глобальной фазы, вспомогательные кубиты обязаны вернуться в |0⟩, — и в раундах ещё шум. Подробности — в документации репозитория.</p><a class="btn btn-outline sm" href="https://github.com/alpha7en/QuantumArena_prototype/blob/main/docs/JUDGE.md" target="_blank" rel="noopener" style="align-self:flex-start">описание тестирующей системы${raw(icon('ext', 'sm'))}</a></section>
  </div>`;
  return {
    title: 'Обучение', nav: 'learn', html: view,
    mount(root) { const st = runOps(bell.ops, 2); new Board(root.querySelector('#lb-demo'), { density: 'mini', circuit: bell, cols: 2, fixedCols: true, readOnly: true, state: st, wireInit: ['0', '0'] }); },
  };
}
