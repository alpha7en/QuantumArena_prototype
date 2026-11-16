import math

import numpy as np
from qiskit import QuantumCircuit


def verify(solve, task, kit):
    qc = solve()
    ok, msg = kit.check_limits(qc, task, {})
    if not ok:
        return False, msg
    for sign, want in ((1, "0"), (-1, "1")):
        psi0 = np.array([1, sign], dtype=complex) / math.sqrt(2)
        if kit.distribution(qc, psi0).get(want, 0.0) < 0.999:
            return False, f"состояние со знаком {sign:+d} распознано неверно"
    return True, ""


def no_h():
    qc = QuantumCircuit(1, 1)
    qc.measure(0, 0)
    return qc


WRONG = {"измерение без H": no_h}
