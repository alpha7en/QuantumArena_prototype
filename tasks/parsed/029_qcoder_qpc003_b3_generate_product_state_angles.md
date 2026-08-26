# B3: Generate State \bigotimes_i (\cos T_i |0\rangle + \sin T_i |1\rangle)

## 1. Классификация и метаданные
* **ID задачи:** `qcoder_qpc003_b3`
* **Источник:** https://www.qcoder.jp/en/contests/QPC003/problems/B3
* **Платформа:** QCoder (QPC003)
* **Общее описание:** Построить параметризованную квантовую схему для генерации сепарабельного (факторизованного) $n$-кубитного квантового состояния с заданными вещественными коэффициентами $\bigotimes_{i=0}^{n-1} (\cos T_i |0\rangle + \sin T_i |1\rangle)$ из начального состояния $|0\dots 0\rangle$.
* **Результат решения:** `ПАРАМЕТРИЗОВАННЫЙ ГЕНЕРАТОР СХЕМЫ`
* **Формат ответа:**
  ```python
  from qiskit import QuantumCircuit

  def solve(n: int, T: list[float]) -> QuantumCircuit:
      qc = QuantumCircuit(n)
      # Write your code here:
      return qc
  ```
* **Число кубитов:** $n$ кубитов ($1 \le n \le 10$), без анцилл. Кубит с индексом $i$ кодирует подсостояние $\cos T_i |0\rangle + \sin T_i |1\rangle$.
* **Сложность:** Score 200, Time Limit 3s, Memory Limit 512 MiB.

---

## 2. Условие задачи (Problem Statement)

### B3: Generate State \bigotimes_i (\cos T_i |0\rangle + \sin T_i |1\rangle)
* **Time Limit:** 3 seconds
* **Memory Limit:** 512 MiB
* **Score:** 200 points

#### Problem Statement
You are given an integer $n$ and a list of angles $T = [T_0, T_1, \dots, T_{n-1}]$.
Implement preparing the product state:
$$|\psi\rangle = \bigotimes_{i=0}^{n-1} (\cos T_i |0\rangle + \sin T_i |1\rangle)$$
on a quantum circuit `qc` with $n$ qubits.

