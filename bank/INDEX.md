# Ядро банка: эталонные задачи

> Файл собран командой `python3 bank/tools/build_docs.py` из карточек `bank/core/*/task.yaml`. Руками не править.

Задач: **87**. У каждой есть условие, эталонное решение и проверка; все проходят `bank/tools/verify.py`.

| Уровень | Задач |
|---|--:|
| 1 · вход | 32 |
| 2 · практика | 36 |
| 3 · контест | 19 |

## T1. Подготовка состояния — 13

| id | Задача | Ур. | Ветвь | Вход | Ответ | Проверка | Как составлена | Источник |
|---|---|:-:|---|---|---|---|---|---|
| [SA-001](core/SA-001-bell-minus/task.yaml) | Состояние Белла со знаком минус | 1 | T1.2 | $|0\dots0\rangle$ | схема | `eq0_phase` | один факт | QCoder QPC002 A2 |
| [SA-002](core/SA-002-phase-state/task.yaml) | Кубит с фазой три восьмых оборота | 1 | T1.1 | $|0\dots0\rangle$ | схема | `eq0_phase` | один факт | sparq arena |
| [SA-003](core/SA-003-ghz-n/task.yaml) | GHZ на n кубитах | 1 | T1.2 | $|0\dots0\rangle$ | генератор | `eq0_phase` | обобщение | учебная классика; QOSF Monthly Challenge 2021-08 (разминка); ladder_ec C01 |
| [SA-004](core/SA-004-ghz-log-depth/task.yaml) | GHZ со знаком минус за глубину 6 | 2 | T1.6 | $|0\dots0\rangle$ | генератор | `eq0_phase` | под ограничением | QCoder QPC002 A3–A5 |
| [SA-005](core/SA-005-ghz-line-depth/task.yaml) | GHZ на цепочке | 2 | T1.6 | $|0\dots0\rangle$ | генератор | `eq0_phase` | под ограничением | sparq arena, пример SA-101 из материалов к акселератору |
| [SA-006](core/SA-006-w-state-n/task.yaml) | W-состояние на n кубитах | 2 | T1.3 | $|0\dots0\rangle$ | генератор | `eq0_phase` | комбинация | QCoder QPC003 A3–A6; QOSF Monthly Challenge 2021-08 (W states) |
| [SA-007](core/SA-007-three-of-four/task.yaml) | Три строки из четырёх | 2 | T1.3 | $|0\dots0\rangle$ | схема | `eq0_phase` | комбинация | sparq arena |
| [SA-008](core/SA-008-cluster-ring/task.yaml) | Кластерное состояние на кольце | 2 | T1.4 | $|0\dots0\rangle$ | генератор | `eq0_phase` | под ограничением | презентация классификации, T1.4 (линейный кластер) |
| [SA-009](core/SA-009-two-strings/task.yaml) | Суперпозиция двух строк | 2 | T1.5 | $|0\dots0\rangle$ | генератор | `eq0_phase` | обобщение | QOSF Monthly Challenge 2024-09 (Classiq, Sparse State Preparation), первая целевая задача |
| [SA-010](core/SA-010-uniform-below-l/task.yaml) | Равная суперпозиция первых L чисел | 3 | T1.5 | $|0\dots0\rangle$ | генератор | `eq0_phase` | комбинация | QCoder QPC001 C1, C2 |
| [SA-062](core/SA-062-i-times-one/task.yaml) | Мнимая единица при единице | 1 | T1.1 | $|0\dots0\rangle$ | схема | `eq0` | один факт | QCoder QPC003 A1 (Generate State i|1>) |
| [SA-063](core/SA-063-singlet/task.yaml) | Синглет | 1 | T1.2 | $|0\dots0\rangle$ | схема | `eq0_phase` | один факт | sparq arena (демо v2, задача singlet) |
| [SA-064](core/SA-064-cluster-line-four/task.yaml) | Кластерное состояние на цепочке из четырёх | 1 | T1.4 | $|0\dots0\rangle$ | схема | `eq0_phase` | один факт | презентация классификации, T1.4 (линейный кластер); R. Raussendorf, H. Briegel, 2001 |

## T2. Синтез преобразования — 13

