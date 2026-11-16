from qiskit import QuantumCircuit

import sakit

GRID = [{"n": n} for n in (1, 2, 3, 5, 9)]


def spec(n):
    return sakit.op(sakit.xor_oracle(n, lambda x: bin(x).count("1") % 2))


def reversed_cx(n):
    qc = QuantumCircuit(n + 1)
    for i in range(n):
        qc.cx(n, i)
    return qc


WRONG = {"управляющий и целевой перепутаны": reversed_cx}
