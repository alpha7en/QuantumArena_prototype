# 041: Dynamic Circuits, Mid-Circuit Measurements and Active Reset

## 1. Классификация и метаданные
* **ID задачи:** `ibm_spring_2023_lab1`
* **Источник:** https://github.com/qiskit-community/ibm-quantum-challenge-spring-2023/blob/main/content/lab_1/lab1.ipynb
* **Платформа:** IBM Quantum Challenge (Spring 2023, Lab 1)
* **Общее описание:** Реализация динамических квантовых схем с промежуточными измерениями (mid-circuit measurements), классическим feedforward ветвлением в реальном времени (`qc.if_test()`) и активным аппаратным сбросом кубитов (active reset) в протоколе Repeat-Until-Success для синтеза неклиффордова поворота $R_X(\theta)$ с $\cos\theta = 3/5$.
* **Результат решения:** `ДИНАМИЧЕСКАЯ КВАНТОВАЯ СХЕМА` / `ПАРАМЕТРИЗОВАННЫЙ ГЕНЕРАТОР СХЕМЫ`
* **Формат ответа:**
  ```python
  from qiskit import QuantumCircuit, QuantumRegister, ClassicalRegister

  # Exercise 1: Двухкубитное условное ветвление
  def build_dynamic_circuit() -> QuantumCircuit:
      qr = QuantumRegister(2)
      cr = ClassicalRegister(2)
      qc = QuantumCircuit(qr, cr)
      # ...
      return qc

  # Exercise 2: Попытка (trial) протокола Repeat-Until-Success
  def trial(circuit: QuantumCircuit, target: QuantumRegister, controls: QuantumRegister, measures: ClassicalRegister) -> None:
      ...

  # Exercise 3: Активный условный сброс контрольных кубитов
  def reset_controls(circuit: QuantumCircuit, controls: QuantumRegister, measures: ClassicalRegister) -> None:
      ...

  # Exercise 4: Полный цикл Repeat-Until-Success с ветвлением else
  def build_rus_circuit() -> QuantumCircuit:
      ...
  ```
* **Число кубитов:** 2–3 кубита (Ex 1: 2 кубита данных, 2 классических бита; Ex 2–4: 1 целевой кубит, 2 контрольных/синдромных кубита, 3 классических бита).
* **Сложность:** Easy–Medium (Lab 1 Introductory), Time Limit ~5s, Memory Limit 1024 MiB.

---

## 2. Условие задачи (Problem Statement)

### Lab 1: Dynamic Circuits and Repeat until success
* **Time Limit:** 5 seconds
* **Memory Limit:** 1024 MiB
* **Challenge:** IBM Quantum Challenge: Spring 2023

#### Problem Statement
**Dynamic circuits** are quantum circuits that contain mid-circuit measurements where the results of those measurements are used to condition quantum gates later in the circuit via real-time classical feedforward (using `qc.if_test()`).

The lab consists of 4 progressive exercises:

1. **Exercise 1 (Conditional Branching):**
   Design a 2-qubit circuit ($q_0, q_1$) with classical register ($b_0, b_1$). Apply $H$ on $q_0$ and measure $q_0 \to b_0$.
   Conditioned on $b_0$:
   - If $b_0 == 0$, apply an $X$ gate on $q_1$.
   - If $b_0 == 1$, apply a Hadamard $H$ on $q_1$.
   Finally, measure $q_1 \to b_1$.

2. **Repeat Until Success (RUS) for Non-Clifford Gate Synthesis:**
   Synthesize an $R_X(\theta)$ gate where $\cos\theta = \frac{3}{5}$ using the finite universal gate set $\{H, X, S, \text{Toffoli}\}$ on 3 qubits (1 target qubit, 2 syndrome/control qubits).
   If both syndrome qubits measure $00$, the operation $R_X(\theta)$ succeeded. If the measurement is not $00$, an unwanted $X$ error is applied to the target qubit and the syndrome qubits must be reset to $|00\rangle$ to repeat the trial.

3. **Exercise 2 (RUS Trial Step):**
   Implement `trial(circuit, target, controls, measures)`:
   - Apply $H$ on each qubit in `controls` ($q_0, q_1$) and on `target` ($q_2$).
   - Apply Toffoli ($\text{CCX}$) with controls on `controls` and target on `target`.
   - Apply $S$ gate on `target`.
   - Apply another Toffoli ($\text{CCX}$) on `controls` $\to$ `target`.
   - Apply $H$ on `controls` and `target`.
   - Measure `controls` into `measures` ($b_0, b_1$).

4. **Exercise 3 (Active Reset):**
   Implement `reset_controls(circuit, controls, measures)` to reset the control qubits if they collapsed to $|1\rangle$ without using hardware relaxation ($T_1$ wait):
   - If `measures[0] == 1`, apply $X$ on `controls[0]`.
   - If `measures[1] == 1`, apply $X$ on `controls[1]`.

5. **Exercise 4 (Full RUS Cycle with Fallback):**
   Qiskit control flow handles non-`00` conditions via `with qc.if_test((measures, 0b00)): pass` followed by an `else:` branch:
   - In the `else:` branch: reset the `target` qubit back to $|0\rangle$ (since failure state is known to be $X|\psi\rangle$), and execute `trial(...)` a second time.

