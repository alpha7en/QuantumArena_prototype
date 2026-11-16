from qiskit import QuantumCircuit

import sakit

GRID = [{"n": n} for n in (2, 3, 4, 5, 7)]


def spec(n):
    return sakit.op(sakit.xor_oracle(n, lambda x: int(x != 0 and bin(x).count("1") % 2 == 0)))


def dirty_ancilla(n):
    qc = QuantumCircuit(n + 2)
    for i in range(n):
        qc.cx(i, n + 1)
    qc.x(n + 1)
    qc.cx(n + 1, n)
    qc.x(range(n))
    qc.mcx(list(range(n)), n)
    qc.x(range(n))
    return qc


def only_even(n):
    qc = QuantumCircuit(n + 1)
    for i in range(n):
        qc.cx(i, n)
    qc.x(n)
    return qc


WRONG = {"чётность осталась в анцилле": dirty_ancilla, "нулевая строка не исключена": only_even}
