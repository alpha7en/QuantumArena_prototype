# Ex: Can you prepare $|\omega\rangle$?

## 1. Классификация и метаданные
* **ID задачи:** `qcoder_qpc002_ex`
* **Источник:** https://www.qcoder.jp/en/contests/QPC002/problems/Ex
* **Платформа:** QCoder (QPC002)
* **Общее описание:** Реализовать алгоритм квантового усиления амплитуды (Amplitude Amplification) для приготовления неизвестного маркированного состояния $|\omega\rangle$ с вероятностью успеха $\ge 0.99$ при помощи абстрактных оракулов $U$ и $R(\theta)$.
* **Результат решения:** `ОРАКУЛЬНЫЙ АЛГОРИТМ`
* **Формат ответа:**
  ```python
  from qiskit import QuantumCircuit

  def solve(n: int, P: float, U, R) -> QuantumCircuit:
      qc = QuantumCircuit(n)
      # Write your code here:
      return qc
  ```
* **Число кубитов:** $n$ (где $1 \le n \le 5$, без вспомогательных анцилл).
* **Сложность:** Score 600, Time Limit 3 seconds, Memory Limit 512 MiB.

---

## 2. Условие задачи (Problem Statement)

### Ex: Can you prepare $|\omega\rangle$?
* **Time Limit:** 3 seconds
* **Memory Limit:** 512 MiB
* **Score:** 600 points

#### Problem Statement
You are given an integer $n$, a real number $P$, an $n$-qubit quantum gate $U$ and an $n$-qubit parametric quantum gate $R(\cdot)$ of unknown structures.

There exists a vector $|\omega\rangle$ satisfying the following two conditions:
* $P \leq \left|\braket{\omega \mid U \mid 0}\right|^2 \leq 4P$
* $R(\theta) = I - (1 - e^{i\theta})\ket{\omega}\bra{\omega}$

Using the quantum gates $U$ and $R(\cdot)$, implement an operation $O$ that prepares the quantum state $|\omega\rangle$ on a quantum circuit $\mathrm{qc}$ with $n$ qubits.

The operation $O$ must satisfy $\left|\braket{\omega \mid O \mid 0}\right|^2 \geq 0.99$ within an error of $0.01$.

#### Constraints
* $1 \leq n \leq 5$
* $0.02 \leq P \leq 1$
* **The number of applied $R(\cdot)$ must not exceed 100.** (If exceeded, a DLE (depth limit exceeded) error will be displayed)
* [Global phase](https://www.qcoder.jp/en/qa#global) is ignored in judge.
* The submitted code must follow the specified format:
```python
from qiskit import QuantumCircuit

"""
You can apply U and R as follows:
qc.compose(U(), inplace=True)
qc.compose(R(theta), inplace=True)
"""


def solve(n: int, P: float, U, R) -> QuantumCircuit:
    qc = QuantumCircuit(n)
    # Write your code here:

    return qc
```

#### Hints
* You can use the inverse gates of the quantum gates $U$ and $R(\cdot)$.
```python
qc.compose(U().inverse(), inplace=True)
qc.compose(R(theta).inverse(), inplace=True)
```

---

## 3. Анализ проверяющей системы (Auto-Judge)
* **Принцип проверки:** Судья инициализирует неизвестный унитарный гейт $U$, неизвестное целевое состояние $|\omega\rangle$ и параметрический фазовый отражатель $R(\theta) = I - (1 - e^{i\theta})|\omega\rangle\langle\omega|$ с истинной начальной вероятностью перекрытия $p = |\langle\omega|U|0\rangle|^2 \in [P, 4P]$. Затем вызывает пользовательскую функцию `solve(n, P, U, R)` и проверяет, что общее число вызовов $R(\cdot)$ не превышает 100. Итоговая схема симулируется на векторе $|0\rangle^{\otimes n}$, после чего вычисляется вероятность перекрытия $F = |\langle\omega|O|0\rangle|^2$. Решение засчитывается, если $F \ge 0.98$.
* **Оценка числа тестов:** ~15–30 тестовых наборов: граничные $n \in \{1, 5\}$, граничные и промежуточные $P \in [0.02, 1.0]$, крайние точки диапазона $p = P$ и $p = 4P$, ортогональные базисные и произвольные суперпозиционные/запутанные состояния $|\omega\rangle$.
* **Асимптотика и быстродействие:** Размер пространства состояний при $n \le 5$ составляет $2^5 = 32$ комплексных амплитуды. Матрично-векторное умножение при симуляции схемы из $\le 100$ вызовов оракулов занимает $O(k \cdot 2^n) \sim 10^3$ операций (доли миллисекунды на тест). Полная валидация всех тестов занимает < 100 мс, потребление памяти < 15 МБ.
* **Полная проверка без шотов и перебор:**
  - *Проверка без шотов:* **Да, 100%**. Проверка осуществляется абсолютно точно через аналитическое вычисление `Statevector` без стохастического шума измерений.
  - *Решаемость перебором:* **Нет (полностью защищена)**. Оракулы $U$ и $R(\theta)$ передаются в виде закрытых черных ящиков. Задача требует детерминированного алгоритмического решения (стандартный алгоритм Гровера с аналитически вычисленным числом шагов $k \approx \frac{\pi}{4\arcsin\sqrt{P}}$ либо Fixed-Point Amplitude Amplification с последовательностью фаз).

---

## 4. Оценка ресурсов и применимость в GUI
* **Примерное число гейтов:** При $P \ge 0.02$ требуемое число итераций усиления амплитуды $k \le \lceil \frac{\pi}{4\sqrt{0.02}} \rceil \approx 6$. Каждая итерация включает $R(\pi)$, $U^\dagger$, рефлексию относительно $|0\rangle^{\otimes n}$ (многокубитный $Z$-вентиль, синтезируемый за $O(n)$ гейтов) и $U$. Суммарное число вызовов $R(\cdot) \le 6 \ll 100$, суммарное число элементарных 1Q/2Q гейтов $\sim 50$–$150$, глубина схемы $O(k \cdot \text{depth}(U))$.
* **Решаемость в визуальном конструкторе:** `НЕТ (ТОЛЬКО КОД)` — решение требует программной сборки схемы в цикле, аналитического вычисления числа итераций или фазовых углов на основе вещественного параметра $P$, вызова функциональных оракулов `U()` и $R(\theta)$, а также автоматического обращения оператора `U().inverse()`.
* **Теги:** `[PARAMETRIC_CODE_ONLY]`, `[ORACLE_PHASE]`, `[AMPLITUDE_AMPLIFICATION]`, `[BRUTE_FORCE_PROTECTED]`.
