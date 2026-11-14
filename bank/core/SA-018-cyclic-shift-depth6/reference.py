from qiskit import QuantumCircuit


def _swap(qc, a, b):
    qc.cx(a, b)
    qc.cx(b, a)
    qc.cx(a, b)


def solve(n):
    qc = QuantumCircuit(n)
    for i in range(n // 2):
        _swap(qc, i, n - 1 - i)
    for i in range(1, (n + 1) // 2):
        _swap(qc, i, n - i)
    return qc
