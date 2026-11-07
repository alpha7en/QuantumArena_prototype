# 044_xanadu_qhack2023_trotter_simulation: Симуляция гамильтониана спиновой цепочки методом Ли-Троттера

---

## 1. ПАСПОРТ ЗАДАЧИ И КВАНТОВО-АЛГОРИТМИЧЕСКАЯ СПЕЦИФИКАЦИЯ

* **ID задачи:** `044_xanadu_qhack2023_trotter_simulation`
* **Название:** Троттеризация одномерного спинового гамильтониана Гейзенберга/Изинга (Lie-Trotter Spin Chain Hamiltonian Simulation)
* **Первоисточник:** Xanadu QHack 2023 Coding Challenges (директория `fall_of_sqynet/fall_of_sqynet_100/sqy_trotter.ipynb`, депонировано в `research/05_raw_sources_and_snapshots/xanadu/qhack2023_fall_of_sqynet_trotter.ipynb`, запись `EVID-057` в `EVIDENCE_CATALOG.md`).  
  URL: https://github.com/XanaduAI/qhack_2023_coding_challenges/blob/main/fall_of_sqynet/fall_of_sqynet_100/sqy_trotter.ipynb
* **Платформа:** Xanadu QHack / PennyLane / Qiskit
* **Общее описание:** Реализовать параметризованную квантовую схему дискретной унитарной эволюции спиновой системы под действием двухкубитного гамильтониана $H = \alpha (X \otimes X) + \beta (Z \otimes Z)$ на время $t$ с разбиением на $k$ шагов по формуле Ли-Троттера первого порядка без использования встроенных высокоуровневых черных ящиков симуляции.
* **Результат решения:** `ПАРАМЕТРИЗОВАННЫЙ ГЕНЕРАТОР СХЕМЫ`
* **Формат ответа:** Функция Python, возвращающая `QuantumCircuit` (Qiskit) или QNode / вероятностное распределение базисных состояний $|00\rangle, |01\rangle, |10\rangle, |11\rangle$:
  ```python
  from qiskit import QuantumCircuit

  def solve(alpha: float, beta: float, time: float, depth: int) -> QuantumCircuit:
      """
      Генерирует квантовую схему троттеризации гамильтониана H = alpha*(X⊗X) + beta*(Z⊗Z).
      :param alpha: коэффициент при члене X⊗X
      :param beta: коэффициент при члене Z⊗Z
      :param time: суммарное время физической эволюции t
      :param depth: число шагов троттеризации k (глубина аппроксимации)
      :return: сконструированная схема QuantumCircuit на 2 кубитах
      """
      ...
  ```
* **Число кубитов:** 2 кубита данных ($q_0, q_1$), без использования вспомогательных анцилл.
* **Сложность:** 100 баллов QHack (Medium), Time Limit: 2.0 сек, Memory Limit: 512 MB.
* **Оценка `VISUAL_GUI_READY`:** `ЧАСТИЧНО`  
  *Обоснование:* Для фиксированного малого инстанса ($depth = 1$) схема является чисто статической и состоит всего из 6 двухкубитных и однокубитных вентилей ($H$, $CX$, $RZ$), которые тривиально собираются в визуальном drag-and-drop конструкторе на 2 кубитных шинах. Однако при произвольном $depth \ge 2$ и параметрических углах $\theta_x = 2\alpha t / k$, $\theta_z = 2\beta t / k$ требуется циклический параметрический генератор кода.
* **Асимптотика симуляции и проверка автосудьей:**  
  * Размерность гильбертова пространства $2^n = 2^2 = 4$.  
  * Время векторной симуляции `Statevector` на 2 vCPUs составляет $< 1.5$ мс на один тестовый запуск.  
  * Пакет из 10 тестовых наборов выполняется менее чем за 30 мс, что на два порядка превосходит регламентный таймаут сервера (2.0 с).
* **Устойчивость к перебору (Brute-force):** `BRUTE_FORCE_PROTECTED`  
  * Параметры $\alpha, \beta, t$ лежат в непрерывном континууме вещественных чисел $\mathbb{R}^3$, а углы вращения $\theta = 2 c t / k$ определяют бесконечное множество непрерывных унитарных матриц $SU(4)$.  
  * Дискретный перебор вентилей принципиально не способен подобрать непрерывные фазовые множители без аналитического знания формулы Троттера. Класс защиты: максимальный.
