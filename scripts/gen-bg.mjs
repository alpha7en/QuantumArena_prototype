// Генератор масок для фонов (assets/img/bg/*.svg). Запуск: node scripts/gen-bg.mjs
// Формы — из набора sparq/bg в Figma (SPARQ.2 framework, страница «arena · web-фоны»).
import { writeFileSync } from 'node:fs';
const out = (name, vb, body) => writeFileSync(new URL(`../assets/img/bg/${name}.svg`, import.meta.url), `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}" fill="none" stroke="#000" stroke-width="1.4">${body}</svg>\n`);
const f = (n) => +n.toFixed(1);

// rings: четыре концентрических кольца и перекрестие
out('rings', '0 0 1000 1000', [120, 240, 360, 480].map((r) => `<circle cx="500" cy="500" r="${r}"/>`).join('') + '<path d="M20 500H980M500 20V980" stroke-width="1.2"/>');

// interference: 30 тонких колец
out('interference', '0 0 1000 1000', Array.from({ length: 30 }, (_, i) => `<circle cx="500" cy="500" r="${f(24 + i * 15.5)}" stroke-width="${i % 5 === 0 ? 1.6 : 1}"/>`).join(''));

console.log('assets/img/bg/*.svg готовы');
