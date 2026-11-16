import math

from qiskit import QuantumCircuit


def solve():
    qc = QuantumCircuit(2)
    qc.ry(math.pi / 4, 1)
    qc.cx(0, 1)
    qc.ry(-math.pi / 4, 1)
    return qc
