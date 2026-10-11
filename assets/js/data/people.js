// Демо-участники: ВСЕ имена, рейтинги и результаты на сайте смоделированы генератором со стабильным seed.
// Реальных пользователей у демо нет, совпадения с реальными людьми случайны.
import { rng } from '../quantum/sim.js';

export const UNIVERSITIES = [
  { id: 'mfti', name: 'МФТИ', city: 'Долгопрудный', w: 9 },
  { id: 'msu', name: 'МГУ им. Ломоносова', city: 'Москва', w: 9 },
  { id: 'hse', name: 'НИУ ВШЭ', city: 'Москва', w: 8 },
  { id: 'spbu', name: 'СПбГУ', city: 'Санкт-Петербург', w: 6 },
  { id: 'bauman', name: 'МГТУ им. Баумана', city: 'Москва', w: 6 },
  { id: 'itmo', name: 'Университет ИТМО', city: 'Санкт-Петербург', w: 5 },
  { id: 'mephi', name: 'НИЯУ МИФИ', city: 'Москва', w: 5 },
  { id: 'nsu', name: 'НГУ', city: 'Новосибирск', w: 4 },
  { id: 'innopolis', name: 'Университет Иннополис', city: 'Иннополис', w: 3 },
  { id: 'tpu', name: 'Томский политехнический университет', city: 'Томск', w: 2 },
  { id: 'urfu', name: 'УрФУ', city: 'Екатеринбург', w: 3 },
  { id: 'kfu', name: 'Казанский федеральный университет', city: 'Казань', w: 3 },
  { id: 'spbpu', name: 'СПбПУ Петра Великого', city: 'Санкт-Петербург', w: 3 },
  { id: 'sfedu', name: 'ЮФУ', city: 'Ростов-на-Дону', w: 2 },
  { id: 'unn', name: 'ННГУ им. Лобачевского', city: 'Нижний Новгород', w: 3 },
  { id: 'misis', name: 'НИТУ МИСИС', city: 'Москва', w: 3 },
  { id: 'rudn', name: 'РУДН', city: 'Москва', w: 2 },
  { id: 'ranepa', name: 'РАНХиГС', city: 'Москва', w: 2 },
  { id: 'sfu', name: 'Сибирский федеральный университет', city: 'Красноярск', w: 2 },
  { id: 'dvfu', name: 'ДВФУ', city: 'Владивосток', w: 1 },
  { id: 'etu', name: 'СПбГЭТУ «ЛЭТИ»', city: 'Санкт-Петербург', w: 2 },
  { id: 'kai', name: 'КНИТУ-КАИ', city: 'Казань', w: 1 },
  { id: 'samu', name: 'Самарский университет', city: 'Самара', w: 1 },
  { id: 'other', name: 'Другой вуз', city: '', w: 1 },
];
export const uniById = (id) => UNIVERSITIES.find((u) => u.id === id) || null;

