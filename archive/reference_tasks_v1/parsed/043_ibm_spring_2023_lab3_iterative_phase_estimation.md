# Lab 3: Iterative Quantum Phase Estimation (IQPE) with 1 Ancilla

## 1. Классификация и метаданные
* **ID задачи:** `ibm_spring_2023_lab3_iterative_phase_estimation`
* **Источник:** https://github.com/qiskit-community/ibm-quantum-challenge-spring-2023/blob/main/content/lab_3/lab3.ipynb
* **Платформа:** IBM Quantum Challenge Spring 2023
* **Общее описание:** Построить квантовую схему итеративного оценивания фазы (Iterative Quantum Phase Estimation, IQPE) унитарного оператора $U$ с $m$-битовой точностью с использованием ВСЕГО 1 вспомогательного кубита благодаря промежуточным измерениям, динамическому сбросу `reset` и фазовым поправкам $R_z(-\omega)$ в реальном времени (динамические схемы / feed-forward).
* **Результат решения:** `ФИКСИРОВАННАЯ ЧИСТО КВАНТОВАЯ СХЕМА` (статическая схема с динамическими инструкциями `reset`, `measure`, `if_test` для конкретного гейта) / `ПАРАМЕТРИЗОВАННЫЙ ГЕНЕРАТОР СХЕМЫ` (для произвольного угла $\theta$ и точности $m$).
* **Формат ответа:**
  ```python
  from qiskit import QuantumCircuit, QuantumRegister, ClassicalRegister

  def step_2_circuit(qr: QuantumRegister, cr: ClassicalRegister) -> QuantumCircuit:
      """
      2-bit precision IQPE circuit for the S-gate.
      qr: QuantumRegister(2, 'q') -> q0: ancilla, q1: eigenstate |1>
      cr: ClassicalRegister(2, 'c') -> c0: LSB (phi_2), c1: MSB (phi_1)
      """
      qc = QuantumCircuit(qr, cr)
      # ...
      return qc

  def t_gate_ipe_circuit(qr: QuantumRegister, cr: ClassicalRegister) -> QuantumCircuit:
      """
      3-bit precision IQPE circuit for the T-gate.
      qr: QuantumRegister(2, 'q') -> q0: ancilla, q1: eigenstate |1>
      cr: ClassicalRegister(3, 'c') -> c0: phi_3, c1: phi_2, c2: phi_1
      """
      qc = QuantumCircuit(qr, cr)
      # ...
      return qc
  ```
* **Число кубитов:** 2 кубита ($q_0$ — вспомогательный кубит для измерений и фазового отката, $q_1$ — рабочий кубит собственного состояния оператора $|\Psi\rangle = |1\rangle$) + регистр из $m$ классических битов ($m=2$ для $S$-гейта, $m=3$ для $T$-гейта).
* **Сложность:** Intermediate (IBM Challenge Lab), Dynamic Circuits & Mid-circuit Measurements.

---

## 2. Условие задачи (Problem Statement)

### Lab 3: Iterative phase estimation
* **Platform:** IBM Quantum Challenge Spring 2023
* **Topic:** Dynamic Circuits, Mid-circuit Measurement, Conditional Feed-Forward, Single Ancilla QPE.

#### Problem Statement
Given a unitary matrix $U$ and an eigenstate $|\Psi\rangle$ of $U$ with an unknown eigenvalue $e^{i 2\pi \varphi}$, estimate the value of $\varphi$.
Assume that $\varphi$ has an exact binary expansion:
$$
\varphi = \varphi_1/2 + \varphi_2/4 + \cdots + \varphi_m/2^m = 0.\varphi_1 \varphi_2 \cdots \varphi_m
$$

Standard Quantum Phase Estimation (QPE) requires $m$ auxiliary qubits to estimate $\varphi$ to $m$ bits of precision. Iterative Phase Estimation (IPE / IQPE) reduces the required auxiliary system to **just 1 auxiliary qubit** by measuring the phase bits sequentially from the least significant bit $\varphi_m$ to the most significant bit $\varphi_1$, using classical feed-forward to correct the phase on subsequent iterations:

