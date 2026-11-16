import numpy as np
from qiskit import QuantumCircuit

import sakit

GRID = [{"n": n} for n in (2, 3, 4, 6, 8)]


def spec(n):
    N = 2 ** n
    return sakit.op(2 * np.full((N, N), 1 / N) - np.eye(N))


def reflect_zero(n):
    qc = QuantumCircuit(n)
    qc.x(range(n))
    qc.h(n - 1)
    qc.mcx(list(range(n - 1)), n - 1)
    qc.h(n - 1)
    qc.x(range(n))
    return qc


WRONG = {"отражение относительно нуля без слоёв H": reflect_zero}
