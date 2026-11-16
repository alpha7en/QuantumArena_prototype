import math

import numpy as np
from qiskit import QuantumCircuit

import sakit

GRID = [{"n": n} for n in (1, 2, 3, 4, 6, 8)]


def spec(n):
    N = 2 ** n
    k = np.arange(N)
    return sakit.op(np.exp(2j * np.pi * np.outer(k, k) / N) / math.sqrt(N))


def no_swaps(n):
    qc = QuantumCircuit(n)
    for i in reversed(range(n)):
        qc.h(i)
        for j in reversed(range(i)):
            qc.cp(math.pi / 2 ** (i - j), j, i)
    return qc


def inverse(n):
    qc = QuantumCircuit(n)
    for i in reversed(range(n)):
        qc.h(i)
        for j in reversed(range(i)):
            qc.cp(-math.pi / 2 ** (i - j), j, i)
    for i in range(n // 2):
        qc.swap(i, n - 1 - i)
    return qc


WRONG = {"без финальных SWAP": no_swaps, "углы с минусом": inverse}
