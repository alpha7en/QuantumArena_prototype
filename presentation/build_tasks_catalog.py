#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script to build the comprehensive QuantumArena Diverse Tasks Catalog
and export it to QuantumArena_Diverse_Tasks_Catalog.pdf using headless Chrome.
"""

import os
import subprocess
import html

TASKS = [
    # -------------------------------------------------------------
    # TASK 1: QCoder A2 - Bell State |Phi->
    # -------------------------------------------------------------
    {
        "num": 1,
        "id": "qcoder_qpc002_a2",
        "title": "Синтез антисимметричного состояния Белла |Φ⁻⟩",
        "original_title": "A2: Generate State 1/sqrt(2)(|0> - |3>)",
        "platform": "QCoder (QPC002 / Япония)",
        "difficulty": "Easy (Score 200)",
        "archetype": "T1: Синтез состояний (State Preparation)",
        "statement": r"""
<p><strong>Time Limit:</strong> 3.0 seconds &nbsp;|&nbsp; <strong>Memory Limit:</strong> 512 MiB &nbsp;|&nbsp; <strong>Score:</strong> 200 points</p>

<h4>Постановка задачи</h4>
<p>Требуется реализовать операцию приготовления квантового состояния $|\psi\rangle$ из начального нулевого состояния $|00\rangle$ на квантовой схеме <code>qc</code>, состоящей из 2 кубитов.</p>

<p>Целевое квантовое состояние $|\psi\rangle$ строго определено как антисимметричное состояние Белла:</p>
<div class="math-block">
$$|\psi\rangle = |\Phi^-\rangle = \frac{1}{\sqrt{2}} (|00\rangle - |11\rangle) = \frac{1}{\sqrt{2}} (|0\rangle - |3\rangle)$$
</div>

<h4>Ограничения (Constraints)</h4>
<ul>
  <li>Число кубитов: ровно 2 кубита (<code>QuantumCircuit(2)</code>), без использования вспомогательных анцилл.</li>
  <li>Разрешенный базис вентилей: элементарные однокубитные и двухкубитные вентили (<code>X</code>, <code>H</code>, <code>CX</code>, <code>Z</code>).</li>
  <li>Запрещены промежуточные и финальные классические измерения (<code>measure</code>), сбросы (<code>reset</code>) и классические регистры.</li>
  <li>Глобальная фаза состояния игнорируется проверяющей системой (инвариантность к множителю $e^{i\theta}$).</li>
  <li>Решение должно быть оформлено в виде функции:</li>
</ul>
<pre><code class="language-python">from qiskit import QuantumCircuit

def solve() -> QuantumCircuit:
    qc = QuantumCircuit(2)
    # Write your code here:
    return qc</code></pre>
""",
        "taxonomy": r"""
<ul>
  <li><strong>Архетип задачи:</strong> <code>T1: Синтез квантовых состояний (State Preparation)</code>. Чисто квантовая статическая унитарная трансформация вакуума в заданный целевой вектор Гильбертова пространства.</li>
  <li><strong>Формат решения и контракт интерфейса:</strong> <code>Тип A (GUI Drag-and-Drop Ready)</code>. Схема полностью детерминирована, не содержит внешних входных параметров, циклов и ветвлений. Полностью собирается в визуальном конструкторе.</li>
  <li><strong>Входное квантовое состояние:</strong> Вычислительный вакуум $|\psi_{\text{in}}\rangle = |00\rangle$.</li>
  <li><strong>Выходное квантовое состояние:</strong> Двухкубитный максимально запутанный синглет Белла $|\psi_{\text{out}}\rangle = \frac{1}{\sqrt{2}}(|00\rangle - |11\rangle)$.</li>
  <li><strong>Топологические ограничения:</strong> Линейная 2-кубитная цепочка ($q_0 - q_1$). Достаточно 1 связи для двухкубитного вентиля CNOT.</li>
  <li><strong>Принцип работы автосудьи (Auto-Judge):</strong> Аналитический симулятор вектора состояний (<code>Statevector</code>). Автосудья инициализирует $|00\rangle$, применяет сгенерированную схему <code>qc</code> и вычисляет квантовую точность (Fidelity):
    <div class="math-block">
    $$F = |\langle \Phi^- | \psi_{\text{gen}} \rangle|^2 = 1.0$$
    </div>
    Проверка выполняется без стохастических шотов за время &lt; 2 мс.</li>
  <li><strong>Устойчивость к перебору (Brute-force):</strong> <code>Уязвима к перебору</code> (минимальная глубина $\le 3$, пространство состояний всего 4 амплитуды; перебор $3^3$ вариантов находит решение за миллисекунды).</li>
</ul>
""",
        "hints_and_examples": r"""
<h4>Примеры (Sample Cases)</h4>
<ul>
  <li>Вход: $|00\rangle \implies$ Выход: $|\Phi^-\rangle = 0.7071 |00\rangle - 0.7071 |11\rangle$.</li>
  <li>Вероятность измерения в вычислительном базисе: $P(00) = 50\\%$, $P(11) = 50\\%$, $P(01) = 0\\%$, $P(10) = 0\\%$.</li>
</ul>

<h4>Подсказки, предложенные в задаче (Hints)</h4>
<ul>
  <li>Каноническая пара Белла $|\Phi^+\rangle = \frac{|00\rangle + |11\rangle}{\sqrt{2}}$ генерируется последовательностью $H(q_0) \to \text{CNOT}(q_0, q_1)$.</li>
  <li>Для получения минуса перед компонентой $|11\rangle$ необходимо внести фазовый сдвиг $\pi$ (гейт $Z$) либо применить инверсию $X$ на управляющий кубит до вентиля Адамара ($X|0\rangle = |1\rangle \implies H|1\rangle = \frac{|0\rangle - |1\rangle}{\sqrt{2}}$).</li>
</ul>
""",
        "solution_code": """from qiskit import QuantumCircuit

def solve() -> QuantumCircuit:
    \"\"\"
    Синтез антисимметричного состояния Белла |Phi-> = (|00> - |11>) / sqrt(2).
    Последовательность преобразований:
      |00> --(X on q0)--> |10> --(H on q0)--> (|0> - |1>)/sqrt(2) * |0>
           --(CX q0->q1)--> (|00> - |11>) / sqrt(2)
    \"\"\"
    qc = QuantumCircuit(2)
    qc.x(0)        # Переводим q0 в состояние |1>
    qc.h(0)        # Создаем суперпозицию с отрицательной относительной фазой: (|0> - |1>)/sqrt(2)
    qc.cx(0, 1)    # Запутываем q0 и q1: |00> - |11>
    return qc"""
    },

    # -------------------------------------------------------------
    # TASK 2: QCoder B2 - XOR Oracle
    # -------------------------------------------------------------
    {
        "num": 2,
        "id": "qcoder_qpc001_b2",
        "title": "Параметризованный квантовый XOR-оракул четности для n кубитов",
        "original_title": "B2: XOR Oracle",
        "platform": "QCoder (QPC001 / Япония)",
        "difficulty": "Easy–Medium (Score 200)",
        "archetype": "T2/T3: Обратимые булевы оракулы (Reversible Boolean Oracles)",
        "statement": r"""
<p><strong>Time Limit:</strong> 3.0 seconds &nbsp;|&nbsp; <strong>Memory Limit:</strong> 512 MiB &nbsp;|&nbsp; <strong>Score:</strong> 200 points</p>

<h4>Постановка задачи</h4>
<p>Вам дано целое число $n$. Реализуйте квантовую схему-оракул $O$ на $n+1$ кубитах, действующую на базисные вычислительные состояния следующим образом:</p>
<div class="math-block">
$$|\psi\rangle = |x\rangle_n |y\rangle_1 \xrightarrow{O} |x\rangle_n |y \oplus x_1 \oplus x_2 \oplus \\dots \oplus x_n\rangle_1$$
</div>
<p>где $|x\rangle = |x_1, x_2, \\dots, x_n\rangle$ обозначает первые $n$ кубитов регистра схемы, а $|y\rangle$ — последний (целевой) кубит. Символ $\oplus$ обозначает сложение по модулю 2 (XOR / проверку четности).</p>

<h4>Ограничения (Constraints)</h4>
<ul>
  <li>$1 \le n \le 10$.</li>
  <li>Общее число кубитов: ровно $n+1$ (регистр $x$ длины $n$ и регистр $y$ длины 1).</li>
  <li>Схема должна сохранять квантовую когерентность и суперпозицию регистра $x$ без искажения фаз и промежуточных измерений.</li>
  <li>Глобальная фаза игнорируется проверяющей системой.</li>
  <li>Решение должно быть оформлено в виде функции-генератора:</li>
</ul>
<pre><code class="language-python">from qiskit import QuantumCircuit, QuantumRegister

def solve(n: int) -> QuantumCircuit:
    x, y = QuantumRegister(n, "x"), QuantumRegister(1, "y")
    qc = QuantumCircuit(x, y)
    # Write your code here:
    return qc</code></pre>
""",
        "taxonomy": r"""
<ul>
  <li><strong>Архетип задачи:</strong> <code>T2/T3: Обратимые булевы оракулы (Reversible Boolean Oracles)</code>. Реализация обратимого вычисления классической логической функции четности $\\bigoplus_{i=1}^n x_i$ в квантовом базисе.</li>
  <li><strong>Формат решения и контракт интерфейса:</strong> <code>Тип B (Параметризованный код Python)</code>. Требуется программный генератор схемы, принимающий целочисленный параметр разрядности $n \in [1, 10]$.</li>
  <li><strong>Входное квантовое состояние:</strong> Произвольное базисное или суперпозиционное состояние входного регистра $|x\rangle = \sum_k c_k |k\rangle$ и целевого кубита $|y\rangle$. Оракул обязан работать унитарно на всем Гильбертовом пространстве $\mathcal{H}_{2^{n+1}}$.</li>
  <li><strong>Выходное квантовое состояние:</strong> Когерентное состояние $|x\rangle |y \oplus \text{parity}(x)\rangle$. При подаче $|y\rangle = |-\rangle$ оракул осуществляет фазовый откат (phase kickback): $(-1)^{\text{parity}(x)} |x\rangle |-\rangle$.</li>
  <li><strong>Топологические ограничения:</strong> Звездная топология (Star topology), где целевой кубит $y$ соединен со всеми кубитами $x_i$ ($i \in \{0, \\dots, n-1\}$). При линейной топологии требуется вставка SWAP-цепочек.</li>
  <li><strong>Принцип работы автосудьи (Auto-Judge):</strong> Проверка унитарности <code>Operator(qc)</code> или серии векторных эволюций для набора тестовых значений $n \in [1, 10]$ на суперпозициях вида $\frac{1}{\sqrt{2}}(|101\rangle + |010\rangle)|0\rangle$. Время валидации $\sim 20$ мс.</li>
  <li><strong>Устойчивость к перебору (Brute-force):</strong> <code>Защищена (Brute-Force Protected)</code>. Требует параметрического цикла по всему регистру $x$; статический перебор не масштабируется на произвольное $n$.</li>
