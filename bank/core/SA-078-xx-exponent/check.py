import math

import numpy as np
from qiskit import QuantumCircuit

import sakit

GRID = [{}]


def spec():
    t = math.pi / 8
    XX = sakit.kron(sakit.X, sakit.X)
    return sakit.op(math.cos(t) * np.eye(4) - 1j * math.sin(t) * XX)


def half_angle():
    qc = QuantumCircuit(2)
    qc.cx(0, 1)
    qc.h(0)
    qc.rz(math.pi / 8, 0)
    qc.h(0)
    qc.cx(0, 1)
    return qc


def on_target():
    qc = QuantumCircuit(2)
    qc.cx(0, 1)
    qc.h(1)
    qc.rz(math.pi / 4, 1)
    qc.h(1)
    qc.cx(0, 1)
    return qc


def seven_gates():
    qc = QuantumCircuit(2)
    qc.h(0); qc.h(1)
    qc.cx(0, 1)
    qc.rz(math.pi / 4, 1)
    qc.cx(0, 1)
    qc.h(0); qc.h(1)
    return qc


def zz_exponent():
    qc = QuantumCircuit(2)
    qc.cx(0, 1)
    qc.rz(math.pi / 4, 1)
    qc.cx(0, 1)
    return qc


WRONG = {"половинный угол": half_angle, "поворот на целевом кубите": on_target,
         "смена базиса на обоих кубитах, 7 гейтов": seven_gates, "экспонента ZZ": zz_exponent}
