# C2: Generate Uniform Amplitude Superposition State II

## 1. Классификация и метаданные
* **ID задачи:** `qcoder_qpc001_c2`
* **Источник:** https://www.qcoder.jp/en/contests/QPC001/problems/C2
* **Платформа:** QCoder (QPC001)
* **Общее описание:** Сформировать квантовую схему для приготовления равномерной суперпозиции первых $L$ вычислительных базисных состояний ($|0\rangle, \dots, |L-1\rangle$) на $n$ кубитах с допустимой погрешностью.
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
* **Сложность:** Score 600 points, Time Limit 3 seconds, Memory Limit 512 MiB.

---

## 2. Условие задачи (Problem Statement)

### C2: Generate Uniform Amplitude Superposition State II
* **Time Limit:** 3 seconds
* **Memory Limit:** 512 MiB
* **Score:** 600 points

#### Problem Statement
You are given integers $n$ and $L$. Implement the operation of preparing the state $|\psi\rangle$ on a quantum circuit `qc` with $n$ qubits such that the states $|0\rangle, |1\rangle, \dots, |L-1\rangle$ are observed with equal probabilities, and the sum of these probabilities equals 1.

The error in the sum of probabilities can be up to $5.0 \times 10^{-3}$.

**More Precise Problem Statement:**
Define the state $|\psi\rangle$ prepared by `qc` as
$$|\psi\rangle = \sum_{i=0}^{2^n-1} a_i |i\rangle,$$
where $a_i$ denotes the probability amplitude of computational basis state $|i\rangle$.

Implement `qc` satisfying following conditions:
* $|a_0| = |a_1| = \dots = |a_{L-1}|$
* $\sum_{i=0}^{L-1} |a_i|^2 > 1 - 5.0 \times 10^{-3}$

#### Constraints
* $1 \le n \le 10$
* $1 \le L \le 2^n$
* The circuit depth must not exceed 1000.
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
$$n = 3, L = 3:$$
$$|000\rangle \xrightarrow{qc} \frac{1}{\sqrt{3}} (|000\rangle + |100\rangle + |010\rangle)$$

#### Hints
Open

---

## 3. Анализ проверяющей системы (Auto-Judge)
* **Принцип проверки:**
  - Судья вызывает `solve(n, L)` для набора тестовых пар $(n, L)$.
  - Валидирует `QuantumCircuit` на корректность: ровно $n$ кубитов, отсутствие промежуточных измерений, глубина `qc.depth() <= 1000`.
  - Запускает бессеточную симуляцию на исходном состоянии $|0\rangle^{\otimes n}$ (через `Statevector`), получая амплитуды $a_0, \dots, a_{2^n-1}$.
  - Проверяет равенство модулей $|a_0| \approx \dots \approx |a_{L-1}| \approx 1/\sqrt{L}$ (фазы могут быть произвольными) и суммарную вероятность $\sum_{i=0}^{L-1} |a_i|^2 > 1 - 0.005$.
* **Оценка числа тестов:** ~20–40 тестовых случаев:
  - Граничные: $L = 1$ (тривиально $|0\dots 0\rangle$), $L = 2^n$ (полный слой гейтов Адамара $H^{\otimes n}$), $L = 2^n - 1$.
  - Степени двойки: $L = 2^k$ при различных $n$.
  - Произвольные нечетные и составные $L$ ($L = 3, 5, 7, 10, \dots$).
  - Максимальные размерности: $n = 10, L = 1000, L = 1024$.
* **Асимптотика и быстродействие:**
  - Размер пространства состояний: максимум $2^{10} = 1024$ комплексных амплитуд (~16 КБ).
  - Вычисление `Statevector` для схемы глубины $\le 1000$ на 10 кубитах требует $\sim 10^5$–$10^6$ операций.
  - Память симуляции: $O(2^n) \le 1$ МБ.
  - Время валидации полного пакета тестов: суммарно < 200–400 мс (с большим запасом укладывается в Time Limit 3s).
* **Полная проверка без шотов и перебор:**
  - *Проверка без шотов:* **Да, 100%**. Аналитическая проверка через `Statevector` полностью исключает дисперсию и шум измерений.
  - *Решаемость перебором:* **Нет (защищена)**. Задача требует синтеза параметризованных вращений $R_y(\theta)$ с непрерывными углами $\theta(L)$ и ветвлениями по бинарному разложению $L$. Пространство состояний непрерывно, дискретный брутфорс невозможен.

---

## 4. Оценка ресурсов и применимость в GUI
* **Примерное число гейтов:**
  - Для степеней двойки $L = 2^k$: $k$ гейтов Адамара $H$, глубина 1.
  - Для произвольного $L$: последовательное/рекурсивное расщепление ветвей дерева амплитуд через контролируемые вращения $R_y(\theta_i)$ и многоконтрольные $X$-гейты (`MCX`).
  - Число гейтов: $O(n)$ для $L=2^k$, до $O(n^2)$ или $O(L)$ контролируемых вентилей для произвольного $L$; глубина укладывается в диапазон 10–300 (лимит 1000).
* **Решаемость в визуальном конструкторе:** `НЕТ (ТОЛЬКО КОД)` — Решение требует программной генерации схемы в зависимости от бинарного представления $L$ с аналитическим расчетом углов вращения $\theta = 2 \arccos(\dots)$ в цикле или рекурсии. Статической схемой задача не решается.
* **Теги:** `[PARAMETRIC_CODE_ONLY]`, `[STATE_PREPARATION]`, `[CONTINUOUS_ROTATIONS]`, `[BRUTE_FORCE_PROTECTED]`.
