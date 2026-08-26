# A1: Generate State i|1>

## 1. Классификация и метаданные
* **ID задачи:** `qcoder_qpc003_a1`
* **Источник:** https://www.qcoder.jp/en/contests/QPC003/problems/A1
* **Платформа:** QCoder (QPC003)
* **Общее описание:** Построить квантовую схему для приготовления однокубитного состояния $i|1\rangle$ из базисного состояния $|0\rangle$ с обязательным учетом глобальной фазы ($e^{i\pi/2} = i$).
* **Результат решения:** `ФИКСИРОВАННАЯ ЧИСТО КВАНТОВАЯ СХЕМА`
* **Формат ответа:**
  ```python
  from qiskit import QuantumCircuit

  def solve() -> QuantumCircuit:
      qc = QuantumCircuit(1)
      # Write your code here:
      return qc
  ```
* **Число кубитов:** 1 (1 рабочий кубит, без анцилл).
* **Сложность:** Score 100, Time Limit 3s, Memory Limit 512 MiB.

---

## 2. Условие задачи (Problem Statement)

### A1: Generate State i|1>
* **Time Limit:** 3 seconds
* **Memory Limit:** 512 MiB
* **Score:** 100 points

#### Problem Statement
Implement the operation of preparing the state $|\psi\rangle$ from the zero state on a quantum circuit `qc` with 1 qubit.
$$|\psi\rangle = i |1\rangle.$$

#### Constraints
* In this problem, the state with different global phase will NOT be considered correct. (Global phase MATTERS!)
* The submitted code must follow the specified format:
```python
from qiskit import QuantumCircuit

def solve() -> QuantumCircuit:
    qc = QuantumCircuit(1)
    # Write your code here:
    return qc
```

#### Sample Input / Output
$$|0\rangle \xrightarrow{qc} i|1\rangle$$

#### Hints
You can apply quantum gate $g$: `qc.g(i)`.

---

## 3. Анализ проверяющей системы (Auto-Judge)
* **Принцип проверки:** Судья вызывает `solve()`, валидирует возвращенный `QuantumCircuit` (ровно 1 кубит), применяет его к начальному состоянию $|0\rangle$ и получает `Statevector(qc)`. Проверяется точное поэлементное совпадение вектора состояния с эталоном $[0, i]^T$ (комплексное скалярное произведение $\langle \psi_{\text{target}} | \psi_{\text{qc}} \rangle \approx 1$ без игнорирования глобального фазового множителя $e^{i\pi/2} = i$).
* **Оценка числа тестов:** 1 тестовый запуск (валидация финального вектора состояния на 1 кубите после применения схемы к $|0\rangle$).
* **Асимптотика и быстродействие:** Сложность симуляции $O(2^1) = O(1)$ по времени и памяти (< 1 КБ). Время исполнения валидатора на сервере: единицы миллисекунд (< 5 мс).
* **Полная проверка без шотов и перебор:**
  - *Проверка без шотов:* **Да, 100%**. Аналитическая проверка через `Statevector` без shot noise детерминированно фиксирует состояние и глобальную фазу за доли миллисекунды.
  - *Решаемость перебором:* **Да, тривиально**. Пространство поиска для схемы глубины $\le 2$ на 1 кубите из стандартного набора гейтов ($\{X, Y, Z, H, S, T\}$) составляет $\le 6^2 = 36$ вариантов и полностью перебирается за миллисекунды.

---

## 4. Оценка ресурсов и применимость в GUI
* **Примерное число гейтов:** 1–2 однокубитных гейта (например, вентиль $Y$ или последовательность $X \to S$), 0 двухкубитных гейтов, глубина 1–2.
* **Решаемость в визуальном конструкторе:** `ДА (100%)` — статическая однокубитная схема из 1–2 базовых вентилей ($Y$ или $X, S$), не требующая циклов и параметров, собирается в 1–2 клика в drag-and-drop редакторе.
* **Теги:** `[VISUAL_GUI_READY]`, `[PURE_CIRCUIT]`, `[STATE_PREPARATION]`, `[GLOBAL_PHASE]`, `[BRUTE_FORCE_VULNERABLE]`.
