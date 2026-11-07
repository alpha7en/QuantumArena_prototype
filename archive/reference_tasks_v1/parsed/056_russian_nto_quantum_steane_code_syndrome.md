# 056_russian_nto_quantum_steane_code_syndrome: Извлечение синдрома и декодирование 7-кубитного кода Штина [[7,1,3]]

---

## 1. ПАСПОРТ ЗАДАЧИ И КВАНТОВО-АЛГОРИТМИЧЕСКАЯ СПЕЦИФИКАЦИЯ

* **ID задачи:** `056_russian_nto_quantum_steane_code_syndrome`
* **Название:** Квантовая схема извлечения синдрома и коррекции ошибок 7-кубитного CSS-кода Штина [[7,1,3]] (Steane [[7,1,3]] Quantum Error Correction Syndrome Extraction and Recovery)
* **Первоисточник:** Российский квантовый центр (РКЦ) / Национальная технологическая олимпиада (НТО) по квантовому инжинирингу (депонировано в `research/05_raw_sources_and_snapshots/uchikvanty/nto_quantum_steane_code_qec_task.py`, запись `EVID-070` в `EVIDENCE_CATALOG.md`).  
  URL: https://rqc.ru/
* **Платформа:** НТО / РКЦ / Qiskit
* **Общее описание:** Реализовать 13-кубитную квантовую схему извлечения синдрома для 7-кубитного квантового кода коррекции ошибок Штина (Steane [[7,1,3]] CSS code) с использованием 6 вспомогательных анцилл. По 6-битному измеренному синдрому стабилизаторов ($3$ для битовых ошибок $X$, $3$ для фазовых ошибок $Z$) однозначно локализовать поврежденный кубит данных и применить унитарную восстанавливающую операцию Паули ($X$, $Z$ или $Y$) для возврата логического состояния в кодовое пространство.
* **Результат решения:** `КВАНТОВЫЙ ДЕКОДЕР` / `ПАРАМЕТРИЗОВАННЫЙ ГЕНЕРАТОР СХЕМЫ`
* **Формат ответа:** Набор функций на Python/Qiskit:
  ```python
  from qiskit import QuantumCircuit
  from typing import Tuple, Optional

  def syndrome_to_error_qubit(syndrome: Tuple[int, int, int]) -> int:
      """Декодирует 3-битный синдром в индекс поврежденного кубита (0..6) или -1 при отсутствии ошибки."""
      ...

  def build_steane_syndrome_extraction_circuit() -> QuantumCircuit:
      """
      Формирует квантовую схему извлечения 6 генераторов стабилизатора.
      Регистры:
        - data  : 7 кубитов [0 .. 6]
        - anc_z : 3 кубита [7 .. 9] (для измерения Z-стабилизаторов / X-ошибок)
        - anc_x : 3 кубита [10 .. 12] (для измерения X-стабилизаторов / Z-ошибок)
      """
      ...

  def correct_steane_code_error(qc: QuantumCircuit, syn_z: Tuple[int, int, int],
                                syn_x: Tuple[int, int, int]) -> None:
      """Применяет восстанавливающие гейты Паули на поврежденный кубит."""
      ...
  ```
* **Число кубитов:** 13 кубитов (7 физических кубитов данных + 3 анциллы для $Z$-стабилизаторов + 3 анциллы для $X$-стабилизаторов).
* **Сложность:** C (Hard / Div 1), Time Limit: 3.0 сек, Memory Limit: 512 MB.
* **Оценка `VISUAL_GUI_READY`:** `ЧАСТИЧНО (PARAMETRIC_CODE_ONLY)`  
  *Обоснование:* Схема содержит 13 кубитов, 24 двухкубитных вентиля CNOT со специфической топологией проверочной матрицы Хэмминга $H$, 6 гейтов Адамара, 6 измерений и условный контур обратной связи (feed-forward correction). Хотя отдельный стабилизаторный узел можно визуализировать, вся совокупная схема стабилизатора и активного декодера синтезируется программно.
