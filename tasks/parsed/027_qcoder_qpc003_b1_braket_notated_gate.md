# B1: Bra-Ket Notated Gate

## 1. Классификация и метаданные
* **ID задачи:** `qcoder_qpc003_b1`
* **Источник:** https://www.qcoder.jp/en/contests/QPC003/problems/B1
* **Платформа:** QCoder (QPC003)
* **Общее описание:** Реализовать квантовый вентиль Паули-X ($X = |0\rangle\langle 1| + |1\rangle\langle 0|$), заданный в нотации Дирака (бра-кет), на однокубитной квантовой схеме.
* **Результат решения:** `ФИКСИРОВАННАЯ ЧИСТО КВАНТОВАЯ СХЕМА`
* **Формат ответа:**
  ```python
  from qiskit import QuantumCircuit

  def solve() -> QuantumCircuit:
      qc = QuantumCircuit(1)
      # Write your code here:
      return qc
  ```
* **Число кубитов:** 1 кубит, без анцилл.
* **Сложность:** Score 100, Time Limit 3s, Memory Limit 512 MiB.

---

## 2. Условие задачи (Problem Statement)

### B1: Bra-Ket Notated Gate
* **Time Limit:** 3 seconds
* **Memory Limit:** 512 MiB
* **Score:** 100 points

#### Problem Statement
Implement the quantum gate $G$ on a quantum circuit `qc` with 1 qubit:
$$G = |0\rangle\langle 1| + |1\rangle\langle 0|$$
(Pauli-X gate).

#### Constraints
* [Global phase](https://www.qcoder.jp/en/qa#global) is ignored in judge.
* The submitted code must follow the specified format:
```python
from qiskit import QuantumCircuit

def solve() -> QuantumCircuit:
    qc = QuantumCircuit(1)
    # Write your code here:
    return qc
```

#### Sample Input / Output
* Input: None (беспараметрическая функция).
* Target Gate:
$$G = \begin{pmatrix} 0 & 1 \\ 1 & 0 \end{pmatrix}$$

#### Hints
Notice that by applying $G$ to basis states:
$$G|0\rangle = (|0\rangle\langle 1| + |1\rangle\langle 0|)|0\rangle = |1\rangle$$
$$G|1\rangle = (|0\rangle\langle 1| + |1\rangle\langle 0|)|1\rangle = |0\rangle$$
This is the standard bit-flip operation implemented by the Pauli-X gate (`qc.x(0)`).

---

## 3. Анализ проверяющей системы (Auto-Judge)
* **Принцип проверки:** Судья выполняет вызов `solve()`, проверяет размерность схемы (`qc.num_qubits == 1`) и отсутствие промежуточных/финальных измерений или сбросов кубитов. Затем извлекает результирующий унитарный оператор $U_{\mathrm{qc}} = \mathrm{Operator}(qc)$ и выполняет сравнение с матрицей $X = \begin{pmatrix} 0 & 1 \\ 1 & 0 \end{pmatrix}$ с точностью до глобального фазового множителя $e^{i\phi}$ (проверка условия $|\mathrm{Tr}(X^\dagger U_{\mathrm{qc}})| = 2$).
* **Оценка числа тестов:** 1 тестовый запуск (статическая схема без входных аргументов).
* **Асимптотика и быстродействие:** Сложность симуляции $O(2^n) = O(1)$ по времени и памяти для $n=1$. Размер унитарной матрицы $2 \times 2$. Время валидации $< 1$ мс, потребление памяти $< 10$ МБ.
* **Полная проверка без шотов и перебор:**
  - *Проверка без шотов:* **Да, 100%**. Аналитическое вычисление унитарной матрицы через `qiskit.quantum_info.Operator` полностью исключает погрешность квантовых измерений.
  - *Решаемость перебором:* **Критически уязвимо к перебору (Trivial Brute-Force)**. Пространство элементарных однокубитных гейтов глубины 1 составляет $|\mathcal{G}| \sim 10$ вариантов ($I, X, Y, Z, H, S, T, \dots$). Перебор находит правильный гейт моментально.

---

## 4. Оценка ресурсов и применимость в GUI
* **Примерное число гейтов:** 1 однокубитный вентиль (`X`), 0 двухкубитных вентилей. Глубина схемы: 1.
* **Решаемость в визуальном конструкторе:** `ДА (100%)` — схема статическая, состоит из одного вентиля `X` на кубите 0, собирается в Drag-and-Drop визуальном конструкторе в один клик без написания программного кода.
* **Теги:** `[VISUAL_GUI_READY]`, `[FIXED_CIRCUIT]`, `[PAULI_X]`, `[BRA_KET_NOTATION]`, `[EXACT_UNITARY]`, `[BRUTE_FORCE_VULNERABLE]`.
