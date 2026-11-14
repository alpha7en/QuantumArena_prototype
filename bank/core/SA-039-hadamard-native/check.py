from qiskit import QuantumCircuit

import sakit

GRID = [{}]


def spec():
    return sakit.op(sakit.H)


def only_sx():
    qc = QuantumCircuit(1)
    qc.sx(0)
    return qc


WRONG = {"один гейт sx": only_sx}
