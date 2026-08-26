# Final Stage: 4-Qubit Unitary Synthesis & Circuit Cost Optimization

## 1. Классификация и метаданные
* **ID задачи:** `ibm_challenge_2020_final_unitary_compression`
* **Источник:** https://github.com/qiskit-community/IBMQuantumChallenge2020/blob/main/exercises/week-3/final_en.ipynb
* **Платформа:** IBM Quantum Challenge 2020 (Week 3 / Final Stage)
* **Общее описание:** Синтез и структурная компрессия 4-кубитной квантовой схемы для целевого унитарного оператора $U \in \mathrm{U}(16)$ (алгоритм Гровера с 1 итерацией для решения задачи False Asteroids) с минимизацией функции стоимости $\text{Cost} = 10 \cdot N_{\text{CX}} + N_{1Q}$ при точности унитарной аппроксимации $|\mathrm{Tr}(U^\dagger U_{\text{user}})| \ge 16 \cdot (1 - 10^{-4})$.
* **Результат решения:** `ФИКСИРОВАННАЯ ЧИСТО КВАНТОВАЯ СХЕМА`
* **Формат ответа:**
  ```python
  from qiskit import QuantumCircuit
  import numpy as np

  def solve(target_unitary: np.ndarray) -> QuantumCircuit:
      qc = QuantumCircuit(4)
      # Синтез и оптимизация квантовой схемы в базисе {u3, cx}
      return qc
  ```
  *(В контексте оригинального этапа Week 3 Challenge)*:
  ```python
  from qiskit import QuantumCircuit

  def week3_ans_func(problem_set: list) -> QuantumCircuit:
      qc = QuantumCircuit(4, 4)
      # Построение оптимизированной схемы (Grover Oracle + Diffusion, <= 28 кубитов)
      return qc
  ```
* **Число кубитов:** 4 кубита (без анцилл при синтезе унитарного оператора $U \in \mathrm{U}(16)$; до 28 кубитов с анциллами в исходной формулировке оракула).
* **Сложность:** Leaderboard Cost Optimization (Hard), Time Limit 10s, Memory Limit 1024 MiB.

---

## 2. Условие задачи (Problem Statement)

### Final Stage: 4-Qubit Unitary Synthesis & Circuit Cost Optimization
* **Time Limit:** 10 seconds
* **Memory Limit:** 1024 MiB
* **Score:** Circuit Cost Optimization ($\text{Score} = \text{Cost} = 10 \cdot N_{\text{CX}} + N_{1Q}$)

#### Problem Statement
*Dr. Ryoko is stuck in the quantum multiverse due to noise clusters interfering with her device. Help Dr. Ryoko identify that one area (board) with noise clusters that **cannot be cleared within 3 shots**.*

#### Asteroids Puzzle Rules
* The asteroids are placed on a $4 \times 4$ grid.
* The objective is to destroy all the asteroids by shooting laser beams: either vertically or horizontally.
* An Asteroid problem is *false* if the asteroids cannot be cleared within the specified number of beams (3 shots).
* There are 16 areas (boards), each with 6 noise clusters (asteroids). Exactly one board cannot be cleared within 3 laser shots.
* Use Grover's algorithm with iteration = 1 to find that one board index.

A board with asteroids is represented as a list of coordinates:
```python
[['0', '0'], ['1', '1'], ['2', '2'], ['3', '0'], ['3', '1'], ['3', '2']]
```

#### Unitary Decomposition & Circuit Cost Optimization
The complete Grover search circuit for this 4-qubit space corresponds to an effective unitary operator $U \in \mathrm{U}(2^4) = \mathrm{U}(16)$. Synthesize an optimized quantum circuit $U_{\text{user}}$ approximating $U$ while minimizing the circuit cost function:
$$\text{Cost} = 10 \cdot (\text{count of CNOT}) + (\text{count of single-qubit gates})$$

#### Constraints
* $n = 4$ кубита (пространство состояний $\mathbb{C}^{16}$).
* Базисный набор вентилей (Basis gates): $\{u3, cx\}$ (или $\{rz, sx, x, cx\}$).
* Критерий корректности унитарной аппроксимации:
  $$|\mathrm{Tr}(U^\dagger U_{\text{user}})| \ge 16 \cdot (1 - 10^{-4})$$
* Число кубитов в итоговой схеме: $\le 28$ кубитов в исходном оракуле / ровно 4 кубита в сжатом унитарном представлении.
* Решение должно корректно масштабироваться и работать на различных наборах данных `problem_set`.
* Запрещены читерские решения, использующие классический предопределенный ответ.

