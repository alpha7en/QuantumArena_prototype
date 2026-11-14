from qiskit import QuantumCircuit


def solve(n):
    qc = QuantumCircuit(n)
    for i in range(n - 1):
        qc.cx(i + 1, i)
    if n == 2:
        qc.z(0)
    else:
        qc.h(n - 2)
        qc.mcx(list(range(n - 2)), n - 2)
        qc.h(n - 2)
    for i in reversed(range(n - 1)):
        qc.cx(i + 1, i)
    return qc
