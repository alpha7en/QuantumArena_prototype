# 052_classiq_competition_mcx_decomposition: Оптимальная декомпозиция многоконтрольного вентиля Тоффоли (MCX)

---

## 1. ПАСПОРТ ЗАДАЧИ И КВАНТОВО-АЛГОРИТМИЧЕСКАЯ СПЕЦИФИКАЦИЯ

* **ID задачи:** `052_classiq_competition_mcx_decomposition`
* **Название:** Линейная декомпозиция многоконтрольного гейта $C^k(X)$ в базис Clifford+T с использованием чистых анцилл (Multi-Controlled Toffoli V-Chain Decomposition in Clifford+T)
* **Первоисточник:** Classiq Coding Competition Spring 2022 (Problem 2: "Decomposing an MCX gate with minimal circuit depth and ancilla usage", авторское решение Valter Uotila, депонировано в `research/05_raw_sources_and_snapshots/independent/classiq_mcx_decomposition_challenge.ipynb`, запись `EVID-065` в `EVIDENCE_CATALOG.md`).  
  URL: https://raw.githubusercontent.com/valterUo/classiq-coding-competition/main/toffoli.ipynb
* **Платформа:** Classiq Competition / Qiskit / PennyLane
* **Общее описание:** Синтезировать параметризованную квантовую схему для многоконтрольного вентиля NOT ($C^k(X)$) на $k$ управляющих кубитах и 1 целевом кубите, декомпозированную исключительно в базис элементарных гейтов Клиффорда и $T$ ($\{H, \text{CX}, T, T^\dagger\}$) с использованием $k-2$ чистых анцилл по схеме V-цепочки Баренко (Barenco V-chain), обеспечив линейное число вентилей $O(k)$, линейный T-count и полное распутывание всех анцилл обратно в нулевое состояние $|0\rangle$.
* **Результат решения:** `ПАРАМЕТРИЗОВАННЫЙ ГЕНЕРАТОР СХЕМЫ`
* **Формат ответа:** Функция генерации схемы на Python/Qiskit:
  ```python
  from qiskit import QuantumCircuit

  def build_decomposed_mcx(num_controls: int) -> QuantumCircuit:
      """
      Генерирует n-кубитную схему C^k(X), декомпозированную в элементарные гейты {h, cx, t, tdg}.
      Кубиты:
        - controls: [0 .. k-1]
        - target  : k
        - ancillas: [k+1 .. 2k-2] (число анцилл: k - 2 для k >= 2)
      :param num_controls: число управляющих кубитов k >= 2
      :return: QuantumCircuit(2*k - 1)
      """
      ...
  ```
* **Число кубитов:** Для $k \ge 2$: ровно $k$ контрольных кубитов, $1$ целевой кубит и $k-2$ чистых вспомогательных анцилл. Итого $2k - 1$ кубит (для $k=2$: 3 кубита без анцилл; для $k=14$: 27 кубитов).
* **Сложность:** D (Advanced / Div 1), Time Limit: 3.0 сек, Memory Limit: 512 MB.
* **Оценка `VISUAL_GUI_READY`:** `ЧАСТИЧНО (PARAMETRIC_CODE_ONLY)`  
  *Обоснование:* Декомпозиция одиночного 2-контрольного Тоффоли ($k=2$) в 15 элементарных гейтов статична и может быть визуально смонтирована в GUI. Однако многокубитный каскад V-chain на произвольное число контролей $k$ требует алгоритмической генерации рекурсивных лестниц конъюнкций и их обратного развертывания.
* **Асимптотика симуляции и проверка автосудьей:**  
  * Размерность гильбертова пространства $N = 2^{2k-1}$. Для $k \le 5$ ($N \le 512$) симуляция `Statevector` выполняется за миллисекунды.  
  * Число элементарных гейтов: $2k - 3$ блоков Тоффоли. Каждый блок декомпозируется на $6$ CNOT, $7$ $T/T^\dagger$ и $2$ $H$. Итого $12k - 18$ CNOT и $14k - 21$ T-вентилей ($O(k)$ асимптотика).  
  * Глубина схемы: $O(k)$.  
  * Проверка без шотов: прямое вычисление таблицы истинности для всех $2^{k+1}$ комбинаций входов с контролем чистоты анцилл $\langle 0 | a_j | 0 \rangle = 1$.
