from qiskit import QuantumCircuit

import sakit

GRID = [{}]


def spec():
    return sakit.op(sakit.perm(3, lambda v: v ^ ((v & 1) << 2)))


def via_swaps():
    qc = QuantumCircuit(3)
    for a, b in ((0, 1), (1, 0), (0, 1)):
        qc.cx(a, b)
    qc.cx(1, 2)
    for a, b in ((0, 1), (1, 0), (0, 1)):
        qc.cx(a, b)
    return qc


def direct():
    qc = QuantumCircuit(3)
    qc.cx(0, 2)
    return qc


WRONG = {"маршрут через SWAP (7 CX)": via_swaps, "прямой CX (нарушает связность)": direct}
