import math

from qiskit import QuantumCircuit


def solve():
    qc = QuantumCircuit(2)
    qc.h(0)
    qc.cp(-math.pi / 2, 0, 1)
    qc.h(1)
    return qc
