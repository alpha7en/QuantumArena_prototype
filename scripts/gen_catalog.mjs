// Генерирует docs/TASK_CATALOG.md из банка задач (assets/js/data/tasks.js). Запуск: node scripts/gen_catalog.mjs
import { writeFileSync } from 'node:fs';
import { TASKS, LEVELS, ARCHETYPES, limitsFor } from '../assets/js/data/tasks.js';
import { suiteOf } from '../assets/js/judge/judge.js';
import { couplingLabel } from '../assets/js/quantum/circuit.js';

const row = (t) => {
  const p = t.params ? t.params.default : undefined;
  const L = limitsFor(t, p), s = suiteOf(t, p);
  const lim = [L.gates != null && `гейтов ≤ ${L.gates}`, L.depth != null && `глубина ≤ ${L.depth}`, L.twoQubit != null && `2q ≤ ${L.twoQubit}`, L.oracleCalls != null && `оракул ≤ ${L.oracleCalls}`].filter(Boolean).join(', ') || '—';
  const basis = L.basis ? L.basis.join(', ') : 'свободный';
  const cpl = L.coupling && L.coupling.kind !== 'all' ? couplingLabel(L.coupling, s.n) : 'все со всеми';
  const qs = t.params ? `n + …` : String(t.qubits);
  const esc = (x) => String(x).replace(/\|/g, '\\|');
  return `| ${t.num} | \`${t.id}\` | ${esc(t.title)} | ${t.topic} | ${LEVELS[t.level]} | ${t.archetype} | ${qs} | ${lim} | ${basis} | ${cpl} | ${s.cases.length}${t.params ? ` × ${t.params.values.length}` : ''} |`;
};

const out = [
  '# Каталог задач',
  '',
  '> Файл сгенерирован командой `node scripts/gen_catalog.mjs` из `assets/js/data/tasks/*.js`. Правьте задачи там, а не здесь.',
  '',
  `Всего задач: **${TASKS.length}**. Условия составлены при разработке прототипа по методике из [TASKS.md](TASKS.md); второй эксперт их ещё не решал вслепую (см. [ROADMAP.md](ROADMAP.md)).`,
  '',
  '| № | id | Название | Тема | Сложность | Архетип | Кубиты | Лимиты | Базис | Связность | Входов в тесте |',
  '|--:|----|----------|------|-----------|:------:|:------:|--------|-------|-----------|:-------------:|',
  ...TASKS.map(row),
  '',
  '## Архетипы',
  '',
  ...Object.entries(ARCHETYPES).map(([k, v]) => `- **${k}** — ${v}: ${TASKS.filter((t) => t.archetype === k).length} задач`),
  '',
  '## По сложности',
  '',
  ...[1, 2, 3].map((l) => `- ${LEVELS[l]}: ${TASKS.filter((t) => t.level === l).length}`),
  '',
];
writeFileSync(new URL('../docs/TASK_CATALOG.md', import.meta.url), out.join('\n'));
console.log('docs/TASK_CATALOG.md обновлён,', TASKS.length, 'задач');
