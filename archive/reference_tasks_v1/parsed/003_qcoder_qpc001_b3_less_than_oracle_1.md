# B3: Less Than Oracle I

## 1. Классификация и метаданные
* **ID задачи:** `qcoder_qpc001_b3`
* **Источник:** https://www.qcoder.jp/en/contests/QPC001/problems/B3
* **Платформа:** QCoder (QPC001)
* **Общее описание:** Построить параметризованный фазовый оракул на $n$ кубитах, умножающий амплитуды всех базисных состояний $|x\rangle$ при $x < L$ на $-1$ ($|x\rangle \to -|x\rangle$).
* **Результат решения:** `ПАРАМЕТРИЗОВАННЫЙ ГЕНЕРАТОР СХЕМЫ`
* **Формат ответа:**
  ```python
  from qiskit import QuantumCircuit

  def solve(n: int, L: int) -> QuantumCircuit:
      qc = QuantumCircuit(n)
      # Write your code here:
      return qc
  ```
* **Число кубитов:** $n$ кубитов ($1 \le n \le 5$, без дополнительных анцилл).
* **Сложность:** Score 300, Time Limit 3s, Memory Limit 512 MiB.

---

## 2. Условие задачи (Problem Statement)

### B3: Less Than Oracle I
* **Time Limit:** 3 seconds
* **Memory Limit:** 512 MiB
* **Score:** 300 points

#### Problem Statement
You are given integers $n$ and $L$. Implement the oracle $O$ on a quantum circuit `qc` with $n$ qubits, which multiplies all the probability amplitudes $a_i$ of $|0\rangle, |1\rangle, \dots, |L-1\rangle$ by $-1$.

#### Constraints
* $1 \le n \le 5$
* $1 \le L \le 2^n$
* [Global phase](https://www.qcoder.jp/en/qa#global) is ignored in judge.
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
$n=2, L=3$:
$$\frac{1}{4} (|00\rangle + |10\rangle + |01\rangle + |11\rangle) \xrightarrow{O} \frac{1}{4} (-|00\rangle - |10\rangle - |01\rangle + |11\rangle)$$

#### Hints
Open

---

## 3. Анализ проверяющей системы (Auto-Judge)
* **Принцип проверки:** Судья вызывает `solve(n, L)` для набора пар $(n, L)$, получает `QuantumCircuit` и валидирует унитарный оператор $U$ размерности $2^n \times 2^n$ (через `Statevector` или `Operator(qc)`). Проверяется диагональная фазовая структура: для базисных состояний $x < L$ фаза равна $-e^{i\phi}$, а для $x \ge L$ — $+e^{i\phi}$ (с точностью до единой глобальной фазы $e^{i\phi}$ и с учетом порядка битов little-endian).
* **Оценка числа тестов:** ~15–30 тестовых пар $(n, L)$ (граничные значения $n=1, n=5$, $L=1, L=2^n-1, L=2^n$, а также промежуточные случайные значения $L$).
* **Асимптотика и быстродействие:** Сложность симуляции $O(2^n)$ по времени и памяти. При максимальном $n=5$ размерность матрицы $32 \times 32$ (память < 1 КБ), валидация всех тестов занимает < 100 мс на сервере.
* **Полная проверка без шотов и перебор:**
  - *Проверка без шотов:* **Да, 100%**. При $n \le 5$ матрица оператора или результирующий вектор состояния верифицируются абсолютно точно без стохастического шума измерений.
  - *Решаемость перебором:* **Защищена в общем виде (алгоритмическая генерация)**. Для конкретных фиксированных $n, L$ схема может быть подобрана, но решение требует функции-генератора `solve(n, L)`, параметрически строящей схему для произвольных $n \in [1, 5]$ и $L \in [1, 2^n]$.

---

## 4. Оценка ресурсов и применимость в GUI
* **Примерное число гейтов:** В зависимости от подхода (декомпозиция префиксов битовых масок через $MCZ$/$MCX$ или синтез диагонального оператора): от 1 до $\sim 20$ многоконтрольных вентилей, глубина схемы $\sim 5$–$40$.
* **Решаемость в визуальном конструкторе:** `НЕТ (ТОЛЬКО КОД)` для общего генератора `solve(n, L)` / `ЧАСТИЧНО` для отдельных фиксированных инстансов $(n, L)$ в рамках обучающих демо.
* **Теги:** `[PARAMETRIC_CODE_ONLY]`, `[ORACLE_PHASE]`, `[DIAGONAL_UNITARY]`, `[BRUTE_FORCE_PROTECTED]`.
