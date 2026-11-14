from qiskit import QuantumCircuit


def solve(oracle):
    qc = QuantumCircuit(2, 2)
    qc.h([0, 1])
    qc.append(oracle, [0, 1])
    qc.h([0, 1])
    qc.x([0, 1])
    qc.cz(0, 1)
    qc.x([0, 1])
    qc.h([0, 1])
    qc.measure([0, 1], [0, 1])
    return qc
