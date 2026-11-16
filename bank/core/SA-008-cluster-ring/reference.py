from qiskit import QuantumCircuit


def solve(n):
    qc = QuantumCircuit(n)
    qc.h(range(n))
    for start in (0, 1):
        for i in range(start, n - 1, 2):
            qc.cz(i, i + 1)
    qc.cz(n - 1, 0)
    return qc
