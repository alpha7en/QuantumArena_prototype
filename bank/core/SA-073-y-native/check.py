import math

from qiskit import QuantumCircuit

import sakit

GRID = [{}]


def spec():
    return sakit.op(sakit.Y)


def just_x():
    qc = QuantumCircuit(1)
    qc.sx(0)
    qc.sx(0)
    return qc


def quarter_turn():
    qc = QuantumCircuit(1)
    qc.rz(math.pi / 2, 0)
    qc.sx(0)
    qc.sx(0)
    return qc


def just_z():
    qc = QuantumCircuit(1)
    qc.rz(math.pi, 0)
    return qc


WRONG = {"два sx без поворота: X": just_x, "rz на четверть оборота": quarter_turn, "только rz: Z": just_z}
