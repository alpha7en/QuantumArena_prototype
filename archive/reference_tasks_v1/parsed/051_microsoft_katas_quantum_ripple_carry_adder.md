# 051_microsoft_katas_quantum_ripple_carry_adder: Квантовый сумматор с распространением переноса (CDKM Ripple-Carry Adder)

---

## 1. ПАСПОРТ ЗАДАЧИ И КВАНТОВО-АЛГОРИТМИЧЕСКАЯ СПЕЦИФИКАЦИЯ

* **ID задачи:** `051_microsoft_katas_quantum_ripple_carry_adder`
* **Название:** Унитарное когерентное сложение двух квантовых регистров на месте (In-Place Quantum Ripple-Carry Adder with Carry Uncomputation)
* **Первоисточник:** Microsoft Quantum Katas (`RippleCarryAdder/Tasks.qs`, Tasks 3.1–3.5 & 5.1–5.4, основано на алгоритме Cuccaro-Draper-Kutin-Moulton (CDKM), депонировано в `research/05_raw_sources_and_snapshots/microsoft/katas_ripple_carry_adder_tasks.qs`, запись `EVID-064` в `EVIDENCE_CATALOG.md`).  
  URL: https://raw.githubusercontent.com/microsoft/QuantumKatas/main/RippleCarryAdder/Tasks.qs
* **Платформа:** Microsoft Quantum Katas / Q# / Qiskit
* **Общее описание:** Реализовать унитарный обратимый квантовый сумматор произвольной разрядности $n$, переводящий состояние двух $n$-кубитных регистров $|a\rangle_n |b\rangle_n |0\rangle_{c_{\text{in}}} |0\rangle_{c_{\text{out}}}$ в состояние $|a\rangle_n |(a+b) \bmod 2^n\rangle_n |0\rangle_{c_{\text{in}}} |\lfloor(a+b)/2^n\rfloor\rangle_{c_{\text{out}}}$ с линейным числом вентилей $O(n)$, сохранением входного регистра $|a\rangle$ и полным распутыванием (uncomputation) вспомогательных анцилл.
* **Результат решения:** `ПАРАМЕТРИЗОВАННЫЙ ГЕНЕРАТОР СХЕМЫ`
* **Формат ответа:** Функция генерации схемы на Python/Qiskit:
  ```python
  from qiskit import QuantumCircuit

  def build_ripple_carry_adder(n: int) -> QuantumCircuit:
      """
      Генерирует n-битный квантовый сумматор Куккаро (CDKM).
      Регистры:
        - a: n кубитов [0 .. n-1] (сохраняется без изменений)
        - b: n кубитов [n .. 2n-1] (аккумулятор, получает сумму a + b mod 2^n)
        - cin: 1 кубит [2n] (анцилла переноса, восстанавливается в |0>)
        - cout: 1 кубит [2n+1] (старший бит переноса)
      :param n: разрядность чисел a и b (n >= 1)
      :return: QuantumCircuit(2*n + 2)
      """
      ...
  ```
* **Число кубитов:** $2n + 2$ кубита ($n$ кубитов первого слагаемого, $n$ кубитов второго слагаемого/аккумулятора, $1$ входная анцилла переноса $c_{\text{in}}$, $1$ выходной кубит переполнения $c_{\text{out}}$).
* **Сложность:** C (Hard / Div 1), Time Limit: 3.0 сек, Memory Limit: 512 MB.
* **Оценка `VISUAL_GUI_READY`:** `ЧАСТИЧНО (PARAMETRIC_CODE_ONLY)`  
  *Обоснование:* Для фиксированного $n=1$ или $n=2$ блоки MAJ и UMA содержат небольшое число вентилей (6–13) и могут быть визуально собраны в drag-and-drop редакторе. Однако для произвольного $n$ каскадная цепочка распространения и распутывания переносов формируется итерационным алгоритмическим циклом, требующим параметрического программного описания.
* **Асимптотика симуляции и проверка автосудьей:**  
  * Размерность гильбертова пространства $N = 2^{2n+2}$. Для $n \le 5$ (до 12 кубитов) симуляция `Statevector` выполняется за доли секунды.  
  * Число вентилей: ровно $2n$ элементов Тоффоли ($\text{CCNOT}$) и $4n + 1$ элементов $\text{CNOT}$ (суммарно $6n + 1$ гейтов).  
  * Глубина схемы: $O(n)$.  
  * Проверка без шотов: аналитическая проверка на всех базисных состояниях computational basis и в суперпозиции.
