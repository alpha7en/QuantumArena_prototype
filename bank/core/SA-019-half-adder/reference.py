from qiskit import QuantumCircuit


def solve():
    qc = QuantumCircuit(3)
    qc.ccx(0, 1, 2)
    qc.cx(0, 1)
    return qc
