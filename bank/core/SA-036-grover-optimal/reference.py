import math

from qiskit import QuantumCircuit


def solve(n, oracle):
    qc = QuantumCircuit(n, n)
    qc.h(range(n))
    for _ in range(math.floor(math.pi / 4 * math.sqrt(2 ** n))):
        qc.append(oracle, range(n))
        qc.h(range(n))
        qc.x(range(n))
        qc.h(n - 1)
        qc.mcx(list(range(n - 1)), n - 1)
        qc.h(n - 1)
        qc.x(range(n))
        qc.h(range(n))
    qc.measure(range(n), range(n))
    return qc
