import math

from qiskit import QuantumCircuit

import sakit

GRID = [{"n": n} for n in (2, 3, 4, 5, 8, 10)]


def spec(n):
    return sakit.state(sakit.ket(n, {2 ** k: 1 for k in range(n)}))


def equal_angles(n):
    qc = QuantumCircuit(n)
    qc.x(0)
    for i in range(n - 1):
        qc.cry(math.pi / 2, i, i + 1)
        qc.cx(i + 1, i)
    return qc


WRONG = {"одинаковые углы на всех шагах": equal_angles}
