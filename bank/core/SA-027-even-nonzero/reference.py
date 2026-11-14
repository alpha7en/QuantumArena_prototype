from qiskit import QuantumCircuit


def solve(n):
    qc = QuantumCircuit(n + 1)
    for i in range(n):
        qc.cx(i, n)
    qc.x(n)
    qc.x(range(n))
    qc.mcx(list(range(n)), n)
    qc.x(range(n))
    return qc
