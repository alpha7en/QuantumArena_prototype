# Старые задачи в новой классификации

Две прежние коллекции разложены по дереву и фасетам из [`CLASSIFICATION.md`](CLASSIFICATION.md):

1. 43 задачи демо v2 — [`assets/js/data/tasks/`](../assets/js/data/tasks), каталог [`docs/TASK_CATALOG.md`](../docs/TASK_CATALOG.md);
2. 56 разобранных задач чужих соревнований — [`archive/reference_tasks_v1/parsed/`](../archive/reference_tasks_v1/parsed).

Столбцы: ветвь дерева; фасеты «вход · ответ · проверка»; способ составления; уровень по трёхуровневой шкале;
преемник в новом банке. «SA» — задача ядра, «SR» — идея резерва. Пометка «вариант» значит, что преемник решает
ту же механику в другой постановке (другой размер, параметр или ограничение).

## 1. Задачи демо v2

Уровни демо («лёгкая», «средняя», «сложная») пересмотрены по матрице уровней: учитывается число элементов, а
не размер схемы. Задачи демо остаются в коде сайта; при переносе на сервер их пакеты нужно оформить заново —
эталоны демо написаны на Qiskit-lite и проверяются браузерным судьёй.

| № | id демо | Задача | Ветвь | Вход · ответ · проверка | Способ | Ур. | Преемник |
|--:|---|---|---|---|---|:-:|---|
| 1 | `bell` | Состояние Белла со знаком плюс | T1.2 | `zero` · `fixed` · `eq0_phase` | `fact` | 1 | SA-001 (вариант) |
| 2 | `half-adder` | Полусумматор | T3.4 | `reg_anc` · `fixed` · `eq_anc_phase` | `fact` | 1 | SA-019 |
| 3 | `measure-x` | Измерение в базисе X | T6.1 | `promise` · `fixed` · `dist` | `fact` | 1 | SA-046 |
| 4 | `grover-3` | Гровер, 3 кубита | T4.2 | `oracle` · `fixed` · `prob` | `combo` | 2 | SR-085; SA-036 |
| 5 | `cz-kick` | CZ из CX | T2.1 | `any` · `fixed` · `eq_phase` | `fact` | 1 | SA-011 |
| 6 | `qft-4` | QFT, 4 кубита | T2.5 | `any` · `fixed` · `eq_phase` | `generalize` | 2 | SA-016 |
| 7 | `teleport` | Телепортация (отложенное измерение) | T6.2 | `any` · `fixed` · `channel` | `combo` | 2 | SR-127; SA-049 |
| 8 | `noisy-bell` | Белл в шумном канале | T5.5 | `zero` · `fixed` · `fidelity` | `constraint` | 2 | SR-120 |
| 9 | `parity` | Проверка чётности | T3.1 | `reg_anc` · `fixed` · `eq_anc_phase` | `fact` | 1 | SA-020 (вариант) |
| 10 | `syndrome` | Синдром кода повторения | T6.3 | `reg_anc` · `fixed` · `eq_anc_phase` | `fact` | 2 | SR-132; SA-052 |
| 11 | `swap-cx` | SWAP из трёх CX | T2.3 | `any` · `fixed` · `eq_phase` | `fact` | 1 | SA-065 |
| 12 | `toffoli-ct` | Тоффоли из CX и T | T2.2 | `any` · `fixed` · `eq_phase` | `combo` | 3 | SA-014 |
| 13 | `w3` | W на трёх кубитах | T1.3 | `zero` · `fixed` · `eq0_phase` | `combo` | 2 | SR-012; SA-006 |
| 14 | `ghz3-line` | GHZ на цепочке, 3 кубита | T1.6 | `zero` · `fixed` · `eq0_phase` | `constraint` | 1 | SA-005 (вариант) |
| 15 | `plus-i` | Состояние с мнимой фазой | T1.1 | `zero` · `fixed` · `eq0_phase` | `fact` | 1 | SA-002 (вариант); SR-007 |
| 16 | `minus` | Состояние минус | T1.1 | `zero` · `fixed` · `eq0_phase` | `fact` | 1 | SR-007 |
| 17 | `uniform-3` | Равная суперпозиция, 3 кубита | T1.1 | `zero` · `fixed` · `eq0_phase` | `fact` | 1 | SR-006 |
| 18 | `copy-bit` | Копирование бита | T3.1 | `reg_anc` · `fixed` · `eq_anc_phase` | `fact` | 1 | SR-053 |
| 19 | `and-oracle` | Оракул И | T3.1 | `reg_anc` · `fixed` · `eq_anc_phase` | `fact` | 1 | SA-069 (вариант: ИЛИ) |
| 20 | `singlet` | Синглет | T1.2 | `zero` · `fixed` · `eq0_phase` | `fact` | 1 | SA-063 |
| 21 | `rot-prep` | Поворот на заданный угол | T1.1 | `zero` · `fixed` · `eq0_phase` | `fact` | 1 | SR-003 |
| 22 | `compare-bits` | Сравнение двух кубитов | T3.3 | `reg_anc` · `fixed` · `eq_anc_phase` | `fact` | 1 | SA-070 |
| 23 | `maj-oracle` | Мажоритарный оракул | T3.1 | `reg_anc` · `fixed` · `eq_anc_phase` | `combo` | 2 | SA-083 |
| 24 | `full-adder` | Полный сумматор | T3.4 | `reg_anc` · `fixed` · `eq_anc_phase` | `combo` | 2 | SR-073; SA-028 |
| 25 | `add-mod4` | Сумматор по модулю 4 | T3.4 | `reg_anc` · `fixed` · `eq_anc_phase` | `combo` | 2 | SR-073; SA-028 |
| 26 | `measure-y` | Измерение в базисе Y | T6.1 | `promise` · `fixed` · `dist` | `fact` | 1 | SA-074 |
| 27 | `rep-encode` | Кодер кода повторения | T6.3 | `reg_anc` · `fixed` · `eq_anc_phase` | `fact` | 1 | SA-075; SA-050 |
| 28 | `qft-3` | QFT, 3 кубита | T2.5 | `any` · `fixed` · `eq_phase` | `generalize` | 2 | SA-016 (вариант) |
| 29 | `grover-2` | Гровер, 2 кубита | T4.2 | `oracle` · `fixed` · `prob` | `combo` | 2 | SA-031 |
| 30 | `dj-4` | Дойч — Йожа, 4 кубита | T4.1 | `oracle` · `fixed` · `prob` | `fact` | 1 | SA-030 |
| 31 | `bv-4` | Бернштейн — Вазирани, 4 кубита | T4.1 | `oracle` · `fixed` · `prob` | `combo` | 2 | SA-032 |
| 32 | `swap-test` | Swap-тест | T4.5 | `any` · `fixed` · `dist` | `fact` | 2 | SA-034 |
| 33 | `equal-regs` | Равны ли регистры | T3.3 | `reg_anc` · `fixed` · `eq_anc_phase` | `combo` | 2 | SR-064 |
| 34 | `qpe-t` | Оценка фазы гейта T | T4.3 | `zero` · `fixed` · `prob` | `combo` | 2 | SR-094; SA-037 |
| 35 | `shor-encode` | Код Шора | T6.3 | `reg_anc` · `fixed` · `eq_anc_phase` | `combo` | 3 | SR-133 |
| 36 | `ghz-chain-n` | GHZ на цепочке из $n$ | T1.6 | `zero` · `generator` · `eq0_phase` | `constraint` | 2 | SA-005 |
| 37 | `even-nonzero` | Чётный, но не ноль | T3.5 | `reg_anc` · `generator` · `eq_anc_phase` | `combo` | 3 | SA-027 |
| 38 | `parity-phase` | Фаза чётности | T3.2 | `reg_anc` · `fixed` · `eq_anc_phase` | `fact` | 1 | SR-060 |
| 39 | `increment` | Инкремент на двух кубитах | T3.4 | `reg_anc` · `fixed` · `eq_anc_phase` | `fact` | 1 | SR-068; SA-025 |
| 40 | `flip-cx` | Разверни CNOT | T2.1 | `any` · `fixed` · `eq_phase` | `fact` | 1 | SA-072 |
| 41 | `cry-from-cx` | Управляемый поворот из CX | T2.2 | `any` · `fixed` · `eq_phase` | `fact` | 2 | SR-033; SA-013 |
| 42 | `chsh` | Игра CHSH | T7.2 | `resource` · `fixed` · `prob` | `transfer` | 2 | SA-054 |
| 43 | `bitflip-fix` | Исправление бит-флипа | T6.4 | `promise` · `fixed` · `eq_anc_phase` | `combo` | 3 | SR-136; SA-051 |