* **Устойчивость к перебору (Brute-force):** `BRUTE_FORCE_PROTECTED`  
  * Пространство перебора последовательностей вентилей для реализации $C^k(X)$ при $k \ge 3$ превосходит $|G|^D \approx 4^{50} \approx 10^{30}$.  
  * Любая неточная фаза в декомпозиции $T$-гейтов разрушает квантовую интерференцию в обратной лестнице uncomputation, оставляя анциллы запутанными с регистром управления.
* **Теги:** `[PARAMETRIC_CODE_ONLY]`, `[CIRCUIT_DECOMPOSITION]`, `[MCX_TOFFOLI]`, `[CLIFFORD_T]`, `[T_COUNT_OPTIMIZATION]`, `[BARENCO_V_CHAIN]`, `[BRUTE_FORCE_PROTECTED]`.

---

## 2. МАТЕМАТИЧЕСКАЯ ПОСТАНОВКА И СТРУКТУРА ДЕКОМПОЗИЦИИ

### 2.1. Точная декомпозиция вентиля Тоффоли в Clifford+T

Вентиль Тоффоли ($CCX$) является трехкубитным обратимым вентилем:
$$
\text{CCX}|c_1, c_2, t\rangle = |c_1, c_2, t \oplus (c_1 \land c_2)\rangle
$$

Стандартная декомпозиция Нильсена и Чанга (Nielsen & Chuang, Рис. 4.9) без приближений реализует унитарный оператор CCX с использованием ровно 7 $T/T^\dagger$-гейтов, 6 CNOT и 2 Hadamards:
1. $H(t)$
2. $\text{CX}(c_2 \to t)$
3. $T^\dagger(t)$
4. $\text{CX}(c_1 \to t)$
5. $T(t)$
6. $\text{CX}(c_2 \to t)$
7. $T^\dagger(t)$
8. $\text{CX}(c_1 \to t)$
9. $T(c_2)$
10. $T(t)$
11. $H(t)$
12. $\text{CX}(c_1 \to c_2)$
13. $T(c_1)$
14. $T^\dagger(c_2)$
15. $\text{CX}(c_1 \to c_2)$

### 2.2. V-цепочка Баренко для $C^k(X)$ с $k-2$ чистыми анциллами

Для $k \ge 3$ управляющих кубитов $c_0, c_1, \dots, c_{k-1}$ выделяется $k-2$ чистых анцилл $a_0, a_1, \dots, a_{k-3}$, изначально находящихся в состоянии $|0\rangle$:

1. **Прямая лестница конъюнкций (Forward Conjunction Ladder):**
   - $a_0 \gets \text{CCX}(c_0, c_1, a_0) = c_0 \land c_1$
   - $a_1 \gets \text{CCX}(a_0, c_2, a_1) = c_0 \land c_1 \land c_2$
   - $\dots$
   - $a_{k-3} \gets \text{CCX}(a_{k-4}, c_{k-2}, a_{k-3}) = \bigwedge_{j=0}^{k-2} c_j$
2. **Переворот целевого кубита (Target Inversion):**
   - $t \gets \text{CCX}(a_{k-3}, c_{k-1}, t) = t \oplus \left(\bigwedge_{j=0}^{k-1} c_j\right)$
3. **Обратная лестница распутывания (Uncomputation):**
   - $a_{k-3} \gets \text{CCX}(a_{k-4}, c_{k-2}, a_{k-3}) \implies$ возвращается в $|0\rangle$
   - $\dots$
   - $a_0 \gets \text{CCX}(c_0, c_1, a_0) \implies$ возвращается в $|0\rangle$

Всего используется $2(k-2) + 1 = 2k - 3$ блоков Тоффоли. Каждый блок разворачивается в приведенную выше элементарную схему Clifford+T.

### 2.3. ASCII-диаграмма V-цепочки для 4 контрольных кубитов ($k=4$)

