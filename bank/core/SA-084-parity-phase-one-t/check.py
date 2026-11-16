import cmath
import math

import numpy as np
from qiskit import QuantumCircuit

import sakit

GRID = [{}]


def spec():
    w = cmath.exp(1j * math.pi / 4)
    return sakit.op(np.diag([w ** (bin(x).count("1") % 2) for x in range(8)]))


def t_everywhere():
    qc = QuantumCircuit(3)
    qc.t(0); qc.t(1); qc.t(2)
    return qc


def no_uncompute():
    qc = QuantumCircuit(3)
    qc.cx(0, 2)
    qc.cx(1, 2)
    qc.t(2)
    return qc


def two_bits():
    qc = QuantumCircuit(3)
    qc.cx(0, 2)
    qc.t(2)
    qc.cx(0, 2)
    return qc


WRONG = {"T на каждом кубите": t_everywhere, "нет отката": no_uncompute, "чётность двух битов": two_bits}
