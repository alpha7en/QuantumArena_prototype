import math

from qiskit import QuantumCircuit


def solve():
    qc = QuantumCircuit(1)
    qc.rz(math.pi, 0)
    qc.sx(0)
    qc.sx(0)
    return qc
