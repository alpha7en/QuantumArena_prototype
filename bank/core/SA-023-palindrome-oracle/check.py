from qiskit import QuantumCircuit

import sakit

GRID = [{}]


def pal(x):
    b = sakit.bits(x, 4)
    return int(b[0] == b[3] and b[1] == b[2])


def spec():
    return sakit.op(sakit.xor_oracle(4, pal))


def no_uncompute():
    qc = QuantumCircuit(5)
    qc.cx(0, 3)
    qc.cx(1, 2)
    qc.x(3)
    qc.x(2)
    qc.ccx(3, 2, 4)
    return qc


def two_ancillas():
    qc = QuantumCircuit(7)
    for a, b, anc in ((0, 3, 5), (1, 2, 6)):
        qc.cx(a, anc)
        qc.cx(b, anc)
        qc.x(anc)
    qc.ccx(5, 6, 4)
    for a, b, anc in ((1, 2, 6), (0, 3, 5)):
        qc.x(anc)
        qc.cx(b, anc)
        qc.cx(a, anc)
    return qc


WRONG = {"без развычисления": no_uncompute, "решение с двумя анциллами (13 гейтов, 7 кубитов)": two_ancillas}