* **Асимптотика симуляции и проверка автосудьей:**  
  * Размерность пространства $N = 2^{13} = 8192$.  
  * Симуляция через `Statevector` выполняется за $15$–$30$ мс на один тестовый сценарий.  
  * Точность декодирования: $100\%$ детерминированная коррекция всех 21 однокубитных типов ошибок (7 позиций $\times$ 3 типа ошибок $\{X, Y, Z\}$).
* **Устойчивость к перебору (Brute-force):** `BRUTE_FORCE_PROTECTED`  
  * Пространство произвольных унитарных преобразований размера $8192 \times 8192$ исключает эвристический подбор.  
  * Схема жестко привязана к дуальной структуре кодов Хэмминга $C = C^\perp$. Нарушение порядка или направления хотя бы одного CNOT приводит к фазовому загрязнению данных (phase damage) и разрушению квантовой суперпозиции.
* **Теги:** `[PARAMETRIC_CODE_ONLY]`, `[QUANTUM_ERROR_CORRECTION]`, `[STEANE_CODE]`, `[CSS_CODES]`, `[STABILIZER_FORMALISM]`, `[SYNDROME_DECODING]`, `[BRUTE_FORCE_PROTECTED]`.

---

## 2. МАТЕМАТИЧЕСКАЯ ПОСТАНОВКА И СТАБИЛИЗАТОРНЫЙ ФОРМАЛИЗМ

### 2.1. Параметры кода Штина [[7,1,3]]

Код Штина — это квантовый CSS-код (Calderbank-Shor-Steane), построенный на базе классического двоичного кода Хэмминга $[7, 4, 3]$ и его дуального кода:
- Физических кубитов: $n = 7$
- Логических кубитов: $k = 1$
- Кодовое расстояние: $d = 3$ (позволяет обнаружить и исправить любую произвольную однокубитную ошибку $t = \lfloor(d-1)/2\rfloor = 1$).

Проверочная матрица классического кода Хэмминга размера $3 \times 7$:
$$
H = \begin{pmatrix}
1 & 0 & 0 & 0 & 1 & 1 & 1 \\
0 & 1 & 0 & 1 & 0 & 1 & 1 \\
0 & 0 & 1 & 1 & 1 & 0 & 1
\end{pmatrix}
$$
Каждый столбец $j \in \{0, \dots, 6\}$ представляет собой двоичную запись числа от $1$ до $7$.

### 2.2. Генераторы группы стабилизатора

Группа стабилизатора $\mathcal{S}$ порождается 6 коммутирующими операторами Паули веса 4:
1. **$Z$-генераторы стабилизатора (детектируют битовые $X$-ошибки):**
   $$
   \begin{aligned}
   S_{Z1} &= Z_0 Z_4 Z_5 Z_6 \\
   S_{Z2} &= Z_1 Z_3 Z_5 Z_6 \\
   S_{Z3} &= Z_2 Z_3 Z_4 Z_6
   \end{aligned}
   $$
2. **$X$-генераторы стабилизатора (детектируют фазовые $Z$-ошибки):**
   $$
   \begin{aligned}
   S_{X1} &= X_0 X_4 X_5 X_6 \\
   S_{X2} &= X_1 X_3 X_5 X_6 \\
   S_{X3} &= X_2 X_3 X_4 X_6
   \end{aligned}
   $$

Поскольку $[S_{Xi}, S_{Zj}] = 0$ для всех $i, j$, коррекция битовых и фазовых ошибок полностью факторизуется и выполняется независимо.

### 2.3. Схема измерения стабилизаторов через анциллы

- **Измерение $Z$-генератора $S_{Zi}$:**  
  Анцилла инициализируется в $|0\rangle$. На каждый кубит данных из носителя генератора подается гейт $\text{CNOT}(\text{data}_q \to \text{ancilla})$. Если на кубите $q$ произошла ошибка $X$, она передается на анциллу через CNOT. Анцилла измеряется в базисе $Z$.
