# Разработка

Нужен Node.js 20+ (для тестов) и любой статический сервер (для просмотра). Зависимостей нет.

```bash
npm test                      # все тесты: симулятор, интерпретатор, судья, эталоны задач
python3 -m http.server 8080   # сайт на http://localhost:8080
node scripts/gen_catalog.mjs  # пересобрать docs/TASK_CATALOG.md
```

## Карта кода

| Нужно изменить | Где |
|----------------|-----|
| Токены, шрифты, темы | `assets/css/tokens.css`, `base.css` |
| Кнопки, поля, карточки, шапка | `assets/css/components.css`, `assets/js/ui/chrome.js` |
| Страницы | `assets/css/pages.css`, `assets/js/pages/*.js` |
| Доска схем, редактор, песочница | `assets/css/editor.css`, `assets/js/ui/board.js`, `ui/taskeditor.js`, `pages/sandbox.js` |
| Гейты и симулятор | `assets/js/quantum/` |
| Язык кода | `assets/js/lang/` |
| Проверка решений | `assets/js/judge/` |
| Задачи | `assets/js/data/tasks/*.js`, порядок — `data/tasks.js` |
| Правила раундов и рейтинга | `assets/js/data/rounds.js`, `roundstate.js` |

## Соглашения

- Без сборки и зависимостей: ES-модули, относительные импорты с расширением `.js`.
- Страница — модуль с `export default async function (ctx)`, возвращающий `{ title, nav, layout, html, mount, unmount }`.
- Строки в разметку подставляются через тег `html` (экранирует) или `esc()`; `raw()` — только для уже собранной разметки.
- Тексты интерфейса — по-русски, короткие, без канцелярита и без «сгенерированных» оборотов.
- Любая смоделированная величина помечается в интерфейсе или в [DEMO_DATA.md](DEMO_DATA.md).

## Добавить гейт

1. Описать в `quantum/gates.js` (матрица 2×2, подпись, русское описание).
2. Добавить метод в таблицу `pyAttr` (`lang/qiskitlite.js`) и ветку в `opToCode`.
3. Если гейт нужен в палитре — добавить имя в `GROUPS` (`pages/sandbox.js`) и в `parseTile` (`data/tasks.js`).
4. Тест в `tests/core.test.mjs`.

## Добавить задачу

См. [TASKS.md](TASKS.md#как-добавить-задачу).