| id | Задача | Ур. | Ветвь | Вход | Ответ | Проверка | Как составлена | Источник |
|---|---|:-:|---|---|---|---|---|---|
| [SA-011](core/SA-011-cz-from-cx/task.yaml) | CZ из CX и двух H | 1 | T2.1 | любое | схема | `eq_phase` | один факт | sparq arena (демо v2, задача cz-kick) |
| [SA-012](core/SA-012-exact-phase/task.yaml) | Матрица без права на фазу | 1 | T2.6 | любое | схема | `eq` | один факт | sparq arena |
| [SA-013](core/SA-013-ch-from-cx/task.yaml) | Управляемый Адамар из одного CX | 2 | T2.1 | любое | схема | `eq_phase` | один факт | sparq arena |
| [SA-014](core/SA-014-toffoli-clifford-t/task.yaml) | Тоффоли из CX и T | 3 | T2.2 | любое | схема | `eq_phase` | комбинация | IBM Quantum Challenge 2021, Exercise 1 (Toffoli decomposition) |
| [SA-015](core/SA-015-diag-signs/task.yaml) | Диагональ из знаков | 2 | T2.4 | любое | генератор | `eq_phase` | перенос сюжета | QOSF Monthly Challenge 2020-11 (Diagonal Unitary Circuit Composer), уровень 1 |
| [SA-016](core/SA-016-qft-n/task.yaml) | Квантовое преобразование Фурье | 2 | T2.5 | любое | генератор | `eq_phase` | обобщение | QCoder QPC002 B4; QuantumKatas QFT |
| [SA-017](core/SA-017-reflect-zero/task.yaml) | Отражение относительно нуля | 2 | T2.6 | любое | генератор | `eq_phase` | комбинация | QCoder QPC003 B4 (Reflection Operator) |
| [SA-018](core/SA-018-cyclic-shift-depth6/task.yaml) | Циклический сдвиг кубитов за глубину 6 | 3 | T2.3 | любое | генератор | `eq_phase` | под ограничением | QCoder QPC004 A3 |
| [SA-065](core/SA-065-swap-three-cx/task.yaml) | SWAP из трёх CX | 1 | T2.3 | любое | схема | `eq_phase` | один факт | sparq arena (демо v2, задача swap-cx); учебная классика |
| [SA-066](core/SA-066-cy-from-cx/task.yaml) | CY из CX и фазовых гейтов | 1 | T2.1 | любое | схема | `eq_phase` | один факт | sparq arena |
| [SA-067](core/SA-067-controlled-half-turn/task.yaml) | Поворот на пол-оборота под управлением | 1 | T2.6 | любое | схема | `eq` | один факт | sparq arena |
| [SA-068](core/SA-068-undo-fourier/task.yaml) | Отмените схему | 1 | T2.5 | любое | схема | `eq_phase` | реверс | QCoder QPC002 B4 (Quantum Fourier Transform); QuantumKatas QFT (обратное преобразование) |
| [SA-087](core/SA-087-toffoli-from-csx/task.yaml) | Тоффоли из управляемого корня | 3 | T2.2 | любое | схема | `eq_phase` | комбинация | A. Barenco и др., 1995 (Elementary gates for quantum computation, конструкция из пяти двухкубитных гейтов); IBM Quantum Challenge 2021, Ex. 1 |

## T3. Оракулы и обратимая арифметика — 14

