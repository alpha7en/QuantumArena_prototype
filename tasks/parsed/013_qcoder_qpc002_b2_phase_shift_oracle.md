# B2: Phase Shift Oracle

## 1. Классификация и метаданные
* **ID задачи:** `qcoder_qpc002_b2`
* **Источник:** https://www.qcoder.jp/en/contests/QPC002/problems/B2
* **Платформа:** QCoder (QPC002)
* **Общее описание:** Построить параметризованный генератор фазового квантового оракула, добавляющего фазовый сдвиг $e^{i\theta}$ ровно к одному целевому базисному состоянию $|L\rangle$ на $n$ кубитах.
* **Результат решения:** `ПАРАМЕТРИЗОВАННЫЙ ГЕНЕРАТОР СХЕМЫ`
* **Формат ответа:**
  ```python
  from qiskit import QuantumCircuit

  def solve(n: int, L: int, theta: float) -> QuantumCircuit:
      qc = QuantumCircuit(n)
      # Write your code here:
      return qc
  ```
* **Число кубитов:** $n$ кубитов ($1 \le n \le 10$), без анцилл.
* **Сложность:** Score 200, Time Limit 3s, Memory Limit 512 MiB.

---

## 2. Условие задачи (Problem Statement)

### B2: Phase Shift Oracle
* **Time Limit:** 3 seconds
* **Memory Limit:** 512 MiB
* **Score:** 200 points

#### Problem Statement
You are given integers $n,\ L$, and a real number $\theta$.
Implement the oracle $O$ on a quantum circuit $\mathrm{qc}$ with $n$ qubits acting on computational basis states as

\begin{equation}
\ket{y}_n \xrightarrow{O} 
\begin{cases}
e^{i\theta} \ket{y}_n & y = L \\
\phantom{e^{i\theta}} \ket{y}_n & y \neq L
\end{cases} \nonumber
\end{equation}

for any integer $y$ such that $0 \le y < 2^n$.

#### Constraints
* $1 \le n \le 10$
* $0 \le L < 2^n$
* $0 \le \theta < 2\pi$
* Integers must be encoded by [little-endian](https://www.qcoder.jp/en/qa#endian).
* [Global phase](https://www.qcoder.jp/en/qa#global) is ignored in judge.
* The submitted code must follow the specified format:
```python
from qiskit import QuantumCircuit

def solve(n: int, L: int, theta: float) -> QuantumCircuit:
    qc = QuantumCircuit(n)
    # Write your code here:
    return qc
```

#### Sample Input
* $n = 2,\ L = 1,\ \theta = \pi/2$:
Implemented circuit $\mathrm{qc}$ should perform the following transformation:
$$\frac{1}{\sqrt{4}} (\ket{00} + \ket{10} + \ket{01} + \ket{11}) \xrightarrow{\mathrm{qc}} \frac{1}{\sqrt{4}} (\ket{00} + i\ket{10} + \ket{01} + \ket{11})$$

#### Hints
Open

---

## 3. Анализ проверяющей системы (Auto-Judge)
* **Принцип проверки:** Судья итерируется по набору тестовых троек $(n, L, \theta)$, вызывает `solve(n, L, theta)`, проверяет корректность размерности `QuantumCircuit(n)`. Затем выполняет точную бессеточную симуляцию оператора схемы `Operator(qc)` или вектора состояния `Statevector`, сравнивая результирующую унитарную диагональную операцию с целевым преобразованием (умножение амплитуды базисного состояния $|L\rangle$ на фазовый множитель $e^{i\theta}$) с инвариантностью к общей глобальной фазе.
* **Оценка числа тестов:** ~15–25 тестовых наборов, включающих граничные значения ($n=1, n=2, n=10$), крайние и произвольные битовые маски $L \in \{0, 2^n-1, \dots\}$, а также контрольные углы $\theta \in \{0, \pi/2, \pi, 3\pi/2\}$ и произвольные вещественные фазы.
* **Асимптотика и быстродействие:** Сложность симуляции $O(2^n)$ по времени и памяти. При максимальном $n=10$ размерность пространства $2^{10} = 1024$ (матрица оператора $1024 \times 1024 \approx 16$ МБ). Валидация одного теста занимает $< 15$ мс, суммарное время проверки всех тестов $< 250$ мс при потреблении памяти $< 50$ МБ.
* **Полная проверка без шотов и перебор:**
  - *Проверка без шотов:* **Да, 100%**. При $n \le 10$ проверка осуществляется аналитически через `Operator` / `Statevector` симуляцию без стохастического шума измерений.
  - *Решаемость перебором:* **Защищено от слепого перебора** в общем виде из-за непрерывного параметра $\theta \in [0, 2\pi)$ и переменного параметра $n \in [1, 10]$. Для фиксированного набора $(n, L, \theta)$ структура однозначна: побитовое $X$-обрамление кубитов с нулями в $L$, многоконтрольный фазовый гейт $MCPhase(\theta)$ и обратное $X$-обрамление.

---

## 4. Оценка ресурсов и применимость в GUI
* **Примерное число гейтов:**
  - Однокубитные гейты: от $0$ до $2n$ гейтов `X` (по 2 гейта на каждый нулевой бит в двоичном представлении $L$).
  - Фазовые / многокубитные гейты: 1 вентиль `P(theta)` / `PhaseGate(theta)` при $n=1$ или многоконтрольный `mcp(theta, ...)` / $MCPhase(\theta)$ с $n-1$ управляющими кубитами при $n > 1$.
  - Глубина схемы: $O(1)$ в базисе с нативным многоконтрольным фазовым вентилем, либо $O(2^n)$ / $O(n^2)$ при декомпозиции на $\{CX, U\}$.
* **Решаемость в визуальном конструкторе:** `ЧАСТИЧНО` — для любого конкретного фиксированного набора параметров $(n, L, \theta)$ схема тривиально собирается в GUI drag-and-drop редакторе (наложение $X$ на нулевые биты, многоконтрольный $P(\theta)$, снятие $X$), однако для полного решения задачи требуется параметрический Python-код с побитовым разбором числа $L$.
* **Теги:** `[PARAMETRIC_CODE_ONLY]`, `[ORACLE_PHASE]`, `[CONTROLLED_PHASE]`, `[EXACT_UNITARY]`, `[BRUTE_FORCE_PROTECTED]`.
