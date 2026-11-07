# 054_classiq_competition_lognormal_state_prep: Загрузка логнормального распределения в квантовое состояние (Quantum Finance State Preparation)

---

## 1. ПАСПОРТ ЗАДАЧИ И КВАНТОВО-АЛГОРИТМИЧЕСКАЯ СПЕЦИФИКАЦИЯ

* **ID задачи:** `054_classiq_competition_lognormal_state_prep`
* **Название:** Загрузка амплитуд логнормального распределения вероятностей для квантового финтеха (Log-Normal Probability Distribution Quantum State Preparation)
* **Первоисточник:** Classiq Coding Competition / Quantum Finance (Problem: "Continuous Distribution State Preparation & Amplitude Loading", депонировано в `research/05_raw_sources_and_snapshots/independent/classiq_lognormal_state_prep_challenge.py`, запись `EVID-067` в `EVIDENCE_CATALOG.md`).  
  URL: https://github.com/Classiq/classiq-library
* **Платформа:** Classiq Competition / Qiskit / PennyLane
* **Общее описание:** Синтезировать $n$-кубитную квантовую схему подготовки состояния, загружающую дискретизированное непрерывное логнормальное распределение вероятностей $p(x) = \frac{1}{x \sigma \sqrt{2\pi}} \exp\left(-\frac{(\ln x - \mu)^2}{2\sigma^2}\right)$ на сетке из $2^n$ интервалов в виде квантового вектора состояния $|\psi\rangle = \sum_{i=0}^{2^n-1} \sqrt{p_i} |i\rangle$ с фиделити $F \ge 0.999$ и оптимизированным числом вентилей по алгоритму Гровера — Рудольфа (Grover-Rudolph Tree Synthesis).
* **Результат решения:** `ПАРАМЕТРИЗОВАННЫЙ ГЕНЕРАТОР СХЕМЫ`
* **Формат ответа:** Набор функций расчета распределения, углов и схемы на Python/Qiskit:
  ```python
  from qiskit import QuantumCircuit
  import numpy as np

  def compute_lognormal_probabilities(n_qubits: int, mu: float = 0.0, sigma: float = 0.5,
                                      x_min: float = 0.1, x_max: float = 5.0) -> np.ndarray:
      """Вычисляет нормализованные вероятности для 2^n бинов."""
      ...

  def build_lognormal_state_circuit(n_qubits: int, mu: float = 0.0, sigma: float = 0.5,
                                    x_min: float = 0.1, x_max: float = 5.0) -> QuantumCircuit:
      """Генерирует n-кубитную схему подготовки состояния логнормального распределения."""
      ...
  ```
* **Число кубитов:** $n$ кубитов (без вспомогательных анцилл, либо чистые анциллы для параллелизации).
* **Сложность:** C (Hard / Div 1), Time Limit: 3.0 сек, Memory Limit: 512 MB.
* **Оценка `VISUAL_GUI_READY`:** `ЧАСТИЧНО (PARAMETRIC_CODE_ONLY)`  
  *Обоснование:* Для $n=1$ схема состоит из одного поворота $R_y(\theta)$. Для $n \ge 3$ подготовка произвольного дискретизированного распределения требует вычисления $2^n - 1$ углов поворота на бинарном дереве условных вероятностей Гровера — Рудольфа и каскада контролируемых вентилей с экспоненциально растущим числом состояний, что исключает ручную сборку в GUI.
* **Асимптотика симуляции и проверка автосудьей:**  
  * Размерность пространства $N = 2^n$. Для $n \le 8$ ($256$ компонент) симуляция `Statevector` мгновенна ($< 15$ мс).  
  * Число двухкубитных гейтов: $O(2^n)$ по стандартному синтезу Мёттёнена или $O(n \cdot \text{poly}(1/\epsilon))$ при полиномиальной аппроксимации.  
  * Проверка без шотов: прямое аналитическое вычисление квантового перекрытия (fidelity):
    $$F = |\langle \psi_{\text{target}} | \psi_{\text{circuit}} \rangle|^2 \ge 0.999$$
* **Устойчивость к перебору (Brute-force):** `BRUTE_FORCE_PROTECTED`  
  * Пространство непрерывных углов вращения $\vec{\theta} \in [0, 2\pi]^{2^n-1}$ бесконечномерно.  
  * Случайная генерация параметров или дискретный перебор Клиффордовых вентилей не способны аппроксимировать логнормальные веса финансовой модели Блэка — Шоулза с точностью $F \ge 0.999$.
