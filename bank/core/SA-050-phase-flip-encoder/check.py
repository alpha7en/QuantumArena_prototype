import numpy as np
from qiskit import QuantumCircuit

GRID = [{}]


def spec():
    plus = np.array([1, 1]) / np.sqrt(2)
    minus = np.array([1, -1]) / np.sqrt(2)
    W = np.zeros((8, 2), dtype=complex)
    W[:, 0] = np.kron(plus, np.kron(plus, plus))
    W[:, 1] = np.kron(minus, np.kron(minus, minus))
    return W, 1, 3


def bit_flip_code():
    qc = QuantumCircuit(3)
    qc.cx(0, 1)
    qc.cx(0, 2)
    return qc


WRONG = {"код от переворота бита (без H)": bit_flip_code}