```
c_0: ──■───────────────────────────────────■──
       │                                   │  
c_1: ──■───────────────────────────────────■──
     ┌─┴─┐                               ┌─┴─┐
a_0: ┤ X ├──■─────────────────────────■──┤ X ├
     └───┘  │                         │  └───┘
c_2: ───────■─────────────────────────■───────
          ┌─┴─┐                     ┌─┴─┐     
a_1: ─────┤ X ├──■───────────────■──┤ X ├───── (restored to 0)
          └───┘  │               │  └───┘     
c_3: ────────────■───────────────■────────────
               ┌─┴─┐                          
t  : ──────────┤ X ├────────────────────────── (flipped iff c0=c1=c2=c3=1)
               └───┘                          
```

---

## 3. АВТОРСКОЕ ЭТАЛОННОЕ КВАНТОВОЕ РЕШЕНИЕ

```python
"""
Авторское эталонное решение: Classiq Coding Competition - MCX Decomposition
Линейная декомпозиция C^k(X) в базис {H, CX, T, Tdg} через чистые анциллы (Barenco V-chain).
"""

from qiskit import QuantumCircuit

def apply_toffoli_clifford_t(qc: QuantumCircuit, c1: int, c2: int, target: int):
    """
    Точная декомпозиция Тоффоли (CCX) в элементарный базис {H, CX, T, Tdg}.
    T-count: 7, CX-count: 6, H-count: 2.
    """
    qc.h(target)
    qc.cx(c2, target)
    qc.tdg(target)
    qc.cx(c1, target)
    qc.t(target)
    qc.cx(c2, target)
    qc.tdg(target)
    qc.cx(c1, target)
    qc.t(c2)
    qc.t(target)
    qc.h(target)
    qc.cx(c1, c2)
    qc.t(c1)
    qc.tdg(c2)
    qc.cx(c1, c2)

def build_decomposed_mcx(num_controls: int) -> QuantumCircuit:
    """
    Генерирует MCX gate с num_controls управляющими кубитами, декомпозированный
    в элементарный базис {h, cx, t, tdg}.
    
    Распределение кубитов:
      controls : [0 .. num_controls - 1]
      target   : num_controls
      ancillas : [num_controls + 1 .. 2 * num_controls - 2]
    """
    if num_controls < 2:
        raise ValueError("Число контрольных кубитов должно быть >= 2.")
        
    if num_controls == 2:
        qc = QuantumCircuit(3, name="Decomposed_CCX")
        apply_toffoli_clifford_t(qc, 0, 1, 2)
        return qc
        
    num_ancillas = num_controls - 2
    total_qubits = 2 * num_controls - 1
    
    controls = list(range(num_controls))
    target = num_controls
    ancillas = list(range(num_controls + 1, total_qubits))
    
    qc = QuantumCircuit(total_qubits, name=f"MCX_VChain_{num_controls}ctrl")
    
    # --- 1. Прямая цепочка вычисления конъюнкций ---
    apply_toffoli_clifford_t(qc, controls[0], controls[1], ancillas[0])
    for i in range(1, num_controls - 2):
        apply_toffoli_clifford_t(qc, ancillas[i - 1], controls[i + 1], ancillas[i])
        
    # --- 2. Инверсия целевого кубита ---
    apply_toffoli_clifford_t(qc, ancillas[-1], controls[-1], target)
    
    # --- 3. Обратная цепочка распутывания (Uncomputation) ---
    for i in range(num_controls - 3, 0, -1):
        apply_toffoli_clifford_t(qc, ancillas[i - 1], controls[i + 1], ancillas[i])
    apply_toffoli_clifford_t(qc, controls[0], controls[1], ancillas[0])
    
    return qc
```

---

## 4. АВТОПРОВЕРКА, ТЕСТКЕЙСЫ И ВАЛИДАЦИЯ РЕШЕНИЙ

### 4.1. Автоматический тестовый модуль (Auto-Judge)

