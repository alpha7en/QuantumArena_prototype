import math

from qiskit import QuantumCircuit

import sakit

GRID = ([{"n": 4, "L": L} for L in range(1, 17)]
        + [{"n": 1, "L": 1}, {"n": 1, "L": 2}, {"n": 6, "L": 37}, {"n": 7, "L": 100}, {"n": 10, "L": 1000},
           {"n": 10, "L": 683}])


def spec(n, L):
    return sakit.state(sakit.ket(n, {x: 1 for x in range(L)}))


def power_of_two(n, L):
    qc = QuantumCircuit(n)
    for q in range(math.ceil(math.log2(L)) if L > 1 else 0):
        qc.h(q)
    return qc


WRONG = {"H на ceil(log2 L) кубитах": power_of_two}
