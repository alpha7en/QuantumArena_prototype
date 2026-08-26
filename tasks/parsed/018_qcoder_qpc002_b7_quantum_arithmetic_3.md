# B7: Quantum Arithmetic III

## 1. Классификация и метаданные
* **ID задачи:** `qcoder_qpc002_b7`
* **Источник:** https://www.qcoder.jp/en/contests/QPC002/problems/B7
* **Платформа:** QCoder (QPC002)
* **Общее описание:** Построить параметризованный булев оракул на $n+1$ кубитах с ограничением по глубине ($\le 100$), проверяющий равенство нулю взвешенной суммы битов по модулю $m$: $|x\rangle_n |y\rangle_1 \to |x\rangle_n |y \oplus [\sum_{i=0}^{n-1} S_i x_i \equiv 0 \pmod m]\rangle_1$.
* **Результат решения:** `ПАРАМЕТРИЗОВАННЫЙ ГЕНЕРАТОР СХЕМЫ`
* **Формат ответа:**
  ```python
  from qiskit import QuantumCircuit, QuantumRegister

  def solve(n: int, m: int, S: list[int]) -> QuantumCircuit:
      x, y = QuantumRegister(n), QuantumRegister(1)
      qc = QuantumCircuit(x, y)
      # Write your code here:
      return qc
  ```
* **Число кубитов:** $n+1$ кубитов ($1 \le n \le 10$: $n$ кубитов регистра аргумента $x$, 1 кубит целевого регистра $y$; без дополнительных анцилл).
* **Сложность:** Score 200, Time Limit 3s, Memory Limit 512 MiB.

---

## 2. Условие задачи (Problem Statement)

### B7: Quantum Arithmetic III
* **Time Limit:** 3 seconds
* **Memory Limit:** 512 MiB
* **Score:** 200 points

#### Problem Statement
You are given integers $n$, $m$, and $S = [S_0, S_1, \dots, S_{n-1}]$.
Define $f(x) = \sum_{i=0}^{n-1} S_i x_i \pmod m$.
Implement the oracle $O$ on $n+1$ qubits acting as:
$$|x\rangle_n |y\rangle_1 \xrightarrow{O} |x\rangle_n |y \oplus [f(x) == 0]\rangle_1,$$
where $[f(x) == 0]$ equals $1$ if $f(x) \equiv 0 \pmod m$, and $0$ otherwise.

#### Constraints
* $1 \le n \le 10$
* $1 \le m \le 10$
* $0 \le S_i < m$
* The circuit depth must not exceed 100.
* Integers are encoded in little-endian.
* [Global phase](https://www.qcoder.jp/en/qa#global) is ignored in judge.
* The submitted code must follow the specified format:
```python
from qiskit import QuantumCircuit, QuantumRegister

def solve(n: int, m: int, S: list[int]) -> QuantumCircuit:
    x, y = QuantumRegister(n), QuantumRegister(1)
    qc = QuantumCircuit(x, y)
    # Write your code here:
    return qc
```

#### Hints
Open

---

## 3. Анализ проверяющей системы (Auto-Judge)
* **Принцип проверки:** Судья вызывает `solve(n, m, S)` для набора тестовых наборов параметров $(n, m, S)$, валидирует ограничения схемы (число кубитов $n+1$, регистры `x` и `y`, глубина `qc.depth() <= 100`, отсутствие измерений) и симулирует действие схемы через `Statevector` или `Operator(qc)`. Проверяется, что для всех $2^n$ базисных состояний $|x\rangle$ целевой кубит $|y\rangle$ обратимо инвертируется тогда и только тогда, когда $\sum_{i=0}^{n-1} S_i x_i \equiv 0 \pmod m$, с точностью до единой глобальной фазы $e^{i\phi}$, без разрушения суперпозиций и без паразитного фазового сдвига или запутывания.
* **Оценка числа тестов:** ~25–40 тестовых конфигураций (граничные значения $n=1, 10$; $m=1, 2, 10$; $S_i = 0$, $S_i = 1$; все $S_i$ одинаковы, взаимно простые с $m$, случайные наборы $S$, проверка суперпозиций входа).
* **Асимптотика и быстродействие:** Сложность симуляции $O(2^{n+1})$ по времени и памяти. При $n \le 10$ общее число кубитов $N = 11$, размерность вектора состояний $2^{11} = 2048$ (память < 32 КБ на тест), время симуляции одной схемы < 10 мс, суммарное время проверки всех тестов < 300 мс.
* **Полная проверка без шотов и перебор:**
  - *Проверка без шотов:* **Да, 100%**. При $N \le 11$ кубитах валидация полностью детерминирована и проводится на уровне `Statevector` / `Operator` без использования стохастических измерений.
  - *Решаемость перебором:* **Защищена (параметрический синтез схемы с ограничением глубины)**. Пространство схем на 11 кубитах глубины $\le 100$ содержит $\gg 10^{60}$ вариантов, перебор невозможен.

---

## 4. Оценка ресурсов и применимость в GUI
* **Примерное число гейтов:** В зависимости от метода реализации (булев синтез булевой функции через мультиконтрольные вентили MCX, модульная арифметика/QFT-аккумулятор или фазовый кикбэк с обратным преобразованием) схема требует порядка $\sim 20$–$90$ вентилей (1Q вращения, CNOT, MCX/Toffoli), укладываясь в лимит глубины $\le 100$.
* **Решаемость в визуальном конструкторе:** `НЕТ (ТОЛЬКО КОД)` для универсального алгоритма-генератора `solve(n, m, S)` под произвольные входы / `ЧАСТИЧНО` для тривиальных малых конфигураций ($m=1$, $m=2, n \le 3$).
* **Теги:** `[PARAMETRIC_CODE_ONLY]`, `[ORACLE_BOOLEAN]`, `[ARITHMETIC_MODULO]`, `[DEPTH_CONSTRAINED]`, `[BRUTE_FORCE_PROTECTED]`.
