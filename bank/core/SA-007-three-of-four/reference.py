import math

from qiskit import QuantumCircuit


def solve():
    qc = QuantumCircuit(2)
    qc.ry(2 * math.acos(1 / math.sqrt(3)), 0)
    qc.ch(0, 1)
    qc.x(0)
    qc.cx(0, 1)
    qc.x(0)
    return qc
