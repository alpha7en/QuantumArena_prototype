from qiskit import QuantumCircuit

import sakit

GRID = [{"n": n} for n in (2, 3, 4, 5, 8, 10)]


def spec(n):
    mask = 2 ** n - 1
    return sakit.op(sakit.perm(n, lambda x: ((x << 1) | (x >> (n - 1))) & mask))


def chain(n):
    qc = QuantumCircuit(n)
    for i in reversed(range(n - 1)):
        qc.cx(i, i + 1)
        qc.cx(i + 1, i)
        qc.cx(i, i + 1)
    return qc


WRONG = {"цепочка обменов соседей (глубина 3(n-1))": chain}
