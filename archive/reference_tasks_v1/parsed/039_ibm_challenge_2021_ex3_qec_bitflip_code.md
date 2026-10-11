# IBM Challenge 2021 - Exercise 3: Quantum Error Correction

## 1. Классификация и метаданные
* **ID задачи:** `ibm_challenge_2021_ex3`
* **Источник:** https://github.com/qiskit-community/ibm-quantum-challenge-2021/blob/main/content/ex3/ex3.ipynb
* **Платформа:** IBM Quantum (IBM Quantum Challenge 2021)
* **Общее описание:** Разработать квантовую схему стабилизаторного кода коррекции ошибок (5 кодовых кубитов + 4 анциллы синдромов) с аппаратной топологической привязкой к 20-кубитной архитектуре `ibmq_tokyo` для однозначной детекции 16 конфигураций $X$- и $Z$-ошибок на двух выбранных кодовых кубитах без дополнительных вентилей перестановки (SWAP).
* **Результат решения:** `ФИКСИРОВАННАЯ ЧИСТО КВАНТОВАЯ СХЕМА`
* **Формат ответа:**
  ```python
  from qiskit import QuantumCircuit, QuantumRegister, ClassicalRegister

  # Регистры: 5 кодовых кубитов, 4 анциллы синдромов, 4 бита классического вывода
  code = QuantumRegister(5, 'code')
  syn = QuantumRegister(4, 'syn')
  out = ClassicalRegister(4, 'out')

  # Схема инициализации кодового состояния (собственное состояние стабилизаторов)
  qc_init = QuantumCircuit(code, syn, out)
  # ... гейты инициализации ...

  # Схема измерения синдромов стабилизаторов
  qc_syn = QuantumCircuit(code, syn, out)
  # ... гейты ZZZ и XXX стабилизаторов + измерение syn -> out ...

  # Список двух кодовых кубитов для внесения искусственных ошибок
  error_qubits = [code[0], code[4]]

  # Отображение виртуальных кубитов на физические кубиты ibmq_tokyo (20-кубитный чип)
  initial_layout = [0, 2, 6, 10, 12, 1, 5, 7, 11]
  ```
* **Число кубитов:** 9 квантовых кубитов (5 кодовых кубитов `code[0..4]` + 4 анциллы синдромов `syn[0..3]`) и 4 классических бита `out[0..3]`, размещаемых на 20-кубитной топологии `ibmq_tokyo`.
* **Сложность:** Advanced (QEC Stabilizer Codes, Syndrome Readout, Hardware-aware Layout & Zero-overhead Routing).

---

## 2. Условие задачи (Problem Statement)

### Exercise 3 - Quantum error correction
* **Source Repo:** https://github.com/qiskit-community/ibm-quantum-challenge-2021/blob/main/content/ex3/ex3.ipynb
* **Authors:** James Wootton, Rahul Pratap Singh
* **Version:** 1.0.0

#### Historical background
Shor's algorithm gave quantum computers a worthwhile use case—but the inherent noisiness of quantum mechanics meant that building hardware capable of running such an algorithm would be a huge struggle. In 1995, Shor released another landmark paper: a scheme that shared quantum information over multiple qubits in order to reduce errors.

A great deal of progress has been made over the decades since. New forms of error correcting codes have been discovered, and a large theoretical framework has been built around them. The surface codes proposed by Kitaev in 1997 have emerged as the leading candidate, and many variations on the original design have emerged since then. But there is still a lot of progress to make in tailoring codes to the specific details of quantum hardware.

In this exercise we'll consider a case in which artificial 'errors' are inserted into a circuit. Your task is to design the circuit such that these additional gates can be identified.

You'll then need to think about how to implement your circuit on a real device. This means you'll need to tailor your solution to the layout of the qubits. Your solution will be scored on how few entangling gates (the noisiest type of gate) that you use.

##### References
1. Shor, Peter W. "Scheme for reducing decoherence in quantum computer memory." Physical review A 52.4 (1995): R2493.
2. Dennis, Eric, et al. "Topological quantum memory." Journal of Mathematical Physics 43.9 (2002): 4452-4505.

#### The problem of errors
Errors occur when some spurious operation acts on our qubits. Their effects cause things to go wrong in our circuits. The strange results you may have seen when running on real devices is all due to these errors.

There are many spurious operations that can occur, but it turns out that we can pretend that there are only two types of error: bit flips and phase flips.

Bit flips have the same effect as the $X$ gate. They flip the $|0\rangle$ state of a single qubit to $|1\rangle$ and vice-versa. Phase flips have the same effect as the $Z$ gate, introducing a phase of $-1$ into superpositions. Put simply, they flip the $|+\rangle$ state of a single qubit to $|-\rangle$ and vice-versa.

