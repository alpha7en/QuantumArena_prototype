from qiskit import QuantumCircuit

import sakit

GRID = [{"n": n} for n in (2, 3, 5, 8, 11, 16)]


def spec(n):
    return sakit.state(sakit.ket(n, {0: 1, 2 ** n - 1: -1}))


def chain(n):
    qc = QuantumCircuit(n)
    qc.h(0)
    qc.z(0)
    for i in range(1, n):
        qc.cx(i - 1, i)
    return qc


def tree_plus(n):
    qc = QuantumCircuit(n)
    qc.h(0)
    k = 1
    while k < n:
        for j in range(min(k, n - k)):
            qc.cx(j, j + k)
        k *= 2
    return qc


WRONG = {"цепочка CX (глубина n + 1)": chain, "дерево без знака": tree_plus}
