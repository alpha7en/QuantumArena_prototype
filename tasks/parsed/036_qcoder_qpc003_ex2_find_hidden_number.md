# Ex2: Find Hidden Number

## 1. Классификация и метаданные
* **ID задачи:** `qcoder_qpc003_ex2`
* **Источник:** https://www.qcoder.jp/en/contests/QPC003/problems/Ex2
* **Платформа:** QCoder (QPC003)
* **Общее описание:** Построить квантовую схему поиска алгоритмом Гровера в $n$-мерном подпространстве состояний однократного возбуждения (one-hot / $W$-состояний) для нахождения скрытого числа $L \in \{2^0, 2^1, \dots, 2^{n-1}\}$ с вероятностью измерения $|a_L|^2 \ge 0.9$ при жестком ограничении на глубину схемы $\le 75$.
* **Результат решения:** `ПАРАМЕТРИЗОВАННЫЙ ГЕНЕРАТОР СХЕМЫ`
* **Формат ответа:**
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
* **Число кубитов:** $n+1$ кубитов ($2 \le n \le 10$: рабочий регистр $x$ из $n$ кубитов и 1 кубит анциллы $y$ для фазового отката).
* **Сложность:** Score 500, Time Limit 3s, Memory Limit 512 MiB.

---

## 2. Условие задачи (Problem Statement)

### Ex2: Find Hidden Number
* **Time Limit:** 3 seconds
* **Memory Limit:** 512 MiB
* **Score:** 500 points

#### Problem Statement
You are given an integer $n$ and an oracle $O$.
There exists an integer $L$ such that $0 \le L < 2^n$, and we know that $L$ is one of the powers of $2$ $(2^0, 2^1, \dots, 2^{n-1})$.
The oracle $O$ satisfies
\begin{equation}
\ket{x}_n \ket{y}_1 \xrightarrow{O} 
\begin{cases} 
\ket{x}_n \ket{y\oplus 1}_1 & (x=L) \\
\ket{x}_n\ket{y}_1 & (x\neq L)
\end{cases} \nonumber
\end{equation}
for any pair of integers $(x,y)$ satisfying $0\le x < 2^n$ and $0\le y < 2$, where $\oplus$ denotes the XOR operator.

Implement an operation on a quantum circuit $\mathrm{qc}$ with $n$ qubits that prepares a quantum state $\ket{\psi}$ from the zero state, such that $\ket{L}$ is observed with a probability of at least $0.9$ upon measurement.

#### More Precise Problem Statement
Define the state $\ket{\psi}$ prepared by $\mathrm{qc}$ as
\begin{equation}
\ket{\psi} = \sum_{i=0}^{2^n-1} a_i\ket{i}, \nonumber
\end{equation}
where $a_i$ denotes the probability amplitude of the computational basis state $\ket{i}$.

Implement $\mathrm{qc}$ satisfying following condition:
\begin{equation}
|a_L|^2 \ge 0.9 \nonumber
\end{equation}

