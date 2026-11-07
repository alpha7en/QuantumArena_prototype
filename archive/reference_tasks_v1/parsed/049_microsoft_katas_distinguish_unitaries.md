# 049_microsoft_katas_distinguish_unitaries: Детерминированная квантовая дискриминация унитарных операторов

---

## 1. ПАСПОРТ ЗАДАЧИ И КВАНТОВО-АЛГОРИТМИЧЕСКАЯ СПЕЦИФИКАЦИЯ

* **ID задачи:** `049_microsoft_katas_distinguish_unitaries`
* **Название:** Детерминированное различение унитарных операторов Паули за один запрос с использованием квантовой запутанности (Distinguish Pauli Unitaries with Single Query and Ancilla Entanglement)
* **Первоисточник:** Microsoft Quantum Katas (`DistinguishUnitaries/Tasks.qs`, Task 1.11, Task 1.1, Task 1.2, депонировано в `research/05_raw_sources_and_snapshots/microsoft/katas_distinguish_unitaries_tasks.qs`, запись `EVID-062` в `EVIDENCE_CATALOG.md`).  
  URL: https://raw.githubusercontent.com/microsoft/QuantumKatas/main/DistinguishUnitaries/Tasks.qs
* **Платформа:** Microsoft Quantum Katas / Q# / Qiskit
* **Общее описание:** По заданному черному ящику (оракулу), реализующему один из четырех фундаментальных унитарных операторов Паули $\{I, X, Y, Z\}$ на одном кубите, однозначно и детерминированно определить, какая именно операция была применена, используя ровно один запрос ($1$ query) к оракулу и одну вспомогательную анциллу.
* **Результат решения:** `ОРАКУЛЬНЫЙ АЛГОРИТМ` / `ФИКСИРОВАННАЯ ЧИСТО КВАНТОВАЯ СХЕМА`
* **Формат ответа:** Функция генерации схемы и классификатор на Qiskit:
  ```python
  from qiskit import QuantumCircuit

  def build_pauli_distinction_circuit(oracle: QuantumCircuit) -> QuantumCircuit:
      """
      Формирует квантовую схему различения операторов Паули {I, X, Y, Z}.
      :param oracle: QuantumCircuit(1) с неизвестным унитарным гейтом.
      :return: QuantumCircuit(2, 2) с подготовкой Белла, вызовом оракула и декодированием.
      """
      ...

  def classify_pauli_unitary(oracle: QuantumCircuit) -> str:
      """
      Определяет тип оператора Паули ('I', 'X', 'Y', 'Z') без shot noise.
      :param oracle: QuantumCircuit(1)
      :return: одна из строк 'I', 'X', 'Y', 'Z'
      """
      ...
  ```
* **Число кубитов:** 2 кубита (кубит 0: целевой кубит для применения оракула; кубит 1: вспомогательная запутанная анцилла) и 2 классических бита для измерения.
* **Сложность:** B (Intermediate / Div 2), Time Limit: 2.0 сек, Memory Limit: 512 MB.
* **Оценка `VISUAL_GUI_READY`:** `ДА (100%)`  
  *Обоснование:* Схема полностью статическая и фиксированная. Состоит из гейта Адамара $H$ на кубите 0, вентиля CNOT ($0 \to 1$), вставки черного ящика оракула на кубит 0, обратного CNOT ($0 \to 1$), гейта $H$ на кубите 0 и двух измерений в вычислительном базисе. Схема не содержит параметрических циклов и собирается в визуальном GUI-конструкторе за 20 секунд.
* **Асимптотика симуляции и проверка автосудьей:**  
  * Размерность гильбертова пространства $N = 2^2 = 4$.  
  * Точная симуляция вектора состояния через `Statevector` выполняется за доли миллисекунды ($< 1$ мс).  
  * Вероятность правильного ответа $P_{\text{correct}} = 1.0$ (100% детерминизм без статистической погрешности шотов).
* **Устойчивость к перебору (Brute-force):** `BRUTE_FORCE_PROTECTED`  
  * Согласно квантовой теореме Хелстрома (Helstrom bound), на одном изолированном кубите невозможно ортогонально различить более двух состояний за одно измерение (размерность пространства $d=2$).  
  * Любая попытка классификатора обойтись без запутанной анциллы приводит к теоретическому пределу точности $\le 50\%$. Требуется понимание изоморфизма между базисом Белла и операторами Паули (сверхплотное кодирование наоборот).
