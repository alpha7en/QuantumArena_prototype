from qiskit import QuantumCircuit


def solve():
    qc = QuantumCircuit(2)
    qc.h(1)
    qc.cx(0, 1)
    qc.h(1)
    return qc
