from qiskit import QuantumCircuit

import sakit

GRID = [{}]


def spec():
    return sakit.state(sakit.ket(1, {"1": 1j}))


def only_x():
    qc = QuantumCircuit(1)
    qc.x(0)
    return qc


def s_before_x():
    qc = QuantumCircuit(1)
    qc.s(0)
    qc.x(0)
    return qc


def minus_one():
    qc = QuantumCircuit(1)
    qc.x(0)
    qc.z(0)
    return qc


WRONG = {"X без фазы": only_x, "S раньше X": s_before_x, "Z вместо S": minus_one}
