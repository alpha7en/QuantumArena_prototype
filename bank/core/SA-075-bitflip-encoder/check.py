import numpy as np
from qiskit import QuantumCircuit

GRID = [{}]


def spec():
    W = np.zeros((8, 2), dtype=complex)
    W[0b000, 0] = 1
    W[0b111, 1] = 1
    return W, 1, 3


def one_cx():
    qc = QuantumCircuit(3)
    qc.cx(0, 1)
    return qc


def chain_wrong_order():
    qc = QuantumCircuit(3)
    qc.cx(1, 2)
    qc.cx(0, 1)
    return qc


WRONG = {"один CX": one_cx, "цепочка в неверном порядке": chain_wrong_order}
