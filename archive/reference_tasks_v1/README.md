# Банк квантовых олимпиадных задач

В папке [`parsed/`](./parsed/) собраны 43 эталонные олимпиадные задачи с японской платформы **QCoder** и соревнований **IBM Quantum Challenge** с детальными разборами, математическими формулами и принципами верификации.

---

## 1. Классификация задач

```
                            Типы квантовых задач
                                     │
         ┌───────────────────────────┴───────────────────────────┐
         ▼                                                       ▼
 Тип A: Фиксированная схема                             Тип B: Параметризованная схема
 (схема статична, можно собрать в GUI)                  (схема генерируется кодом solve(n, ...))
```

### По типу начального состояния кубитов:
1. **Фиксированное состояние:** вход строго $|0\dots0\rangle$ (подготовка состояний Bell, GHZ, W-state);
2. **Произвольное состояние:** схема реализует унитарный оператор $U$ для любого $|\psi_{in}\rangle$ (SWAP, фазовые сдвиги, QFT);
3. **Параметризованное семейство:** вход выбирается из класса состояний $|\psi(\vec{\theta})\rangle$.

### По топологии связности кубитов (Coupling Map):
1. **All-to-All:** полная связность между любыми парами кубитов;
2. **Линейная цепочка:** прямое взаимодействие только между соседними кубитами $q_i - q_{i+1}$;
3. **Аппаратный граф чипа (Grid / Heavy-Hex):** топология реального процессора, требующая алгоритмической $SWAP$-маршрутизации (например, задача [QEC Bitflip на топологии IBM Tokyo](parsed/039_ibm_challenge_2021_ex3_qec_bitflip_code.md)).


---

## 2. Категории задач в каталоге

| Категория | Примеры задач | Специфика |
|---|---|---|
| **Синтез состояний (State Prep)** | [Bell+ State](parsed/022_qcoder_qpc003_a2_generate_state_bell_plus.md), [GHZ-3](parsed/011_qcoder_qpc002_a5_generate_state_ghz_minus_3.md), [W3](parsed/023_qcoder_qpc003_a3_generate_state_w3.md) | Перевод $|0\dots0\rangle$ в целевой вектор |
| **Квантовые оракулы (Oracles)** | [XOR Oracle](parsed/002_qcoder_qpc001_b2_xor_oracle.md), [Less Than Oracle](parsed/003_qcoder_qpc001_b3_less_than_oracle_1.md), [Copy Oracle](parsed/001_qcoder_qpc001_b1_copy_oracle.md) | Обязательная очистка анцилл (Uncomputation) |
| **Квантовая арифметика** | [Arithmetic 1–4](parsed/016_qcoder_qpc002_b5_quantum_arithmetic_1.md) | Обратимые сумматоры, классический базис $\{X, CX, CCX\}$ |
| **Алгоритмы** | [Grover](parsed/032_qcoder_qpc003_b6_grovers_algorithm_1.md), [QFT](parsed/015_qcoder_qpc002_b4_quantum_fourier_transform.md), [Shor](parsed/038_ibm_challenge_2021_ex2_shor_algorithm.md) | Канонические квантовые алгоритмы |
| **Динамические схемы & QEC** | [Bitflip QEC](parsed/039_ibm_challenge_2021_ex3_qec_bitflip_code.md), [Teleportation](parsed/042_ibm_spring_2023_lab2_quantum_teleportation.md) | Измерения в середине цепи и условные гейты |

---

## 3. Список всех разобранных файлов

Все 43 задачи с кодом и тестами доступны в директории [`parsed/`](./parsed/).