Итог по демо: T1 — 9, T2 — 7, T3 — 12, T4 — 6, T5 — 1, T6 — 7, T7 — 1, T8 — 0. Пятнадцать ветвей из 38 в демо
пусты, в том числе вся T8 и почти вся T5. В демо не было задач с генератором по данным, с программой-ответом,
с настоящей обратной связью по измерению и с оценкой по стоимости — эти типы закрыты ядром нового банка.

## 2. Разобранные задачи соревнований

Номер — префикс файла в `archive/reference_tasks_v1/parsed/`. Условия этих задач на платформу не переносятся;
преемник — собственная задача банка на ту же механику.

| № | Источник | Задача | Ветвь | Вход · ответ · проверка | Способ | Ур. | Преемник |
|--:|---|---|---|---|---|:-:|---|
| 001 | QCoder QPC001 B1 | Оракул копирования бита | T3.1 | `reg_anc` · `fixed` · `eq_anc_phase` | `fact` | 1 | SR-053 |
| 002 | QCoder QPC001 B2 | Оракул чётности | T3.1 | `reg_anc` · `generator` · `eq_anc_phase` | `fact` | 1 | SA-020 |
| 003 | QCoder QPC001 B3 | Фазовый оракул «меньше L» | T3.3 | `reg_anc` · `generator` · `eq_anc_phase` | `combo` | 3 | SA-026 |
| 004 | QCoder QPC001 B4 | То же с лимитом глубины | T3.3 | `reg_anc` · `generator` · `eq_anc_phase` | `constraint` | 3 | SA-026 (вариант) |
| 005 | QCoder QPC001 C1 | Равная суперпозиция первых L состояний | T1.5 | `zero` · `generator` · `eq0_phase` | `combo` | 3 | SA-010 |
| 006 | QCoder QPC001 C2 | То же, усиленные ограничения | T1.5 | `zero` · `generator` · `eq0_phase` | `constraint` | 3 | SA-010 (вариант) |
| 007 | QCoder QPC002 A1 | Состояние с глобальным знаком минус | T1.1 | `zero` · `fixed` · `eq0` | `fact` | 1 | SR-001 |
| 008 | QCoder QPC002 A2 | Состояние Белла со знаком минус | T1.2 | `zero` · `fixed` · `eq0_phase` | `fact` | 1 | SA-001 |
| 009 | QCoder QPC002 A3 | GHZ со знаком минус | T1.2 | `zero` · `generator` · `eq0_phase` | `generalize` | 1 | SR-011 |
| 010 | QCoder QPC002 A4 | GHZ за логарифмическую глубину | T1.6 | `zero` · `generator` · `eq0_phase` | `constraint` | 2 | SA-004 |
| 011 | QCoder QPC002 A5 | GHZ за глубину 6 | T1.6 | `zero` · `generator` · `eq0_phase` | `constraint` | 2 | SA-004 |
| 012 | QCoder QPC002 B1 | Кубит с заданной фазой | T1.1 | `zero` · `generator` · `eq0_phase` | `fact` | 1 | SR-004 |
| 013 | QCoder QPC002 B2 | Оракул фазового сдвига | T2.4 | `any` · `generator` · `eq_phase` | `fact` | 2 | SR-045 |
| 014 | QCoder QPC002 B3 | Разворот порядка кубитов | T2.3 | `any` · `generator` · `eq_phase` | `generalize` | 1 | SR-040 |
| 015 | QCoder QPC002 B4 | Квантовое преобразование Фурье | T2.5 | `any` · `generator` · `eq_phase` | `generalize` | 2 | SA-016 |
| 016 | QCoder QPC002 B5 | Управляемое модульное сложение | T3.4 | `reg_anc` · `generator` · `eq_anc_phase` | `combo` | 3 | SR-069 |
| 017 | QCoder QPC002 B6 | Фазовый оракул линейной комбинации | T2.4 | `any` · `generator` · `eq_phase` | `combo` | 2 | SR-045 (вариант) |
| 018 | QCoder QPC002 B7 | Булев оракул с лимитом глубины | T3.3 | `reg_anc` · `generator` · `eq_anc_phase` | `constraint` | 3 | SR-067 (вариант) |
| 019 | QCoder QPC002 B8 | Булев оракул с лимитом глубины, усиленный | T3.3 | `reg_anc` · `generator` · `eq_anc_phase` | `constraint` | 3 | SR-067 (вариант) |
| 020 | QCoder QPC002 Ex | Усиление амплитуды для неизвестной подготовки | T4.2 | `oracle` · `generator` · `prob` | `generalize` | 3 | SR-087 |
| 021 | QCoder QPC003 A1 | Состояние с мнимой единицей при единице | T1.1 | `zero` · `fixed` · `eq0` | `fact` | 1 | SA-062 |
| 022 | QCoder QPC003 A2 | Состояние Белла с противоположными битами | T1.2 | `zero` · `fixed` · `eq0_phase` | `fact` | 1 | SR-009 |
| 023 | QCoder QPC003 A3 | W на трёх кубитах | T1.3 | `zero` · `fixed` · `eq0_phase` | `combo` | 2 | SR-012 |
| 024 | QCoder QPC003 A4 | W на $n$ кубитах | T1.3 | `zero` · `generator` · `eq0_phase` | `combo` | 2 | SA-006 |
| 025 | QCoder QPC003 A5 | W за глубину не больше 20 | T1.3 | `zero` · `generator` · `eq0_phase` | `constraint` | 3 | SR-013 |
| 026 | QCoder QPC003 A6 | W за глубину не больше 10 | T1.3 | `zero` · `generator` · `eq0_phase` | `constraint` | 3 | SR-013 |
| 027 | QCoder QPC003 B1 | Гейт по записи Дирака | T2.1 | `any` · `fixed` · `eq_phase` | `fact` | 1 | SR-030 |
| 028 | QCoder QPC003 B2 | Из битового оракула — фазовый | T3.2 | `oracle` · `generator` · `eq_anc_phase` | `fact` | 2 | SR-061 |
| 029 | QCoder QPC003 B3 | Состояние-произведение по углам | T1.1 | `zero` · `generator` · `eq0_phase` | `generalize` | 2 | SR-005 |
| 030 | QCoder QPC003 B4 | Отражение относительно нуля | T2.6 | `any` · `generator` · `eq_phase` | `combo` | 2 | SA-017 |
| 031 | QCoder QPC003 B5 | Отражение относительно равной суперпозиции | T4.2 | `any` · `generator` · `eq_phase` | `combo` | 2 | SA-033 |
| 032 | QCoder QPC003 B6 | Алгоритм Гровера | T4.2 | `oracle` · `generator` · `prob` | `combo` | 3 | SA-036 |
| 033 | QCoder QPC003 B7 | Отражение относительно произвольного состояния | T2.6 | `any` · `generator` · `eq_phase` | `combo` | 3 | SR-050 |
| 034 | QCoder QPC003 B8 | Гровер с булевым оракулом | T4.2 | `oracle` · `generator` · `prob` | `combo` | 3 | SR-086 |
| 035 | QCoder QPC003 Ex1 | Из битового оракула — фазовый, усиленный | T3.2 | `oracle` · `generator` · `eq_anc_phase` | `constraint` | 3 | SR-061 (вариант) |
| 036 | QCoder QPC003 Ex2 | Поиск скрытого числа в подпространстве | T4.2 | `oracle` · `generator` · `prob` | `combo` | 3 | SR-091 |
| 037 | IBM Challenge 2021, Ex. 1 | Разложение Тоффоли | T2.2 | `any` · `fixed` · `eq_phase` | `combo` | 3 | SA-014; SA-044 |
| 038 | IBM Challenge 2021, Ex. 2 | Модульное возведение в степень для Шора | T3.4 | `reg_anc` · `fixed` · `score` | `open` | 3 | SR-074 |
| 039 | IBM Challenge 2021, Ex. 3 | Код коррекции на графе процессора | T5.2 | `promise` · `fixed` · `score` | `open` | 3 | SR-112 |
| 040 | IBM Challenge 2020, финал | Сжатие четырёхкубитного оператора | T5.3 | `any` · `fixed` · `score` | `open` | 3 | SR-114 |
| 041 | IBM Spring 2023, Lab 1 | Динамические схемы: сброс, повтор до успеха | T6.2 | `any` · `dynamic` · `channel` | `transfer` | 1–3 | SA-047; SR-126 |
| 042 | IBM Spring 2023, Lab 2 | Телепортация | T6.2 | `any` · `dynamic` · `channel` | `combo` | 2 | SA-049 |
| 043 | IBM Spring 2023, Lab 3 | Итеративная оценка фазы | T4.3 | `oracle` · `dynamic` · `prob` | `constraint` | 3 | SR-095; SA-037 |
| 044 | Xanadu QHack 2023 | Троттеризация спиновой системы | T8.2 | `zero` · `generator` · `fidelity` | `transfer` | 2 | SR-148; SA-059 |
| 045 | Xanadu QHack 2023 | Градиент по правилу сдвига параметра | T8.4 | `zero` · `hybrid` · `classical` | `transfer` | 2–3 | SA-061; SR-159 |
| 046 | Xanadu QHack 2023 | Квантовый фотокопир | T7.1 | `any` · `fixed` · `fidelity` | `transfer` | 3 | SR-140 |
| 047 | Xanadu QHack 2023 | Энергия молекулы водорода | T8.3 | `zero` · `hybrid` · `classical` | `transfer` | 3 | SR-153 |
| 048 | Microsoft Quantum Katas | Суперпозиция с амплитудами-дробями | T1.3 | `zero` · `generator` · `eq0_phase` | `generalize` | 3 | SR-015 |
| 049 | Microsoft Quantum Katas | Различение унитарных операторов | T4.5 | `oracle` · `generator` · `prob` | `reverse` | 1–2 | SA-035; SR-101 |
| 050 | Microsoft Quantum Katas | Игра CHSH | T7.2 | `resource` · `generator` · `prob` | `transfer` | 2 | SA-054 |
| 051 | Microsoft Quantum Katas | Сумматор с последовательным переносом | T3.4 | `reg_anc` · `generator` · `eq_anc_phase` | `combo` | 3 | SA-028 |
| 052 | Classiq Coding Competition | Разложение многоконтрольного X | T3.5 | `reg_anc` · `generator` · `score` | `open` | 3 | SR-077; SA-024 |
| 053 | Classiq Coding Competition | Какуро через поиск Гровера | T4.2 | `zero` · `generator` · `prob` | `transfer` | 3 | SR-089 |
| 054 | Classiq Coding Competition | Логнормальное распределение | T1.5 | `zero` · `generator` · `fidelity` | `open` | 3 | SR-023 |
| 055 | НТО «Квантовый инжиниринг» | Протокол BB84 | T7.3 | `zero` · `hybrid` · `classical` | `transfer` | 2–3 | SA-056; SR-145 |
| 056 | НТО «Квантовый инжиниринг» | Синдромы кода Стина | T6.3 | `promise` · `fixed` · `eq_anc_phase` | `transfer` | 3 | SA-052; SR-135 |

