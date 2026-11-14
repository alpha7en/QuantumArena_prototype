from qiskit import QuantumCircuit


def solve(n, oracle):
    qc = QuantumCircuit(n, n)
    qc.h(range(n))
    qc.append(oracle, range(n))
    qc.h(range(n))
    qc.measure(range(n), range(n))
    return qc
