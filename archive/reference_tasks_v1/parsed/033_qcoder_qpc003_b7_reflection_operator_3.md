# B7: Reflection Operator III

## 1. Классификация и метаданные
* **ID задачи:** `qcoder_qpc003_b7`
* **Источник:** https://www.qcoder.jp/en/contests/QPC003/problems/B7
* **Платформа:** QCoder (QPC003)
* **Общее описание:** Построить параметризованный генератор квантового оператора отражения $R_\psi = 2|\psi\rangle\langle\psi| - I$ относительно произвольного факторизованного вещественного квантового состояния $|\psi\rangle = \bigotimes_{i=0}^{n-1} (\cos T_i |0\rangle + \sin T_i |1\rangle)$ на $n$ кубитах.
* **Результат решения:** `ПАРАМЕТРИЗОВАННЫЙ ГЕНЕРАТОР СХЕМЫ`
* **Формат ответа:**
  ```python
  from qiskit import QuantumCircuit

  def solve(n: int, T: list[float]) -> QuantumCircuit:
      qc = QuantumCircuit(n)
      # Write your code here:
      return qc
  ```
* **Число кубитов:** $n$ кубитов ($2 \le n \le 10$, без дополнительных анцилл).
* **Сложность:** Score 300, Time Limit 3s, Memory Limit 512 MiB.

---

## 2. Условие задачи (Problem Statement)

### B7: Reflection Operator III
* **Time Limit:** 3 seconds
* **Memory Limit:** 512 MiB
* **Score:** 300 points

#### Problem Statement
You are given an integer $n$ and real numbers $T_0,\ T_1,\ \ldots,\ T_{n-1}$.
Implement the operation defined by the following matrix $A$ on a quantum circuit $\mathrm{qc}$ with $n$ qubits:

$$A = 2 \ket{\psi}\bra{\psi} - I$$

where $I$ denotes the $2^n \times 2^n$ identity matrix and $\ket{\psi}$ is defined by

$$\ket{\psi} = (\cos T_0 \ket{0} + \sin T_0 \ket{1}) (\cos T_1 \ket{0} + \sin T_1 \ket{1}) \ldots (\cos T_{n-1} \ket{0} + \sin T_{n-1} \ket{1}).$$

