# B2: Convert Bit-Flip into Phase-Flip I

## 1. Классификация и метаданные
* **ID задачи:** `qcoder_qpc003_b2`
* **Источник:** https://www.qcoder.jp/en/contests/QPC003/problems/B2
* **Платформа:** QCoder (QPC003)
* **Общее описание:** Реализовать трансформацию произвольного квантового битового оракула ($O_X$) в фазовый оракул ($O_Z$) на $n$ кубитах с использованием одной вспомогательной анциллы и метода фазового отката (phase kickback).
* **Результат решения:** `ОРАКУЛЬНЫЙ АЛГОРИТМ`
* **Формат ответа:**
  ```python
  from qiskit import QuantumCircuit, QuantumRegister

  def solve(n: int, oracle: QuantumCircuit) -> QuantumCircuit:
      # Convert bit-flip oracle to phase-flip oracle using ancilla and H gates
      return qc
  ```
* **Число кубитов:** $n+1$ кубитов ($n$ рабочих кубитов данных, 1 кубит анциллы; $1 \le n \le 5$).
* **Сложность:** Score 200, Time Limit 3s, Memory Limit 512 MiB.

---

## 2. Условие задачи (Problem Statement)

### B2: Convert Bit-Flip into Phase-Flip I
* **Time Limit:** 3 seconds
* **Memory Limit:** 512 MiB
* **Score:** 200 points

#### Problem Statement
You are given an integer $n$ and a bit-flip oracle $O_X$ acting on $n+1$ qubits as:
$$|x\rangle_n |y\rangle_1 \xrightarrow{O_X} |x\rangle_n |y \oplus f(x)\rangle_1$$
for any $x \in \{0, 1\}^n$ and $y \in \{0, 1\}$, where $f: \{0, 1\}^n \to \{0, 1\}$ is a Boolean function.

Implement the phase-flip oracle $O_Z$ on $n$ qubits acting on computational basis states as:
$$|x\rangle_n \xrightarrow{O_Z} (-1)^{f(x)} |x\rangle_n$$
using an ancillary qubit in state $|-\rangle = \frac{|0\rangle - |1\rangle}{\sqrt{2}}$ (Phase Kickback trick).