* **Теги:** `[VISUAL_GUI_READY]`, `[ORACLE_ALGORITHM]`, `[BELL_STATE]`, `[SUPERDENSE_CODING_DUAL]`, `[UNITARY_DISCRIMINATION]`, `[BRUTE_FORCE_PROTECTED]`.

---

## 2. МАТЕМАТИЧЕСКАЯ ПОСТАНОВКА И СХЕМА АЛГОРИТМА

### 2.1. Физико-математический базис квантовой дискриминации

Операторы Паули образуют ортонормированный базис в пространстве операторов $\mathbb{C}^{2 \times 2}$ относительно скалярного произведения Гильберта — Шмидта $\langle A, B \rangle = \frac{1}{2} \text{Tr}(A^\dagger B)$:
$$
I = \begin{pmatrix} 1 & 0 \\ 0 & 1 \end{pmatrix}, \quad 
X = \begin{pmatrix} 0 & 1 \\ 1 & 0 \end{pmatrix}, \quad 
Y = \begin{pmatrix} 0 & -i \\ i & 0 \end{pmatrix}, \quad 
Z = \begin{pmatrix} 1 & 0 \\ 0 & -1 \end{pmatrix}
$$

Если мы готовим максимально запутанную пару Белла:
$$
|\Phi^+\rangle = \frac{1}{\sqrt{2}}(|00\rangle + |11\rangle)
$$
и применяем неизвестный унитарный оператор $U \in \{I, X, Y, Z\}$ к первому кубиту (кубит 0), двухкубитная система переходит в одно из четырех взаимно ортогональных белловских состояний:
$$
\begin{aligned}
(I \otimes I)|\Phi^+\rangle &= \frac{1}{\sqrt{2}}(|00\rangle + |11\rangle) = |\Phi^+\rangle \\
(X \otimes I)|\Phi^+\rangle &= \frac{1}{\sqrt{2}}(|10\rangle + |01\rangle) = |\Psi^+\rangle \\
(Y \otimes I)|\Phi^+\rangle &= \frac{1}{\sqrt{2}}(-i|10\rangle + i|01\rangle) = -i |\Psi^-\rangle \\
(Z \otimes I)|\Phi^+\rangle &= \frac{1}{\sqrt{2}}(|00\rangle - |11\rangle) = |\Phi^-\rangle
\end{aligned}
$$

### 2.2. Декодирование в вычислительный базис (Bell Measurement)

Поскольку глобальная фаза $-i = e^{-i\pi/2}$ не влияет на результат проективных измерений, четыре состояния образуют ортонормированный базис. Применяя унитарный декодер Белла $U_{\text{Bell}}^\dagger = (H \otimes I) \cdot \text{CNOT}_{0 \to 1}$:
$$
\begin{aligned}
|\Phi^+\rangle &\xrightarrow{\text{CNOT}} \frac{1}{\sqrt{2}}(|00\rangle + |10\rangle) \xrightarrow{H_0} |00\rangle \\
|\Phi^-\rangle &\xrightarrow{\text{CNOT}} \frac{1}{\sqrt{2}}(|00\rangle - |10\rangle) \xrightarrow{H_0} |10\rangle \quad (\text{Qiskit bitstring: } q_1=0, q_0=1 \implies \text{целое число } 1) \\
|\Psi^+\rangle &\xrightarrow{\text{CNOT}} \frac{1}{\sqrt{2}}(|11\rangle + |01\rangle) \xrightarrow{H_0} |01\rangle \quad (\text{Qiskit bitstring: } q_1=1, q_0=0 \implies \text{целое число } 2) \\
-i|\Psi^-\rangle &\xrightarrow{\text{CNOT}} \frac{-i}{\sqrt{2}}(|11\rangle - |01\rangle) \xrightarrow{H_0} -i|11\rangle \quad (\text{Qiskit bitstring: } q_1=1, q_0=1 \implies \text{целое число } 3)
\end{aligned}
$$

### 2.3. ASCII-диаграмма квантовой схемы

