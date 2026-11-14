import numpy as np
from qiskit import QuantumCircuit


def verify(solve, task, kit):
    qc = solve()
    ok, msg = kit.check_limits(qc, task, {})
    if not ok:
        return False, msg
    rng = np.random.default_rng(2)
    inputs = [np.array([1, 0]), np.array([0, 1]), np.array([1, 1j]) / np.sqrt(2)]
    inputs += [kit.random_state(1, rng) for _ in range(5)]
    for psi in inputs:
        for p, out, _ in kit.run_dynamic(qc, kit.embed(psi, 1, 3)):
            if kit.reduced_fidelity(out, [2], psi, 3) < 1 - 1e-6:
                return False, "в одной из ветвей кубит q2 не равен исходному состоянию"
    return True, ""


def no_z():
    qc = QuantumCircuit(3, 2)
    qc.h(1)
    qc.cx(1, 2)
    qc.cx(0, 1)
    qc.h(0)
    qc.measure(0, 0)
    qc.measure(1, 1)
    with qc.if_test((qc.clbits[1], 1)):
        qc.x(2)
    return qc


WRONG = {"без поправки Z": no_z}
