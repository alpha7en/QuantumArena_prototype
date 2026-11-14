import numpy as np
from qiskit import QuantumCircuit

import sakit

GRID = [
    {"n": 2, "edges": [(0, 1, 1.0)], "gamma": 0.7, "beta": 0.3},
    {"n": 3, "edges": [(0, 1, 1.0), (1, 2, 2.5), (0, 2, 0.5)], "gamma": 0.4, "beta": 1.1},
    {"n": 4, "edges": [(0, 1, 3.0), (1, 2, 1.0), (2, 3, 2.0)], "gamma": -0.9, "beta": 0.2},
    {"n": 6, "edges": [(0, 3, 1.5), (1, 4, 0.5), (2, 5, 2.0), (0, 1, 1.0), (4, 5, 0.25)], "gamma": 1.3, "beta": -0.6},
]


def spec(n, edges, gamma, beta):
    v = np.ones(2 ** n, dtype=complex) / np.sqrt(2 ** n)
    for x in range(2 ** n):
        cut = sum(w for i, j, w in edges if ((x >> i) ^ (x >> j)) & 1)
        v[x] *= np.exp(-1j * gamma * cut)
    one = np.cos(beta) * sakit.I2 - 1j * np.sin(beta) * sakit.X
    return sakit.state(sakit.kron(*[one] * n) @ v)


def unweighted(n, edges, gamma, beta):
    qc = QuantumCircuit(n)
    qc.h(range(n))
    for i, j, _ in edges:
        qc.rzz(-gamma, i, j)
    for i in range(n):
        qc.rx(2 * beta, i)
    return qc


WRONG = {"веса рёбер не учтены": unweighted}
