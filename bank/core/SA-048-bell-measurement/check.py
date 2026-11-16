import math

import numpy as np
from qiskit import QuantumCircuit


def verify(solve, task, kit):
    qc = solve()
    ok, msg = kit.check_limits(qc, task, {})
    if not ok:
        return False, msg
    cases = {  # состояние: (вектор по индексам q1q0, ожидаемые биты c1c0)
        "Phi+": ({"00": 1, "11": 1}, "00"), "Phi-": ({"00": 1, "11": -1}, "01"),
        "Psi+": ({"01": 1, "10": 1}, "10"), "Psi-": ({"01": 1, "10": -1}, "11"),
    }
    for name, (amps, want) in cases.items():
        psi0 = kit.ket(2, amps) / math.sqrt(2)
        if kit.distribution(qc, psi0).get(want, 0.0) < 0.999:
            return False, f"{name} распознано неверно"
    return True, ""


def prepare_order():
    qc = QuantumCircuit(2, 2)
    qc.h(0)
    qc.cx(0, 1)
    qc.measure([0, 1], [0, 1])
    return qc


WRONG = {"H, затем CX (схема подготовки)": prepare_order}
