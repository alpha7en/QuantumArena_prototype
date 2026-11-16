from qiskit import QuantumCircuit


def solve():
    qc = QuantumCircuit(2)
    qc.h(0); qc.h(1)
    qc.z(0); qc.z(1)
    qc.cz(0, 1)
    qc.h(0); qc.h(1)
    return qc
