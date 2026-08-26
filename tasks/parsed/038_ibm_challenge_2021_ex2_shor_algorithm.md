# 038_ibm_challenge_2021_ex2: Shor's Algorithm (Modular Exponentiation)

## 1. Классификация и метаданные
* **ID задачи:** `ibm_challenge_2021_ex2`
* **Источник:** https://github.com/qiskit-community/ibm-quantum-challenge-2021/blob/main/content/ex2/ex2.ipynb
* **Платформа:** IBM Quantum Challenge 2021
* **Общее описание:** Построить оптимизированную квантовую схему контролируемой модульной экспоненциации $13^x \pmod{35}$ в сжатом 2-кубитном представлении для алгоритма факторизации Шора с квантовым оцениванием фазы (QPE) на 5 кубитах при минимальном числе двухкубитных вентилей CNOT.
* **Результат решения:** `ФИКСИРОВАННАЯ ЧИСТО КВАНТОВАЯ СХЕМА`
* **Формат ответа:**
  ```python
  from qiskit import QuantumCircuit, QuantumRegister

  # Sub-circuits:
  # cu: QuantumCircuit(QuantumRegister(1, 'control'), QuantumRegister(2, 'target'))
  # cu2: QuantumCircuit(QuantumRegister(1, 'control'), QuantumRegister(2, 'target'))
  # cu4: QuantumCircuit(QuantumRegister(1, 'control'), QuantumRegister(2, 'target'))

  # Final composite circuit:
  cqr = QuantumRegister(3, 'control')
  tqr = QuantumRegister(2, 'target')
  cux = QuantumCircuit(cqr, tqr, name="Controlled 13^x mod 35")
  # Returns QuantumCircuit in basis ['cx', 'u'] with minimal CNOT count
  ```
* **Число кубитов:** 5 кубитов (3 кубита регистра счета/оценки фазы `control`, 2 кубита регистра данных `target`). Анциллы отсутствуют.
* **Сложность:** Intermediate (Exercise 2), оптимизационная метрика — минимизация количества CNOT-гейтов (`count_ops()['cx']`).

---

## 2. Условие задачи (Problem Statement)

### Exercise 2: Shor's algorithm

#### Historical background
In computing, we often measure the performance of an algorithm by how it grows with the size of the input problem. For example, addition has an algorithm that grows linearly with the size of the numbers we're adding. There are some computing problems for which the best algorithms we have grow *exponentially* with the size of the input, and this means inputs with a relatively modest size are too big to solve using any computer on earth. We're so sure of this, much of the internet's security depends on certain problems being unsolvable.

