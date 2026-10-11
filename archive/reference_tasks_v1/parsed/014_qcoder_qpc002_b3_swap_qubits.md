# B3: SWAP Qubits

## 1. Классификация и метаданные
* **ID задачи:** `qcoder_qpc002_b3`
* **Источник:** https://www.qcoder.jp/en/contests/QPC002/problems/B3
* **Платформа:** QCoder (QPC002)
* **Общее описание:** Построить параметризованный генератор квантовой схемы для обращения порядка кубитов (инверсии регистра $|x_0 \dots x_{n-1}\rangle \to |x_{n-1} \dots x_0\rangle$) с ограничением на глубину схемы.
* **Результат решения:** `ПАРАМЕТРИЗОВАННЫЙ ГЕНЕРАТОР СХЕМЫ`
* **Формат ответа:**
  ```python
  from qiskit import QuantumCircuit

  def solve(n: int) -> QuantumCircuit:
      qc = QuantumCircuit(n)
      # Write your code here:
      return qc
  ```
* **Число кубитов:** $n$ кубитов ($1 \le n \le 10$), без анцилл.
* **Сложность:** Score 200, Time Limit 3s, Memory Limit 512 MiB.

---

## 2. Условие задачи (Problem Statement)

### B3: SWAP Qubits
* **Time Limit:** 3 seconds
* **Memory Limit:** 512 MiB
* **Score:** 200 points

#### Problem Statement
You are given an integer $n$. Implement the operation of swapping the order of qubits on a quantum circuit `qc` with $n$ qubits:
$$|x_0 x_1 \dots x_{n-1}\rangle \to |x_{n-1} \dots x_1 x_0\rangle.$$

#### Constraints
* $1 \le n \le 10$
* The circuit depth must not exceed 5.
* [Global phase](https://www.qcoder.jp/en/qa#global) is ignored in judge.
* The submitted code must follow the specified format:
```python
from qiskit import QuantumCircuit

def solve(n: int) -> QuantumCircuit:
    qc = QuantumCircuit(n)
    # Write your code here:
    return qc
```

#### Sample Input / Output
For $n = 3$:
$$|100\rangle \to |001\rangle$$

#### Hints
Open

---

## 3. Анализ проверяющей системы (Auto-Judge)
* **Принцип проверки:** Судья итерируется по набору значений $n \in [1, 10]$ (включая граничные $n=1$, $n=2$, четные и нечетные $n$), вызывает `solve(n)`, проверяет соответствие числа кубитов и ограничение `qc.depth() <= 5`. Затем симулирует унитарный оператор `Operator(qc)` (или проверяет действие на базисных/суперпозиционных состояниях через `Statevector`), сравнивая его с матрицей перестановки реверса порядка кубитов с точностью до глобальной фазы.
* **Оценка числа тестов:** ~10 тестовых запусков (для каждого $n \in \{1, 2, \dots, 10\}$).
* **Асимптотика и быстродействие:** Сложность симуляции $O(2^n)$ по времени и памяти. При максимальном $n=10$ размерность гильбертова пространства $2^{10} = 1024$, матрица унитарного оператора $1024 \times 1024$. Валидация одного теста занимает $< 10$ мс, суммарное время проверки всех тестов $< 100$ мс при потреблении памяти $< 30$ МБ.
* **Полная проверка без шотов и перебор:**
  - *Проверка без шотов:* **Да, 100%**. При $n \le 10$ унитарный оператор или вектор состояния вычисляются строго аналитически без стохастического шума измерений.
  - *Решаемость перебором:* **Защищено от слепого перебора** в общем виде, так как требуется алгоритмическая параметрическая функция `solve(n)` для переменного $n$. Для каждого фиксированного $n$ топология тривиальна (параллельные SWAP гейты на непересекающихся парах $(i, n-1-i)$), что дает строго единственную оптимальную конфигурацию.

---

## 4. Оценка ресурсов и применимость в GUI
* **Примерное число гейтов:** $\lfloor n/2 \rfloor$ вентилей `SWAP` (или $3 \lfloor n/2 \rfloor$ вентилей `CX` при декомпозиции), 0 однокубитных вентилей. Глубина схемы: 1 (при нативных SWAP) или 3 (при декомпозиции на 3 CNOT), что гарантированно укладывается в лимит $\le 5$.
* **Решаемость в визуальном конструкторе:** `ЧАСТИЧНО` — для любого конкретного фиксированного значения $n$ схема тривиально собирается в GUI drag-and-drop редакторе (добавлением $\lfloor n/2 \rfloor$ параллельных SWAP вентилей), однако для общего решения задачи на платформе требуется параметрический Python-код с циклом `for i in range(n // 2): qc.swap(i, n - 1 - i)`.
* **Теги:** `[PARAMETRIC_CODE_ONLY]`, `[PERMUTATION_REVERSAL]`, `[CIRCUIT_DEPTH_RESTRICTED]`, `[EXACT_UNITARY]`.
