# Ex1: Convert Bit-Flip into Phase-Flip II

## 1. Классификация и метаданные
* **ID задачи:** `qcoder_qpc003_ex1`
* **Источник:** https://www.qcoder.jp/en/contests/QPC003/problems/Ex1
* **Платформа:** QCoder (QPC003)
* **Общее описание:** Преобразовать булев (bit-flip) квантовый оракул в фазовый (phase-flip) оракул с использованием фазового отката (phase kickback) и обязательным восстановлением анциллы в состояние $|0\rangle$ при ограничении максимум на 1 применение оракула.
* **Результат решения:** `ОРАКУЛЬНЫЙ АЛГОРИТМ`
* **Формат ответа:**
  ```python
  from qiskit import QuantumCircuit, QuantumRegister

  """
  You can apply oracle as follows:
  qc.compose(o, inplace=True)
  """

  def solve(n: int, o: QuantumCircuit) -> QuantumCircuit:
      x, y = QuantumRegister(n), QuantumRegister(1)
      qc = QuantumCircuit(x, y)
      # Write your code here:
      return qc
  ```
* **Число кубитов:** $n+1$ кубитов ($1 \le n \le 10$): рабочий регистр $x$ из $n$ кубитов и 1 анцилла $y$.
* **Сложность:** Score 300, Time Limit 3s, Memory Limit 512 MiB.

---

## 2. Условие задачи (Problem Statement)

### Ex1: Convert Bit-Flip into Phase-Flip II
* **Time Limit:** 3 seconds
* **Memory Limit:** 512 MiB
* **Score:** 300 points

#### Problem Statement
You are given an integer $n$ and an oracle $O$.
For any pair of integers $(x,y)$ satisfying $0\leq x\lt 2^n$ and $0\leq y\lt 2$, the oracle $O$ satisfies
$$\ket{x}_n \ket{y}_1 \xrightarrow{O} \ket{x}_n \ket{y \oplus f(x)}_1,$$
where $\oplus$ denotes the XOR operator, and $f(x)$ is a function that returns either $0$ or $1$ for any integer $x$ with $0\leq x\lt 2^n$.

Implement an operation on a quantum circuit $\mathrm{qc}$ that satisfies
\begin{equation}
\ket{x}_n\ket{0}_1 \xrightarrow{\mathrm{qc}}
\begin{cases}
- \ket{x}_n\ket{0}_1 & (f(x) = 1) \\
\ket{x}_n\ket{0}_1 & (f(x) = 0)
\end{cases} \nonumber
\end{equation}
for any integer $x$ satisfying $0\leq x\lt 2^n$.

#### Constraints
* $1 \le n \le 10$
* **The number of applied oracle must not exceed 1.** (If exceeded, a DLE (depth limit exceeded) error will be displayed)
* Integers must be encoded by [little-endian](https://www.qcoder.jp/en/qa#endian).
* [Global phase](https://www.qcoder.jp/en/qa#global) is ignored in judge.
* The submitted code must follow the specified format:
```python
from qiskit import QuantumCircuit, QuantumRegister

"""
You can apply oracle as follows:
qc.compose(o, inplace=True)
"""

def solve(n: int, o: QuantumCircuit) -> QuantumCircuit:
    x, y = QuantumRegister(n), QuantumRegister(1)
    qc = QuantumCircuit(x, y)
    # Write your code here:

    return qc
```

#### Sample Input
* $n = 2,\ (f(00), f(10), f(01), f(11)) = (0, 1, 0, 1)$:
Implemented circuit $\mathrm{qc}$ should perform the following transformation.
$$\frac{1}{\sqrt{4}} ( \ket{00}+\ket{10}+\ket{01}+\ket{11} )\ket{0} \xrightarrow{\mathrm{qc}} \frac{1}{\sqrt{4}} (\ket{00} - \ket{10} + \ket{01} - \ket{11})\ket{0}$$

#### Hints
* Aside from the constraint on the number of applied oracles, this is the same problem as Problem B2.

---

## 3. Анализ проверяющей системы (Auto-Judge)
* **Принцип проверки:** Судья формирует набор тестовых оракулов $O$ для различных булевых функций $f(x)$ (константные, одноточечные, сбалансированные) при $n \in [1, 10]$. Для каждого теста вызывается `solve(n, o)`. Проверяется статическое ограничение: число включений подблока `o` в `qc` не превышает 1 (при нарушении — DLE). Затем на симуляторе вычисляется матрица оператора `Operator(qc)` или итоговый вектор состояния `Statevector` для базисных и суперпозиционных состояний. Сравнивается соответствие результирующего оператора целевому диагональному фазовому оператору $O_Z \otimes |0\rangle\langle 0|$ с факторизацией и полным uncomputation анциллы $|y\rangle = |0\rangle$ с точностью до глобальной фазы.
* **Оценка числа тестов:** ~15–20 тестовых наборов с $n \in [1, 10]$ и разнообразными сигнатурами $f(x)$.
* **Асимптотика и быстродействие:** Сложность симуляции $O(2^{n+1})$ по времени и памяти. При $n=10$ общее число кубитов равно 11, размерность вектора состояния $2^{11} = 2048$. Время валидации одного теста $< 20$ мс, суммарное время проверки $< 300$ мс при потреблении памяти $< 64$ МБ.
* **Полная проверка без шотов и перебор:**
  - *Проверка без шотов:* **Да, 100%**. Аналитическая проверка через `Operator` / `Statevector` симуляцию без стохастического шума измерений.
  - *Решаемость перебором:* **Защищено от перебора**. Оракул $O$ подается как черный ящик (QuantumCircuit), поэтому сгенерировать фазовый сдвиг прямым синтезом вентилей без вызова оракула невозможно. Сама обертка над анциллой является канонической конструкцией фазового отката (phase kickback) из 4 однокубитных гейтов ($X, H$ до оракула и $H, X$ после).

---

## 4. Оценка ресурсов и применимость в GUI
* **Примерное число гейтов:**
  - Однокубитные гейты: 4 вентиля на анцилле ($X, H$ для перевода $|0\rangle \to |-\rangle$ перед вызовом оракула и $H, X$ для возврата $|-\rangle \to |0\rangle$ после вызова).
  - Двухкубитные / многокубитные гейты: 0 дополнительных (только внутренние гейты оракула $o$).
  - Число вызовов оракула: ровно 1.
  - Дополнительная глубина схемы: 4 (или 2 при слиянии однокубитных поворотов).
* **Решаемость в визуальном конструкторе:** `ДА (100%)` — схема обрамления анциллы полностью статична и не зависит от $n$ или функции $f(x)$: на анциллу $y$ последовательно ставятся $X$ и $H$, затем подключается блок оракула $o$, после чего на анциллу накладываются $H$ и $X$. В GUI-редакторе с поддержкой вставки подблоков собирается в несколько кликов.
* **Теги:** `[VISUAL_GUI_READY]`, `[ORACLE_PHASE]`, `[ORACLE_BOOLEAN]`, `[PHASE_KICKBACK]`, `[EXACT_UNITARY]`, `[BRUTE_FORCE_PROTECTED]`.
