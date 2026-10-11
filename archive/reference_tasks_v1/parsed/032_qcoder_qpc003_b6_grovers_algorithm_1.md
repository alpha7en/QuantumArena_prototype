# B6: Grover's Algorithm I

## 1. Классификация и метаданные
* **ID задачи:** `qcoder_qpc003_b6`
* **Источник:** https://www.qcoder.jp/en/contests/QPC003/problems/B6
* **Платформа:** QCoder (QPC003)
* **Общее описание:** Построить квантовую схему алгоритма Гровера для приготовления единственного целевого состояния $|w\rangle$ по заданному фазовому оракулу $O_w$ на $n$ кубитах.
* **Результат решения:** `ОРАКУЛЬНЫЙ АЛГОРИТМ`
* **Формат ответа:**
  ```python
  from qiskit import QuantumCircuit

  def solve(n: int, oracle: QuantumCircuit) -> QuantumCircuit:
      # Grover state preparation
      return qc
  ```
* **Число кубитов:** $n$ кубитов ($1 \le n \le 5$, без дополнительных анцилл).
* **Сложность:** Score 300, Time Limit 3s, Memory Limit 512 MiB.

---

## 2. Условие задачи (Problem Statement)

### B6: Grover's Algorithm I
* **Time Limit:** 3 seconds
* **Memory Limit:** 512 MiB
* **Score:** 300 points

#### Problem Statement
You are given an integer $n$ and a phase oracle $O_w$ that flips the sign of a single target state $|w\rangle$:
$$O_w |x\rangle = \begin{cases} -|x\rangle, & \text{if } x = w, \\ |x\rangle, & \text{if } x \ne w. \end{cases}$$

Implement Grover's algorithm to prepare the target state $|w\rangle$ with probability $> 0.99$ (or exact for small $n$) by calculating the optimal number of iterations:
$$k = \left\lfloor \frac{\pi}{4}\sqrt{2^n} \right\rfloor.$$

#### Constraints
* $1 \le n \le 5$
* Global phase is ignored in judge.
* The submitted code must follow the specified format:
```python
from qiskit import QuantumCircuit

def solve(n: int, oracle: QuantumCircuit) -> QuantumCircuit:
    # Grover state preparation
    return qc
```

#### Sample Input / Output
* $n=2$, target state $|w\rangle = |11\rangle$:
  - Optimal iterations $k = \lfloor \frac{\pi}{4}\sqrt{4} \rfloor = 1$.
  - State evolution:
    $$|00\rangle \xrightarrow{H^{\otimes 2}} \frac{1}{2}(|00\rangle + |01\rangle + |10\rangle + |11\rangle) \xrightarrow{O_{11}} \frac{1}{2}(|00\rangle + |01\rangle + |10\rangle - |11\rangle) \xrightarrow{D} |11\rangle.$$
  - Target state preparation fidelity: $1.0$.

#### Hints
Open

---

## 3. Анализ проверяющей системы (Auto-Judge)
* **Принцип проверки:** Судья инстанциирует фазовые оракулы $O_w$ для различных целевых базисных состояний $w \in \{0, 1\}^n$ при $n \in [1, 5]$. Вызывает функцию `solve(n, oracle)` и получает итоговую схему `QuantumCircuit`. Состояние инициализируется в $|0\rangle^{\otimes n}$, симулируется через `Statevector` без измерений, и вычисляется вероятность измерения целевого состояния $P(w) = |\langle w | \psi \rangle|^2$. Проверяется выполнение условия $P(w) \ge P_{\text{target}}(n)$ с игнорированием глобальной фазы.
* **Каверзные случаи:**
  - *Конструкция диффузора Гровера ($D = 2|s\rangle\langle s| - I$):* Реализуется как $H^{\otimes n} X^{\otimes n} (MCZ) X^{\otimes n} H^{\otimes n}$ (с точностью до глобальной фазы). Ошибки в фазовом сдвиге нулевого состояния $|0\rangle^{\otimes n}$ приводят к деструктивной интерференции.
  - *Композиция оракула:* Входной оракул передается как объект `QuantumCircuit` и должен компоноваться через `qc.compose(oracle)` на каждой из $k$ итераций без искажения кубитных регистров.
  - *Оптимальное число итераций:* Отклонение от $k = \lfloor \frac{\pi}{4}\sqrt{2^n} \rfloor$ (перекручивание фазы / over-rotation) снижает амплитуду целевого состояния.
  - *Граничные случаи $n=1, 2$:* Для $n=1$ ($k=1$) и $n=2$ ($k=1$) достигается точное или максимально близкое совмещение с $|w\rangle$.
* **Оценка числа тестов:** 15–30 тестовых запусков (наборы оракулов для всех $w \in \{0, 1\}^n$ при $n \in [1, 3]$ и выборка для $n=4, 5$).
* **Асимптотика и быстродействие:** Сложность симуляции $O(2^n)$ по времени и памяти. При $n \le 5$ максимальный размер вектора состояний $2^5 = 32$ комплексных числа (память $< 1$ КБ). Время выполнения симуляции одного теста $< 1$ мс, суммарное время валидации всех тестов $< 50$ мс.
* **Полная проверка без шотов и перебор:**
  - *Проверка без шотов:* **Да, 100%**. Аналитическая проверка через `Statevector` с расчетом точной вероятности проекции на $|w\rangle$.
  - *Решаемость перебором:* **Защищена**. Оракул является черным ящиком (`black-box QuantumCircuit`), неизвестным до запуска функции; подобрать статическую схему без реализации алгоритмического шаблона Гровера невозможно.

---

## 4. Оценка ресурсов и применимость в GUI
* **Примерное число гейтов:** При $n=5$ ($k=4$ итерации):
  - Начальная суперпозиция: $n=5$ гейтов $H$.
  - Каждая итерация: 1 вызов `oracle` + диффузор ($2n = 10$ гейтов $H$, $2n = 10$ гейтов $X$, 1 $C^4Z$ / многоконтрольный фазовый вентиль).
  - Итого для $n=5$: $\sim 85$ однокубитных гейтов, 4 многокубитных $MCZ$ гейта (или $\sim 30$–$40$ вентилей $CX$/$2Q$ при декомпозиции), глубина $\sim 30$–$50$.
* **Решаемость в визуальном конструкторе:** `НЕТ (ТОЛЬКО КОД)` — функция принимает динамический объект `oracle: QuantumCircuit`, вычисляет $k(n)$ в рантайме и требует программной сборки схемы в цикле `for _ in range(k)`.
* **Теги:** `[PARAMETRIC_CODE_ONLY]`, `[ORACLE_PHASE]`, `[GROVER_SEARCH]`, `[STATE_PREPARATION]`, `[BRUTE_FORCE_PROTECTED]`.
