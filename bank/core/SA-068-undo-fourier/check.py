import math

import numpy as np
from qiskit import QuantumCircuit

import sakit

GRID = [{}]


def spec():
    # V = R * F: F — матрица Фурье по модулю 4, R — разворот порядка двух битов. Нужна V^dagger.
    F = np.array([[1j ** (j * k) for k in range(4)] for j in range(4)]) / 2
    R = sakit.perm(2, lambda v: ((v & 1) << 1) | (v >> 1))
    return sakit.op((R @ F).conj().T)


def reversed_only():
    qc = QuantumCircuit(2)
    qc.h(0)
    qc.cp(math.pi / 2, 0, 1)
    qc.h(1)
    return qc


def sign_only():
    qc = QuantumCircuit(2)
    qc.h(1)
    qc.cp(-math.pi / 2, 0, 1)
    qc.h(0)
    return qc


def same_again():
    qc = QuantumCircuit(2)
    qc.h(1)
    qc.cp(math.pi / 2, 0, 1)
    qc.h(0)
    return qc


WRONG = {"обратный порядок без смены знака": reversed_only, "смена знака без разворота": sign_only,
         "та же схема ещё раз": same_again}
