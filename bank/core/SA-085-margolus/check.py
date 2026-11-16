import math

import numpy as np
from qiskit import QuantumCircuit

import sakit

GRID = [{}]


def spec():
    toffoli = sakit.xor_oracle(2, lambda x: int(x == 3))
    sign = np.diag([-1 if x == 0b101 else 1 for x in range(8)])
    return sakit.op(toffoli @ sign)


def same_signs():
    a = math.pi / 4
    qc = QuantumCircuit(3)
    qc.ry(a, 2); qc.cx(1, 2); qc.ry(a, 2); qc.cx(0, 2); qc.ry(a, 2); qc.cx(1, 2); qc.ry(a, 2)
    return qc


def one_control():
    a = math.pi / 4
    qc = QuantumCircuit(3)
    qc.ry(a, 2); qc.cx(1, 2); qc.ry(a, 2); qc.cx(1, 2); qc.ry(-a, 2); qc.cx(1, 2); qc.ry(-a, 2)
    return qc


def exact_toffoli_six_cx():
    a = math.pi / 4
    qc = QuantumCircuit(3)
    for c in (1, 0, 1, 0, 1, 0):
        qc.cx(c, 2)
        qc.ry(a, 2)
    return qc


def swapped_controls():
    a = math.pi / 4
    qc = QuantumCircuit(3)
    qc.ry(a, 2); qc.cx(0, 2); qc.ry(a, 2); qc.cx(1, 2); qc.ry(-a, 2); qc.cx(0, 2); qc.ry(-a, 2)
    return qc


WRONG = {"все углы одного знака": same_signs, "средний CX от того же управляющего": one_control,
         "шесть CX": exact_toffoli_six_cx, "управляющие переставлены: минус у другого состояния": swapped_controls}