const FIRST_M = ['Алексей', 'Андрей', 'Артём', 'Борис', 'Вадим', 'Виктор', 'Глеб', 'Даниил', 'Денис', 'Егор', 'Илья', 'Кирилл', 'Лев', 'Максим', 'Матвей', 'Михаил', 'Никита', 'Олег', 'Роман', 'Тимофей', 'Фёдор', 'Ярослав', 'Станислав', 'Георгий', 'Руслан', 'Тимур'];
const FIRST_F = ['Алёна', 'Алиса', 'Анастасия', 'Анна', 'Варвара', 'Вера', 'Виктория', 'Дарья', 'Евгения', 'Елена', 'Ирина', 'Ксения', 'Лилия', 'Мария', 'Милана', 'Наталья', 'Олеся', 'Полина', 'Руслана', 'Софья', 'Татьяна', 'Ульяна', 'Юлия', 'Яна', 'Диана', 'Кира'];
const LAST = ['Андреев', 'Борисов', 'Васильев', 'Волков', 'Гаврилов', 'Герасимов', 'Дмитриев', 'Ершов', 'Жуков', 'Зайцев', 'Исаев', 'Карпов', 'Кузнецов', 'Лебедев', 'Мартынов', 'Назаров', 'Орлов', 'Платонов', 'Рябов', 'Савин', 'Тарасов', 'Ушаков', 'Фролов', 'Харитонов', 'Чернов', 'Шестаков', 'Щербаков', 'Яковлев', 'Белов', 'Громов', 'Денисов', 'Ильин', 'Киселёв', 'Логинов', 'Макаров', 'Носков', 'Осипов', 'Панин', 'Романов', 'Соболев', 'Титов', 'Чижов', 'Широков', 'Беляков', 'Воробьёв', 'Голубев', 'Давыдов', 'Евдокимов'];
const TRANSLIT = { а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'e', ж: 'zh', з: 'z', и: 'i', й: 'y', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r', с: 's', т: 't', у: 'u', ф: 'f', х: 'h', ц: 'ts', ч: 'ch', ш: 'sh', щ: 'sch', ы: 'y', э: 'e', ю: 'yu', я: 'ya', ь: '', ъ: '' };
export const translit = (s) => s.toLowerCase().split('').map((c) => TRANSLIT[c] ?? c).join('');
const fem = (last) => (last.endsWith('ев') || last.endsWith('ов') || last.endsWith('ин')) ? last + 'а' : last;

// Обратная функция нормального распределения (Acklam, достаточно для демо).
export function invNorm(p) {
  const a = [-39.69683028665376, 220.9460984245205, -275.9285104469687, 138.357751867269, -30.66479806614716, 2.506628277459239];
  const b = [-54.47609879822406, 161.5858368580409, -155.6989798598866, 66.80131188771972, -13.28068155288572];
  const c = [-0.007784894002430293, -0.3223964580411365, -2.400758277161838, -2.549732539343734, 4.374664141464968, 2.938163982698783];
  const d = [0.007784695709041462, 0.3224671290700398, 2.445134137142996, 3.754408661907416];
  const lo = 0.02425, hi = 1 - lo;
  if (p < lo) { const q = Math.sqrt(-2 * Math.log(p)); return (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1); }
  if (p > hi) { const q = Math.sqrt(-2 * Math.log(1 - p)); return -(((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1); }
  const q = p - 0.5, r = q * q;
  return (((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q / (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1);
}

export const TITLES = [
  { min: 2400, name: 'гроссмейстер' }, { min: 2000, name: 'мастер' }, { min: 1700, name: 'эксперт' },
  { min: 1400, name: 'специалист' }, { min: 1200, name: 'ученик' }, { min: -Infinity, name: 'новичок' },
];
export const ratingTitle = (r) => (r == null ? 'новичок' : TITLES.find((t) => r >= t.min).name);
export const TITLE_STEPS = [{ name: 'новичок', min: 0, label: '<1200' }, { name: 'ученик', min: 1200, label: '1200' }, { name: 'специалист', min: 1400, label: '1400' },
  { name: 'эксперт', min: 1700, label: '1700' }, { name: 'мастер', min: 2000, label: '2000' }, { name: 'гроссмейстер', min: 2400, label: '2400+' }];
export const nextTitle = (r) => TITLE_STEPS.find((t) => t.min > (r ?? 0)) || null;

export const POOL_SIZE = 1800;
let _pool = null;

// Общий пул демо-участников, отсортирован по рейтингу (индекс 0 — лучший).
export function pool() {
  if (_pool) return _pool;
  const rand = rng(20261011);
  const uniWeights = UNIVERSITIES.filter((u) => u.id !== 'other').flatMap((u) => Array(u.w).fill(u.id));
  const used = new Set(), list = [];
  for (let i = 0; i < POOL_SIZE; i++) {
    const female = rand() < 0.38;
    const first = (female ? FIRST_F : FIRST_M)[Math.floor(rand() * 26)];
    const lastM = LAST[Math.floor(rand() * LAST.length)];
    const last = female ? fem(lastM) : lastM;
    const uni = uniWeights[Math.floor(rand() * uniWeights.length)];
    const z = invNorm(1 - (i + 0.5) / POOL_SIZE);
    const rating = Math.max(700, Math.round(1330 + 335 * z + (rand() - 0.5) * 14));
    let login = translit(first[0]) + '.' + translit(lastM);
    let k = 1; while (used.has(login)) login = translit(first[0]) + '.' + translit(lastM) + k++;
    used.add(login);
    list.push({ id: 'd' + i, name: `${first} ${last}`, login, uni, rating, female, rounds: 3 + Math.floor(rand() * 40), month: Math.round((rand() - 0.42) * 70) });
  }
  list.sort((a, b) => b.rating - a.rating);
  list.forEach((p, i) => { p.rank = i + 1; });
  _pool = list;
  return list;
}

export const initials = (name) => name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase();

// Место рейтинга для произвольного значения среди демо-участников.
export function placeFor(rating) {
  const p = pool();
  let better = 0;
  for (const x of p) if (x.rating > rating) better++; else break;
  return better + 1;
}

export function uniStats() {
  const p = pool(), by = {};
  for (const x of p) { (by[x.uni] ||= []).push(x); }
  const rows = Object.entries(by).map(([id, arr]) => {
    arr.sort((a, b) => b.rating - a.rating);
    const top = arr.slice(0, 10);
    return { id, count: arr.length, sum: top.reduce((s, x) => s + x.rating, 0), best: arr[0], students: arr, delta: arr.slice(0, 10).reduce((s, x) => s + Math.max(0, x.month), 0) };
  });
  rows.sort((a, b) => b.sum - a.sum);
  rows.forEach((r, i) => { r.rank = i + 1; });
  return rows;
}
