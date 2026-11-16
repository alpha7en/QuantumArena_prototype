import numpy as np
from qiskit import QuantumCircuit

GRID = [{}]


def spec():
    W = np.zeros((8, 4), dtype=complex)
    for a in (0, 1):
        for b in (0, 1):
            W[a | (b << 1) | (int(a == b) << 2), a | (b << 1)] = 1
    return W, 2, 3


def not_equal():
    qc = QuantumCircuit(3)
    qc.cx(0, 2)
    qc.cx(1, 2)
    return qc


def spoiled_input():
    qc = QuantumCircuit(3)
    qc.cx(0, 1)
    qc.cx(1, 2)
    qc.x(2)
    return qc


WRONG = {"признак неравенства": not_equal, "сумма записана во входной кубит": spoiled_input}