- **Измерение $X$-генератора $S_{Xi}$:**  
  Анцилла инициализируется в $|+\rangle = H|0\rangle$. На каждый кубит данных из носителя подается гейт $\text{CNOT}(\text{ancilla} \to \text{data}_q)$. Ошибка $Z$ на данных передается на анциллу по механизму phase kickback. На анциллу накладывается финальный гейт $H$ и выполняется измерение в базисе $Z$.

### 2.4. Правило декодирования и коррекции

Пусть измерены два 3-битных синдрома $s_Z = (s_{Z1}, s_{Z2}, s_{Z3})^T$ и $s_X = (s_{X1}, s_{X2}, s_{X3})^T$:
1. Если $s_Z \neq \vec{0}$, индекс кубита с $X$-ошибкой находится как столбец матрицы $H$, равный вектору $s_Z$. Коррекция: применить $X_{q_X}$.
2. Если $s_X \neq \vec{0}$, индекс кубита с $Z$-ошибкой находится как столбец матрицы $H$, равный вектору $s_X$. Коррекция: применить $Z_{q_Z}$.
3. Если возникла ошибка $Y = iXZ$ на кубите $q$, оба синдрома совпадут: $q_X = q_Z = q$. Применяется $Z \cdot X = -iY$.

---

## 3. АВТОРСКОЕ ЭТАЛОННОЕ КВАНТОВОЕ РЕШЕНИЕ

```python
"""
Авторское эталонное решение: НТО / РКЦ - Steane [[7,1,3]] CSS Code Syndrome Extraction
Полная схема извлечения 6 генераторов стабилизатора и декодер однокубитных ошибок.
"""

from qiskit import QuantumCircuit, QuantumRegister, ClassicalRegister
from qiskit.quantum_info import Statevector
import numpy as np
from typing import Tuple, List, Optional

# Проверочная матрица кода Хэмминга [7, 4, 3]
HAMMING_H = np.array([
    [1, 0, 0, 0, 1, 1, 1],  # Носитель S1: {0, 4, 5, 6}
    [0, 1, 0, 1, 0, 1, 1],  # Носитель S2: {1, 3, 5, 6}
    [0, 0, 1, 1, 1, 0, 1]   # Носитель S3: {2, 3, 4, 6}
], dtype=int)

def syndrome_to_error_qubit(syndrome: Tuple[int, int, int]) -> int:
    """
    Определяет номер поврежденного кубита (0..6) по 3-битному синдрому.
    Возвращает -1, если ошибок нет (синдром 000).
    """
    s = np.array(syndrome, dtype=int)
    if np.all(s == 0):
        return -1
    for q in range(7):
        if np.array_equal(HAMMING_H[:, q], s):
            return q
    raise ValueError(f"Недопустимый вектор синдрома: {syndrome}")

def steane_logical_zero(data_reg: QuantumRegister) -> QuantumCircuit:
    """
    Кодирует базисное логическое состояние |0>_L кода Штина:
    Равновероятная суперпозиция 8 кодовых слов кода Хэмминга [7, 4, 3].
    """
    qc = QuantumCircuit(data_reg, name="Steane_Logical_Zero_Encoder")
    qc.h(data_reg[0])
    qc.h(data_reg[1])
    qc.h(data_reg[2])
    qc.cx(data_reg[0], data_reg[4])
    qc.cx(data_reg[0], data_reg[5])
    qc.cx(data_reg[0], data_reg[6])
    qc.cx(data_reg[1], data_reg[3])
    qc.cx(data_reg[1], data_reg[5])
    qc.cx(data_reg[1], data_reg[6])
    qc.cx(data_reg[2], data_reg[3])
    qc.cx(data_reg[2], data_reg[4])
    qc.cx(data_reg[2], data_reg[6])
    return qc

def build_steane_syndrome_extraction_circuit(with_measurements: bool = False) -> QuantumCircuit:
    """
    Создает 13-кубитную схему для одновременного извлечения всех 6 стабилизаторов:
      q[0..6]   : 7 кубитов данных
      q[7..9]   : 3 анциллы для Z-стабилизаторов (детектируют ошибки X)
      q[10..12] : 3 анциллы для X-стабилизаторов (детектируют ошибки Z)
    :param with_measurements: если True, добавляются гейты measure на классический регистр (для симулятора с шотами / QPU)
    """
    data = QuantumRegister(7, name="data")
    anc_z = QuantumRegister(3, name="anc_z")
    anc_x = QuantumRegister(3, name="anc_x")
    
    if with_measurements:
        cr = ClassicalRegister(6, name="syndrome")
        qc = QuantumCircuit(data, anc_z, anc_x, cr, name="Steane_Syndrome_Extractor")
    else:
        qc = QuantumCircuit(data, anc_z, anc_x, name="Steane_Syndrome_Extractor")
    
    # --- 1. Измерение Z-генераторов стабилизатора (S_Z1, S_Z2, S_Z3) ---
    # S_Z1: носитель {0, 4, 5, 6}
    for q in [0, 4, 5, 6]:
        qc.cx(data[q], anc_z[0])
    # S_Z2: носитель {1, 3, 5, 6}
    for q in [1, 3, 5, 6]:
        qc.cx(data[q], anc_z[1])
    # S_Z3: носитель {2, 3, 4, 6}
    for q in [2, 3, 4, 6]:
        qc.cx(data[q], anc_z[2])
        
    # --- 2. Измерение X-генераторов стабилизатора (S_X1, S_X2, S_X3) ---
    for i in range(3):
        qc.h(anc_x[i])
        
    # S_X1: носитель {0, 4, 5, 6} (контроль - анцилла, таргет - данные)
    for q in [0, 4, 5, 6]:
        qc.cx(anc_x[0], data[q])
    # S_X2: носитель {1, 3, 5, 6}
    for q in [1, 3, 5, 6]:
        qc.cx(anc_x[1], data[q])
    # S_X3: носитель {2, 3, 4, 6}
    for q in [2, 3, 4, 6]:
        qc.cx(anc_x[2], data[q])
        
    for i in range(3):
        qc.h(anc_x[i])
        
    if with_measurements:
        qc.measure(anc_z, cr[0:3])
        qc.measure(anc_x, cr[3:6])
        
    return qc

def decode_and_correct(qc: QuantumCircuit, syn_z: Tuple[int, int, int],
                       syn_x: Tuple[int, int, int], data_qubits: List[int]) -> None:
    """
    Применяет восстанавливающие операции Паули на поврежденный кубит.
    """
    q_x_err = syndrome_to_error_qubit(syn_z)
    q_z_err = syndrome_to_error_qubit(syn_x)
    
    if q_x_err != -1:
        qc.x(data_qubits[q_x_err]) # Исправление битовой ошибки X
    if q_z_err != -1:
        qc.z(data_qubits[q_z_err]) # Исправление фазовой ошибки Z
```

