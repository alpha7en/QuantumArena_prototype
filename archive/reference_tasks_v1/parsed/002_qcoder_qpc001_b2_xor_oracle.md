# B2: XOR Oracle

## 1. Классификация и метаданные
* **ID задачи:** `qcoder_qpc001_b2`
* **Источник:** https://www.qcoder.jp/en/contests/QPC001/problems/B2
* **Платформа:** QCoder (QPC001)
* **Общее описание:** Построить параметризованную квантовую схему-оракул для вычисления XOR (бита четности) от $n$ входных кубитов в целевой кубит ($|y \oplus x_1 \oplus \dots \oplus x_n\rangle$).
* **Результат решения:** `ПАРАМЕТРИЗОВАННЫЙ ГЕНЕРАТОР СХЕМЫ`
* **Формат ответа:**
  ```python
  from qiskit import QuantumCircuit, QuantumRegister

  def solve(n: int) -> QuantumCircuit:
      x, y = QuantumRegister(n), QuantumRegister(1)
      qc = QuantumCircuit(x, y)
      # Write your code here:
      return qc
  ```
* **Число кубитов:** $n + 1$ ($n$ входных кубитов в регистре $x$, $1$ целевой кубит в регистре $y$, анциллы не требуются; $1 \le n \le 10$, итого от 2 до 11 кубитов).
* **Сложность:** Score 200, Time Limit 3 seconds, Memory Limit 512 MiB.

---

## 2. Условие задачи (Problem Statement)

### B2: XOR Oracle
* **Time Limit:** 3 seconds
* **Memory Limit:** 512 MiB
* **Score:** 200 points

#### Problem Statement
You are given an integer $n$. Implement the oracle $O$ on a quantum circuit `qc` consisting of $n+1$ qubits, and acting on the computational basis states as
$$|\psi\rangle = |x\rangle|y\rangle \xrightarrow{O} |x\rangle|y \oplus x_1 \oplus x_2 \oplus \dots \oplus x_n\rangle.$$
$|x\rangle = |x_1,\dots,x_n\rangle$ denotes the first $n$ qubits of the circuit and $|y\rangle$ denotes the last one.

#### Constraints
* $1 \le n \le 10$
* [Global phase](https://www.qcoder.jp/en/qa#global) is ignored in judge.
* The submitted code must follow the specified format:
```python
from qiskit import QuantumCircuit, QuantumRegister

def solve(n: int) -> QuantumCircuit:
    x, y = QuantumRegister(n), QuantumRegister(1)
    qc = QuantumCircuit(x, y)
    # Write your code here:
    return qc
```

#### Sample Input
$$|\psi\rangle = \frac{1}{\sqrt{2}} (|101\rangle + |010\rangle) \xrightarrow{O} \frac{1}{\sqrt{2}} (|100\rangle + |011\rangle)$$

#### Hints
Open

---

## 3. Анализ проверяющей системы (Auto-Judge)
* **Принцип проверки:** Судья вызывает функцию `solve(n)` для диапазона значений $n \in [1, 10]$, валидирует размерность регистров полученного `QuantumCircuit(n+1)` и симулирует действие схемы на вычислительных базисах и суперпозициях (или проверяет унитарный оператор `Operator(qc)`), сопоставляя результат с эталонным XOR-преобразованием с точностью до глобальной фазы.
* **Каверзные случаи:**
  - *Суперпозиции и запутанность:* Проверка сохранения фазовой когерентности входного регистра $x$ и отсутствия промежуточных измерений.
  - *Порядок кубитов (Endianness):* Корректная адресация элементов регистра $x = [x_0, \dots, x_{n-1}]$ и целевого кубита $y$.
  - *Граничные случаи:* Минимальный размер $n=1$ (вырожденный случай, эквивалентный задаче B1) и максимальный $n=10$.
* **Оценка числа тестов:** ~10–20 тестовых прогонов (все значения $n \in [1, 10]$ с проверкой на различных базисных и суперпозиционных состояниях).
* **Асимптотика и быстродействие:**
  - Размерность пространства состояний: $2^{n+1} \le 2^{11} = 2048$ амплитуд.
  - Симуляция вектора состояния $O(2^{n+1})$ требует < 1 МБ оперативной памяти при $n=10$.
  - Суммарное время валидации всех тестов на сервере: $\sim 50$–$200$ мс (существенно ниже лимита в 3.0 с).
* **Полная проверка без шотов и перебор:**
  - *Проверка без шотов:* **Да, 100%**. При $n \le 10$ матрица преобразования и вектор состояния вычисляются точно без привлечения квантового шума и шотов.
  - *Решаемость перебором:* **Защищена от перебора (Brute-Force Protected)**. Для произвольного $n \in [1, 10]$ решение требует алгоритмического генератора (цикла по входному регистру). Случайный перебор фиксированных схем не масштабируется на весь диапазон $n$.

---

## 4. Оценка ресурсов и применимость в GUI
* **Примерное число гейтов:** $n$ двухкубитных гейтов (`CX` с каждого $x_i$ на $y$), 0 однокубитных гейтов, глубина $n$.
* **Решаемость в визуальном конструкторе:** `ЧАСТИЧНО` — для любого конкретного фиксированного значения $n$ (например, $n=3$) схема тривиально собирается в GUI (каскад CNOT на кубит $y$). Однако интерфейс задачи требует параметризованной функции-генератора `solve(n)`, что требует поддержки программного кода или мета-блоков в конструкторе.
* **Теги:** `[PARAMETRIC_CODE_ONLY]`, `[VISUAL_PARTIAL]`, `[ORACLE_BOOLEAN]`, `[BRUTE_FORCE_PROTECTED]`.