1. **State Initialization:** Prepare auxiliary qubit $q_0 \to |+\rangle = H|0\rangle$ and system qubit $q_1 \to |\Psi\rangle$.
2. **Phase Kickback:** Apply controlled-$U^{2^{m-k}}$ with $q_0$ as control and $q_1$ as target.
3. **Phase Correction (for $k > 1$):** Apply a rotation $R_z(\omega_k)$ on $q_0$ conditioned on previously measured classical bits $\varphi_{m}, \dots, \varphi_{m-k+2}$, where:
$$
\omega_k = -2\pi (0.0\varphi_{m-k+2}\dots\varphi_m) = -2\pi \sum_{j=1}^{k-1} \varphi_{m-j+1} 2^{-(k-j+1)}
$$
4. **$X$-basis Measurement:** Apply Hadamard $H$ to $q_0$ and measure $q_0$ into classical bit $c_{k-1}$ (extracting $\varphi_{m-k+1}$).
5. **Reset & Reuse:** Apply `reset(q_0)` to return the auxiliary qubit to $|0\rangle$, then repeat for the next bit.

---

#### Exercises

##### Exercise 1: Step 1 (Least Significant Bit of $S$-gate)
For the single-qubit $S$-gate $S = \begin{pmatrix} 1 & 0 \\ 0 & e^{i\pi/2} \end{pmatrix} = \text{diag}(1, e^{i 2\pi (1/4)})$, $\varphi = 1/4 = 0.01_2$ ($m=2$ bits: $\varphi_1=0, \varphi_2=1$).
Construct `step_1_circuit(qr, cr)` to measure $\varphi_2$:
1. Initialize $q_0 \to |+\rangle$ ($H$), $q_1 \to |1\rangle$ ($X$).
2. Apply controlled-$S^2$ via `cp(np.pi, q0, q1)`.
3. Measure $q_0$ in $X$-basis ($H$ then `measure(q0, cr[0])`).

##### Exercise 2: Step 2 (Complete 2-bit IQPE for $S$-gate)
Extend `step_1_circuit` into `step_2_circuit(qr, cr)`:
1. `qc.reset(q0)` and re-initialize with `qc.h(q0)`.
2. Apply phase correction conditioned on $c_0$: `with qc.if_test((cr[0], 1)): qc.p(-np.pi/2, q0)` (or `qc.p(-np.pi/2, q0).c_if(cr[0], 1)`).
3. Apply controlled-$S^1$ via `cp(np.pi/2, q0, q1)`.
4. Measure $q_0$ in $X$-basis into $cr[1]$ ($H$ then `measure(q0, cr[1])`).
*Target output bitstring:* `01` with 100% probability.

##### Exercise 3: 3-bit IQPE for $T$-gate
Construct `t_gate_ipe_circuit(qr, cr)` for the $T$-gate $T = \text{diag}(1, e^{i\pi/4}) = \text{diag}(1, e^{i 2\pi(1/8)})$ ($\varphi = 1/8 = 0.001_2$, $m=3$ bits):
* Extract $\varphi_3 \to cr[0]$ using controlled-$T^4 = CP(\pi)$.
* Reset $q_0$, apply dynamic phase correction conditioned on $cr[0]$ ($-\pi/2$), apply controlled-$T^2 = CP(\pi/2)$, measure $\varphi_2 \to cr[1]$.
* Reset $q_0$, apply dynamic phase corrections conditioned on $cr[0]$ ($-\pi/4$) and $cr[1]$ ($-\pi/2$), apply controlled-$T^1 = CP(\pi/4)$, measure $\varphi_1 \to cr[2]$.
*Target output bitstring:* `001` with 100% probability.

##### Exercise 4 & 5: Non-exact Binary Expansion ($\varphi = 1/3$)
When $\varphi = 1/3 = 0.010101\dots_2$, IQPE yields the closest 2-bit approximation ($0.01_2 = 1/4$) with bounded success probability, mitigated via majority voting across runs or multi-circuit bit extraction.

---

#### Constraints
* Total quantum registers: 2 qubits (`qr = QuantumRegister(2, "q")`).
* Classical register: $m$ bits (`cr = ClassicalRegister(m, "c")`).
* Only 1 auxiliary qubit ($q_0$) is allowed for phase kickback and measurement.
* Mid-circuit dynamic operations (`reset`, classical control `if_test` / `c_if`) must be used for qubit recycling.
* Target eigenstate $|\Psi\rangle = |1\rangle$ on $q_1$ must remain intact throughout all stages.

---

## 3. Анализ проверяющей системы (Auto-Judge)
* **Принцип проверки:** Судебная система (`qc_grader.challenges.spring_2023.grade_ex3*`) проверяет переданные объекты `QuantumCircuit`:
  1. *Структурная валидация:* Проверяется использование ровно 2 квантовых кубитов ($q_0, q_1$), наличие инструкций `reset`, наличие условных блоков `if_test` (динамический классический feed-forward) и правильная адресация классических битов $c_0, \dots, c_{m-1}$.
  2. *Симуляция с динамическими схемами:* Запуск на симуляторе с поддержкой dynamic circuits (`AerSimulator` / `Sampler`). Судья вычисляет распределение вероятностей исходов измерения классического регистра $c$. Для точных фаз ($S$-гейт, $T$-гейт) проверяется получение эталонного битстрока (`01` для $S$, `001` для $T$) с вероятностью $1.0$ (100%).
