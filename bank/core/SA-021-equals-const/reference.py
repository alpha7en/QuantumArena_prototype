from qiskit import QuantumCircuit


def solve(n, a):
    qc = QuantumCircuit(n + 1)
    zeros = [i for i in range(n) if not (a >> i) & 1]
    for i in zeros:
        qc.x(i)
    qc.mcx(list(range(n)), n)
    for i in zeros:
        qc.x(i)
    return qc