The reason we can think of any error in terms of just these two is because any error can be represented by some matrix, and any matrix can be written in terms of the matrices $X$ and $Z$. Specifically, for any single qubit matrix $M$,
$$
M = \alpha I + \beta X + \gamma XZ + \delta Z,
$$
for some suitably chosen values $\alpha$, $\beta$, $\gamma$ and $\delta$.

So whenever we apply this matrix to some single qubit state $|\psi\rangle$ we get
$$
M |\psi\rangle = \alpha |\psi\rangle + \beta X |\psi\rangle + \gamma XZ |\psi\rangle + \delta Z |\psi\rangle.
$$

The resulting superposition is composed of the original state, the state we'd have if the error was just a bit flip, the state for just a phase flip and the state for both. If we had some way to measure whether a bit or phase flip happened, the state would then collapse to just one possibility. And our complex error would become just a simple bit or phase flip.

So how do we detect whether we have a bit flip or a phase flip (or both). And what do we do about it once we know? Answering these questions is what quantum error correction is all about.

#### Goal and What to Submit
**Goal:** Create circuits which can detect `x` and `z` errors on two qubits. You can come up with a solution of your own, or tweak the provided template.

**What to submit:**
* You need to supply two circuits:
  * `qc_init`: Prepares the qubits in a desired initial state;
  * `qc_syn`: Measures a subset of the qubits.
* The artificial errors to be inserted are `x` and `z` gates on two particular qubits. You need to pick the two qubits to be used for this (supplied as the list `error_qubits`).
* There are 16 possible sets of errors to be inserted (including the trivial case of no errors). The measurement result of `qc_syn` should output a unique bit string for each. The grader will return the error message *"Please make sure the circuit is created to the initial layout."* if this is not satisfied.
* The grader will compile the complete circuit for the backend `ibmq_tokyo` (a 20-qubit mock device `FakeTokyo`). To show that your solution is tailor-made for the device, this transpilation should not change the number of `cx` gates. If it does, you will get an error message.
* To guide the transpilation, you'll need to tell the transpiler which qubits on the device should be used as which qubits in your circuit. This is done with an `initial_layout` list.

#### Stabilizer Geometry and Syndrome Ordering
We use 5 code qubits and 4 syndrome qubits arranged in four triangular plaquettes:
```
c0----------c1
| \   s0   / |
|   \    /   |
| s1  c2  s2 |
|   /    \   |
| /   s3   \ |
c3----------c4
```

* **Left $ZZZ$ stabilizer:** $c_0, c_2, c_3$ measured via ancilla $s_1$.
* **Right $ZZZ$ stabilizer:** $c_1, c_2, c_4$ measured via ancilla $s_2$.
* **Top $XXX$ stabilizer:** $c_0, c_1, c_2$ measured via ancilla $s_0$.
* **Bottom $XXX$ stabilizer:** $c_2, c_3, c_4$ measured via ancilla $s_3$.

**Syndrome output ordering:**
1. The leftmost output bit (`out[3]`) represents $Z$ on `code[1]`.
2. The second output from left (`out[2]`) represents $X$ on `code[1]`.
3. The third output from left (`out[1]`) represents $X$ on `code[0]`.
4. The rightmost output bit (`out[0]`) represents $Z$ on `code[0]`.

#### Connectivity Graph and Backend `ibmq_tokyo`
The required 2-qubit gate connectivity between code qubits and syndrome ancillas in `qc_syn` is:
```
c0....s0....c1
:      :     :        
:      :     :
s1....c2....s2
:      :     :
:      :     :
c3....s3....c4
```
A compatible embedding into `ibmq_tokyo` (such as using physical qubits `[0, 2, 6, 10, 12, 1, 5, 7, 11]`) avoids any additional SWAP gates.

---

## 3. Анализ проверяющей системы (Auto-Judge)
* **Принцип проверки:**
  1. **Валидация входных данных:** Проверяются типы переданных объектов `qc_init`, `qc_syn`, `error_qubits` (2 кодовых кубита) и `initial_layout` (список из 9 уникальных индексов физических кубитов `[0..19]`).
  2. **Проверка аппаратной совместимости (Zero-Overhead Routing):** Схема `qc = qc_init.compose(qc_syn)` транслируется с помощью `qiskit.compiler.transpile` под топологию `FakeTokyo` с фиксацией `initial_layout`. Автосудья сравнивает число двухкубитных вентилей (`cx` / non-local gates) до и после трансляции. Если транслятор добавил хотя бы один SWAP-гейт (увеличил число CX), возвращается вердикт с ошибкой: *"Please make sure the circuit is created to the initial layout."*.
  3. **Проверка 16 конфигураций ошибок:** Судья перебирает все 16 комбинаций ошибок $E \in \{I, X_0, Z_0, X_0 Z_0\} \otimes \{I, X_1, Z_1, X_1 Z_1\}$ на выбранных кубитах `error_qubits`. Для каждого случая формируется схема `qc_init + insert(E) + qc_syn` и запускается симуляция (Statevector / QasmSimulator).
  4. **Проверка взаимно-однозначного соответствия синдромов:** Проверяется, что каждая ошибка детерминированно (со 100% вероятностью) генерирует уникальный 4-битный классический синдром в регистре `out` в строгом порядке `(z1, x1, x0, z0)`.
