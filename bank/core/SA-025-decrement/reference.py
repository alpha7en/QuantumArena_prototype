from qiskit import QuantumCircuit


def solve(n):
    qc = QuantumCircuit(n)
    qc.x(0)
    for i in range(1, n):
        qc.mcx(list(range(i)), i)
    return qc
