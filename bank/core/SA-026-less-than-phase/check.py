from qiskit import QuantumCircuit

import sakit

GRID = ([{"n": 3, "L": L} for L in range(9)] + [{"n": 1, "L": 1}, {"n": 5, "L": 19}, {"n": 6, "L": 63},
                                               {"n": 8, "L": 171}])


def spec(n, L):
    return sakit.op(sakit.phase_oracle(n, lambda x: int(x < L)))


def enumerate_all(n, L):
    qc = QuantumCircuit(n)
    if L >= 2 ** n:
        return qc
    for x in range(L):
        zeros = [q for q in range(n) if not (x >> q) & 1]
        for q in zeros:
            qc.x(q)
        if n == 1:
            qc.z(0)
        else:
            qc.h(n - 1)
            qc.mcx(list(range(n - 1)), n - 1)
            qc.h(n - 1)
        for q in zeros:
            qc.x(q)
    return qc


WRONG = {"по гейту на каждое x < L": enumerate_all}
