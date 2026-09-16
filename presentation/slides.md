---
marp: true
theme: default
paginate: true
size: 16:9
style: |
  section { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 18px; }
  h1 { font-size: 28px; font-weight: 900; color: #0f172a; }
  h2 { font-size: 22px; font-weight: 800; color: #1e293b; }
---

<!-- Slide 1 -->
### ВВЕДЕНИЕ • КОНЦЕПТ
# QuantumArena: Таксономия квантовых задач

$$
|\psi_{out}\rangle = U_{circuit} |\psi_{in}\rangle
$$

---

<!-- Slide 2 -->
### ТАКСОНОМИЯ • МЕТА-ДЕРЕВО
# 5 Измерений квантовой соревновательной задачи

$$
\text{Задача} = \langle \text{Парадигма}, |\psi_{in}\rangle, \text{Контракт}, \text{Топология}, \text{Судья} \rangle
$$

---

<!-- Slide 3 -->
### ТАКСОНОМИЯ • ВХОДЫ
# Таксономия входных состояний кубитов

$$
|\psi_{in}\rangle \in \{ |0\dots0\rangle,\; |\psi_{in}\rangle,\; |\psi(\theta)\rangle,\; |x\rangle|0\rangle_{anc} \}
$$

---

<!-- Slide 4 -->
### ТАКСОНОМИЯ • КОНТРАКТЫ
# Форматы решений: GUI vs Программный vs Динамический

$$
\text{Контракт} \in \{ \text{Тип A (GUI Static)},\; \text{Тип B (Код Parametric)},\; \text{Тип C (Динамика c\_if)} \}
$$

---

<!-- Slide 5 -->
### ТАКСОНОМИЯ • БАЗИСЫ
# Физические базисы и наборы квантовых вентилей

$$
\mathcal{G} \in \{ \text{Universal},\; \text{Reversible},\; \text{Clifford},\; \text{IBM Native},\; \text{IonQ Native} \}
$$

---

<!-- Slide 6 -->
### ТАКСОНОМИЯ • СВЯЗНОСТЬ
# Топологии связности кубитов (Coupling Maps)

$$
G = (V, E), \quad CX(i, j) \iff (i, j) \in E
$$

---

<!-- Slide 7 -->
### ТАКСОНОМИЯ • ВЕРИФИКАЦИЯ
# Математические методы автосудейства

$$
F = |\langle \psi_{target} | \psi_{user} \rangle|^2 \ge 0.999 \quad \lor \quad \| U_{target} - U_{user} \|_F \le \varepsilon
$$

---

<!-- Slide 8 -->
### 1. СИНТЕЗ СОСТОЯНИЙ • T1.1 • ТИП A (GUI READY) • **Easy**
# Синтез антисимметричного состояния Белла |Φ⁻⟩

$$
|00\rangle \longrightarrow |\Phi^-\rangle = \frac{|00\rangle - |11\rangle}{\sqrt{2}}
$$

`2 кубита` | `Гейтов ≤ 3` | `Глубина ≤ 2` | `Базис: {X, H, CX}` | `Топология: Линейная`

---

<!-- Slide 9 -->
### 1. СИНТЕЗ СОСТОЯНИЙ • T1.2 • ТИП B (ПАРАМЕТРИЧЕСКАЯ) • **Easy**
# Синтез состояния GHZ для n кубитов

$$
|0^{\otimes n}\rangle \longrightarrow |GHZ_n\rangle = \frac{|0^{\otimes n}\rangle + |1^{\otimes n}\rangle}{\sqrt{2}}
$$

`n кубитов` | `Гейтов: n` | `Глубина: n` | `Базис: {H, CX}` | `Топология: Линейная цепь`

---

<!-- Slide 10 -->
### 1. СИНТЕЗ СОСТОЯНИЙ • T1.3 • ТИП B (УГЛЫ ROTATION) • **Medium**
# Синтез состояния W₃ с расчетными углами вращений

$$
|000\rangle \longrightarrow |W_3\rangle = \frac{|100\rangle + |010\rangle + |001\rangle}{\sqrt{3}}, \quad \theta_1 = 2\arccos(1/\sqrt{3})
$$

`3 кубита` | `Гейтов ≤ 5` | `Базис: {Ry(θ), CX, X}` | `Топология: Звезда / All-to-all`

---

<!-- Slide 11 -->
### 1. СИНТЕЗ СОСТОЯНИЙ • T1.4 • ТИП B (ГРАФОВЫЕ СОСТОЯНИЯ) • **Medium**
# 1D Кластерное состояние (Линейный кластер)

$$
|0^{\otimes n}\rangle \xrightarrow{H^{\otimes n}} |+\rangle^{\otimes n} \xrightarrow{\prod CZ_{i, i+1}} |Cluster_n\rangle
$$

`n кубитов` | `Глубина ≤ 3` | `Базис: {H, CZ}` | `Топология: Соседская цепь`

---

<!-- Slide 12 -->
### 2. РЕВЕРСИВНАЯ ЛОГИКА • T2.1 • ТИП A (GUI READY) • **Easy**
# Квантовый обратимый полусумматор (Half Adder)

$$
|a\rangle |b\rangle |0\rangle_{anc} \longrightarrow |a\rangle |a \oplus b\rangle |a \cdot b\rangle
$$

`3 кубита` | `Гейтов: 2 (1 CCX, 1 CX)` | `Базис: Reversible {CCX, CX}` | `Топология: All-to-All`

---

<!-- Slide 13 -->
### 2. РЕВЕРСИВНАЯ ЛОГИКА • T2.2 • ПАРАДИГМА UNCOMPUTATION • **Medium**
# Паттерн Uncomputation: Очистка анцилл

$$
|x\rangle |0\rangle_{anc} |y\rangle \xrightarrow{U} |x\rangle |g(x)\rangle |y\rangle \xrightarrow{CX} |x\rangle |g(x)\rangle |y \oplus f(x)\rangle \xrightarrow{U^\dagger} |x\rangle |0\rangle_{anc} |y \oplus f(x)\rangle
$$

`Очистка анцилл` | `Гарантия унитарности` | `Fidelity проверки: |0⟩_anc`

---

<!-- Slide 14 -->
### 2. РЕВЕРСИВНАЯ ЛОГИКА • T2.3 • АРИФМЕТИКА В QFT • **Hard**
# Сумматор Дрейпера (Draper QFT Adder)

$$
|a\rangle |b\rangle \xrightarrow{I \otimes QFT} |a\rangle |\phi(b)\rangle \xrightarrow{R_k} |a\rangle |\phi(a+b)\rangle \xrightarrow{I \otimes QFT^\dagger} |a\rangle |a+b\rangle
$$

`2n кубитов` | `0 анцилл` | `Базис: {QFT, Controlled-R_k}` | `Топология: All-to-All`

---

<!-- Slide 15 -->
### 3. ОРАКУЛЫ • T3.1 • ФАЗОВЫЙ ОРАКУЛ • **Easy**
# Фазовый оракул для битовой маски s

$$
|x\rangle \longrightarrow (-1)^{s \cdot x} |x\rangle, \quad U_s = \bigotimes_{i: s_i=1} Z_i
$$

`n кубитов` | `0 анцилл` | `Глубина: 1` | `Базис: {Z}` | `Топология: Не зависит`

---

<!-- Slide 16 -->
### 3. ОРАКУЛЫ • T3.2 • БУЛЕВ ОРАКУЛ • **Medium**
# Оракул проверки равенства |x == a⟩

$$
|x\rangle |y\rangle \longrightarrow |x\rangle |y \oplus [x == a]\rangle, \quad [x == a] = \bigwedge_{i=0}^{n-1} (x_i \oplus \overline{a_i})
$$

`n + 1 кубит` | `Базис: {X, MCX}` | `Uncomputation: Очистка X` | `Топология: Star`

---

<!-- Slide 17 -->
### 4. АЛГОРИТМЫ • T4.1 • АЛГОРИТМ DJ • **Medium**
# Алгоритм Дойча-Йожи (1 запрос к оракулу)

$$
|\psi_0\rangle = |0^{\otimes n}\rangle |1\rangle \xrightarrow{H^{\otimes (n+1)}} \xrightarrow{U_f} \xrightarrow{H^{\otimes n} \otimes I} \text{Измерение}
$$

`n + 1 кубит` | `1 запрос` | `Детерминированный исход` | `Автосудья: Shots 100%`

---

<!-- Slide 18 -->
### 4. АЛГОРИТМЫ • T4.2 • АЛГОРИТМ BV • **Medium**
# Алгоритм Бернштейна-Вазирани (Поиск битовой строки)

$$
f(x) = s \cdot x \pmod 2 \implies \text{Измерение дает } |s\rangle \text{ за 1 вызов оракула}
$$

`n + 1 кубит` | `1 запрос vs n классических` | `Базис: {H, U_f, Measure}`

---

<!-- Slide 19 -->
### 4. АЛГОРИТМЫ • T4.3 • ОПЕРАТОР ДИФФУЗИИ • **Hard**
# Оператор диффузии Гровера (Инверсия относительно среднего)

$$
D = 2|s\rangle\langle s| - I = H^{\otimes n} (2|0\dots0\rangle\langle0\dots0| - I) H^{\otimes n}
$$

`n кубитов` | `Базис: {H, X, MCZ}` | `Ускорение: O(√N)` | `Топология: All-to-all`

---

<!-- Slide 20 -->
### 4. АЛГОРИТМЫ • T4.4 • ПРЕОБРАЗОВАНИЕ ФУРЬЕ • **Hard**
# Квантовое преобразование Фурье (QFT)

$$
|j\rangle \longrightarrow \frac{1}{\sqrt{2^n}} \sum_{k=0}^{2^n-1} \omega^{j \cdot k} |k\rangle, \quad R_m = \text{diag}(1, e^{2\pi i / 2^m})
$$

`n кубитов` | `Гейтов: O(n²)` | `Базис: {H, Controlled-R_m, SWAP}`

---

<!-- Slide 21 -->
### 4. АЛГОРИТМЫ • T4.5 • ОЦЕНКА ФАЗЫ • **Hard**
# Оценка квантовой фазы (Quantum Phase Estimation)

$$
U|\psi\rangle = e^{2\pi i \theta} |\psi\rangle \implies \text{Регистр считывает } |\widetilde{2^t \theta}\rangle
$$

`t + m кубитов` | `Базис: {H, C-U^{2^j}, QFT†}` | `Ядро алгоритма Шора`

---

<!-- Slide 22 -->
### 5. ТОПОЛОГИЯ И ЖЕЛЕЗО • T5.1 • МАРШРУТИЗАЦИЯ В ЦЕПИ • **Medium**
# Маршрутизация CNOT через цепочку SWAP вентилей

$$
(0, 2) \notin E \implies CX(0, 2) \equiv SWAP(0, 1) \cdot CX(1, 2) \cdot SWAP(0, 1)
$$

`3 кубита` | `Топология: Линия q₀—q₁—q₂` | `Накладные расходы: 2 SWAP (+6 CX)`

---

<!-- Slide 23 -->
### 5. ТОПОЛОГИЯ И ЖЕЛЕЗО • T5.2 • IBM HEAVY-HEX • **Hard**
# Отображение в нативную архитектуру IBM {CZ, √X, Rz}

$$
CX(i, j) \equiv (I \otimes R_z(\frac{\pi}{2}) \sqrt{X} R_z(\frac{\pi}{2})) \cdot CZ(i, j) \cdot (I \otimes R_z(\frac{\pi}{2}) \sqrt{X} R_z(\frac{\pi}{2}))
$$

`Eagle / Heron чип` | `Нативный базис` | `Сверхпроводниковые кубиты`

---

<!-- Slide 24 -->
### 6. ДИНАМИКА И ОБРАТНАЯ СВЯЗЬ • T6.1 • КВАНТОВАЯ ТЕЛЕПОРТАЦИЯ • **Medium**
# Квантовая телепортация с классической связью c_if

$$
|\psi\rangle \otimes |\Phi^+\rangle \xrightarrow{\text{Bell Meas}} (m_0, m_1) \xrightarrow{Z^{m_0} X^{m_1}} |\psi\rangle_{target}
$$

`3 кубита + 2 кл. бита` | `Mid-circuit Measurement` | `Условные вентили c_if`

---

<!-- Slide 25 -->
### 6. ДИНАМИКА И ОБРАТНАЯ СВЯЗЬ • T6.2 • КОРРЕКЦИЯ ОШИБОК QEC • **Hard**
# 3-кубитный код коррекции битовых ошибок (Bit-Flip QEC)

$$
|\psi\rangle \to \alpha|000\rangle + \beta|111\rangle \xrightarrow{X_1} \text{Синдром } s=1 \xrightarrow{c\_if} X_1 \implies |\psi\rangle
$$

`3 кубита данных + 1 анцилла` | `Снятие синдрома Z₁Z₂` | `Активная коррекция`

---

<!-- Slide 26 -->
### ИТОГИ КЛАССИФИКАЦИИ • МАТРИЦА
# Сводная матрица архетипов задач QuantumArena

$$
\mathcal{T} = \{ \text{T1: Prep},\; \text{T2: Logic},\; \text{T3: Oracles},\; \text{T4: Algorithms},\; \text{T5: Hardware},\; \text{T6: Dynamic} \}
$$

---