#### Sample Input / Output
* Target: 4-qubit unitary $U \in \mathrm{U}(16)$ representing Grover operator (Oracle + Diffusion) for the False Asteroids configuration.
* Output: Decomposed `QuantumCircuit` with unrolled gate set $\{u3, cx\}$ achieving trace fidelity $\ge 0.9999$ with minimal cost score.

#### Hints
* Decompose multi-controlled gates into relative-phase Toffoli / Margolus gates or compact dirty-ancilla ladders.
* Utilize Cartan's KAK decomposition for arbitrary 2-qubit sub-blocks (maximum 3 CX gates per 2-qubit unitary).
* Cancel adjacent single-qubit rotations by Euler angle fusion: $U_3(\theta_1, \phi_1, \lambda_1) \cdot U_3(\theta_2, \phi_2, \lambda_2) \to U_3(\theta_3, \phi_3, \lambda_3)$.

---

## 3. Анализ проверяющей системы (Auto-Judge)
* **Принцип проверки:** Судья принимает возвращенный `QuantumCircuit`, транслирует его в базис `['u3', 'cx']` с помощью транспайлера (`Unroller` / `BasisTranslator`), вычисляет результирующую унитарную матрицу $U_{\text{user}} = \mathrm{Operator}(qc).\mathrm{data}$ и проверяет нормированную точность по следу Гильберта–Шмидта:
  $$F(U, U_{\text{user}}) = \frac{1}{16} |\mathrm{Tr}(U^\dagger U_{\text{user}})| \ge 1 - 10^{-4}$$
  После прохождения порога точности вычисляется итоговый балл:
  $$\text{Score} = 10 \cdot N_{\text{CX}} + N_{1Q}$$
* **Каверзные случаи:**
  - *Глобальная фаза:* Модуль следа $|\mathrm{Tr}(U^\dagger U_{\text{user}})|$ инвариантен к глобальному фазовому сдвигу $e^{i\phi}$.
  - *Оптимальность декомпозиции 4-кубитного унитария:* Произвольный 4-кубитный оператор требует до сотен CX-гейтов (теорема Шенде–Маркова). Однако оператор Гровера для разреженной задачи обладает высокой симметрией, что позволяет снизить число CX до $< 35$.
  - *Учет порядка кубитов (little-endian):* Порядок тензорного произведения в Qiskit: $q_0$ — младший бит, $q_3$ — старший бит.
  - *Слияние смежных однокубитных вентилей:* Любая непрерывная последовательность однокубитных поворотов на одной линии должна быть свернута в ровно один вентиль $U3$, иначе функция стоимости будет штрафовать за лишние 1Q-гейты.
* **Оценка числа тестов:** 1 основная целевая матрица $16 \times 16$ (для лидерборда) + 5–10 скрытых тестовых наборов `problem_set` для проверки обобщающей способности генератора.
* **Асимптотика и быстродействие:** Сложность симуляции и перемножения матриц $16 \times 16$: $O(16^3) = 4096$ операций, потребление памяти $< 1$ МБ. Время трансляции и вычисления точности $< 5$ мс. Суммарное время валидации $< 100$ мс.
* **Полная проверка без шотов и перебор:**
  - *Проверка без шотов:* **Да, 100%**. Аналитическая проверка через `Operator(qc)` и матричный след без статистической погрешности измерений.
  - *Решаемость перебором:* **Защищена (непрерывная оптимизация параметров)**. Непрерывные углы вращений $U3(\theta, \phi, \lambda)$ и экспоненциальное число топологий зацепления исключают дискретный перебор. Требуется аналитическая декомпозиция (KAK/CSD) или градиентный синтез (QSearch, Riemannian optimization).

---

## 4. Оценка ресурсов и применимость в GUI
* **Примерное число гейтов:**
  - Неоптимизированная схема / стандартный транспайлер: $\sim 150$–$250$ CX, $\sim 200$–$400$ 1Q-гейтов, $\text{Cost} \sim 1800$–$2900$.
  - Оптимизированное решение победителей соревнования: $\sim 20$–$35$ CX, $\sim 30$–$50$ 1Q-гейтов, $\text{Cost} \sim 230$–$400$, глубина $\sim 30$–$60$.
* **Решаемость в визуальном конструкторе:** `ЧАСТИЧНО` — фиксированная 4-кубитная схема может быть вручную собрана и отредактирована в GUI (набор вентилей мал), однако нахождение оптимальной структуры и углов вращения требует численных методов синтеза.
* **Теги:** `[VISUAL_GUI_READY]`, `[UNITARY_SYNTHESIS]`, `[CIRCUIT_COMPRESSION]`, `[COST_OPTIMIZATION]`, `[GROVER_SEARCH]`, `[LEADERBOARD_CHALLENGE]`, `[BRUTE_FORCE_PROTECTED]`.
