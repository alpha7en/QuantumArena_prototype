import numpy as np
from qiskit import QuantumCircuit

import sakit

GRID = [{}]
EDGES = [(0, 1), (1, 2), (2, 3)]


def spec():
    v = np.array([(-1.0) ** sum(((x >> a) & 1) * ((x >> b) & 1) for a, b in EDGES) for x in range(16)])
    return sakit.state(v)


def two_pairs():
    qc = QuantumCircuit(4)
    qc.h(range(4))
    qc.cz(0, 1)
    qc.cz(2, 3)
    return qc


def sequential():
    qc = QuantumCircuit(4)
    qc.h(range(4))
    qc.cz(0, 1)
    qc.cz(1, 2)
    qc.cz(2, 3)
    return qc


def ring():
    qc = QuantumCircuit(4)
    qc.h(range(4))
    qc.cz(0, 1)
    qc.cz(2, 3)
    qc.cz(1, 2)
    qc.cz(0, 3)
    return qc


WRONG = {"без среднего ребра": two_pairs, "рёбра подряд, глубина 4": sequential, "лишнее ребро между крайними": ring}