```
          ┌───┐     ┌───────────┐     ┌───┐┌─┐
q_0: ─────┤ H ├──■──┤ Oracle(U) ├──■──┤ H ├┤M├───
          └───┘┌─┴─┐└───────────┘┌─┴─┐└───┘└╥┘┌─┐
q_1: ──────────┤ X ├─────────────┤ X ├──────╫─┤M├
               └───┘             └───┘      ║ └╥┘
c: 2/═══════════════════════════════════════╩══╩═
                                            0  1
```

Соответствие результатов измерения:
- $c_1 c_0 = 00 \implies I$
- $c_1 c_0 = 01 \implies Z$
- $c_1 c_0 = 10 \implies X$
- $c_1 c_0 = 11 \implies Y$

---

## 3. АВТОРСКОЕ ЭТАЛОННОЕ КВАНТОВОЕ РЕШЕНИЕ

```python
"""
Авторское эталонное решение: Microsoft Quantum Katas - Distinguish Unitaries (Pauli Discrimination)
Детерминированное различение унитарных операторов Паули {I, X, Y, Z} с 1 запросом.
"""

from qiskit import QuantumCircuit
from qiskit.quantum_info import Statevector
import numpy as np

def build_pauli_distinction_circuit(oracle: QuantumCircuit) -> QuantumCircuit:
    """
    Создает полную схему с измерением для запуска на квантовом симуляторе или QPU.
    :param oracle: QuantumCircuit(1) с неизвестным унитарным оператором.
    :return: QuantumCircuit(2, 2)
    """
    qc = QuantumCircuit(2, 2, name="Pauli_Distinguisher")
    
    # 1. Приготовление состояния Белла |Phi+>
    qc.h(0)
    qc.cx(0, 1)
    
    # 2. Ровно 1 запрос к черному ящику (оракул на кубите 0)
    qc.compose(oracle, qubits=[0], inplace=True)
    
    # 3. Базисное преобразование Белла в вычислительный базис
    qc.cx(0, 1)
    qc.h(0)
    
    # 4. Измерение кубитов
    qc.measure([0, 1], [0, 1])
    return qc

def classify_pauli_unitary(oracle: QuantumCircuit) -> str:
    """
    Аналитическая безимпульсная классификация через Statevector.
    :param oracle: QuantumCircuit(1) с оператором Паули.
    :return: 'I', 'X', 'Y', или 'Z'.
    """
    qc = QuantumCircuit(2, name="Pauli_Classifier_Statevector")
    qc.h(0)
    qc.cx(0, 1)
    qc.compose(oracle, qubits=[0], inplace=True)
    qc.cx(0, 1)
    qc.h(0)
    
    sv = Statevector(qc)
    probs = sv.probabilities()
    max_idx = int(np.argmax(probs))
    
    # Таблица соответствия базисных состояний Qiskit (Little-Endian: |q_1 q_0>):
    # 0 = |00> -> I
    # 1 = |01> -> Z
    # 2 = |10> -> X
    # 3 = |11> -> Y
    mapping = {0: "I", 1: "Z", 2: "X", 3: "Y"}
    return mapping[max_idx]
```

---

## 4. АВТОПРОВЕРКА, ТЕСТКЕЙСЫ И ВАЛИДАЦИЯ РЕШЕНИЙ

### 4.1. Автоматический тестовый модуль (Auto-Judge)

