from qiskit import QuantumCircuit

import sakit

GRID = [{"n": n} for n in (2, 3, 4, 5, 8, 9, 12)]


def spec(n):
    return sakit.state(sakit.ket(n, {0: 1, 2 ** n - 1: 1}))


def from_edge(n):
    qc = QuantumCircuit(n)
    qc.h(0)
    for i in range(1, n):
        qc.cx(i - 1, i)
    return qc


def star(n):
    qc = QuantumCircuit(n)
    qc.h(0)
    for i in range(1, n):
        qc.cx(0, i)
    return qc


WRONG = {"цепочка от края (глубина n)": from_edge, "звезда (нарушает связность)": star}
