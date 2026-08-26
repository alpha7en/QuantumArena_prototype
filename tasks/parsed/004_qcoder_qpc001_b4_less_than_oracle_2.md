# B4: Less Than Oracle II

## 1. Классификация и метаданные
* **ID задачи:** `qcoder_qpc001_b4`
* **Источник:** https://www.qcoder.jp/en/contests/QPC001/problems/B4
* **Платформа:** QCoder (QPC001)
* **Общее описание:** Построить параметризованный фазовый оракул на $n$ кубитах с жестким ограничением по глубине ($\le 50$), умножающий амплитуды всех базисных состояний $|x\rangle$ при $x < L$ на $-1$ ($|x\rangle \to -|x\rangle$).
* **Результат решения:** `ПАРАМЕТРИЗОВАННЫЙ ГЕНЕРАТОР СХЕМЫ`
* **Формат ответа:**
  ```python
  from qiskit import QuantumCircuit

  def solve(n: int, L: int) -> QuantumCircuit:
      qc = QuantumCircuit(n)
      # Write your code here:
      return qc
  ```
* **Число кубитов:** $n$ кубитов ($1 \le n \le 10$, без дополнительных анцилл).
* **Сложность:** Score 500, Time Limit 3s, Memory Limit 512 MiB.

---

## 2. Условие задачи (Problem Statement)

### B4: Less Than Oracle II
* **Time Limit:** 3 seconds
* **Memory Limit:** 512 MiB
* **Score:** 500 points

#### Problem Statement
You are given integers $n$ and $L$. Implement the oracle $O$ on a quantum circuit `qc` with $n$ qubits, which multiplies all the probability amplitudes $a_i$ of $|0\rangle, |1\rangle, \dots, |L-1\rangle$ by $-1$.

#### Constraints
* $1 \le n \le 10$
* $1 \le L \le 2^n$
* The circuit depth must not exceed 50.
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
* **Принцип проверки:** Судья вызывает `solve(n, L)` для набора пар $(n, L)$, валидирует ограничения схемы (число кубитов равно $n$, `qc.depth() <= 50`, отсутствие классических измерений) и симулирует действие схемы через `Statevector` или `Operator(qc)`. Проверяется фазовый сдвиг: для всех $x < L$ амплитуды умножаются на $-e^{i\phi}$, а для $x \ge L$ — на $+e^{i\phi}$ (с точностью до единой глобальной фазы $e^{i\phi}$ и порядка битов little-endian).
* **Оценка числа тестов:** ~20–40 тестовых пар $(n, L)$ (граничные значения $n=1, 10$; $L=1, 2^n-1, 2^n$; степени двойки, случайные $L$ с различной плотностью битов).
* **Асимптотика и быстродействие:** Сложность симуляции $O(2^n)$ по времени и памяти. При $n \le 10$ размерность вектора состояний $2^{10} = 1024$ (память < 16 КБ на тест), время симуляции одной схемы < 5 мс, суммарное время проверки всех тестов < 200 мс.
* **Полная проверка без шотов и перебор:**
  - *Проверка без шотов:* **Да, 100%**. При $n \le 10$ проверка полностью аналитическая на уровне вектора состояний `Statevector` / `Operator` без использования стохастических измерений.
  - *Решаемость перебором:* **Защищена (алгоритмическая генерация с ограничением глубины)**. Для пространства $n=10$ и глубины $\le 50$ число возможных схем экспоненциально велико ($\gg 10^{50}$), перебор невозможен.

---

## 4. Оценка ресурсов и применимость в GUI
* **Примерное число гейтов:** При разложении диапазона $[0, L-1]$ на $\le n$ непересекающихся бинарных гиперкубов (префиксов) требуется $\le n$ многоконтрольных фазовых вентилей ($MCZ$/$MCP$), что дает порядка $\sim 10$–$50$ вентилей при глубине схемы $\le 50$.
* **Решаемость в визуальном конструкторе:** `НЕТ (ТОЛЬКО КОД)` для общего алгоритма-генератора `solve(n, L)` под произвольные $(n, L)$ / `ЧАСТИЧНО` для конкретных малых фиксированных конфигураций ($n \le 3$).
* **Теги:** `[PARAMETRIC_CODE_ONLY]`, `[ORACLE_PHASE]`, `[DEPTH_CONSTRAINED]`, `[ARITHMETIC_COMPARISON]`, `[BRUTE_FORCE_PROTECTED]`.
