from qiskit import QuantumCircuit


def solve():
    qc = QuantumCircuit(1)
    qc.x(0)
    qc.s(0)
    return qc
