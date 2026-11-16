from qiskit import QuantumCircuit


def solve():
    qc = QuantumCircuit(4)
    qc.cx(0, 1)
    qc.cx(0, 2)
    qc.ccx(1, 2, 3)
    qc.cx(0, 3)
    qc.cx(0, 2)
    qc.cx(0, 1)
    return qc
