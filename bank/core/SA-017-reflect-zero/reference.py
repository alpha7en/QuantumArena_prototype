from qiskit import QuantumCircuit


def solve(n):
    qc = QuantumCircuit(n)
    qc.x(range(n))
    qc.h(n - 1)
    qc.mcx(list(range(n - 1)), n - 1)
    qc.h(n - 1)
    qc.x(range(n))
    return qc
