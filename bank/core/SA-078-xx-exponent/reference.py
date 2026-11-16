import math

from qiskit import QuantumCircuit


def solve():
    qc = QuantumCircuit(2)
    qc.cx(0, 1)
    qc.h(0)
    qc.rz(math.pi / 4, 0)
    qc.h(0)
    qc.cx(0, 1)
    return qc