#### Constraints
* $1 \le n \le 5$
* You can allocate 1 ancilla qubit (the returned circuit acts on $n+1$ qubits with the ancilla returned to state $|0\rangle$).
* [Global phase](https://www.qcoder.jp/en/qa#global) is ignored in judge.
* The submitted code must follow the specified format:
```python
from qiskit import QuantumCircuit, QuantumRegister

def solve(n: int, oracle: QuantumCircuit) -> QuantumCircuit:
    # Convert bit-flip oracle to phase-flip oracle using ancilla and H gates
    # Write your code here:
    return qc
```

#### Sample Input / Output
* Let $n = 1$, $f(x) = x$ (bit-flip oracle $O_X = \text{CNOT}$ where qubit 0 is control, qubit 1 is target):
  - Input state: $|x\rangle |0\rangle$.
  - Prepare ancilla: $|x\rangle |0\rangle \xrightarrow{X_1 H_1} |x\rangle |-\rangle$.
  - Apply $O_X$: $|x\rangle |-\rangle \xrightarrow{O_X} (-1)^{f(x)} |x\rangle |-\rangle = (-1)^x |x\rangle |-\rangle$.
  - Uncompute ancilla: $(-1)^x |x\rangle |-\rangle \xrightarrow{H_1 X_1} (-1)^x |x\rangle |0\rangle$.
  - Target transformation on data register: $|x\rangle \xrightarrow{O_Z} (-1)^x |x\rangle$ (equivalent to Pauli-$Z$ on qubit 0).

#### Hints
* Preparing state $|-\rangle$ from $|0\rangle$:
  $$|0\rangle \xrightarrow{X} |1\rangle \xrightarrow{H} \frac{|0\rangle - |1\rangle}{\sqrt{2}} = |-\rangle$$
* Action of bit-flip oracle on $|-\rangle$:
  $$O_X (|x\rangle |-\rangle) = |x\rangle \frac{|0 \oplus f(x)\rangle - |1 \oplus f(x)\rangle}{\sqrt{2}} = (-1)^{f(x)} |x\rangle |-\rangle$$
* Ancilla uncomputation: To leave the ancilla clean in state $|0\rangle$, apply $(H X)^\dagger = X H = H X$ after the oracle invocation.

---

## 3. Анализ проверяющей системы (Auto-Judge)
* **Принцип проверки:** Судья инстанциирует набор тестовых булевых функций $f: \{0, 1\}^n \to \{0, 1\}$ (константные, однобитные проекции, четность/XOR, конъюнкции/AND, псевдослучайные функции) в виде оракульных схем $O_X$ на $n+1$ кубитах. Вызывает `solve(n, oracle)` и получает итоговую схему `QuantumCircuit`. Валидирует унитарное преобразование или действие на векторы состояния `Statevector`:
  1. Проверяет фазовый отклик: для каждого $x \in \{0, 1\}^n$ амплитуда состояния $|x\rangle |0\rangle$ приобретает множитель $(-1)^{f(x)}$ с точностью до глобальной фазы $e^{i\phi}$.
  2. Проверяет полную очистку анциллы (uncomputation): анцилла строго возвращается в базовое состояние $|0\rangle$, отсутствие остаточной запутанности между рабочим регистром и анциллой.
* **Каверзные случаи:**
  - *Неполный uncomputation (загрязнение анциллы):* Если анцилла оставлена в $|-\rangle$ или $|1\rangle$, результирующее состояние $(-1)^{f(x)}|x\rangle|-\rangle$ не совпадает с целевым оператором $|x\rangle|0\rangle \to (-1)^{f(x)}|x\rangle|0\rangle$.
  - *Остаточная квантовая запутанность:* Некорректный порядок применения обратных гейтов оставляет анциллу сцепленной с регистром $x$, что разрушает фазовую интерференцию в последующих квантовых алгоритмах.
  - *Порядок и индексация кубитов:* Схема $O_X$ действует на $n$ кубитов управления и 1 целевой кубит ($n$). Ошибки в сопоставлении регистров при вызове `qc.compose(oracle)` нарушают логику вычисления функции.
  - *Суперпозиционные состояния входа:* Тестирование на состояниях $\sum_x c_x |x\rangle |0\rangle \to \sum_x c_x (-1)^{f(x)} |x\rangle |0\rangle$ гарантирует отсутствие паразитных измерений и сохранение когерентности.
* **Оценка числа тестов:** ~15–25 тестовых конфигураций (различные типы булевых оракулов для каждого $n \in \{1, 2, 3, 4, 5\}$).
* **Асимптотика и быстродействие:** Сложность симуляции $O(2^{n+1})$ по времени и памяти. При $n \le 5$ полное число кубитов $N = 6$, размерность гильбертова пространства $2^6 = 64$ комплексных числа (матрица оператора $64 \times 64 \approx 32$ КБ). Симуляция одного теста занимает $< 2$ мс, суммарное время проверки $< 40$ мс при потреблении памяти $< 20$ МБ.
* **Полная проверка без шотов и перебор:**
  - *Проверка без шотов:* **Да, 100%**. Аналитическая проверка через `Operator(qc)` / `Statevector` симуляцию без стохастического шума измерений.
  - *Решаемость перебором:* **Защищена от перебора (Brute-Force Protected)**. Оракул $O_X$ передается как динамический черный ящик (`black-box QuantumCircuit`); без использования фазового отката и композиции входного оракула решить задачу слепым перебором невозможно.

---

## 4. Оценка ресурсов и применимость в GUI
* **Примерное число гейтов:**
  - Однокубитные гейты: ровно 4 вентиля на кубите анциллы ($X, H$ до оракула и $H, X$ после оракула).
  - Вызовы оракула: 1 вставка `oracle` ($O_X$).
  - Дополнительные 2Q гейты: 0.
  - Глубина схемы: $\text{depth}(O_X) + 4$ (или $\text{depth}(O_X) + 2$ при параллельном выполнении $X, H$).
* **Решаемость в визуальном конструкторе:** `ЧАСТИЧНО` — шаблон схемы фазового отката (наложение $X, H$ на анциллу, вставка блока $O_X$, наложение $H, X$) статичен и собирается в визуальном Drag-and-Drop редакторе за 4 действия для любого фиксированного $O_X$. Однако как соревновательная задача `solve(n, oracle)` является мета-алгоритмической функцией-оберткой в Python.
* **Теги:** `[PARAMETRIC_CODE_ONLY]`, `[ORACLE_PHASE]`, `[ORACLE_BOOLEAN]`, `[PHASE_KICKBACK]`, `[UNCOMPUTATION]`, `[BRUTE_FORCE_PROTECTED]`.