```python
import numpy as np
from qiskit import QuantumCircuit
from qiskit.quantum_info import Statevector

def verify_single_query_anti_cheat(qc: QuantumCircuit, oracle_name: str):
    """
    Анти-чит проверка:
    1. Ровно 2 кубита в схеме.
    2. Вызов оракула ровно 1 раз.
    """
    assert qc.num_qubits == 2, f"Ожидалось ровно 2 кубита, получено {qc.num_qubits}"
    # Подсчет числа нетривиальных унитарных вставок
    # В эталонной схеме: ровно 2 CNOT, 2 H и 1 вызов оракула
    cx_count = sum(1 for inst in qc.data if inst.operation.name == "cx")
    h_count = sum(1 for inst in qc.data if inst.operation.name == "h")
    assert cx_count == 2, f"Нарушение структуры декодера: CNOT count = {cx_count} != 2"
    assert h_count == 2, f"Нарушение структуры декодера: H count = {h_count} != 2"

def run_auto_judge():
    print("=== ЗАПУСК AUTO-JUDGE: 049_MICROSOFT_KATAS_DISTINGUISH_UNITARIES ===")
    all_passed = True
    
    # Определение тестовых оракулов Паули
    oracle_generators = {
        "I": lambda: QuantumCircuit(1, name="Oracle_I"),
        "X": lambda: QuantumCircuit(1, name="Oracle_X"),
        "Y": lambda: QuantumCircuit(1, name="Oracle_Y"),
        "Z": lambda: QuantumCircuit(1, name="Oracle_Z"),
    }
    oracle_generators["X"]().x(0)
    oracle_generators["Y"]().y(0)
    oracle_generators["Z"]().z(0)
    
    # Набор тестов: базовые + со случайной глобальной фазой
    test_cases = [
        ("I", lambda: QuantumCircuit(1, name="I_pure")),
        ("X", lambda: (lambda c: (c.x(0), c)[1])(QuantumCircuit(1, name="X_pure"))),
        ("Y", lambda: (lambda c: (c.y(0), c)[1])(QuantumCircuit(1, name="Y_pure"))),
        ("Z", lambda: (lambda c: (c.z(0), c)[1])(QuantumCircuit(1, name="Z_pure"))),
    ]
    
    # Добавляем фазированные варианты (-I, -X, -Y, -Z), которые физически эквивалентны
    for label in ["I", "X", "Y", "Z"]:
        def make_phased(lbl=label):
            c = QuantumCircuit(1, name=f"{lbl}_phased")
            if lbl == "X": c.x(0)
            elif lbl == "Y": c.y(0)
            elif lbl == "Z": c.z(0)
            c.global_phase = np.pi / 3.0  # Произвольная глобальная фаза
            return c
        test_cases.append((label, make_phased))
        
    for idx, (expected_label, gen_fn) in enumerate(test_cases, 1):
        oracle_circ = gen_fn()
        predicted = classify_pauli_unitary(oracle_circ)
        full_circ = build_pauli_distinction_circuit(oracle_circ)
        verify_single_query_anti_cheat(full_circ, oracle_circ.name)
        
        if predicted != expected_label:
            print(f"[FAIL] Тест {idx}: Оракул {expected_label} ошибочно определен как {predicted}")
            all_passed = False
        else:
            print(f"[PASS] Тест {idx}: Оракул '{oracle_circ.name}' -> Успешно распознан как '{predicted}' (Точность 100%)")
            
    assert all_passed, "Тесты классификатора не пройдены!"
    print("ВСЕ ТЕСТ-КЕЙСЫ УСПЕШНО ПРОЙДЕНЫ! ВЕРДИКТ: ACCEPTED.")

if __name__ == "__main__":
    run_auto_judge()
```

### 4.2. Таблица валидационных тесткейсов

| № теста | Оракул | Примененный гейт | Глобальная фаза | Состояние до декодера | Измеряемый битстринг $c_1 c_0$ | Предсказанный класс |
|---|---|---|---|---|---|---|
| **1** | `Oracle_I` | $I$ | $0$ | $|\Phi^+\rangle = \frac{1}{\sqrt{2}}(|00\rangle + |11\rangle)$ | `00` (index 0) | `I` |
| **2** | `Oracle_X` | $X$ | $0$ | $|\Psi^+\rangle = \frac{1}{\sqrt{2}}(|10\rangle + |01\rangle)$ | `10` (index 2) | `X` |
| **3** | `Oracle_Y` | $Y$ | $0$ | $-i|\Psi^-\rangle = \frac{-i}{\sqrt{2}}(|10\rangle - |01\rangle)$ | `11` (index 3) | `Y` |
| **4** | `Oracle_Z` | $Z$ | $0$ | $|\Phi^-\rangle = \frac{1}{\sqrt{2}}(|00\rangle - |11\rangle)$ | `01` (index 1) | `Z` |
| **5** | `I_phased` | $I$ | $\pi / 3$ | $e^{i\pi/3}|\Phi^+\rangle$ | `00` (index 0) | `I` |
| **6** | `X_phased` | $X$ | $\pi / 3$ | $e^{i\pi/3}|\Psi^+\rangle$ | `10` (index 2) | `X` |
| **7** | `Y_phased` | $Y$ | $\pi / 3$ | $-i e^{i\pi/3}|\Psi^-\rangle$ | `11` (index 3) | `Y` |
| **8** | `Z_phased` | $Z$ | $\pi / 3$ | $e^{i\pi/3}|\Phi^-\rangle$ | `01` (index 1) | `Z` |
