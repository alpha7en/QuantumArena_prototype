from qiskit import QuantumCircuit

import sakit

GRID = [{}]


def spec():
    return sakit.op(sakit.perm(2, lambda v: ((v & 1) << 1) | (v >> 1)))


def two_cx():
    qc = QuantumCircuit(2)
    qc.cx(0, 1)
    qc.cx(1, 0)
    return qc


def same_direction():
    qc = QuantumCircuit(2)
    qc.cx(0, 1)
    qc.cx(0, 1)
    qc.cx(0, 1)
    return qc


WRONG = {"два CX": two_cx, "три CX в одном направлении": same_direction}
