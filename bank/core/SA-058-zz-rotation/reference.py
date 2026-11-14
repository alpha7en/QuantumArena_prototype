from qiskit import QuantumCircuit


def solve(theta):
    qc = QuantumCircuit(2)
    qc.cx(0, 1)
    qc.rz(2 * theta, 1)
    qc.cx(0, 1)
    return qc
