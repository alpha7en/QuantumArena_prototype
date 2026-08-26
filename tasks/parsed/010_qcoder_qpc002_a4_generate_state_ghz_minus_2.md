# A4: Generate State 1/sqrt(2)(|0> - |2^n-1>) II

## 1. Классификация и метаданные
* **ID задачи:** `qcoder_qpc002_a4`
* **Источник:** https://www.qcoder.jp/en/contests/QPC002/problems/A4
* **Платформа:** QCoder (QPC002)
* **Общее описание:** Сформировать квантовую схему ограниченной логарифмической глубины для приготовления антифазного $n$-кубитного состояния Гринбергера — Хорна — Цайлингера (GHZ-минус).
* **Результат решения:** `ПАРАМЕТРИЗОВАННЫЙ ГЕНЕРАТОР СХЕМЫ`
* **Формат ответа:**
  ```python
  from qiskit import QuantumCircuit

  def solve(n: int) -> QuantumCircuit:
      qc = QuantumCircuit(n)
      # Write your code here:
      return qc
  ```
* **Число кубитов:** $n$ кубитов ($2 \le n \le 15$, без дополнительных анцилл).
* **Сложность:** Score 100 points, Time Limit 3 seconds, Memory Limit 512 MiB.

---

## 2. Условие задачи (Problem Statement)

### A4: Generate State 1/sqrt(2)(|0> - |2^n-1>) II
* **Time Limit:** 3 seconds
* **Memory Limit:** 512 MiB
* **Score:** 100 points

#### Problem Statement
You are given an integer $n$.
Implement the operation of preparing the state $|\psi\rangle$ from the zero state on a quantum circuit $\mathrm{qc}$ with $n$ qubits.

The quantum state $|\psi\rangle$ is defined as
$$|\psi\rangle = \frac{1}{\sqrt{2}} (|0\dots 0\rangle_n - |1\dots 1\rangle_n).$$

#### Constraints
* $2 \le n \le 15$
* The circuit depth must not exceed 10.
* [Global phase](https://www.qcoder.jp/en/qa#global) is ignored in judge.
* The submitted code must follow the specified format:
```python
from qiskit import QuantumCircuit

def solve(n: int) -> QuantumCircuit:
    qc = QuantumCircuit(n)
    # Write your code here:
    return qc
```

#### Sample Input
* $n = 4$:
Implemented circuit $\mathrm{qc}$ should perform the following transformation:
$$|0000\rangle \xrightarrow{\mathrm{qc}} \frac{1}{\sqrt{2}} (|0000\rangle - |1111\rangle)$$

#### Hints
None

---

## 3. Анализ проверяющей системы (Auto-Judge)
* **Принцип проверки:**
  - Судья вызывает `solve(n)` для набора значений $n \in [2, 15]$.
  - Валидирует возвращенный `QuantumCircuit`: ровно $n$ кубитов, отсутствие классических измерений, проверка жесткого ограничения глубины `qc.depth() <= 10`.
  - Запускает бессеточную симуляцию на исходном состоянии $|0\rangle^{\otimes n}$ (через `Statevector`), получая выходной вектор $|\psi_{\text{out}}\rangle$.
  - Проверяет равенство с целевым состоянием $|\psi_{\text{target}}\rangle = \frac{1}{\sqrt{2}}(|0\dots 0\rangle_n - |1\dots 1\rangle_n)$ с точностью до глобальной фазы ($|\langle \psi_{\text{target}} | \psi_{\text{out}} \rangle| \approx 1$).
* **Оценка числа тестов:** ~14 тестовых конфигураций (все целочисленные значения $n \in [2, 15]$, в особенности граничные $n=2$ и критический по глубине случай $n=15$).
* **Асимптотика и быстродействие:**
  - Размер пространства состояний: максимум $2^{15} = 32\,768$ комплексных амплитуд (~512 КБ).
  - Вычисление `Statevector` для схемы глубины $\le 10$ с $O(n)$ вентилями на 15 кубитах требует $\sim 10^5$ элементарных операций.
  - Память симуляции: $O(2^n) \le 1$ МБ.
  - Время валидации полного пакета тестов: суммарно $\le 50$–$150$ мс (с большим запасом укладывается в Time Limit 3s).
* **Полная проверка без шотов и перебор:**
  - *Проверка без шотов:* **Да, 100%**. Аналитическая проверка через `Statevector` полностью исключает дисперсию и шум измерений.
  - *Решаемость перебором:* **Защищена для генератора / Уязвима для малых $n$**. Для отдельных малых $n \le 3$ схема находится тривиальным перебором. Однако для параметрического генератора под произвольный $n \le 15$ с лимитом глубины $\text{depth} \le 10$ требуется построение параллельного бинарного дерева CNOT-гейтов ($O(\log_2 n)$ шагов), что исключает подбор случайных шаблонов.

---

## 4. Оценка ресурсов и применимость в GUI
* **Примерное число гейтов:**
  - 1Q гейты: 2 гейта ($X$ и $H$, либо $H$ и $Z$) на ведущем кубите для создания суперпозиции $\frac{1}{\sqrt{2}}(|0\rangle - |1\rangle)$.
  - 2Q гейты: $n - 1$ гейтов CNOT.
  - Глубина схемы: древовидное распространение запутанности обеспечивает глубину $1 + \lceil \log_2 n \rceil \le 5$ для $n=15$ (лимит задачи — 10). Наивная последовательная цепочка CNOT имеет глубину $n \ge 15$ и нарушает ограничение.
* **Решаемость в визуальном конструкторе:** `НЕТ (ТОЛЬКО КОД)` — Задача требует параметрической генерации схемы под произвольное $n \in [2, 15]$ с алгоритмическим планированием параллельных слоев CNOT-дерева в цикле. Статическая схема в GUI может быть собрана только для конкретного значения $n$.
* **Теги:** `[PARAMETRIC_CODE_ONLY]`, `[STATE_PREPARATION]`, `[ENTANGLEMENT_GHZ]`, `[LOG_DEPTH_CIRCUIT]`, `[BRUTE_FORCE_PROTECTED]`.
