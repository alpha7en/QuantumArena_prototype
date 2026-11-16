from qiskit import QuantumCircuit


def solve():
    qc = QuantumCircuit(4)
    qc.h(range(4))
    qc.cz(0, 1)
    qc.cz(2, 3)
    qc.cz(1, 2)
    return qc
