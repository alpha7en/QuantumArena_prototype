from qiskit import QuantumCircuit


def solve():
    qc = QuantumCircuit(1)
    qc.x(0)
    qc.z(0)
    return qc
