import numpy as np
from qiskit import QuantumCircuit

import sakit

GRID = [{}]


def spec():
    return sakit.op(np.diag([1, 1, 1, 1j]))


def two_t():
    qc = QuantumCircuit(2)
    qc.t(0)
    qc.t(1)
    return qc


WRONG = {"T на каждом кубите без слагаемого чётности": two_t}
