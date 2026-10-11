# B1: Generate State $e^{i\theta}|0\rangle$

## 1. Классификация и метаданные
* **ID задачи:** `qcoder_qpc002_b1`
* **Источник:** https://www.qcoder.jp/en/contests/QPC002/problems/B1
* **Платформа:** QCoder (QPC002)
* **Общее описание:** Применить к начальному однокубитному состоянию $|0\rangle$ заданный фазовый сдвиг $\theta$, сформировав квантовое состояние с точным учетом глобальной фазы $|\psi\rangle = e^{i\theta}|0\rangle$.
* **Результат решения:** `ПАРАМЕТРИЗОВАННЫЙ ГЕНЕРАТОР СХЕМЫ`
* **Формат ответа:**
  ```python
  from qiskit import QuantumCircuit

  def solve(theta: float) -> QuantumCircuit:
      qc = QuantumCircuit(1)
      # Write your code here:
      return qc
  ```
* **Число кубитов:** 1 (0 анцилл).
* **Сложность:** Score 100, Time Limit 3s, Memory Limit 512 MiB.

---

## 2. Условие задачи (Problem Statement)

### B1: Generate State $e^{i\theta}\ket{0}$
* **Time Limit:** 3 seconds
* **Memory Limit:** 512 MiB
* **Score:** 100 points

#### Problem Statement
You are given a real number $\theta$.
Implement the operation of preparing the state $|\psi\rangle$ from the zero state on a quantum circuit $\mathrm{qc}$ with $1$ qubit.

The quantum state $|\psi\rangle$ is defined as
\begin{equation}
|\psi\rangle = e^{i\theta}|0\rangle
\end{equation}.

#### Constraints
* $0 \le \theta < 2\pi$
* **In this problem, the state with different [global phase](https://www.qcoder.jp/en/qa#global) will not be considered correct.**
* The submitted code must follow the specified format:
```python
from qiskit import QuantumCircuit

def solve(theta: float) -> QuantumCircuit:
    qc = QuantumCircuit(1)
    # Write your code here:
    return qc
```

#### Sample Input / Output
Sample: $\theta = \frac{\pi}{2} \implies |\psi\rangle = i|0\rangle$.

---

## 3. Анализ проверяющей системы (Auto-Judge)
* **Принцип проверки:** Судья вызывает `solve(theta)` для тестового набора углов $\theta$, получает `QuantumCircuit(1)` и вычисляет итоговый `Statevector` схемы, примененной к состоянию $|0\rangle$. Полученный вектор проверяется на строгое поэлементное равенство целевому вектору $\begin{pmatrix} e^{i\theta} \\ 0 \end{pmatrix}$ с комплексным учетом фазы ($\langle \psi_{\text{target}} | \psi_{\text{actual}} \rangle \approx 1$ в $\mathbb{C}$, а не по модулю квадрата проекции).
* **Каверзные случаи и нюансы:**
  - *Чувствительность к глобальной фазе:* Стандартный фазовый гейт $P(\theta) = \begin{pmatrix} 1 & 0 \\ 0 & e^{i\theta} \end{pmatrix}$ оставляет состояние $|0\rangle$ без изменений ($P(\theta)|0\rangle = |0\rangle$), поэтому решение `qc.p(theta, 0)` дает неверный результат. Корректное решение требует вращения $R_z(-2\theta) = \begin{pmatrix} e^{i\theta} & 0 \\ 0 & e^{-i\theta} \end{pmatrix}$ либо явного задания `qc.global_phase = theta`.
  - *Граничные значения угла:* $\theta = 0$, $\theta = \pi/2$ (мнимый множитель $i|0\rangle$), $\theta = \pi$ (знак $-|0\rangle$), $\theta \to 2\pi$.
* **Оценка числа тестов:** ~15–30 тестовых точек (характерные углы $0, \pi/4, \pi/2, \pi, 3\pi/2$ и случайные вещественные значения $\theta \in (0, 2\pi)$).
* **Асимптотика и быстродействие:** Сложность симуляции для $N=1$: время $O(1)$, память $O(1)$ (< 1 КБ). Суммарное время валидации всех тестов на сервере: $< 15$ мс.
* **Полная проверка без шотов и перебор:**
  - *Проверка без шотов:* **Да, 100%**. Аналитическая проверка через `Statevector` без shot noise детерминированно валидирует фазовый множитель.
  - *Решаемость перебором:* **Нет (в параметрическом смысле)**. Задача принимает непрерывный параметр $\theta \in [0, 2\pi)$, дискретный перебор стандартных гейтов неприменим.

---

## 4. Оценка ресурсов и применимость в GUI
* **Примерное число гейтов:** 1 однокубитный гейт ($R_z(-2\theta)$) либо 0 гейтов (через свойство `global_phase`), 0 двухкубитных гейтов, глубина 0–1.
* **Решаемость в визуальном конструкторе:** `ЧАСТИЧНО` — схема состоит из 1 однокубитного блока, но требует поддержки параметрических формул (подстановка аргумента $-2\theta$ в гейт $R_z$). В чисто статическом drag-and-drop редакторе без параметров решение невозможно.
* **Теги:** `[PARAMETRIC_CODE_ONLY]`, `[STATE_PREPARATION]`, `[GLOBAL_PHASE_SENSITIVE]`, `[BRUTE_FORCE_PROTECTED]`.
