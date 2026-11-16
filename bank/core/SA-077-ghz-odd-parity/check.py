import math

import numpy as np
from qiskit import QuantumCircuit


def verify(solve, task, kit):
    qc = solve()
    ok, msg = kit.check_limits(qc, task, {})
    if not ok:
        return False, msg
    if qc.num_clbits != 3:
        return False, "нужно три классических бита"
    measured = sorted(qs[0] for name, qs in kit.metrics(qc)["ops"] if name == "measure")
    if measured != [0, 1, 2]:
        return False, "каждый кубит измеряется ровно один раз"
    ghz = kit.ket(3, {"000": 1, "111": 1}) / math.sqrt(2)
    odd = sum(p for key, p in kit.distribution(qc, ghz).items() if key.count("1") % 2 == 1)
    if odd < 0.999:
        return False, f"вероятность нечётной суммы {odd:.3f}"
    return True, ""


def xy_strategy():
    qc = QuantumCircuit(3, 3)
    qc.h(0)
    qc.sdg(1); qc.h(1)
    qc.sdg(2); qc.h(2)
    qc.measure([0, 1, 2], [0, 1, 2])
    return qc


def all_x():
    qc = QuantumCircuit(3, 3)
    qc.h(0); qc.h(1); qc.h(2)
    qc.measure([0, 1, 2], [0, 1, 2])
    return qc


def x_then_z_basis():
    qc = QuantumCircuit(3, 3)
    qc.x(0)
    qc.measure([0, 1, 2], [0, 1, 2])
    return qc


def one_y():
    qc = QuantumCircuit(3, 3)
    qc.h(0); qc.h(1)
    qc.sdg(2); qc.h(2)
    qc.measure([0, 1, 2], [0, 1, 2])
    return qc


WRONG = {"H на всех: сумма чётна": all_x, "X и измерение в базисе Z": x_then_z_basis, "базис Y у одного участника": one_y}
