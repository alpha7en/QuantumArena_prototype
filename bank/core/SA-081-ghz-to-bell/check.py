import math

import numpy as np
from qiskit import QuantumCircuit


def verify(solve, task, kit):
    qc = solve()
    ok, msg = kit.check_limits(qc, task, {})
    if not ok:
        return False, msg
    m = kit.metrics(qc)
    if "reset" in m["names"]:
        return False, "инструкция reset недоступна"
    if any(name == "measure" and qs != [2] for name, qs in m["ops"]):
        return False, "измеряется только кубит q2"
    ghz = kit.ket(3, {"000": 1, "111": 1}) / math.sqrt(2)
    bell = np.array([1, 0, 0, 1]) / math.sqrt(2)
    for p, out, _ in kit.run_dynamic(qc, ghz):
        if kit.reduced_fidelity(out, [0, 1], bell, 3) < 1 - 1e-6:
            return False, "в одной из ветвей кубиты q0 и q1 не в состоянии Белла"
    return True, ""


def z_basis():
    qc = QuantumCircuit(3, 1)
    qc.measure(2, 0)
    with qc.if_test((qc.clbits[0], 1)):
        qc.z(0)
    return qc


def no_correction():
    qc = QuantumCircuit(3, 1)
    qc.h(2)
    qc.measure(2, 0)
    return qc


def x_correction():
    qc = QuantumCircuit(3, 1)
    qc.h(2)
    qc.measure(2, 0)
    with qc.if_test((qc.clbits[0], 1)):
        qc.x(0)
    return qc


WRONG = {"измерение в базисе Z": z_basis, "нет поправки": no_correction, "поправка X вместо Z": x_correction}
