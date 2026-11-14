import numpy as np
from qiskit import QuantumCircuit

import sakit

GRID = [{}]


def spec():
    return sakit.op(np.array([[0, 1], [-1, 0]]))


def reversed_order():
    qc = QuantumCircuit(1)
    qc.z(0)
    qc.x(0)
    return qc


WRONG = {"Z, затем X (матрица с обратным знаком)": reversed_order}
