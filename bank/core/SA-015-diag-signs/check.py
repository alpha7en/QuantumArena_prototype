import itertools

import numpy as np
from qiskit import QuantumCircuit

import sakit

GRID = [{"d": list(d)} for d in itertools.product((1, -1), repeat=4)]


def spec(d):
    return sakit.op(np.diag(d))


def no_cz(d):
    qc = QuantumCircuit(2)
    if d[1] * d[0] == -1:
        qc.z(0)
    if d[2] * d[0] == -1:
        qc.z(1)
    return qc


WRONG = {"только однокубитные Z": no_cz}
