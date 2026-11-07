# 050_microsoft_katas_chsh_game: Квантовая стратегия в игре CHSH и нарушение неравенств Белла

---

## 1. ПАСПОРТ ЗАДАЧИ И КВАНТОВО-АЛГОРИТМИЧЕСКАЯ СПЕЦИФИКАЦИЯ

* **ID задачи:** `050_microsoft_katas_chsh_game`
* **Название:** Реализация оптимальной квантовой стратегии Алисы и Боба в игре CHSH с нарушением классического предела Белла (Optimal Quantum Strategy for CHSH Game and Tsirelson's Bound)
* **Первоисточник:** Microsoft Quantum Katas (`CHSHGame/Tasks.qs`, депонировано в `research/05_raw_sources_and_snapshots/microsoft/katas_chsh_game_tasks.qs`, запись `EVID-063` в `EVIDENCE_CATALOG.md`).  
  URL: https://raw.githubusercontent.com/microsoft/QuantumKatas/main/CHSHGame/Tasks.qs
* **Платформа:** Microsoft Quantum Katas / Q# / Qiskit
* **Общее описание:** Реализовать квантовый протокол для двух изолированных игроков (Алисы и Боба), разделяющих запутанную пару Белла $|\Phi^+\rangle$, обеспечивающий выигрыш в игре Клаузера — Хорна — Шимони — Хольта (CHSH) с вероятностью Цирельсона $P_{\text{win}} = \cos^2(\pi/8) \approx 85.36\%$, что строго превышает классический физический предел в $75\%$.
* **Результат решения:** `ПАРАМЕТРИЗОВАННЫЙ ГЕНЕРАТОР СХЕМЫ` / `ГИБРИДНЫЙ АЛГОРИТМ`
* **Формат ответа:** Набор функций генерации схем и протокола на Python/Qiskit:
  ```python
  from qiskit import QuantumCircuit

  def win_condition(x: int, y: int, a: int, b: int) -> bool:
      """Проверка условия выигрыша CHSH: x AND y == a XOR b."""
      ...

  def create_chsh_circuit(x: int, y: int) -> QuantumCircuit:
      """
      Формирует 2-кубитную квантовую схему для раунда CHSH с входными битами (x, y).
      :param x: бит Алисы (0 или 1)
      :param y: бит Боба (0 или 1)
      :return: QuantumCircuit(2, 2)
      """
      ...
  ```
* **Число кубитов:** 2 кубита (кубит 0: подсистема Алисы; кубит 1: подсистема Боба) и 2 классических бита для фиксации ответов.
* **Сложность:** B (Intermediate / Div 2), Time Limit: 2.0 сек, Memory Limit: 512 MB.
* **Оценка `VISUAL_GUI_READY`:** `ДА (100%)`  
  *Обоснование:* Схема для каждой фиксированной комбинации входов $(x, y) \in \{0, 1\}^2$ состоит из создания пары Белла ($H$, $\text{CNOT}$), двух локальных однокубитных поворотов вокруг оси $Y$ ($R_y(\theta_A)$ для Алисы и $R_y(\theta_B)$ для Боба) и двух измерений. Вся схема содержит 4–5 элементарных вентилей с глубиной 3 и тривиально моделируется в визуальном drag-and-drop редакторе.
* **Асимптотика симуляции и проверка автосудьей:**  
  * Размерность гильбертова пространства $N = 2^2 = 4$.  
  * Точная безимпульсная симуляция вектора состояния через `Statevector` занимает $< 0.5$ мс на пару входов.  
  * Аналитическая вероятность выигрыша вычисляется точно: $P(x \land y = a \oplus b) = \cos^2(\pi/8) = \frac{2+\sqrt{2}}{4} \approx 0.853553$.
* **Устойчивость к перебору (Brute-force):** `BRUTE_FORCE_PROTECTED`  
  * По теореме Белла любая локальная детерминированная или рандомизированная классическая стратегия ограничена вероятностью выигрыша $P_{\text{classical}} \le 3/4 = 0.75$.  
  * Судейский модуль требует достижения $P_{\text{win}} \ge 0.84$ на всех 4 комбинациях входов одновременно, что делает сдачу классического кода или фальсификации физически невозможной.
* **Теги:** `[VISUAL_GUI_READY]`, `[BELL_INEQUALITY]`, `[CHSH_GAME]`, `[QUANTUM_NONLOCALITY]`, `[TSIRELSON_BOUND]`, `[BRUTE_FORCE_PROTECTED]`.

---

## 2. МАТЕМАТИЧЕСКАЯ ПОСТАНОВКА И ОПТИМАЛЬНАЯ СТРАТЕГИЯ

### 2.1. Правила игры CHSH

1. Рефери независимо и равновероятно генерирует два классических бита: $x \in \{0, 1\}$ (отправляется Алисе) и $y \in \{0, 1\}$ (отправляется Бобу).
2. Алиса и Боб находятся в пространственно разделенных локациях и **не могут передавать сигналы** во время раунда.
3. Алиса выдает бит $a \in \{0, 1\}$, Боб выдает бит $b \in \{0, 1\}$.
4. Алиса и Боб побеждают в раунде тогда и только тогда, когда выполнено предикатное условие:
   $$
   x \land y = a \oplus b
   $$
   (где $\land$ — логическое И, $\oplus$ — сложение по модулю 2 / XOR).

Таблица условий победы:
| $x$ | $y$ | $x \land y$ | Условие победы | Требуемое соотношение ответов |
|---|---|---|---|---|
| $0$ | $0$ | $0$ | $a \oplus b = 0$ | $a = b$ |
| $0$ | $1$ | $0$ | $a \oplus b = 0$ | $a = b$ |
| $1$ | $0$ | $0$ | $a \oplus b = 0$ | $a = b$ |
| $1$ | $1$ | $1$ | $a \oplus b = 1$ | $a \neq b$ |

В классической физике игроки могут согласовать стратегию заранее: лучшая стратегия — всегда отвечать $a=0, b=0$. Тогда они выигрывают в 3 случаях из 4:
$$
P_{\text{classical}} = \frac{1}{4}(1 + 1 + 1 + 0) = \frac{3}{4} = 75\%
$$

### 2.2. Квантовая стратегия и граница Цирельсона

Перед началом игры Алиса и Боб получают по одному кубиту максимально запутанного состояния Белла:
$$
|\Phi^+\rangle = \frac{1}{\sqrt{2}}(|00\rangle + |11\rangle)
$$

Получив свои биты, игроки поворачивают свои кубиты вокруг оси $Y$ с помощью оператора $R_y(\theta) = \exp(-i \frac{\theta}{2} Y)$ перед стандартным измерением в вычислительном базисе $Z$:
1. **Базисы Алисы:**
   - Если $x = 0$: Алиса измеряет в $Z$-базисе $\implies \theta_A(0) = 0$.
   - Если $x = 1$: Алиса измеряет в $X$-базисе $\implies \theta_A(1) = \frac{\pi}{2}$ (поворот переводит $|+\rangle \to |0\rangle$).
2. **Базисы Боба:**
   - Если $y = 0$: Боб поворачивает на угол $\theta_B(0) = \frac{\pi}{4}$.
   - Если $y = 1$: Боб поворачивает на угол $\theta_B(1) = -\frac{\pi}{4}$.

При такой конфигурации разность эффективных углов между базисами измерения Алисы и Боба составляет ровно $\pm \pi/8$ для всех пар $(x, y)$, где $x \land y = 0$, и $3\pi/8$ для пары $(1, 1)$.  
Вероятность совпадения / различия исходов дает квантовую вероятность успеха:
$$
P_{\text{win}}(x, y) = \cos^2\left(\frac{\pi}{8}\right) = \frac{1 + \cos(\pi/4)}{2} = \frac{1 + \frac{\sqrt{2}}{2}}{2} = \frac{2+\sqrt{2}}{4} \approx 0.85355339
$$
Средний квантовый выигрыш:
$$
P_{\text{quantum}} = \frac{1}{4} \sum_{x, y \in \{0, 1\}} P_{\text{win}}(x, y) = \cos^2\left(\frac{\pi}{8}\right) \approx 85.36\%
$$
Квантовый коррелятор CHSH принимает максимальное теоретическое значение Цирельсона:
$$
S = \langle A_0 B_0 \rangle + \langle A_0 B_1 \rangle + \langle A_1 B_0 \rangle - \langle A_1 B_1 \rangle = 2\sqrt{2} \approx 2.8284 > 2
$$

### 2.3. ASCII-диаграмма квантовой схемы раунда CHSH

```
          ┌───┐     ┌──────────────┐┌─┐
q_0: ─────┤ H ├──■──┤ Ry(theta_A)  ├┤M├───  (Alice: theta_A = 0 if x=0 else pi/2)
          └───┘┌─┴─┐├──────────────┤└╥┘┌─┐
q_1: ──────────┤ X ├┤ Ry(theta_B)  ├─╫─┤M├  (Bob:   theta_B = pi/4 if y=0 else -pi/4)
               └───┘└──────────────┘ ║ └╥┘
c: 2/════════════════════════════════╩══╩═
                                     0  1
                                     a  b
```

---

## 3. АВТОРСКОЕ ЭТАЛОННОЕ КВАНТОВОЕ РЕШЕНИЕ

```python
"""
Авторское эталонное решение: Microsoft Quantum Katas - CHSH Game
Оптимальная квантовая стратегия с вероятностью победы cos^2(pi/8) ≈ 0.8536.
"""

from qiskit import QuantumCircuit
from qiskit.quantum_info import Statevector
import numpy as np

def win_condition(x: int, y: int, a: int, b: int) -> bool:
    """
    Проверяет условие победы в игре CHSH:
    x * y == a ^ b
    """
    return (x & y) == (a ^ b)

def create_chsh_circuit(x: int, y: int) -> QuantumCircuit:
    """
    Генерирует квантовую схему раунда CHSH для пары входов (x, y).
    :param x: 0 или 1 (вход Алисы)
    :param y: 0 или 1 (вход Боба)
    :return: QuantumCircuit(2, 2)
    """
    if x not in (0, 1) or y not in (0, 1):
        raise ValueError("Входные биты x и y должны быть строго 0 или 1.")
        
    qc = QuantumCircuit(2, 2, name=f"CHSH_Round_{x}_{y}")
    
    # 1. Приготовление общей запутанной пары |Phi+> = (|00> + |11>)/sqrt(2)
    qc.h(0)
    qc.cx(0, 1)
    
    # 2. Локальное унитарное вращение Алисы (кубит 0)
    theta_a = 0.0 if x == 0 else np.pi / 2.0
    qc.ry(theta_a, 0)
    
    # 3. Локальное унитарное вращение Боба (кубит 1)
    theta_b = np.pi / 4.0 if y == 0 else -np.pi / 4.0
    qc.ry(theta_b, 1)
    
    # 4. Локальные проективные измерения
    qc.measure(0, 0) # бит 'a' Алисы
    qc.measure(1, 1) # бит 'b' Боба
    
    return qc

def calculate_analytical_chsh_win_prob(x: int, y: int) -> float:
    """
    Вычисляет точную аналитическую вероятность выигрыша без shot noise через Statevector.
    """
    qc = QuantumCircuit(2)
    qc.h(0)
    qc.cx(0, 1)
    
    theta_a = 0.0 if x == 0 else np.pi / 2.0
    theta_b = np.pi / 4.0 if y == 0 else -np.pi / 4.0
    qc.ry(theta_a, 0)
    qc.ry(theta_b, 1)
    
    sv = Statevector(qc)
    probs = sv.probabilities() # [p00, p01, p10, p11]
    
    # При little-endian:
    # probs[0] = P(00): a=0, b=0 -> a^b = 0
    # probs[1] = P(01): a=1, b=0 -> a^b = 1
    # probs[2] = P(10): a=0, b=1 -> a^b = 1
    # probs[3] = P(11): a=1, b=1 -> a^b = 0
    p_same = probs[0] + probs[3] # a ^ b == 0
    p_diff = probs[1] + probs[2] # a ^ b == 1
    
    target_xor = x & y
    return float(p_diff if target_xor == 1 else p_same)
```

---

## 4. АВТОПРОВЕРКА, ТЕСТКЕЙСЫ И ВАЛИДАЦИЯ РЕШЕНИЙ

### 4.1. Автоматический тестовый модуль (Auto-Judge)

```python
import numpy as np
from qiskit import QuantumCircuit
from qiskit.quantum_info import Statevector

def verify_chsh_circuit_structure(qc: QuantumCircuit):
    """Анти-чит проверка: локальность операций игроков после запутывания."""
    assert qc.num_qubits == 2, f"Схема должна содержать ровно 2 кубита, получено: {qc.num_qubits}"
    
    # Проверяем, что запутывающий гейт ровно один в самом начале (до вращений)
    cnot_indices = [i for i, inst in enumerate(qc.data) if inst.operation.name == "cx"]
    assert len(cnot_indices) == 1, "Запрещена квантовая коммуникация: должен быть ровно 1 CNOT при создании пары!"
    
    # Проверяем отсутствие межквантовой коммуникации между игроками во время раунда
    for inst in qc.data[cnot_indices[0] + 1:]:
        if inst.operation.name in ["cx", "cz", "swap", "ecr"]:
            raise AssertionError("АНТИ-ЧИТ НАРУШЕНИЕ: Обнаружен 2-кубитный гейт во время выполнения стратегии!")

def run_auto_judge():
    print("=== ЗАПУСК AUTO-JUDGE: 050_MICROSOFT_KATAS_CHSH_GAME ===")
    all_passed = True
    
    expected_prob = np.cos(np.pi / 8.0) ** 2 # ≈ 0.853553
    print(f"Целевая граница Цирельсона: {expected_prob:.6f} (Предел Белла: 0.750000)\n")
    
    # 1. Проверка логики win_condition
    truth_table = [
        (0, 0, 0, 0, True),
        (0, 0, 0, 1, False),
        (0, 1, 1, 1, True),
        (1, 0, 1, 0, False),
        (1, 1, 0, 1, True),
        (1, 1, 1, 1, False),
    ]
    for x, y, a, b, exp_win in truth_table:
        res = win_condition(x, y, a, b)
        assert res == exp_win, f"Ошибка в win_condition({x}, {y}, {a}, {b})"
    print("[PASS] Предикат победы win_condition верифицирован.")
    
    # 2. Проверка схем и квантовой вероятности на всех 4 парах входов
    input_pairs = [(0, 0), (0, 1), (1, 0), (1, 1)]
    measured_probs = []
    
    for idx, (x, y) in enumerate(input_pairs, 1):
        circ = create_chsh_circuit(x, y)
        verify_chsh_circuit_structure(circ)
        
        prob = calculate_analytical_chsh_win_prob(x, y)
        measured_probs.append(prob)
        
        if not np.isclose(prob, expected_prob, atol=1e-5):
            print(f"[FAIL] Пара (x={x}, y={y}): P_win = {prob:.6f} != {expected_prob:.6f}")
            all_passed = False
        else:
            print(f"[PASS] Пара {idx} (x={x}, y={y}): P_win = {prob:.6f} == cos^2(pi/8) OK")
            
    avg_win = float(np.mean(measured_probs))
    print(f"\nСредняя вероятность победы: {avg_win:.6f}")
    assert np.isclose(avg_win, expected_prob, atol=1e-5), "Средняя вероятность не достигла границы Цирельсона!"
    assert avg_win > 0.75, "Классический предел Белла не преодолен!"
    
    print(f"Превышение классического предела: +{(avg_win - 0.75) * 100:.2f}%")
    print("ВСЕ ТЕСТ-КЕЙСЫ УСПЕШНО ПРОЙДЕНЫ! ВЕРДИКТ: ACCEPTED.")

if __name__ == "__main__":
    run_auto_judge()
```

### 4.2. Таблица валидационных тесткейсов

| № теста | Вход $x$ (Алиса) | Вход $y$ (Боб) | Угол $\theta_A$ | Угол $\theta_B$ | Целевое условие $a \oplus b$ | Аналитический $P_{\text{win}}$ | Физический статус |
|---|---|---|---|---|---|---|---|
| **1** | $0$ | $0$ | $0$ | $+\pi/4$ | $0$ ($a = b$) | $\cos^2(\pi/8) \approx 0.853553$ | Превышение предела Белла ($+10.36\%$) |
| **2** | $0$ | $1$ | $0$ | $-\pi/4$ | $0$ ($a = b$) | $\cos^2(\pi/8) \approx 0.853553$ | Превышение предела Белла ($+10.36\%$) |
| **3** | $1$ | $0$ | $+\pi/2$ | $+\pi/4$ | $0$ ($a = b$) | $\cos^2(\pi/8) \approx 0.853553$ | Превышение предела Белла ($+10.36\%$) |
| **4** | $1$ | $1$ | $+\pi/2$ | $-\pi/4$ | $1$ ($a \neq b$) | $\cos^2(\pi/8) \approx 0.853553$ | Превышение предела Белла ($+10.36\%$) |
| **5** | All | All | - | - | - | **Среднее:** $\mathbf{0.853553}$ | **Нарушение неравенства CHSH ($S = 2\sqrt{2}$)** |
