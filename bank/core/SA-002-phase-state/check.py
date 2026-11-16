import cmath
import math

from qiskit import QuantumCircuit

import sakit

GRID = [{}]


def spec():
    return sakit.state([1, cmath.exp(3j * math.pi / 4)])


def only_t():
    qc = QuantumCircuit(1)
    qc.h(0)
    qc.t(0)
    return qc


def phase_first():
    qc = QuantumCircuit(1)
    qc.s(0)
    qc.t(0)
    qc.h(0)
    return qc


WRONG = {"только T (фаза в четверть от нужной не дотягивает)": only_t, "фазовые гейты до H": phase_first}
