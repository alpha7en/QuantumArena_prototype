// Генератор масок для фонов (assets/img/bg/*.svg). Запуск: node scripts/gen-bg.mjs
// Формы — из набора sparq/bg в Figma (SPARQ.2 framework, страница «arena · web-фоны»).
import { writeFileSync } from 'node:fs';
const out = (name, vb, body) => writeFileSync(new URL(`../assets/img/bg/${name}.svg`, import.meta.url), `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}" fill="none" stroke="#000" stroke-width="1.4">${body}</svg>\n`);
const f = (n) => +n.toFixed(1);

// rings: четыре концентрических кольца и перекрестие
out('rings', '0 0 1000 1000', [120, 240, 360, 480].map((r) => `<circle cx="500" cy="500" r="${r}"/>`).join('') + '<path d="M20 500H980M500 20V980" stroke-width="1.2"/>');

// orbits: сфера и три пересекающихся эллипса
out('orbits', '0 0 1000 1000', '<circle cx="500" cy="500" r="380" stroke-width="1.8"/>' + [0, 60, 120].map((d) => `<ellipse cx="500" cy="500" rx="380" ry="135" transform="rotate(${d} 500 500)"/>`).join(''));

// interference: 30 тонких колец
out('interference', '0 0 1000 1000', Array.from({ length: 30 }, (_, i) => `<circle cx="500" cy="500" r="${f(24 + i * 15.5)}" stroke-width="${i % 5 === 0 ? 1.6 : 1}"/>`).join(''));

// wires: плитка 240×56 — три линии и квадратный узел
out('wires', '0 0 240 56', '<path d="M0 10H240M0 26H240M0 42H240"/><rect x="113" y="3" width="14" height="14"/>');

// trace: дорожка платы с изломом и узлами
out('trace', '0 0 400 300', '<path d="M388 20V120L318 190H20" stroke-width="2"/><path d="M0 270H150" stroke-width="2"/><circle cx="388" cy="20" r="6" fill="#000" stroke="none"/><circle cx="20" cy="190" r="6" fill="#000" stroke="none"/>');
console.log('assets/img/bg/*.svg готовы');
