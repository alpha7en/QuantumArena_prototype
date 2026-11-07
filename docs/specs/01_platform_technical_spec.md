# Техническое задание (ТЗ) на разработку MVP платформы «QuantumArena»
## Специализация: Квантовые алгоритмы и синтез схем (Quantum Circuit & Algorithm Arena)

## 1. Общие сведения и назначение системы

* **Наименование системы:** Платформа квантового спортивного программирования и алгоритмический тренажер синтеза квантовых схем «QuantumArena» (по модели QCoder и Microsoft Quantum Katas).
* **Ключевой фокус продукта:** Решение строгих квантовых алгоритмических задач:
  1. **Синтез квантовых состояний (State Preparation):** $W$-состояния, Dicke states, GHZ, равномерные суперпозиции;
  2. **Синтез обратимых оракулов (Oracle Synthesis):** Построение квантовых схем для классических функций $f(x)$ с обязательной очисткой анцилл (**Uncomputation**);
  3. **Работа с закрытыми оракулами (Black-box Quantum Algorithms):** Алгоритмы Дойча-Йожи, Бернштейна-Вазирани, Гровера, Саймона, Phase Estimation;
  4. **Оптимизация схем (Circuit Synthesis & KAK):** Трансляция под топологические ограничения линейных/решеточных процессоров с минимизацией двухкубитных гейтов;
  5. **Квантовая арифметика:** Сумматоры, циклические сдвиги, модульная арифметика.

---

## 2. Архитектура и двухуровневый рантайм

```mermaid
graph TD
    subgraph Client_Layer["1. Клиентский уровень (Frontend & Browser Engine)"]
        NextJS["Next.js 14 Web Portal (React / TypeScript)"]
        Monaco["Monaco Code Editor (Qiskit 2.3+ / Python 3.11)"]
        Bloch["Интерактивная 3D Сфера Блоха и Circuit Renderer"]
        PyodideWASM["Клиентский WebAssembly Рантайм (Pyodide)<br><i>Мгновенная детерминированная симуляция Statevector за 20 мс</i>"]
    end

    subgraph Core_Layer["2. Ядро платформы (API Gateway & Backend)"]
        FastAPI["FastAPI REST & WebSocket Server"]
        AuthService["OAuth2 / JWT (VK ID, GitHub, Yandex)"]
        Postgres[("PostgreSQL 16 (Пользователи, Задачи, Сабмиты, Стрики, ELO)")]
        Redis[("Redis 7 (Очереди контестов, Real-time Leaderboard)")]
    end

    subgraph Judge_Layer["3. Проверяющая система (Judge Engine)"]
        ASTGuard["AST Security Inspector (Защита от опасных импортов UME)"]
        GateValidator["Gate & Topology Inspector (Проверка UGE и связности)"]
        UncomputationCheck["Uncomputation & Ancilla Purity Validator"]
        ExactSim["Statevector & Unitary Matrix Matcher (Точность 1e-6)"]
        ZXAntiCheat["ZX-Calculus Graph Anti-Plagiarism Engine"]
    end

    NextJS & Monaco --> PyodideWASM
    NextJS & Monaco -->|POST /api/v1/submissions| FastAPI
    FastAPI --> AuthService & Postgres & Redis
    Redis --> ASTGuard --> GateValidator --> UncomputationCheck --> ExactSim --> ZXAntiCheat
```

---

## 3. Спецификация судейской системы (Judge Engine) и вердикты

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        ТАБЛИЦА ВЕРДИКТОВ СУДЕЙСКОЙ СИСТЕМЫ                             │
├────────────────────┬──────────────────────────────────┬────────────────────────────────┤
│ ВЕРДИКТ (СТАТУС)   │ РАСШИФРОВКА                      │ ПРИЧИНА ВОЗНИКНОВЕНИЯ          │
├────────────────────┼──────────────────────────────────┼────────────────────────────────┤
│ **AC (Accepted)**  │ Решение принято                  │ 100% совпадение Statevector /  │
│                    │                                  │ Unitary, анциллы очищены       │
├────────────────────┼──────────────────────────────────┼────────────────────────────────┤
│ **WA (Wrong Ans)** │ Неверный ответ                   │ Fidelity < 1.0 - 1e-6 или      │
│                    │                                  │ не очищены анциллы (Uncomp Fail│
├────────────────────┼──────────────────────────────────┼────────────────────────────────┤
│ **UGE**            │ Unauthorized Gate Error          │ Использован гейт не из базиса  │
│                    │                                  │ задачи (напр. Initialize/Unitary)│
├────────────────────┼──────────────────────────────────┼────────────────────────────────┤
│ **UME**            │ Unauthorized Module Error        │ Попытка импорта неразрешенного │
│                    │                                  │ модуля (os, sys, ctypes и т.д.)│
├────────────────────┼──────────────────────────────────┼────────────────────────────────┤
│ **GLE**            │ Gate Limit Exceeded              │ Превышен лимит на число 2Q гейтов│
├────────────────────┼──────────────────────────────────┼────────────────────────────────┤
│ **DLE**            │ Depth Limit Exceeded             │ Превышена критическая глубина  │
├────────────────────┼──────────────────────────────────┼────────────────────────────────┤
│ **TLE / MLE**      │ Time / Memory Limit Exceeded     │ Превышен лимит времени (2 сек) │
└────────────────────┴──────────────────────────────────┴────────────────────────────────┘
```

---

## 4. Схема базы данных (PostgreSQL 16)

```mermaid
erDiagram
    USERS ||--o{ USER_SOLUTIONS : "решает"
    USERS ||--o{ DAILY_STREAKS : "ведет"
    TASKS ||--o{ USER_SOLUTIONS : "имеет"
    TASKS ||--o{ TASK_TEST_CASES : "содержит"
    CONTESTS ||--o{ TASKS : "включает"
    CONTESTS ||--o{ CONTEST_PARTICIPANTS : "регистрирует"

    USERS {
        uuid id PK
        string username UK
        string email UK
        int rating_elo
        int current_streak
        int max_streak
        string github_handle
        jsonb verified_skills
        datetime created_at
    }

    TASKS {
        uuid id PK
        uuid contest_id FK "Nullable"
        string slug UK
        string title
        string difficulty "Easy | Medium | Hard"
        string archetype "StatePrep | OracleSynthesis | BlackboxAlgorithm | UnitaryDecomp | Arithmetic"
        int qubit_count
        string basis_gates
        string allowed_topology "Line | HeavyHex | AllToAll"
        int max_cnot_limit
        int max_depth_limit
        boolean require_uncomputation
        boolean is_daily_challenge
        int total_submissions
        int accepted_submissions
    }

    USER_SOLUTIONS {
        uuid id PK
        uuid user_id FK
        uuid task_id FK
        text qiskit_code
        string verdict "AC | WA | UGE | UME | GLE | DLE | TLE"
        float execution_time_ms
        int cnot_count
        int circuit_depth
        datetime submitted_at
    }

    DAILY_STREAKS {
        uuid id PK
        uuid user_id FK
        date activity_date
        int solved_count
    }
```
