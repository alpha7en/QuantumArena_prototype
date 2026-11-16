import math

from qiskit import QuantumCircuit


def _h(qc, q):
    qc.rz(math.pi / 2, q)
    qc.sx(q)
    qc.rz(math.pi / 2, q)


def solve():
    qc = QuantumCircuit(2)
    _h(qc, 1)
    qc.cz(0, 1)
    _h(qc, 1)
    return qc
