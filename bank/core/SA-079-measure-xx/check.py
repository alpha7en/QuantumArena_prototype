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
    XX = kit.kron(kit.X, kit.X)
    rng = np.random.default_rng(79)
    s = 1 / math.sqrt(2)
    inputs = [kit.ket(2, {"00": s, "11": s}), kit.ket(2, {"01": s, "10": -s}), kit.ket(2, {"00": 1}),
              kit.ket(2, {"00": 0.5, "01": -0.5, "10": 0.5, "11": -0.5})]
    inputs += [kit.random_state(2, rng) for _ in range(8)]
    for psi0 in inputs:
        want = (1 - np.vdot(psi0, XX @ psi0).real) / 2
        got = kit.distribution(qc, psi0).get("1", 0.0)
        if abs(got - want) > 1e-6:
            return False, f"P(1) = {got:.4f}, ожидалось {want:.4f}"
    return True, ""


def zz_parity():
    qc = QuantumCircuit(2, 1)
    qc.cx(0, 1)
    qc.measure(1, 0)
    return qc


def single_x():
    qc = QuantumCircuit(2, 1)
    qc.h(0)
    qc.measure(0, 0)
    return qc


def h_on_one():
    qc = QuantumCircuit(2, 1)
    qc.h(0)
    qc.cx(0, 1)
    qc.measure(1, 0)
    return qc


WRONG = {"чётность без H: ZZ": zz_parity, "измерение X одного кубита": single_x, "H только на одном кубите": h_on_one}
