from qiskit import QuantumCircuit


def solve():
    qc = QuantumCircuit(2)
    qc.sdg(1)
    qc.cx(0, 1)
    qc.s(1)
    return qc