#### Constraints
* Mid-circuit measurement values must be conditioned using `with qc.if_test((classical_bit, value)):` or `qc.if_test((register, int_val))`.
* Qiskit Little-Endian bit ordering ($b_0$ is the least significant bit).
* Gate set restricted to $\{H, X, S, \text{CCX}\}$ and classical control flow (`IfElseOp`).

#### Sample Input / Output
* **Ex 1:** Measurement outcomes for $(b_1, b_0)$ are distributed across $|00\rangle$ (from $q_0=0 \to X(q_1)$), $|01\rangle$ and $|11\rangle$ (from $q_0=1 \to H(q_1)$ with 50/50 split), with $P(10) = 0$.
* **Ex 2–4 (RUS):** Success branch ($b = 00$) transforms $|\psi_{\text{in}}\rangle \to R_X(\theta)|\psi_{\text{in}}\rangle$ with probability $P_{\text{succ}} = \frac{5}{8} = 62.5\%$ per round. After 2 rounds, total success probability is $1 - (1 - 0.625)^2 = 85.9\%$.

---

## 3. Анализ проверяющей системы (Auto-Judge)
* **Принцип проверки:** `qc-grader` (`grade_ex1b`, `grade_ex1c`, `grade_ex1d`, `grade_ex1e`) выполняет двухуровневую валидацию:
  1. *Статический анализ графа схемы:* инспекция `DAGCircuit` на соответствие квантовых регистров, наличие `IfElseOp` блоков, корректность привязки классических битов к условиям и отсутствие неразрешенных инструкций.
  2. *Динамическая симуляция с ветвлениями:* запуск `qiskit_aer.AerSimulator` с поддержкой Dynamic Circuits / Classical Control Flow на выборке шотов (1024–4096) и верификация условных распределений состояний на каждом этапе ветвления.
* **Оценка числа тестов:** 4 независимых этапа проверки (по одному на каждое упражнение) с анализом траекторий для каждого классического исхода ($00, 01, 10, 11$).
* **Каверзные случаи:**
  - Неправильный битовый порядок при проверке регистра `measures`: в Qiskit `0b01` vs `0b10` зависит от индексации Little-Endian.
  - Попытка использовать `qc.reset()` вместо условного вентиля $X$ (активный сброс требует классически управляемого $X$, так как состояние после ошибки детерминировано).
  - Нарушение фазовой когерентности целевого кубита при некорректном порядке измерений и обратных преобразований.
  - Реализация ветвления `!= 00` через трюк `if 00: pass; else: ...` из-за ограничений синтаксиса предикатов Qiskit.
* **Асимптотика и быстродействие:** Размерность гильбертова пространства $N \le 3$ ($2^3 = 8$ амплитуд). Симуляция 4 траекторий ветвления занимает $O(K \cdot 2^N) = O(1)$ по времени и $< 10$ МБ памяти. Время валидации судьей: $\approx 100\text{--}200$ мс.
* **Полная проверка без шотов и перебор:**
  - *Проверка без шотов:* **Да (через плотностную матрицу / супер-операторы ветвей)**. Каждая ветвь динамической схемы аналитически эквивалентна набору операторов Крауса $M_k$. Валидация отдельных ветвей $M_{00} \propto R_X(\theta)$ и $M_{\text{fail}} \propto X$ выполняется точно без стохастического шума.
  - *Решаемость перебором:* **Исключена / Крайне неэффективна**. Наличие структур классического контроля (`if_test`, `else`, промежуточные измерения) разрывает непрерывное унитарное пространство поиска. Комбинаторный перебор структуры графа с динамическим контролем требует знания семантики протокола.

---

## 4. Оценка ресурсов и применимость в GUI
* **Примерное число гейтов:**
  - Ex 1: 2 $H$, 1 $X$, 2 `Measure`, 2 блока `if_test`. Глубина 3–4.
  - Ex 2 (Trial): 4 $H$, 2 CCX (Toffoli), 1 $S$, 2 `Measure`. Глубина 7.
  - Ex 3 (Reset): 2 условных $X$. Глубина 1.
  - Ex 4 (Full RUS): 8 $H$, 4 CCX, 2 $S$, 3 условных $X$, 4 `Measure`, 1 составной блок `IfElseOp`. Глубина 15–18.
* **Решаемость в визуальном конструкторе:** `ЧАСТИЧНО` — Простые условные операции (Ex 1, Ex 3) поддерживаются в GUI с функционалом classically controlled gates. Полный протокол RUS (Ex 4) с вложенными подграфами `else`, повторными вызовами процедур и ветвлением по значениям регистров требует расширенного редактора Dynamic Control Flow (не поддерживается в базовых статических drag-and-drop редакторах).
* **Теги:** `[DYNAMIC_CIRCUITS]`, `[MID_CIRCUIT_MEASUREMENT]`, `[ACTIVE_RESET]`, `[REPEAT_UNTIL_SUCCESS]`, `[CONTROL_FLOW]`, `[GUI_PARTIAL]`, `[BRUTE_FORCE_PROTECTED]`.