* **Каверзные случаи:**
  - *Топология IBM Tokyo (20-qubit Grid with Cross-Couplings):* Архитектура `ibmq_tokyo` имеет сетку 4x5 с диагональными перекрестными связями, но не все теоретические треугольники физически соединены. Ошибка в сопоставлении кубитов в `initial_layout` приводит к появлению дополнительных SWAP-вентилей при трансляции.
  - *Направленность CNOT-вентилей (Coupling Map Directed Edges):* На физическом чипе двухкубитные связи ориентированы. Если направление CNOT не совпадает с физическим ребром, транслятор может развернуть CNOT через 4 H-вентиля (допустимо), но при отсутствии ребра — вставит SWAP (что приведет к провалу проверки).
  - *Отсутствие разрушения суперпозиции кодовых кубитов:* Измерению подвергаются исключительно 4 анциллы синдромов `syn`. Кодовые кубиты не измеряются, сохраняя квантовую когерентность.
  - *Коммутация стабилизаторов и порядок гейтов:* Стабилизаторы ZZZ и XXX коммутируют на кодовом пространстве, однако порядок применения CNOT-гейтов в схеме синдромного считывания должен исключать паразитный фазовый откат (phase kickback) между анциллами.
  - *Uncomputation анцилл в `qc_init`:* В схеме подготовки состояния анциллы должны быть полностью распутаны с кодовыми кубитами и возвращены в $|0\rangle$ до внесения ошибок.
  - *Запрет на `barrier`:* Наличие барьеров в сдаваемой схеме может препятствовать оптимизациям транслятора и вызывать сбои в автогрейдере.
* **Оценка числа тестов:** 1 проверка графа трансляции (FakeTokyo) + 16 тестовых запусков на все комбинации ошибок $E \in \{I, X, Z, Y\}^{\otimes 2}$.
* **Асимптотика и быстродействие:** Сложность симуляции $O(2^9) = 512$ комплексных амплитуд. Память симулятора $< 10$ МБ. Время трансляции ~50–100 мс, время симуляции 16 тестов $< 50$ мс. Суммарное время валидации $\approx 150$–$200$ мс.
* **Полная проверка без шотов и перебор:**
  - *Проверка без шотов:* **Да, 100%**. Аналитическая проверка через `Statevector` или бесшумный `QasmSimulator`, так как собственные состояния стабилизаторов дают строго детерминированный результат измерения 0/1.
  - *Решаемость перебором:* **Уязвима к перебору топологических подграфов, защищена от случайного синтеза схем.** Число перестановок размещения 9 кубитов на 20 физических узлах составляет $A_{20}^9 \approx 6.09 \times 10^{10}$, однако поиск изоморфного подграфа на графе Tokyo выполняется алгоритмически за миллисекунды. Сама схема стабилизаторов детерминированно собирается из базовых блоков CNOT.

---

## 4. Оценка ресурсов и применимость в GUI
* **Примерное число гейтов:**
  - `qc_init`: ~10–12 гейтов (2 $H$, 8–10 $CX$).
  - `qc_syn`: ~16 гейтов (4 $H$, 12 $CX$).
  - Итого на полную схему: ~26–28 гейтов (6 $H$, 20–22 $CX$), глубина схемы $\sim 10$–$14$.
* **Решаемость в визуальном конструкторе:** `ДА (100%)` — схема статична, фиксирована на 9 кубитах и 4 битах классического вывода, не требует параметрического синтеза в рантайме. При наличии в GUI возможности выбора физического маппинга (`initial_layout`) полностью собирается перетаскиванием вентилей на холсте.
* **Теги:** `[VISUAL_GUI_READY]`, `[QUANTUM_ERROR_CORRECTION]`, `[SURFACE_CODE]`, `[STABILIZER_CODE]`, `[SYNDROME_MEASUREMENT]`, `[HARDWARE_AWARE_LAYOUT]`, `[TOPOLOGY_MAPPING]`, `[IBM_CHALLENGE_2021]`.
