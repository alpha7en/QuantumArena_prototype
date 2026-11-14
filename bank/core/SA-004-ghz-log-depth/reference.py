from qiskit import QuantumCircuit


def solve(n):
    qc = QuantumCircuit(n)
    qc.h(0)
    qc.z(0)
    k = 1
    while k < n:
        for j in range(min(k, n - k)):
            qc.cx(j, j + k)
        k *= 2
    return qc
