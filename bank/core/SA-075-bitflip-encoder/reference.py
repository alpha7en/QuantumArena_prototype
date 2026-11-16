from qiskit import QuantumCircuit


def solve():
    qc = QuantumCircuit(3)
    qc.cx(0, 1)
    qc.cx(0, 2)
    return qc
