from qiskit import QuantumCircuit


def solve(oracle):
    qc = QuantumCircuit(1, 1)
    qc.h(0)
    qc.append(oracle, [0])
    qc.append(oracle, [0])
    qc.h(0)
    qc.measure(0, 0)
    return qc
