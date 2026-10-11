# B8: Grover's Algorithm II

## 1. Классификация и метаданные
* **ID задачи:** `qcoder_qpc003_b8`
* **Источник:** https://www.qcoder.jp/en/contests/QPC003/problems/B8
* **Платформа:** QCoder (QPC003)
* **Общее описание:** Построить квантовую схему алгоритма Гровера с использованием предоставленного булева оракула на $n+1$ кубитах для нахождения неизвестного базисного состояния $|L\rangle$ с вероятностью измерения $|a_L|^2 \ge 0.9$ при ограничении на глубину $\le 250$.
* **Результат решения:** `ПАРАМЕТРИЗОВАННЫЙ ГЕНЕРАТОР СХЕМЫ`
* **Формат ответа:**
  ```python
  from qiskit import QuantumCircuit, QuantumRegister

  def solve(n: int, o: QuantumCircuit) -> QuantumCircuit:
      x, y = QuantumRegister(n), QuantumRegister(1)
      qc = QuantumCircuit(x, y)
      # Write your code here:
      return qc
  ```
* **Число кубитов:** $n+1$ кубитов ($2 \le n \le 10$: $n$ кубитов рабочего регистра $x$, 1 кубит анциллы $y$ для фазового отката).
* **Сложность:** Score 300, Time Limit 5s, Memory Limit 512 MiB.

---

## 2. Условие задачи (Problem Statement)

### B8: Grover's Algorithm II
* **Time Limit:** 5 seconds
* **Memory Limit:** 512 MiB
* **Score:** 300 points

#### Problem Statement
You are given an integer $n$ and an oracle $O$.  
There exists an integer $L$ such that $0 \le L < 2^n$, and the oracle $O$ satisfies:
$$|x\rangle_n |y\rangle_1 \xrightarrow{O} \begin{cases} |x\rangle_n |y\oplus 1\rangle_1 & (x=L) \\ |x\rangle_n|y\rangle_1 & (x\neq L) \end{cases}$$
for any pair of integers $(x,y)$ satisfying $0\le x < 2^n$ and $0\le y < 2$, where $\oplus$ denotes the XOR operator.

Implement an operation on a quantum circuit $\mathrm{qc}$ with $n$ qubits that prepares a quantum state $|\psi\rangle$ from the zero state, such that $|L\rangle$ is observed with a probability of at least $0.9$ upon measurement.

#### More Precise Problem Statement
Define the state $|\psi\rangle$ prepared by $\mathrm{qc}$ as
$$\ket{\psi} = \sum_{i=0}^{2^n-1} a_i\ket{i},$$
where $a_i$ denotes the probability amplitude of the computational basis state $|i\rangle$.

Implement $\mathrm{qc}$ satisfying following condition:
$$|a_L|^2 \ge 0.9$$

