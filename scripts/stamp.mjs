// Версионирует ресурсы сайта, чтобы браузер не держал старые модули (GitHub Pages кэширует на 10 минут).
// Запуск перед публикацией: node scripts/stamp.mjs
// Пишет в index.html import map («./assets/js/x.js» → «./assets/js/x.js?v=хэш») и ?v= для CSS и app.js.
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join, relative } from 'node:path';

const root = new URL('..', import.meta.url).pathname;
const walk = (d) => readdirSync(d).flatMap((f) => { const p = join(d, f); return statSync(p).isDirectory() ? walk(p) : [p]; });
const files = [...walk(join(root, 'assets/js')), ...walk(join(root, 'assets/css'))].filter((f) => /\.(js|css)$/.test(f)).sort();
const hash = createHash('sha1').update(files.map((f) => readFileSync(f)).join('\n')).digest('hex').slice(0, 8);

const mods = files.filter((f) => f.endsWith('.js')).map((f) => './' + relative(root, f));
const map = { imports: Object.fromEntries(mods.map((m) => [m, `${m}?v=${hash}`])) };

let html = readFileSync(join(root, 'index.html'), 'utf8');
html = html.replace(/<!--importmap:start-->[\s\S]*?<!--importmap:end-->/, `<!--importmap:start-->\n  <script type="importmap">${JSON.stringify(map)}</script>\n  <!--importmap:end-->`);
html = html.replace(/(assets\/css\/[\w.-]+\.css)(\?v=\w+)?"/g, `$1?v=${hash}"`);
html = html.replace(/(<script type="module" src="assets\/js\/app\.js)(\?v=\w+)?"/, `$1?v=${hash}"`);
writeFileSync(join(root, 'index.html'), html);
console.log(`версия ${hash}: ${mods.length} модулей`);
