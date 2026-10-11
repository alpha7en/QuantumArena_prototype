# A2: Generate State 1/sqrt(2)(|0> - |3>)

## 1. Классификация и метаданные
* **ID задачи:** `qcoder_qpc002_a2`
* **Источник:** https://www.qcoder.jp/en/contests/QPC002/problems/A2
* **Платформа:** QCoder (QPC002)
* **Общее описание:** Подготовить двухкубитное запутанное состояние Белла $|\Phi^-\rangle = \frac{1}{\sqrt{2}}(|00\rangle - |11\rangle)$ из начального нулевого состояния $|00\rangle$.
* **Результат решения:** `ФИКСИРОВАННАЯ ЧИСТО КВАНТОВАЯ СХЕМА`
* **Формат ответа:**
  ```python
  from qiskit import QuantumCircuit

  def solve() -> QuantumCircuit:
      qc = QuantumCircuit(2)
      # Write your code here:
      return qc
  ```
* **Число кубитов:** 2 (без анцилл).
* **Сложность:** Score 200, Time Limit 3s, Memory Limit 512 MiB.

---

## 2. Условие задачи (Problem Statement)

### A2: Generate State $\frac{1}{\sqrt{2}}(|0\rangle - |3\rangle)$
* **Time Limit:** 3 seconds
* **Memory Limit:** 512 MiB
* **Score:** 200 points

#### Problem Statement
Implement the operation of preparing the state $|\psi\rangle$ from the zero state on a quantum circuit $\mathrm{qc}$ with $2$ qubits.

The quantum state $|\psi\rangle$ is defined as
$$|\psi\rangle = \frac{1}{\sqrt{2}} (|00\rangle - |11\rangle) = \frac{1}{\sqrt{2}} (|0\rangle - |3\rangle).$$

#### Constraints
* [Global phase](https://www.qcoder.jp/en/qa#global) is ignored in judge.
* The submitted code must follow the specified format:
```python
from qiskit import QuantumCircuit

def solve() -> QuantumCircuit:
    qc = QuantumCircuit(2)
    # Write your code here:
    return qc
```

#### Hints
Open

---

## 3. Анализ проверяющей системы (Auto-Judge)
* **Принцип проверки:** Судья вызывает функцию `solve()`, валидирует структуру `QuantumCircuit(2)` и симулирует эволюцию начального состояния $|00\rangle$ с помощью `Statevector` симулятора. Полученное состояние $|\psi_{\text{gen}}\rangle$ сравнивается с эталонным $|\Phi^-\rangle = \frac{1}{\sqrt{2}}(|00\rangle - |11\rangle)$ через вычисление точности (state fidelity $|\langle \psi_{\text{target}} | \psi_{\text{gen}} \rangle|^2 = 1.0$), что автоматически допускает произвольную глобальную фазу.
* **Каверзные случаи:**
  - *Относительная фаза:* Ошибка знака суперпозиции ($|\Phi^+\rangle = \frac{1}{\sqrt{2}}(|00\rangle + |11\rangle)$ вместо $|\Phi^-\rangle$). Требуется внедрение отрицательной фазы (например, через гейт $Z$ или $X \to H$).
  - *Когерентность и отсутствие измерений:* Схема должна выполнять унитарное преобразование без измерений и коллапса волновой функции.
* **Оценка числа тестов:** 1 тест (проверка итогового вектора состояния на входе $|00\rangle$).
* **Асимптотика и быстродействие:** Размерность гильбертова пространства $2^2 = 4$. Временная и емкостная сложность симуляции $O(2^2) = O(1)$ (< 1 КБ памяти). Время исполнения проверки: < 5 мс.
* **Полная проверка без шотов и перебор:**
  - *Проверка без шотов:* **Да, 100%**. Аналитическая проверка через `Statevector` без стохастического шума измерений.
  - *Решаемость перебором:* **Да, тривиально**. Минимальная схема состоит из 2–3 гейтов (например, `X` + `H` + `CX` или `H` + `Z` + `CX`). Пространство поиска для глубины $\le 3$ на 2 кубитах составляет $\sim 10^3$ комбинаций, что мгновенно перебирается за < 0.1 секунды.

---

## 4. Оценка ресурсов и применимость в GUI
* **Примерное число гейтов:** 1–2 однокубитных гейта (например, `X`, `H` или `H`, `Z`), 1 двухкубитный гейт (`CX`), глубина 2–3.
* **Решаемость в визуальном конструкторе:** `ДА (100%)` — статическая двухкубитная квантовая схема без параметров и ветвлений, полностью реализуема в GUI drag-and-drop конструкторе.
* **Теги:** `[VISUAL_GUI_READY]`, `[PURE_CIRCUIT]`, `[STATE_PREPARATION]`, `[BRUTE_FORCE_VULNERABLE]`.
