import math

from qiskit import QuantumCircuit

import sakit

GRID = [{}]


def spec():
    return sakit.state(sakit.ket(2, {"00": 1, "11": -1}))


def bell_plus():
    qc = QuantumCircuit(2)
    qc.h(0)
    qc.cx(0, 1)
    return qc


WRONG = {"состояние Белла со знаком плюс": bell_plus}