#### Constraints
* $2 \le n \le 10$
* **The circuit depth must not exceed 75.**
* **Oracle $O$ is given as a quantum circuit of depth 1.**
* Integers must be encoded by [little-endian](https://www.qcoder.jp/en/qa#endian).
* [Global phase](https://www.qcoder.jp/en/qa#global) is ignored in judge.
* The submitted code must follow the specified format:
```python
from qiskit import QuantumCircuit

"""
You can apply oracle as follows:
qc.compose(o, inplace=True)
"""

def solve(n: int, o: QuantumCircuit) -> QuantumCircuit:
    qc = QuantumCircuit(n)
    # Write your code here:

    return qc
```

#### Sample Input / Output
* $n=2$, $L \in \{2^0, 2^1\} = \{1, 2\}$ (в двоичной записи $|01\rangle$ или $|10\rangle$):
  - Поиск в 2-мерном подпространстве $\{|01\rangle, |10\rangle\}$: начальное состояние $|W_2\rangle = \frac{|01\rangle + |10\rangle}{\sqrt{2}}$.
  - Применение фазового отката через $O$ и диффузора в подпространстве за $R=1$ итерацию дает $|a_L|^2 = 1.0 \ge 0.9$.

#### Hints
(Подсказок нет).

---

## 3. Анализ проверяющей системы (Auto-Judge)
* **Принцип проверки:** Судья инициализирует оракулы $O$ глубины 1 на $n+1$ кубитах (булев оракул $|x\rangle|y\rangle \to |x\rangle|y \oplus [x=L]\rangle$) для серии тестовых параметров $(n, L)$, где $L \in \{2^0, 2^1, \dots, 2^{n-1}\}$ при $n \in [2, 10]$. Для каждого теста вызывается функция `solve(n, o)`. Проверяется отсутствие измерений (`measure`) и жесткое ограничение на глубину схемы (`qc.depth() <= 75`). Через симулятор состояний `Statevector` вычисляется результирующий вектор состояния $|\psi\rangle$ и проверяется условие $|a_L|^2 = \sum_{y \in \{0, 1\}} |\langle L, y | \psi \rangle|^2 \ge 0.9$ с инвариантностью к глобальной фазе.
* **Каверзные случаи:**
  - *Жесткий лимит глубины ($\le 75$) и поиск в подпространстве:* Стандартный алгоритм Гровера в полном гильбертовом пространстве $2^n$ при $n=10$ требует $R \approx \frac{\pi}{4}\sqrt{1024} = 25$ итераций, что приводит к глубине $> 150$ и вердикту DLE (Depth Limit Exceeded). Поскольку $L$ гарантированно является степенью двойки ($L = 2^k$, one-hot состояние с ровно одним битом 1), пространство поиска сокращается с $2^n$ до $n$. В $n$-мерном подпространстве $W$-состояний алгоритм Гровера требует всего $R \approx \frac{\pi}{4}\sqrt{n} \le 2$ итераций ($R=1$ для $n \le 4$; $R=2$ для $5 \le n \le 10$), что укладывается в глубину $\le 60 \ll 75$.
  - *Фазовый откат (Phase Kickback):* Оракул $O$ предоставлен в виде bit-flip преобразования на анцилле $y$, поэтому анцилла должна быть подготовлена в состоянии $|-\rangle = HX|0\rangle$.
  - *Диффузор в $n$-мерном подпространстве:* Оператор диффузии строится как $D_W = 2|W_n\rangle\langle W_n| - I = U_W (2|e_0\rangle\langle e_0| - I) U_W^\dagger$, где $U_W$ — эффективная схема приготовления $W$-состояния $|W_n\rangle = \frac{1}{\sqrt{n}}\sum_{k=0}^{n-1} |2^k\rangle$ из базисного состояния $|e_0\rangle = |0\dots01\rangle$ с помощью каскада управляемых $RY$-поворотов.
  - *Порядок кубитов (little-endian):* $L = 2^k$ соответствует $k$-му кубиту в состоянии $|1\rangle$, остальные кубиты $|0\rangle$.
* **Оценка числа тестов:** ~20–30 тестовых запусков для $n \in [2, 10]$ со всеми возможными позициями $L \in \{2^0, \dots, 2^{n-1}\}$.
* **Асимптотика и быстродействие:** Сложность симуляции $O(2^{n+1})$ по времени и памяти. При $n=10$ размерность вектора состояний $2^{11} = 2048$ амплитуд (память $< 32$ КБ на тест), время симуляции одной схемы $< 15$ мс. Суммарное время валидации всего пакета тестов $< 350$ мс при лимите 3.0 с.
* **Полная проверка без шотов и перебор:**
  - *Проверка без шотов:* **Да, 100%**. Аналитическая проверка через симуляцию `Statevector` без стохастического шума измерений.
  - *Решаемость перебором:* **Защищена (алгоритмическая генерация)**. Оракул $O$ инкапсулирован как черный ящик `QuantumCircuit` в рантайме, целевой индекс $L$ неизвестен алгоритму. Статический перебор вентилей невозможен.

---

## 4. Оценка ресурсов и применимость в GUI
* **Примерное число гейтов:**
  - Подготовка начального $W$-состояния $U_W$: $n-1$ вентилей $RY$ и контролируемых переходов $CX$ ($\sim 15$–$25$ вентилей для $n=10$, глубина $\sim 10$–$15$).
  - Инициализация анциллы: $X$ и $H$ на $y$.
  - Итерации Гровера ($R \le 2$): $R$ вызовов $O$ (глубина 1 каждый) + $R$ диффузоров $U_W (2|e_0\rangle\langle e_0| - I) U_W^\dagger$ ($\sim 30$–$50$ вентилей на итерацию).
  - Итого при $n=10$ ($R=2$): $\sim 60$–$100$ вентилей, результирующая глубина $\sim 45$–$65 \le 75$.
* **Решаемость в визуальном конструкторе:** `НЕТ (ТОЛЬКО КОД)` для общего параметризованного алгоритма с динамическим генератором $W$-состояния и числом итераций $R(n)$ / `ЧАСТИЧНО` для частного случая ($n=2$, где схема полностью статична: $R=1$, $U_W$ сводится к $H$ и $CX$, а диффузор реализуется фиксированным набором 2Q вентилей).
* **Теги:** `[PARAMETRIC_CODE_ONLY]`, `[ORACLE_BOOLEAN]`, `[GROVER_SEARCH]`, `[W_STATE_SUBSPACE]`, `[AMPLITUDE_AMPLIFICATION]`, `[DEPTH_CONSTRAINED]`, `[BRUTE_FORCE_PROTECTED]`.