* **Устойчивость к перебору (Brute-force):** `BRUTE_FORCE_PROTECTED`  
  * Пространство перестановок унитарных матриц размера $2^{2n+2} \times 2^{2n+2}$ экспоненциально велико.  
  * Случайная генерация гейтов или жадный поиск застревают в фазовом мусоре (phase kickback) и не могут детерминированно распутать промежуточный перенос $c_{\text{in}}$ обратно в состояние $|0\rangle$.
* **Теги:** `[PARAMETRIC_CODE_ONLY]`, `[QUANTUM_ARITHMETIC]`, `[RIPPLE_CARRY_ADDER]`, `[CDKM_ALGORITHM]`, `[REVERSIBLE_COMPUTING]`, `[BRUTE_FORCE_PROTECTED]`.

---

## 2. МАТЕМАТИЧЕСКАЯ ПОСТАНОВКА И СХЕМА АЛГОРИТМА CDKM

### 2.1. Вентили MAJ (Majority) и UMA (UnMajority and Add)

Алгоритм Куккаро (Cuccaro et al., 2004) решает проблему квантового сложения всего с **одной** вспомогательной анциллой за счет временного использования кубитов регистра $a$ для хранения промежуточных битов переноса.

1. **Вентиль MAJ (Majority):**  
   Принимает три бита: $c$ (входящий перенос), $b$ (бит аккумулятора), $a$ (бит слагаемого).
   Выполняет преобразование:
   $$
   (c, b, a) \mapsto (a \oplus c, \; a \oplus b, \; \text{Maj}(a, b, c))
   $$
   где мажоритарная функция $\text{Maj}(a, b, c) = ab \oplus bc \oplus ac$ является битом переноса в следующий разряд.  
   *Квантовая декомпозиция MAJ:*
   1. $\text{CNOT}(a \to b)$
   2. $\text{CNOT}(a \to c)$
   3. $\text{CCNOT}(c, b \to a)$ (Тоффоли)

2. **Вентиль UMA (UnMajority and Add):**  
   Принимает текущее состояние после копирования старшего переноса и выполняет обратное восстановление:
   $$
   (a \oplus c, \; a \oplus b, \; c_{\text{out}}) \mapsto (c, \; a \oplus b \oplus c, \; a)
   $$
   В результате бит $a$ полностью восстанавливает свое исходное значение, бит $c$ восстанавливается в исходный $c_{\text{in}}$, а в кубит $b$ записывается сумма по модулю 2: $s = a \oplus b \oplus c$.  
   *Квантовая декомпозиция UMA:*
   1. $\text{CCNOT}(c, b \to a)$
   2. $\text{CNOT}(a \to c)$
   3. $\text{CNOT}(c \to b)$

### 2.2. Волновой каскад сложения (Ripple Carry)

1. **Прямой ход (Ripple Forward):**  
   - $\text{MAJ}(c_{\text{in}}, b_0, a_0)$ $\implies$ бит $a_0$ теперь хранит перенос $c_1$.
   - $\text{MAJ}(a_0, b_1, a_1)$ $\implies$ бит $a_1$ теперь хранит перенос $c_2$.
   - $\dots$
   - $\text{MAJ}(a_{n-2}, b_{n-1}, a_{n-1})$ $\implies$ бит $a_{n-1}$ теперь хранит итоговый перенос $c_n$.
2. **Копирование старшего бита переполнения:**  
   - $\text{CNOT}(a_{n-1} \to c_{\text{out}})$
3. **Обратный ход (Uncompute Backward):**  
   - $\text{UMA}(a_{n-2}, b_{n-1}, a_{n-1})$ $\implies$ восстанавливает $a_{n-1}$, вычисляет $b_{n-1} = s_{n-1}$, восстанавливает $a_{n-2} = c_{n-1}$.
   - $\dots$
   - $\text{UMA}(c_{\text{in}}, b_0, a_0)$ $\implies$ восстанавливает $a_0$, вычисляет $b_0 = s_0$, очищает $c_{\text{in}} \to 0$.

### 2.3. ASCII-диаграмма каскада для 2-битного сумматора ($n=2$)

```
             ┌───────────┐           ┌───────────┐
a_0: ────────┤1          ├───────────┤2          ├──────── (restored to a_0)
             │   MAJ_0   │┌─────────┐│   UMA_0   │
b_0: ────────┤2          ├┤         ├┤1          ├──────── (sum bit s_0)
     ┌───┐   │           ││  MAJ_1  ││           │┌───┐
cin: ┤ 0 ├───┤0          ├┤         ├┤0          ├┤ 0 ├─── (restored to 0)
     └───┘   └───────────┘│         │└───────────┘└───┘
a_1: ─────────────────────┤1       2├─────■───────┤2   1─── (restored to a_1)
                          │         │     │       │       │
b_1: ─────────────────────┤2       1├─────┼───────┤1   2─── (sum bit s_1)
                          └─────────┘   ┌─┴─┐     └───────┘
cout: ──────────────────────────────────┤ X ├────────────── (carry out c_2)
                                        └───┘
```

