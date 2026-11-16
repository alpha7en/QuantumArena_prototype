import numpy as np
from qiskit import QuantumCircuit

import sakit

GRID = [{}]
P0, P1 = np.diag([1, 0]), np.diag([0, 1])


def spec():
    return sakit.op(sakit.kron(P0, sakit.I2) + sakit.kron(P1, sakit.Y))


def swapped_s():
    qc = QuantumCircuit(2)
    qc.s(1)
    qc.cx(0, 1)
    qc.sdg(1)
    return qc


def just_cx():
    qc = QuantumCircuit(2)
    qc.cx(0, 1)
    return qc


WRONG = {"S и S† переставлены: управляемый -Y": swapped_s, "CX без сопряжения": just_cx}
