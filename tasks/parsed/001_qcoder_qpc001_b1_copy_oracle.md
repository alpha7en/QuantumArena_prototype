# B1: Copy Oracle

## 1. Классификация и метаданные
* **ID задачи:** `qcoder_qpc001_b1`
* **Источник:** https://www.qcoder.jp/en/contests/QPC001/problems/B1
* **Платформа:** QCoder (QPC001)
* **Общее описание:** Построить схему-оракул для обратимого XOR/копирования одного бита данных на целевой кубит ($|y \oplus x\rangle$).
* **Результат решения:** `ФИКСИРОВАННАЯ ЧИСТО КВАНТОВАЯ СХЕМА`
* **Формат ответа:**
  ```python
  from qiskit import QuantumCircuit, QuantumRegister

  def solve() -> QuantumCircuit:
      x, y = QuantumRegister(1), QuantumRegister(1)
      qc = QuantumCircuit(x, y)
      # Write your code here:
      return qc
  ```
* **Число кубитов:** 2 (1 кубит $x$, 1 кубит $y$, без анцилл).
* **Сложность:** Score 100, Time Limit 3s, Memory Limit 512 MiB.

---

## 2. Условие задачи (Problem Statement)

### B1: Copy Oracle
* **Time Limit:** 3 seconds
* **Memory Limit:** 512 MiB
* **Score:** 100 points

#### Problem Statement
Implement the oracle $O$ on a quantum circuit `qc` with 2 qubits acting on computational basis states as
$$|x\rangle |y\rangle \xrightarrow{O} |x\rangle |y \oplus x\rangle,$$
where $\oplus$ denotes the [XOR operator](https://en.wikipedia.org/wiki/Exclusive_or).

#### Constraints
* [Global phase](https://www.qcoder.jp/en/qa#global) is ignored in judge.
* The submitted code must follow the specified format:
```python
from qiskit import QuantumCircuit, QuantumRegister

def solve() -> QuantumCircuit:
    x, y = QuantumRegister(1), QuantumRegister(1)
    qc = QuantumCircuit(x, y)
    # Write your code here:
    return qc
```

#### Sample Input
$$|x\rangle |y\rangle = \frac{1}{\sqrt{2}}(|00\rangle + |10\rangle) \xrightarrow{O} \frac{1}{\sqrt{2}}(|00\rangle + |11\rangle)$$

#### Hints
Open

---

## 3. Анализ проверяющей системы (Auto-Judge)
* **Принцип проверки:** Судья вызывает `solve()`, валидирует возвращенный `QuantumCircuit` (ровно 2 кубита) и симулирует действие схемы на базисных и суперпозиционных состояниях (или вычисляет унитарную матрицу $4 \times 4$), сравнивая результат с эталоном с точностью до глобальной фазы.
* **Оценка числа тестов:** ~4–10 тестовых конфигураций (все 4 базисных состояния $\{|00\rangle, |01\rangle, |10\rangle, |11\rangle\}$, суперпозиции входа для проверки сохранения фазовой когерентности и отсутствия промежуточных измерений).
* **Асимптотика и быстродействие:** Сложность проверки $O(2^2) = O(1)$ по времени и памяти (< 1 КБ). Время исполнения валидатора на сервере: единицы миллисекунд (< 10 мс).
* **Полная проверка без шотов и перебор:**
  - *Проверка без шотов:* **Да, 100%**. При $N=2$ схема валидируется аналитически через вычисление матрицы оператора `Operator(qc)` или `Statevector` без стохастического шума измерений.
  - *Решаемость перебором:* **Да, тривиально**. Пространство поиска для схемы глубины $\le 2$ на 2 кубитах составляет $\sim 10^2$–$10^3$ комбинаций, что перебирается за < 0.1 секунды.

---

## 4. Оценка ресурсов и применимость в GUI
* **Примерное число гейтов:** 1 двухкубитный гейт (`CX`), 0 однокубитных гейтов, глубина 1.
* **Решаемость в визуальном конструкторе:** `ДА (100%)` — схема статическая, состоит из 1 вентиля CNOT без параметров и циклов, собирается в 1 клик в drag-and-drop редакторе.
* **Теги:** `[VISUAL_GUI_READY]`, `[PURE_CIRCUIT]`, `[ORACLE_BOOLEAN]`, `[BRUTE_FORCE_VULNERABLE]`.
