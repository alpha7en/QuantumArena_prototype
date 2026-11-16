from qiskit import QuantumCircuit

import sakit

GRID = [{"n": 1, "a": 0}, {"n": 1, "a": 1}, {"n": 3, "a": 0b010}, {"n": 3, "a": 0b111}, {"n": 4, "a": 0},
        {"n": 5, "a": 0b10110}, {"n": 7, "a": 77}]


def spec(n, a):
    return sakit.op(sakit.xor_oracle(n, lambda x: int(x == a)))


def no_restore(n, a):
    qc = QuantumCircuit(n + 1)
    for i in range(n):
        if not (a >> i) & 1:
            qc.x(i)
    qc.mcx(list(range(n)), n)
    return qc


WRONG = {"вход не восстановлен": no_restore}
