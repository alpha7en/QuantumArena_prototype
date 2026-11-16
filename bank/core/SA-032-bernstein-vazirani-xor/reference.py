from qiskit import QuantumCircuit


def solve(n, oracle):
    qc = QuantumCircuit(n + 1, n)
    qc.x(n)
    qc.h(range(n + 1))
    qc.append(oracle, range(n + 1))
    qc.h(range(n))
    qc.measure(range(n), range(n))
    return qc
