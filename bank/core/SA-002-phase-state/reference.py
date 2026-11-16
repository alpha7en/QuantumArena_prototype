from qiskit import QuantumCircuit


def solve():
    qc = QuantumCircuit(1)
    qc.h(0)
    qc.s(0)
    qc.t(0)
    return qc