Итог по 56 задачам: T1 — 17, T2 — 8, T3 — 12, T4 — 8, T5 — 2, T6 — 3, T7 — 3, T8 — 3. В архиве не представлены
ветви T1.4, T4.1, T4.4, T5.1, T5.4, T5.5, T6.1, T6.4 и T8.1 — они заполнены задачами из `ladder_ec`,
QuantumKatas, QOSF Monthly Challenges и собственными.

## 3. Источники задач нового банка

Таблица собрана по полям `source.ref` карточек и `src` резерва; задача с двумя источниками входит в обе строки.

| Источник | В ядре | В резерве |
|---|---|---|
| [`ladder_ec` v1.0.0](https://github.com/alpha7en/ladder_ec/tree/v1.0.0): `data/own_generators`, классы B10–B17 | 14: SA-003, 004, 017, 018, 024, 025, 026, 028, 030, 032, 033, 036, 037, 059 | 10: SR-006, 045, 046, 047, 068, 069, 070, 076, 082, 083 |
| [QOSF Monthly Challenges](https://github.com/qosf/monthly-challenges) | 11: SA-003, 006, 009, 015, 022, 023, 034, 045, 050, 051, 060 | 31: SR-017, 022, 024, 036, 037, 043, 044, 057, 065, 066, 072, 075, 080, 090, 092, 093, 103, 104, 106, 117, 121, 122, 138, 141, 151, 152, 154, 155, 156, 157, 160 |
| QuantumKatas (набор из `ladder_ec/third_party`) | 18: SA-016, 028, 030, 031, 035, 037, 038, 046, 048, 053, 054, 055, 068, 069, 074, 075, 076, 077 | 13: SR-010, 015, 016, 038, 047, 056, 084, 098, 101, 102, 105, 124, 139 |
| QCoder (номера задач по архиву и по `ladder_ec`) | 16: SA-001, 004, 006, 010, 016, 017, 018, 020, 025, 026, 033, 036, 062, 068, 071, 080 | 21: SR-001, 004, 005, 006, 009, 011, 012, 013, 030, 040, 045, 050, 053, 061, 067, 069, 070, 076, 086, 087, 091 |
| IBM Quantum Challenge | 12: SA-014, 037, 044, 047, 049, 051, 075, 076, 081, 082, 085, 087 | 6: SR-074, 095, 099, 112, 114, 126 |
| Xanadu QHack | 5: SA-058, 059, 061, 078, 079 | 4: SR-140, 148, 153, 159 |
| НТО «Квантовый инжиниринг» | 2: SA-052, 056 | 3: SR-135, 137, 145 |

Набор `ladder_ec` полезен банку ещё одним свойством: у каждой задачи там несколько стилей решения (цепочка,
звезда, дерево, библиотечный гейт). Эти стили — готовый материал для поля `pitfalls` и для проверки того, что
тестирующая система принимает разные верные решения.
