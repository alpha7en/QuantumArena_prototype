from qiskit import QuantumCircuit


def solve(b0, b1):
    qc = QuantumCircuit(1)
    if b1:
        qc.x(0)
    if b0:
        qc.z(0)
    return qc