#### Constraints
* $1 \le n \le 10$
* $-\pi < T_i \le \pi$
* [Global phase](https://www.qcoder.jp/en/qa#global) is ignored in judge.
* The submitted code must follow the specified format:
```python
from qiskit import QuantumCircuit

def solve(n: int, T: list[float]) -> QuantumCircuit:
    qc = QuantumCircuit(n)
    # Apply Ry(2 * T_i) on each qubit
    return qc
```

#### Sample Input / Output
* Sample 1:
  - Input: $n = 1, T = [0.0]$
  - Target State: $|0\rangle$
* Sample 2:
  - Input: $n = 1, T = [\pi/4 \approx 0.785398]$
  - Target State: $\cos(\pi/4)|0\rangle + \sin(\pi/4)|1\rangle = \frac{1}{\sqrt{2}}|0\rangle + \frac{1}{\sqrt{2}}|1\rangle = |+\rangle$
* Sample 3:
  - Input: $n = 2, T = [\pi/2, 0.0]$
  - Target State: $(\sin(\pi/2)|1\rangle) \otimes (\cos(0)|0\rangle) = |1\rangle \otimes |0\rangle = |10\rangle$

#### Hints
Recall the matrix definition of the single-qubit $Y$-rotation gate $R_y(\theta)$:
$$R_y(\theta) = \begin{pmatrix} \cos(\theta/2) & -\sin(\theta/2) \\ \sin(\theta/2) & \cos(\theta/2) \end{pmatrix}$$
Acting on the initial basis state $|0\rangle$:
$$R_y(\theta)|0\rangle = \cos\left(\frac{\theta}{2}\right)|0\rangle + \sin\left(\frac{\theta}{2}\right)|1\rangle$$
Comparing this with the target single-qubit state $\cos T_i |0\rangle + \sin T_i |1\rangle$, setting $\theta = 2 T_i$ yields the exact desired amplitude distribution:
$$R_y(2 T_i)|0\rangle = \cos T_i |0\rangle + \sin T_i |1\rangle$$
Applying $R_y(2 T_i)$ independently to each qubit $i \in \{0, \dots, n-1\}$ prepares the full tensor product state.

---

## 3. Анализ проверяющей системы (Auto-Judge)
* **Принцип проверки:** Судья вызывает функцию `solve(n, T)` для серии тестовых наборов параметров. Проверяется соответствие числа кубитов (`qc.num_qubits == n`) и отсутствие промежуточных или терминальных измерений и сбросов (`measure`, `reset`). Вычисляется результирующий вектор состояния $|\psi_{\mathrm{out}}\rangle = \mathrm{Statevector}(qc)$ при начальном состоянии $|0\rangle^{\otimes n}$ и сравнивается с аналитическим эталоном $|\psi_{\mathrm{target}}\rangle = \bigotimes_{i=0}^{n-1} (\cos T_i |0\rangle + \sin T_i |1\rangle)$ с вычислением квантовой верности (state fidelity) $|\langle \psi_{\mathrm{target}} | \psi_{\mathrm{out}} \rangle|^2 \ge 1 - 10^{-7}$ (глобальная фаза игнорируется).
* **Оценка числа тестов:** ~15–30 тестов, включая:
  - Граничные размерности: $n=1$, $n=10$.
  - Особые углы: $T_i = 0$ ($|0\rangle$), $T_i = \pi/2$ ($|1\rangle$), $T_i = \pi/4$ ($|+\rangle$), $T_i = -\pi/4$ ($|-\rangle$), $T_i = \pi$ ($-|0\rangle$).
  - Однородные наборы углов ($T_0 = T_1 = \dots = T_{n-1}$) и неоднородные случайные наборы $T_i \in (-\pi, \pi]$.
* **Асимптотика и быстродействие:** Сложность симуляции $O(2^n)$ по времени и памяти. При $n \le 10$ размерность гильбертова пространства составляет $2^{10} = 1024$ комплексных чисел. Векторное умножение и расчет скалярного произведения выполняются за $< 0.1$ мс на тест. Полная валидация всего тестового пакета занимает $< 50$ мс при лимите 3.0 с, пиковое потребление памяти $< 30$ МБ (лимит 512 MiB).
* **Полная проверка без шотов и перебор:**
  - *Проверка без шотов:* **Да, 100%**. Аналитическая проверка через `qiskit.quantum_info.Statevector` гарантирует детерминированную верификацию без статистического шума измерений.
  - *Решаемость перебором:* **Защищено от дискретного перебора (Brute-Force Protected)**. Непрерывное пространство параметров $T_i \in (-\pi, \pi]$ исключает подбор дискретными гейтами из стандартных библиотек (Клиффорд+Т). Требуется параметрическое вычисление угла вращения $\theta_i = 2 T_i$.

---

## 4. Оценка ресурсов и применимость в GUI
* **Примерное число гейтов:** $n$ однокубитных вентилей $R_y$ (по одному $R_y(2 T_i)$ на каждый кубит $i$), 0 двухкубитных вентилей ($CX$). Глубина схемы: 1.
* **Решаемость в визуальном конструкторе:** `ЧАСТИЧНО` — для любого конкретного фиксированного экземпляра $(n, T)$ схема тривиально собирается в GUI за $n$ действий (расстановка вентилей $R_y$ с углами $2T_i$). Однако универсальное параметрическое решение для произвольных списков $T$ переменной длины $n \le 10$ требует программного цикла на Python.
* **Теги:** `[PARAMETRIC_CODE_ONLY]`, `[STATE_PREPARATION]`, `[PRODUCT_STATE]`, `[ROTATION_RY]`, `[EXACT_STATEVECTOR]`, `[BRUTE_FORCE_PROTECTED]`.
