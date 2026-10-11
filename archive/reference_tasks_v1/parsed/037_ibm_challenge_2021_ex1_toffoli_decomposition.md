# Exercise 1: Toffoli Gate Decomposition & CX Minimization

## 1. Классификация и метаданные
* **ID задачи:** `ibm_challenge_2021_ex1_toffoli_decomposition`
* **Источник:** https://github.com/qiskit-community/ibm-quantum-challenge-2021/blob/main/content/ex1/ex1.ipynb
* **Платформа:** IBM Quantum Challenge 2021 (5th Anniversary)
* **Общее описание:** Построить точную квантовую декомпозицию трехкубитного вентиля Тоффоли (CCX) с использованием нативного базисного набора вентилей IBM (CX, RZ, SX, X) и минимизацией взвешенной функции стоимости.
* **Результат решения:** `ФИКСИРОВАННАЯ ЧИСТО КВАНТОВАЯ СХЕМА`
* **Формат ответа:**
  ```python
  from qiskit import QuantumCircuit

  def solve() -> QuantumCircuit:
      qc = QuantumCircuit(3)
      # Write your code here:
      return qc
  ```
* **Число кубитов:** 3 кубита (2 control, 1 target), 0 анцилл.
* **Сложность:** Introductory / Basic, Time Limit 10s, Memory Limit 1024 MiB.

---

## 2. Условие задачи (Problem Statement)

### Exercise 1: Toffoli Gate Decomposition & CX Minimization
* **Time Limit:** 10 seconds
* **Memory Limit:** 1024 MiB
* **Score:** 100 points (Cost-based optimization)

#### Problem Statement
In classical computation, functionally complete sets of gates (such as NAND or AND+NOT) allow expressing any binary logic function. The Toffoli gate (Controlled-Controlled-NOT or $CCX$) is a reversible 3-bit logic gate that acts as a reversible AND/NAND gate: if both control bits are in state $|1\rangle$, it applies a bit-flip (Pauli-$X$) to the target bit, leaving it unchanged otherwise:

$$CCX |c_0, c_1, t\rangle = |c_0, c_1, t \oplus (c_0 \land c_1)\rangle$$

In matrix form:
$$CCX = \begin{pmatrix}
1 & 0 & 0 & 0 & 0 & 0 & 0 & 0 \\
0 & 1 & 0 & 0 & 0 & 0 & 0 & 0 \\
0 & 0 & 1 & 0 & 0 & 0 & 0 & 0 \\
0 & 0 & 0 & 1 & 0 & 0 & 0 & 0 \\
0 & 0 & 0 & 0 & 1 & 0 & 0 & 0 \\
0 & 0 & 0 & 0 & 0 & 1 & 0 & 0 \\
0 & 0 & 0 & 0 & 0 & 0 & 0 & 1 \\
0 & 0 & 0 & 0 & 0 & 0 & 1 & 0
\end{pmatrix}$$

Real quantum hardware natively implements only a limited set of physical basis gates. The standard basis gate set for IBM Quantum superconducting systems consists of:
* Two-qubit gate: Controlled-NOT (`cx`)
* Single-qubit gates: Phase rotation (`rz`), Square-root of X (`sx`), Bit-flip (`x`), and Identity (`id`).

Construct a quantum circuit implementing the exact 3-qubit Toffoli gate ($CCX$) using only the native basis gates (`cx`, `rz`, `sx`, `x`), while minimizing the overall execution cost:

$$\text{Cost} = 10 N_{\text{CNOT}} + N_{\text{other}}$$

where $N_{\text{CNOT}}$ is the number of two-qubit `cx` gates, and $N_{\text{other}}$ is the total number of single-qubit basis gates used.

#### Constraints
* The circuit must contain exactly 3 qubits (`QuantumCircuit(3)`).
* Allowed basis gates: `cx`, `rz`, `sx`, `x`, `id`.
* No measurements or classical registers allowed.
* The operator of the circuit must be unitary equivalent to $CCX$ (up to global phase).
* Target cost metric: standard exact decomposition without ancilla requires exactly 6 `cx` gates ($N_{\text{CNOT}} = 6$).

