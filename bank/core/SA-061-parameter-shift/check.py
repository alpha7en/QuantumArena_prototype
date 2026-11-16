import math

import numpy as np
from qiskit import QuantumCircuit


def verify(solve, task, kit):
    rng = np.random.default_rng(12)
    budget = task["budget"]
    for theta in (0.3, 0.8, 1.2, 2.0, 2.6, -0.7):
        state = {"runs": 0, "error": ""}

        def expval(qc):
            state["runs"] += 1
            ok, msg = kit.check_limits(qc, task, {})
            if not ok or qc.num_qubits != 2:
                state["error"] = msg or "нужна схема на двух кубитах"
                return 0.0
            (_, psi, _), = kit.run_dynamic(qc)
            probs = np.abs(psi) ** 2
            p0 = probs[0] + probs[1]                      # кубит 1 равен 0
            return 2 * rng.binomial(budget["shots"], min(1.0, p0)) / budget["shots"] - 1

        got = solve(theta, expval)
        if state["error"]:
            return False, state["error"]
        if state["runs"] > budget["runs"]:
            return False, f"вызовов expval: {state['runs']}"
        if abs(got - (-math.sin(2 * theta))) > budget["tolerance"]:
            return False, f"theta={theta}: получено {got:.3f}, верно {-math.sin(2 * theta):.3f}"
    return True, ""


def _ansatz(a, b):
    qc = QuantumCircuit(2)
    qc.ry(a, 0)
    qc.cx(0, 1)
    qc.ry(b, 1)
    return qc


def both_shifted(theta, expval):
    s = math.pi / 2
    return (expval(_ansatz(theta + s, theta + s)) - expval(_ansatz(theta - s, theta - s))) / 2


def finite_difference(theta, expval):
    h = 0.05
    return (expval(_ansatz(theta + h, theta + h)) - expval(_ansatz(theta - h, theta - h))) / (2 * h)


WRONG = {"оба угла сдвинуты одновременно": both_shifted, "конечная разность с шагом 0,05": finite_difference}
