import numpy as np
from qiskit import QuantumCircuit

import sakit

GRID = [{"n": n} for n in (3, 4, 5, 6, 9, 12)]


def spec(n):
    v = np.ones(2 ** n)
    for x in range(2 ** n):
        b = sakit.bits(x, n)
        v[x] = (-1) ** sum(b[i] * b[(i + 1) % n] for i in range(n))
    return sakit.state(v)


def ladder(n):
    qc = QuantumCircuit(n)
    qc.h(range(n))
    for i in range(n):
        qc.cz(i, (i + 1) % n)
    return qc


def open_chain(n):
    qc = QuantumCircuit(n)
    qc.h(range(n))
    for start in (0, 1):
        for i in range(start, n - 1, 2):
            qc.cz(i, i + 1)
    return qc


WRONG = {"CZ лесенкой по кругу (глубина n + 1)": ladder, "без замыкающего ребра": open_chain}
