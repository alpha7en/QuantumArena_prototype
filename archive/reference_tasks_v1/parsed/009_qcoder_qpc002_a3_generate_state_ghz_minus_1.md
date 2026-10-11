# A3: Generate State 1/sqrt(2)(|0> - |2^n-1>) I

## 1. Классификация и метаданные
* **ID задачи:** `qcoder_qpc002_a3`
* **Источник:** https://www.qcoder.jp/en/contests/QPC002/problems/A3
* **Платформа:** QCoder (QPC002)
* **Общее описание:** Сгенерировать параметризованную квантовую схему для приготовления $n$-кубитного перепутанного состояния $|\psi\rangle = \frac{1}{\sqrt{2}}(|0\dots 0\rangle - |1\dots 1\rangle)$ (GHZ-минус) из нулевого начального состояния.
* **Результат решения:** `ПАРАМЕТРИЗОВАННЫЙ ГЕНЕРАТОР СХЕМЫ`
* **Формат ответа:**
  ```python
  from qiskit import QuantumCircuit

  def solve(n: int) -> QuantumCircuit:
      qc = QuantumCircuit(n)
      # Write your code here:
      return qc
  ```
* **Число кубитов:** $n$ ($1 \le n \le 10$, анциллы не требуются).
* **Сложность:** Score 300, Time Limit 3s, Memory Limit 512 MiB.

---

## 2. Условие задачи (Problem Statement)

### A3: Generate State 1/sqrt(2)(|0> - |2^n-1>) I
* **Time Limit:** 3 seconds
* **Memory Limit:** 512 MiB
* **Score:** 300 points

#### Problem Statement
You are given an integer $n$. Implement the operation of preparing the state $|\psi\rangle$ from the zero state on a quantum circuit `qc` with $n$ qubits.

$$|\psi\rangle = \frac{1}{\sqrt{2}} (|0\dots 0\rangle - |1\dots 1\rangle) = \frac{1}{\sqrt{2}} (|0\rangle - |2^n-1\rangle)$$

#### Constraints
* $1 \le n \le 10$
* Global phase is ignored in judge.
* The submitted code must follow the specified format:
```python
from qiskit import QuantumCircuit

def solve(n: int) -> QuantumCircuit:
    qc = QuantumCircuit(n)
    # Write your code here:
    return qc
```

#### Sample Input
$n = 3$:
$$|000\rangle \xrightarrow{qc} \frac{1}{\sqrt{2}} (|000\rangle - |111\rangle) = \frac{1}{\sqrt{2}} (|0\rangle - |7\rangle)$$

#### Hints
None

---

## 3. Анализ проверяющей системы (Auto-Judge)
* **Принцип проверки:** Судья вызывает функцию `solve(n)` для тестовых значений $n \in [1, 10]$, применяет полученную схему `qc` к начальному состоянию $|0\rangle^{\otimes n}$ и вычисляет `Statevector(qc)`. Полученный вектор сравнивается с целевым состоянием $|\psi\rangle = \frac{1}{\sqrt{2}}(|0\dots0\rangle - |1\dots1\rangle)$ с точностью до глобальной фазы (через `state_fidelity` $\ge 1 - 10^{-5}$ или $|\langle \psi | \psi_{target}\rangle| \approx 1$).
* **Оценка числа тестов:** ~10 тестовых запусков (все допустимые значения $n \in \{1, 2, \dots, 10\}$, включая граничные $n=1$, $n=2$, $n=10$).
* **Асимптотика и быстродействие:** Сложность симуляции одного теста: $O(2^n)$ по времени и памяти. При максимальном $n=10$ размерность вектора состояний составляет $2^{10} = 1024$ амплитуды ($\approx 16$ КБ). Суммарное время валидации всех тестов: $< 50$ мс (при общем лимите 3.0 с).
* **Полная проверка без шотов и перебор:**
  - *Проверка без шотов:* **Да, 100%**. Аналитическое вычисление `Statevector` и `state_fidelity` полностью исключает статистический шум измерений (shot noise) и детерминированно подтверждает корректность амплитуд и относительной фазы $\pi$.
  - *Решаемость перебором:* **Частично для малых $n$ / Защищена в общем виде**. Для фиксированного $n \le 3$ пространство перебора тривиально ($D \le 4$, $|G|^D < 10^4$). Однако требование универсальной параметрической генерации для всех $n \in [1, 10]$ защищает задачу от прямого табличного перебора.

---

## 4. Оценка ресурсов и применимость в GUI
* **Примерное число гейтов:** 2 однокубитных гейта ($X, H$ или $H, Z$), $n-1$ двухкубитных гейтов (CNOT). Всего $n+1$ гейтов (при $n=1$ — 2 гейта). Глубина схемы: $O(n)$ при последовательном каскаде или $O(\log n)$ при древовидном распространении CNOT.
* **Решаемость в визуальном конструкторе:** `ЧАСТИЧНО` — для любого конкретного фиксированного значения $n$ схема строится в визуальном редакторе за 3–5 шагов. Для общего решения соревнования требуется параметрический Python-код (`solve(n)`).
* **Теги:** `[PARAMETRIC_CODE_ONLY]`, `[VISUAL_GUI_READY]`, `[STATE_PREPARATION]`, `[ENTANGLEMENT]`, `[GHZ_STATE]`, `[BRUTE_FORCE_PROTECTED]`.