#### Constraints
* $2 \le n \le 10$
* $-\pi < T_i \le \pi$
* [Global phase](https://www.qcoder.jp/en/qa#global) is ignored in judge.
* The submitted code must follow the specified format:
```python
from qiskit import QuantumCircuit

def solve(n: int, T: list[float]) -> QuantumCircuit:
    qc = QuantumCircuit(n)
    # Write your code here:
    return qc
```

#### Sample Input / Output
* $n = 2,\ T = [T_0, T_1]$:
  Состояние $|\psi\rangle = (\cos T_0 |0\rangle + \sin T_0 |1\rangle) \otimes (\cos T_1 |0\rangle + \sin T_1 |1\rangle)$.
  Оператор отражения имеет вид:
  $$A = 2 |\psi\rangle\langle \psi| - I = U_T (2|00\rangle\langle 00| - I) U_T^\dagger,$$
  где $U_T = R_y(2T_0) \otimes R_y(2T_1)$.

#### Hints
Open
* You can apply the inverse gate or the inverse circuit as follows:
```python
qc.compose(sub_qc().inverse(), inplace=True)
# def sub_qc() -> QuantumCircuit
```

---

## 3. Анализ проверяющей системы (Auto-Judge)
* **Принцип проверки:** Судья вызывает `solve(n, T)` для набора тестовых конфигураций с $n \in [2, 10]$ и списками углов $T \in (-\pi, \pi]^n$. Получает объект `QuantumCircuit(n)` и валидирует унитарный оператор схемы (через `Operator(qc)` или прямое сравнение действия на ортонормированный базис / векторы состояний `Statevector`). Проверяется совпадение с целевой унитарной матрицей $A = 2|\psi\rangle\langle\psi| - I = U_T (2|0\rangle^{\otimes n}\langle 0|^{\otimes n} - I) U_T^\dagger$ с точностью до глобальной фазы ($U_{\text{user}} = e^{i\phi} A$).
* **Каверзные случаи:**
  - *Глобальная фазовая эквивалентность:* Реализация через $U_T X^{\otimes n} (MCZ) X^{\otimes n} U_T^\dagger$ порождает оператор $-(2|\psi\rangle\langle\psi| - I) = I - 2|\psi\rangle\langle\psi|$, отличающийся знаком $-1 = e^{i\pi}$. Система проверки игнорирует глобальную фазу и засчитывает оба варианта.
  - *Коэффициенты угла поворота $R_y$:* В Qiskit вентиль `qc.ry(theta, q)` выполняет поворот $e^{-i \frac{\theta}{2} Y}$. Для генерации состояния $\cos T_i |0\rangle + \sin T_i |1\rangle$ угол поворота должен быть равен $\theta = 2 T_i$, а для обратного преобразования $U_T^\dagger$ угол равен $-2 T_i$.
  - *Порядок унитарных блоков:* Оператор отражения $R_\psi = U_T R_0 U_T^\dagger$ требует строгого порядка: сначала обратное вращение $U_T^\dagger = \bigotimes R_y(-2T_i)$, затем отражение относительно нуля $R_0 = X^{\otimes n} (MCZ) X^{\otimes n}$, затем прямое вращение $U_T = \bigotimes R_y(2T_i)$.
  - *Многоконтрольный Z-вентиль:* При $n \in [2, 10]$ инверсия нуля требует $MCZ$ / $MCPhase(\pi)$ с $n-1$ управляющими кубитами (или $MCX$ в окружении гейтов Адамара).
  - *Отсутствие анцилл:* Схема должна быть построена строго на $n$ кубитах без создания вспомогательных регистров.
* **Оценка числа тестов:** ~15–25 тестов (краевые размерности $n=2, 10$, граничные углы $T_i = 0, \pm\frac{\pi}{4}, \pm\frac{\pi}{2}, \pi$, а также произвольные вещественные кортежи $T$).
* **Асимптотика и быстродействие:** Сложность симуляции $O(2^n)$ по времени и $O(2^n)$ (или $O(4^n)$ для полной матрицы) по памяти. При максимальном $n=10$ размерность матрицы $1024 \times 1024$ ($\approx 16$ МБ). Валидация одного теста занимает $< 15$ мс, суммарное время проверки $< 250$ мс при расходе памяти $< 60$ МБ.
* **Полная проверка без шотов и перебор:**
  - *Проверка без шотов:* **Да, 100%**. Аналитическая проверка через `Operator(qc)` / `Statevector` без стохастического шума измерений.
  - *Решаемость перебором:* **Защищена (параметрический генератор)**. Углы $T_i$ — произвольные вещественные параметры, поступающие в рантайме. Слепой перебор дискретных схем невозможен.

---

## 4. Оценка ресурсов и применимость в GUI
* **Примерное число гейтов:**
  - Однокубитные гейты: $2n$ гейтов `RY` (по одному $R_y(-2T_i)$ и $R_y(2T_i)$ на каждый кубит) + $2n$ гейтов `X` (суммарно $4n$ однокубитных вентилей).
  - Многокубитные гейты: 1 многоконтрольный фазовый вентиль ($MCZ$ / $MCPhase(\pi)$ на $n$ кубитах).
  - Глубина схемы: $O(1)$ в базисе с нативным многоконтрольным вентилем, либо $O(n)$ / $O(n^2)$ при декомпозиции на $\{CX, U\}$.
* **Решаемость в визуальном конструкторе:** `ЧАСТИЧНО` — для любого конкретного фиксированного значения $n$ и заданных численных углов $T_i$ схема тривиально собирается в GUI drag-and-drop редакторе ($R_y(-2T)^\otimes \to X^\otimes \to MCZ \to X^\otimes \to R_y(2T)^\otimes$), однако соревновательное решение требует параметрического Python-генератора.
* **Теги:** `[PARAMETRIC_CODE_ONLY]`, `[REFLECTION_OPERATOR]`, `[GENERALIZED_DIFFUSION]`, `[RY_ROTATIONS]`, `[EXACT_UNITARY]`, `[BRUTE_FORCE_PROTECTED]`.
