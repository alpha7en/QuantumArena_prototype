from qiskit import QuantumCircuit

import sakit

GRID = [{"n": n} for n in (2, 3, 4, 5, 7, 9)]


def alternating(x, n):
    b = sakit.bits(x, n)
    return int(all(b[i] != b[i + 1] for i in range(n - 1)))


def spec(n):
    return sakit.op(sakit.phase_oracle(n, lambda x: alternating(x, n)))


def no_uncompute(n):
    qc = QuantumCircuit(n)
    for i in range(n - 1):
        qc.cx(i + 1, i)
    if n == 2:
        qc.z(0)
    else:
        qc.h(n - 2)
        qc.mcx(list(range(n - 2)), n - 2)
        qc.h(n - 2)
    return qc


WRONG = {"без развычисления": no_uncompute}
