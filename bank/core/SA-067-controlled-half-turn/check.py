import numpy as np
from qiskit import QuantumCircuit

import sakit

GRID = [{}]
P0, P1 = np.diag([1, 0]), np.diag([0, 1])


def spec():
    return sakit.op(sakit.kron(P0, sakit.I2) + sakit.kron(P1, -1j * sakit.X))


def just_cx():
    qc = QuantumCircuit(2)
    qc.cx(0, 1)
    return qc


def s_instead():
    qc = QuantumCircuit(2)
    qc.cx(0, 1)
    qc.s(0)
    return qc


def phase_on_target():
    qc = QuantumCircuit(2)
    qc.cx(0, 1)
    qc.sdg(1)
    return qc


WRONG = {"CX без фазы": just_cx, "S вместо S†": s_instead, "фаза на целевом кубите": phase_on_target}
