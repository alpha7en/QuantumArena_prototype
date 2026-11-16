from qiskit import QuantumCircuit


def solve():
    qc = QuantumCircuit(2)
    qc.cx(0, 1)
    qc.sdg(0)
    return qc
