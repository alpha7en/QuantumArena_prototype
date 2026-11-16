import math

from qiskit import QuantumCircuit
from qiskit.quantum_info import Operator

import sakit

GRID = [{}]


def spec():
    t = QuantumCircuit(2)
    t.ch(0, 1)
    return sakit.op(Operator(t).data)


def wrong_signs():
    qc = QuantumCircuit(2)
    qc.ry(-math.pi / 4, 1)
    qc.cx(0, 1)
    qc.ry(math.pi / 4, 1)
    return qc


WRONG = {"углы с обратными знаками": wrong_signs}
