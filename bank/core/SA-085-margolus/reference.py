import math

from qiskit import QuantumCircuit


def solve():
    a = math.pi / 4
    qc = QuantumCircuit(3)
    qc.ry(a, 2)
    qc.cx(1, 2)
    qc.ry(a, 2)
    qc.cx(0, 2)
    qc.ry(-a, 2)
    qc.cx(1, 2)
    qc.ry(-a, 2)
    return qc
