from qiskit import QuantumCircuit

import sakit

GRID = [{}]


def spec():
    return sakit.state(sakit.ket(2, {"01": 1, "10": -1}))


def psi_plus():
    qc = QuantumCircuit(2)
    qc.h(0)
    qc.cx(0, 1)
    qc.x(1)
    return qc


def phi_minus():
    qc = QuantumCircuit(2)
    qc.h(0)
    qc.cx(0, 1)
    qc.z(0)
    return qc


WRONG = {"Psi+ без знака": psi_plus, "Phi- без переворота": phi_minus}