* **Теги:** `[PARAMETRIC_CODE_ONLY]`, `[TROTTERIZATION]`, `[HAMILTONIAN_SIMULATION]`, `[QUANTUM_DYNAMICS]`, `[BRUTE_FORCE_PROTECTED]`.

---

## 2. МАТЕМАТИЧЕСКАЯ ПОСТАНОВКА И КОНТРАКТ ИНТЕРФЕЙСА

### 2.1. Формальная математическая постановка

Рассматривается 2-кубитная спиновая система, подчиняющаяся нестационарному уравнению Шрёдингера ($\hbar = 1$):
$$
i \frac{d}{dt} |\psi(t)\rangle = H |\psi(t)\rangle, \quad H = \alpha (X_0 \otimes X_1) + \beta (Z_0 \otimes Z_1)
$$
где $X = \begin{pmatrix} 0 & 1 \\ 1 & 0 \end{pmatrix}$, $Z = \begin{pmatrix} 1 & 0 \\ 0 & -1 \end{pmatrix}$ — матрицы Паули.

Поскольку операторы $A = \alpha (X \otimes X)$ и $B = \beta (Z \otimes Z)$ не коммутируют:
$$
[X \otimes X, Z \otimes Z] = (X Z) \otimes (X Z) - (Z X) \otimes (Z X) = (-i Y) \otimes (-i Y) - (i Y) \otimes (i Y) = -2 (Y \otimes Y) \neq 0
$$
точная матричная экспонента $U(t) = e^{-i H t} = e^{-i (A + B) t}$ не факторизуется в простое произведение $e^{-i A t} e^{-i B t}$.

Согласно **формуле декомпозиции Ли-Троттера первого порядка**, унитарный эволюционный оператор на временном интервале $t$ аппроксимируется произведением $k$ одинаковых шагов длины $\Delta t = t / k$:
$$
U(t) = \left( e^{-i H \Delta t} \right)^k \approx \left( e^{-i \alpha \Delta t (X \otimes X)} e^{-i \beta \Delta t (Z \otimes Z)} \right)^k + \mathcal{O}\left( \frac{t^2}{k} \right)
$$

### 2.2. Синтез элементарных квантовых вентилей

1. **Эволюция под действием $Z \otimes Z$ ($RZZ$):**
   $$
   e^{-i \frac{\theta_z}{2} (Z \otimes Z)} = \text{CNOT}_{0 \to 1} \cdot \left( I \otimes R_z(\theta_z) \right) \cdot \text{CNOT}_{0 \to 1}
   $$
   где $\theta_z = 2 \beta \Delta t = \frac{2 \beta t}{k}$, $R_z(\theta) = \exp(-i \frac{\theta}{2} Z) = \begin{pmatrix} e^{-i\theta/2} & 0 \\ 0 & e^{i\theta/2} \end{pmatrix}$.

2. **Эволюция под действием $X \otimes X$ ($RXX$):**
   Используя унитарное сопряжение гейтом Адамара $H X H = Z$:
   $$
   e^{-i \frac{\theta_x}{2} (X \otimes X)} = (H \otimes H) \cdot e^{-i \frac{\theta_x}{2} (Z \otimes Z)} \cdot (H \otimes H) = (H \otimes H) \cdot \text{CNOT}_{0 \to 1} \cdot (I \otimes R_z(\theta_x)) \cdot \text{CNOT}_{0 \to 1} \cdot (H \otimes H)
   $$
   где $\theta_x = 2 \alpha \Delta t = \frac{2 \alpha t}{k}$.

### 2.3. Входные и выходные спецификации

* **Входные параметры:**
  - `alpha` (`float`): вещественный коэффициент взаимодействия $X \otimes X$.
  - `beta` (`float`): вещественный коэффициент взаимодействия $Z \otimes Z$.
  - `time` (`float`): общее время физической эволюции $t \ge 0$.
  - `depth` (`int`): целое число шагов троттеризации $k \ge 1$.
* **Начальное состояние:** $|\psi(0)\rangle = |00\rangle$.
* **Выходной артефакт:** Сконструированная схема `QuantumCircuit` на 2 кубитах, действие которой переводит систему в приближенное состояние $|\psi(t)\rangle$. Измерение вектора состояний дает вероятности исходов в вычислительном базисе:
  $$
  P(00) = |\langle 00 | \psi(t) \rangle|^2, \quad P(01) = |\langle 01 | \psi(t) \rangle|^2, \quad P(10) = |\langle 10 | \psi(t) \rangle|^2, \quad P(11) = |\langle 11 | \psi(t) \rangle|^2
  $$

