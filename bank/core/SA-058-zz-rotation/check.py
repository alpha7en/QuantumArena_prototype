import math

import numpy as np
from qiskit import QuantumCircuit

import sakit

GRID = [{"theta": t} for t in (0.3, -1.1, math.pi / 4, 2.5, 0.0)]


def spec(theta):
    return sakit.op(np.diag(np.exp(-1j * theta * np.array([1, -1, -1, 1]))))


def half_angle(theta):
    qc = QuantumCircuit(2)
    qc.cx(0, 1)
    qc.rz(theta, 1)
    qc.cx(0, 1)
    return qc


WRONG = {"угол без множителя 2": half_angle}