---

## 3. АВТОРСКОЕ ЭТАЛОННОЕ КВАНТОВОЕ РЕШЕНИЕ

```python
"""
Авторское эталонное решение: Microsoft Quantum Katas - CDKM Quantum Ripple-Carry Adder
Унитарное сложение n-кубитных чисел на месте с восстановлением слагаемого |a> и очисткой анциллы.
"""

from qiskit import QuantumCircuit

def build_ripple_carry_adder(n: int) -> QuantumCircuit:
    """
    Генерирует n-битный сумматор Куккаро (CDKM).
    Распределение кубитов:
      a[0..n-1]   : 0 .. n-1
      b[0..n-1]   : n .. 2*n - 1
      cin         : 2*n
      cout        : 2*n + 1
    """
    if n < 1:
        raise ValueError("Разрядность сумматора n должна быть >= 1.")
        
    total_qubits = 2 * n + 2
    qc = QuantumCircuit(total_qubits, name=f"CDKM_Adder_{n}bit")
    
    a = list(range(0, n))
    b = list(range(n, 2 * n))
    cin = 2 * n
    cout = 2 * n + 1
    
    def apply_maj(c_qubit: int, b_qubit: int, a_qubit: int):
        """Вентиль Majority."""
        qc.cx(a_qubit, b_qubit)
        qc.cx(a_qubit, c_qubit)
        qc.ccx(c_qubit, b_qubit, a_qubit)
        
    def apply_uma(c_qubit: int, b_qubit: int, a_qubit: int):
        """Вентиль UnMajority and Add."""
        qc.ccx(c_qubit, b_qubit, a_qubit)
        qc.cx(a_qubit, c_qubit)
        qc.cx(c_qubit, b_qubit)
        
    # --- 1. Прямой ход распространения переноса (Ripple Forward) ---
    apply_maj(cin, b[0], a[0])
    for i in range(1, n):
        apply_maj(a[i - 1], b[i], a[i])
        
    # --- 2. Фиксация старшего бита переноса ---
    qc.cx(a[n - 1], cout)
    
    # --- 3. Обратный ход распутывания и суммирования (Uncompute Backward) ---
    for i in range(n - 1, 0, -1):
        apply_uma(a[i - 1], b[i], a[i])
    apply_uma(cin, b[0], a[0])
    
    return qc
```

---

## 4. АВТОПРОВЕРКА, ТЕСТКЕЙСЫ И ВАЛИДАЦИЯ РЕШЕНИЙ

### 4.1. Автоматический тестовый модуль (Auto-Judge)