| id | Задача | Ур. | Ветвь | Вход | Ответ | Проверка | Как составлена | Источник |
|---|---|:-:|---|---|---|---|---|---|
| [SA-019](core/SA-019-half-adder/task.yaml) | Полусумматор | 1 | T3.4 | регистр + анциллы | схема | `eq_anc_phase` | один факт | презентация классификации, T2.1; демо v2 (half-adder) |
| [SA-020](core/SA-020-parity-oracle/task.yaml) | Оракул чётности | 1 | T3.1 | регистр + анциллы | генератор | `eq_phase` | один факт | QCoder QPC001 B2 (XOR Oracle) |
| [SA-021](core/SA-021-equals-const/task.yaml) | Оракул равенства константе | 1 | T3.3 | регистр + анциллы | генератор | `eq_phase` | один факт | презентация классификации, T3.2 |
| [SA-022](core/SA-022-alternating-bits/task.yaml) | Чередующиеся биты | 2 | T3.2 | регистр + анциллы | генератор | `eq_phase` | комбинация | QOSF Monthly Challenge 2021-09 (скрининг менторской программы), Task 1 |
| [SA-023](core/SA-023-palindrome-oracle/task.yaml) | Оракул палиндрома без анцилл | 2 | T3.5 | регистр + анциллы | схема | `eq_phase` | под ограничением | QOSF Monthly Challenge 2022-07 (Palindrome Integer); спецификация 04 проекта (оракул палиндрома) |
| [SA-024](core/SA-024-mcx-vchain/task.yaml) | Многоконтрольный X лестницей Тоффоли | 2 | T3.5 | регистр + анциллы | генератор | `eq_anc_phase` | комбинация | A. Barenco et al., 1995; ladder_ec, класс B12 и Q06 (refl_vchain) |
| [SA-025](core/SA-025-decrement/task.yaml) | Декремент по модулю степени двойки | 2 | T3.4 | регистр + анциллы | генератор | `eq_phase` | комбинация | QCoder QPC004 A5 |
| [SA-026](core/SA-026-less-than-phase/task.yaml) | Фазовый оракул «меньше L» | 3 | T3.3 | регистр + анциллы | генератор | `eq_phase` | комбинация | QCoder QPC001 B3, B4 (Less Than Oracle) |
| [SA-027](core/SA-027-even-nonzero/task.yaml) | Чётный, но не ноль | 3 | T3.5 | регистр + анциллы | генератор | `eq_anc_phase` | комбинация | sparq arena, пример SA-205 из материалов к акселератору |
| [SA-028](core/SA-028-ripple-adder/task.yaml) | Сумматор с одной анциллой | 3 | T3.4 | регистр + анциллы | генератор | `eq_anc_phase` | комбинация | S. Cuccaro et al., 2004 (arXiv:quant-ph/0410184); QuantumKatas RippleCarryAdder; ladder_ec C11 |
| [SA-029](core/SA-029-borrowed-ancilla/task.yaml) | Заимствованный кубит | 3 | T3.5 | любое | схема | `eq_phase` | реверс | A. Barenco et al., 1995, лемма 7.3 |
| [SA-069](core/SA-069-or-oracle/task.yaml) | Логическое ИЛИ в чистый кубит | 1 | T3.1 | регистр + анциллы | схема | `eq_anc` | один факт | QuantumKatas MarkingOracles / GroversAlgorithm (оракул ИЛИ) |
| [SA-070](core/SA-070-equal-bits/task.yaml) | Равны ли два бита | 1 | T3.3 | регистр + анциллы | схема | `eq_anc_phase` | один факт | sparq arena (демо v2, задача compare-bits) |
| [SA-083](core/SA-083-majority-one-toffoli/task.yaml) | Большинство из трёх за один Тоффоли | 2 | T3.5 | регистр + анциллы | схема | `eq_phase` | под ограничением | S. Cuccaro и др., 2004 (блок MAJ сумматора); демо v2 (maj-oracle) |

## T4. Алгоритмы с чёрным ящиком — 11