* **Каверзные случаи:**
  - *Порядок следования битов (Bit Ordering / Endianness):* В Qiskit классический регистр $c$ при печати и считывании выводится в формате little-endian ($c_{m-1}c_{m-2}\dots c_0$). Первый измеренный бит (LSB $\varphi_m$) записывается в $c_0$, а последний (MSB $\varphi_1$) — в $c_{m-1}$. В результате строка измерений $c_{m-1}\dots c_0$ в точности совпадает с $0.\varphi_1\dots\varphi_m$.
  - *Сброс состояния вспомогательного кубита (`reset`):* После проективного измерения в $X$-базисе кубит $q_0$ коллапсирует в базисное состояние $|0\rangle$ или $|1\rangle$. Без вызова `qc.reset(q_0)` последующий гейт Адамара создаст состояние $|+\rangle$ или $|-\rangle$ в зависимости от исхода предыдущего шага, что приведет к фатальной ошибке суперпозиции.
  - *Накопление фазовых поправок для $m \ge 3$:* На шаге $k$ угол поворота $\omega_k$ зависит от всех ранее определенных битов. Для $T$-гейта на 3-м шаге необходимо применить две независимые условные фазовые поправки: $P(-\pi/4)$ при $c_0=1$ и $P(-\pi/2)$ при $c_1=1$.
  - *Невозможность свертки в единую унитарную матрицу:* Из-за промежуточных измерений и классического ветвления схема не является унитарным преобразованием над $2$-кубитным пространством, что делает стандартную валидацию через `Operator(qc)` неприменимой.
* **Оценка числа тестов:** 4 независимых задания автогрейдера (`grade_ex3a`, `grade_ex3b`, `grade_ex3c`, `grade_ex3e`), в каждом оценивается 1 квантовая схема на 1024–4096 шотах симулятора.
* **Асимптотика и быстродействие:** Размерность квантовой системы $N=2$ (размерность Гильбертова пространства $2^2 = 4$). Симуляция ветвящихся траекторий или выборки шотов выполняется за $< 5$ мс на тест. Суммарная валидация занимает $< 100$ мс при лимите времени в несколько секунд.
* **Полная проверка без шотов и перебор:**
  - *Проверка без шотов:* **Да**. Через симуляцию дерева квантово-классических состояний (древовидный Statevector / плотностная матрица с редукцией фон Неймана) распределение вероятностей вычисляется аналитически точно без шума измерений.
  - *Решаемость перебором:* **Защищена**. Хотя размер системы мал ($N=2$), комбинаторное пространство с учетом условных блоков `if_test`, параметров непрерывных фазовых вращений и динамического сброса требует строгого детерминированного алгоритмического синтеза.

---

## 4. Оценка ресурсов и применимость в GUI
* **Примерное число гейтов:**
  - *2-битный IQPE ($S$-gate, Exercise 2):* 1 $X$ (подготовка $|1\rangle$), 4 $H$, 2 $CP$ ($CP(\pi)$ и $CP(\pi/2)$), 1 `reset`, 1 условный `p(-pi/2)` (`if_test`), 2 `measure`. Всего: 11 операций, глубина $\approx 9$.
  - *3-битный IQPE ($T$-gate, Exercise 3):* 1 $X$, 6 $H$, 3 $CP$ ($CP(\pi), CP(\pi/2), CP(\pi/4)$), 2 `reset`, 3 условных `p`, 3 `measure`. Всего: 18 операций, глубина $\approx 15$.
* **Решаемость в визуальном конструкторе:** `ДА (100%)` при наличии поддержки Dynamic Circuits в GUI (блоков `measure`, `reset` и условного исполнения `if_test` / `c_if`) / `НЕТ (ТОЛЬКО КОД)`, если конструктор поддерживает только чистые унитарные схемы без промежуточных измерений (в таком случае требуется стандартная $m+1$ кубитная схема QPE).
* **Теги:** `[VISUAL_GUI_READY]`, `[DYNAMIC_CIRCUITS]`, `[ITERATIVE_PHASE_ESTIMATION]`, `[MID_CIRCUIT_MEASUREMENT]`, `[FEED_FORWARD]`, `[SINGLE_ANCILLA]`, `[PHASE_ESTIMATION]`, `[BRUTE_FORCE_PROTECTED]`.
