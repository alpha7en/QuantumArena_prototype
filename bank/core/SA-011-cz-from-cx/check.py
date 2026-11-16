import numpy as np
from qiskit import QuantumCircuit

import sakit

GRID = [{}]


def spec():
    return sakit.op(np.diag([1, 1, 1, -1]))


def just_cx():
    qc = QuantumCircuit(2)
    qc.cx(0, 1)
    return qc


WRONG = {"CX без сопряжения": just_cx}
