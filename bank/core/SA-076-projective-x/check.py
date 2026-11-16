import math

import numpy as np
from qiskit import QuantumCircuit


def verify(solve, task, kit):
    qc = solve()
    ok, msg = kit.check_limits(qc, task, {})
    if not ok:
        return False, msg
    if "reset" in kit.metrics(qc)["names"]:
        return False, "инструкция reset недоступна"
    if qc.num_clbits != 1:
        return False, "нужен ровно один классический бит"
    basis = {0: np.array([1, 1]) / math.sqrt(2), 1: np.array([1, -1]) / math.sqrt(2)}
    rng = np.random.default_rng(76)
    inputs = [basis[0], basis[1], np.array([1, 0]), np.array([1, 1j]) / math.sqrt(2)]
    inputs += [kit.random_state(1, rng) for _ in range(5)]
    for psi0 in inputs:
        prob = {0: 0.0, 1: 0.0}
        for p, psi, cl in kit.run_dynamic(qc, psi0):
            prob[cl[0]] += p
            if abs(np.vdot(basis[cl[0]], psi)) ** 2 < 1 - 1e-9:
                return False, "состояние после измерения не соответствует биту"
        for c in (0, 1):
            if abs(prob[c] - abs(np.vdot(basis[c], psi0)) ** 2) > 1e-6:
                return False, "вероятности исходов не те"
    return True, ""


def no_return():
    qc = QuantumCircuit(1, 1)
    qc.h(0)
    qc.measure(0, 0)
    return qc


def z_measure():
    qc = QuantumCircuit(1, 1)
    qc.measure(0, 0)
    return qc


def both_before():
    qc = QuantumCircuit(1, 1)
    qc.h(0)
    qc.h(0)
    qc.measure(0, 0)
    return qc


def h_after_only():
    qc = QuantumCircuit(1, 1)
    qc.measure(0, 0)
    qc.h(0)
    return qc


WRONG = {"нет второго H": no_return, "измерение в базисе Z": z_measure, "оба H до измерения": both_before,
         "H только после измерения": h_after_only}
