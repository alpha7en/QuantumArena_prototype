# B6: Quantum Arithmetic II

## 1. Классификация и метаданные
* **ID задачи:** `qcoder_qpc002_b6`
* **Источник:** https://www.qcoder.jp/en/contests/QPC002/problems/B6
* **Платформа:** QCoder (QPC002)
* **Общее описание:** Построить параметризованный фазовый квантовый оракул для модулярной линейной комбинации битов $f(x) = \sum_{i=0}^{n-1} S_i x_i \pmod m$ на $n$ кубитах.
* **Результат решения:** `ПАРАМЕТРИЗОВАННЫЙ ГЕНЕРАТОР СХЕМЫ`
* **Формат ответа:**
  ```python
  from qiskit import QuantumCircuit

  def solve(n: int, m: int, S: list[int]) -> QuantumCircuit:
      qc = QuantumCircuit(n)
      # Write your code here:
      return qc
  ```
* **Число кубитов:** $n$ кубитов ($1 \le n \le 10$, регистр данных $|x\rangle_n$, 0 анцилл).
* **Сложность:** Score 200, Time Limit 3s, Memory Limit 512 MiB.

---

## 2. Условие задачи (Problem Statement)

### B6: Quantum Arithmetic II
* **Time Limit:** 3 seconds
* **Memory Limit:** 512 MiB
* **Score:** 200 points

#### Problem Statement
You are given integers $n, m$, and a sequence $S = [S_0, S_1, \dots, S_{n-1}]$.

Define $f(x) = \sum_{i=0}^{n-1} S_i x_i \pmod m$.

Implement the oracle $O$ on a quantum circuit with $n$ qubits acting as:
$$|x\rangle_n \xrightarrow{O} \exp\left(\frac{2\pi i f(x)}{m}\right) |x\rangle_n.$$

#### Constraints
* $1 \le n \le 10$
* $1 \le m \le 10$
* $0 \le S_i < m$
* The circuit depth must not exceed 10.
* Integers are encoded in little-endian.
* [Global phase](https://www.qcoder.jp/en/qa#global) is ignored in judge.
* The submitted code must follow the specified format:
```python
from qiskit import QuantumCircuit

def solve(n: int, m: int, S: list[int]) -> QuantumCircuit:
    qc = QuantumCircuit(n)
    # Write your code here:
    return qc
```

#### Sample Input / Output
* Sample 1: $n = 2, m = 3, S = [1, 2]$. Action: $|x_0 x_1\rangle \mapsto e^{2\pi i (1 \cdot x_0 + 2 \cdot x_1)/3} |x_0 x_1\rangle$.
* Sample 2: $n = 3, m = 5, S = [0, 2, 4]$. Action: $|x_0 x_1 x_2\rangle \mapsto e^{2\pi i (2 \cdot x_1 + 4 \cdot x_2)/5} |x_0 x_1 x_2\rangle$.

#### Hints
Open

---

## 3. Анализ проверяющей системы (Auto-Judge)
* **Принцип проверки:** Судья вызывает `solve(n, m, S)` для набора тестовых конфигураций $(n, m, S)$, валидирует число кубитов ($n$), проверяет ограничение глубины схемы ($\le 10$) и симулирует матрицу оператора / состояние для базисных векторов $|x\rangle$, проверяя совпадение диагональных фазовых множителей $\exp(2\pi i f(x)/m)$ с точностью до глобальной фазы.
* **Оценка числа тестов:** ~15–30 тестовых наборов с вариацией параметров ($n \in [1, 10]$, $m \in [1, 10]$, различные комбинации коэффициентов $S_i$, включая граничные $S_i = 0$, $m = 1$, $n = 10$).
* **Асимптотика и быстродействие:** Сложность симуляции $O(2^n)$ по времени и памяти. При $n \le 10$ размерность вектора состояния не превышает $2^{10} = 1024$ элементов (память < 16 КБ на тест). Полный цикл валидации всех тестов занимает < 100 мс.
* **Полная проверка без шотов и перебор:**
  - *Проверка без шотов:* **Да, 100%**. При $n \le 10$ схема верифицируется аналитически через `Operator(qc)` или `Statevector` без стохастического шума измерений.
  - *Решаемость перебором:* **Низкая (защищена параметризацией)**. Хотя для каждого отдельного кубита требуется лишь 1-кубитный поворот фазы, непрерывный диапазон фазовых углов $\theta_i = 2\pi S_i/m$ и динамическая подача списков $S$ исключают статический перебор дискретных гейтов.

---

## 4. Оценка ресурсов и применимость в GUI
* **Примерное число гейтов:** До $n$ однокубитных фазовых вентилей (`P` / `RZ`), 0 двухкубитных вентилей (`CX`), глубина 1.
* **Решаемость в визуальном конструкторе:** `ЧАСТИЧНО` — конкретный инстанс задачи с фиксированными $n, m, S$ собирается в визуальном редакторе за $n$ параллельных 1-кубитных фазовых гейтов, но общее решение требует программной параметризации под динамический вход $(n, m, S)$.
* **Теги:** `[PARAMETRIC_CODE_ONLY]`, `[ORACLE_PHASE]`, `[PHASE_KICKBACK_FREE]`, `[BRUTE_FORCE_PROTECTED]`.
