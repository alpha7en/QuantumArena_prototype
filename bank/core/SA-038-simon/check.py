import numpy as np
from qiskit import QuantumCircuit


def simon_oracle(n, s):
    """f(x) = x xor (x_j * s), j — младшая единица s: f(x) = f(x xor s)."""
    qc = QuantumCircuit(2 * n)
    for i in range(n):
        qc.cx(i, n + i)
    j = (s & -s).bit_length() - 1
    for i in range(n):
        if (s >> i) & 1:
            qc.cx(j, n + i)
    return qc


def verify(solve, task, kit):
    rng = np.random.default_rng(5)
    for n, s in ((2, 3), (3, 0b101), (3, 0b100), (4, 0b0110), (5, 0b10011)):
        oracle = kit.as_gate(simon_oracle(n, s))
        state = {"runs": 0, "error": ""}

        def run(qc):
            state["runs"] += 1
            ok, msg = kit.check_limits(qc, task, {"n": n})
            if not ok:
                state["error"] = msg
                return 0
            dist = kit.distribution(qc)
            keys = sorted(dist)
            return int(rng.choice(keys, p=np.array([dist[k] for k in keys]) / sum(dist.values())), 2)

        answer = solve(n, oracle, run)
        if state["error"]:
            return False, state["error"]
        if state["runs"] > kit.evaluate(task["budget"]["runs"], {"n": n}):
            return False, f"запусков: {state['runs']}"
        if answer != s:
            return False, f"n={n}: ответ {answer}, верно {s}"
    return True, ""


def first_sample(n, oracle, run):
    qc = QuantumCircuit(2 * n, n)
    qc.h(range(n))
    qc.append(oracle, range(2 * n))
    qc.h(range(n))
    qc.measure(range(n), range(n))
    return run(qc)


WRONG = {"вернуть первый измеренный y": first_sample}
