# B4: Reflection Operator I

## 1. Классификация и метаданные
* **ID задачи:** `qcoder_qpc003_b4`
* **Источник:** https://www.qcoder.jp/en/contests/QPC003/problems/B4
* **Платформа:** QCoder (QPC003)
* **Общее описание:** Построить параметризованный генератор квантового оператора отражения относительно нулевого базисного состояния $R_0 = 2|0\rangle^{\otimes n}\langle 0|^{\otimes n} - I$ на $n$ кубитах (инверсия фазы всех ненулевых состояний).
* **Результат решения:** `ПАРАМЕТРИЗОВАННЫЙ ГЕНЕРАТОР СХЕМЫ`
* **Формат ответа:**
  ```python
  from qiskit import QuantumCircuit

  def solve(n: int) -> QuantumCircuit:
      qc = QuantumCircuit(n)
      # Write your code here:
      return qc
  ```
* **Число кубитов:** $n$ кубитов ($2 \le n \le 10$), без дополнительных анцилл.
* **Сложность:** Score 200, Time Limit 3s, Memory Limit 512 MiB.

---

## 2. Условие задачи (Problem Statement)

### B4: Reflection Operator I
* **Time Limit:** 3 seconds
* **Memory Limit:** 512 MiB
* **Score:** 200 points

#### Problem Statement
You are given an integer $n$.
Implement the operation defined by the following matrix $A$ on a quantum circuit $\mathrm{qc}$ with $n$ qubits:

$$A = 2 \ket{0} \bra{0} - I$$

where $I$ denotes the $2^n \times 2^n$ identity matrix.

#### Constraints
* $2 \le n \le 10$
* [Global phase](https://www.qcoder.jp/en/qa#global) is ignored in judge.
* The submitted code must follow the specified format:
```python
from qiskit import QuantumCircuit

def solve(n: int) -> QuantumCircuit:
    qc = QuantumCircuit(n)
    # Write your code here:
    return qc
```

#### Sample Input
* $n = 2$:
The matrix $A$ is calculated as follows.

$$A = 2 \ket{00} \bra{00} - I =
\begin{pmatrix}
1 & 0 & 0 & 0\\
0 & -1 & 0 & 0\\
0 & 0 & -1 & 0\\
0 & 0 & 0 & -1
\end{pmatrix}$$

#### Hints
Open
* An $n$-qubit quantum state $\ket{\psi}$ can be represented as a column vector of size $2^n$, just like a 1-qubit quantum state, and the adjoint $\bra{\psi}$, inner product $\braket{\phi|\psi}$, and outer product $\ket{\psi}\bra{\phi}$ can also be defined in the same way.
$$\ket{\psi} = a_0\ket{0...0}_n + a_1\ket{10...0}_n + ... + a_{2^n-1}\ket{1...1}_n = \begin{pmatrix} a_0 \\ \vdots \\ a_{2^n - 1} \end{pmatrix}$$
* In the case of $n$ qubits, the identity matrix $I$ can be transformed as follows.
$$I = \ket{0}\bra{0} + \ket{1}\bra{1} + \cdots + \ket{2^n-1}\bra{2^n-1}$$

---

## 3. Анализ проверяющей системы (Auto-Judge)
* **Принцип проверки:** Судья последовательно вызывает `solve(n)` для набора значений $n \in [2, 10]$, получает `QuantumCircuit` и валидирует унитарный оператор схемы размерности $2^n \times 2^n$ (через `Operator(qc)` или `Statevector` симуляцию на базисных состояниях). Проверяется соответствие диагональной матрице $A = \mathrm{diag}(1, -1, -1, \dots, -1)$ с точностью до глобальной фазы (реализация $-A = \mathrm{diag}(-1, 1, 1, \dots, 1) = I - 2|0\rangle\langle 0|$ через $X^{\otimes n} \cdot MCZ \cdot X^{\otimes n}$ полностью эквивалентна и принимается системой).
* **Оценка числа тестов:** ~9 тестов (все допустимые размерности $n \in \{2, 3, 4, 5, 6, 7, 8, 9, 10\}$).
* **Асимптотика и быстродействие:** Сложность симуляции $O(2^n)$ по времени и $O(2^n)$ (или $O(4^n)$ при построении полной унитарной матрицы) по памяти. При максимальном $n=10$ размерность матрицы составляет $1024 \times 1024$ ($\approx 16$ МБ). Валидация одного теста занимает $< 15$ мс, суммарное время проверки всех тестов $< 100$ мс при потреблении памяти $< 60$ МБ.
* **Полная проверка без шотов и перебор:**
  - *Проверка без шотов:* **Да, 100%**. При $n \le 10$ оператор или вектор состояния верифицируются абсолютно точно без применения стохастических измерений (shot noise).
  - *Решаемость перебором:* **Защищена в общем виде (алгоритмическая генерация схемы)**. Для любого фиксированного $n$ структура очевидна ($X^{\otimes n} \to MCZ \to X^{\otimes n}$), однако решение требует параметрической реализации генератора `solve(n)` для произвольного $n \in [2, 10]$.

---

## 4. Оценка ресурсов и применимость в GUI
* **Примерное число гейтов:**
  - Однокубитные гейты: $2n$ гейтов `X` (по одному $X$ на каждый кубит до и после многоконтрольного вентиля) или $2n-2$ гейтов `X` + 2 гейта `H`.
  - Многокубитные гейты: 1 многоконтрольный фазовый/Z вентиль $MCZ$ / $MCPhase(\pi)$ с $n-1$ управляющими кубитами (либо $MCX$ в окружении гейтов Адамара).
  - Глубина схемы: $O(1)$ в базисе с нативным многоконтрольным Z-вентилем, либо $O(n)$ / $O(n^2)$ при декомпозиции на $\{CX, U\}$.
* **Решаемость в визуальном конструкторе:** `ЧАСТИЧНО` — для любого конкретного фиксированного $n$ схема тривиально собирается в GUI drag-and-drop конструкторе ($X^{\otimes n} \to MCZ \to X^{\otimes n}$), однако решение задачи в соревновательном формате требует параметрического Python-генератора.
* **Теги:** `[PARAMETRIC_CODE_ONLY]`, `[ORACLE_PHASE]`, `[GROVER_DIFFUSION]`, `[EXACT_UNITARY]`, `[BRUTE_FORCE_PROTECTED]`.
