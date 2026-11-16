import numpy as np
from qiskit import QuantumCircuit


def verify(solve, task, kit):
    qc = solve()
    ok, msg = kit.check_limits(qc, task, {})
    if not ok:
        return False, msg
    rng = np.random.default_rng(82)
    inputs = [np.array([1, 0]), np.array([0, 1]), np.array([1, 1]) / np.sqrt(2), np.array([1, -1j]) / np.sqrt(2)]
    inputs += [kit.random_state(1, rng) for _ in range(6)]
    for psi in inputs:
        for p, out, _ in kit.run_dynamic(qc, kit.embed(psi, 1, 2)):
            if kit.reduced_fidelity(out, [1], psi, 2) < 1 - 1e-6:
                return False, "в одной из ветвей кубит q1 не в исходном состоянии"
    return True, ""


def z_basis():
    qc = QuantumCircuit(2, 1)
    qc.cx(0, 1)
    qc.measure(0, 0)
    with qc.if_test((qc.clbits[0], 1)):
        qc.z(1)
    return qc


def no_correction():
    qc = QuantumCircuit(2, 1)
    qc.cx(0, 1)
    qc.h(0)
    qc.measure(0, 0)
    return qc


def two_cx():
    qc = QuantumCircuit(2, 1)
    qc.cx(0, 1)
    qc.cx(1, 0)
    return qc


def x_correction():
    qc = QuantumCircuit(2, 1)
    qc.cx(0, 1)
    qc.h(0)
    qc.measure(0, 0)
    with qc.if_test((qc.clbits[0], 1)):
        qc.x(1)
    return qc


WRONG = {"измерение без H": z_basis, "нет условного Z": no_correction, "два CX без измерения": two_cx,
         "поправка X вместо Z": x_correction}