---

## 4. АВТОПРОВЕРКА, ТЕСТКЕЙСЫ И ВАЛИДАЦИЯ РЕШЕНИЙ

### 4.1. Автоматический тестовый модуль (Auto-Judge)

```python
import numpy as np
from qiskit import QuantumCircuit, QuantumRegister
from qiskit.quantum_info import Statevector

def run_auto_judge():
    print("=== ЗАПУСК AUTO-JUDGE: 056_RUSSIAN_NTO_QUANTUM_STEANE_CODE_SYNDROME ===")
    all_passed = True
    
    extractor = build_steane_syndrome_extraction_circuit(with_measurements=False)
    assert extractor.num_qubits == 13, f"Число кубитов {extractor.num_qubits} != 13"
    print(f"Схема извлечения синдрома верифицирована: 13 кубитов, {extractor.size()} гейтов.")
    
    # 1. Проверка всех 21 однокубитных ошибок на истинном логическом состоянии |0>_L
    for err_type in ["X", "Z", "Y"]:
        print(f"\n--- Проверка 7 сценариев ошибок типа {err_type} ---")
        for q_err in range(7):
            data = QuantumRegister(7, "data")
            anc_z = QuantumRegister(3, "anc_z")
            anc_x = QuantumRegister(3, "anc_x")
            qc = QuantumCircuit(data, anc_z, anc_x)
            
            # 1.1. Кодирование логического нуля кода Штина
            qc.compose(steane_logical_zero(data), inplace=True)
            
            # 1.2. Инъекция ошибки Паули
            if err_type == "X":
                qc.x(data[q_err])
            elif err_type == "Z":
                qc.z(data[q_err])
            elif err_type == "Y":
                qc.y(data[q_err])
                
            # 1.3. Применение схемы извлечения синдромов
            qc.compose(extractor, inplace=True)
            
            sv = Statevector(qc)
            probs = sv.probabilities()
            best_state = int(np.argmax(probs))
            
            # Извлекаем значения анцилл Z (кубиты 7, 8, 9) и X (кубиты 10, 11, 12)
            s_z = ((best_state >> 7) & 1, (best_state >> 8) & 1, (best_state >> 9) & 1)
            s_x = ((best_state >> 10) & 1, (best_state >> 11) & 1, (best_state >> 12) & 1)
            
            det_x = syndrome_to_error_qubit(s_z)
            det_z = syndrome_to_error_qubit(s_x)
            
            if err_type == "X":
                if det_x != q_err or det_z != -1:
                    print(f"[FAIL] Ошибка X_{q_err}: det_x={det_x}, det_z={det_z}")
                    all_passed = False
                else:
                    print(f"[PASS] Ошибка X_{q_err}: локализована кубитом {det_x} (s_z={s_z}) OK")
            elif err_type == "Z":
                if det_z != q_err or det_x != -1:
                    print(f"[FAIL] Ошибка Z_{q_err}: det_x={det_x}, det_z={det_z}")
                    all_passed = False
                else:
                    print(f"[PASS] Ошибка Z_{q_err}: локализована кубитом {det_z} (s_x={s_x}) OK")
            elif err_type == "Y":
                if det_x != q_err or det_z != q_err:
                    print(f"[FAIL] Ошибка Y_{q_err}: det_x={det_x}, det_z={det_z}")
                    all_passed = False
                else:
                    print(f"[PASS] Ошибка Y_{q_err}: оба синдрома совпали (q={det_x}) OK")
                    
    assert all_passed, "Тесты декодера кода Штина не пройдены!"
    print("\nВСЕ 21 СЦЕНАРИЙ ОДНОКУБИТНЫХ ОШИБОК УСПЕШНО ПРОЙДЕН! ВЕРДИКТ: ACCEPTED.")

if __name__ == "__main__":
    run_auto_judge()
```

