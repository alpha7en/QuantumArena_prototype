from qiskit import QuantumCircuit


def solve():
    qc = QuantumCircuit(5)
    qc.ccx(0, 1, 4)
    qc.ccx(4, 2, 3)
    qc.ccx(0, 1, 4)
    qc.ccx(4, 2, 3)
    return qc
