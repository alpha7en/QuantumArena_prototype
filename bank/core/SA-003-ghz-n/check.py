from qiskit import QuantumCircuit

import sakit

GRID = [{"n": n} for n in (2, 3, 4, 7, 12)]


def spec(n):
    return sakit.state(sakit.ket(n, {0: 1, 2 ** n - 1: 1}))


def all_h(n):
    qc = QuantumCircuit(n)
    qc.h(range(n))
    return qc


WRONG = {"H на всех кубитах": all_h}
