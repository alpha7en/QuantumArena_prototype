from qiskit import QuantumCircuit


def solve(n, edges, gamma, beta):
    qc = QuantumCircuit(n)
    qc.h(range(n))
    for i, j, w in edges:
        qc.rzz(-gamma * w, i, j)
    for i in range(n):
        qc.rx(2 * beta, i)
    return qc