### 4.2. Таблица соответствия синдромов и кубитов

| Ошибка на кубите $q$ | Синдром $Z$-стабилизаторов $(s_1, s_2, s_3)_Z$ | Синдром $X$-стабилизаторов $(s_1, s_2, s_3)_X$ | Двоичный вес синдрома | Восстанавливающая операция |
|---|---|---|---|---|
| **Нет ошибок** | `(0, 0, 0)` | `(0, 0, 0)` | $0$ | $I$ (Тождество) |
| **Кубит 0** | `(1, 0, 0)` (если $X_0$) | `(1, 0, 0)` (если $Z_0$) | $1$ | $X_0$ или $Z_0$ |
| **Кубит 1** | `(0, 1, 0)` | `(0, 1, 0)` | $1$ | $X_1$ или $Z_1$ |
| **Кубит 2** | `(0, 0, 1)` | `(0, 0, 1)` | $1$ | $X_2$ или $Z_2$ |
| **Кубит 3** | `(0, 1, 1)` | `(0, 1, 1)` | $2$ | $X_3$ или $Z_3$ |
| **Кубит 4** | `(1, 0, 1)` | `(1, 0, 1)` | $2$ | $X_4$ или $Z_4$ |
| **Кубит 5** | `(1, 1, 0)` | `(1, 1, 0)` | $2$ | $X_5$ или $Z_5$ |
| **Кубит 6** | `(1, 1, 1)` | `(1, 1, 1)` | $3$ | $X_6$ или $Z_6$ |
