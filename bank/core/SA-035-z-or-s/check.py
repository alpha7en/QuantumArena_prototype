import numpy as np
from qiskit import QuantumCircuit


def verify(solve, task, kit):
    for name, U, want in (("Z", np.diag([1, -1]), "0"), ("S", np.diag([1, 1j]), "1")):
        qc = solve(kit.as_gate(U))
        ok, msg = kit.check_limits(qc, task, {})
        if not ok:
            return False, msg
        p = kit.distribution(qc).get(want, 0.0)
        if p < 0.999:
            return False, f"гейт {name}: вероятность верного ответа {p:.3f}"
    return True, ""


def one_call(oracle):
    qc = QuantumCircuit(1, 1)
    qc.h(0)
    qc.append(oracle, [0])
    qc.h(0)
    qc.x(0)
    qc.measure(0, 0)
    return qc


WRONG = {"один вызов оракула": one_call}
