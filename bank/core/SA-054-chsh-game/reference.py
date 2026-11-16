import math

from qiskit import QuantumCircuit

ANGLES = {("A", 0): 0.0, ("A", 1): math.pi / 2, ("B", 0): math.pi / 4, ("B", 1): -math.pi / 4}


def solve(player, bit):
    qc = QuantumCircuit(1)
    theta = ANGLES[(player, bit)]
    if theta:
        qc.ry(-theta, 0)
    return qc
