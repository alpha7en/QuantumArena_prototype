from qiskit import QuantumCircuit


def solve(n):
    qc = QuantumCircuit(n)
    qc.h(0)
    for i in range(1, n):
        qc.cx(i - 1, i)
    return qc