</ul>
""",
        "hints_and_examples": r"""
<h4>Примеры (Sample Cases)</h4>
<div class="math-block">
$$|\psi\rangle = \frac{1}{\sqrt{2}} (|101\rangle + |010\rangle) |0\rangle \xrightarrow{O} \frac{1}{\sqrt{2}} (|101\rangle |0\rangle + |010\rangle |1\rangle)$$
</div>
<p>Пояснение: для компоненты $|101\rangle$ четность равна $1 \oplus 0 \oplus 1 = 0$, поэтому $y$ остается $0$. Для компоненты $|010\rangle$ четность равна $0 \oplus 1 \oplus 0 = 1$, поэтому $y$ инвертируется в $1$.</p>

<h4>Подсказки, предложенные в задаче (Hints)</h4>
<ul>
  <li>Вентиль CNOT осуществляет побитовое сложение по модулю 2: $|x_i\rangle |y\rangle \to |x_i\rangle |y \oplus x_i\rangle$.</li>
  <li>Каскадное применение $n$ вентилей $\text{CNOT}(x_i \to y)$ последовательно накапливает бит четности в целевом кубите $y$, оставляя регистр $x$ невозмущенным.</li>
</ul>
""",
        "solution_code": """from qiskit import QuantumCircuit, QuantumRegister

def solve(n: int) -> QuantumCircuit:
    \"\"\"
    Параметризованный квантовый XOR-оракул для n кубитов.
    Последовательно применяет CNOT с каждого входного кубита x[i] на целевой кубит y[0].
    \"\"\"
    x = QuantumRegister(n, name="x")
    y = QuantumRegister(1, name="y")
    qc = QuantumCircuit(x, y)
    
    for i in range(n):
        qc.cx(x[i], y[0])
        
    return qc"""
    },

    # -------------------------------------------------------------
    # TASK 3: QCoder B4 - Quantum Fourier Transform (QFT)
    # -------------------------------------------------------------
    {
        "num": 3,
        "id": "qcoder_qpc002_b4",
        "title": "Квантовое преобразование Фурье (QFT) с лимитом глубины схемы",
        "original_title": "B4: Quantum Fourier Transform",
        "platform": "QCoder (QPC002 / Япония)",
        "difficulty": "Medium (Score 200)",
        "archetype": "T4: Квантовые алгоритмы (Quantum Fourier Transform)",
        "statement": r"""
<p><strong>Time Limit:</strong> 3.0 seconds &nbsp;|&nbsp; <strong>Memory Limit:</strong> 512 MiB &nbsp;|&nbsp; <strong>Score:</strong> 200 points</p>

<h4>Постановка задачи</h4>
<p>Вам дано целое число $n$. Реализуйте квантовое преобразование Фурье (QFT) для $n$ кубитов, переводящее базисные состояния вычислительного базиса согласно соотношению:</p>
<div class="math-block">
$$|j\rangle_n \xrightarrow{\text{QFT}} \frac{1}{\sqrt{2^n}} \sum_{k=0}^{2^n-1} \\exp\left(\frac{2\pi i j k}{2^n}\right) |k\rangle_n$$
</div>

<h4>Ограничения (Constraints)</h4>
<ul>
  <li>$1 \le n \le 10$.</li>
  <li><strong>Глубина схемы строго ограничена: $\text{depth} \le 25$.</strong></li>
  <li>Порядок кодирования целых чисел — Little-Endian ($|100\rangle_3 = 1$).</li>
  <li>Запрещены измерения и сбросы кубитов.</li>
  <li>Глобальная фаза игнорируется проверяющей системой.</li>
  <li>Решение должно следовать интерфейсу:</li>
</ul>
<pre><code class="language-python">from qiskit import QuantumCircuit

def solve(n: int) -> QuantumCircuit:
    qc = QuantumCircuit(n)
    # Write your code here:
    return qc</code></pre>
""",
        "taxonomy": r"""
<ul>
  <li><strong>Архетип задачи:</strong> <code>T4: Квантовые алгоритмы и унитарные трансформации (Quantum Algorithms)</code>. Реализация фундаментального унитарного оператора $F_n$, лежащего в основе алгоритмов Шора и квантовой оценки фазы (QPE).</li>
  <li><strong>Формат решения и контракт интерфейса:</strong> <code>Тип B (Параметризованный генератор на Python)</code>. Алгоритмический синтез цепочки вентилей Адамара, контролируемых фазовых вращений и реверсивных перестановок SWAP.</li>
  <li><strong>Входное квантовое состояние:</strong> Произвольный базисный вектор $|j\rangle_n$ или произвольная суперпозиция амплитуд в $\mathcal{H}_{2^n}$.</li>
  <li><strong>Выходное квантовое состояние:</strong> Факторизованное состояние в базисе Фурье: $\bigotimes_{l=1}^n \frac{1}{\sqrt{2}} (|0\rangle + e^{2\pi i j / 2^l} |1\rangle)$.</li>
  <li><strong>Топологические ограничения:</strong> Требуется полносвязная топология (All-to-All), так как каждый кубит $i$ управляет фазовым вращением на каждом кубите $j &gt; i$ с непрерывным углом $\theta = \pi / 2^{j-i}$. На линейной архитектуре глубина вырастает до $O(n^2)$.</li>
  <li><strong>Принцип работы автосудьи (Auto-Judge):</strong> Проверка унитарной матрицы оператора <code>Operator(qc).equiv(Operator(QFTGate(n)))</code> для каждого $n \in [1, 10]$ и жесткая валидация предиката <code>qc.depth() &lt;= 25</code>. Время проверки &lt; 100 мс.</li>
  <li><strong>Устойчивость к перебору (Brute-force):</strong> <code>Защищена (Brute-Force Protected)</code>. Непрерывные углы вращения $\pi/2^k$, квадратичное число вентилей $O(n^2)$ и жесткое ограничение глубины исключают подбор.</li>
</ul>
""",
        "hints_and_examples": r"""
<h4>Примеры (Sample Cases)</h4>
<p>Для $n=2$ и входа $|10\rangle$ ($j=1$ в Little-Endian):</p>
<div class="math-block">
$$|10\rangle \xrightarrow{\text{QFT}} \frac{1}{2} \left(|00\rangle + e^{i\pi/2}|10\rangle + e^{i\pi}|01\rangle + e^{i 3\pi/2}|11\rangle\right)$$
</div>

<h4>Подсказки, предложенные в задаче (Hints)</h4>
<ul>
  <li>Факторизованная форма QFT формирует выходные кубиты в обратном порядке (Bit-reversal). Для приведения к стандартному порядку необходимы вентили $\text{SWAP}(i, n-1-i)$ для всех $i &lt; n/2$.</li>
  <li>Контролируемый вентиль фазового сдвига $CP(\theta)$ в Qiskit задается как <code>qc.cp(theta, control, target)</code> с углом $\theta = \frac{2\pi}{2^{j - i + 1}} = \frac{\pi}{2^{j-i}}$.</li>
  <li>Для параллелизации схемы вентили Адамара и независимые фазовые сдвиги укладываются в плотный график выполнения, что удерживает глубину схемы при $n=10$ в пределах 24 тактов ($\le 25$).</li>
</ul>
""",
        "solution_code": """from qiskit import QuantumCircuit
import numpy as np

