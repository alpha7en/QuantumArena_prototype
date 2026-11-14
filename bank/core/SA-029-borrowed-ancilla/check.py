from qiskit import QuantumCircuit

import sakit

GRID = [{}]


def spec():
    return sakit.op(sakit.perm(5, lambda v: v ^ (int(v & 7 == 7) << 3)))


def clean_version():
    qc = QuantumCircuit(5)
    qc.ccx(0, 1, 4)
    qc.ccx(4, 2, 3)
    qc.ccx(0, 1, 4)
    return qc


WRONG = {"три гейта, как с чистой анциллой": clean_version}
