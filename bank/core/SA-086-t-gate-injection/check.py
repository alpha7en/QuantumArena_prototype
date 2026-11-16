import cmath
import math

import numpy as np
from qiskit import QuantumCircuit


def verify(solve, task, kit):
    qc = solve()
    ok, msg = kit.check_limits(qc, task, {})
    if not ok:
        return False, msg
    for name, qs in kit.metrics(qc)["ops"]:
        if name in ("t", "h") and qs != [1]:
            return False, f"гейт {name} разрешён только на кубите q1"
    T = np.diag([1, cmath.exp(1j * math.pi / 4)])
    rng = np.random.default_rng(86)
    inputs = [np.array([1, 0]), np.array([0, 1]), np.array([1, 1]) / math.sqrt(2), np.array([1, -1j]) / math.sqrt(2)]
    inputs += [kit.random_state(1, rng) for _ in range(6)]
    for psi in inputs:
        for p, out, _ in kit.run_dynamic(qc, kit.embed(psi, 1, 2)):
            if kit.reduced_fidelity(out, [0], T @ psi, 2) < 1 - 1e-6:
                return False, "в одной из ветвей кубит q0 не в состоянии T|psi>"
    return True, ""


def x_basis_variant():
    qc = QuantumCircuit(2, 1)
    qc.cx(0, 1)
    qc.t(1)
    qc.h(1)
    qc.measure(1, 0)
    with qc.if_test((qc.clbits[0], 1)):
        qc.z(0)
    return qc


def no_correction():
    qc = QuantumCircuit(2, 1)
    qc.h(1)
    qc.t(1)
    qc.cx(0, 1)
    qc.measure(1, 0)
    return qc


def z_correction():
    qc = QuantumCircuit(2, 1)
    qc.h(1)
    qc.t(1)
    qc.cx(0, 1)
    qc.measure(1, 0)
    with qc.if_test((qc.clbits[0], 1)):
        qc.z(0)
    return qc


def direct_t():
    qc = QuantumCircuit(2, 1)
    qc.t(0)
    return qc


def compute_uncompute():
    qc = QuantumCircuit(2, 1)
    qc.cx(0, 1)
    qc.t(1)
    qc.cx(0, 1)
    return qc


WRONG = {"нет условной поправки": no_correction, "поправка Z вместо S": z_correction, "T прямо на данных": direct_t,
         "два CX без измерения": compute_uncompute}