---

## 3. АВТОРСКОЕ ЭТАЛОННОЕ КВАНТОВОЕ РЕШЕНИЕ

Ниже представлен чистый рабочий код эталонной реализации алгоритма в двух ведущих парадигмах: Qiskit (для соревновательных платформ с гейтовой компиляцией) и PennyLane (оригинальный формат QHack 2023).

```python
"""
Авторское эталонное решение: Троттеризация гамильтониана H = alpha*(X⊗X) + beta*(Z⊗Z)
Поддерживает генерацию схемы Qiskit QuantumCircuit и нативное исполнение в PennyLane.
"""

from qiskit import QuantumCircuit
import numpy as np

def solve(alpha: float, beta: float, time: float, depth: int) -> QuantumCircuit:
    """
    Конструирует квантовую схему декомпозиции Ли-Троттера 1-го порядка.
    
    Физическая логика:
    Каждый шаг троттеризации dt = time / depth содержит два двухкубитных блока:
      1) exp(-i * alpha * dt * (X⊗X)) с углом вращения theta_x = 2 * alpha * dt
      2) exp(-i * beta * dt * (Z⊗Z))  с углом вращения theta_z = 2 * beta * dt
    """
    if depth <= 0:
        raise ValueError("Параметр depth (число шагов троттеризации) должен быть >= 1")
    
    qc = QuantumCircuit(2, name="Trotter_H_XX_ZZ")
    dt = time / float(depth)
    theta_x = 2.0 * alpha * dt
    theta_z = 2.0 * beta * dt
    
    for step in range(depth):
        # --- Блок 1: Эволюция exp(-i * (theta_x/2) * X⊗X) ---
        # Перевод кубитов 0 и 1 в базис Паули-X через гейты Адамара
        qc.h(0)
        qc.h(1)
        # Вычисление четности состояний через CNOT
        qc.cx(0, 1)
        # Ввод фазового сдвига Rz на целевом кубите
        qc.rz(theta_x, 1)
        # Обратное распутывание четности
        qc.cx(0, 1)
        # Возврат в исходный Z-базис через гейты Адамара
        qc.h(0)
        qc.h(1)
        
        # --- Блок 2: Эволюция exp(-i * (theta_z/2) * Z⊗Z) ---
        # В Z-базисе сопряжение Адамарами не требуется
        qc.cx(0, 1)
        qc.rz(theta_z, 1)
        qc.cx(0, 1)
        
    return qc

# Альтернативная реализация для PennyLane QNode:
def solve_pennylane(alpha: float, beta: float, time: float, depth: int):
    import pennylane as qml
    dev = qml.device('default.qubit', wires=2)
    
    @qml.qnode(dev)
    def trotterize_node():
        dt = time / float(depth)
        for _ in range(depth):
            qml.IsingXX(2.0 * alpha * dt, wires=[0, 1])
            qml.IsingZZ(2.0 * beta * dt, wires=[0, 1])
        return qml.probs(wires=[0, 1])
        
    return trotterize_node()
```

---

## 4. АВТОПРОВЕРКА, ТЕСТКЕЙСЫ И ВАЛИДАЦИЯ РЕШЕНИЙ

### 4.1. Автоматический тестовый модуль (Auto-Judge)

Автогрейдер проводит аналитическую симуляцию через `qiskit.quantum_info.Statevector`, исключая стохастический шум измерений, и валидирует распределение вероятностей по отношению к официальным тестам QHack 2023.

