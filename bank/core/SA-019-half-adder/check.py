import numpy as np
from qiskit import QuantumCircuit

GRID = [{}]


def spec():
    W = np.zeros((8, 4), dtype=complex)
    for a in (0, 1):
        for b in (0, 1):
            W[a | ((a ^ b) << 1) | ((a & b) << 2), a | (b << 1)] = 1
    return W, 2, 3


def reversed_order():
    qc = QuantumCircuit(3)
    qc.cx(0, 1)
    qc.ccx(0, 1, 2)
    return qc


WRONG = {"сумма раньше переноса": reversed_order}