In 1994, Peter Shor showed that it’s possible to factor a number into its primes efficiently on a quantum computer. This is big news, as the best classical algorithm we know of is one of these algorithms that grows exponentially. And in fact, [RSA encryption](https://en.wikipedia.org/wiki/RSA_(cryptosystem)) relies on factoring large enough numbers being infeasible. To factor integers that are too big for our current classical computers will require millions of qubits and gates, and these circuits are far too big to run on today’s quantum computers successfully.

The difficulty in creating circuits for Shor’s algorithm is creating the circuit that computes a controlled $ay \bmod N$. While we know how to create these circuits using a polynomial number of gates, these are still too large for today’s computers. Fortunately, if we know some information about the problem a priori, then we can sometimes ‘cheat’ and create more efficient circuits.

#### The Problem: Factoring 35 with $13^x \bmod 35$
In this exercise, we will factor $N = 35$ ($a = 13$) by doing quantum phase estimation (QPE) on a circuit that implements $13y \bmod 35$.

A detail of Shor’s algorithm is that our circuit only needs to work on states we can reach through applying $U$ to the starting state $|1\rangle$:
$$
\begin{aligned}
U|1\rangle &= |13\rangle \\
UU|1\rangle &= |29\rangle \\
UUU|1\rangle &= |27\rangle \\
UUUU|1\rangle &= |1\rangle
\end{aligned}
$$

Since we only need to correctly transform 4 distinct states, we can encode them onto a 2-qubit computational basis:
$$
\begin{aligned}
|1\rangle &\rightarrow |00\rangle \\
|13\rangle &\rightarrow |01\rangle \\
|29\rangle &\rightarrow |10\rangle \\
|27\rangle &\rightarrow |11\rangle
\end{aligned}
$$

The period of $f(x) = 13^x \bmod 35$ is $r = 4$.

#### Sub-problems:
1. **Exercise 2a ($CU$):** Create a circuit ($U$) controlled by a single-qubit register `control` acting on a 2-qubit register `target`:
   $$
   \begin{aligned}
   U|00\rangle &= |01\rangle \\
   U|01\rangle &= |10\rangle \\
   U|10\rangle &= |11\rangle \\
   U|11\rangle &= |00\rangle
   \end{aligned}
   $$
   Assign the resulting circuit to `cu`.

2. **Exercise 2b ($CU^2$):** Create a controlled circuit ($U^2$) performing:
   $$
   \begin{aligned}
   U^2|00\rangle &= |10\rangle \\
   U^2|01\rangle &= |11\rangle \\
   U^2|10\rangle &= |00\rangle \\
   U^2|11\rangle &= |01\rangle
   \end{aligned}
   $$
   Assign the resulting circuit to `cu2`.

3. **Exercise 2c ($CU^4$):** Create a controlled circuit ($U^4$) performing:
   $$
   \begin{aligned}
   U^4|00\rangle &= |00\rangle \\
   U^4|01\rangle &= |01\rangle \\
   U^4|10\rangle &= |10\rangle \\
   U^4|11\rangle &= |11\rangle
   \end{aligned}
   $$
   Assign the resulting circuit to `cu4`.

4. **Exercise 2 Final ($CU_x$):** Combine the controlled operators into the full modular exponentiation cascade:
   $$
   CU_{c_0 t} CU^2_{c_1 t} CU^4_{c_2 t}
   $$
   where $c_0, c_1, c_2$ are the three qubits in the `control` register, and $t = (t_0, t_1)$ is the `target` register.

#### Constraints
* Total qubits: 5 ($c_0, c_1, c_2$ — counting register, $t_0, t_1$ — target register).
* Allowed gates: only CNOT (`cx`) and single-qubit arbitrary unitary gates (`u`).
* Optimization goal: minimize the total count of `cx` gates in `cux`.
* Endianness: Little-endian (Qiskit default).

#### Hints
* $U^4 = I$, hence $CU^4$ requires 0 gates.
* $U^2$ is simply a bit-flip on the high-order target bit: $q_1 \to q_1 \oplus 1$ (controlled by $c_1 \implies CX(c_1, t_1)$).
* $U$ is a cyclic increment mod 4: $q_0 \to q_0 \oplus 1$, $q_1 \to q_1 \oplus q_0$. Controlled by $c_0 \implies CCX(c_0, t_0, t_1)$ followed by $CX(c_0, t_0)$.
* Further CNOT cancellation can be achieved through joint unitary synthesis of the composite 5-qubit cascade.

---

## 3. Анализ проверяющей системы (Auto-Judge)
* **Принцип проверки:** Проверяющая библиотека `qc-grader` выполняет поэтапную и сквозную валидацию:
  1. *Поэтапная валидация (`grade_ex2a`, `grade_ex2b`, `grade_ex2c`):* Проверяется унитарный оператор `Operator(cu)` размера $8 \times 8$ ($2^3$ для 1 контрольного и 2 целевых кубитов). Контролируемый блок обязан действовать как $I \otimes |0\rangle\langle 0| + U^k \otimes |1\rangle\langle 1|$. Сравнение производится с целевой унитарной матрицей с точностью до глобальной фазы.
  2. *Финальная валидация (`grade_ex2_final`):* Проверяется 5-кубитный оператор `Operator(cux)` размера $32 \times 32$. Выполняется транспиляция в базис `['u', 'cx']` и извлекается количество двухкубитных гейтов `count_ops()['cx']`.
  3. *QPE End-to-End Simulation:* Схема `cux` подключается к регистру в состоянии $|+\rangle^{\otimes 3} \otimes |00\rangle$ с последующим выполнением $\text{QFT}_3^\dagger$. Проверяется получение пиков вероятностей для состояний $\{0, 2, 4, 6\}$ (что дает фазы $\phi \in \{0, 1/4, 2/4, 3/4\}$, определяющие период $r=4$).
* **Каверзные случаи:**
  - *Контролируемость (Controlled Operation):* Ошибочная реализация безусловного оператора $U$ вместо контролируемого приведет к провалу QPE, так как запутывание между счетным и целевым регистром не возникнет.
  - *Относительная фаза в разложении Toffoli:* Использование упрощенных гейтов Тоффоли с относительной фазой (Margolus gate / relative-phase Toffoli) недопустимо без фазовой коррекции, поскольку паразитная фаза перетекает в управляющий кубит $c_0$ и искажает интерференцию в QFT.
  - *Порядок следования контрольных кубитов:* $c_0$ управляет $U^{2^0}=U$, $c_1$ управляет $U^{2^1}=U^2$, $c_2$ управляет $U^{2^2}=U^4$. Перестановка контрольных линий приведет к некорректным пикам фазовой оценки.
* **Оценка числа тестов:** 4 модульных теста (по одному на `cu`, `cu2`, `cu4` и финальный `cux` + симуляция QPE).
* **Асимптотика и быстродействие:** Размерность унитарных матриц $8 \times 8$ и $32 \times 32$. Время полной проверки операторов и симуляции Statevector/QPE составляет $< 50$ мс, потребление памяти $< 2$ МБ.
* **Полная проверка без шотов и перебор:**
  - *Проверка без шотов:* **Да, 100%**. Аналитическая проверка через прямое сравнение `Operator(cux)` и точечный `Statevector` без стохастического шума измерений.
  - *Решаемость перебором:* **Уязвима (малая размерность)**. Для 5-кубитной схемы с бюджетом в 2–4 CNOT пространство поиска топологий гейтов составляет $\le 10^6$ вариантов, что позволяет найти оптимальную схему автоматическим поиском/синтезом унитарных матриц (Q-search, SMT/SAT-синтез).

---

## 4. Оценка ресурсов и применимость в GUI
* **Примерное число гейтов:**
  - `cu`: 1 CCX + 1 CX ($\sim 4$–$7$ CNOT в базовом разложении).
  - `cu2`: 1 CX.
  - `cu4`: 0 гейтов.
  - Оптимизированный `cux`: 2–4 CNOT, 4–8 однокубитных $U$-гейтов, глубина $\sim 4$–$8$.
  - Полная схема Шора (с $\text{QFT}_3^\dagger$ и барьерами): $\sim 5$–$7$ CNOT, глубина $\sim 12$–$18$.
* **Решаемость в визуальном конструкторе:** `ДА (100%)`. Схема является полностью статичной, имеет фиксированный размер (5 кубитов) и не содержит циклов или параметрических условий. Может быть целиком собрана перетаскиванием вентилей в GUI-редакторе.
* **Теги:** `[VISUAL_GUI_READY]`, `[SHOR_ALGORITHM]`, `[MODULAR_EXPONENTIATION]`, `[PHASE_ESTIMATION]`, `[GATE_OPTIMIZATION]`, `[BRUTE_FORCE_VULNERABLE]`.
