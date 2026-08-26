# C1: Generate Uniform Amplitude Superposition State I

## 1. Классификация и метаданные
* **ID задачи:** `qcoder_qpc001_c1`
* **Источник:** https://www.qcoder.jp/en/contests/QPC001/problems/C1
* **Платформа:** QCoder (QPC001)
* **Общее описание:** Сгенерировать параметризованную квантовую схему для приготовления состояния с равномерными амплитудами на первых $L$ базисных состояниях ($|0\rangle, \dots, |L-1\rangle$) на $n$ кубитах с суммарной вероятностью $> 0.5$.
* **Результат решения:** `ПАРАМЕТРИЗОВАННЫЙ ГЕНЕРАТОР СХЕМЫ`
* **Формат ответа:**
  ```python
  from qiskit import QuantumCircuit

  def solve(n: int, L: int) -> QuantumCircuit:
      qc = QuantumCircuit(n)
      # Write your code here:
      return qc
  ```
* **Число кубитов:** $n$ ($1 \le n \le 10$, анциллы не требуются).
* **Сложность:** Score 300, Time Limit 3s, Memory Limit 512 MiB.

---

## 2. Условие задачи (Problem Statement)

### C1: Generate Uniform Amplitude Superposition State I
* **Time Limit:** 3 seconds
* **Memory Limit:** 512 MiB
* **Score:** 300 points

#### Problem Statement
You are given integers $n$ and $L$. Implement the operation of preparing the state $|\psi\rangle$ on a quantum circuit `qc` with $n$ qubits such that the states $|0\rangle, |1\rangle, \dots, |L-1\rangle$ are observed with equal probabilities, and the sum of these probabilities exceeds $0.5$.

**More Precise Problem Statement:**
Define the state $|\psi\rangle$ prepared by `qc` as:
$$|\psi\rangle = \sum_{i=0}^{2^n-1} a_i |i\rangle,$$
where $a_i$ denotes the probability amplitude of the computational basis state $|i\rangle$.

Implement `qc` satisfying following conditions:
* $|a_0| = |a_1| = \dots = |a_{L-1}|$
* $\sum_{i=0}^{L-1} |a_i|^2 > 0.5$

#### Constraints
* $1 \le n \le 10$
* $1 \le L \le 2^n$
* Integers must be encoded by little-endian.
* The submitted code must follow the specified format:
```python
from qiskit import QuantumCircuit

def solve(n: int, L: int) -> QuantumCircuit:
    qc = QuantumCircuit(n)
    # Write your code here:
    return qc
```

#### Sample Input
$n=3, L=3$:
$$|000\rangle \xrightarrow{qc} \frac{1}{\sqrt{3}} (|000\rangle + |100\rangle + |010\rangle) = \frac{1}{\sqrt{3}} (|0\rangle + |1\rangle + |2\rangle)$$

#### Hints
Open

---

## 3. Анализ проверяющей системы (Auto-Judge)
* **Принцип проверки:** Судья вызывает функцию `solve(n, L)` для тестового набора параметров $(n, L)$, применяет сгенерированную схему `qc` к начальному состоянию $|0\rangle^{\otimes n}$ и вычисляет `Statevector(qc)`. Проверяется выполнение двух условий: равенство модулей амплитуд $|a_0| \approx |a_1| \approx \dots \approx |a_{L-1}|$ с численной точностью ($\epsilon \approx 10^{-5}$) и суммарная вероятность $\sum_{i=0}^{L-1} |a_i|^2 > 0.5$.
* **Оценка числа тестов:** ~20–50 тестовых конфигураций (граничные случаи $L=1$, $L=2^n$, $n=1$, $n=10$; степени двойки $L=2^k$; нетривиальные значения $L=3, 5, 7, 2^n-1$).
* **Асимптотика и быстродействие:** Сложность симуляции для одного теста: $O(2^n)$ по времени и памяти. При максимальном $n=10$ размерность вектора составляет $2^{10} = 1024$ амплитуд ($\approx 16$ КБ). Суммарное время валидации всех тестов на сервере: $< 100$ мс (при лимите 3.0 с).
* **Полная проверка без шотов и перебор:**
  - *Проверка без шотов:* **Да, 100%**. Аналитическая проверка через `Statevector` без shot noise детерминированно валидирует амплитуды за доли миллисекунды.
  - *Решаемость перебором:* **Нет (защищена)**. Пространство параметров динамическое ($n \le 10, L \le 2^n$), генерация состояния требует вычисления непрерывных углов вращений ($R_y(\theta)$) и адаптивной структуры схемы; перебор дискретных гейтов неприменим ($|G|^D \gg 10^{15}$).

---

## 4. Оценка ресурсов и применимость в GUI
* **Примерное число гейтов:** Для $L=2^k$ — $k$ гейтов $H$; для произвольного $L$ — $O(n)$–$O(n^2)$ 1Q/2Q гейтов (контролируемые $R_y$, CNOT, бинарное дерево распределения амплитуд). Глубина схемы: $O(n)$–$O(n^2)$.
* **Решаемость в визуальном конструкторе:** `НЕТ (ТОЛЬКО КОД)` — требуется параметрический алгоритм на Python для синтеза схемы под произвольные $n$ и $L$; статическая drag-and-drop схема не способна адаптироваться под входные аргументы.
* **Теги:** `[PARAMETRIC_CODE_ONLY]`, `[STATE_PREPARATION]`, `[SUPERPOSITION]`, `[BRUTE_FORCE_PROTECTED]`.
