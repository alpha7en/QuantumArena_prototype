import numpy as np
from qiskit import QuantumCircuit


def verify(solve, task, kit):
    qc = solve()
    ok, msg = kit.check_limits(qc, task, {})
    if not ok:
        return False, msg
    if "reset" in kit.metrics(qc)["names"]:
        return False, "инструкция reset недоступна"
    rng = np.random.default_rng(1)
    inputs = [np.array([1, 0]), np.array([0, 1])] + [kit.random_state(1, rng) for _ in range(5)]
    for psi0 in inputs:
        for p, psi, _ in kit.run_dynamic(qc, psi0):
            if abs(psi[0]) ** 2 < 1 - 1e-9:
                return False, "в одной из ветвей кубит не в |0>"
    return True, ""


def always_x():
    qc = QuantumCircuit(1, 1)
    qc.measure(0, 0)
    qc.x(0)
    return qc


def use_reset():
    qc = QuantumCircuit(1, 1)
    qc.reset(0)
    return qc


WRONG = {"безусловный X": always_x, "инструкция reset": use_reset}
