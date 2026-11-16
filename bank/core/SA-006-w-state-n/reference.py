import math

from qiskit import QuantumCircuit


def solve(n):
    qc = QuantumCircuit(n)
    qc.x(0)
    for i in range(n - 1):
        theta = 2 * math.acos(math.sqrt(1 / (n - i)))
        qc.cry(theta, i, i + 1)
        qc.cx(i + 1, i)
    return qc
