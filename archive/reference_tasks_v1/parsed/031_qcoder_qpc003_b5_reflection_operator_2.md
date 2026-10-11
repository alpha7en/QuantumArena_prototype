# B5: Reflection Operator II

## 1. Классификация и метаданные
* **ID задачи:** `qcoder_qpc003_b5`
* **Источник:** https://www.qcoder.jp/en/contests/QPC003/problems/B5
* **Платформа:** QCoder (QPC003)
* **Общее описание:** Построить параметризованный квантовый генератор оператора отражения относительно состояния равномерной суперпозиции (оператор диффузии Гровера $R_s = 2|\psi\rangle\langle\psi| - I$) на $n$ кубитах.
* **Результат решения:** `ПАРАМЕТРИЗОВАННЫЙ ГЕНЕРАТОР СХЕМЫ`
* **Формат ответа:**
  ```python
  from qiskit import QuantumCircuit

  def solve(n: int) -> QuantumCircuit:
      qc = QuantumCircuit(n)
      # Write your code here:
      return qc
  ```
* **Число кубитов:** $n$ кубитов ($2 \le n \le 10$), без анцилл.
* **Сложность:** Score 200, Time Limit 3s, Memory Limit 512 MiB.

---

## 2. Условие задачи (Problem Statement)

### B5: Reflection Operator II
* **Time Limit:** 3 seconds
* **Memory Limit:** 512 MiB
* **Score:** 200 points

#### Problem Statement
You are given an integer $n$.
Implement the operation defined by the following matrix $A$ on a quantum circuit $\mathrm{qc}$ with $n$ qubits:

\begin{equation}
A = 2 \ket{\psi} \bra{\psi} - I \nonumber
\end{equation}

where $I$ denotes the $2^n \times 2^n$ identity matrix and $\ket{\psi}$ is defined by

\begin{equation}
\ket{\psi} = \frac{1}{\sqrt{2^n}} \sum_{i=0}^{2^n-1} \ket{i}. \nonumber
\end{equation}

#### Constraints
* $2 \le n \le 10$
* Integers must be encoded by [little-endian](https://www.qcoder.jp/en/qa#endian).
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
* $n = 2,\ \ket{\psi} = \frac{1}{\sqrt{4}} ( \ket{00} + \ket{10} + \ket{01} + \ket{11})$:
The matrix $A$ is calculated as follows:

\begin{equation}
A = 2 \ket{\psi} \bra{\psi} - I =
\begin{pmatrix}
-0.5 & 0.5 & 0.5 & 0.5\\
0.5 & -0.5 & 0.5 & 0.5\\
0.5 & 0.5 & -0.5 & 0.5\\
0.5 & 0.5 & 0.5 & -0.5
\end{pmatrix} \nonumber
\end{equation}

#### Hints
Open

---

## 3. Анализ проверяющей системы (Auto-Judge)
* **Принцип проверки:** Судья итерируется по набору тестовых значений $n \in [2, 10]$, вызывает функцию `solve(n)`, проверяет размерность возвращаемой схемы `QuantumCircuit(n)`. Затем симулирует унитарный оператор `Operator(qc)` (или действие на тестовые векторы состояния `Statevector`) и сравнивает с целевой матрицей диффузии Гровера $A = 2|\psi\rangle\langle\psi| - I = H^{\otimes n} (2|0\rangle\langle 0| - I) H^{\otimes n}$ с точностью до глобальной фазы ($U_{\text{user}} = e^{i\phi} A$).
* **Каверзные случаи:**
  - *Глобальная фазовая инвариантность:* Реализация через $H^{\otimes n} X^{\otimes n} (MCZ) X^{\otimes n} H^{\otimes n}$ формирует оператор $-(2|\psi\rangle\langle\psi| - I) = I - 2|\psi\rangle\langle\psi|$, отличающийся глобальной фазой $-1 = e^{i\pi}$. Судья игнорирует глобальную фазу, обе реализации принимаются как верные.
  - *Многоконтрольный фазовый сдвиг:* При произвольном $n \in [2, 10]$ инверсия состояния $|0\rangle^{\otimes n}$ требует многоконтрольного вентиля $MCZ$ (или $MCPhase(\pi)$ / обрамления $MCX$ гейтами $H$). Некорректное число или порядок контрольных кубитов нарушает диффузионную симметрию.
  - *Отсутствие паразитных анцилл:* Схема должна оперировать строго на $n$ кубитах без добавления регистров анцилл.
* **Оценка числа тестов:** ~9 тестовых запусков (все $n \in [2, 10]$).
* **Асимптотика и быстродействие:** Сложность симуляции $O(2^n)$ по времени и памяти. При максимальном $n=10$ размерность унитарной матрицы $1024 \times 1024$ ($\approx 16$ МБ). Время валидации одного теста $< 15$ мс, суммарное время проверки всех тестов $< 150$ мс при расходе оперативной памяти $< 50$ МБ.
* **Полная проверка без шотов и перебор:**
  - *Проверка без шотов:* **Да, 100%**. Аналитическая проверка через `Operator(qc)` / `Statevector` без стохастического шума измерений.
  - *Решаемость перебором:* **Защищено от слепого перебора** в общем виде из-за переменного параметра $n \in [2, 10]$. Для малых $n$ ($n=2$) глубина схемы минимальна ($H \to X \to CZ \to X \to H$), но масштабирование до $n=10$ требует применения общей алгоритмической структуры.

---

## 4. Оценка ресурсов и применимость в GUI
* **Примерное число гейтов:**
  - Однокубитные гейты: $2n$ гейтов `H` и $2n$ гейтов `X` (суммарно $4n$ однокубитных вентилей).
  - Многокубитные гейты: 1 многоконтрольный фазовый вентиль ($MCZ$ / $MCPhase(\pi)$ на $n$ кубитах).
  - Глубина схемы: $O(1)$ в базисе с нативным многоконтрольным вентилем, либо $O(n^2)$ / $O(2^n)$ при декомпозиции на $\{CX, U\}$.
* **Решаемость в визуальном конструкторе:** `ЧАСТИЧНО` — для любого конкретного фиксированного $n$ (например, $n=2, 3, 4$) схема тривиально собирается в GUI drag-and-drop редакторе (слои $H$, $X$, $MCZ$, $X$, $H$), однако для общего решения задачи требуется параметрический Python-код с циклами генерации вентилей.
* **Теги:** `[PARAMETRIC_CODE_ONLY]`, `[GROVER_DIFFUSION]`, `[REFLECTION_OPERATOR]`, `[CONTROLLED_GATES]`, `[EXACT_UNITARY]`, `[BRUTE_FORCE_PROTECTED]`.
