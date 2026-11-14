from qiskit import QuantumCircuit
from qiskit.quantum_info import Operator

import sakit

GRID = [{}]


def given():
    qc = QuantumCircuit(3)
    qc.h(0); qc.h(1); qc.cx(1, 0); qc.h(0); qc.h(1)
    qc.cx(1, 2); qc.cx(0, 1); qc.cx(1, 2); qc.cx(0, 1)
    qc.t(2); qc.t(2); qc.s(2); qc.z(2)
    qc.h(2); qc.z(2); qc.h(2)
    return qc


def spec():
    return sakit.op(Operator(given()).data)


def lost_x():
    qc = QuantumCircuit(3)
    qc.cx(0, 1)
    qc.cx(0, 2)
    return qc


WRONG = {"стартовая схема без изменений (16 гейтов)": given, "потерян X": lost_x}