* **Теги:** `[PARAMETRIC_CODE_ONLY]`, `[QUANTUM_FINANCE]`, `[STATE_PREPARATION]`, `[GROVER_RUDOLPH]`, `[LOGNORMAL_DISTRIBUTION]`, `[AMPLITUDE_LOADING]`, `[BRUTE_FORCE_PROTECTED]`.

---

## 2. МАТЕМАТИЧЕСКАЯ ПОСТАНОВКА И ДЕРЕВО АМПЛИТУД ГРОВЕРА — РУДОЛЬФА

### 2.1. Дискретизация логнормального распределения

В математических финансах цена базового актива в модели Блэка — Шоулза подчиняется геометрическому броуновскому движению, а ее плотность вероятности описывается логнормальным законом:
$$
p(x) = \frac{1}{x \sigma \sqrt{2\pi}} \exp\left( -\frac{(\ln x - \mu)^2}{2\sigma^2} \right), \quad x > 0
$$

Отрезок моделирования $[x_{\min}, x_{\max}]$ разбивается на $2^n$ равных интервалов шириной $\Delta x = \frac{x_{\max} - x_{\min}}{2^n}$.  
Центр $i$-го интервала:
$$
x_i = x_{\min} + \left(i + \frac{1}{2}\right) \Delta x, \quad i \in \{0, 1, \dots, 2^n - 1\}
$$
Вероятность попадания в $i$-й бин:
$$
\tilde{p}_i = p(x_i) \Delta x, \quad p_i = \frac{\tilde{p}_i}{\sum_{j=0}^{2^n-1} \tilde{p}_j}
$$
Целевое квантовое состояние регистра:
$$
|\psi_{\text{target}}\rangle = \sum_{i=0}^{2^n - 1} \sqrt{p_i} |i\rangle
$$

### 2.2. Алгоритм синтеза Гровера — Рудольфа (Бинарное дерево)

Алгоритм (Grover & Rudolph, 2002) строит состояние поуровнево, начиная со старшего кубита (кубит $n-1$) к младшему (кубит $0$):
1. **Корень дерева (Уровень 0):**  
   Пространство делится на левую половину $[0, 2^{n-1}-1]$ и правую половину $[2^{n-1}, 2^n-1]$ с суммарными вероятностями:
   $$
   P_L = \sum_{i=0}^{2^{n-1}-1} p_i, \quad P_R = \sum_{i=2^{n-1}}^{2^n-1} p_i = 1 - P_L
   $$
   Старший кубит поворачивается оператором $R_y(\theta_0)$:
   $$
   \theta_0 = 2 \arccos\left(\sqrt{P_L}\right)
   $$
   Состояние становится $\sqrt{P_L}|0\rangle + \sqrt{P_R}|1\rangle$.

2. **Промежуточные узлы (Уровень $m$):**  
   Для каждого префикса $b \in \{0, 1\}^m$ с родителем $P_b = P_{b0} + P_{b1}$ применяется условно-контролируемый поворот кубита $m$ на угол:
   $$
   \theta_{b} = 2 \arccos\left(\sqrt{\frac{P_{b0}}{P_{b0} + P_{b1}}}\right)
   $$

В результате после прохода всех $n$ кубитов амплитуда каждого базисного состояния $|i\rangle$ в точности равна $\sqrt{p_i}$.

### 2.3. ASCII-диаграмма синтеза для 3 кубитов

```
q_0: ──[ Ry(theta_0) ]──────■──────────────■─────── ...
                            │              │
q_1: ─────────────────[ Ry(th_00) ]──[ Ry(th_01) ]─ ...
                                           │
q_2: ──────────────────────────────────────■─────── ...
```

---

## 3. АВТОРСКОЕ ЭТАЛОННОЕ КВАНТОВОЕ РЕШЕНИЕ

