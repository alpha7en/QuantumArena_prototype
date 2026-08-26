# A5: Generate State 1/sqrt(2)(|0> - |2^n-1>) III

## 1. Классификация и метаданные
* **ID задачи:** `qcoder_qpc002_a5`
* **Источник:** https://www.qcoder.jp/en/contests/QPC002/problems/A5
* **Платформа:** QCoder (QPC002)
* **Общее описание:** Сформировать квантовую схему глубиной не более 6 для приготовления $n$-кубитного обобщенного состояния Гринбергера — Хорна — Цайлингера с отрицательной фазой $|\psi\rangle = \frac{1}{\sqrt{2}}(|0\rangle - |2^n-1\rangle)$.
* **Результат решения:** `ПАРАМЕТРИЗОВАННЫЙ ГЕНЕРАТОР СХЕМЫ`
* **Формат ответа:**
  ```python
  from qiskit import QuantumCircuit

  def solve(n: int) -> QuantumCircuit:
      qc = QuantumCircuit(n)
      # Write your code here:
      return qc
  ```
* **Число кубитов:** $n$ кубитов ($1 \le n \le 10$, без дополнительных анцилл).
* **Сложность:** Score 200 points, Time Limit 3 seconds, Memory Limit 512 MiB.

---

## 2. Условие задачи (Problem Statement)

### A5: Generate State 1/sqrt(2)(|0> - |2^n-1>) III
* **Time Limit:** 3 seconds
* **Memory Limit:** 512 MiB
* **Score:** 200 points

#### Problem Statement
You are given an integer $n$. Implement the operation of preparing the state $|\psi\rangle = \frac{1}{\sqrt{2}}(|0\rangle - |2^n-1\rangle)$ on a quantum circuit `qc` with $n$ qubits.

#### Constraints
* $1 \le n \le 10$
* The circuit depth must not exceed 6.
* Global phase is ignored in judge.
* The submitted code must follow the specified format:
```python
from qiskit import QuantumCircuit

def solve(n: int) -> QuantumCircuit:
    qc = QuantumCircuit(n)
    # Write your code here:
    return qc
```

#### Sample Input / Output
* Sample 1: $n = 1$
  $$|0\rangle \xrightarrow{qc} \frac{1}{\sqrt{2}}(|0\rangle - |1\rangle) = |-\rangle$$
* Sample 2: $n = 2$
  $$|00\rangle \xrightarrow{qc} \frac{1}{\sqrt{2}}(|00\rangle - |11\rangle) = |\Phi^-\rangle$$

#### Hints
Open

---

## 3. Анализ проверяющей системы (Auto-Judge)
* **Принцип проверки:**
  - Судья выполняет вызов `solve(n)` для набора значений $n \in [1, 10]$.
  - Проверяет структуру схемы: количество кубитов равно $n$, отсутствие операций измерения, строгое выполнение ограничения глубины `qc.depth() <= 6`.
  - Моделирует эволюцию начального состояния $|0\rangle^{\otimes n}$ через вектор состояния `Statevector`.
  - Проверяет эквивалентность полученного вектора состояния $|\psi_{actual}\rangle$ и целевого вектора $|\psi_{target}\rangle = \frac{1}{\sqrt{2}}(|0^{\otimes n}\rangle - |1^{\otimes n}\rangle)$ с точностью до глобальной фазы ($|\langle \psi_{target} | \psi_{actual} \rangle| \ge 1 - 10^{-7}$).
* **Каверзные случаи:**
  - *Ограничение глубины ($\le 6$):* Линейная цепочка вентилей CNOT ($0 \to 1 \to 2 \dots$) имеет глубину $O(n) \approx 10$, что приводит к вердикту `Wrong Answer` / `Depth Exceeded`. Обязательно использование параллельного бинарного дерева распространения запутанности с глубиной $O(\lceil \log_2 n \rceil) \le 4$.
  - *Базовый случай $n = 1$:* Состояние $|-\rangle$ формируется без двухкубитных гейтов (например, гейты $X$ и $H$ или $H$ и $Z$).
  - *Глобальная фаза:* Допускаются состояния с противоположным общим знаком $\frac{1}{\sqrt{2}}(|2^n-1\rangle - |0\rangle)$ или фазовым множителем $e^{i\phi}$.
* **Оценка числа тестов:** 10 тестов (полное покрытие диапазона $n = 1, 2, \dots, 10$).
* **Асимптотика и быстродействие:**
  - Размерность пространства состояний: максимум $2^{10} = 1024$ амплитуд.
  - Вычисление `Statevector` для схемы глубины $\le 6$ и размера $\le 10$ кубитов занимает единицы микросекунд на тест.
  - Память симуляции: $O(2^n) \le 16$ КБ.
  - Суммарное время валидации всех тестов: $< 50$ мс (существенно ниже лимита 3.0 с).
* **Полная проверка без шотов и перебор:**
  - *Проверка без шотов:* **Да, 100%**. Аналитическая проверка через `Statevector` гарантирует детерминированный результат без стохастического шума.
  - *Решаемость перебором:* **Частично**. Для $n \le 4$ пространство поиска схем мало ($|G|^D \approx 4^6$), брутфорс эффективен. Для $n = 10$ при случайном поиске пространство перестановок пар кубитов велико ($10^{2 \times 4}$), однако задача полностью решается типовым алгоритмическим паттерном параллельного CNOT-дерева.

---

## 4. Оценка ресурсов и применимость в GUI
* **Примерное число гейтов:**
  - Однокубитные: 1–2 гейта (например, $X$ и $H$ на 0-м кубите).
  - Двухкубитные: ровно $(n - 1)$ гейтов `CX` (CNOT), распараллеленных по слоям с шагами $1, 2, 4, 8$.
  - Итоговая глубина: $1 + \lceil \log_2 n \rceil$ (при использовании $R_y(-\pi/2)$) или $2 + \lceil \log_2 n \rceil$ (при использовании $X + H$). Для $n=10$: глубина $2 + 4 = 6 \le 6$.
* **Решаемость в визуальном конструкторе:**
  - `ДА (100%)` для каждого конкретного значения $n$ — схема для любого $n \in [1, 10]$ собирается на палитре за $O(n)$ шагов.
  - `НЕТ (ТОЛЬКО КОД)` для параметрического генератора произвольного $n$ (требуется цикл с шагом $2^k$).
  - Итоговая классификация: `ЧАСТИЧНО`.
* **Теги:** `[VISUAL_GUI_READY]`, `[PARAMETRIC_CODE_ONLY]`, `[STATE_PREPARATION]`, `[DEPTH_OPTIMIZED]`, `[ENTANGLEMENT]`, `[BRUTE_FORCE_PROTECTED]`.
