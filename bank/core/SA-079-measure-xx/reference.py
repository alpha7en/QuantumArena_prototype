from qiskit import QuantumCircuit


def solve():
    qc = QuantumCircuit(2, 1)
    qc.h(0)
    qc.h(1)
    qc.cx(0, 1)
    qc.measure(1, 0)
    return qc