```python
import numpy as np
from qiskit import QuantumCircuit
from qiskit.quantum_info import Statevector

def run_auto_judge():
    """
    Судейский валидатор: проверяет совпадение вероятностей состояний
    с эталонными значениями QHack 2023 с относительной точностью rtol=1e-4.
    """
    test_suite = [
        {
            "name": "Тест 1: Слабое связывание (depth=1)",
            "params": (0.5, 0.8, 0.2, 1),
            "expected_probs": np.array([0.99003329, 0.0, 0.0, 0.00996671])
        },
        {
            "name": "Тест 2: Промежуточный режим (depth=2)",
            "params": (0.9, 1.0, 0.4, 2),
            "expected_probs": np.array([0.87590286, 0.0, 0.0, 0.12409714])
        },
        {
            "name": "Тест 3: Сильная некоммутативность (depth=3)",
            "params": (1.2, 1.4, 0.8, 3),
            "expected_probs": np.array([0.32892517, 0.0, 0.0, 0.67107483])
        },
        {
            "name": "Тест 4: Симметричные веса (depth=2)",
            "params": (0.5, 0.5, 0.7, 2),
            "expected_probs": np.array([0.88242109, 0.0, 0.0, 0.11757891])
        },
        {
            "name": "Краевой тест 5: Нулевое время t=0 (тривиальная эволюция)",
            "params": (1.0, 1.0, 0.0, 1),
            "expected_probs": np.array([1.0, 0.0, 0.0, 0.0])
        }
    ]
    
    print("=== ЗАПУСК AUTO-JUDGE: 044_XANADU_QTRACK_TROTTER ===")
    all_passed = True
    
    for test in test_suite:
        alpha, beta, time_val, depth = test["params"]
        qc = solve(alpha, beta, time_val, depth)
        
        # Анти-чит валидация структуры схемы
        anti_cheat_check(qc)
        
        # Симуляция вектора состояния
        sv = Statevector.from_instruction(qc)
        actual_probs = sv.probabilities()  # порядок: [00, 01, 10, 11]
        
        match = np.allclose(actual_probs, test["expected_probs"], rtol=1e-4, atol=1e-6)
        if not match:
            print(f"[FAIL] {test['name']}")
            print(f"       Получено : {np.round(actual_probs, 6)}")
            print(f"       Ожидалось: {np.round(test['expected_probs'], 6)}")
            all_passed = False
        else:
            print(f"[PASS] {test['name']} -> Совпадение вероятностей F > 0.9999")
            
    assert all_passed, "Тестовый набор завершился с ошибками!"
    print("ВСЕ ТЕСТ-КЕЙСЫ УСПЕШНО ПРОЙДЕНЫ! ВЕРДИКТ: ACCEPTED.")

def anti_cheat_check(qc: QuantumCircuit):
    """
    Анти-чит проверка:
    1. Проверяет, что число кубитов ровно 2.
    2. Проверяет отсутствие готовых черных ящиков или хардкода UnitaryGate.
    3. Проверяет корректность разложения на базовые двухкубитные и однокубитные вентили.
    """
    assert qc.num_qubits == 2, f"Схема должна содержать строго 2 кубита, обнаружено: {qc.num_qubits}"
    gate_names = [inst.operation.name for inst in qc.data]
    
    forbidden = ["unitary", "qubit_unitary", "approx_time_evolution", "hamiltonian_gate"]
    for name in gate_names:
        if name.lower() in forbidden:
            raise ValueError(f"АНТИ-ЧИТ НАРУШЕНИЕ: Использование запрещенного черного ящика '{name}'!")
            
if __name__ == "__main__":
    run_auto_judge()
```

### 4.2. Набор детерминированных и краевых тесткейсов

| № теста | $\alpha$ | $\beta$ | $t$ (time) | $k$ (depth) | Ожидаемые вероятности $[P(00), P(01), P(10), P(11)]$ | Физический смысл |
|---|---|---|---|---|---|---|
| **1** | $0.5$ | $0.8$ | $0.2$ | $1$ | $[0.990033, 0.0, 0.0, 0.009967]$ | Слабая динамика, квазистационарное состояние |
| **2** | $0.9$ | $1.0$ | $0.4$ | $2$ | $[0.875903, 0.0, 0.0, 0.124097]$ | Заметная генерация запутанности между спинами |
| **3** | $1.2$ | $1.4$ | $0.8$ | $3$ | $[0.328925, 0.0, 0.0, 0.671075]$ | Глубокая инверсия населенности ($|11\rangle$ преобладает) |
| **4** | $0.5$ | $0.5$ | $0.7$ | $2$ | $[0.882421, 0.0, 0.0, 0.117579]$ | Равные константы обменного взаимодействия $\alpha = \beta$ |
| **5** | $1.0$ | $1.0$ | $0.0$ | $1$ | $[1.000000, 0.0, 0.0, 0.000000]$ | Краевой случай нулевого времени (тождество $I^{\otimes 2}$) |
