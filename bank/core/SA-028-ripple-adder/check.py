from qiskit import QuantumCircuit

import sakit

GRID = [{"n": n} for n in (1, 2, 3, 4)]


def spec(n):
    m = 2 ** n

    def f(v):
        a, b = v % m, v // m
        return a + ((a + b) % m) * m

    return sakit.op(sakit.perm(2 * n, f))


def only_maj(n):
    qc = QuantumCircuit(2 * n + 1)
    carry = [2 * n] + list(range(n))
    for i in range(n):
        qc.cx(i, n + i)
        qc.cx(i, carry[i])
        qc.ccx(carry[i], n + i, i)
    return qc


WRONG = {"лестница MAJ без обратного прохода": only_maj}
