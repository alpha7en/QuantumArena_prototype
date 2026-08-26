# Lab 2: Quantum Teleportation with Real-Time Dynamic Feedforward

## 1. Классификация и метаданные
* **ID задачи:** `ibm_spring_2023_lab2_quantum_teleportation`
* **Источник:** https://github.com/qiskit-community/ibm-quantum-challenge-spring-2023/blob/main/content/lab_2/lab2.ipynb
* **Платформа:** IBM Quantum Challenge (Spring 2023)
* **Общее описание:** Реализовать протокол квантовой телепортации неизвестного однокубитного состояния $|\psi\rangle$ с использованием запутанной пары Белла, промежуточных измерений (mid-circuit measurements) и динамических классических операций коррекции Паули в реальном времени (`if_test`).
* **Результат решения:** `ДИНАМИЧЕСКАЯ КВАНТОВАЯ СХЕМА`
* **Формат ответа:**
  ```python
  from qiskit import QuantumCircuit, QuantumRegister, ClassicalRegister

  def create_bell_pair(qr: QuantumRegister, cr: ClassicalRegister) -> QuantumCircuit:
      ...

  def alice_gates(qr: QuantumRegister, cr: ClassicalRegister) -> QuantumCircuit:
      ...

  def measure_and_send(qr: QuantumRegister, cr: ClassicalRegister) -> QuantumCircuit:
      ...

  def bob_gates(qr: QuantumRegister, cr: ClassicalRegister) -> QuantumCircuit:
      ...
  ```
* **Число кубитов:** 3 квантовых кубита ($s$ — исходный кубит данных $|\psi\rangle$, $a$ — половина пары Белла у Алисы, $b$ — половина пары Белла у Боба) и 3 классических бита ($c0$ для измерения $a$, $c1$ для измерения $s$, $c2$ для итогового измерения $b$).
* **Сложность:** 5 этапов автопроверки (`qc-grader`), Time Limit: ~10s, Memory Limit: 1024 MiB.

---

## 2. Условие задачи (Problem Statement)

### Lab 2: Quantum Teleportation
* **Platform:** IBM Quantum Challenge Spring 2023
* **Topic:** Dynamic Circuits & Real-Time Classical Feedforward

#### Problem Statement
Quantum teleportation is a protocol that allows the transfer of quantum information from one qubit to another using entanglement and classical communication (Bennett et al., 1993). The process does not transmit the physical qubit itself but transfers the quantum state $|\psi\rangle = \alpha |0\rangle + \beta |1\rangle$ from the source qubit to the target qubit.

The protocol requires three qubits:
1. $s$: The "source" qubit containing the unknown state $|\psi\rangle$ which Alice wishes to transmit to Bob.
2. $a$: The qubit which will initially store Alice's half of the entangled Bell pair.
3. $b$: The qubit which will initially store Bob's half of the entangled Bell pair.

And three classical bits:
- $c0$: Classical bit storing the measurement of qubit $a$.
- $c1$: Classical bit storing the measurement of qubit $s$.
- $c2$: Classical bit for Bob's final measurement of qubit $b$.

The workflow is broken into 5 exercises:

#### Exercise 1: Create Bell Pair
Utilize two qubits to generate an entangled Bell pair state $|\Phi^+\rangle = \frac{|00\rangle + |11\rangle}{\sqrt{2}}$. Qubit $a$ is allocated to Alice, while qubit $b$ is designated for Bob.
```python
def create_bell_pair(qr: QuantumRegister, cr: ClassicalRegister) -> QuantumCircuit:
    """Creates a Bell pair between qubits a and b."""
    qc = QuantumCircuit(qr, cr)
    _, a, b = qr
    # Your code here
    return qc
```

#### Exercise 2: Alice's Operations
Perform the next steps of the protocol:
1. Alice applies a $\text{CNOT}$ gate with $s$ (control) and $a$ (target).
2. Alice applies a Hadamard ($H$) gate to $s$.
```python
def alice_gates(qr: QuantumRegister, cr: ClassicalRegister) -> QuantumCircuit:
    """Creates Alice's gates"""
    qc = create_bell_pair(qr, cr)
    qc.barrier()
    s, a, b = qr
    # Your code here
    return qc
```

#### Exercise 3: Mid-Circuit Measurement
Alice performs a measurement on both qubits in her possession:
- Measure qubit $a$ into classical bit $c0$.
- Measure qubit $s$ into classical bit $c1$.
```python
def measure_and_send(qr: QuantumRegister, cr: ClassicalRegister) -> QuantumCircuit:
    """Measures qubits a & s and 'sends' the results to Bob"""
    qc = alice_gates(qr, cr)
    qc.barrier()
    s, a, b = qr
    c0, c1, c2 = cr
    # Your code here
    return qc
```

#### Exercise 4: Bob's Dynamic Correction (Real-Time Feedforward)
Bob dynamically applies specific Pauli gates to qubit $b$ based on Alice's classical measurement results:
- If bits $(c1, c0) = 00$: No action required.
- If bit $c0 = 1$ ($a$ measured as 1): Apply Pauli-$X$ gate.
- If bit $c1 = 1$ ($s$ measured as 1): Apply Pauli-$Z$ gate.
- If bits $(c1, c0) = 11$: Apply both Pauli-$X$ and Pauli-$Z$ gates ($ZX$).
```python
def bob_gates(qr: QuantumRegister, cr: ClassicalRegister) -> QuantumCircuit:
    """Uses qc.if_test to control which gates are dynamically added"""
    qc = measure_and_send(qr, cr)
    qc.barrier()
    s, a, b = qr
    c0, c1, c2 = cr
    # Your code here
    return qc
```

