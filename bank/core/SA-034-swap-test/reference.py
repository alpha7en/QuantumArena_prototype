from qiskit import QuantumCircuit


def solve():
    qc = QuantumCircuit(3, 1)
    qc.h(0)
    qc.cswap(0, 1, 2)
    qc.h(0)
    qc.measure(0, 0)
    return qc