```python
"""
Авторское эталонное решение: Classiq Coding Competition - Log-Normal State Preparation
Синтез квантового распределения вероятностей для задач квантового финтеха и опционного прайсинга.
"""

from qiskit import QuantumCircuit
from qiskit.quantum_info import Statevector
import numpy as np
from typing import List

def compute_lognormal_probabilities(n_qubits: int, mu: float = 0.0, sigma: float = 0.5,
                                    x_min: float = 0.1, x_max: float = 5.0) -> np.ndarray:
    """
    Вычисляет дискретизированные и нормализованные вероятности логнормального распределения.
    :param n_qubits: число кубитов n (2^n бинов)
    :param mu: логарифмическое математическое ожидание
    :param sigma: логарифмическая волатильность
    :param x_min: левая граница сетки цен
    :param x_max: правая граница сетки цен
    :return: вектор вероятностей длины 2^n с sum(probs) = 1.0
    """
    num_bins = 2**n_qubits
    grid = np.linspace(x_min, x_max, num_bins + 1)
    bin_centers = 0.5 * (grid[:-1] + grid[1:])
    dx = grid[1] - grid[0]
    
    # Плотность вероятности логнормального распределения
    raw_probs = (1.0 / (bin_centers * sigma * np.sqrt(2 * np.pi))) * np.exp(
        -((np.log(bin_centers) - mu)**2) / (2 * sigma**2)
    ) * dx
    
    probs = raw_probs / np.sum(raw_probs)
    return probs

def compute_grover_rudolph_tree_angles(probs: np.ndarray, n_qubits: int) -> List[np.ndarray]:
    """
    Вычисляет полное бинарное дерево углов Гровера — Рудольфа для низкоуровневой аппаратной компиляции.
    """
    tree = [probs]
    for _ in range(n_qubits - 1):
        grouped = tree[-1].reshape(-1, 2).sum(axis=1)
        tree.append(grouped)
    tree.reverse()
    
    angles = []
    for level in range(n_qubits):
        if level == 0:
            p_left = tree[0][0]
            p_tot = np.sum(tree[0])
            th = 2.0 * np.arccos(np.sqrt(np.clip(p_left / p_tot, 0.0, 1.0)))
            angles.append(np.array([th]))
        else:
            prev_nodes = tree[level - 1]
            curr_nodes = tree[level].reshape(-1, 2)
            level_thetas = []
            for (p_l, _), p_par in zip(curr_nodes, prev_nodes):
                if p_par > 1e-12:
                    th = 2.0 * np.arccos(np.sqrt(np.clip(p_l / p_par, 0.0, 1.0)))
                else:
                    th = 0.0
                level_thetas.append(th)
            angles.append(np.array(level_thetas))
            
    return angles

def build_lognormal_state_circuit(n_qubits: int, mu: float = 0.0, sigma: float = 0.5,
                                  x_min: float = 0.1, x_max: float = 5.0) -> QuantumCircuit:
    """
    Прямой синтез схемы подготовки логнормального состояния по дереву Гровера — Рудольфа.
    Синтезирует вентили поуровнево: Ry(theta0) на старший кубит, CRy и multi-controlled Ry
    на последующие кубиты без использования черных ящиков (полный отказ от qc.initialize).
    """
    from qiskit.circuit.library import RYGate

    probs = compute_lognormal_probabilities(n_qubits, mu, sigma, x_min, x_max)
    tree_angles = compute_grover_rudolph_tree_angles(probs, n_qubits)
    
    qc = QuantumCircuit(n_qubits, name=f"Lognormal_GroverRudolph_{n_qubits}Q")
    
    # 1. Старший кубит (q_{n-1}) поворачивается в корне дерева
    qc.ry(float(tree_angles[0][0]), n_qubits - 1)
    
    # 2. Последующие уровни дерева бинарных вероятностей
    for level in range(1, n_qubits):
        target_qubit = n_qubits - 1 - level
        control_qubits = [n_qubits - 1 - k for k in range(level)]
        angles_level = tree_angles[level]
        
        for prefix_idx, th in enumerate(angles_level):
            if abs(th) < 1e-12:
                continue
                
            # Инвертируем контрольные кубиты для битов 0 в префиксе
            for k in range(level):
                bit = (prefix_idx >> (level - 1 - k)) & 1
                if bit == 0:
                    qc.x(control_qubits[k])
                    
            # Применяем контролируемое вращение Ry
            if level == 1:
                qc.cry(float(th), control_qubits[0], target_qubit)
            else:
                gate = RYGate(float(th)).control(level)
                qc.append(gate, control_qubits + [target_qubit])
                
            # Восстанавливаем контрольные кубиты
            for k in range(level):
                bit = (prefix_idx >> (level - 1 - k)) & 1
                if bit == 0:
                    qc.x(control_qubits[k])
                    
    return qc
```

---

## 4. АВТОПРОВЕРКА, ТЕСТКЕЙСЫ И ВАЛИДАЦИЯ РЕШЕНИЙ

### 4.1. Автоматический тестовый модуль (Auto-Judge)

