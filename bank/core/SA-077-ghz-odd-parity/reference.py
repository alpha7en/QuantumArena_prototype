from qiskit import QuantumCircuit


def solve():
    qc = QuantumCircuit(3, 3)
    qc.z(0)
    qc.h(0)
    qc.h(1)
    qc.h(2)
    qc.measure([0, 1, 2], [0, 1, 2])
    return qc
