# B5: Quantum Arithmetic I

## 1. Классификация и метаданные
* **ID задачи:** `qcoder_qpc002_b5`
* **Источник:** https://www.qcoder.jp/en/contests/QPC002/problems/B5
* **Платформа:** QCoder (QPC002)
* **Общее описание:** Построить параметризованную квантовую схему-оракул для контролируемого модульного сложения $\sum_{i=0}^{n-1} S_i x_i \pmod m$ в целевой регистр $|y\rangle$.
* **Результат решения:** `ПАРАМЕТРИЗОВАННЫЙ ГЕНЕРАТОР СХЕМЫ`
* **Формат ответа:**
  ```python
  from qiskit import QuantumCircuit, QuantumRegister

  def solve(n: int, m: int, S: list[int]) -> QuantumCircuit:
      x, y = QuantumRegister(n), QuantumRegister(m)
      qc = QuantumCircuit(x, y)
      # Write your code here:
      return qc
  ```
* **Число кубитов:** $n+m$ кубитов ($1 \le n \le 10$, $1 \le m \le 5$, суммарно $2 \le N \le 15$; $n$ входных кубитов регистра $x$, $m$ целевых кубитов регистра $y$, без дополнительных анцилл).
* **Сложность:** Score 200, Time Limit 3s, Memory Limit 512 MiB.

---

## 2. Условие задачи (Problem Statement)

### B5: Quantum Arithmetic I
* **Time Limit:** 3 seconds
* **Memory Limit:** 512 MiB
* **Score:** 200 points

#### Problem Statement
You are given integers $n, m$, and a sequence $S = [S_0, S_1, \dots, S_{n-1}]$.
Define $f(x) = \sum_{i=0}^{n-1} S_i x_i \pmod m$ for $x = \sum x_i 2^i$.
Implement the oracle $O$ on a quantum circuit with $n+m$ qubits acting on computational basis states as:
$$|x\rangle_n |y\rangle_m \xrightarrow{O} |x\rangle_n |(y + f(x)) \bmod m\rangle_m.$$

#### Constraints
* $1 \le n \le 10$
* $1 \le m \le 5$
* $0 \le S_i < m$
* The circuit depth must not exceed 200.
* Integers are encoded in little-endian.
* [Global phase](https://www.qcoder.jp/en/qa#global) is ignored in judge.
* The submitted code must follow the specified format:
```python
from qiskit import QuantumCircuit, QuantumRegister

def solve(n: int, m: int, S: list[int]) -> QuantumCircuit:
    x, y = QuantumRegister(n), QuantumRegister(m)
    qc = QuantumCircuit(x, y)
    # Write your code here:
    return qc
```

#### Sample Input / Output
* **Пример ($n=2, m=3, S=[1, 2]$):**
  - $x=0\ (x_0=0, x_1=0) \implies f(0) = 0 \pmod 3 \implies |0\rangle_2 |y\rangle_3 \to |0\rangle_2 |y\rangle_3$
  - $x=1\ (x_0=1, x_1=0) \implies f(1) = 1 \pmod 3 \implies |1\rangle_2 |y\rangle_3 \to |1\rangle_2 |(y+1)\bmod 3\rangle_3$
  - $x=2\ (x_0=0, x_1=1) \implies f(2) = 2 \pmod 3 \implies |2\rangle_2 |y\rangle_3 \to |2\rangle_2 |(y+2)\bmod 3\rangle_3$
  - $x=3\ (x_0=1, x_1=1) \implies f(3) = 3 \equiv 0 \pmod 3 \implies |3\rangle_2 |y\rangle_3 \to |3\rangle_2 |y\rangle_3$

#### Hints
Open

---

## 3. Анализ проверяющей системы (Auto-Judge)
* **Принцип проверки:** Судья вызывает `solve(n, m, S)` для набора тестовых конфигураций, валидирует структуру `QuantumCircuit` (ровно $n+m$ кубитов, отсутствие измерений/сбросов, глубина $\le 200$) и симулирует действие схемы на базисных и суперпозиционных состояниях. Проверяется унитарное преобразование $|x\rangle_n |y\rangle_m \mapsto e^{i\phi} |x\rangle_n |(y + f(x)) \bmod m\rangle_m$ для всех $x \in [0, 2^n-1]$ и $y \in [0, m-1]$ с точностью до единой глобальной фазы.
* **Оценка числа тестов:** ~25–40 тестовых наборов:
  - Граничные модули: $m=1$ (тривиальный тождественный оператор), $m=2$ (XOR mod 2), $m=3, 4, 5$.
  - Граничные размеры: $n=1, n=10$.
  - Крайние значения коэффициентов: $S_i = 0$ (пропуск кубита), $S_i = m-1$.
  - Псевдослучайные наборы $S$ для различных комбинаций $(n, m)$.
  - Суперпозиции на входе для проверки сохранения фазовой когерентности и отсутствия остаточного запутывания.
* **Асимптотика и быстродействие:** Общее число кубитов $N = n + m \le 15$. Сложность симуляции по времени и памяти $O(2^{N})$. Для $N=15$ размер вектора состояния составляет $2^{15} = 32\,768$ элементов ($\approx 512$ КБ). Валидация одной конфигурации занимает $5$–$25$ мс, суммарное время прогона всего тестового набора $< 0.5$ с (с запасом укладывается в Time Limit 3.0s).
* **Полная проверка без шотов и перебор:**
  - *Проверка без шотов:* **Да, 100%**. При $N \le 15$ схема валидируется аналитически через `Statevector` / `Operator` без стохастического шума измерений.
  - *Решаемость перебором:* **Защищена (параметрический генератор)**. Задача требует динамического алгоритма синтеза квантовой схемы для произвольных входных $(n, m, S)$. Размер унитарного пространства $2^{15} \times 2^{15}$ исключает слепой подбор гейтов ($> 10^{100}$ комбинаций).

---

## 4. Оценка ресурсов и применимость в GUI
* **Примерное число гейтов:** Декомпозиция в последовательность из $n$ контролируемых кубитом $x_i$ циклических перестановок $y \mapsto (y + S_i) \bmod m$ на $m$ кубитах требует $\sim 10$–$80$ гейтов (`CX`, `CCX`, `MCX`, `X`), глубина схемы $\sim 15$–$80$ (строго в пределах лимита $\le 200$).
* **Решаемость в визуальном конструкторе:** `НЕТ (ТОЛЬКО КОД)` для общего генератора `solve(n, m, S)` из-за параметрического цикла по вектору $S$ и условий $S_i \ne 0$; `ЧАСТИЧНО` для отдельных фиксированных инстансов с малыми $n, m$ (например, $n=2, m=2$).
* **Теги:** `[PARAMETRIC_CODE_ONLY]`, `[ORACLE_BOOLEAN]`, `[QUANTUM_ARITHMETIC]`, `[MODULAR_ADDITION]`, `[BRUTE_FORCE_PROTECTED]`.