```python
import numpy as np
from qiskit import QuantumCircuit
from qiskit.quantum_info import Statevector

ALLOWED_ELEMENTARY_OPS = {"h", "cx", "t", "tdg", "s", "sdg", "x"}

def verify_mcx_decomposition_contract(qc: QuantumCircuit, k: int):
    """
    Анти-чит проверка:
    1. Использование строго элементарных гейтов (запрещены составные MCX/CCX).
    2. Отсутствие измерений и сбросов.
    3. Линейное число вентилей O(k).
    """
    expected_qubits = 3 if k == 2 else (2 * k - 1)
    assert qc.num_qubits == expected_qubits, f"Число кубитов {qc.num_qubits} != {expected_qubits}"
    
    ops = qc.count_ops()
    for op in ops:
        assert op in ALLOWED_ELEMENTARY_OPS, f"АНТИ-ЧИТ НАРУШЕНИЕ: Использован неэлементарный гейт '{op}'!"
        
    num_toffolis = 2 * k - 3
    expected_cx = 6 * num_toffolis
    expected_t = 7 * num_toffolis
    
    actual_cx = ops.get("cx", 0)
    actual_t = ops.get("t", 0) + ops.get("tdg", 0)
    
    assert actual_cx == expected_cx, f"Число CX {actual_cx} != {expected_cx}"
    assert actual_t == expected_t, f"Суммарный T-count {actual_t} != {expected_t}"

def test_mcx_full_truth_table(k: int):
    """Проверка таблицы истинности для всех 2^(k+1) базисных состояний."""
    qc_mcx = build_decomposed_mcx(k)
    verify_mcx_decomposition_contract(qc_mcx, k)
    
    total_qubits = qc_mcx.num_qubits
    num_ancillas = 0 if k == 2 else (k - 2)
    
    for ctrl_int in range(1 << k):
        for tgt_bit in [0, 1]:
            test_c = QuantumCircuit(total_qubits)
            # Подготовка управляющих кубитов
            for bit in range(k):
                if (ctrl_int >> bit) & 1:
                    test_c.x(bit)
            # Подготовка целевого кубита
            if tgt_bit:
                test_c.x(k)
                
            test_c.compose(qc_mcx, inplace=True)
            sv = Statevector(test_c)
            
            # Извлекаем состояние с максимальной вероятностью (обход численного шума)
            best_idx = int(np.argmax(sv.probabilities()))
            bits = [(best_idx >> b) & 1 for b in range(total_qubits)]
            
            out_ctrl = sum(bits[b] << b for b in range(k))
            out_tgt = bits[k]
            out_anc = bits[k + 1:]
            
            expected_tgt = tgt_bit ^ (1 if ctrl_int == (1 << k) - 1 else 0)
            
            assert out_ctrl == ctrl_int, f"Контрольные кубиты повреждены: {out_ctrl} != {ctrl_int}"
            assert out_tgt == expected_tgt, f"Ошибка переворота таргета для ctrl={ctrl_int}: {out_tgt} != {expected_tgt}"
            assert all(a == 0 for a in out_anc), f"Анцилла осталась запутанной: {out_anc} != 0"
            
    print(f"[PASS] MCX k={k} ({total_qubits} кубитов): Все {2**(k+1)} тестов пройдены успешно!")

def run_auto_judge():
    print("=== ЗАПУСК AUTO-JUDGE: 052_CLASSIQ_COMPETITION_MCX_DECOMPOSITION ===")
    for k_ctrls in [2, 3, 4]:
        test_mcx_full_truth_table(k_ctrls)
    print("ВСЕ ТЕСТ-КЕЙСЫ УСПЕШНО ПРОЙДЕНЫ! ВЕРДИКТ: ACCEPTED.")

if __name__ == "__main__":
    run_auto_judge()
```

### 4.2. Таблица метрик декомпозиции

| Число контролей $k$ | Число анцилл | Всего кубитов | Эквивалентных Toffoli | CX-count ($6 \times N_{\text{toff}}$) | T-count ($7 \times N_{\text{toff}}$) | Статус распутывания анцилл |
|---|---|---|---|---|---|---|
| **$k=2$** (CCX) | $0$ | $3$ | $1$ | $6$ | $7$ | Анциллы не требуются |
| **$k=3$** ($C^3X$) | $1$ | $5$ | $3$ | $18$ | $21$ | $\langle 0\|a_0\|0\rangle = 1.0$ |
| **$k=4$** ($C^4X$) | $2$ | $7$ | $5$ | $30$ | $35$ | $\langle 0\|a_0, a_1\|0\rangle = 1.0$ |
| **$k=5$** ($C^5X$) | $3$ | $9$ | $7$ | $42$ | $49$ | $\langle 0\|a_{0..2}\|0\rangle = 1.0$ |
| **$k=14$** (Classiq) | $12$ | $27$ | $25$ | $150$ | $175$ | Полное распутывание $12$ анцилл |