#### Exercise 5: Verification & Superposition State Teleportation
1. Prepare qubit $s$ in state $|\psi\rangle = R_x(\pi/4)|0\rangle$.
2. Combine state preparation with the teleportation circuit.
3. Measure Bob's qubit $b$ into classical bit $c2$.
4. Simulate the circuit and verify that the marginal probability distribution of $c2$ matches $|\langle 0|\psi\rangle|^2 = \cos^2(\pi/8) \approx 0.8536$ and $|\langle 1|\psi\rangle|^2 = \sin^2(\pi/8) \approx 0.1464$.

#### Constraints
* Must use dynamic circuits syntax (`with qc.if_test(...)`) rather than deferred measurement unitary gates.
* Register convention: $qr = [s, a, b]$, $cr = [c0, c1, c2]$.

---

## 3. Анализ проверяющей системы (Auto-Judge)
* **Принцип проверки:**
  - `grade_ex2a`–`grade_ex2d`: пошаговый структурный и унитарный анализ графа схемы (DAGCircuit / AST) на наличие корректных вентилей $H$, $CX$, mid-circuit `measure` и контекстных блоков `if_test((c0, 1))` / `if_test((c1, 1))`.
  - `grade_ex2e`: запуск схемы на симуляторе с поддержкой динамических цепей (`AerSimulator`), расчет маргинального распределения бита $c2$ по выборке шотов ($\sim 1000$–$4000$) и проверка близости эмпирических вероятностей к теоретическим значениям $\cos^2(\pi/8)$ и $\sin^2(\pi/8)$ (допустимая погрешность $\varepsilon < 0.03$).
* **Оценка числа тестов:** 5 независимых проверочных хуков (`grade_ex2a` – `grade_ex2e`), проверяющих инкрементальную корректность каждого слоя схемы и итоговое сохранение квантового состояния.
* **Каверзные случаи:**
  - *Неправильное сопоставление битов управления:* перепутывание битов $c0$ и $c1$ (применение $Z$ по $c0$ и $X$ по $c1$) приводит к потере когерентности и падению fidelity телепортации до $\sim 0.5$.
  - *Порядок коррекций Паули:* матрица преобразования требует применения $X^{c0}$ с последующим $Z^{c1}$ (так как $Z^{c1} X^{c0} |\psi_{coll}\rangle = |\psi\rangle$).
  - *Mid-circuit симуляция:* стандартный симулятор операторов `Operator(qc)` выдает ошибку на схемах с измерениями и `if_test`; требуется поддержка динамических квантовых цепей (OpenQASM 3 / Dynamic Circuits).
* **Асимптотика и быстродействие:** Размерность пространства состояний: $2^3 = 8$ амплитуд ($O(1)$ по времени и памяти < 1 КБ). Симуляция 4000 шотов занимает $\sim 10$–$30$ мс. Полное время работы автогрейдера: $< 100$ мс.
* **Полная проверка без шотов и перебор:**
  - *Проверка без шотов:* **Да**. Аналитическая проверка возможна путем симуляции эволюции матрицы плотности / ветвления по 4 траекториям классических исходов $\{00, 01, 10, 11\}$ с проверкой аналитического совпадения редуцированного вектора состояния на кубите $b$ с исходным $|\psi\rangle$ (Fidelity $\mathcal{F} = 1.0$).
  - *Решаемость перебором:* **Да, тривиально**. Пространство поиска ограничено $\sim 5$ позициями гейтов из стандартного набора $\{H, CX, \text{Measure}, \text{if\_test}(X), \text{if\_test}(Z)\}$, объем конфигурационного пространства $< 10^3$, время полного перебора $< 0.1$ с.

---

## 4. Оценка ресурсов и применимость в GUI
* **Примерное число гейтов:**
  - 1Q гейты: 2 ($H$ на кубите $a$, $H$ на кубите $s$) + до 2 условных вентилей ($X, Z$ на $b$) + 1 гейт подготовки $R_x$.
  - 2Q гейты: 2 ($CX(s \to a)$, $CX(a \to b)$).
  - Измерения: 2 mid-circuit измерения ($a \to c0, s \to c1$) + 1 финальное ($b \to c2$).
  - Глубина схемы: 6–8 квантовых слоев.
* **Решаемость в визуальном конструкторе:** `ДА (100%)` — при наличии в GUI поддержки динамических цепей (классически управляемых гейтов `c_if` / `if_test` и mid-circuit измерений); `ЧАСТИЧНО` — в базовых редакторах без mid-circuit feedforward (требуется замена на эквивалентную схему с отложенными измерениями Deferred Measurement via $CX/CZ$).
* **Теги:** `[VISUAL_GUI_READY]`, `[DYNAMIC_CIRCUITS]`, `[MID_CIRCUIT_MEASUREMENTS]`, `[FEEDFORWARD]`, `[QUANTUM_TELEPORTATION]`, `[STATE_PREPARATION]`, `[BRUTE_FORCE_VULNERABLE]`.
