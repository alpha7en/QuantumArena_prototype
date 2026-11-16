import math

from qiskit import QuantumCircuit

import sakit

GRID = [{}]


def spec():
    return sakit.op(sakit.xor_oracle(1, lambda x: x))


def wrong_side():
    qc = QuantumCircuit(2)
    for _ in range(2):
        qc.rz(math.pi / 2, 0)
        qc.sx(0)
        qc.rz(math.pi / 2, 0)
        if _ == 0:
            qc.cz(0, 1)
    return qc


WRONG = {"Адамары на управляющем кубите": wrong_side}
