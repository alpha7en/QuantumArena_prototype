# B8: Quantum Arithmetic IV

## 1. Классификация и метаданные
* **ID задачи:** `qcoder_qpc002_b8`
* **Источник:** https://www.qcoder.jp/en/contests/QPC002/problems/B8
* **Платформа:** QCoder (QPC002)
* **Общее описание:** Построить параметризованный булев оракул на $n+1$ кубитах с ограничением по глубине ($\le 100$), проверяющий выполнение сравнения взвешенной модульной суммы $\left(\sum_{i=0}^{n-1} S_i x_i\right) \bmod m = K$ и обращающий целевой кубит $|y\rangle \to |y \oplus [f(x) == K]\rangle$.
* **Результат решения:** `ПАРАМЕТРИЗОВАННЫЙ ГЕНЕРАТОР СХЕМЫ`
* **Формат ответа:**
  ```python
  from qiskit import QuantumCircuit, QuantumRegister

  def solve(n: int, m: int, K: int, S: list[int]) -> QuantumCircuit:
      x, y = QuantumRegister(n), QuantumRegister(1)
      qc = QuantumCircuit(x, y)
      # Write your code here:
      return qc
  ```
* **Число кубитов:** $n+1$ кубитов ($1 \le n \le 10$: $n$ кубитов входного регистра $x$, 1 кубит целевого регистра $y$, без дополнительных анцилл).
* **Сложность:** Score 200, Time Limit 3s, Memory Limit 512 MiB.

---

## 2. Условие задачи (Problem Statement)

### B8: Quantum Arithmetic IV
* **Time Limit:** 3 seconds
* **Memory Limit:** 512 MiB
* **Score:** 200 points

#### Problem Statement
You are given integers $n$, $m$, $K$, and $S = [S_0, \dots, S_{n-1}]$.  
Define $f(x) = \sum_{i=0}^{n-1} S_i x_i \pmod m$.  
Implement the oracle $O$ on $n+1$ qubits acting as:
$$|x\rangle_n |y\rangle_1 \xrightarrow{O} |x\rangle_n |y \oplus [f(x) == K]\rangle_1$$

#### Constraints
* $1 \le n \le 10$
* $1 \le m \le 10$
* $0 \le S_i, K < m$
* The circuit depth must not exceed 100.
* Integers are encoded in little-endian.
* [Global phase](https://www.qcoder.jp/en/qa#global) is ignored in judge.
* The submitted code must follow the specified format:
```python
from qiskit import QuantumCircuit, QuantumRegister

def solve(n: int, m: int, K: int, S: list[int]) -> QuantumCircuit:
    x, y = QuantumRegister(n), QuantumRegister(1)
    qc = QuantumCircuit(x, y)
    # Write your code here:
    return qc
```

#### Sample Input / Output
(Определяется спецификацией преобразования оракула для заданных кортежей $n, m, K, S$).

#### Hints
Open

---

## 3. Анализ проверяющей системы (Auto-Judge)
* **Принцип проверки:** Судья вызывает функцию `solve(n, m, K, S)` на наборе тестовых конфигураций, проверяет корректность размерности схемы ($n+1$ кубит), отсутствие измерений и ограничение по глубине (`qc.depth() <= 100`). Затем проверяется унитарное действие оракула через симуляцию `Statevector` или `Operator(qc)`: для всех вычислительных базисных состояний $|x\rangle |y\rangle$ проверяется переход в $|x\rangle |y \oplus [f(x) == K]\rangle$ с сохранением исходного состояния регистра $|x\rangle$ (отсутствие нескомпенсированных фазовых сдвигов и остаточной запутанности) с точностью до глобальной фазы $e^{i\phi}$.
* **Оценка числа тестов:** ~20–40 тестовых наборов $(n, m, K, S)$ (включая граничные случаи $n=1, 10$; $m=1, 2, 10$; $K=0, m-1$; нулевые и единичные веса $S_i$; различные распределения остатков).
* **Асимптотика и быстродействие:** Сложность симуляции $O(2^{n+1})$ по времени и памяти. При максимальном $n = 10$ размерность вектора состояний составляет $2^{11} = 2048$ комплексных амплитуд (память < 32 КБ на тест), время симуляции одной схемы < 10 мс. Суммарное время валидации всего пакета тестов < 300 мс (существенно ниже лимита 3.0 с).
* **Полная проверка без шотов и перебор:**
  - *Проверка без шотов:* **Да, 100%**. Аналитическая верификация на уровне полного вектора состояний / унитарного оператора без стохастического шума измерений.
  - *Решаемость перебором:* **Защищена (алгоритмическая генерация)**. Пространство состояний и параметров при $n \le 10$, $m \le 10$ и глубине $\le 100$ исключает brute-force перебор ($\gg 10^{60}$ вариантов схем).

---

## 4. Оценка ресурсов и применимость в GUI
* **Примерное число гейтов:** Реализация через дискретный фазовый кикбэк (корни из единицы $\omega = e^{2\pi i / m}$ и тождество $\sum_{r=0}^{m-1} \omega^{r(f(x)-K)} = m \cdot [f(x) == K]$) или синтез булевой логики требует порядка $20$–$80$ вентилей (Rz, Phase, CX/MCX, H, X) при глубине схемы $\le 100$.
* **Решаемость в визуальном конструкторе:** `НЕТ (ТОЛЬКО КОД)` для общего параметризованного генератора под произвольные $n, m, K, S$ / `ЧАСТИЧНО` для тривиальных фиксированных частных случаев ($n=1$ или $m=2$).
* **Теги:** `[PARAMETRIC_CODE_ONLY]`, `[ORACLE_BOOLEAN]`, `[QUANTUM_ARITHMETIC]`, `[DEPTH_CONSTRAINED]`, `[MODULAR_SUM]`, `[BRUTE_FORCE_PROTECTED]`.
