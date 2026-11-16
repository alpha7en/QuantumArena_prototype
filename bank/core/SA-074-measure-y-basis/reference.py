from qiskit import QuantumCircuit


def solve():
    qc = QuantumCircuit(1, 1)
    qc.sdg(0)
    qc.h(0)
    qc.measure(0, 0)
    return qc
