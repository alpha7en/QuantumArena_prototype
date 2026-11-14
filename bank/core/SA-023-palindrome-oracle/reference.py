from qiskit import QuantumCircuit


def solve():
    qc = QuantumCircuit(5)
    qc.cx(0, 3)
    qc.cx(1, 2)
    qc.x(3)
    qc.x(2)
    qc.ccx(3, 2, 4)
    qc.x(2)
    qc.x(3)
    qc.cx(1, 2)
    qc.cx(0, 3)
    return qc