#### Sample Input / Output
For basis inputs $|c_0, c_1, t\rangle$:
* $|0, 0, 0\rangle \to |0, 0, 0\rangle$
* $|1, 0, 0\rangle \to |1, 0, 0\rangle$
* $|0, 1, 0\rangle \to |0, 1, 0\rangle$
* $|1, 1, 0\rangle \to |1, 1, 1\rangle$
* $|1, 1, 1\rangle \to |1, 1, 0\rangle$

#### Hints
* A controlled rotation $U$ can be decomposed into $A, B, C$ single-qubit gates and two `cx` gates such that $ABC = I$ and $AXBXC = U$.
* Double controlled rotations (like $CCX$) can be decomposed using controlled phase shifts (`cp` / `crz`) and `cx` gates, where each controlled phase is further decomposed into single-qubit rotations and `cx`.
* Hadamard gate can be synthesized via $RZ(\pi/2) - SX - RZ(\pi/2)$.
* Standard Barenco decomposition of Toffoli requires 6 CNOTs and 7-9 single-qubit $T$, $T^\dagger$, and $H$ gates (expressed via $RZ(\pm\pi/4)$, $RZ(\pi/2)$, and $SX$).

---

## 3. Анализ проверяющей системы (Auto-Judge)
* **Принцип проверки:** Валидатор (`qc_grader.grade_ex1`) получает `QuantumCircuit(3)`, проверяет список использованных инструкций через `circuit.count_ops()` на принадлежность разрешенному набору $\{\text{cx}, \text{rz}, \text{sx}, \text{x}, \text{id}\}$, вычисляет унитарную матрицу оператора схемы `Operator(qc)` и проверяет ее эквивалентность матрице $CCX$ (`Operator(CCXGate()).equiv(Operator(qc))`) с точностью до глобальной фазы. Дополнительно вычисляется скоринг по формуле $\text{Cost} = 10 N_{\text{CNOT}} + N_{\text{other}}$.
* **Оценка числа тестов:** 1 детерминированная аналитическая проверка унитарного оператора $8 \times 8$ (эквивалентно проверке всех 8 базисных состояний и произвольных суперпозиций).
* **Асимптотика и быстродействие:** Сложность проверки $O(2^3) = O(8)$ по времени и памяти. Размерность унитарной матрицы $8 \times 8$. Время выполнения валидации: $< 5$ мс, потребление памяти $< 1$ МБ.
* **Полная проверка без шотов и перебор:**
  - *Проверка без шотов:* **Да, 100%**. Оператор схемы вычисляется в виде точной матрицы $8 \times 8$ (`Operator(qc)`) без симуляции шума измерений (shot noise).
  - *Решаемость перебором:* **Защищено от слепого перебора**. Полноценная декомпозиция $CCX$ без анцилл требует 6 `cx` и 7–9 однокубитных вентилей (глубина 12–15). Пространство произвольных последовательностей на 3 кубитах при такой глубине превышает $10^{10}$ комбинаций, однако задача допускает аналитический вывод по схеме Баренко (Barenco et al., 1995).

---

## 4. Оценка ресурсов и применимость в GUI
* **Примерное число гейтов:** 6 двухкубитных гейтов `cx`, ~7–9 однокубитных гейтов (`sx`, `rz`), общая глубина схемы: 12–15. Итоговая стоимость: $\text{Cost} \approx 67\dots75$.
* **Решаемость в визуальном конструкторе:** `ДА (100%)` — схема статическая, строго 3 кубита, не содержит динамических параметров и циклов. Может быть полностью собрана в визуальном drag-and-drop редакторе схем (IBM Quantum Composer / QuantumArena Canvas).
* **Теги:** `[VISUAL_GUI_READY]`, `[PURE_CIRCUIT]`, `[GATE_DECOMPOSITION]`, `[COST_OPTIMIZATION]`, `[EXACT_UNITARY]`, `[BRUTE_FORCE_PROTECTED]`.
