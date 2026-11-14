import math

from qiskit import QuantumCircuit


def solve(n):
    qc = QuantumCircuit(n)
    for i in reversed(range(n)):
        qc.h(i)
        for j in reversed(range(i)):
            qc.cp(math.pi / 2 ** (i - j), j, i)
    for i in range(n // 2):
        qc.swap(i, n - 1 - i)
    return qc
