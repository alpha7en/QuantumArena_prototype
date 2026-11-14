import numpy as np
from qiskit import QuantumCircuit

import sakit

GRID = [{"n": n} for n in (2, 3, 4, 6, 8)]


def spec(n):
    return sakit.op(sakit.phase_oracle(n, lambda x: int(x != 0)))


def reflect_ones(n):
    qc = QuantumCircuit(n)
    qc.h(n - 1)
    qc.mcx(list(range(n - 1)), n - 1)
    qc.h(n - 1)
    return qc


WRONG = {"без гейтов X (отражается 1...1)": reflect_ones}
