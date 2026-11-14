import math

from qiskit import QuantumCircuit

import sakit

GRID = [{}]


def spec():
    return sakit.state(sakit.ket(2, {"01": 1, "10": 1, "11": 1}))


def no_last_step():
    qc = QuantumCircuit(2)
    qc.ry(2 * math.acos(1 / math.sqrt(3)), 0)
    qc.ch(0, 1)
    return qc


WRONG = {"без переноса ветви 00 в 10": no_last_step}
