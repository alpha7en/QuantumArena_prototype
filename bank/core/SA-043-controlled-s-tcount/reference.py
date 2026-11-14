from qiskit import QuantumCircuit


def solve():
    qc = QuantumCircuit(2)
    qc.cx(0, 1)
    qc.tdg(1)
    qc.cx(0, 1)
    qc.t(0)
    qc.t(1)
    return qc
