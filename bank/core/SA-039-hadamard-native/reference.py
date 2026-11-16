import math

from qiskit import QuantumCircuit


def solve():
    qc = QuantumCircuit(1)
    qc.rz(math.pi / 2, 0)
    qc.sx(0)
    qc.rz(math.pi / 2, 0)
    return qc
