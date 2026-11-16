from qiskit import QuantumCircuit

import sakit

GRID = [{"n": n} for n in (3, 4, 5, 6)]


def spec(n):
    return sakit.op(sakit.xor_oracle(n, lambda x: int(x == 2 ** n - 1)))


def no_uncompute(n):
    qc = QuantumCircuit(2 * n - 1)
    anc = list(range(n + 1, 2 * n - 1))
    qc.ccx(0, 1, anc[0])
    for i in range(2, n - 1):
        qc.ccx(i, anc[i - 2], anc[i - 1])
    qc.ccx(n - 1, anc[n - 3], n)
    return qc


WRONG = {"лестница без обратного прохода": no_uncompute}
