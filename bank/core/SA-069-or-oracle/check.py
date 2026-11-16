import numpy as np
from qiskit import QuantumCircuit

GRID = [{}]


def spec():
    W = np.zeros((8, 4), dtype=complex)
    for a in (0, 1):
        for b in (0, 1):
            W[a | (b << 1) | ((a | b) << 2), a | (b << 1)] = 1
    return W, 2, 3


def only_and():
    qc = QuantumCircuit(3)
    qc.ccx(0, 1, 2)
    return qc


def nor():
    qc = QuantumCircuit(3)
    qc.x(0); qc.x(1)
    qc.ccx(0, 1, 2)
    qc.x(0); qc.x(1)
    return qc


def inputs_not_restored():
    qc = QuantumCircuit(3)
    qc.x(0); qc.x(1)
    qc.ccx(0, 1, 2)
    qc.x(2)
    return qc


WRONG = {"только И": only_and, "без X на ответе: НЕ-ИЛИ": nor, "входы не возвращены": inputs_not_restored}
