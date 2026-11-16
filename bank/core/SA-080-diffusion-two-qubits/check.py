import numpy as np
from qiskit import QuantumCircuit

import sakit

GRID = [{}]


def spec():
    s = np.full(4, 0.5)
    return sakit.op(2 * np.outer(s, s) - np.eye(4))


def nine_gates():
    qc = QuantumCircuit(2)
    qc.h(0); qc.h(1)
    qc.x(0); qc.x(1)
    qc.cz(0, 1)
    qc.x(0); qc.x(1)
    qc.h(0); qc.h(1)
    return qc


def only_cz():
    qc = QuantumCircuit(2)
    qc.h(0); qc.h(1)
    qc.cz(0, 1)
    qc.h(0); qc.h(1)
    return qc


def no_h():
    qc = QuantumCircuit(2)
    qc.z(0); qc.z(1)
    qc.cz(0, 1)
    return qc


WRONG = {"схема с четырьмя X, 9 гейтов": nine_gates, "CZ без Z": only_cz, "без слоёв H": no_h}