```python
import inspect
import numpy as np
from qiskit import QuantumCircuit
from qiskit.quantum_info import Statevector

def run_auto_judge():
    print("=== ЗАПУСК AUTO-JUDGE: 054_CLASSIQ_COMPETITION_LOGNORMAL_STATE_PREP ===")
    all_passed = True
    
    # 0. Anti-cheat audit: проверка отсутствия qc.initialize
    try:
        src = inspect.getsource(build_lognormal_state_circuit)
        assert "qc.initialize" not in src and "initialize(" not in src, (
            "Anti-cheat FAIL: обнаружен вызов черного ящика qc.initialize()!"
        )
    except OSError:
        co_names = build_lognormal_state_circuit.__code__.co_names
        assert "initialize" not in co_names, "Anti-cheat FAIL: обнаружен вызов initialize!"
    print("[PASS] Anti-cheat audit: Синтез выполнен напрямую через дерево вращений Ry/CRy/MC-Ry.")
    
    test_configs = [
        {"n": 2, "mu": 0.0, "sigma": 0.5, "desc": "2-кубитный базовый бенчмарк (4 бина)"},
        {"n": 3, "mu": 0.0, "sigma": 0.5, "desc": "3-кубитный эталонный бенчмарк Classiq (8 бинов)"},
        {"n": 4, "mu": 0.2, "sigma": 0.4, "desc": "4-кубитный бенчмарк со смещением mu=0.2 (16 бинов)"},
        {"n": 5, "mu": -0.1, "sigma": 0.6, "desc": "5-кубитный высокоточный сектор (32 бина)"},
    ]
    
    for idx, cfg in enumerate(test_configs, 1):
        n = cfg["n"]
        mu = cfg["mu"]
        sigma = cfg["sigma"]
        desc = cfg["desc"]
        
        # 1. Расчет эталонного вектора состояния
        probs = compute_lognormal_probabilities(n, mu=mu, sigma=sigma)
        assert np.isclose(np.sum(probs), 1.0, atol=1e-7), "Вектор вероятностей должен быть строго нормирован!"
        target_amplitudes = np.sqrt(probs)
        
        # 2. Синтез квантовой схемы
        qc = build_lognormal_state_circuit(n, mu=mu, sigma=sigma)
        assert qc.num_qubits == n, f"Число кубитов в схеме {qc.num_qubits} != {n}"
        
        # 3. Аналитическая проверка точности через Statevector
        sv = Statevector(qc)
        circuit_amplitudes = sv.data
        
        # Вычисление Fidelity: F = |<target | circuit>|^2
        fidelity = float(np.abs(np.vdot(target_amplitudes, circuit_amplitudes))**2)
        
        # 4. Проверка бинарного дерева углов Гровера — Рудольфа
        tree_angles = compute_grover_rudolph_tree_angles(probs, n)
        assert len(tree_angles) == n, f"Дерево углов должно иметь глубину {n}"
        
        if fidelity < 0.9999:
            print(f"[FAIL] Конфигурация {idx} ({desc}): Fidelity F = {fidelity:.6f} < 0.9999")
            all_passed = False
        else:
            print(f"[PASS] Конфигурация {idx} ({desc}): F = {fidelity:.8f} >= 0.9999 (OK)")
            
    assert all_passed, "Тесты подготовки логнормального состояния завершились с ошибками!"
    print("\nВСЕ ТЕСТ-КЕЙСЫ УСПЕШНО ПРОЙДЕНЫ! ВЕРДИКТ: ACCEPTED.")

if __name__ == "__main__":
    run_auto_judge()
```

### 4.2. Таблица параметров и тестовых конфигураций

| № теста | Кубитов $n$ | Параметры $(\mu, \sigma)$ | Интервал $[x_{\min}, x_{\max}]$ | Число бинов $2^n$ | Целевое Fidelity $F$ | Фактическое Fidelity | Статус |
|---|---|---|---|---|---|---|---|
| **1** | $2$ | $(0.0, 0.5)$ | $[0.1, 5.0]$ | $4$ | $\ge 0.999$ | $1.000000$ | Accepted |
| **2** | $3$ | $(0.0, 0.5)$ | $[0.1, 5.0]$ | $8$ | $\ge 0.999$ | $1.000000$ | Accepted (Classiq Core) |
| **3** | $4$ | $(0.2, 0.4)$ | $[0.1, 5.0]$ | $16$ | $\ge 0.999$ | $1.000000$ | Accepted |
| **4** | $5$ | $(-0.1, 0.6)$ | $[0.1, 5.0]$ | $32$ | $\ge 0.999$ | $1.000000$ | Accepted |
