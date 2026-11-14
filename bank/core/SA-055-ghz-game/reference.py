from qiskit import QuantumCircuit


def solve(bit):
    qc = QuantumCircuit(1)
    if bit:
        qc.sdg(0)
    qc.h(0)
    return qc