#### Constraints
* $2 \le n \le 10$
* The circuit depth must not exceed 250.
* Oracle $O$ is given as a quantum circuit of depth 1.
* Integers must be encoded by little-endian.
* [Global phase](https://www.qcoder.jp/en/qa#global) is ignored in judge.
* The submitted code must follow the specified format:
```python
from qiskit import QuantumCircuit, QuantumRegister

"""
You can apply oracle as follows:
qc.compose(o, inplace=True)
"""

def solve(n: int, o: QuantumCircuit) -> QuantumCircuit:
    x, y = QuantumRegister(n), QuantumRegister(1)
    qc = QuantumCircuit(x, y)
    # Write your code here:

    return qc
```

#### Sample Input / Output
(Определяется спецификацией преобразования оракула для $n \in [2, 10]$ и целевого индекса $L \in [0, 2^n - 1]$).

#### Hints
(Подсказок нет).

---

## 3. Анализ проверяющей системы (Auto-Judge)
* **Принцип проверки:** Судья инициализирует оракулы $O$ на $n+1$ кубитах (как `QuantumCircuit` глубины 1 с унитарным действием $|x\rangle|y\rangle \to |x\rangle|y \oplus [x=L]\rangle$) для серии тестовых параметров $(n, L)$. Для каждого теста вызывается `solve(n, o)`, проверяется соответствие структуры регистров ($n+1$ кубит), отсутствие измерений (`measure`) и ограничение по глубине (`qc.depth() <= 250`). Через симулятор состояний `Statevector` вычисляется итоговый вектор состояния схемы и проверяется условие $|a_L|^2 = \sum_{y \in \{0, 1\}} |\langle L, y | \psi_{\text{final}} \rangle|^2 \ge 0.9$ с инвариантностью к глобальной фазе.
* **Каверзные случаи:**
  - *Фазовый откат (Phase Kickback):* Предоставленный оракул является булевым (bit-flip оракул на $y$), поэтому для работы алгоритма Гровера анцилла $y$ должна быть инициализирована в состояние $|-\rangle = \frac{|0\rangle - |1\rangle}{\sqrt{2}} = HX|0\rangle$.
  - *Точный расчет числа итераций:* Количество итераций $R \approx \operatorname{round}\left(\frac{\pi}{4}\sqrt{2^n}\right)$ должно быть подобрано строго во избежание эффекта «перевращения» (over-rotation), при котором вероятность $|a_L|^2$ опускается ниже порога $0.9$. Для $n=2$ достаточно ровно 1 итерации ($|a_L|^2 = 1.0$).
  - *Порядок кубитов (little-endian):* Построение многокубитного отражения $2|0\rangle\langle 0| - I$ в диффузионном операторе $2|s\rangle\langle s| - I = H^{\otimes n} X^{\otimes n} (MCZ) X^{\otimes n} H^{\otimes n}$ должно строго соблюдать индексацию кубитов регистра $x$.
* **Оценка числа тестов:** ~15–30 тестовых конфигураций с $n \in [2, 10]$ и различными позициями $L$ (граничные $L=0, 2^n-1$ и псевдослучайные значения).
* **Асимптотика и быстродействие:** Сложность симуляции $O(2^{n+1})$ по времени и памяти. При $n=10$ размерность вектора состояний составляет $2^{11} = 2048$ амплитуд (память < 32 КБ на тест), время симуляции одной схемы < 15 мс. Суммарное время валидации всего тестового пакета < 400 мс (существенно ниже лимита 5.0 с).
* **Полная проверка без шотов и перебор:**
  - *Проверка без шотов:* **Да, 100%**. Аналитическая верификация на уровне `Statevector` симуляции без стохастического шума измерений.
  - *Решаемость перебором:* **Защищена (алгоритмическая генерация)**. Оракул $O$ передается динамически в рантайме как черный ящик, число итераций и диффузия зависят от $n \in [2, 10]$. Пространство поиска исключает статический brute-force подбор.

---

## 4. Оценка ресурсов и применимость в GUI
* **Примерное число гейтов:** Инициализация суперпозиции и анциллы требует $n+2$ вентилей ($H^{\otimes n}$ на $x$, $X$ и $H$ на $y$). Каждая итерация Гровера включает 1 вызов $O$ (глубина 1) и диффузионный оператор ($2n$ гейтов $H$, $2n$ гейтов $X$, 1 $MCZ$). При максимальном числе итераций $R \le 25$ (для $n=10$) суммарное число вентилей составляет $\sim 100$–$300$, а глубина укладывается в лимит $\le 250$.
* **Решаемость в визуальном конструкторе:** `НЕТ (ТОЛЬКО КОД)` для общего параметризованного алгоритма с динамическим числом итераций $R(n)$ и инкапсулированным оракулом `o` / `ЧАСТИЧНО` для фиксированного частного случая ($n=2$, где схема полностью статична: ровно 1 вызов $O$ и 1 двухкубитная диффузия).
* **Теги:** `[PARAMETRIC_CODE_ONLY]`, `[ORACLE_BOOLEAN]`, `[GROVER_SEARCH]`, `[AMPLITUDE_AMPLIFICATION]`, `[PHASE_KICKBACK]`, `[DEPTH_CONSTRAINED]`, `[BRUTE_FORCE_PROTECTED]`.