| id | Задача | Ур. | Ветвь | Вход | Ответ | Проверка | Как составлена | Источник |
|---|---|:-:|---|---|---|---|---|---|
| [SA-030](core/SA-030-deutsch-jozsa/task.yaml) | Дойч — Йожа за один запрос | 1 | T4.1 | чёрный ящик | генератор | `prob` | один факт | учебная классика; QuantumKatas DeutschJozsa; ladder_ec C04 |
| [SA-031](core/SA-031-grover-two-qubits/task.yaml) | Один из четырёх — наверняка | 2 | T4.2 | чёрный ящик | генератор | `prob` | комбинация | учебная классика; демо v2 (grover-2); QuantumKatas GroversAlgorithm |
| [SA-032](core/SA-032-bernstein-vazirani-xor/task.yaml) | Бернштейн — Вазирани с битовым оракулом | 2 | T4.1 | чёрный ящик | генератор | `prob` | комбинация | учебная классика; спецификация 04 проекта (задача 2); ladder_ec C03 (bv_ancilla) |
| [SA-033](core/SA-033-diffusion/task.yaml) | Оператор диффузии | 2 | T4.2 | любое | генератор | `eq_phase` | комбинация | QCoder QPC003 B5 (Reflection Operator 2) |
| [SA-034](core/SA-034-swap-test/task.yaml) | Swap-тест | 2 | T4.5 | любое | схема | `dist` | один факт | QOSF Monthly Challenge 2021-02 (скрининг менторской программы), Task 1 |
| [SA-035](core/SA-035-z-or-s/task.yaml) | Что в ящике: Z или S | 2 | T4.5 | чёрный ящик | генератор | `prob` | реверс | QuantumKatas DistinguishUnitaries |
| [SA-036](core/SA-036-grover-optimal/task.yaml) | Поиск Гровера с оптимальным числом итераций | 3 | T4.2 | чёрный ящик | генератор | `prob` | комбинация | QCoder QPC003 B6, B8 (Grover's Algorithm) |
| [SA-037](core/SA-037-phase-estimation/task.yaml) | Оценка фазы в t битах | 3 | T4.3 | чёрный ящик | генератор | `prob` | комбинация | IBM Quantum Challenge Spring 2023, Lab 3; QuantumKatas PhaseEstimation; ladder_ec C10 |
| [SA-038](core/SA-038-simon/task.yaml) | Алгоритм Саймона целиком | 3 | T4.4 | чёрный ящик | программа | `classical` | перенос сюжета | QuantumKatas SimonsAlgorithm |
| [SA-071](core/SA-071-phase-kickback/task.yaml) | Фазовый отклик | 1 | T4.1 | регистр + анциллы | схема | `eq_anc_phase` | один факт | QCoder QPC003 B2 (Convert Bit-Flip into Phase-Flip 1); учебная классика (алгоритм Дойча) |
| [SA-080](core/SA-080-diffusion-two-qubits/task.yaml) | Диффузия на двух кубитах за семь гейтов | 2 | T4.2 | любое | схема | `eq_phase` | под ограничением | QCoder QPC003 B4–B5 (Reflection Operator 1, 2) |

## T5. Ограничения железа — 11

| id | Задача | Ур. | Ветвь | Вход | Ответ | Проверка | Как составлена | Источник |
|---|---|:-:|---|---|---|---|---|---|
| [SA-039](core/SA-039-hadamard-native/task.yaml) | Адамар в нативном базисе | 1 | T5.1 | любое | схема | `eq_phase` | один факт | презентация классификации, T5.2 (нативный базис IBM) |
| [SA-040](core/SA-040-cx-native/task.yaml) | CX в нативном базисе | 2 | T5.1 | любое | схема | `eq_phase` | комбинация | презентация классификации, T5.2 (отображение в нативную архитектуру IBM) |
| [SA-041](core/SA-041-cx-bridge/task.yaml) | CX через соседа | 2 | T5.2 | любое | схема | `eq_phase` | под ограничением | презентация классификации, T5.1 (маршрутизация CNOT через SWAP) |
| [SA-042](core/SA-042-shrink-circuit/task.yaml) | Сожми схему | 2 | T5.3 | любое | схема | `eq_phase` | реверс | sparq arena (демо v2: формат «стартовая схема») |
| [SA-043](core/SA-043-controlled-s-tcount/task.yaml) | Управляемый S за три T | 2 | T5.4 | любое | схема | `eq_phase` | один факт | sparq arena |
| [SA-044](core/SA-044-toffoli-line-cost/task.yaml) | Тоффоли на цепочке: чем меньше CX, тем лучше | 3 | T5.3 | любое | схема | `score` | открытый оптимум | IBM Quantum Challenge 2020, финал (оценка $10\cdot N_{CX}+N_{1q}$); IBM Quantum Challenge 2021, Exercise 1 |
| [SA-045](core/SA-045-zne-folding/task.yaml) | Свёртка схемы для экстраполяции шума | 1 | T5.5 | чёрный ящик | генератор | `eq_phase` | один факт | QOSF Monthly Challenge 2023-03 (Working with NISQ devices, Mitiq) |
| [SA-072](core/SA-072-flip-cx/task.yaml) | CX против направления связи | 1 | T5.2 | любое | схема | `eq_phase` | один факт | sparq arena (демо v2, задача flip-cx) |
| [SA-073](core/SA-073-y-native/task.yaml) | Гейт Y в нативном базисе | 1 | T5.1 | любое | схема | `eq_phase` | один факт | набор гейтов процессоров IBM Quantum ($R_z$, $\sqrt{X}$, $X$, CX/ECR) |
| [SA-084](core/SA-084-parity-phase-one-t/task.yaml) | Фаза чётности одним T | 2 | T5.4 | любое | схема | `eq_phase` | под ограничением | M. Amy, D. Maslov, M. Mosca, 2014 (фазовые полиномы и счёт T) |
| [SA-085](core/SA-085-margolus/task.yaml) | Почти Тоффоли за три CX | 3 | T5.3 | любое | схема | `eq_phase` | под ограничением | N. Margolus, 1994; D. Maslov, 2016 (Тоффоли с относительной фазой); IBM Quantum Challenge 2021, Ex. 1 (стоимость Тоффоли) |

## T6. Измерения, динамические схемы и коррекция ошибок — 12

| id | Задача | Ур. | Ветвь | Вход | Ответ | Проверка | Как составлена | Источник |
|---|---|:-:|---|---|---|---|---|---|
| [SA-046](core/SA-046-plus-or-minus/task.yaml) | Плюс или минус | 1 | T6.1 | обещание | схема | `dist` | один факт | QuantumKatas Measurements, задача 1.3 |
| [SA-047](core/SA-047-active-reset/task.yaml) | Сброс кубита обратной связью | 1 | T6.2 | любое | динамическая | `channel` | один факт | IBM Quantum Challenge Spring 2023, Lab 1 (dynamic circuits) |
| [SA-048](core/SA-048-bell-measurement/task.yaml) | Какое из состояний Белла | 1 | T6.1 | обещание | схема | `dist` | реверс | QuantumKatas Measurements (различение состояний Белла) |
| [SA-049](core/SA-049-teleport-feedforward/task.yaml) | Телепортация с обратной связью | 2 | T6.2 | любое | динамическая | `channel` | комбинация | IBM Quantum Challenge Spring 2023, Lab 2 (Quantum Teleportation) |
| [SA-050](core/SA-050-phase-flip-encoder/task.yaml) | Код от фазовых ошибок | 2 | T6.3 | регистр + анциллы | схема | `eq_anc_phase` | комбинация | QOSF Monthly Challenge 2021-02 (скрининг менторской программы), Task 2 |
| [SA-051](core/SA-051-bit-flip-correction/task.yaml) | Исправление переворота бита по синдрому | 3 | T6.4 | обещание | динамическая | `channel` | комбинация | IBM Quantum Challenge 2021, Exercise 3; QOSF Monthly Challenge 2021-02, Task 2; презентация классификации, T6.2 |
| [SA-052](core/SA-052-steane-syndrome/task.yaml) | Синдром кода Стина | 3 | T6.3 | обещание | схема | `eq_anc_phase` | перенос сюжета | НТО, профиль «Квантовый инжиниринг» (задача о синдромах кода Стина) |
| [SA-074](core/SA-074-measure-y-basis/task.yaml) | По часовой или против | 1 | T6.1 | обещание | схема | `dist` | один факт | QuantumKatas Measurements (различение двух ортогональных состояний); демо v2 (measure-y) |
| [SA-075](core/SA-075-bitflip-encoder/task.yaml) | Кодировщик кода повторения | 1 | T6.3 | регистр + анциллы | схема | `eq_anc_phase` | один факт | IBM Quantum Challenge 2021, Ex. 3 (bit-flip code); QuantumKatas QEC_BitFlipCode (Encode) |
| [SA-076](core/SA-076-projective-x/task.yaml) | Измерение X, после которого кубит жив | 1 | T6.1 | любое | динамическая | `channel` | один факт | IBM Quantum Challenge Spring 2023, Lab 1 (промежуточные измерения); QuantumKatas Measurements |
| [SA-082](core/SA-082-one-bit-teleport/task.yaml) | Переезд кубита за один CX | 2 | T6.2 | любое | динамическая | `channel` | под ограничением | X. Zhou, D. Leung, I. Chuang, 2000 (однобитная телепортация); IBM Quantum Challenge Spring 2023, Lab 2 |
| [SA-086](core/SA-086-t-gate-injection/task.yaml) | Гейт T через магическое состояние | 3 | T6.2 | любое | динамическая | `channel` | комбинация | D. Gottesman, I. Chuang, 1999 (телепортация гейтов); S. Bravyi, A. Kitaev, 2005 (магические состояния) |

## T7. Протоколы, игры и криптография — 7

| id | Задача | Ур. | Ветвь | Вход | Ответ | Проверка | Как составлена | Источник |
|---|---|:-:|---|---|---|---|---|---|
| [SA-053](core/SA-053-superdense-coding/task.yaml) | Два бита одним кубитом | 1 | T7.1 | запутанность | генератор | `prob` | один факт | учебная классика; QuantumKatas SuperdenseCoding |
| [SA-054](core/SA-054-chsh-game/task.yaml) | Игра CHSH | 2 | T7.2 | запутанность | генератор | `prob` | перенос сюжета | QuantumKatas CHSHGame |
| [SA-055](core/SA-055-ghz-game/task.yaml) | Игра GHZ | 2 | T7.2 | запутанность | генератор | `prob` | перенос сюжета | QuantumKatas GHZGame |
| [SA-056](core/SA-056-bb84-sifting/task.yaml) | BB84: просеивание ключа и поиск перехвата | 2 | T7.3 | $|0\dots0\rangle$ | программа | `classical` | перенос сюжета | НТО, профиль «Квантовый инжиниринг» (протокол BB84) |
| [SA-057](core/SA-057-entanglement-swapping/task.yaml) | Обмен запутанностью | 3 | T7.1 | $|0\dots0\rangle$ | динамическая | `channel` | комбинация | sparq arena (гибрид SA-048 и SA-049) |
| [SA-077](core/SA-077-ghz-odd-parity/task.yaml) | Три случайных бита с нечётной суммой | 1 | T7.2 | запутанность | схема | `prob` | один факт | N. D. Mermin, 1990; QuantumKatas GHZGame |
| [SA-081](core/SA-081-ghz-to-bell/task.yaml) | Третий выходит из GHZ | 2 | T7.1 | запутанность | динамическая | `channel` | комбинация | IBM Quantum Challenge Spring 2023 (динамические схемы: GHZ и измерения с прямой связью); M. Hillery, V. Bužek, A. Berthiaume, 1999 (разделение секрета) |

## T8. Моделирование и вариационные схемы — 6

| id | Задача | Ур. | Ветвь | Вход | Ответ | Проверка | Как составлена | Источник |
|---|---|:-:|---|---|---|---|---|---|
| [SA-058](core/SA-058-zz-rotation/task.yaml) | Экспонента ZZ | 1 | T8.1 | любое | генератор | `eq_phase` | один факт | учебная классика; строительный блок задач Xanadu QHack 2023 (троттеризация) |
| [SA-059](core/SA-059-trotter-ising/task.yaml) | Шаги Троттера для цепочки Изинга | 3 | T8.2 | любое | генератор | `eq_phase` | комбинация | Xanadu QHack 2023 (Trotter simulation); ladder_ec C09 (trotter_brick) |
| [SA-060](core/SA-060-qaoa-maxcut-layer/task.yaml) | Слой QAOA для взвешенного разреза | 2 | T8.3 | $|0\dots0\rangle$ | генератор | `eq0_phase` | перенос сюжета | QOSF Monthly Challenge 2021-02 (скрининг менторской программы), Task 4 |
| [SA-061](core/SA-061-parameter-shift/task.yaml) | Градиент по правилу сдвига параметра | 3 | T8.4 | $|0\dots0\rangle$ | программа | `classical` | перенос сюжета | Xanadu QHack 2023 (parameter-shift gradient) |
| [SA-078](core/SA-078-xx-exponent/task.yaml) | Экспонента XX за пять гейтов | 2 | T8.1 | любое | схема | `eq_phase` | под ограничением | Xanadu QHack 2023 (троттеризация, разобранная задача 044); развитие SA-058 |
| [SA-079](core/SA-079-measure-xx/task.yaml) | Наблюдаемая XX одним битом | 2 | T8.4 | любое | схема | `dist` | комбинация | Xanadu QHack 2023 (энергия молекулы водорода, разобранная задача 047): оценка паулиевых слагаемых |
