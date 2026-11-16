import numpy as np
from qiskit import QuantumCircuit


def win_probability(solve, task, kit):
    total = 0.0
    for x in (0, 1):
        for y in (0, 1):
            a_op, b_op = solve("A", x), solve("B", y)
            for part in (a_op, b_op):
                ok, msg = kit.check_limits(part, task, {})
                if not ok:
                    return None, msg
            qc = QuantumCircuit(2)
            qc.h(0)
            qc.cx(0, 1)
            qc.compose(a_op, [0], inplace=True)
            qc.compose(b_op, [1], inplace=True)
            (_, psi, _), = kit.run_dynamic(qc)
            probs = np.abs(psi) ** 2
            total += sum(probs[a + 2 * b] for a in (0, 1) for b in (0, 1) if (a ^ b) == (x & y)) / 4
    return total, ""


def verify(solve, task, kit):
    p, msg = win_probability(solve, task, kit)
    if p is None:
        return False, msg
    return (p >= 0.85), f"вероятность выигрыша {p:.4f}"


def classical(player, bit):
    return QuantumCircuit(1)


WRONG = {"без поворотов (классическая стратегия, 75 %)": classical}
