import math

from qiskit import QuantumCircuit

import sakit

GRID = [
    {"n": 6, "a": 0b000011, "b": 0b111111, "p": 0.4},
    {"n": 1, "a": 1, "b": 0, "p": 0.25},
    {"n": 3, "a": 0b101, "b": 0b010, "p": 0.9},
    {"n": 4, "a": 0b0110, "b": 0b1100, "p": 0.5},
    {"n": 8, "a": 200, "b": 17, "p": 1 / 3},
    {"n": 10, "a": 1023, "b": 512, "p": 0.07},
]


def spec(n, a, b, p):
    return sakit.state(sakit.ket(n, {a: math.sqrt(p), b: math.sqrt(1 - p)}))


def no_fix(n, a, b, p):
    qc = QuantumCircuit(n)
    ab = [(a >> i) & 1 for i in range(n)]
    bb = [(b >> i) & 1 for i in range(n)]
    k = next(i for i in range(n) if ab[i] != bb[i])
    qc.ry(2 * math.acos(math.sqrt(p)) if ab[k] == 0 else 2 * math.asin(math.sqrt(p)), k)
    for j in range(n):
        if j != k and ab[j] == bb[j] and ab[j]:
            qc.x(j)
        elif j != k and ab[j] != bb[j]:
            qc.cx(k, j)
    return qc


WRONG = {"разветвление без поправки X": no_fix}