```python
from qiskit import QuantumCircuit
from qiskit.quantum_info import Statevector
import numpy as np

def verify_cdkm_properties(qc: QuantumCircuit, n: int):
    """
    Анти-чит проверка:
    1. Ровно 2n + 2 кубита.
    2. Отсутствие измерений и сбросов (чисто унитарная схема).
    3. Линейное число вентилей O(n): ровно 2n CCX и 4n+1 CX.
    """
    expected_qubits = 2 * n + 2
    assert qc.num_qubits == expected_qubits, f"Число кубитов {qc.num_qubits} != {expected_qubits}"
    
    for inst in qc.data:
        op_name = inst.operation.name
        assert op_name not in ["measure", "reset"], f"Запрещенная не-унитарная операция: {op_name}"
        
    ccx_count = sum(1 for inst in qc.data if inst.operation.name == "ccx")
    cx_count = sum(1 for inst in qc.data if inst.operation.name == "cx")
    
    assert ccx_count == 2 * n, f"Число Тоффоли должно быть {2*n}, получено {ccx_count}"
    assert cx_count == 4 * n + 1, f"Число CNOT должно быть {4*n+1}, получено {cx_count}"

def test_adder_full_truth_table(n: int):
    """Исчерпывающее тестирование всех комбинаций a и b для заданной разрядности n."""
    adder = build_ripple_carry_adder(n)
    verify_cdkm_properties(adder, n)
    
    total_cases = (1 << n) * (1 << n)
    for a_val in range(1 << n):
        for b_val in range(1 << n):
            test_c = QuantumCircuit(2 * n + 2)
            # Запись слагаемого a (little-endian: a_0 на кубите 0)
            for bit in range(n):
                if (a_val >> bit) & 1:
                    test_c.x(bit)
            # Запись слагаемого b (little-endian: b_0 на кубите n)
            for bit in range(n):
                if (b_val >> bit) & 1:
                    test_c.x(n + bit)
                    
            test_c.compose(adder, inplace=True)
            sv = Statevector(test_c)
            
            # Извлекаем единственный нетривиальный базисный вектор
            bitstring = list(sv.to_dict().keys())[0]
            # Qiskit выводит от старшего кубита к младшему: reverse
            qubits_vals = [int(ch) for ch in reversed(bitstring)]
            
            res_a = sum(qubits_vals[i] << i for i in range(n))
            res_b = sum(qubits_vals[n + i] << i for i in range(n))
            res_cin = qubits_vals[2 * n]
            res_cout = qubits_vals[2 * n + 1]
            
            expected_sum = a_val + b_val
            actual_sum = res_b + (res_cout << n)
            
            assert res_a == a_val, f"Ошибка: регистр a испорчен! {res_a} != {a_val}"
            assert res_cin == 0, f"Ошибка: анцилла cin не распутана в 0! cin={res_cin}"
            assert actual_sum == expected_sum, f"Ошибка: {a_val} + {b_val} != {actual_sum} (res_b={res_b}, cout={res_cout})"
            
    print(f"[PASS] Сумматор n={n}: Все {total_cases} комбинаций успешно проверены!")

def test_quantum_superposition_coherence(n: int = 2):
    """Тест квантовой когерентности: сложение в суперпозиции без декогеренции."""
    adder = build_ripple_carry_adder(n)
    qc = QuantumCircuit(2 * n + 2)
    
    # Приводим регистр a в суперпозицию всех 2^n состояний
    for i in range(n):
        qc.h(i)
    # Фиксируем регистр b = 1
    qc.x(n)
    
    qc.compose(adder, inplace=True)
    sv = Statevector(qc)
    probs = sv.probabilities()
    
    # Должно получиться ровно 2^n равновероятных исходов с вероятностью 1 / 2^n
    non_zero = probs[probs > 1e-6]
    assert len(non_zero) == (1 << n), f"Число компонент суперпозиции {len(non_zero)} != {1 << n}"
    assert np.allclose(non_zero, 1.0 / (1 << n)), "Амплитуды суперпозиции искажены!"
    print(f"[PASS] Тест квантовой суперпозиции (когерентное суммирование |a>|1> -> |a>|a+1>) пройден!")

def run_auto_judge():
    print("=== ЗАПУСК AUTO-JUDGE: 051_MICROSOFT_KATAS_QUANTUM_RIPPLE_CARRY_ADDER ===")
    for n_test in [1, 2, 3]:
        test_adder_full_truth_table(n_test)
    test_quantum_superposition_coherence(n=2)
    print("ВСЕ ТЕСТ-КЕЙСЫ УСПЕШНО ПРОЙДЕНЫ! ВЕРДИКТ: ACCEPTED.")

if __name__ == "__main__":
    run_auto_judge()
```

### 4.2. Таблица тестовых сценариев

| № теста | Разрядность $n$ | Вход $a$ | Вход $b$ | Ожидаемый $a$ (out) | Ожидаемый $b$ (out) | Перенос $c_{\text{out}}$ | Анцилла $c_{\text{in}}$ | Описание сценария |
|---|---|---|---|---|---|---|---|---|
| **1** | $n=1$ | $0$ | $0$ | $0$ | $0$ | $0$ | $0$ | Минимальный тривиальный случай |
| **2** | $n=1$ | $1$ | $1$ | $1$ | $0$ | $1$ | $0$ | Переполнение одного бита ($1+1=2$) |
| **3** | $n=2$ | $3$ (`11`) | $1$ (`01`) | $3$ (`11`) | $0$ (`00`) | $1$ | $0$ | Каскадное распространение переноса через 2 бита |
| **4** | $n=2$ | $3$ (`11`) | $3$ (`11`) | $3$ (`11`) | $2$ (`10`) | $1$ | $0$ | Максимальные 2-битные числа ($3+3=6$) |
| **5** | $n=3$ | $7$ (`111`)| $1$ (`001`)| $7$ (`111`)| $0$ (`000`)| $1$ | $0$ | Полная волна переноса через все 3 разряда |
| **6** | $n=2$ | $\sum \|a\rangle$ | $1$ | $\sum \|a\rangle$ | $|a+1\rangle$ | - | $0$ | Когерентная квантовая суперпозиция (Coherence Check) |
