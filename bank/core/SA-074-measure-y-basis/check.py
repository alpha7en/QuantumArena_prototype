import math

import numpy as np
from qiskit import QuantumCircuit


def verify(solve, task, kit):
    qc = solve()
    ok, msg = kit.check_limits(qc, task, {})
    if not ok:
        return False, msg
    if qc.num_clbits != 1:
        return False, "нужен ровно один классический бит"
    for name, amp, want in (("+i", 1j, "0"), ("-i", -1j, "1")):
        psi0 = np.array([1, amp]) / math.sqrt(2)
        if kit.distribution(qc, psi0).get(want, 0.0) < 0.999:
            return False, f"состояние |{name}> распознано неверно"
    return True, ""


def only_h():
    qc = QuantumCircuit(1, 1)
    qc.h(0)
    qc.measure(0, 0)
    return qc


def s_instead():
    qc = QuantumCircuit(1, 1)
    qc.s(0)
    qc.h(0)
    qc.measure(0, 0)
    return qc


def wrong_order():
    qc = QuantumCircuit(1, 1)
    qc.h(0)
    qc.sdg(0)
    qc.measure(0, 0)
    return qc


WRONG = {"только H": only_h, "S вместо S†": s_instead, "H раньше S†": wrong_order}
