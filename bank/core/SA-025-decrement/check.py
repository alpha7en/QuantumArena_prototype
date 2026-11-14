from qiskit import QuantumCircuit

import sakit

GRID = [{"n": n} for n in (1, 2, 3, 4, 6, 8)]


def spec(n):
    return sakit.op(sakit.perm(n, lambda x: (x - 1) % 2 ** n))


def increment(n):
    qc = QuantumCircuit(n)
    for i in reversed(range(1, n)):
        qc.mcx(list(range(i)), i)
    qc.x(0)
    return qc


WRONG = {"обратный порядок (инкремент)": increment}