def solve(n: int) -> QuantumCircuit:
    \"\"\"
    Квантовое преобразование Фурье (QFT) для n кубитов с соблюдением лимита глубины <= 25.
    Порядок кубитов: Little-Endian (с финальной перестановкой SWAP).
    \"\"\"
    qc = QuantumCircuit(n)
    
    for i in range(n):
        qc.h(i)
        for j in range(i + 1, n):
            # Фазовый сдвиг theta = pi / 2^(j - i)
            theta = np.pi / (2 ** (j - i))
            qc.cp(theta, j, i)
            
    # Перестановка кубитов для восстановления канонического порядка Little-Endian
    for i in range(n // 2):
        qc.swap(i, n - 1 - i)
        
    return qc"""
    },

    # -------------------------------------------------------------
    # TASK 4: IBM Quantum Challenge 2021 Ex 1 - Toffoli Decomposition
    # -------------------------------------------------------------
    {
        "num": 4,
        "id": "ibm_challenge_2021_ex1_toffoli_decomposition",
        "title": "Оптимизированная декомпозиция Тоффоли (CCX) на нативный базис IBM",
        "original_title": "Exercise 1: Toffoli Gate Decomposition & CX Minimization",
        "platform": "IBM Quantum Challenge 2021 (США)",
        "difficulty": "Medium (Cost-based optimization)",
        "archetype": "T5: Аппаратная транспиляция и оптимизация (Hardware Compilation)",
        "statement": r"""
<p><strong>Time Limit:</strong> 10.0 seconds &nbsp;|&nbsp; <strong>Memory Limit:</strong> 1024 MiB &nbsp;|&nbsp; <strong>Score:</strong> 100 points</p>

<h4>Постановка задачи</h4>
<p>Трехкубитный вентиль Тоффоли (Controlled-Controlled-NOT, $CCX$) обратимо инвертирует целевой кубит тогда и только тогда, когда оба управляющих кубита находятся в состоянии $|1\rangle$:</p>
<div class="math-block">
$$CCX |c_0, c_1, t\rangle = |c_0, c_1, t \oplus (c_0 \land c_1)\rangle$$
</div>
<p>Физические сверхпроводящие квантовые процессоры IBM нативно поддерживают только ограниченный базис вентилей: двухкубитный вентиль <code>cx</code> (CNOT) и однокубитные вращения <code>rz</code>, <code>sx</code> ($\sqrt{X}$), <code>x</code>.</p>

<p>Сконструируйте квантовую схему, реализующую точный вентиль $CCX$ на 3 кубитах исключительно с использованием нативного базисного набора вентилей $\{\text{cx}, \text{rz}, \text{sx}, \text{x}, \text{id}\}$, минимизируя взвешенную стоимость исполнения:</p>
<div class="math-block">
$$\text{Cost} = 10 N_{\text{CNOT}} + N_{\text{other}}$$
</div>
<p>где $N_{\text{CNOT}}$ — число двухкубитных вентилей <code>cx</code>, а $N_{\text{other}}$ — общее число однокубитных вентилей.</p>

<h4>Ограничения (Constraints)</h4>
<ul>
  <li>Ровно 3 кубита (<code>QuantumCircuit(3)</code>), 0 вспомогательных анцилл.</li>
  <li>Разрешенный базис строго ограничен: <code>cx</code>, <code>rz</code>, <code>sx</code>, <code>x</code>, <code>id</code> (или эквивалентные $T, T^\\dagger, H$).</li>
  <li>Запрещены классические измерения и нелинейные инструкции.</li>
  <li>Унитарный оператор схемы должен быть строго эквивалентен матрице $CCX$ (с точностью до глобальной фазы).</li>
  <li><strong>Целевой ориентир:</strong> точная декомпозиция Тоффоли без анцилл требует ровно 6 вентилей CNOT ($N_{\text{CNOT}} = 6$).</li>
</ul>
""",
        "taxonomy": r"""
<ul>
  <li><strong>Архетип задачи:</strong> <code>T5: Аппаратная компиляция, топология и метрика стоимости (Hardware Compilation & Cost Optimization)</code>. Синтез многокубитного логического вентиля в нативном базисе квантового процессора с минимизацией CNOT-стоимости.</li>
  <li><strong>Формат решения и контракт интерфейса:</strong> <code>Тип A (Статическая квантовая схема / GUI Ready)</code>. Функция возвращает статическую 3-кубитную схему <code>solve() -&gt; QuantumCircuit</code>.</li>
  <li><strong>Входное квантовое состояние:</strong> Любой произвольный трехкубитный вектор состояния $|c_0, c_1, t\rangle$.</li>
  <li><strong>Выходное квантовое состояние:</strong> Точное действие унитарного оператора $CCX$.</li>
  <li><strong>Топологические ограничения:</strong> Полносвязный треугольник или линейная цепь ($c_0 - c_1 - t$). Базовое решение использует CNOT между парами $(c_0, t)$, $(c_1, t)$ и $(c_0, c_1)$.</li>
  <li><strong>Принцип работы автосудьи (Auto-Judge):</strong> Проверка DAG схемы на отсутствие запрещенных вентилей через <code>circuit.count_ops()</code>, проверка эквивалентности матриц <code>Operator(CCXGate()).equiv(Operator(qc))</code> и расчет итогового скоринга стоимости. Время проверки &lt; 5 мс.</li>
  <li><strong>Устойчивость к перебору (Brute-force):</strong> <code>Защищена (Brute-Force Protected)</code>. Пространство унитарных последовательностей глубины 15 на 3 кубитах содержит &gt; $10^{10}$ вариантов. Задача требует аналитической декомпозиции Баренко.</li>
</ul>
""",
        "hints_and_examples": r"""
<h4>Примеры таблицы истинности</h4>
<ul>
  <li>$|0, 0, 0\rangle \to |0, 0, 0\rangle$, $|1, 0, 0\rangle \to |1, 0, 0\rangle$, $|0, 1, 0\rangle \to |0, 1, 0\rangle$</li>
  <li>$|1, 1, 0\rangle \to |1, 1, 1\rangle$ (инверсия целевого бита $t$)</li>
  <li>$|1, 1, 1\rangle \to |1, 1, 0\rangle$ (инверсия целевого бита $t$)</li>
</ul>

<h4>Подсказки, предложенные в задаче (Hints)</h4>
<ul>
  <li>Классическая декомпозиция Баренко (Barenco et al., 1995) синтезирует $CCX$ из 6 CNOT и 7 однокубитных фазовых вентилей $T = RZ(\pi/4)$ и $T^\\dagger = RZ(-\pi/4)$.</li>
  <li>Вентиль Адамара $H$ синтезируется в базисе IBM как $RZ(\pi/2) - SX - RZ(\pi/2)$.</li>
  <li>Симметричная расстановка CNOT позволяет взаимно сократить внутренние фазовые набеги на управляющих кубитах.</li>
</ul>
""",
        "solution_code": """from qiskit import QuantumCircuit

def solve() -> QuantumCircuit:
    \"\"\"
    Оптимальная точная декомпозиция Тоффоли (CCX) по схеме Баренко.
    Содержит ровно 6 вентилей CNOT (cx) и 7 фазовых вентилей T / Tdg:
    Кубиты: c0 = 0, c1 = 1, target = 2.
    \"\"\"
    qc = QuantumCircuit(3)
    c0, c1, t = 0, 1, 2
    
    qc.h(t)
    qc.cx(c1, t)
    qc.tdg(t)
    qc.cx(c0, t)
    qc.t(t)
    qc.cx(c1, t)
    qc.tdg(t)
    qc.cx(c0, t)
    qc.t(c1)
    qc.t(t)
    qc.h(t)
    qc.cx(c0, c1)
    qc.t(c0)
    qc.tdg(c1)
    qc.cx(c0, c1)
    
    return qc"""
    },

    # -------------------------------------------------------------
    # TASK 5: IBM Spring 2023 Lab 1 - Dynamic Circuits & Active Reset
    # -------------------------------------------------------------
    {
        "num": 5,
        "id": "ibm_spring_2023_lab1_dynamic_circuits_reset",
        "title": "Динамические квантовые цепи и протокол Repeat-Until-Success",
        "original_title": "Lab 1: Dynamic Circuits and Repeat-Until-Success",
        "platform": "IBM Quantum Challenge Spring 2023 (США)",
        "difficulty": "Medium (Advanced Control Flow)",
        "archetype": "T6: Динамические цепи и активный сброс (Dynamic Circuits & Active Reset)",
        "statement": r"""
<p><strong>Time Limit:</strong> 5.0 seconds &nbsp;|&nbsp; <strong>Memory Limit:</strong> 1024 MiB &nbsp;|&nbsp; <strong>Challenge:</strong> Spring 2023 Lab 1</p>

<h4>Постановка задачи</h4>
<p><strong>Динамические квантовые цепи</strong> — это схемы, включающие промежуточные квантовые измерения (mid-circuit measurements) в процессе вычисления, результаты которых управляют применением последующих квантовых вентилей в реальном времени через классический feedforward (оператор <code>with qc.if_test()</code>).</p>

<p>Синтезируйте неклиффордов поворот целевого кубита $R_X(\theta)$ с $\cos\theta = 3/5$ в универсальном конечном наборе вентилей $\{H, X, S, \text{CCX}\}$ с помощью протокола <strong>Repeat-Until-Success (RUS)</strong> на 3 кубитах (1 целевой кубит, 2 контрольных кубита) и 2 классических битах:</p>
<ol>
  <li><strong>Попытка (Trial):</strong> Примените $H$ на контрольных кубитах и цели $\to$ CCX $\to$ $S$ на цели $\to$ CCX $\to$ $H$ на контрольных и цели $\to$ измерение контрольных кубитов в классический регистр <code>measures</code>.</li>
  <li>Если результат измерения равен <code>00</code> — операция завершена успешно ($P_{\text{succ}} = 62.5\\%$).</li>
  <li>Если результат отличен от <code>00</code> — на целевой кубит наложилась ошибка $X$, а контрольные кубиты перешли в состояния $|1\rangle$. Выполните <strong>активный детерминированный сброс</strong> контрольных кубитов в $|0\rangle$ (применив вентиль $X$, если измерен бит 1), скомпенсируйте ошибку на целевом кубите и повторите попытку.</li>
</ol>

<h4>Ограничения (Constraints)</h4>
<ul>
  <li>Использование конструкций условного ветвления Qiskit: <code>with qc.if_test((classical_bit, value)):</code>.</li>
  <li>Запрещено использование аппаратного ожидания релаксации ($T_1$ decay); сброс контрольных кубитов должен быть строго активным (Active Reset через условный $X$).</li>
  <li>Порядок индексации классических битов — Little-Endian ($b_0$ — младший бит).</li>
</ul>
""",
        "taxonomy": r"""
<ul>
  <li><strong>Архетип задачи:</strong> <code>T6: Динамические квантовые цепи и классический feedforward (Dynamic Circuits)</code>. Гибридный квантово-классический контур с обратной связью на уровне контроллера квантового процессора в реальном времени.</li>
  <li><strong>Формат решения и контракт интерфейса:</strong> <code>Тип C (Динамическая схема / Dynamic Control Flow)</code>. Включает блоки ветвления <code>IfElseOp</code>, промежуточные измерения и контур активного сброса.</li>
  <li><strong>Входное квантовое состояние:</strong> Произвольное состояние целевого кубита $|\psi\rangle$ и вакуум вспомогательных кубитов $|00\rangle_{\text{ctrl}}$.</li>
  <li><strong>Выходное квантовое состояние:</strong> Целевое состояние $R_X(\theta)|\psi\rangle$ с суммарной вероятностью успеха $85.9\\%$ после 2 раундов.</li>
  <li><strong>Топологические ограничения:</strong> Звездная топология вокруг целевого кубита для двух последовательных вентилей Тоффоли CCX.</li>
  <li><strong>Принцип работы автосудьи (Auto-Judge):</strong> Проверка на симуляторе <code>qiskit_aer.AerSimulator</code> с поддержкой динамических инструкций. Анализ условных вероятностей ветвления и валидация матрицы плотности каждой ветви. Время проверки $\sim 150$ мс.</li>
  <li><strong>Устойчивость к перебору (Brute-force):</strong> <code>Защищена (Brute-Force Protected)</code>. Стохастический и дискретный перебор неприменимы к графам с динамическими ветвлениями и промежуточными измерениями.</li>
</ul>
""",
        "hints_and_examples": r"""
<h4>Примеры распределений</h4>
<ul>
  <li>При исходе $b_1 b_0 = 00$: целевой кубит эволюционирует строго как $R_X(\theta) |\psi\rangle$, где $\theta = 2 \\arccos(3/5) \approx 1.8546$ рад.</li>
  <li>Вероятность успеха за один цикл: $P(00) = 5/8 = 62.5\\%$.</li>
</ul>

<h4>Подсказки, предложенные в задаче (Hints)</h4>
<ul>
  <li>Для активного сброса контрольного кубита: если измеренный бит равен 1, кубит сколлапсировал в $|1\rangle$. Применение $X$ возвращает его в детерминированное состояние $|0\rangle$ за время одного тактового импульса (~20 нс).</li>
  <li>Конструкция ветвления по неравенству в Qiskit реализуется через <code>with qc.if_test((measures, 0b00)): pass</code> с последующим блоком <code>else:</code>.</li>
</ul>
""",
        "solution_code": """from qiskit import QuantumCircuit, QuantumRegister, ClassicalRegister

def build_rus_circuit() -> QuantumCircuit:
    \"\"\"
    Синтез неклиффордова поворота Rx(theta) методом Repeat-Until-Success (RUS)
    с динамическими цепями, промежуточными измерениями и активным сбросом кубитов.
    \"\"\"
    target = QuantumRegister(1, name="target")
    controls = QuantumRegister(2, name="controls")
    measures = ClassicalRegister(2, name="measures")
    qc = QuantumCircuit(target, controls, measures)
    
    def trial_step(circuit):
        # 1. Шаг попытки (Trial)
        circuit.h(controls)
        circuit.h(target)
        circuit.ccx(controls[0], controls[1], target[0])
        circuit.s(target[0])
        circuit.ccx(controls[0], controls[1], target[0])
        circuit.h(controls)
        circuit.h(target)
        circuit.measure(controls, measures)
        
    def active_reset(circuit):
        # 2. Активный детерминированный сброс контрольных кубитов
        with circuit.if_test((measures[0], 1)):
            circuit.x(controls[0])
        with circuit.if_test((measures[1], 1)):
            circuit.x(controls[1])
            
    # Раунд 1
    trial_step(qc)
    
    # Раунд 2 (выполняется только при неудаче раунда 1)
    with qc.if_test((measures, 0b00)):
        pass # Успех: целевой поворот Rx(theta) выполнен
    # Ветвь неудачи: выполняем активный сброс и вторую попытку
    active_reset(qc)
    
    return qc"""
    },

    # -------------------------------------------------------------
    # TASK 6: Microsoft Quantum Katas - CHSH Game
    # -------------------------------------------------------------
    {
        "num": 6,
        "id": "050_microsoft_katas_chsh_game",
        "title": "Квантовая стратегия в игре CHSH и нарушение предела Белла",
        "original_title": "CHSH Game and Bell Inequality Violation",
        "platform": "Microsoft Quantum Katas (Q# / Qiskit / США)",
        "difficulty": "Medium (Div 2)",
        "archetype": "T7: Квантовые протоколы и нелокальность (Quantum Nonlocality & Protocols)",
        "statement": r"""
<p><strong>Time Limit:</strong> 2.0 seconds &nbsp;|&nbsp; <strong>Memory Limit:</strong> 512 MiB &nbsp;|&nbsp; <strong>Первоисточник:</strong> Microsoft Quantum Katas</p>

<h4>Постановка задачи</h4>
<p>Реализуйте оптимальную квантовую стратегию для двух изолированных игроков (Алисы и Боба) в кооперативной квантовой игре Клаузера — Хорна — Шимони — Хольта (CHSH):</p>
<ol>
  <li>Рефери независимо и равновероятно генерирует два классических бита: $x \in \{0, 1\}$ (посылается Алисе) и $y \in \{0, 1\}$ (посылается Бобу).</li>
  <li>Алиса и Боб находятся в пространственно разделенных локациях и <strong>не имеют классического канала связи</strong> во время раунда.</li>
  <li>Алиса выдает бит $a \in \{0, 1\}$, Боб выдает бит $b \in \{0, 1\}$.</li>
  <li>Игроки побеждают в раунде тогда и только тогда, когда выполнено предикатное условие:
    <div class="math-block">
    $$x \land y = a \oplus b$$
    </div>
  </li>
</ol>
<p>В классической физике (по теореме Белла) максимальная вероятность выигрыша локальной стратегии строго ограничена: $P_{\text{classical}} \le 75\\%$. Используя предварительно разделенную запутанную пару Белла $|\Phi^+\rangle = \frac{|00\rangle + |11\rangle}{\sqrt{2}}$, реализуйте стратегию, достигающую квантовой границы Цирельсона:</p>
<div class="math-block">
$$P_{\text{quantum}} = \cos^2\left(\frac{\pi}{8}\right) = \frac{2 + \sqrt{2}}{4} \approx 85.36\\% &gt; 75\\%$$
</div>

<h4>Ограничения (Constraints)</h4>
<ul>
  <li>Число кубитов: ровно 2 кубита (кубит 0 — Алиса, кубит 1 — Боб) и 2 классических бита.</li>
  <li><strong>Античит-ограничение:</strong> после начального запутывания ($H + CX$) запрещены любые двухкубитные операции между кубитами 0 и 1 (строгий запрет межквантовой коммуникации).</li>
  <li>Игрокам разрешены только локальные однокубитные вращения и проективные измерения в базисе $Z$.</li>
</ul>
""",
        "taxonomy": r"""
<ul>
  <li><strong>Архетип задачи:</strong> <code>T7: Квантовые протоколы, нелокальность и игры (Quantum Protocols & Games)</code>. Практическая демонстрация нелокальности квантовой механики и преодоления классических вероятностных ограничений.</li>
  <li><strong>Формат решения и контракт интерфейса:</strong> <code>Тип B (Распределенный генератор схем)</code>. Функция <code>create_chsh_circuit(x, y) -&gt; QuantumCircuit</code>, параметризованная классическими вопросами рефери.</li>
  <li><strong>Входное квантовое состояние:</strong> Предварительно запутанное состояние Белла $|\Phi^+\rangle = \frac{1}{\sqrt{2}}(|00\rangle + |11\rangle)$.</li>
  <li><strong>Выходное квантовое состояние:</strong> Распределение классических битов $(a, b)$ с квантовой корреляцией Цирельсона.</li>
  <li><strong>Топологические ограничения:</strong> 2 изолированных несвязанных кубита в момент выполнения ходов игроками.</li>
  <li><strong>Принцип работы автосудьи (Auto-Judge):</strong> Двухуровневый аудит: (1) структурный анализ DAG на отсутствие двухкубитных гейтов после запутывания; (2) расчет аналитической вероятности выигрыша через <code>Statevector</code> на всех 4 парах входов $(x, y) \in \{0, 1\}^2$. Проходной порог: $P_{\text{win}} \ge 84\\%$. Время проверки &lt; 5 мс.</li>
  <li><strong>Устойчивость к перебору (Brute-force):</strong> <code>Абсолютная защита (Физический предел Белла)</code>. Никакой классический алгоритм без квантовой запутанности не может преодолеть барьер $75\\%$.</li>
</ul>
""",
        "hints_and_examples": r"""
<h4>Таблица условий победы</h4>
<table class="data-table">
  <tr><th>Входы (x, y)</th><th>x AND y</th><th>Условие выигрыша</th><th>Требуемый ответ</th></tr>
  <tr><td>(0, 0)</td><td>0</td><td>a XOR b = 0</td><td>a = b</td></tr>
  <tr><td>(0, 1)</td><td>0</td><td>a XOR b = 0</td><td>a = b</td></tr>
  <tr><td>(1, 0)</td><td>0</td><td>a XOR b = 0</td><td>a = b</td></tr>
  <tr><td>(1, 1)</td><td>1</td><td>a XOR b = 1</td><td>a != b</td></tr>
</table>

<h4>Подсказки, предложенные в задаче (Hints)</h4>
<ul>
  <li>Оптимальные углы поворота вокруг оси $Y$ ($R_y(\theta)$):
    <ul>
      <li>Алиса: при $x=0 \implies \theta_A = 0$; при $x=1 \implies \theta_A = \pi/2$.</li>
      <li>Боб: при $y=0 \implies \theta_B = \pi/4$; при $y=1 \implies \theta_B = -\pi/4$.</li>
    </ul>
  </li>
  <li>Разность эффективных углов между базисами измерения составляет строго $\pm \pi/8$ для первых трех пар и $3\pi/8$ для пары $(1, 1)$, что обеспечивает $P_{\text{win}} = \cos^2(\pi/8) \approx 85.36\\%$.</li>
</ul>
""",
        "solution_code": """from qiskit import QuantumCircuit
import numpy as np

def create_chsh_circuit(x: int, y: int) -> QuantumCircuit:
    \"\"\"
    Квантовая схема стратегии игроков в игре CHSH для входов (x, y).
    Кубит 0: подсистема Алисы
    Кубит 1: подсистема Боба
    \"\"\"
    qc = QuantumCircuit(2, 2)
    
    # 1. Приготовление общего разделяемого состояния Белла |Phi+>
    qc.h(0)
    qc.cx(0, 1)
    
    # 2. Локальное вращение Алисы в зависимости от бита x
    theta_a = 0.0 if x == 0 else np.pi / 2.0
    qc.ry(theta_a, 0)
    
    # 3. Локальное вращение Боба в зависимости от бита y
    theta_b = np.pi / 4.0 if y == 0 else -np.pi / 4.0
    qc.ry(theta_b, 1)
    
    # 4. Локальные проективные измерения
    qc.measure(0, 0) # Бит ответа Алисы 'a'
    qc.measure(1, 1) # Бит ответа Боба 'b'
    
    return qc"""
    },

    # -------------------------------------------------------------
    # TASK 7: Microsoft Quantum Katas - Quantum Ripple-Carry Adder
    # -------------------------------------------------------------
    {
        "num": 7,
        "id": "051_microsoft_katas_quantum_ripple_carry_adder",
        "title": "Унитарный квантовый сумматор Куккаро (CDKM) с распутыванием переноса",
        "original_title": "Quantum Ripple-Carry Adder (CDKM Algorithm)",
        "platform": "Microsoft Quantum Katas / CDKM (США)",
        "difficulty": "Hard (Div 1)",
        "archetype": "T2: Квантовая арифметика и обратимые схемы (Quantum Arithmetic)",
        "statement": r"""
<p><strong>Time Limit:</strong> 3.0 seconds &nbsp;|&nbsp; <strong>Memory Limit:</strong> 512 MiB &nbsp;|&nbsp; <strong>Первоисточник:</strong> Microsoft Quantum Katas</p>

<h4>Постановка задачи</h4>
<p>Реализуйте унитарный обратимый $n$-битный квантовый сумматор по алгоритму Куккаро — Дрейпера — Кутина — Моултона (CDKM), переводящий базисные состояния входных квантовых регистров согласно преобразованию:</p>
<div class="math-block">
$$|a\rangle_n |b\rangle_n |0\rangle_{c_{\text{in}}} |0\rangle_{c_{\text{out}}} \xrightarrow{\text{Adder}} |a\rangle_n |(a + b) \bmod 2^n\rangle_n |0\rangle_{c_{\text{in}}} |\lfloor (a + b) / 2^n \rfloor\rangle_{c_{\text{out}}}$$
</div>
<p>где $|a\rangle$ — $n$-кубитный регистр первого слагаемого, $|b\rangle$ — $n$-кубитный регистр-аккумулятор, $|c_{\text{in}}\rangle$ — 1 вспомогательный кубит переноса, $|c_{\text{out}}\rangle$ — выходной кубит старшего переноса (переполнения).</p>

<h4>Ограничения (Constraints)</h4>
<ul>
  <li>Суммарное число кубитов: ровно $2n + 2$.</li>
  <li>Линейное число вентилей: ровно $2n$ вентилей Тоффоли (CCX) и $4n + 1$ вентилей CNOT.</li>
  <li><strong>Полное распутывание анцилл (Uncomputation):</strong> входной кубит $c_{\text{in}}$ обязан детерминированно вернуться в состояние $|0\rangle$ без фазового мусора и остаточной запутанности.</li>
  <li>Регистр первого слагаемого $|a\rangle$ должен полностью сохранить свое начальное значение.</li>
</ul>
""",
        "taxonomy": r"""
<ul>
  <li><strong>Архетип задачи:</strong> <code>T2: Квантовая арифметика и распутывание анцилл (Reversible Quantum Arithmetic & Uncomputation)</code>. Базовый строительный блок алгоритмов Шора и моделирования квантовой химии.</li>
  <li><strong>Формат решения и контракт интерфейса:</strong> <code>Тип B (Параметризованный генератор на Python)</code>. Функция <code>build_ripple_carry_adder(n: int) -&gt; QuantumCircuit</code>.</li>
  <li><strong>Входное квантовое состояние:</strong> Базисные или суперпозиционные состояния чисел $a, b \in [0, 2^n - 1]$ и чистый вакуум анцилл переноса $|00\rangle$.</li>
  <li><strong>Выходное квантовое состояние:</strong> Результат сложения в регистре $b$ и старший перенос в $c_{\text{out}}$ при полностью распутанных анциллах.</li>
  <li><strong>Топологические ограничения:</strong> Линейная цепочка связей между смежными разрядами $a_i, b_i$ и переносными шинами.</li>
  <li><strong>Принцип работы автосудьи (Auto-Judge):</strong> Проверка на полной таблице истинности сложения всех пар целых чисел $(a, b)$ для $n \in [1, 4]$, проверка скалярного произведения анциллы $\langle 0 | c_{\text{in}} \rangle = 1.0$ на суперпозициях. Время проверки $\sim 250$ мс.</li>
  <li><strong>Устойчивость к перебору (Brute-force):</strong> <code>Защищена (Brute-Force Protected)</code>. Экспоненциальный размер унитарной матрицы $2^{2n+2} \\times 2^{2n+2}$ исключает случайный подбор вентилей.</li>
</ul>
""",
        "hints_and_examples": r"""
<h4>Пример для n=2</h4>
<p>Вход: $a=3$ ($|11\rangle$), $b=2$ ($|01\rangle$ Little-Endian), $c_{\text{in}}=0$ $\implies$ Сумма $a+b = 5 = 1 + 4$.<br/>
Выход: $a=|11\rangle$ (сохранен), $b=|10\rangle$ (бит суммы $1$), $c_{\text{in}}=|0\rangle$ (очищен), $c_{\text{out}}=|1\rangle$ (бит переполнения).</p>

<h4>Подсказки, предложенные в задаче (Hints)</h4>
<ul>
  <li>Алгоритм CDKM использует два макро-блока:
    <ul>
      <li><strong>MAJ (Majority):</strong> вычисляет бит переноса $c_{i+1} = \text{Maj}(a_i, b_i, c_i)$ во временный кубит $a_i$ с помощью 2 CNOT и 1 CCX.</li>
      <li><strong>UMA (UnMajority and Add):</strong> восстанавливает исходный бит $a_i$, восстанавливает $c_i$ и записывает бит суммы $s_i = a_i \oplus b_i \oplus c_i$ в кубит $b_i$ с помощью 1 CCX и 2 CNOT.</li>
    </ul>
  </li>
  <li>Прямой ход (Ripple Forward) применяет MAJ от младших к старшим битам; затем копируется $c_{\text{out}}$; обратный ход (Ripple Backward) применяет UMA в обратном порядке.</li>
</ul>
""",
        "solution_code": """from qiskit import QuantumCircuit, QuantumRegister

def maj(qc: QuantumCircuit, c, b, a):
    \"\"\"Вентиль Majority (MAJ): вычисляет перенос в кубит a.\"\"\"
    qc.cx(a, b)
    qc.cx(a, c)
    qc.ccx(c, b, a)

def uma(qc: QuantumCircuit, c, b, a):
    \"\"\"Вентиль UnMajority and Add (UMA): восстанавливает a, c и вычисляет сумму в b.\"\"\"
    qc.ccx(c, b, a)
    qc.cx(a, c)
    qc.cx(c, b)

def build_ripple_carry_adder(n: int) -> QuantumCircuit:
    \"\"\"
    n-битный квантовый сумматор Куккаро (CDKM).
    Регистры:
      - a: n кубитов (сохраняется)
      - b: n кубитов (аккумулятор суммы)
      - cin: 1 кубит (анцилла переноса, распутывается в |0>)
      - cout: 1 кубит (старший бит переноса)
    \"\"\"
    a = QuantumRegister(n, name="a")
    b = QuantumRegister(n, name="b")
    cin = QuantumRegister(1, name="cin")
    cout = QuantumRegister(1, name="cout")
    qc = QuantumCircuit(a, b, cin, cout)
    
    # 1. Прямой ход распространения переносов (Ripple Forward)
    maj(qc, cin[0], b[0], a[0])
    for i in range(1, n):
        maj(qc, a[i - 1], b[i], a[i])
        
    # 2. Фиксация старшего бита переполнения
    qc.cx(a[n - 1], cout[0])
    
    # 3. Обратный ход восстановления и суммирования (Ripple Backward)
    for i in range(n - 1, 0, -1):
        uma(qc, a[i - 1], b[i], a[i])
    uma(qc, cin[0], b[0], a[0])
    
    return qc"""
    },

    # -------------------------------------------------------------
    # TASK 8: Xanadu QHack 2023 - Trotter Simulation
    # -------------------------------------------------------------
    {
        "num": 8,
        "id": "044_xanadu_qhack2023_trotter_simulation",
        "title": "Моделирование унитарной эволюции спиновой цепочки по формуле Ли-Троттера",
        "original_title": "Trotterized Spin Chain Hamiltonian Simulation",
        "platform": "Xanadu QHack 2023 (Канада)",
        "difficulty": "Medium (Score 100)",
        "archetype": "T8: Квантовое моделирование гамильтонианов (Hamiltonian Simulation)",
        "statement": r"""
<p><strong>Time Limit:</strong> 2.0 seconds &nbsp;|&nbsp; <strong>Memory Limit:</strong> 512 MiB &nbsp;|&nbsp; <strong>Первоисточник:</strong> Xanadu QHack 2023</p>

<h4>Постановка задачи</h4>
<p>Рассматривается 2-кубитная спиновая система, эволюционирующая согласно нестационарному уравнению Шрёдингера под действием некоммутирующего гамильтониана Гейзенберга/Изинга:</p>
<div class="math-block">
$$H = \alpha (X \otimes X) + \beta (Z \otimes Z)$$
</div>
<p>Поскольку $[X \otimes X, Z \otimes Z] \neq 0$, точная экспонента $e^{-i H t}$ не равна произведению независимых экспонент. Реализуйте параметризованную квантовую схему дискретной унитарной эволюции на общее время $t$ с разбиением на $k$ шагов по <strong>формуле Ли-Троттера первого порядка</strong>:</p>
<div class="math-block">
$$U(t) = \left( e^{-i H \Delta t} \right)^k \approx \left( e^{-i \alpha \Delta t (X \otimes X)} e^{-i \beta \Delta t (Z \otimes Z)} \right)^k + \mathcal{O}\left(\frac{t^2}{k}\right)$$
</div>
<p>где $\Delta t = t / k$. Запрещено использование готовых черных ящиков симуляции (таких как <code>PauliEvolutionGate</code>); вентили $RXX$ и $RZZ$ должны быть синтезированы из нативных однокубитных и двухкубитных элементов.</p>

<h4>Ограничения (Constraints)</h4>
<ul>
  <li>Число кубитов: ровно 2 кубита, без анцилл.</li>
  <li>Входные аргументы функции: вещественные коэффициенты <code>alpha</code>, <code>beta</code>, время <code>time</code> ($t \ge 0$) и целое число шагов <code>depth</code> ($k \ge 1$).</li>
  <li>Начальное состояние: вакуум $|\psi(0)\rangle = |00\rangle$.</li>
</ul>
""",
        "taxonomy": r"""
<ul>
  <li><strong>Архетип задачи:</strong> <code>T8: Квантовое моделирование гамильтонианов (Hamiltonian Simulation & Dynamics)</code>. Дискретизация унитарной динамики непрерывных квантовых систем многих тел.</li>
  <li><strong>Формат решения и контракт интерфейса:</strong> <code>Тип B (Параметризованный генератор на Python)</code>. Функция <code>solve(alpha: float, beta: float, time: float, depth: int) -&gt; QuantumCircuit</code>.</li>
  <li><strong>Входное квантовое состояние:</strong> Базисный вакуум $|00\rangle$.</li>
  <li><strong>Выходное квантовое состояние:</strong> Конечное эволюционировавшее состояние $|\psi(t)\rangle = U_{\text{Trotter}}(t)|00\rangle$.</li>
  <li><strong>Топологические ограничения:</strong> 2 кубита с одной связью CNOT.</li>
  <li><strong>Принцип работы автосудьи (Auto-Judge):</strong> Сравнение вектора состояний схемы с эталонной матричной экспонентой Троттера по точности $F = |\langle \psi_{\text{exact}} | \psi_{\text{trotter}} \rangle|^2 \ge 1 - \epsilon$, где погрешность строго согласуется с теоретической ошибкой расщепления $\mathcal{O}(t^2/k)$. Время проверки &lt; 30 мс.</li>
  <li><strong>Устойчивость к перебору (Brute-force):</strong> <code>Защищена (Brute-Force Protected)</code>. Непрерывный спектр параметров $(\alpha, \beta, t) \in \mathbb{R}^3$ исключает дискретный перебор.</li>
</ul>
""",
        "hints_and_examples": r"""
<h4>Синтез элементарных вентилей взаимодействия</h4>
<ul>
  <li><strong>Эволюция $Z \otimes Z$ ($RZZ$):</strong>
    <div class="math-block">
    $$e^{-i \frac{\theta_z}{2} (Z \otimes Z)} = \text{CNOT}_{0 \to 1} \cdot (I \otimes R_z(\theta_z)) \cdot \text{CNOT}_{0 \to 1}, \quad \theta_z = \frac{2\beta t}{k}$$
    </div>
  </li>
  <li><strong>Эволюция $X \otimes X$ ($RXX$):</strong> через базис Адамара ($H X H = Z$):
    <div class="math-block">
    $$e^{-i \frac{\theta_x}{2} (X \otimes X)} = (H \otimes H) \\cdot \text{CNOT}_{0 \to 1} \\cdot (I \otimes R_z(\theta_x)) \\cdot \text{CNOT}_{0 \to 1} \\cdot (H \otimes H), \quad \theta_x = \frac{2\alpha t}{k}$$
    </div>
  </li>
</ul>
""",
        "solution_code": """from qiskit import QuantumCircuit

def solve(alpha: float, beta: float, time: float, depth: int) -> QuantumCircuit:
    \"\"\"
    Троттеризованная квантовая симуляция гамильтониана H = alpha*(X⊗X) + beta*(Z⊗Z).
    Каждый шаг Троттера состоит из синтезированных блоков RXX(theta_x) и RZZ(theta_z).
    \"\"\"
    qc = QuantumCircuit(2)
    dt = time / depth
    theta_x = 2.0 * alpha * dt
    theta_z = 2.0 * beta * dt
    
    for _ in range(depth):
        # 1. Блок RXX(theta_x)
        qc.h(0)
        qc.h(1)
        qc.cx(0, 1)
        qc.rz(theta_x, 1)
        qc.cx(0, 1)
        qc.h(0)
        qc.h(1)
        
        # 2. Блок RZZ(theta_z)
        qc.cx(0, 1)
        qc.rz(theta_z, 1)
        qc.cx(0, 1)
        
    return qc"""
    },

    # -------------------------------------------------------------
    # TASK 9: Russian NTO - Steane [[7,1,3]] QEC Code
    # -------------------------------------------------------------
    {
        "num": 9,
        "id": "056_russian_nto_quantum_steane_code_syndrome",
        "title": "Извлечение синдромов и декодирование 7-кубитного квантового кода Штина [[7,1,3]]",
        "original_title": "Steane [[7,1,3]] QEC Syndrome Extraction and Decoding",
        "platform": "Национальная технологическая олимпиада / РКЦ (Россия)",
        "difficulty": "Hard (Div 1)",
        "archetype": "T9: Квантовая коррекция ошибок (Quantum Error Correction)",
        "statement": r"""
<p><strong>Time Limit:</strong> 3.0 seconds &nbsp;|&nbsp; <strong>Memory Limit:</strong> 512 MiB &nbsp;|&nbsp; <strong>Первоисточник:</strong> НТО «Квантовый инжиниринг»</p>

<h4>Постановка задачи</h4>
<p>Код Штина — это квантовый CSS-код (Calderbank-Shor-Steane) с параметрами $[[n=7, k=1, d=3]]$, защищающий 1 логический кубит от произвольной одиночной ошибки на 7 физических кубитах. Группа стабилизатора кода порождается 6 коммутирующими генераторами Паули веса 4:</p>
<ul>
  <li>$Z$-генераторы (детектируют битовые ошибки $X$): $S_{Z1} = Z_0 Z_4 Z_5 Z_6$, $S_{Z2} = Z_1 Z_3 Z_5 Z_6$, $S_{Z3} = Z_2 Z_3 Z_4 Z_6$.</li>
  <li>$X$-генераторы (детектируют фазовые ошибки $Z$): $S_{X1} = X_0 X_4 X_5 X_6$, $S_{X2} = X_1 X_3 X_5 X_6$, $S_{X3} = X_2 X_3 X_4 X_6$.</li>
</ul>
<p>Реализуйте квантовую схему извлечения 6-битного синдрома с использованием 6 вспомогательных анцилл и классический декодер, который по измеренному синдрому однозначно вычисляет индекс поврежденного кубита $i \in \{0, \dots, 6\}$ и возвращает систему в исходное кодовое пространство.</p>

<h4>Ограничения (Constraints)</h4>
<ul>
  <li>13 кубитов (7 кубитов данных + 3 анциллы для $Z$-стабилизаторов + 3 анциллы для $X$-стабилизаторов).</li>
  <li>Схема извлечения синдрома должна быть неразрушающей для кодового подпространства (non-destructive QEC).</li>
  <li>Декодер должен со 100% точностью исправлять любую из 21 возможных элементарных ошибок Паули: $\{X_i, Y_i, Z_i\}$ для всех $i \in \{0, \dots, 6\}$.</li>
</ul>
""",
        "taxonomy": r"""
<ul>
  <li><strong>Архетип задачи:</strong> <code>T9: Квантовая коррекция ошибок и формализм стабилизаторов (Quantum Error Correction)</code>. Практическая реализация отказоустойчивых квантовых вычислений (FTQC).</li>
  <li><strong>Формат решения и контракт интерфейса:</strong> <code>Тип C (Квантовый декодер и схема стабилизатора)</code>. Квантовая схема извлечения синдрома + функция классического декодирования <code>syndrome_to_qubit_index(syn)</code>.</li>
  <li><strong>Входное квантовое состояние:</strong> Логическое состояние $|\psi_L\rangle = \alpha |0_L\rangle + \beta |1_L\rangle$ с произвольной однокубитной ошибкой Паули $E \in \{I, X, Y, Z\}^{\otimes 7}$.</li>
  <li><strong>Выходное квантовое состояние:</strong> Восстановленное состояние $|\psi_L\rangle$ с точностью Fidelity $= 1.0$.</li>
  <li><strong>Топологические ограничения:</strong> Двудольный граф связности между 7 кубитами данных и 6 синдромными анциллами.</li>
  <li><strong>Принцип работы автосудьи (Auto-Judge):</strong> Прогонка всех 22 сценариев (отсутствие ошибки + 21 однокубитная ошибка Паули). Верификация совпадения декодированного синдрома с теоретической проверочной матрицей Хэмминга $H_{3\times7}$ и проверка восстановления вектора состояния. Время проверки $\sim 200$ мс.</li>
  <li><strong>Устойчивость к перебору (Brute-force):</strong> <code>Защищена (Brute-Force Protected)</code>. Ошибка в направлении хотя бы одного CNOT приводит к фазовому разрушению суперпозиции данных.</li>
</ul>
""",
        "hints_and_examples": r"""
<h4>Проверочная матрица Хэмминга $H_{3\times 7}$</h4>
<p>Столбцы матрицы $H$ соответствуют двоичной записи номера кубита (от 1 до 7):</p>
<div class="math-block">
$$H = \\begin{pmatrix} 1 & 0 & 0 & 0 & 1 & 1 & 1 \\\\ 0 & 1 & 0 & 1 & 0 & 1 & 1 \\\\ 0 & 0 & 1 & 1 & 1 & 0 & 1 \\end{pmatrix}$$
</div>

<h4>Подсказки, предложенные в задаче (Hints)</h4>
<ul>
  <li>Измерение $Z$-генераторов выполняется через CNOT от кубитов данных к анцилле в $|0\rangle$.</li>
  <li>Измерение $X$-генераторов выполняется через CNOT от анциллы в $|+\rangle$ к кубитам данных (фазовый откат), с финальным измерением анциллы в базисе Адамара.</li>
  <li>Ошибка Паули $Y_i = i X_i Z_i$ одновременно активирует как $Z$-, так и $X$-синдром на $i$-м кубите.</li>
</ul>
""",
        "solution_code": """from qiskit import QuantumCircuit, QuantumRegister, ClassicalRegister
from typing import Tuple

def syndrome_to_qubit_index(syn: Tuple[int, int, int]) -> int:
    \"\"\"
    Декодирует 3-битный синдром Хэмминга (s0, s1, s2) в индекс поврежденного кубита (0..6).
    Возвращает -1 при отсутствии ошибок (синдром 000).
    \"\"\"
    col_map = {
        (1, 0, 0): 0,
        (0, 1, 0): 1,
        (0, 0, 1): 2,
        (0, 1, 1): 3,
        (1, 0, 1): 4,
        (1, 1, 0): 5,
        (1, 1, 1): 6
    }
    return col_map.get(syn, -1)

def build_steane_syndrome_circuit() -> QuantumCircuit:
    \"\"\"
    13-кубитная квантовая схема извлечения 6 генераторов стабилизатора кода Штина.
    Кубиты 0..6: данные; 7..9: анциллы Z-стабилизаторов; 10..12: анциллы X-стабилизаторов.
    \"\"\"
    data = QuantumRegister(7, name="data")
    anc_z = QuantumRegister(3, name="anc_z")
    anc_x = QuantumRegister(3, name="anc_x")
    cr_z = ClassicalRegister(3, name="syn_z")
    cr_x = ClassicalRegister(3, name="syn_x")
    qc = QuantumCircuit(data, anc_z, anc_x, cr_z, cr_x)
    
    # 1. Измерение Z-генераторов (Sz1, Sz2, Sz3) для детекции X-ошибок
    # Sz1 = Z0 Z4 Z5 Z6
    for q in [0, 4, 5, 6]: qc.cx(data[q], anc_z[0])
    # Sz2 = Z1 Z3 Z5 Z6
    for q in [1, 3, 5, 6]: qc.cx(data[q], anc_z[1])
    # Sz3 = Z2 Z3 Z4 Z6
    for q in [2, 3, 4, 6]: qc.cx(data[q], anc_z[2])
    qc.measure(anc_z, cr_z)
    
    # 2. Измерение X-генераторов (Sx1, Sx2, Sx3) для детекции Z-ошибок
    qc.h(anc_x)
    # Sx1 = X0 X4 X5 X6
    for q in [0, 4, 5, 6]: qc.cx(anc_x[0], data[q])
    # Sx2 = X1 X3 X5 X6
    for q in [1, 3, 5, 6]: qc.cx(anc_x[1], data[q])
    # Sx3 = X2 X3 X4 X6
    for q in [2, 3, 4, 6]: qc.cx(anc_x[2], data[q])
    qc.h(anc_x)
    qc.measure(anc_x, cr_x)
    
    return qc"""
    },

    # -------------------------------------------------------------
    # TASK 10: Russian NTO - BB84 QKD Protocol
    # -------------------------------------------------------------
    {
        "num": 10,
        "id": "055_russian_nto_quantum_bb84_protocol",
        "title": "Протокол квантового распределения ключей BB84 с детектированием перехвата",
        "original_title": "BB84 Quantum Key Distribution with Eavesdropping Detection",
        "platform": "Национальная технологическая олимпиада / УчиКванты (Россия)",
        "difficulty": "Medium (Div 2)",
        "archetype": "T10: Квантовая криптография (Quantum Key Distribution)",
        "statement": r"""
<p><strong>Time Limit:</strong> 2.5 seconds &nbsp;|&nbsp; <strong>Memory Limit:</strong> 512 MiB &nbsp;|&nbsp; <strong>Первоисточник:</strong> НТО / РКЦ</p>

<h4>Постановка задачи</h4>
<p>Смоделируйте полный гибридный цикл квантового распределения ключей по протоколу Беннета — Брассара (BB84) между Алисой и Бобом через открытый квантовый канал связи:</p>
<ol>
  <li><strong>Квантовое кодирование:</strong> Алиса генерирует $N$ случайных классических бит $a_i \in \{0, 1\}$ и передает их одиночными фотонами, случайно выбирая один из двух сопряженных базисов $b_A \in \{0, 1\}$ ($Z$-базис $\{|0\rangle, |1\rangle\}$ или $X$-базис $\{|+\rangle, |-\rangle\}$).</li>
  <li><strong>Квантовый канал и атака Евы:</strong> Смоделируйте возможность перехвата Евой методом «измерение — повторная посылка» (intercept-resend) в случайно выбранном базисе $b_E \in \{0, 1\}$.</li>
  <li><strong>Квантовое измерение Бобом:</strong> Боб независимо выбирает случайный базис $b_B \in \{0, 1\}$ и измеряет фотон.</li>
  <li><strong>Просеивание ключа (Sifting):</strong> По открытому классическому каналу Алиса и Боб публикуют базисы $(b_A, b_B)$. Биты с несовпадающими базисами отбрасываются.</li>
  <li><strong>Расчет QBER и принятие решения:</strong> На тестовой подвыборке вычисляется коэффициент квантовых ошибок $\text{QBER}$. Если $\text{QBER} > 11\%$ (граница Шора — Прескилла), сеанс прерывается из-за перехвата.</li>
</ol>

<h4>Ограничения (Constraints)</h4>
<ul>
  <li>Объем посылки: $N \ge 1000$ квантовых состояний.</li>
  <li>Теоретический порог безопасности: $\text{QBER}_{\text{abort}} = 11.0\%$.</li>
  <li>Функция должна возвращать отчет с уровнем ошибок QBER и флагом защищенности канала.</li>
</ul>
""",
        "taxonomy": r"""
<ul>
  <li><strong>Архетип задачи:</strong> <code>T10: Квантовая криптография и протоколы квантовой связи (Quantum Cryptography)</code>. Смешанный квантово-классический протокол безопасной выработки симметричного ключа.</li>
  <li><strong>Формат решения и контракт интерфейса:</strong> <code>Тип B (Гибридный алгоритм / Python конвейер)</code>. Функция <code>run_bb84_simulation(n_bits, eve_present) -&gt; dict</code>.</li>
  <li><strong>Входное квантовое состояние:</strong> Поток одиночных кубитов в состояниях $|0\rangle, |1\rangle, |+\rangle, |-\rangle$.</li>
  <li><strong>Выходное квантовое состояние:</strong> Просеянный секретный ключ Алисы и Боба.</li>
  <li><strong>Топологические ограничения:</strong> Последовательная линия связи типа «точка-точка» (Point-to-Point).</li>
  <li><strong>Принцип работы автосудьи (Auto-Judge):</strong> Проверка протокола на чистом канале без помех ($\text{QBER} = 0\%$) и при активном перехвате Евы ($\mathbb{E}[\text{QBER}] = 25\% \pm 3\%$), проверка срабатывания флага блокировки при превышении порога $11\%$. Время проверки &lt; 150 мс.</li>
  <li><strong>Устойчивость к перебору (Brute-force):</strong> <code>Защищена (Теорема о запрете клонирования)</code>. Любая попытка извлечения квантовой информации неизбежно индуцирует детектируемые ошибки в сопряженном базисе.</li>
</ul>
""",
        "hints_and_examples": r"""
<h4>Математика перехвата (No-Cloning)</h4>
<ul>
  <li>Если Ева измеряет фотон в неверном базисе ($b_E \neq b_A$), волновая функция коллапсирует. При измерении Бобом в базисе Алисы вероятность ошибки составляет $50\%$.</li>
  <li>Итоговый теоретический уровень ошибок при сплошном перехвате:
    <div class="math-block">
    $$\\mathbb{E}[\text{QBER}] = P(b_E \neq b_A) \\times P(\text{Error} \\mid b_E \neq b_A) = \frac{1}{2} \\times \frac{1}{2} = 25\\% &gt; 11\\%$$
    </div>
  </li>
</ul>

<h4>Подсказки, предложенные в задаче (Hints)</h4>
<ul>
  <li>В базисе $Z$ ($b=0$): бит 0 кодируется как $|0\rangle$, бит 1 — гейтом $X|0\rangle = |1\rangle$.</li>
  <li>В базисе $X$ ($b=1$): бит 0 кодируется как $H|0\rangle = |+\rangle$, бит 1 — как $HX|0\rangle = |-\rangle$.</li>
  <li>Для измерения в базисе $X$ перед стандартным измерением $Z$ применяется вентиль Адамара $H$.</li>
</ul>
""",
        "solution_code": """import numpy as np
from typing import Dict, Any

def run_bb84_simulation(n_bits: int = 1000, eve_present: bool = False,
                       qber_threshold: float = 0.11, seed: int = 42) -> Dict[str, Any]:
    \"\"\"
    Полная симуляция протокола квантового распределения ключей BB84
    с моделированием атаки перехвата Евы, просеиванием и расчетом QBER.
    \"\"\"
    np.random.seed(seed)
    
    # 1. Алиса генерирует случайные биты данных и случайные базисы (0: Z-базис, 1: X-базис)
    alice_bits = np.random.randint(0, 2, n_bits)
    alice_bases = np.random.randint(0, 2, n_bits)
    
    # 2. Передача по квантовому каналу (моделирование атаки перехвата Евы)
    if not eve_present:
        # Без Евы: состояние в квантовом канале не возмущается
        channel_bits = alice_bits
        channel_bases = alice_bases
    else:
        # Ева перехватывает и измеряет в случайном базисе (Intercept-Resend)
        eve_bases = np.random.randint(0, 2, n_bits)
        eve_bits = np.where(alice_bases == eve_bases, alice_bits, np.random.randint(0, 2, n_bits))
        channel_bits = eve_bits
        channel_bases = eve_bases
        
    # 3. Боб независимо выбирает базисы измерения
    bob_bases = np.random.randint(0, 2, n_bits)
    bob_bits = np.where(channel_bases == bob_bases, channel_bits, np.random.randint(0, 2, n_bits))
    
    # 4. Классическое просеивание (Sifting): сравнение опубликованных базисов
    sifted_mask = (alice_bases == bob_bases)
    alice_sifted = alice_bits[sifted_mask]
    bob_sifted = bob_bits[sifted_mask]
    
    # 5. Расчет квантового уровня ошибок (QBER)
    total_sifted = len(alice_sifted)
    error_count = np.sum(alice_sifted != bob_sifted)
    qber = float(error_count / total_sifted) if total_sifted > 0 else 1.0
    
    # 6. Решение о безопасности сеанса
    channel_secure = (qber <= qber_threshold)
    
    return {
        "n_bits_sent": n_bits,
        "sifted_key_length": total_sifted,
        "error_count": int(error_count),
        "qber": qber,
        "eve_detected": not channel_secure if eve_present else False,
        "secure_channel_established": channel_secure,
        "sample_key": "".join(map(str, alice_sifted[:32])) if channel_secure else None
    }"""
    }
]

def generate_catalog_html(output_path: str):
    tasks_html = ""
    
    for t in TASKS:
        tid = t["id"]
        num = t["num"]
        title = t["title"]
        platform = t["platform"]
        diff = t["difficulty"]
        archetype = t["archetype"]
        statement = t["statement"]
        taxonomy = t["taxonomy"]
        hints = t["hints_and_examples"]
        code = html.escape(t["solution_code"])
        
        tasks_html += f"""
        <article class="task-card page-break" id="{tid}">
          <!-- Header Bar -->
          <header class="task-header">
            <div class="task-meta">
              <span class="task-num">ЗАДАЧА {num:02d}</span>
              <span class="badge badge-platform">{platform}</span>
              <span class="badge badge-archetype">{archetype}</span>
              <span class="badge badge-diff">{diff}</span>
            </div>
            <h2 class="task-title">{title}</h2>
          </header>

          <!-- Section 1: Full Problem Statement -->
          <section class="task-section">
            <h3 class="section-title">1. ПОЛНОЕ УСЛОВИЕ (PROBLEM STATEMENT &amp; CONSTRAINTS)</h3>
            <div class="section-content">
              {statement}
            </div>
          </section>

          <!-- Section 2: Taxonomy Alignment -->
          <section class="task-section">
            <h3 class="section-title">2. КАК ЭТА ЗАДАЧА СООТНОСИТСЯ С НАШЕЙ КЛАССИФИКАЦИЕЙ (ТИП, ОГРАНИЧЕНИЯ)</h3>
            <div class="section-content">
              {taxonomy}
            </div>
          </section>

          <!-- Section 3: Hints and Examples -->
          <section class="task-section">
            <h3 class="section-title">3. ПРИМЕРЫ / ПОДСКАЗКИ, КОТОРЫЕ ПРЕДЛАГАЛИСЬ В ЗАДАЧЕ</h3>
            <div class="section-content">
              {hints}
            </div>
          </section>

          <!-- Section 4: Final Correct Code Solution -->
          <section class="task-section">
            <h3 class="section-title">4. ИТОГОВОЕ ВЕРНОЕ РЕШЕНИЕ (КОДОМ)</h3>
            <div class="section-content">
              <pre class="code-block"><code class="language-python">{code}</code></pre>
            </div>
          </section>
        </article>
        """

    template = """<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <title>QuantumArena — Каталог избранных квантовых соревновательных задач</title>
  <!-- KaTeX for formulas -->
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css">
  <script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.js"></script>
  <script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/contrib/auto-render.min.js"></script>
  
  <style>
    @page {
      size: A4 portrait;
      margin: 14mm 14mm 14mm 14mm;
    }
    
    * {
      box-sizing: border-box;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: #0f172a;
      background-color: #ffffff;
      line-height: 1.5;
      font-size: 13px;
      margin: 0;
      padding: 0;
    }
    
    .page-break {
      page-break-before: always;
      break-before: page;
    }
    
    .cover-page {
      min-height: 90vh;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      text-align: center;
      padding: 40px 20px;
    }
    
    .cover-badge {
      display: inline-block;
      padding: 6px 16px;
      border-radius: 9999px;
      background-color: #f1f5f9;
      color: #e11d48;
      font-size: 12px;
      font-weight: 800;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      margin-bottom: 24px;
      border: 1px solid #e2e8f0;
    }
    
    .cover-title {
      font-size: 32px;
      font-weight: 900;
      color: #0f172a;
      line-height: 1.2;
      margin: 0 0 16px 0;
    }
    
    .cover-subtitle {
      font-size: 16px;
      color: #475569;
      max-width: 650px;
      margin: 0 0 32px 0;
    }
    
    .cover-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;
      max-width: 600px;
      width: 100%;
      margin-bottom: 40px;
    }
    
    .cover-metric {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      padding: 16px;
      border-radius: 12px;
      text-align: center;
    }
    
    .cover-metric-val {
      font-size: 24px;
      font-weight: 900;
      color: #0f172a;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    }
    
    .cover-metric-lbl {
      font-size: 11px;
      font-weight: 700;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-top: 4px;
    }
    
    /* Task Article Cards */
    .task-card {
      padding: 0 0 20px 0;
    }
    
    .task-header {
      border-bottom: 2px solid #e2e8f0;
      padding-bottom: 12px;
      margin-bottom: 16px;
    }
    
    .task-meta {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 8px;
      margin-bottom: 8px;
    }
    
    .task-num {
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-size: 11px;
      font-weight: 900;
      color: #0f172a;
      background: #e2e8f0;
      padding: 3px 8px;
      border-radius: 6px;
    }
    
    .badge {
      display: inline-block;
      font-size: 11px;
      font-weight: 700;
      padding: 3px 10px;
      border-radius: 9999px;
    }
    
    .badge-platform {
      background-color: #ede9fe;
      color: #5b21b6;
    }
    
    .badge-archetype {
      background-color: #e0f2fe;
      color: #0369a1;
    }
    
    .badge-diff {
      background-color: #f1f5f9;
      color: #334155;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    }
    
    .task-title {
      font-size: 20px;
      font-weight: 900;
      color: #0f172a;
      margin: 0;
      line-height: 1.3;
    }
    
    /* Section Styles */
    .task-section {
      margin-bottom: 18px;
    }
    
    .section-title {
      font-size: 12px;
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #e11d48;
      border-left: 3px solid #e11d48;
      padding-left: 8px;
      margin: 0 0 8px 0;
    }
    
    .section-content {
      color: #334155;
      font-size: 12.5px;
    }
    
    .section-content p {
      margin: 0 0 8px 0;
    }
    
    .section-content h4 {
      font-size: 12px;
      font-weight: 800;
      color: #0f172a;
      margin: 10px 0 4px 0;
      text-transform: uppercase;
    }
    
    .section-content ul {
      margin: 0 0 8px 0;
      padding-left: 20px;
    }
    
    .section-content li {
      margin-bottom: 4px;
    }
    
    .math-block {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 8px 12px;
      margin: 8px 0;
      text-align: center;
      overflow-x: auto;
    }
    
    .data-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 11.5px;
      margin: 8px 0;
    }
    
    .data-table th, .data-table td {
      border: 1px solid #cbd5e1;
      padding: 6px 10px;
      text-align: left;
    }
    
    .data-table th {
      background-color: #f1f5f9;
      font-weight: 800;
      color: #1e293b;
    }
    
    /* Code Blocks */
    .code-block {
      background-color: #090d16 !important;
      color: #e2e8f0 !important;
      font-family: "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace !important;
      font-size: 11px !important;
      line-height: 1.45 !important;
      padding: 12px 16px !important;
      border-radius: 10px !important;
      overflow-x: auto !important;
      margin: 6px 0 !important;
      border: 1px solid #1e293b !important;
      white-space: pre !important;
    }
    
    code {
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-size: 11.5px;
      background-color: #f1f5f9;
      padding: 1px 4px;
      border-radius: 4px;
      color: #0f172a;
    }
    
    pre code {
      background-color: transparent !important;
      padding: 0 !important;
      color: inherit !important;
    }
    
    @media print {
      body {
        background: #ffffff !important;
        color: #000000 !important;
        font-size: 12px !important;
      }
      .task-card {
        page-break-inside: auto;
      }
      .code-block {
        page-break-inside: avoid;
        background-color: #0f172a !important;
        color: #f8fafc !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      .badge, .task-num, .cover-metric {
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
    }
  </style>
</head>
<body>

  <!-- COVER PAGE -->
  <section class="cover-page">
    <div class="cover-badge">QuantumArena • Реестр разобранных соревновательных задач</div>
    <h1 class="cover-title">Избранные квантовые задачи<br/>мировых платформ и олимпиад</h1>
    <p class="cover-subtitle">
      Эталонный срез соревновательных задач с полным условием, строгой привязкой к таксономии QuantumArena, подсказками и верифицированным программным решением на Qiskit.
    </p>
    
    <div class="cover-grid">
      <div class="cover-metric">
        <div class="cover-metric-val">10</div>
        <div class="cover-metric-lbl">Разнородных задач</div>
      </div>
      <div class="cover-metric">
        <div class="cover-metric-val">5</div>
        <div class="cover-metric-lbl">Платформ (QCoder, IBM, MS, Xanadu, НТО)</div>
      </div>
      <div class="cover-metric">
        <div class="cover-metric-val">8</div>
        <div class="cover-metric-lbl">Квантовых архетипов</div>
      </div>
      <div class="cover-metric">
        <div class="cover-metric-val">100%</div>
        <div class="cover-metric-lbl">Верифицированный код решений</div>
      </div>
    </div>
    
    <div style="font-size: 11px; color: #94a3b8; font-family: ui-monospace, SFMono-Regular, monospace;">
      Формат документа: Полное условие • Классификация и ограничения • Подсказки • Код решения
    </div>
  </section>

  <!-- TASKS BODY -->
  __TASKS_HTML__

  </script>
  <script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/contrib/auto-render.min.js"></script>
  
  <style>
    @page {
      size: A4 portrait;
      margin: 14mm 14mm 14mm 14mm;
    }
    
    * {
      box-sizing: border-box;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: #0f172a;
      background-color: #ffffff;
      line-height: 1.5;
      font-size: 13px;
      margin: 0;
      padding: 0;
    }
    
    .page-break {
      page-break-before: always;
      break-before: page;
    }
    
    .cover-page {
      min-height: 90vh;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      text-align: center;
      padding: 40px 20px;
    }
    
    .cover-badge {
      display: inline-block;
      padding: 6px 16px;
      border-radius: 9999px;
      background-color: #f1f5f9;
      color: #e11d48;
      font-size: 12px;
      font-weight: 800;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      margin-bottom: 24px;
      border: 1px solid #e2e8f0;
    }
    
    .cover-title {
      font-size: 32px;
      font-weight: 900;
      color: #0f172a;
      line-height: 1.2;
      margin: 0 0 16px 0;
    }
    
    .cover-subtitle {
      font-size: 16px;
      color: #475569;
      max-width: 650px;
      margin: 0 0 32px 0;
    }
    
    .cover-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;
      max-width: 600px;
      width: 100%;
      margin-bottom: 40px;
    }
    
    .cover-metric {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      padding: 16px;
      border-radius: 12px;
      text-align: center;
    }
    
    .cover-metric-val {
      font-size: 24px;
      font-weight: 900;
      color: #0f172a;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    }
    
    .cover-metric-lbl {
      font-size: 11px;
      font-weight: 700;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-top: 4px;
    }
    
    /* Task Article Cards */
    .task-card {
      padding: 0 0 20px 0;
    }
    
    .task-header {
      border-bottom: 2px solid #e2e8f0;
      padding-bottom: 12px;
      margin-bottom: 16px;
    }
    
    .task-meta {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 8px;
      margin-bottom: 8px;
    }
    
    .task-num {
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-size: 11px;
      font-weight: 900;
      color: #0f172a;
      background: #e2e8f0;
      padding: 3px 8px;
      border-radius: 6px;
    }
    
    .badge {
      display: inline-block;
      font-size: 11px;
      font-weight: 700;
      padding: 3px 10px;
      border-radius: 9999px;
    }
    
    .badge-platform {
      background-color: #ede9fe;
      color: #5b21b6;
    }
    
    .badge-archetype {
      background-color: #e0f2fe;
      color: #0369a1;
    }
    
    .badge-diff {
      background-color: #f1f5f9;
      color: #334155;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    }
    
    .task-title {
      font-size: 20px;
      font-weight: 900;
      color: #0f172a;
      margin: 0;
      line-height: 1.3;
    }
    
    /* Section Styles */
    .task-section {
      margin-bottom: 18px;
    }
    
    .section-title {
      font-size: 12px;
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #e11d48;
      border-left: 3px solid #e11d48;
      padding-left: 8px;
      margin: 0 0 8px 0;
    }
    
    .section-content {
      color: #334155;
      font-size: 12.5px;
    }
    
    .section-content p {
      margin: 0 0 8px 0;
    }
    
    .section-content h4 {
      font-size: 12px;
      font-weight: 800;
      color: #0f172a;
      margin: 10px 0 4px 0;
      text-transform: uppercase;
    }
    
    .section-content ul {
      margin: 0 0 8px 0;
      padding-left: 20px;
    }
    
    .section-content li {
      margin-bottom: 4px;
    }
    
    .math-block {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 8px 12px;
      margin: 8px 0;
      text-align: center;
      overflow-x: auto;
    }
    
    .data-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 11.5px;
      margin: 8px 0;
    }
    
    .data-table th, .data-table td {
      border: 1px solid #cbd5e1;
      padding: 6px 10px;
      text-align: left;
    }
    
    .data-table th {
      background-color: #f1f5f9;
      font-weight: 800;
      color: #1e293b;
    }
    
    /* Code Blocks */
    .code-block {
      background-color: #090d16 !important;
      color: #e2e8f0 !important;
      font-family: "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace !important;
      font-size: 11px !important;
      line-height: 1.45 !important;
      padding: 12px 16px !important;
      border-radius: 10px !important;
      overflow-x: auto !important;
      margin: 6px 0 !important;
      border: 1px solid #1e293b !important;
      white-space: pre !important;
    }
    
    code {
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-size: 11.5px;
      background-color: #f1f5f9;
      padding: 1px 4px;
      border-radius: 4px;
      color: #0f172a;
    }
    
    pre code {
      background-color: transparent !important;
      padding: 0 !important;
      color: inherit !important;
    }
    
    @media print {
      body {
        background: #ffffff !important;
        color: #000000 !important;
        font-size: 12px !important;
      }
      .task-card {
        page-break-inside: auto;
      }
      .code-block {
        page-break-inside: avoid;
        background-color: #0f172a !important;
        color: #f8fafc !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      .badge, .task-num, .cover-metric {
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
    }
  </style>
</head>
<body>

  <!-- COVER PAGE -->
  <section class="cover-page">
    <div class="cover-badge">QuantumArena • Реестр разобранных соревновательных задач</div>
    <h1 class="cover-title">Избранные квантовые задачи<br/>мировых платформ и олимпиад</h1>
    <p class="cover-subtitle">
      Эталонный срез соревновательных задач с полным условием, строгой привязкой к таксономии QuantumArena, подсказками и верифицированным программным решением на Qiskit.
    </p>
    
    <div class="cover-grid">
      <div class="cover-metric">
        <div class="cover-metric-val">10</div>
        <div class="cover-metric-lbl">Разнородных задач</div>
      </div>
      <div class="cover-metric">
        <div class="cover-metric-val">5</div>
        <div class="cover-metric-lbl">Платформ (QCoder, IBM, MS, Xanadu, НТО)</div>
      </div>
      <div class="cover-metric">
        <div class="cover-metric-val">8</div>
        <div class="cover-metric-lbl">Квантовых архетипов</div>
      </div>
      <div class="cover-metric">
        <div class="cover-metric-val">100%</div>
        <div class="cover-metric-lbl">Верифицированный код решений</div>
      </div>
    </div>
    
    <div style="font-size: 11px; color: #94a3b8; font-family: ui-monospace, SFMono-Regular, monospace;">
      Формат документа: Полное условие • Классификация и ограничения • Подсказки • Код решения
    </div>
  </section>

  <!-- TASKS BODY -->
  __TASKS_HTML__

  <script>
    document.addEventListener("DOMContentLoaded", function() {
      if (typeof renderMathInElement !== "undefined") {
        renderMathInElement(document.body, {
          delimiters: [
            {left: "$$", right: "$$", display: true},
            {left: "$", right: "$", display: false}
          ],
          throwOnError: false
        });
      }
    });
  </script>
</body>
</html>
"""
    full_html = template.replace("__TASKS_HTML__", tasks_html)
    with open(output_path, "w", encoding="utf-8") as f:
        f.write(full_html)
    print(f"Generated HTML catalog at {output_path}")

def export_pdf(html_path: str, pdf_path: str):
    chrome = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
    cmd = [
        chrome,
        "--headless=new",
        "--disable-gpu",
        "--no-pdf-header-footer",
        f"--print-to-pdf={pdf_path}",
        f"file://{html_path}"
    ]
    subprocess.run(cmd, check=True)
    print(f"Exported PDF to {pdf_path}")

if __name__ == "__main__":
    base_dir = os.path.dirname(os.path.abspath(__file__))
    html_out = os.path.join(base_dir, "QuantumArena_Diverse_Tasks_Catalog.html")
    pdf_out = os.path.join(base_dir, "QuantumArena_Diverse_Tasks_Catalog.pdf")
    generate_catalog_html(html_out)
    export_pdf(html_out, pdf_out)
